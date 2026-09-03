import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { api, ApiError } from "../lib/api";
type Proposal = {
  id: string;
  reason: string;
  createdBy: string;
  status: string;
  afterSnapshot: Record<string, unknown>;
};
type Task = {
  id: string;
  deviceId: string;
  deviceType: string;
  assigneeId: string;
  dueDate: string;
  status: string;
  checklist: Array<{ name: string; status: string }>;
};
export function WorkflowPage({ kind }: { kind: "proposals" | "tasks" }) {
  const { profile, demoMode, getToken } = useAuth();
  const [items, setItems] = useState<Array<Proposal | Task>>([]),
    [loading, setLoading] = useState(!demoMode),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false);
  const load = useCallback(async () => {
    if (demoMode) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("UNAUTHENTICATED");
      setItems(
        kind === "proposals"
          ? ((await api.proposals(token)).items as Proposal[])
          : ((await api.tasks(token)).items as Task[]),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, [demoMode, getToken, kind]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  const canCreate = Boolean(
    profile?.permissions.includes(kind === "tasks" ? "ASSIGN" : "CREATE"),
  );
  return (
    <>
      <div className="toolbar">
        <div>
          <p>
            {kind === "proposals" ? "QUY TRÌNH PHÊ DUYỆT" : "KIỂM TRA ĐỊNH KỲ"}
          </p>
          <h2>
            {kind === "proposals"
              ? "Đề xuất thiết bị"
              : "Công việc và checklist"}
          </h2>
        </div>
        {!demoMode && canCreate && (
          <button className="primary" onClick={() => setOpen(true)}>
            + {kind === "proposals" ? "Tạo đề xuất" : "Giao việc"}
          </button>
        )}
      </div>
      {demoMode && (
        <p className="empty-state">
          Cấu hình Firebase để sử dụng luồng nghiệp vụ thật.
        </p>
      )}
      {loading && <p>Đang tải…</p>}
      {error && <p className="data-error">{error}</p>}
      <div className="cards workflow-cards">
        {items.map((item) =>
          kind === "proposals" ? (
            <ProposalCard key={item.id} item={item as Proposal} reload={load} />
          ) : (
            <TaskCard key={item.id} item={item as Task} />
          ),
        )}
      </div>
      {open && (
        <WorkflowForm kind={kind} close={() => setOpen(false)} saved={load} />
      )}
    </>
  );
}
function ProposalCard({
  item,
  reload,
}: {
  item: Proposal;
  reload: () => Promise<void>;
}) {
  const { profile, getToken } = useAuth();
  async function approve() {
    try {
      const token = await getToken();
      if (token) await api.approveProposal(item.id, token);
      await reload();
    } catch (e) {
      alert(e instanceof ApiError ? e.code : "Không thể phê duyệt");
    }
  }
  return (
    <article className="item workflow-item">
      <div>
        <small>{item.status}</small>
        <h3>{item.reason}</h3>
        <p>Người tạo: {item.createdBy}</p>
      </div>
      {profile?.permissions.includes("APPROVE") && (
        <button className="minor" onClick={() => void approve()}>
          Phê duyệt
        </button>
      )}
    </article>
  );
}
function TaskCard({ item }: { item: Task }) {
  const done = item.checklist?.filter((x) => x.status === "DONE").length ?? 0;
  return (
    <article className="item workflow-item">
      <div>
        <small>
          {item.deviceType} • {item.status}
        </small>
        <h3>Thiết bị: {item.deviceId}</h3>
        <p>
          Hạn: {item.dueDate} • Checklist {done}/{item.checklist?.length ?? 0}
        </p>
      </div>
      <span className="badge on">{item.assigneeId}</span>
    </article>
  );
}
function WorkflowForm({
  kind,
  close,
  saved,
}: {
  kind: "proposals" | "tasks";
  close: () => void;
  saved: () => Promise<void>;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<Record<string, string>>(
      kind === "proposals"
        ? { code: "", name: "", reason: "" }
        : { deviceId: "", deviceType: "REC", assigneeId: "", dueDate: "" },
    ),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error();
      if (kind === "proposals")
        await api.createProposal(
          {
            reason: form.reason,
            afterSnapshot: { code: form.code, name: form.name },
            operationId: crypto.randomUUID(),
          },
          token,
        );
      else await api.createTask(form, token);
      close();
      await saved();
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }
  const fields =
    kind === "proposals"
      ? [
          ["code", "Mã thiết bị"],
          ["name", "Tên thiết bị"],
          ["reason", "Lý do đề xuất"],
        ]
      : [
          ["deviceId", "ID thiết bị"],
          ["deviceType", "Loại thiết bị (REC/LBS)"],
          ["assigneeId", "UID người được giao"],
          ["dueDate", "Hạn hoàn thành"],
        ];
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <h2>{kind === "proposals" ? "Tạo đề xuất" : "Giao công việc"}</h2>
        {error && <p className="data-error">{error}</p>}
        <form onSubmit={submit}>
          {fields.map(([name, label]) => (
            <label key={name}>
              {label}
              <input
                required
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              />
            </label>
          ))}
          <div className="modal-actions">
            <span />
            <span />
            <button type="button" className="minor" onClick={close}>
              Hủy
            </button>
            <button disabled={saving}>Lưu</button>
          </div>
        </form>
      </section>
    </div>
  );
}
