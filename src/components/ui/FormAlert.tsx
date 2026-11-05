import { Alert } from "@heroui/react";
import type { ReactNode } from "react";

type FormAlertProps = {
  status: "danger" | "success" | "warning";
  title?: string;
  children: ReactNode;
};

const STATUS_STYLES: Record<FormAlertProps["status"], { root: string; description: string }> = {
  danger: {
    root: "border border-ed-danger/30 bg-ed-danger-soft text-ed-danger shadow-none",
    description: "text-ed-danger",
  },
  success: {
    root: "border border-emerald-500/25 bg-emerald-50 text-emerald-800 shadow-none",
    description: "text-emerald-800",
  },
  warning: {
    root: "border border-amber-500/30 bg-amber-50 text-amber-900 shadow-none",
    description: "text-amber-900",
  },
};

export default function FormAlert({ status, title, children }: FormAlertProps) {
  const styles = STATUS_STYLES[status];
  return (
    <Alert status={status} role={status === "danger" ? "alert" : "status"} className={styles.root}>
      <Alert.Indicator />
      <Alert.Content>
        {title && <Alert.Title>{title}</Alert.Title>}
        <Alert.Description className={styles.description}>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
