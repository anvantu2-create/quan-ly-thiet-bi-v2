export type Page =
  | "dashboard"
  | "substations"
  | "feeders"
  | "devices"
  | "loops"
  | "users"
  | "proposals"
  | "tasks"
  | "gis"
  | "reports";
export interface Device {
  id: string;
  code: string;
  name: string;
  type: "REC" | "LBS" | "DS" | "RMU";
  station: string;
  feeder: string;
  status: "Đóng" | "Mở";
  enabled: boolean;
  pole: string;
  setting: string;
}
