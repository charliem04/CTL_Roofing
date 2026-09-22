/**
 * ────────────────────────────────────────────────────────────────────
 *  WHICH ADAPTER, AND WHETHER THERE IS ONE.
 *
 *  Adding a CRM is a file next to this one and a line in ADAPTERS.
 *  Nothing else in the Worker learns its name.
 * ────────────────────────────────────────────────────────────────────
 */

import { generic } from "./generic.ts";
import { hubspot } from "./hubspot.ts";
import type { CrmAdapter, CrmEnv } from "./types.ts";

export type {
  CrmAdapter,
  CrmEnv,
  CrmOutcome,
  LeadKind,
  LeadRow,
} from "./types.ts";

const ADAPTERS: Record<string, CrmAdapter> = {
  [generic.id]: generic,
  [hubspot.id]: hubspot,
};

/**
 * The configured adapter, or null when CRM_ADAPTER names one that does
 * not exist.
 *
 * Null rather than a silent fallback to `generic`: a typo would
 * otherwise send every lead at whatever CRM_WEBHOOK_URL holds, which
 * for a half-configured deployment is nothing, and for a
 * half-reconfigured one is the CRM being migrated away from. Null
 * means rows are stored 'disabled' — captured, forwarded by the sweep
 * the moment the spelling is fixed, and loud in the log meanwhile.
 */
export function adapterFor(env: CrmEnv): CrmAdapter | null {
  const id = (env.CRM_ADAPTER ?? "").trim().toLowerCase() || generic.id;
  const adapter = ADAPTERS[id];
  if (!adapter) {
    console.error(
      `[relay] CRM_ADAPTER="${id}" is not one of: ${Object.keys(ADAPTERS).join(
        ", "
      )}. Nothing is being forwarded — rows are stored 'disabled' and the ` +
        "sweep will deliver the backlog once this is corrected."
    );
    return null;
  }
  return adapter;
}

/** Whether this deployment can forward anything at all right now. */
export function crmConfigured(env: CrmEnv): boolean {
  const adapter = adapterFor(env);
  return Boolean(adapter && adapter.configured(env));
}
