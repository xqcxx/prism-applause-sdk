import {
  cvToHex,
  cvToJSON,
  hexToCV,
  principalCV,
  uintCV,
  type ClarityValue,
} from '@stacks/transactions';
import { asBigInt, asBool, unwrapReadOnlyResponse } from './parsers';
import {
  PublicKudosConfigError,
  PublicKudosRequestError,
  PublicKudosResponseError,
} from './errors';
import type {
  ContractCallPayload,
  KudosProfile,
  PublicKudosSDKConfig,
  StacksNetwork,
} from './types';

const DEFAULT_API_BASE_BY_NETWORK: Record<StacksNetwork, string> = {
  mainnet: 'https://api.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
  devnet: 'http://localhost:3999',
};

type ConnectRequest = (
  method: 'stx_callContract',
  params: {
    contract: `${string}.${string}`;
    functionName: string;
    functionArgs: string[];
    network: StacksNetwork;
    postConditionMode: 'deny' | 'allow';
    sponsored: boolean;
  },
) => Promise<unknown>;

export class PublicKudosSDK {
  private readonly contractAddress: string;
  private readonly contractName: string;
  private readonly network: StacksNetwork;
  private readonly apiBaseUrl: string;
  private readonly defaultSender: string | undefined;
  private readonly fetchFn: typeof fetch;

  constructor(config: PublicKudosSDKConfig) {
    if (!config.contractAddress || !config.contractName) {
      throw new PublicKudosConfigError('contractAddress and contractName are required');
    }

    this.contractAddress = config.contractAddress;
    this.contractName = config.contractName;
    this.network = config.network ?? 'mainnet';
    this.apiBaseUrl = (config.apiBaseUrl ?? DEFAULT_API_BASE_BY_NETWORK[this.network]).replace(/\/$/, '');
    this.defaultSender = config.defaultSender;
    this.fetchFn = config.fetchFn ?? fetch;
  }

  getContractId(): `${string}.${string}` {
    return `${this.contractAddress}.${this.contractName}`;
  }

  buildGiveKudos(recipient: string, category: bigint | number): ContractCallPayload {
    return this.buildPayload('give-kudos', [principalCV(recipient), uintCV(category)]);
  }

  buildRevokeKudos(recipient: string, category: bigint | number): ContractCallPayload {
    return this.buildPayload('revoke-kudos', [principalCV(recipient), uintCV(category)]);
  }

  async requestContractCall(request: ConnectRequest, payload: ContractCallPayload): Promise<unknown> {
    return request('stx_callContract', {
      contract: payload.contract,
      functionName: payload.functionName,
      functionArgs: payload.functionArgs,
      network: payload.network,
      postConditionMode: payload.postConditionMode,
      sponsored: payload.sponsored,
    });
  }

  async hasKudos(from: string, to: string, category: bigint | number, sender?: string): Promise<boolean> {
    const raw = await this.callReadOnly('has-kudos', [principalCV(from), principalCV(to), uintCV(category)], sender);
    return asBool(raw, 'has-kudos');
  }

  async getCategoryCount(to: string, category: bigint | number, sender?: string): Promise<bigint> {
    const raw = await this.callReadOnly('get-category-count', [principalCV(to), uintCV(category)], sender);
    return asBigInt(raw, 'get-category-count');
  }

  async getTotalKudos(to: string, sender?: string): Promise<bigint> {
    const raw = await this.callReadOnly('get-total-kudos', [principalCV(to)], sender);
    return asBigInt(raw, 'get-total-kudos');
  }

  async getLastActionHeight(from: string, to: string, sender?: string): Promise<bigint> {
    const raw = await this.callReadOnly('get-last-action-height', [principalCV(from), principalCV(to)], sender);
    return asBigInt(raw, 'get-last-action-height');
  }

  async getProfile(from: string, to: string, categories: number[] = [1, 2, 3, 4, 5], sender?: string): Promise<KudosProfile> {
    const categoryReads = categories.map((category) =>
      Promise.all([
        this.getCategoryCount(to, category, sender),
        this.hasKudos(from, to, category, sender),
      ]),
    );

    const [pairs, total, lastActionHeight] = await Promise.all([
      Promise.all(categoryReads),
      this.getTotalKudos(to, sender),
      this.getLastActionHeight(from, to, sender),
    ]);

    const categoryCounts: Record<number, bigint> = {};
    const activeByCategory: Record<number, boolean> = {};

    categories.forEach((category, index) => {
      categoryCounts[category] = pairs[index]?.[0] ?? 0n;
      activeByCategory[category] = pairs[index]?.[1] ?? false;
    });

    return {
      recipient: to,
      total,
      categoryCounts,
      activeByCategory,
      lastActionHeight,
    };
  }

  private buildPayload(functionName: string, args: ClarityValue[]): ContractCallPayload {
    return {
      contract: this.getContractId(),
      functionName,
      functionArgs: args.map((arg) => cvToHex(arg)),
      network: this.network,
      postConditionMode: 'deny',
      sponsored: false,
    };
  }

  private async callReadOnly(functionName: string, args: ClarityValue[], sender?: string): Promise<unknown> {
    const response = await this.fetchFn(
      `${this.apiBaseUrl}/v2/contracts/call-read/${this.contractAddress}/${this.contractName}/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: sender ?? this.defaultSender ?? this.contractAddress,
          arguments: args.map((arg) => cvToHex(arg)),
        }),
      },
    );

    if (!response.ok) {
      throw new PublicKudosRequestError(`Read-only request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      okay?: boolean;
      result?: string;
      cause?: string;
    };

    if (!payload.okay || !payload.result) {
      throw new PublicKudosResponseError(payload.cause ?? 'Read-only endpoint returned invalid response');
    }

    const clarityValue = hexToCV(payload.result);
    const parsed = cvToJSON(clarityValue);
    return unwrapReadOnlyResponse(parsed);
  }
}
