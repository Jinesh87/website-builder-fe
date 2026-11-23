import type { ThemeSettings } from "../../../site-kit/index.ts";
import { FormGroup, ImageField } from "./fields.tsx";

/** Site settings: the browser-tab icon. Empty uses the website logo. Goes live on publish. */
export function FaviconField({ theme, onChange }: { theme: ThemeSettings; onChange: (theme: ThemeSettings) => void }) {
  return (
    <FormGroup title="Favicon" description="The small icon in the browser tab and bookmarks. Changes show on the live site after you publish.">
      <ImageField
        label="Favicon"
        value={theme.favicon?.url ? theme.favicon : undefined}
        optional
        onChange={(favicon) => {
          const { favicon: _previous, ...rest } = theme;
          onChange(favicon?.url ? { ...rest, favicon: { url: favicon.url, alt: "" } } : rest);
        }}
        dimensionHint="Square PNG, 512 × 512 px (at least 48 × 48)"
        hint="Leave empty to use the website logo."
      />
    </FormGroup>
  );
}
