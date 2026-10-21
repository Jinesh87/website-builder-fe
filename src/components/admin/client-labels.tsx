import { Chip } from "@heroui/react";
import type { ClientOwner, ClientSource } from "../../api/admin-clients.ts";
import type { UserStatus } from "../../api/auth.ts";

export const SOURCE_LABELS: Record<ClientSource, string> = {
  SELF_SIGNUP: "Self-signup",
  ADMIN_CREATED: "Admin-created",
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Active",
  PENDING_VERIFICATION: "Pending verification",
  SUSPENDED: "Suspended",
};

const STATUS_COLORS = {
  ACTIVE: "success",
  PENDING_VERIFICATION: "warning",
  SUSPENDED: "danger",
} as const satisfies Record<UserStatus, "success" | "warning" | "danger">;

export function ClientStatusChip({ status }: { status: UserStatus | undefined }) {
  if (!status) return <Chip size="sm">No login</Chip>;
  return (
    <Chip size="sm" color={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </Chip>
  );
}

/** "Name · login" where login is the username for admin-issued accounts, otherwise the email. */
export function ownerLabel(owner: Pick<ClientOwner, "fullName" | "email" | "username">): string {
  return [owner.fullName, owner.username ? `@${owner.username}` : owner.email].filter(Boolean).join(" · ");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
