export type StacksNetwork = 'mainnet' | 'testnet' | 'devnet';

export interface PublicKudosSDKConfig {
  contractAddress: string;
  contractName: string;
  network?: StacksNetwork;
  apiBaseUrl?: string;
  defaultSender?: string;
  fetchFn?: typeof fetch;
}

export interface ContractCallPayload {
  contract: `${string}.${string}`;
  functionName: string;
  functionArgs: string[];
  network: StacksNetwork;
  postConditionMode: 'deny' | 'allow';
  sponsored: boolean;
}

export interface KudosProfile {
  recipient: string;
  total: bigint;
  categoryCounts: Record<number, bigint>;
  activeByCategory: Record<number, boolean>;
  lastActionHeight: bigint;
}
