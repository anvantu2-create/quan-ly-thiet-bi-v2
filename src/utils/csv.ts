export function downloadCsv(
  filename: string,
  rows: Array<Record<string, unknown>>,
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;
  const content =
    "\uFEFF" +
    [
      headers.map(escape).join(","),
      ...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
    ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
