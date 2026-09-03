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
export function parseDeviceCsv(text: string) {
  const lines = parseRows(text.replace(/^\uFEFF/, ""));
  if (lines.length < 2) throw new Error("FILE_EMPTY");
  const headers = lines[0].map((x) => x.trim().toLowerCase()),
    aliases: Record<string, string> = {
      "mã thiết bị": "code",
      "ma thiet bi": "code",
      "tên thiết bị": "name",
      "ten thiet bi": "name",
      "loại thiết bị": "deviceType",
      "loai thiet bi": "deviceType",
      "trạm 110kv": "substationId",
      "tram 110kv": "substationId",
      "phát tuyến": "feederId",
      "phat tuyen": "feederId",
      "đơn vị": "unit",
      "don vi": "unit",
      "trạng thái": "status",
      "trang thai": "status",
      "link google": "googleMapsUrl",
    };
  const keys = headers.map((x) => aliases[x] ?? x);
  return lines
    .slice(1)
    .filter((row) => row.some(Boolean))
    .map((row) => {
      const raw = Object.fromEntries(
        keys.map((key, index) => [key, row[index]?.trim() ?? ""]),
      );
      return {
        code: raw.code,
        name: raw.name,
        deviceType: String(raw.deviceType).toUpperCase(),
        substationId: raw.substationId,
        feederId: raw.feederId,
        unit: raw.unit,
        status: /mở|open/i.test(String(raw.status)) ? "OPEN" : "CLOSED",
        workingStatus: "ENABLED",
        googleMapsUrl: raw.googleMapsUrl ?? "",
      };
    });
}
function parseRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i],
      next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
