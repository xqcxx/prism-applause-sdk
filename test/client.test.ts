import { describe, expect, it } from 'vitest';
import { Cl, cvToHex } from '@stacks/transactions';
import { PublicKudosSDK } from '../src';

const SENDER = 'SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y';
const RECIPIENT = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

describe('PublicKudosSDK', () => {
  it('builds give kudos payload', () => {
    const sdk = new PublicKudosSDK({
      contractAddress: 'SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y',
      contractName: 'public-kudos',
      network: 'mainnet',
    });

    const payload = sdk.buildGiveKudos(RECIPIENT, 3);

    expect(payload.contract).toBe('SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y.public-kudos');
    expect(payload.functionName).toBe('give-kudos');
    expect(payload.functionArgs).toHaveLength(2);
    expect(payload.functionArgs[0]?.startsWith('0x')).toBe(true);
  });

  it('reads total kudos', async () => {
    const resultHex = cvToHex(Cl.ok(Cl.uint(12)));

    const sdk = new PublicKudosSDK({
      contractAddress: 'SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y',
      contractName: 'public-kudos',
      network: 'mainnet',
      fetchFn: async () =>
        new Response(
          JSON.stringify({
            okay: true,
            result: resultHex,
          }),
          { status: 200 },
        ),
    });

    const total = await sdk.getTotalKudos(RECIPIENT);
    expect(total).toBe(12n);
  });

  it('reads has-kudos bool', async () => {
    const resultHex = cvToHex(Cl.ok(Cl.bool(true)));

    const sdk = new PublicKudosSDK({
      contractAddress: 'SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y',
      contractName: 'public-kudos',
      network: 'mainnet',
      fetchFn: async () =>
        new Response(
          JSON.stringify({
            okay: true,
            result: resultHex,
          }),
          { status: 200 },
        ),
    });

    const has = await sdk.hasKudos(SENDER, RECIPIENT, 1);
    expect(has).toBe(true);
  });
});
