export const MISSED_VISIT_REASONS = [
  { code: 'CLIENT_NOT_HOME', label: 'Client not home' },
  { code: 'CLIENT_REFUSED', label: 'Client refused visit' },
  { code: 'CLIENT_HOSPITALIZED', label: 'Client hospitalized' },
  { code: 'CLIENT_UNAVAILABLE', label: 'Client unavailable' },
  { code: 'UNSAFE_CONDITIONS', label: 'Unsafe conditions' },
  { code: 'WEATHER', label: 'Severe weather' },
  { code: 'OTHER', label: 'Other (see notes)' },
] as const;

export type MissedVisitReasonCode = typeof MISSED_VISIT_REASONS[number]['code'];

export function getMissedVisitReasonLabel(code: string): string {
  const reason = MISSED_VISIT_REASONS.find(r => r.code === code);
  return reason?.label || code;
}
