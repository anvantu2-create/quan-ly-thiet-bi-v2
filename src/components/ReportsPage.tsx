import { useCallback, useEffect, useState } from "react";
import { Building2, Cable, CircuitBoard, Network } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
type Summary = {
  substations: number;
  feeders: number;
  devices: number;
  loops: number;
};
export function ReportsPage() {
  const { demoMode, getToken } = useAuth();
  const [data, setData] = useState<Summary | null>(null),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    if (demoMode) return;
    try {
      const token = await getToken();
      if (token) setData(await api.summary(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    }
  }, [demoMode, getToken]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  if (demoMode)
    return (
      <p className="empty-state">
        Cấu hình Firebase để xem báo cáo dữ liệu thật.
      </p>
    );
  return (
    <>
      <div className="panel-title">
        <div>
          <p>BÁO CÁO TOÀN HỆ THỐNG</p>
          <h2>Tổng hợp dữ liệu lưới điện</h2>
        </div>
      </div>
      {error && <p className="data-error">{error}</p>}
      <div className="stats">
        {data && (
          <>
            <Report
              icon={Building2}
              value={data.substations}
              label="Trạm 110kV"
            />
            <Report icon={Cable} value={data.feeders} label="Phát tuyến" />
            <Report icon={CircuitBoard} value={data.devices} label="Thiết bị" />
            <Report icon={Network} value={data.loops} label="Mạch vòng" />
          </>
        )}
      </div>
    </>
  );
}
function Report({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Building2;
  value: number;
  label: string;
}) {
  return (
    <article className="stat">
      <div className="stat-icon blue">
        <Icon />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
      <small>Đang quản lý</small>
    </article>
  );
}
