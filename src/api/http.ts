import { env } from "../config/env.ts";

export type FieldIssue = {
  message: string;
  path: (string | number)[];
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error?.message ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = body.error?.code ?? "UNKNOWN_ERROR";
    this.details = body.error?.details;
  }

  /** Maps Joi validation details to `{ fieldName: message }` (first message per field). */
  fieldErrors(): Record<string, string> {
    if (this.code !== "VALIDATION_ERROR" || !Array.isArray(this.details)) return {};
    const errors: Record<string, string> = {};
    for (const issue of this.details as FieldIssue[]) {
      const field = issue.path?.[0];
      if (typeof field === "string" && !errors[field]) errors[field] = issue.message;
    }
    return errors;
  }
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return "Can't reach the server. Check your connection and try again.";
  return fallback;
}

/** Auth endpoints that must never trigger a refresh-and-retry loop. */
const SKIP_REFRESH_PATHS = new Set([
  "/auth/login",
  "/auth/signup",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

let refreshInFlight: Promise<void> | null = null;
let lastRefreshCompletedAt = 0;
let sessionExpiredHandler: (() => void) | null = null;

/** The auth provider registers this so an unrecoverable 401 clears the signed-in user. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

/**
 * Refresh tokens are single-use, so concurrent 401s share one refresh call.
 * Presenting an already-rotated token would trip server-side reuse detection.
 */
function refreshSession(): Promise<void> {
  refreshInFlight ??= send("/auth/refresh", { method: "POST" })
    .then((response) => parse<unknown>(response))
    .then(() => {
      lastRefreshCompletedAt = Date.now();
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function sendWithRefresh(path: string, options: RequestOptions): Promise<Response> {
  const { body, ...rest } = options;
  const init: RequestInit = {
    ...rest,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  };

  const startedAt = Date.now();
  const response = await send(path, init);
  if (response.status !== 401 || SKIP_REFRESH_PATHS.has(path.split("?")[0])) {
    return response;
  }

  // A refresh that finished after this request was sent already rotated the cookies.
  if (lastRefreshCompletedAt < startedAt) {
    try {
      await refreshSession();
    } catch (error) {
      sessionExpiredHandler?.();
      throw error;
    }
  }

  return send(path, init);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return parse<T>(await sendWithRefresh(path, options));
}

/** For file downloads (e.g. CSV exports); errors still come back as ApiError. */
export async function requestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  const response = await sendWithRefresh(path, options);
  if (!response.ok) await parse<unknown>(response);
  return response.blob();
}

/** Streams a newline-delimited JSON response, calling `onEvent` for each line as it arrives. */
export async function requestNdjson<E>(
  path: string,
  options: RequestOptions,
  onEvent: (event: E) => void,
): Promise<void> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/x-ndjson");
  const response = await sendWithRefresh(path, { ...options, headers });
  if (!response.ok || !response.body) {
    await parse<unknown>(response);
    throw new ApiError(response.status, {});
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += value;
    const lines = buffer.split("\n");
    buffer = done ? "" : (lines.pop() ?? "");
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as E);
    }
    if (done) return;
  }
}
