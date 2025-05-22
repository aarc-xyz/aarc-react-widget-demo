import { ethers } from 'ethers';

export interface Chain {
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

export interface PrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  privateKey: string;
  onPrivateKeyChange: (key: string) => void;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
}

export interface PrivateKeyConnectorConfig {
  privateKey: string;
  provider?: ethers.JsonRpcProvider;
} 