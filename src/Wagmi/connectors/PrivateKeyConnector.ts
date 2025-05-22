import { ethers } from 'ethers';
import { mainnet, arbitrum, base, optimism, polygon, bsc, avalanche, linea, scrollSepolia } from 'wagmi/chains';
import { PrivateKeyConnectorConfig } from '../types';

export class PrivateKeyConnector {
  readonly id = 'privateKey';
  readonly name = 'Private Key';
  readonly ready = true;
  provider: ethers.JsonRpcProvider;
  signer: ethers.Wallet | null = null;

  private static readonly SUPPORTED_CHAINS = [
    mainnet,
    arbitrum,
    base,
    optimism,
    polygon,
    bsc,
    avalanche,
    linea,
    scrollSepolia,
  ] as const;

  constructor(config: PrivateKeyConnectorConfig) {
    this.provider = config.provider || new ethers.JsonRpcProvider(mainnet.rpcUrls.default.http[0]);
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  async connect() {
    if (!this.signer) throw new Error('No private key provided');
    // Reset provider to ensure fresh connection
    this.provider = new ethers.JsonRpcProvider(mainnet.rpcUrls.default.http[0]);
    this.signer = new ethers.Wallet(this.signer.privateKey, this.provider);
    return {
      account: this.signer.address,
      chain: { id: mainnet.id },
    };
  }

  async disconnect() {
    this.signer = null;
    // Reset provider to ensure clean state
    this.provider = new ethers.JsonRpcProvider(mainnet.rpcUrls.default.http[0]);
  }

  async getAccount() {
    return this.signer?.address;
  }

  async getChainId() {
    if (!this.signer?.provider) return undefined;
    const network = await this.signer.provider.getNetwork();
    return network.chainId;
  }

  async switchChain(chainId: number) {
    const chain = PrivateKeyConnector.SUPPORTED_CHAINS.find(c => c.id === chainId);
    if (!chain) throw new Error('Chain not supported');
    this.provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);
    if (this.signer) {
      this.signer = this.signer.connect(this.provider);
    }
  }

  static getSupportedChains() {
    return PrivateKeyConnector.SUPPORTED_CHAINS;
  }
} 