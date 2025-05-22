import { WalletClient } from 'viem';
import type { BlockchainSigner, AarcTransaction } from '@aarc-xyz/eth-connector';

interface ChainError extends Error {
  message: string;
  code?: number;
}

export class WagmiWalletAdapter implements BlockchainSigner {
  public signer: WalletClient;
  public blockChainExplorerUrl?: string;

  constructor(walletClient: WalletClient) {
    this.signer = walletClient;
    this.blockChainExplorerUrl = walletClient.chain?.blockExplorers?.default.url;
  }

  private async handleSwitchChain(onChainID: string) {
    const chainIdNumber = Number(onChainID);
    try {
      await this.signer.switchChain({ id: chainIdNumber });
    } catch (error) {
      const chainError = error as ChainError;
      if (chainError.message.includes("Unrecognized chain ID")) {
        const chain = this.signer.chain;
        if (!chain) {
          throw new Error(`Chain with ID ${chainIdNumber} not found`);
        }
        await this.signer.addChain({ chain });
        await this.signer.switchChain({ id: chainIdNumber });
        return chain;
      } else {
        console.error("Error switching chain", chainError);
        throw chainError;
      }
    }
  }

  async sendTransaction(transaction: AarcTransaction): Promise<string> {
    const account = this.signer.account;
    if (account === undefined) throw new Error("Account not found");

    if (transaction.chainId) {
      await this.handleSwitchChain(transaction.chainId);
    }

    try {
      const resp = await this.signer.sendTransaction({
        chain: undefined,
        account,
        to: `0x${transaction.to.split("0x")[1]}`,
        data: transaction.data
          ? `0x${transaction.data.split("0x")[1]}`
          : undefined,
        value: BigInt(transaction.value ?? 0),
        gasLimit: transaction.gasLimit ?? undefined,
      });
      return resp;
    } catch (error) {
      const chainError = error as ChainError;
      // Check if the error is a chain mismatch error
      if (chainError.message && (
        chainError.message.includes("chain of the wallet") && 
        chainError.message.includes("does not match the target chain")
      )) {
        console.warn("Chain mismatch detected, attempting to fix...");
        
        // Extract the expected chain ID from the error message if possible
        const expectedChainMatch = chainError.message.match(/Expected Chain ID: (\d+)/);
        const expectedChainId = expectedChainMatch ? expectedChainMatch[1] : 
                               (transaction.chainId || this.signer.chain?.id.toString());

        if (expectedChainId) {
          // Force switch to the expected chain
          await this.handleSwitchChain(expectedChainId.toString());
          
          // Retry the transaction
          const resp = await this.signer.sendTransaction({
            chain: undefined,
            account,
            to: `0x${transaction.to.split("0x")[1]}`,
            data: transaction.data
              ? `0x${transaction.data.split("0x")[1]}`
              : undefined,
            value: BigInt(transaction.value ?? 0),
            gasLimit: transaction.gasLimit ?? undefined,
          });
          return resp;
        }
      }
      
      // If it's not a chain mismatch error or we couldn't fix it, rethrow
      throw chainError;
    }
  }
} 