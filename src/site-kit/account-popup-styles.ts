/**
 * Post-payment "Order confirmed" popup: roomier, and its buttons (the Track order link is an <a>) stay inside the
 * dialog instead of overflowing into a horizontal scrollbar. Loaded after ACCOUNT_CSS so these win.
 * Interpolated into SITE_CSS, so it must not contain backticks or template placeholders.
 */
export const ACCOUNT_POPUP_CSS = `
.wb-acct-success-dialog { width: min(480px, 100%); padding: 36px 32px 28px; overflow-x: hidden; }
.wb-acct-success-title { font-size: 1.75rem; }
.wb-acct-success-text { margin-top: 12px; line-height: 1.55; }
.wb-acct-success-meta { margin-top: 22px; padding: 16px 18px; }
.wb-acct-success-actions { margin-top: 24px; gap: 10px; }
.wb-acct-success-actions .wb-acct-button {
  box-sizing: border-box; width: 100%; min-height: 48px; margin: 0;
  display: inline-flex; align-items: center; justify-content: center;
}
@media (max-width: 480px) {
  .wb-acct-success-dialog { padding: 28px 20px 22px; }
}
`;
