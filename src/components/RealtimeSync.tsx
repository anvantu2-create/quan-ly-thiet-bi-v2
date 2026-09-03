import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../lib/api";
export function RealtimeSync() {
  const { demoMode, getToken, user } = useAuth();
  useEffect(() => {
    if (demoMode || !user) return;
    const controller = new AbortController();
    let retry: ReturnType<typeof setTimeout> | undefined;
    async function connect() {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await fetch(`${API_BASE_URL}/realtime/events`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (response.status === 401) return;
        if (!response.ok || !response.body) throw new Error("SSE_FAILED");
        const reader = response.body.getReader(),
          decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";
          for (const block of blocks) {
            const line = block.split("\n").find((x) => x.startsWith("data: "));
            if (line) {
              const event = JSON.parse(line.slice(6)) as { collection: string };
              window.dispatchEvent(
                new CustomEvent("entity-changed", { detail: event }),
              );
            }
          }
        }
        if (!controller.signal.aborted)
          retry = setTimeout(() => void connect(), 5000);
      } catch {
        if (!controller.signal.aborted)
          retry = setTimeout(() => void connect(), 5000);
      }
    }
    void connect();
    return () => {
      controller.abort();
      if (retry) clearTimeout(retry);
    };
  }, [demoMode, getToken, user]);
  return null;
}
