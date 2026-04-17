import { PublicKudosResponseError } from './errors';

export type CVJson = {
  type?: string;
  value?: unknown;
  success?: boolean;
};

export function unwrapReadOnlyResponse(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    throw new PublicKudosResponseError('Invalid read-only response payload');
  }

  const maybe = raw as CVJson;
  if (typeof maybe.success === 'boolean') {
    if (!maybe.success) {
      throw new PublicKudosResponseError('Read-only call returned err response');
    }
    return maybe.value;
  }

  return maybe.value;
}

export function asBigInt(value: unknown, fieldName: string): bigint {
  if (value && typeof value === 'object' && 'value' in value) {
    return asBigInt((value as { value: unknown }).value, fieldName);
  }
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string' && /^-?\d+$/.test(value)) return BigInt(value);
  throw new PublicKudosResponseError(`Expected uint for ${fieldName}`);
}

export function asBool(value: unknown, fieldName: string): boolean {
  if (value && typeof value === 'object' && 'value' in value) {
    return asBool((value as { value: unknown }).value, fieldName);
  }
  if (typeof value === 'boolean') return value;
  throw new PublicKudosResponseError(`Expected bool for ${fieldName}`);
}
