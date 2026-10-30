
import type { ReactNode } from "react";
import { Modal } from "@heroui/react";
import { X } from "lucide-react";

export type HeaderDetails = {
  icon?: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
};

export type ModalIconTone =
  | "brand"
  | "danger"
  | "warning"
  | "success"
  | "default"
  | "neutral";

export type ModalSize = "xs" | "sm" | "md" | "lg" | "full" | "cover";

export type ModalActionProps = {
  label: ReactNode;
  onPress?: () => void | Promise<unknown> | unknown;
  isPending?: boolean;
  isDisabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  tone?: "primary" | "danger" | "default";
  type?: "button" | "submit";
  className?: string;
};

export type CommonModalProps = {
  modalBody?: ReactNode;
  children?: ReactNode;
  headerDetails?: HeaderDetails;
  modalHeader?: ReactNode;
  modalFooter?: ReactNode;
  primaryAction?: ModalActionProps;
  secondaryAction?: ModalActionProps;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  showHeader?: boolean;
  disableFooter?: boolean;
  enableBackdropClose?: boolean;
  isDismissable?: boolean;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  iconTone?: ModalIconTone;
  size?: ModalSize;
  placement?: "auto" | "top" | "center" | "bottom";
  baseClass?: string;
  dialogClassName?: string;
  wrapperClass?: string;
  backdropClassName?: string;
  contentClass?: string;
  headerWrapperClass?: string;
  headerClassName?: string;
  headerIconClass?: string;
  bodyWrapperClass?: string;
  bodyWrapperBaseClass?: string;
  bodyClassName?: string;
  footerWrapperClass?: string;
  footerClassName?: string;
  closeButtonClass?: string;
  closeTriggerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  showCloseButton?: boolean;
  showCloseTrigger?: boolean;
  ariaLabel?: string;
};

const SIZE_STYLES: Record<ModalSize, string> = {
  xs: "max-w-[380px]",
  sm: "max-w-[480px]",
  md: "max-w-[560px]",
  lg: "max-w-[640px]",
  full: "max-w-[95vw] sm:max-w-4xl",
  cover: "max-w-full h-full",
};

const ICON_TONE_STYLES: Record<ModalIconTone, string> = {
  danger: "bg-red-50 text-red-600 ring-1 ring-red-100",
  warning: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  success: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  brand: "bg-brand-soft text-brand ring-1 ring-brand/20",
  default: "bg-surface text-ink ring-1 ring-line",
  neutral: "bg-canvas text-ink-muted ring-1 ring-line",
};

export function CommonModal({
  modalBody,
  children,
  headerDetails,
  modalHeader,
  modalFooter,
  primaryAction,
  secondaryAction,
  isOpen,
  onOpenChange,
  onClose,
  showHeader = true,
  disableFooter = false,
  enableBackdropClose = true,
  isDismissable,
  title,
  subtitle,
  icon,
  iconTone = "default",
  size = "sm",
  placement = "center",
  baseClass = "",
  dialogClassName = "",
  wrapperClass = "",
  backdropClassName = "",
  contentClass = "",
  headerWrapperClass = "",
  headerClassName = "",
  headerIconClass = "",
  bodyWrapperClass = "",
  bodyWrapperBaseClass = "",
  bodyClassName = "",
  footerWrapperClass = "",
  footerClassName = "",
  closeButtonClass = "",
  closeTriggerClassName = "",
  titleClassName = "",
  subtitleClassName = "",
  showCloseButton = true,
  showCloseTrigger,
  ariaLabel,
}: CommonModalProps) {
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    } else {
      onOpenChange?.(true);
    }
  };

  const shouldDismiss =
    (isDismissable ?? enableBackdropClose) && !primaryAction?.isPending;
  const isCloseShown = showCloseTrigger ?? showCloseButton;

  const resolvedTitle = headerDetails?.title ?? title;
  const resolvedDescription = headerDetails?.description ?? subtitle;
  const resolvedIcon = headerDetails?.icon ?? icon;
  const bodyContent = modalBody ?? children;

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable={shouldDismiss}
      className={`fixed inset-0 z-50 flex min-h-full items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-[3px] transition-all duration-200 ${wrapperClass} ${backdropClassName}`}
    >
      <Modal.Container
        size={size}
        placement={placement}
        className="w-full flex items-center justify-center"
      >
        <Modal.Dialog
          aria-label={
            ariaLabel ??
            (typeof resolvedTitle === "string" ? resolvedTitle : "Dialog")
          }
          className={`relative w-full ${SIZE_STYLES[size]} max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden rounded-[24px] border border-line/80 bg-surface shadow-2xl transition-all duration-200 flex flex-col text-left ${baseClass} ${dialogClassName} ${contentClass}`}
        >
          {/* 1. SEPARATED HEADER */}
          {showHeader && (
            <div
              className={`relative w-full shrink-0 border-b border-line/60 bg-surface pb-2 flex items-center justify-between text-left ${headerWrapperClass} ${headerClassName}`}
            >
              {modalHeader ? (
                modalHeader
              ) : (
                <div className="flex items-center gap-3.5 min-w-0 pr-8 text-left">
                  {resolvedIcon && (
                    <div
                      className={`grid size-10 shrink-0 place-items-center rounded-xl p-2 transition-transform duration-200 ${ICON_TONE_STYLES[iconTone]} ${headerIconClass}`}
                    >
                      {resolvedIcon}
                    </div>
                  )}
                  <div className="flex flex-col text-left min-w-0">
                    {resolvedTitle && (
                      <Modal.Heading
                        className={`text-[17px] sm:text-lg font-bold tracking-tight text-ink leading-snug text-left ${titleClassName}`}
                      >
                        {resolvedTitle}
                      </Modal.Heading>
                    )}
                    {resolvedDescription && (
                      <p
                        className={`mt-0.5 text-xs text-ink-muted leading-normal text-left truncate ${subtitleClassName}`}
                      >
                        {resolvedDescription}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isCloseShown && (
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={primaryAction?.isPending}
                  className={`absolute right-4.5 top-4.5 grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 cursor-pointer ${closeButtonClass} ${closeTriggerClassName}`}
                  aria-label="Close dialog"
                >
                  <X className="size-4.5" />
                </button>
              )}
            </div>
          )}

          {/* 2. SEPARATED BODY
              Use flex-auto (basis: auto), not flex-1 (basis: 0%). With only max-height on the
              dialog, flex-1 collapses the body to ~0 so tall forms (e.g. product edit) look empty.
              -mx-6 counters HeroUI Dialog's p-6 so the scrollport can go edge-to-edge. */}
          {bodyContent && (
            <div
              className={`-mx-6 min-h-0 flex-auto overflow-y-auto overscroll-contain px-6 py-4 text-sm leading-relaxed text-ink-body text-left bg-surface ${bodyWrapperBaseClass} ${bodyWrapperClass} ${bodyClassName}`}
            >
              {bodyContent}
            </div>
          )}

          {/* 3. SEPARATED FOOTER (BUTTON TRAY) */}
          {!disableFooter &&
            (modalFooter || primaryAction || secondaryAction) && (
              <div
                className={`w-full shrink-0 border-t border-line/60 bg-surface pt-2 flex items-center justify-end gap-3 text-left ${footerWrapperClass} ${footerClassName}`}
              >
                {modalFooter ? (
                  modalFooter
                ) : (
                  <>
                    {secondaryAction && (
                      <button
                        type="button"
                        onClick={() =>
                          secondaryAction.onPress?.() ?? handleClose()
                        }
                        disabled={
                          secondaryAction.isDisabled || primaryAction?.isPending
                        }
                        className={`rounded-full border border-line bg-surface px-6 py-2 text-sm font-medium text-ink shadow-xs transition-all hover:bg-canvas hover:border-line-strong active:scale-[0.98] disabled:opacity-50 cursor-pointer ${secondaryAction.className ?? ""}`}
                      >
                        {secondaryAction.label}
                      </button>
                    )}
                    {primaryAction && (
                      <button
                        type={primaryAction.type ?? "button"}
                        onClick={() => primaryAction.onPress?.()}
                        disabled={
                          primaryAction.isDisabled || primaryAction.isPending
                        }
                        className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
                          primaryAction.tone === "danger"
                            ? "bg-ed-danger hover:bg-ed-danger/90"
                            : "bg-brand hover:bg-brand-hover"
                        } ${primaryAction.className ?? ""}`}
                      >
                        {primaryAction.isPending ? (
                          <span className="flex items-center gap-2">
                            <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            <span>{primaryAction.label}</span>
                          </span>
                        ) : (
                          primaryAction.label
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

// Interoperability alias
export const AppModal = CommonModal;
export type AppModalProps = CommonModalProps;

export type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<unknown> | unknown;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  tone?: "danger" | "brand" | "warning" | "default";
  icon?: ReactNode;
  isPending?: boolean;
  size?: ModalSize;
  baseClass?: string;
  bodyWrapperClass?: string;
  footerWrapperClass?: string;
  headerWrapperClass?: string;
};

/**
 * Specialized Confirmation Modal component built on top of CommonModal.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  icon,
  isPending = false,
  size = "sm",
  baseClass,
  bodyWrapperClass,
  footerWrapperClass,
  headerWrapperClass,
}: ConfirmModalProps) {
  const iconTone: ModalIconTone =
    tone === "danger"
      ? "danger"
      : tone === "warning"
        ? "warning"
        : tone === "brand"
          ? "brand"
          : "default";

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconTone={iconTone}
      size={size}
      baseClass={baseClass}
      bodyWrapperClass={bodyWrapperClass}
      footerWrapperClass={footerWrapperClass}
      headerWrapperClass={headerWrapperClass}
      primaryAction={{
        label: confirmLabel,
        onPress: onConfirm,
        isPending,
        tone:
          tone === "danger"
            ? "danger"
            : tone === "brand"
              ? "primary"
              : "default",
      }}
      secondaryAction={{
        label: cancelLabel,
        onPress: onClose,
        isDisabled: isPending,
      }}
    >
      <div className="text-sm leading-relaxed text-ink-body text-left">
        {children}
      </div>
    </CommonModal>
  );
}

export default CommonModal;
