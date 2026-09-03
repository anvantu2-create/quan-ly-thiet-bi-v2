import { useMemo, useState } from "react";
import {
  Activity,
  Building2,
  Cable,
  CircuitBoard,
  LayoutDashboard,
  Menu,
  Network,
  Search,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { devices, feeders, stations } from "./data";
import { useAuth } from "./auth/AuthContext";
import { EntityEditor } from "./components/EntityEditor";
import { useEntityList } from "./hooks/useEntityList";
import type { Page } from "./types";
const nav: [Page, string, typeof Activity][] = [
  ["dashboard", "Tổng quan", LayoutDashboard],
  ["substations", "Trạm 110kV", Building2],
  ["feeders", "Phát tuyến 22kV", Cable],
  ["devices", "Thiết bị", CircuitBoard],
  ["loops", "Khép vòng", Network],
];
export default function App() {
  const { profile, demoMode, logout } = useAuth();
  const [page, setPage] = useState<Page>("dashboard"),
    [mobile, setMobile] = useState(false),
    [query, setQuery] = useState("");
  const go = (p: Page) => {
    setPage(p);
    setMobile(false);
    setQuery("");
  };
  return (
    <div className="app">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="bolt">
            <Zap size={22} />
          </div>
          <div>
            <b>LƯỚI ĐIỆN 22kV</b>
            <small>Quản lý thiết bị V2</small>
          </div>
          <button className="close" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => go(id)}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
        <div className="secure">
          <ShieldCheck />
          <div>
            <b>Hệ thống an toàn</b>
            <small>Phiên bản 0.5.0</small>
          </div>
        </div>
      </aside>
      {mobile && (
        <button className="backdrop" onClick={() => setMobile(false)} />
      )}
      <main>
        <header>
          <button className="menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div>
            <p>HỆ THỐNG QUẢN LÝ</p>
            <h1>{nav.find((n) => n[0] === page)?.[1]}</h1>
          </div>
          <div className="user">
            <span>{profile?.email.slice(0, 2).toUpperCase() ?? "AV"}</span>
            <div>
              <b>{profile?.email ?? "Quản trị viên"}</b>
              <small>{profile?.role ?? "ADMIN"}</small>
            </div>
            {!demoMode && (
              <button className="logout" onClick={() => void logout()}>
                Đăng xuất
              </button>
            )}
          </div>
        </header>
        <section className="content">
          {page === "dashboard" ? (
            <Dashboard go={go} />
          ) : page === "devices" ? (
            <Devices query={query} setQuery={setQuery} />
          ) : page === "loops" ? (
            <Loops />
          ) : (
            <Directory page={page} query={query} setQuery={setQuery} />
          )}
        </section>
      </main>
    </div>
  );
}
function Dashboard({ go }: { go: (p: Page) => void }) {
  return (
    <>
      <div className="welcome">
        <div>
          <p>TỔNG QUAN VẬN HÀNH</p>
          <h2>Chào buổi sáng, Quản trị viên</h2>
          <span>Theo dõi nhanh tình trạng lưới điện và thiết bị hôm nay.</span>
        </div>
        <div className="pulse">
          <Activity /> Hệ thống ổn định
        </div>
      </div>
      <div className="stats">
        <Stat
          icon={Building2}
          value={stations.length}
          label="Trạm 110kV"
          color="blue"
        />
        <Stat
          icon={Cable}
          value={feeders.length}
          label="Phát tuyến"
          color="purple"
        />
        <Stat
          icon={CircuitBoard}
          value={devices.length}
          label="Thiết bị"
          color="green"
        />
        <Stat icon={Network} value={1} label="Mạch vòng" color="orange" />
      </div>
      <div className="grid2">
        <article className="panel">
          <Title label="TRẠNG THÁI THIẾT BỊ" title="Phân bố vận hành" />
          <div className="status-list">
            <div>
              <i className="dot green" />
              Đang đóng{" "}
              <b>{devices.filter((d) => d.status === "Đóng").length}</b>
            </div>
            <div>
              <i className="dot red" />
              Điểm mở (NO){" "}
              <b>{devices.filter((d) => d.status === "Mở").length}</b>
            </div>
            <div>
              <i className="dot gray" />
              Tạm ngưng <b>{devices.filter((d) => !d.enabled).length}</b>
            </div>
          </div>
        </article>
        <article className="panel">
          <Title label="TRUY CẬP NHANH" title="Nghiệp vụ thường dùng" />
          <div className="quick">
            <button onClick={() => go("devices")}>
              <CircuitBoard />
              Danh sách thiết bị
            </button>
            <button onClick={() => go("loops")}>
              <Network />
              Sơ đồ khép vòng
            </button>
          </div>
        </article>
      </div>
    </>
  );
}
function Stat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Activity;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <article className="stat">
      <div className={"stat-icon " + color}>
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
function Title({ label, title }: { label: string; title: string }) {
  return (
    <div className="panel-title">
      <div>
        <p>{label}</p>
        <h3>{title}</h3>
      </div>
    </div>
  );
}
function SearchBox({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (s: string) => void;
}) {
  return (
    <div className="search">
      <Search size={18} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm theo tên hoặc mã..."
      />
    </div>
  );
}
function Directory({
  page,
  query,
  setQuery,
}: {
  page: Page;
  query: string;
  setQuery: (s: string) => void;
}) {
  const { profile, demoMode } = useAuth();
  const canCreate =
    !demoMode && Boolean(profile?.permissions.includes("CREATE"));
  const canUpdate =
    !demoMode && Boolean(profile?.permissions.includes("UPDATE"));
  const fallback =
    page === "substations"
      ? stations.map((x) => ({ ...x, status: "Đang vận hành" }))
      : feeders.map((x) => ({ ...x, code: x.id }));
  const { items, loading, error, reload } = useEntityList<{
    id: string;
    version?: number;
    code?: string;
    name: string;
    station?: string;
    status?: string;
    substationId?: string;
  }>(page === "substations" ? "substations" : "feeders", fallback);
  const rows = items.map((x) => ({
    code: x.code ?? x.id,
    name: x.name,
    raw: x,
    extra:
      page === "substations"
        ? (x.status ?? "Đang vận hành")
        : "Trạm " + (x.station ?? "—"),
  }));
  return (
    <>
      {loading && <p>Đang tải dữ liệu…</p>}
      {error && <p className="data-error">Không tải được dữ liệu: {error}</p>}
      <div className="toolbar">
        <SearchBox query={query} setQuery={setQuery} />
        {canCreate && (
          <EntityEditor
            collection={page === "substations" ? "substations" : "feeders"}
            onSaved={reload}
          />
        )}
      </div>
      <div className="cards">
        {rows
          .filter((r) =>
            (r.code + r.name).toLowerCase().includes(query.toLowerCase()),
          )
          .map((r) => (
            <article className="item" key={r.code}>
              <div className="item-icon">
                <Zap />
              </div>
              <div>
                <small>{r.code}</small>
                <h3>{r.name}</h3>
                <p>{r.extra}</p>
              </div>
              <span className="badge on">Hoạt động</span>
              {canUpdate && (
                <EntityEditor
                  collection={
                    page === "substations" ? "substations" : "feeders"
                  }
                  initial={r.raw}
                  onSaved={reload}
                />
              )}
            </article>
          ))}
      </div>
    </>
  );
}
function Devices({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (s: string) => void;
}) {
  const { profile, demoMode } = useAuth();
  const canCreate =
    !demoMode && Boolean(profile?.permissions.includes("CREATE"));
  const canUpdate =
    !demoMode && Boolean(profile?.permissions.includes("UPDATE"));
  const { items, loading, error, reload } = useEntityList("devices", devices);
  const rows = useMemo(
    () =>
      items.filter((d) =>
        (d.code + d.name + d.feeder)
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  );
  return (
    <>
      {loading && <p>Đang tải dữ liệu…</p>}
      {error && <p className="data-error">Không tải được dữ liệu: {error}</p>}
      <div className="toolbar">
        <SearchBox query={query} setQuery={setQuery} />
        {canCreate && <EntityEditor collection="devices" onSaved={reload} />}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Thiết bị</th>
              <th>Loại</th>
              <th>Phát tuyến</th>
              <th>Vị trí</th>
              <th>Chỉnh định</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td>
                  <b>{d.name}</b>
                  <small>{d.code}</small>
                </td>
                <td>
                  <span className="type">{d.type}</span>
                </td>
                <td>
                  {d.feeder}
                  <small>Trạm {d.station}</small>
                </td>
                <td>{d.pole}</td>
                <td>{d.setting}</td>
                <td>
                  <span
                    className={
                      "badge " +
                      (d.status === "Mở"
                        ? "off"
                        : d.enabled
                          ? "on"
                          : "disabled")
                    }
                  >
                    {d.status === "Mở"
                      ? "Mở (NO)"
                      : d.enabled
                        ? "Đóng"
                        : "Tạm ngưng"}
                  </span>
                </td>
                <td>
                  {canUpdate && (
                    <EntityEditor
                      collection="devices"
                      initial={d as unknown as Record<string, unknown>}
                      onSaved={reload}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Loops() {
  const nodes = [
    ["station", "Trạm 110kV Phú Chánh"],
    ["feeder", "471 Phú Chánh"],
    ["device", "REC Phú Chánh 3"],
    ["open", "LBS liên lạc (NO)"],
    ["feeder", "475 Bến Đình"],
    ["station", "Trạm 110kV Bến Đình"],
  ];
  return (
    <article className="panel topology">
      <Title label="SƠ ĐỒ ĐỘNG" title="Mạch vòng Phú Chánh – Bến Đình" />
      <div className="flow">
        {nodes.map(([kind, label], i) => (
          <div className="flow-part" key={label}>
            <div className={"node " + kind}>
              <Zap size={17} />
              {label}
            </div>
            {i < nodes.length - 1 && <i className="line" />}
          </div>
        ))}
      </div>
      <p className="hint">
        Màu đỏ biểu thị thiết bị đang mở (điểm NO). Sơ đồ tuân thủ đúng thứ tự
        nghiệp vụ hai phía.
      </p>
    </article>
  );
}
