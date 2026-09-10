import {
  V060_SESSION_SCHEMA_VERSION,
  V060_STORAGE_KEY,
  chooseV060StartupSession,
  normalizeV060Session,
  validateV060Envelope,
} from './life-cycle-v060.js';

export const V070_DELIVERY_VERSION = '0.7.0';
export const V070_SESSION_SCHEMA_VERSION = V060_SESSION_SCHEMA_VERSION;
export const V070_STORAGE_KEY = 'dnd-terminal.v0.7.0.workbench.session.current';

const copy = value => globalThis.structuredClone ? globalThis.structuredClone(value) : JSON.parse(JSON.stringify(value));

export function normalizeV070Session(session, { legacy = false } = {}) {
  // v0.7.0 reorganizes presentation only. The domain/session contract remains
  // the v0.6.0 contract, so this normalizer never invents business facts.
  return normalizeV060Session(session, { legacy });
}

export function createV070Envelope(session, { exportedAt } = {}) {
  const normalized = normalizeV070Session(session);
  return {
    schemaVersion: V070_SESSION_SCHEMA_VERSION,
    appVersion: V070_SESSION_SCHEMA_VERSION,
    deliveryVersion: V070_DELIVERY_VERSION,
    exportedAt,
    session: normalized,
    checksum: `events:${Array.isArray(normalized.events) ? normalized.events.length : 0}`,
  };
}

export function validateV070Envelope(data, id, timestamp) {
  const prior = validateV060Envelope(data, id, timestamp);
  return {
    ...copy(prior),
    schemaVersion: V070_SESSION_SCHEMA_VERSION,
    appVersion: V070_SESSION_SCHEMA_VERSION,
    deliveryVersion: data?.deliveryVersion || V070_DELIVERY_VERSION,
    session: normalizeV070Session(prior.session, { legacy: data?.deliveryVersion !== V070_DELIVERY_VERSION }),
  };
}

export function chooseV070StartupSession(storage, id, timestamp) {
  const currentRaw = storage.getItem(V070_STORAGE_KEY);
  if (currentRaw !== null) {
    try {
      return {
        kind: 'current',
        session: validateV070Envelope(JSON.parse(currentRaw), id, timestamp).session,
        shouldPersist: false,
      };
    } catch (error) {
      return { kind: 'blocked-corrupt-current', error, raw: currentRaw, session: null, shouldPersist: false };
    }
  }
  const prior = chooseV060StartupSession(storage, id, timestamp);
  if (!prior.session) return prior;
  return {
    ...prior,
    kind: 'migrated-legacy-copy',
    sourceKey: prior.sourceKey || V060_STORAGE_KEY,
    session: normalizeV070Session(prior.session, { legacy: true }),
    shouldPersist: true,
  };
}
