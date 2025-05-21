import {
  arbitrum,
  avalanche,
  base,
  bsc,
  ethereum,
  linea,
  optimism,
  polygon,
  scroll,
} from "thirdweb/chains";
import {
  WebClientInterface,
} from "@aarc-xyz/fundkit-web-sdk";
import {
  ThirdwebProvider,
  useActiveWalletChain,
  useDisconnect,
  useActiveWallet,
  useConnectModal,
} from "thirdweb/react";
import { useCallback, useMemo } from "react";
import { InitAarcWithEthWalletListener } from "@aarc-xyz/eth-connector";
import { ThirdwebEthereumSigner } from "./ThirdwebEthereumSigner";
import { createThirdwebClient } from "thirdweb";

// Create a client instance
const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

// Define supported chains
const SUPPORTED_CHAINS = [
  ethereum,
  arbitrum,
  base,
  optimism,
  polygon,
  bsc,
  avalanche,
  linea,
  scroll,
] as const;

interface Chain {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorers?: {
    default?: {
      url?: string;
    };
  };
}


export function ThirdwebAppConnector({ aarcClient }: { aarcClient: WebClientInterface }) {
  return (
    <ThirdwebProvider>
      <ThirdwebWalletWrapper aarcClient={aarcClient} debugLog={true} />
    </ThirdwebProvider>
  );
}

export function ThirdwebWalletWrapper({
    aarcClient,
  debugLog,
}: {
    aarcClient: WebClientInterface;
  debugLog?: boolean;
}) {
  const activeWallet = useActiveWallet();
  const activeChain = useActiveWalletChain();
  const { disconnect } = useDisconnect();
  const { connect } = useConnectModal();

  // Convert Thirdweb chains to the format expected by Aarc
  const chains = useMemo<Chain[]>(
    () =>
      SUPPORTED_CHAINS.map((network) => ({
        id: Number(network.id),
        name: network.name || "",
        nativeCurrency: {
          name: network.nativeCurrency?.name || "",
          symbol: network.nativeCurrency?.symbol || "",
          decimals: network.nativeCurrency?.decimals || 18,
        },
        blockExplorers: {
          default: {
            url: undefined, // Thirdweb chains don't expose explorer URLs directly
          },
        },
      })),
    []
  );

  const switchChain = useCallback(
    async ({ chainId }: { chainId: number }): Promise<void> => {
      try {
        if (activeWallet?.switchChain) {
          const chain = SUPPORTED_CHAINS.find((c) => Number(c.id) === chainId);
          if (chain) {
            await activeWallet.switchChain(chain);
          }
        }
      } catch (error) {
        console.error("Failed to switch chain:", error);
        throw error;
      }
    },
    [activeWallet]
  );

  const combinedDisconnect = useCallback(async () => {
    try {
      if (activeWallet) {
        await disconnect(activeWallet);
      }
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw error;
    }
  }, [disconnect, activeWallet]);

  const onClickConnect = useCallback(async () => {
    await connect({ client: thirdwebClient });
    console.log("Connection handled by Thirdweb ConnectWallet");
  }, [connect]);

  // Get the current wallet client
  const walletClient = useMemo(() => {
    const account = activeWallet?.getAccount();
    if (account) {
      return new ThirdwebEthereumSigner(account);
    }
    return undefined;
  }, [activeWallet]);

  return (
    <InitAarcWithEthWalletListener
      client={aarcClient}
      debugLog={debugLog}
      chains={chains}
      chainId={activeChain?.id}
      address={activeWallet?.getAccount()?.address}
      disconnectAsync={combinedDisconnect}
      onClickConnect={onClickConnect}
      walletClient={walletClient}
      switchChain={switchChain}
    />
  );
}
