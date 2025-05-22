import { type Chain as WagmiChain } from 'wagmi/chains';

export type Chain = WagmiChain;

export interface PrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  privateKey: string;
  onPrivateKeyChange: (key: string) => void;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
} 