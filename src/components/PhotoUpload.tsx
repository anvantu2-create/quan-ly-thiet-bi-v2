import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
export function PhotoUpload({
  deviceId,
  onSaved,
}: {
  deviceId: string;
  onSaved: () => void;
}) {
  const { getToken } = useAuth();
  const input = useRef<HTMLInputElement>(null),
    [busy, setBusy] = useState(false);
  async function change(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Ảnh tối đa 5 MB");
    setBusy(true);
    try {
      const token = await getToken();
      if (!token) throw new Error();
      await api.uploadPhoto(deviceId, file, token);
      onSaved();
    } catch {
      alert("Không thể tải ảnh");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <input
        ref={input}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={(e) => void change(e.target.files?.[0])}
      />
      <button
        className="minor"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <Camera size={14} />
        {busy ? "Đang tải" : "Ảnh"}
      </button>
    </>
  );
}
