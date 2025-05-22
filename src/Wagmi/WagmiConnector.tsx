import { useCallback, useState } from "react";
import { WebClientInterface } from "@aarc-xyz/fundkit-web-sdk";
import { InitAarcWithEthWalletListener } from "@aarc-xyz/eth-connector";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import { PrivateKeyModal } from './components/PrivateKeyModal';
import { config } from './config';
import { WagmiProvider } from 'wagmi';
import { WagmiWalletAdapter } from './adapters/WagmiWalletAdapter';
import { setPrivateKey } from './connectors/PrivateKeyConnector';

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

function WagmiConnectorContent({ aarcClient }: { aarcClient: WebClientInterface }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [privateKey, setPrivateKeyState] = useState('');
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const handleConnect = useCallback(async () => {
    try {
      setPrivateKey(privateKey);
      await connect({ connector: config.connectors[0] });
      setPrivateKeyState(''); // Clear input after connect
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    }
  }, [connect, privateKey]);

  const handleDisconnect = useCallback(async () => {
    try {
      setPrivateKey(null);
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw error;
    }
  }, [disconnect]);

  const handleSwitchChain = useCallback(async ({ chainId }: { chainId: number }) => {
    try {
      await switchChain({ chainId });
    } catch (error) {
      console.error("Failed to switch chain:", error);
      throw error;
    }
  }, [switchChain]);

  // Create AARC wallet client adapter when wagmi wallet client is available
  const aarcWalletClient = walletClient ? new WagmiWalletAdapter(walletClient) : undefined;

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
        onPrivateKeyChange={setPrivateKeyState}
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
        chains={[...config.chains]}
        chainId={address ? Number(config.chains[0].id) : undefined}
        address={address}
        disconnectAsync={handleDisconnect}
        onClickConnect={async () => {
          setIsModalOpen(true);
          return Promise.resolve();
        }}
        walletClient={aarcWalletClient}
        switchChain={handleSwitchChain}
      />
    </>
  );
}

export function WagmiAppConnector({ aarcClient }: { aarcClient: WebClientInterface }) {
  return (
    <WagmiProvider config={config}>
        <WagmiConnectorContent aarcClient={aarcClient} />
    </WagmiProvider>
  );
} 