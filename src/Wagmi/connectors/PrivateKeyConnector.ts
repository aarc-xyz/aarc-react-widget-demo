import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createConnector } from 'wagmi';

// In-memory storage for private key and selected chain ID
let privateKeyMemory: string | null = null;
let currentChainId: number | null = null;

// Helper for consistent logging
const log = (method: string, message: string, data?: unknown) => {
  console.log(`[PrivateKeyConnector] ${method}: ${message}`, data !== undefined ? data : '');
};

export function privateKeyConnector() {
  log('init', 'Creating private key connector');
  return createConnector((config) => ({
    id: 'privateKey',
    name: 'Private Key',
    type: 'privateKey',
    iconUrl: '',
    iconBackground: '#fff',

    async connect({ chainId }: { chainId?: number } = {}) {
      log('connect', 'Connecting with private key', { requestedChainId: chainId, currentChainId });
      if (!privateKeyMemory) throw new Error('No private key found');

      const account = privateKeyToAccount(privateKeyMemory as `0x${string}`);
      // Use the provided chainId or the existing currentChainId or default to the first chain
      const targetChainId = chainId || currentChainId || config.chains[0].id;
      const chain = config.chains.find((x) => x.id === targetChainId) ?? config.chains[0];
      
      // Set the current chain ID to keep track of it
      currentChainId = chain.id;
      
      log('connect', 'Connected successfully', { chainId: chain.id, address: account.address });
      return {
        accounts: [account.address],
        chainId: chain.id,
      };
    },

    async disconnect() {
      log('disconnect', 'Disconnecting wallet');
      privateKeyMemory = null;
      currentChainId = null;
      log('disconnect', 'Disconnected successfully');
    },

    async getAccounts() {
      log('getAccounts', 'Getting accounts');
      if (!privateKeyMemory) return [];
      const account = privateKeyToAccount(privateKeyMemory as `0x${string}`);
      log('getAccounts', 'Retrieved accounts', { accounts: [account.address] });
      return [account.address];
    },

    async getChainId() {
      // Return the current chain ID or default to the first chain
      const chainId = currentChainId || config.chains[0].id;
      log('getChainId', 'Getting chain ID', { chainId });
      return chainId;
    },

    async getProvider() {
      log('getProvider', 'Getting provider', { currentChainId });
      if (!privateKeyMemory) throw new Error('No private key found');
      const account = privateKeyToAccount(privateKeyMemory as `0x${string}`);
      
      // Use the current chain ID or default to the first chain
      const chainId = currentChainId || config.chains[0].id;
      const chain = config.chains.find((x) => x.id === chainId) ?? config.chains[0];
      
      log('getProvider', 'Creating wallet client', { chainId: chain.id, address: account.address });
      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(),
      });

      return {
        request: async ({ method, params }: { method: string; params?: unknown[] }) => {
          log('provider.request', `Method: ${method}`, { params });
          
          switch (method) {
            case 'eth_sendTransaction': {
              log('eth_sendTransaction', 'Sending transaction');
              if (!params?.[0]) throw new Error('No transaction parameters');
              const tx = params[0] as {
                to?: string;
                value?: string;
                data?: string;
                gas?: string;
                nonce?: number;
              };
              log('eth_sendTransaction', 'Transaction parameters', tx);
              
              let toAddress: `0x${string}` | undefined = undefined;
              if (tx.to) {
                if (!tx.to.startsWith('0x')) throw new Error('Invalid to address');
                toAddress = tx.to as `0x${string}`;
              }
              let dataField: `0x${string}` | undefined = undefined;
              if (tx.data) {
                if (!tx.data.startsWith('0x')) throw new Error('Invalid data field');
                dataField = tx.data as `0x${string}`;
              }
              
              try {
                const hash = await walletClient.sendTransaction({
                  account,
                  to: toAddress,
                  value: tx.value ? BigInt(tx.value) : undefined,
                  data: dataField,
                  gas: tx.gas ? BigInt(tx.gas) : undefined,
                  nonce: tx.nonce,
                  chain,
                });
                log('eth_sendTransaction', 'Transaction successful', { hash });
                return hash;
              } catch (error) {
                log('eth_sendTransaction', 'Transaction failed', error);
                throw error;
              }
            }
            case 'eth_signTypedData_v4': {
              log('eth_signTypedData_v4', 'Signing typed data');
              if (!params?.[0] || !params?.[1]) throw new Error('Invalid parameters');
              const typedData = JSON.parse(params[0] as string);
              log('eth_signTypedData_v4', 'Typed data', { domain: typedData.domain, primaryType: typedData.primaryType });
              
              try {
                const signature = await walletClient.signTypedData({
                  domain: typedData.domain,
                  types: typedData.types,
                  primaryType: typedData.primaryType,
                  message: typedData.message,
                  account,
                });
                log('eth_signTypedData_v4', 'Signing successful', { signature });
                return signature;
              } catch (error) {
                log('eth_signTypedData_v4', 'Signing failed', error);
                throw error;
              }
            }
            case 'wallet_switchEthereumChain': {
              log('wallet_switchEthereumChain', 'Switching chain');
              if (!params?.[0] || !(params[0] as { chainId: string }).chainId) throw new Error("Missing chainId in wallet_switchEthereumChain");
              const chainId = Number((params[0] as { chainId: string }).chainId);
              log('wallet_switchEthereumChain', 'Target chain ID', { chainId });
              
              const chain = config.chains.find((x) => x.id === chainId);
              if (!chain) {
                log('wallet_switchEthereumChain', 'Chain not supported', { chainId });
                throw new Error(`Chain ${chainId} not supported`);
              }
              
              // Update the current chain ID to the new one
              log('wallet_switchEthereumChain', 'Switching from chain to chain', { from: currentChainId, to: chainId });
              currentChainId = chainId;
              
              // Return null to indicate success
              log('wallet_switchEthereumChain', 'Chain switch successful', { chainId });
              return null;
            }
            case 'wallet_addEthereumChain': {
              log('wallet_addEthereumChain', 'Adding chain');
              if (!params?.[0] || !(params[0] as { chainId: string }).chainId) throw new Error("Missing chainId in wallet_addEthereumChain");
              const chainId = Number((params[0] as { chainId: string }).chainId);
              log('wallet_addEthereumChain', 'Target chain ID', { chainId });
              
              // Check if chain is supported by config
              const chain = config.chains.find((x) => x.id === chainId);
              if (!chain) {
                log('wallet_addEthereumChain', 'Chain not supported in configuration', { chainId });
                // If chain is not in config, we can't really add it
                // In a real implementation, you might want to add it to a local list
                throw new Error(`Chain ${chainId} not supported in configuration`);
              }
              
              // Switch to the chain
              log('wallet_addEthereumChain', 'Adding and switching to chain', { chainId });
              currentChainId = chainId;
              
              log('wallet_addEthereumChain', 'Chain added successfully', { chainId });
              return null;
            }
            case 'eth_chainId': {
              log('eth_chainId', 'Getting current chain ID');
              const chainId = currentChainId || config.chains[0].id;
              // Convert to hex string format with '0x' prefix
              const hexChainId = `0x${chainId.toString(16)}`;
              log('eth_chainId', 'Returning chain ID', { chainId, hexChainId });
              return hexChainId;
            }
            default:
              log('provider.request', `Method ${method} not supported`, { method });
              throw new Error(`Method ${method} not supported`);
          }
        },
      };
    },

    async getWalletClient({ chainId }: { chainId?: number } = {}) {
      log('getWalletClient', 'Getting wallet client', { requestedChainId: chainId, currentChainId });
      if (!privateKeyMemory) throw new Error('No private key found');
      const account = privateKeyToAccount(privateKeyMemory as `0x${string}`);
      
      // Use the provided chainId or the current chainId or default
      const targetChainId = chainId || currentChainId || config.chains[0].id;
      const chain = config.chains.find((x) => x.id === targetChainId) ?? config.chains[0];
      
      log('getWalletClient', 'Created wallet client', { chainId: chain.id, address: account.address });
      return createWalletClient({
        account,
        chain,
        transport: http(),
      });
    },

    async isAuthorized() {
      const authorized = !!privateKeyMemory;
      log('isAuthorized', 'Checking authorization', { authorized });
      return authorized;
    },

    async switchChain({ chainId }: { chainId: number }) {
      log('switchChain', 'Switching chain', { from: currentChainId, to: chainId });
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain) {
        log('switchChain', 'Chain not supported', { chainId });
        throw new Error(`Chain ${chainId} not supported`);
      }
      
      // Update the current chain ID
      currentChainId = chainId;
      
      log('switchChain', 'Chain switch successful', { chainId });
      return chain;
    },

    onAccountsChanged(accounts: string[]) {
      log('onAccountsChanged', 'Accounts changed', { accounts });
      if (accounts.length === 0) this.onDisconnect();
    },

    onChainChanged(chainId: string | number) {
      const id = Number(chainId);
      log('onChainChanged', 'Chain changed', { from: currentChainId, to: id });
      const chain = config.chains.find((x) => x.id === id);
      if (!chain) {
        log('onChainChanged', 'Chain not supported', { chainId: id });
        throw new Error(`Chain ${id} not supported`);
      }
      
      // Update current chain ID
      currentChainId = id;
      log('onChainChanged', 'Chain update successful', { chainId: id });
    },

    onDisconnect() {
      log('onDisconnect', 'Disconnect event received');
      this.disconnect();
    },
  }));
}

// Function to set private key (to be called from the modal)
export function setPrivateKey(key: string | null) {
  log('setPrivateKey', key ? 'Setting private key' : 'Clearing private key');
  privateKeyMemory = key;
}

// Function to get private key status
export function hasPrivateKey(): boolean {
  const hasKey = !!privateKeyMemory;
  log('hasPrivateKey', 'Checking if private key exists', { hasKey });
  return hasKey;
}

// Function to get current chain ID
export function getCurrentChainId(): number | null {
  log('getCurrentChainId', 'Getting current chain ID', { currentChainId });
  return currentChainId;
}

// Function to set current chain ID
export function setCurrentChainId(chainId: number | null): void {
  log('setCurrentChainId', 'Setting current chain ID', { from: currentChainId, to: chainId });
  currentChainId = chainId;
} 