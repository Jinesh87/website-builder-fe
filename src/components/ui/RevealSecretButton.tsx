import { Eye, EyeOff } from "lucide-react";

/** Eye button laid over a secret TextInput (wrap both in a `relative` div); pairs with `useSavedSecrets`. */
export default function RevealSecretButton({ shown, disabled, onToggle }: { shown: boolean; disabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="absolute right-3 top-8.5 cursor-pointer text-ink-muted transition-colors hover:text-ink disabled:cursor-wait disabled:opacity-50"
      title={shown ? "Hide secret" : "Show secret"}
      aria-label={shown ? "Hide secret" : "Show secret"}
    >
      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}
