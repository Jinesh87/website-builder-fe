import type { AuthUser } from "../api/auth.ts";

export function homeForRole(user: Pick<AuthUser, "role">): string {
  if (user.role === "SUPER_ADMIN") return "/admin";
  if (user.role === "PARTNER") return "/partner/dashboard";
  return "/dashboard";
}
