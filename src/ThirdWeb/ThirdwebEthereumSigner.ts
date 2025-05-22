import { AarcTransaction, BlockchainSigner } from "@aarc-xyz/eth-connector";
import { Account } from "thirdweb/wallets";

export class ThirdwebEthereumSigner implements BlockchainSigner {
    public signer: Account;
    public blockChainExplorerUrl?: string;

    constructor(account: Account) {
        this.signer = account;
        this.blockChainExplorerUrl = undefined;
    }

    private async handleSwitchChain() {
        try {
            // Thirdweb handles chain switching internally through their wallet
            console.log("Chain switching handled by Thirdweb wallet");
        } catch (error: unknown) {
            console.error("Error switching chain", error);
            throw error;
        }
    }

    async sendTransaction(transaction: AarcTransaction): Promise<string> {
        if (!this.signer.address) throw new Error("Account not found");

        if (transaction.chainId) {
            await this.handleSwitchChain();
        }

        try {
            const txHash = await this.signer.sendTransaction({
                chainId: Number(transaction.chainId),
                to: transaction.to as `0x${string}` | undefined,
                data: transaction.data as `0x${string}` | undefined,
                value: BigInt(transaction.value ?? 0),
                gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
            });
            return txHash.transactionHash;
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
                    await this.handleSwitchChain();
                    
                    const txHash = await this.signer.sendTransaction({
                        chainId: Number(expectedChainId),
                        to: transaction.to as `0x${string}`,
                        data: transaction.data as `0x${string}`,
                        value: BigInt(transaction.value ?? 0),
                        gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
                    });
                    return txHash.transactionHash;
                }
            }
            throw error;
        }
    }
} 