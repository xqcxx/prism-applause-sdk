import { request } from '@stacks/connect';
import { PublicKudosSDK } from '../src';

const sdk = new PublicKudosSDK({
  contractAddress: process.env.CONTRACT_ADDRESS ?? 'SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y',
  contractName: process.env.CONTRACT_NAME ?? 'public-kudos',
  network: (process.env.NETWORK as 'mainnet' | 'testnet' | 'devnet') ?? 'mainnet',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.hiro.so',
});

async function main() {
  const recipient = process.env.RECIPIENT ?? 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const category = BigInt(process.env.CATEGORY ?? '1');

  const givePayload = sdk.buildGiveKudos(recipient, category);
  console.log('Submitting give-kudos tx...');
  await sdk.requestContractCall(request, givePayload);

  const revokePayload = sdk.buildRevokeKudos(recipient, category);
  console.log('Submitting revoke-kudos tx...');
  await sdk.requestContractCall(request, revokePayload);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
