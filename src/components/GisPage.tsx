import { MapPin, Navigation } from "lucide-react";
import { devices as samples } from "../data";
import { useEntityList } from "../hooks/useEntityList";
type GeoDevice = {
  id: string;
  code: string;
  name: string;
  latitude?: number | string;
  longitude?: number | string;
  googleMapsUrl?: string;
  pole?: string;
};
export function GisPage() {
  const { items, loading, error } = useEntityList<GeoDevice>(
    "devices",
    samples,
  );
  const located = items.filter(
    (item) => valid(item.latitude) && valid(item.longitude),
  );
  const first = located[0];
  const mapUrl = first
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(first.longitude) - 0.02}%2C${Number(first.latitude) - 0.02}%2C${Number(first.longitude) + 0.02}%2C${Number(first.latitude) + 0.02}&marker=${first.latitude}%2C${first.longitude}`
    : "";
  return (
    <>
      <div className="panel-title">
        <div>
          <p>BẢN ĐỒ THIẾT BỊ</p>
          <h2>GIS và dẫn đường</h2>
        </div>
      </div>
      {loading && <p>Đang tải vị trí…</p>}
      {error && <p className="data-error">{error}</p>}
      {first ? (
        <div className="gis-grid">
          <iframe title="Bản đồ thiết bị" src={mapUrl} />
          <div className="gis-list">
            {located.map((item) => (
              <article className="item" key={item.id}>
                <MapPin />
                <div>
                  <b>{item.name}</b>
                  <small>
                    {item.code} • {item.pole ?? "Chưa có vị trí trụ"}
                  </small>
                </div>
                <a
                  className="minor"
                  target="_blank"
                  rel="noreferrer"
                  href={
                    item.googleMapsUrl ||
                    `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
                  }
                >
                  <Navigation size={15} /> Chỉ đường
                </a>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="empty-state">Chưa có thiết bị với tọa độ hợp lệ.</p>
      )}
    </>
  );
}
function valid(value: unknown) {
  return (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}
