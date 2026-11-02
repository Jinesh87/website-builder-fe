/**
 * Translates technical email service errors into short, human-friendly messages
 * that any non-technical user can easily understand.
 */
export function formatEmailDeliveryError(rawError?: string | null): string {
  if (!rawError || !rawError.trim()) {
    return "The notification email could not be delivered.";
  }

  const lower = rawError.toLowerCase();

  if (
    lower.includes("example.com") ||
    lower.includes("invalid `to` field") ||
    lower.includes("invalid 'to' field") ||
    lower.includes("testing email address")
  ) {
    return "Invalid recipient email address: Test or dummy domains (like @example.com) cannot receive emails. Please use a valid email address.";
  }

  if (lower.includes("not configured")) {
    return "Email service is not set up yet. Please configure Resend in Admin Settings.";
  }

  if (lower.includes("disabled")) {
    return "Email sending is turned off in Admin Settings.";
  }

  if (lower.includes("domain") && (lower.includes("verify") || lower.includes("verified"))) {
    return "The sender email domain is not verified in Resend settings.";
  }

  if (lower.includes("api key") || lower.includes("unauthorized") || lower.includes("forbidden")) {
    return "Email service authentication failed. Please check your Resend API key.";
  }

  // Remove technical prefixes like "Email could not be sent: "
  return rawError.replace(/^Email could not be sent:\s*/i, "").trim();
}
