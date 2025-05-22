import { useCallback, useMemo, useState } from "react";
import { WebClientInterface } from "@aarc-xyz/fundkit-web-sdk";
import { InitAarcWithEthWalletListener } from "@aarc-xyz/eth-connector";
import { PrivateKeyConnector } from './connectors/PrivateKeyConnector';
import { EthersBlockchainSigner } from './signers/EthersBlockchainSigner';
import { PrivateKeyModal } from './components/PrivateKeyModal';
import { Chain } from './types';

const styles = {
  connectButton: {
    padding: '0.75rem 1.5rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  connectButtonConnected: {
    backgroundColor: '#f44336',
  },
  connectButtonDisconnected: {
    backgroundColor: '#4CAF50',
  },
};

export function WagmiAppConnector({ aarcClient }: { aarcClient: WebClientInterface }) {
  const [privateKey, setPrivateKey] = useState(import.meta.env.VITE_PRIVATE_KEY || '');
  const [privateKeyConnector, setPrivateKeyConnector] = useState(() => new PrivateKeyConnector({ privateKey }));
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrivateKeyChange = useCallback((newPrivateKey: string) => {
    setPrivateKey(newPrivateKey);
    setPrivateKeyConnector(new PrivateKeyConnector({ privateKey: newPrivateKey }));
    if (isConnected) {
      setIsConnected(false);
    }
  }, [isConnected]);

  const handleConnect = useCallback(async () => {
    try {
      if (!privateKey) {
        throw new Error('Please enter a private key');
      }
      const newConnector = new PrivateKeyConnector({ privateKey });
      setPrivateKeyConnector(newConnector);
      await newConnector.connect();
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnected(false);
      throw error;
    }
  }, [privateKey]);

  const handleDisconnect = useCallback(async () => {
    try {
      await privateKeyConnector.disconnect();
      setIsConnected(false);
      setPrivateKeyConnector(new PrivateKeyConnector({ privateKey }));
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw error;
    }
  }, [privateKeyConnector, privateKey]);

  const handleSwitchChain = useCallback(async ({ chainId }: { chainId: number }) => {
    try {
      await privateKeyConnector.switchChain(chainId);
    } catch (error) {
      console.error("Failed to switch chain:", error);
      throw error;
    }
  }, [privateKeyConnector]);

  const walletClient = useMemo(() => {
    if (!privateKeyConnector.signer) return undefined;
    return new EthersBlockchainSigner(privateKeyConnector.signer);
  }, [privateKeyConnector.signer]);

  const chains = useMemo<Chain[]>(
    () => PrivateKeyConnector.getSupportedChains().map((network) => ({
      id: network.id,
      name: network.name,
      nativeCurrency: {
        name: network.nativeCurrency.name,
        symbol: network.nativeCurrency.symbol,
        decimals: network.nativeCurrency.decimals,
      },
      blockExplorers: {
        default: {
          url: network.blockExplorers?.default?.url,
        },
      },
    })),
    []
  );

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="button"
        style={{
          ...styles.connectButton,
          ...(isConnected ? styles.connectButtonConnected : styles.connectButtonDisconnected),
        }}
      >
        {isConnected ? 'Disconnect Wallet' : 'Connect Private Key Wallet'}
      </button>

      <PrivateKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        privateKey={privateKey}
        onPrivateKeyChange={handlePrivateKeyChange}
        onConnect={async () => {
          await handleConnect();
          setIsModalOpen(false);
        }}
        onDisconnect={async () => {
          await handleDisconnect();
          setIsModalOpen(false);
        }}
        isConnected={isConnected}
      />

      <InitAarcWithEthWalletListener
        client={aarcClient}
        debugLog={true}
        chains={chains}
        chainId={privateKeyConnector.signer ? Number(privateKeyConnector.getChainId()) : undefined}
        address={privateKeyConnector.signer?.address}
        disconnectAsync={handleDisconnect}
        onClickConnect={async () => {
          setIsModalOpen(true);
          return Promise.resolve();
        }}
        walletClient={walletClient}
        switchChain={handleSwitchChain}
      />
    </>
  );
} 