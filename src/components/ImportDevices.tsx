import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api, ApiError } from "../lib/api";
import { parseDeviceCsv } from "../utils/csv";
export function ImportDevices({ onSaved }: { onSaved: () => void }) {
  const { getToken } = useAuth();
  const input = useRef<HTMLInputElement>(null),
    [busy, setBusy] = useState(false);
  async function importFile(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const rows = parseDeviceCsv(await file.text());
      if (rows.length > 200) throw new Error("Tối đa 200 dòng/lần");
      const token = await getToken();
      if (!token) throw new Error("UNAUTHENTICATED");
      const result = await api.importDevices(rows, token);
      alert(`Đã nhập ${result.created} thiết bị`);
      onSaved();
    } catch (e) {
      alert(
        e instanceof ApiError
          ? e.code
          : e instanceof Error
            ? e.message
            : "IMPORT_FAILED",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <>
      <input
        ref={input}
        hidden
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => void importFile(e.target.files?.[0])}
      />
      <button
        className="minor"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <Upload size={15} />
        {busy ? "Đang nhập…" : "Import CSV"}
      </button>
    </>
  );
}
