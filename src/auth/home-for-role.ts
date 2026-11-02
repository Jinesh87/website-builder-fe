import type { AuthUser } from "../api/auth.ts";

export function homeForRole(user: Pick<AuthUser, "role">): string {
  if (user.role === "SUPER_ADMIN") return "/admin";
  // Partnership program commented out for now:
  // if (user.role === "PARTNER") return "/partnership";
  return "/dashboard";
}
