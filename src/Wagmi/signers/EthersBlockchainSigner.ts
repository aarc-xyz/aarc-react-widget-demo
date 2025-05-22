import { ethers } from 'ethers';
import { AarcTransaction, BlockchainSigner } from "@aarc-xyz/eth-connector";
import { PrivateKeyConnector } from '../connectors/PrivateKeyConnector';

export class EthersBlockchainSigner implements BlockchainSigner {
  public signer: ethers.Wallet;
  public blockChainExplorerUrl?: string;

  constructor(wallet: ethers.Wallet) {
    this.signer = wallet;
    this.blockChainExplorerUrl = undefined;
  }

  async sendTransaction(transaction: AarcTransaction): Promise<string> {
    if (!this.signer.address) throw new Error("Account not found");

    try {
      const txHash = await this.signer.sendTransaction({
        chainId: Number(transaction.chainId),
        to: transaction.to as `0x${string}` | undefined,
        data: transaction.data as `0x${string}` | undefined,
        value: BigInt(transaction.value ?? 0),
        gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
      });
      return txHash.hash;
    } catch (error: unknown) {
      // Handle chain mismatch errors
      if (error instanceof Error && error.message && (
        error.message.includes("chain of the wallet") && 
        error.message.includes("does not match the target chain")
      )) {
        console.warn("Chain mismatch detected, attempting to fix...");
        
        const expectedChainMatch = error.message.match(/Expected Chain ID: (\d+)/);
        const expectedChainId = expectedChainMatch ? expectedChainMatch[1] : 
                               transaction.chainId;

        if (expectedChainId) {
          const chain = PrivateKeyConnector.getSupportedChains()
            .find(c => c.id === Number(expectedChainId));
          if (!chain) throw new Error('Chain not supported');
          
          const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);
          this.signer = this.signer.connect(provider);
          
          const txHash = await this.signer.sendTransaction({
            chainId: Number(expectedChainId),
            to: transaction.to as `0x${string}`,
            data: transaction.data as `0x${string}`,
            value: BigInt(transaction.value ?? 0),
            gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
          });
          return txHash.hash;
        }
      }
      throw error;
    }
  }
} 