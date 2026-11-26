/** A problem in an uploaded sheet; `line` is the spreadsheet row number, null for the whole file. */
export type SheetIssue = { line: number | null; message: string };

/** Problems found in an uploaded CSV or Excel sheet, listed by row. */
export default function ImportIssueList({ issues, title }: { issues: SheetIssue[]; title: string }) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
      <p className="text-sm font-medium text-danger">{title}</p>
      <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto text-sm text-ink-body">
        {issues.map((issue, index) => (
          <li key={index}>
            {issue.line !== null && <span className="font-medium text-ink">Row {issue.line}: </span>}
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
