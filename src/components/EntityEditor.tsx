import { useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
type Collection = "substations" | "feeders" | "devices";
type Entity = Record<string, unknown> & { id?: string; version?: number };
const fields: Record<
  Collection,
  Array<{
    name: string;
    label: string;
    required?: boolean;
    type?: string;
    options?: string[];
  }>
> = {
  substations: [
    { name: "code", label: "Mã trạm", required: true },
    { name: "name", label: "Tên trạm", required: true },
    { name: "status", label: "Trạng thái", options: ["ACTIVE", "INACTIVE"] },
  ],
  feeders: [
    { name: "code", label: "Mã phát tuyến", required: true },
    { name: "name", label: "Tên phát tuyến", required: true },
    { name: "substationId", label: "ID Trạm 110kV", required: true },
    { name: "status", label: "Trạng thái", options: ["ACTIVE", "INACTIVE"] },
  ],
  devices: [
    { name: "code", label: "Mã thiết bị", required: true },
    { name: "name", label: "Tên thiết bị", required: true },
    {
      name: "deviceType",
      label: "Loại",
      options: ["REC", "LBS", "DS", "RMU", "OTHER"],
    },
    { name: "substationId", label: "ID Trạm 110kV", required: true },
    { name: "feederId", label: "ID Phát tuyến", required: true },
    { name: "unit", label: "Đơn vị", required: true },
    { name: "status", label: "Trạng thái điện", options: ["CLOSED", "OPEN"] },
    {
      name: "workingStatus",
      label: "Trạng thái làm việc",
      options: ["ENABLED", "DISABLED"],
    },
    { name: "pole", label: "Vị trí trụ" },
    { name: "settingCurrent", label: "Dòng chỉnh định" },
    { name: "googleMapsUrl", label: "Link Google Maps", type: "url" },
    { name: "latitude", label: "Vĩ độ", type: "number" },
    { name: "longitude", label: "Kinh độ", type: "number" },
  ],
};
export function EntityEditor({
  collection,
  initial,
  onSaved,
}: {
  collection: Collection;
  initial?: Entity;
  onSaved: () => void;
}) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        fields[collection].map((f) => [
          f.name,
          String(initial?.[f.name] ?? f.options?.[0] ?? ""),
        ]),
      ),
    [collection, initial],
  );
  const [form, setForm] = useState(defaults);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("UNAUTHENTICATED");
      if (initial?.id)
        await api.update(
          collection,
          initial.id,
          form,
          Number(initial.version),
          token,
        );
      else await api.create(collection, form, token);
      setOpen(false);
      onSaved();
    } catch (e) {
      setError(
        e instanceof ApiError ? translate(e.code) : "Không thể lưu dữ liệu",
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove() {
    if (
      !initial?.id ||
      !window.confirm("Xóa mục này? Dữ liệu được xóa mềm và vẫn còn nhật ký.")
    )
      return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error();
      await api.remove(collection, initial.id, Number(initial.version), token);
      setOpen(false);
      onSaved();
    } catch (e) {
      setError(
        e instanceof ApiError ? translate(e.code) : "Không thể xóa dữ liệu",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      {initial ? (
        <button className="minor" onClick={() => setOpen(true)}>
          Sửa
        </button>
      ) : (
        <button className="primary" onClick={() => setOpen(true)}>
          + Thêm mới
        </button>
      )}
      {open && (
        <div className="modal-backdrop">
          <section className="modal" role="dialog" aria-modal="true">
            <h2>{initial ? "Cập nhật" : "Thêm mới"}</h2>
            {error && <p className="data-error">{error}</p>}
            <form onSubmit={submit}>
              {fields[collection].map((field) => (
                <label key={field.name}>
                  {field.label}
                  {field.options ? (
                    <select
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                    >
                      {field.options.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      required={field.required}
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
              <div className="modal-actions">
                {initial && (
                  <button
                    type="button"
                    className="danger"
                    disabled={saving}
                    onClick={() => void remove()}
                  >
                    Xóa
                  </button>
                )}
                <span />
                <button
                  type="button"
                  className="minor"
                  onClick={() => setOpen(false)}
                >
                  Hủy
                </button>
                <button disabled={saving}>
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
function translate(code: string) {
  if (code === "VERSION_CONFLICT")
    return "Dữ liệu đã được thay đổi. Hãy tải lại.";
  if (code === "DUPLICATE_DEVICE_CODE") return "Mã thiết bị đã tồn tại.";
  if (code === "FORBIDDEN") return "Bạn không có quyền thực hiện.";
  return code;
}
