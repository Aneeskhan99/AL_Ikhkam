import "server-only";
import { q } from "./db";

export async function audit(userId: number | null, action: string, entity: string, entityId?: string | number | null, summary?: string) {
  await q(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, summary) VALUES ($1, $2, $3, $4, $5)`,
    [userId, action, entity, entityId == null ? null : String(entityId), summary?.slice(0, 500) ?? null],
  ).catch((err) => console.error("[audit]", err.message));
}
