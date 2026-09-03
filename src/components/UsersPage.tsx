import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api, ApiError } from "../lib/api";
type Role = "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";
type Status = "ACTIVE" | "PENDING" | "DISABLED" | "LOCKED";
type UserRow = {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  status: Status;
  version?: number;
};
export function UsersPage() {
  const { getToken, user } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("UNAUTHENTICATED");
      const result = await api.users(token);
      setRows(result.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, [getToken]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  async function save(row: UserRow, role: Role, status: Status) {
    try {
      const token = await getToken();
      if (!token) throw new Error();
      await api.updateUser(
        row.uid,
        { role, status, expectedVersion: row.version ?? 1 },
        token,
      );
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "UPDATE_FAILED");
    }
  }
  return (
    <>
      <div className="panel-title">
        <div>
          <p>QUẢN TRỊ HỆ THỐNG</p>
          <h3>Tài khoản và phân quyền</h3>
        </div>
      </div>
      {loading && <p>Đang tải tài khoản…</p>}
      {error && <p className="data-error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <UserLine
                key={row.uid}
                row={row}
                self={row.uid === user?.uid}
                save={save}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function UserLine({
  row,
  self,
  save,
}: {
  row: UserRow;
  self: boolean;
  save: (row: UserRow, role: Role, status: Status) => Promise<void>;
}) {
  const [role, setRole] = useState(row.role),
    [status, setStatus] = useState(row.status);
  return (
    <tr>
      <td>
        <b>{row.displayName ?? row.email}</b>
        <small>{row.uid}</small>
      </td>
      <td>
        <select
          disabled={self}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {["ADMIN", "MANAGER", "STAFF", "VIEWER"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </td>
      <td>
        <select
          disabled={self}
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
        >
          {["ACTIVE", "PENDING", "DISABLED", "LOCKED"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </td>
      <td>
        {self ? (
          <span className="badge disabled">Tài khoản hiện tại</span>
        ) : (
          <button
            className="minor"
            onClick={() => void save(row, role, status)}
          >
            Lưu
          </button>
        )}
      </td>
    </tr>
  );
}
