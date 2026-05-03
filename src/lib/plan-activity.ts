import { serverTimestamp } from "firebase/firestore";

/**
 * Returns fields to merge into a budget document on any meaningful user action.
 * Always stamps last_activity_at. Sets is_customized + customized_at once, only
 * if the plan hasn't been marked customized yet.
 */
export function planActivityFields(isCustomized: boolean | undefined): Record<string, any> {
  const fields: Record<string, any> = { last_activity_at: serverTimestamp() };
  if (!isCustomized) {
    fields.is_customized = true;
    fields.customized_at = serverTimestamp();
  }
  return fields;
}
