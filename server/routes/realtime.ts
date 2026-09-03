import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { eventBus } from "../realtime/eventBus.js";
export const realtimeRouter = Router();
realtimeRouter.get("/events", requireAuth, (req, res) => {
  res
    .status(200)
    .set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
  res.flushHeaders();
  res.write(": connected\n\n");
  const unsubscribe = eventBus.subscribe((event) =>
      res.write(`id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`),
    ),
    heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 25000);
  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});
