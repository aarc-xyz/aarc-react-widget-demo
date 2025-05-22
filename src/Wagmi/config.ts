import { http } from 'viem';
import { createConfig } from 'wagmi';
import { mainnet, arbitrum, base, optimism, polygon, bsc, avalanche, linea, scrollSepolia } from 'wagmi/chains';
import { privateKeyConnector } from './connectors/PrivateKeyConnector';

// Define supported chains
export const supportedChains = [
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

// Create wagmi config
export const config = createConfig({
  chains: supportedChains,
  connectors: [
    privateKeyConnector(),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [linea.id]: http(),
    [scrollSepolia.id]: http(),
  },
}); 