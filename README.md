# prism-applause-sdk

TypeScript SDK for interacting with the `public-kudos` Clarity contract.

## Deployed Mainnet Contract

- Contract ID: `SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y.public-kudos`

## Features

- Typed read-only helpers for total kudos, per-category counts, active kudos state, and profile snapshots
- Typed contract call payload builders for give/revoke flows
- Compatible with `@stacks/connect` request APIs
- Publish-ready setup with lint, typecheck, tests, and build checks

## Installation

```bash
npm install prism-applause-sdk @stacks/transactions
```

## Quick Start

```ts
import { PublicKudosSDK } from 'prism-applause-sdk';

const sdk = new PublicKudosSDK({
  contractAddress: 'SP3CPTJFP3TQK00DV0B5SGE8R0N3Z40MWJ6QZD38Y',
  contractName: 'public-kudos',
  network: 'mainnet',
  apiBaseUrl: 'https://api.hiro.so',
});

const total = await sdk.getTotalKudos('SP2...');
const profile = await sdk.getProfile('SP1...', 'SP2...');
```

## Build tx payloads

```ts
const givePayload = sdk.buildGiveKudos('SP2...', 1);
const revokePayload = sdk.buildRevokeKudos('SP2...', 1);
```

## Execute with Stacks Connect

```ts
import { request } from '@stacks/connect';

await sdk.requestContractCall(request, givePayload);
```

## End-to-End Examples

A write flow example (give then revoke) is available in:

- `examples/connect-flow.ts`

A read-only leaderboard/profile example is available in:

- `examples/read-only-leaderboard.ts`

## API Methods

- `buildGiveKudos(recipient, category)`
- `buildRevokeKudos(recipient, category)`
- `hasKudos(from, to, category)`
- `getCategoryCount(to, category)`
- `getTotalKudos(to)`
- `getLastActionHeight(from, to)`
- `getProfile(from, to, categories?)`

## Development

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Publish checks

```bash
npm run prepublishOnly
npm run pack:check
npm run publish:dry-run
```

## License

MIT
