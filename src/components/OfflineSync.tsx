import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
import { readQueue, removeQueued } from "../offline/queue";
export function OfflineSync() {
  const { demoMode, getToken, user } = useAuth();
  const [online, setOnline] = useState(navigator.onLine),
    [pending, setPending] = useState(() => readQueue().length);
  const sync = useCallback(async () => {
    if (demoMode || !navigator.onLine) return;
    const token = await getToken();
    if (!token) return;
    for (const item of readQueue()) {
      try {
        if (item.action === "CREATE")
          await api.create(item.collection, item.data, token, item.id);
        else if (item.action === "UPDATE" && item.entityId)
          await api.update(
            item.collection,
            item.entityId,
            item.data,
            item.expectedVersion!,
            token,
            item.id,
          );
        else if (item.entityId)
          await api.remove(
            item.collection,
            item.entityId,
            item.expectedVersion!,
            token,
            item.id,
          );
        setPending(removeQueued(item.id));
      } catch {
        return;
      }
    }
  }, [demoMode, getToken]);
  useEffect(() => {
    const on = () => {
        setOnline(true);
        void sync();
      },
      off = () => setOnline(false),
      queued = () => setPending(readQueue().length);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    window.addEventListener("offline-queued", queued);
    queueMicrotask(() => void sync());
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("offline-queued", queued);
    };
  }, [sync, user]);
  if (demoMode) return null;
  return (
    <div className={"network-status " + (online ? "online" : "offline")}>
      {online
        ? pending
          ? `Đang chờ đồng bộ: ${pending}`
          : "Đang trực tuyến"
        : `Ngoại tuyến • ${pending} thay đổi đang chờ`}
    </div>
  );
}
