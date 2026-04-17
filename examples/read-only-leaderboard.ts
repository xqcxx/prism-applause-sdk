import { PublicKudosSDK } from '../src';

const sdk = new PublicKudosSDK({
  contractAddress: process.env.CONTRACT_ADDRESS ?? 'SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y',
  contractName: process.env.CONTRACT_NAME ?? 'public-kudos',
  network: (process.env.NETWORK as 'mainnet' | 'testnet' | 'devnet') ?? 'mainnet',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.hiro.so',
});

async function main() {
  const from = process.env.FROM ?? 'SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y';
  const to = process.env.TO ?? from;

  const profile = await sdk.getProfile(from, to);
  console.log('Total kudos:', profile.total.toString());
  console.log('Last action height:', profile.lastActionHeight.toString());

  for (const [category, count] of Object.entries(profile.categoryCounts)) {
    const active = profile.activeByCategory[Number(category)] ?? false;
    console.log(`Category ${category}: count=${count.toString()} active=${active}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
