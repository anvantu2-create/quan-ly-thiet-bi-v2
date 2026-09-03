import { z } from "zod";
import type { CollectionName } from "../services/entityService.js";
const text = z.string().trim().min(1).max(200),
  optionalText = z.string().trim().max(500).optional();
const schemas = {
  substations: z
    .object({
      code: text,
      name: text,
      status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    })
    .strict(),
  feeders: z
    .object({
      code: text,
      name: text,
      substationId: text,
      status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    })
    .strict(),
  devices: z
    .object({
      code: text,
      name: text,
      deviceType: z.enum(["REC", "LBS", "DS", "RMU", "OTHER"]),
      substationId: text,
      feederId: text,
      unit: text,
      status: z.enum(["CLOSED", "OPEN"]),
      workingStatus: z.enum(["ENABLED", "DISABLED"]),
      pole: optionalText,
      settingCurrent: optionalText,
      googleMapsUrl: z.string().url().optional().or(z.literal("")),
    })
    .strict(),
  loops: z
    .object({
      code: text,
      name: text,
      nodeIds: z.array(text).min(3),
      normallyOpenDeviceId: text,
    })
    .strict(),
} satisfies Record<CollectionName, z.ZodType>;
export function validateEntity(
  collection: CollectionName,
  data: unknown,
  partial = false,
) {
  const schema = schemas[collection];
  const selected =
    partial && schema instanceof z.ZodObject ? schema.partial() : schema;
  return selected.safeParse(data);
}
