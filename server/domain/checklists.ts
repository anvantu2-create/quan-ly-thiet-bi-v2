export const REC_CHECKLIST = [
  "Ngoại quan",
  "Tiếp địa",
  "Tủ điều khiển",
  "Nguồn AC",
  "Ắc quy",
  "Bộ sạc",
  "SCADA",
  "Rơle 79",
  "Cơ cấu đóng cắt",
  "Dòng chỉnh định",
] as const;
export const LBS_CHECKLIST = [
  "Ngoại quan",
  "Tiếp địa",
  "Tủ điều khiển",
  "Nguồn AC",
  "Ắc quy",
  "Bộ sạc",
  "SCADA",
  "Cơ cấu đóng cắt",
  "Áp suất khí",
  "Chỉ thị vị trí",
  "Đầu cáp",
  "Khóa liên động",
] as const;
export function checklistFor(type: string) {
  if (type === "REC") return [...REC_CHECKLIST];
  if (type === "LBS") return [...LBS_CHECKLIST];
  return [];
}
