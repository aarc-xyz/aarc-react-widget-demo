import { PrivateKeyModalProps } from '../types';

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
    position: 'relative' as const,
  },
  closeButton: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
  },
  input: {
    width: '100%',
    marginTop: '0.5rem',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    marginTop: '0.5rem',
    padding: '0.75rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
};

export function PrivateKeyModal({
  isOpen,
  onClose,
  privateKey,
  onPrivateKeyChange,
  onConnect,
  onDisconnect,
  isConnected,
}: PrivateKeyModalProps) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button
          onClick={onClose}
          style={styles.closeButton}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 style={styles.title}>Connect Private Key Wallet</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Private Key:
            <input
              type="password"
              value={privateKey}
              onChange={(e) => onPrivateKeyChange(e.target.value)}
              className="input p-1"
              style={styles.input}
              placeholder="Enter your private key (0x...)"
            />
          </label>
          {!isConnected && (
            <button 
              onClick={onConnect}
              className="button"
              style={{ ...styles.button, ...styles.connectButton }}
            >
              Connect
            </button>
          )}
          {isConnected && (
            <button 
              onClick={onDisconnect}
              className="button"
              style={{ ...styles.button, ...styles.disconnectButton }}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 