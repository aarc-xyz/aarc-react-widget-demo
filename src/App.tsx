import { useCallback, useRef, useState } from "react";
import "./App.css";
import {
  AarcFundKitModal,
  FKConfig,
  SourceConnectorName,
  ThemeName,
  TransactionErrorData,
  TransactionSuccessData,
} from "@aarc-xyz/fundkit-web-sdk";
import DepositBanner from "./assets/deposit-banner.svg";
import ContractBanner from "./assets/contract-banner.svg";
import { AarcEthWalletConnector } from "@aarc-xyz/eth-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ethers } from "ethers";
import "@aarc-xyz/eth-connector/styles.css"; // this is important to include for wallet connect modal styles

const queryClient = new QueryClient();

const config: FKConfig = {
  appName: "Dapp Name",
  module: {
    exchange: {
      enabled: true,
    },
    onRamp: {
      enabled: true,
      onRampConfig: {
        customerId: "323232323",
        exchangeScreenTitle: "Deposit funds in your wallet",
      },
    },
    bridgeAndSwap: {
      enabled: true,
      fetchOnlyDestinationBalance: false,
      routeType: "Value",
      connectors: [SourceConnectorName.ETHEREUM],
    },
  },
  destination: {
    walletAddress: "0xeDa8Dec60B6C2055B61939dDA41E9173Bab372b2",
  },
  appearance: {
    themeColor: "#A5E547",
    textColor: "#2D2D2D",
    backgroundColor: "#FAFAFA",
    dark: {
      themeColor: "#A5E547", // #2D2D2D
      textColor: "#FFF", // #FFF
      backgroundColor: "#2D2D2D", // #2D2D2D
      highlightColor: "#08091B", // #FFF
      borderColor: "#424242",
    },
    theme: ThemeName.DARK,
    roundness: 8,
  },
  apiKeys: {
    aarcSDK: import.meta.env.VITE_API_KEY,
  },
  events: {
    onTransactionSuccess: (data: TransactionSuccessData) => {
      console.log("client onTransactionSuccess", data);
    },
    onTransactionError: (data: TransactionErrorData) => {
      console.log("client onTransactionError", data);
    },
    onWidgetClose: () => {
      console.log("client onWidgetClose");
    },
    onWidgetOpen: () => {
      console.log("client onWidgetOpen");
    },
  },
  origin: window.location.origin,
};

function App() {
  const aarcModalRef = useRef(new AarcFundKitModal(config));

  const [address, setAddress] = useState(config.destination.walletAddress);
  const aarcModal = aarcModalRef.current;

  const handleSubmit = useCallback(() => {
    // Open Modal Logic Here (implement with plain JavaScript or React state)
    console.log("Modal opened with address: ", address);
    aarcModal.openModal();
  }, [aarcModal, address]);

  function generateCheckoutCallData(
    token: string,
    toAddress: string,
    amount: string
  ): string {
    const simpleDappInterface = new ethers.Interface([
      "function mint(address token, address to, uint256 amount) external",
    ]);

    return simpleDappInterface.encodeFunctionData("mint", [
      token,
      toAddress,
      amount,
    ]);
  }

  const handleSubmitContract = useCallback(async () => {
    // Open Modal Logic Here (implement with plain JavaScript or React state)
    const _address = "0x45c0470ef627a30efe30c06b13d883669b8fd3a8";
    setAddress(_address);
    console.log("Modal opened with address: ", address);
    aarcModal.updateDestinationWalletAddress(_address);
    aarcModal.updateDestinationChainId(8453);
    aarcModal.updateDestinationToken(
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
    );
    aarcModal.updateRequestedAmount(0.01);
    const payload = generateCheckoutCallData(
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      "0xeDa8Dec60B6C2055B61939dDA41E9173Bab372b2",
      "10000"
    );
    aarcModal.updateDestinationContract({
      contractAddress: _address,
      contractName: "Simple Dapp Interface",
      contractGasLimit: "1000000",
      contractPayload: payload,
      sourceTokenData: {
        sourceTokenAmount: 0.01,
        sourceTokenCode: "USDC",
      },
    });
    aarcModal.openModal();
  }, [aarcModal, address]);

  return (
    <QueryClientProvider client={queryClient}>
      <AarcEthWalletConnector aarcWebClient={aarcModal}>
        <div className="App">
          <div>
            <div className="card">
              <h2>Transfer Balance</h2>
              <div className="form">
                <div className="form-item">
                  <label>
                    Recipient wallet address:
                    <input
                      type="text"
                      value={address}
                      className="input p-1"
                      style={{ width: "100%" }}
                      onChange={(e) => {
                        aarcModal.updateDestinationWalletAddress(
                          e.target.value
                        );
                        setAddress(e.target.value);
                      }}
                    />
                  </label>
                </div>
                <div className="form-item">
                  <img
                    src={DepositBanner}
                    alt="Deposit"
                    onClick={handleSubmit}
                    className="clickable-image"
                  />
                </div>
                <div className="form-item">
                  <img
                    src={ContractBanner}
                    alt="Contract"
                    onClick={handleSubmitContract}
                    className="clickable-image"
                  />
                </div>
              </div>
            </div>
            {import.meta.env.VITE_RUN_MODE === "development" && (
              <>
                <h2>Preselect</h2>
                <div className="buttons">
                  <button
                    onClick={async () => {
                      aarcModal.updateDestinationToken(
                        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
                        42161,
                        0.01
                      );
                      aarcModal.openModal();
                    }}
                  >
                    {"0.01 USDC (ARB)"}
                  </button>
                  <button
                    onClick={async () => {
                      aarcModal.updateDestinationToken(
                        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
                        42161
                      );
                      aarcModal.updateRequestedAmountInUSD(0.01);
                      aarcModal.openModal();
                    }}
                  >
                    {"$0.01 USDC (ARB)"}
                  </button>
                  <button
                    onClick={async () => {
                      aarcModal.updateDestinationToken(
                        "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
                        42161,
                        10
                      );
                      aarcModal.openModal();
                    }}
                  >
                    {"10 LINK (ARB)"}
                  </button>
                  <button
                    onClick={async () => {
                      aarcModal.updateDestinationToken(
                        "0xbc45647ea894030a4e9801ec03479739fa2485f0",
                        8453,
                        undefined
                      );
                      aarcModal.openModal();
                    }}
                  >
                    {"BENJI (BASE)"}
                  </button>
                  <button
                    onClick={async () => {
                      aarcModal.updateDestinationToken(
                        "0xbc45647ea894030a4e9801ec03479739fa2485f0",
                        8453,
                        undefined
                      );
                      aarcModal.updateRequestedAmountInUSD(2);
                      aarcModal.openModal();
                    }}
                  >
                    {"$2 BENJI (BASE)"}
                  </button>
                  {config?.module?.bridgeAndSwap?.connectors?.includes(
                    SourceConnectorName.SOLANA
                  ) && (
                    <>
                      <button
                        onClick={async () => {
                          aarcModal.updateDestinationWalletAddress(
                            "3o2Xo9TTVwTfB4pd88zk9VeWHd416nqR8jxxeC9cxmiE"
                          );
                          setAddress(
                            aarcModal.config.destination.walletAddress
                          );
                          aarcModal.openModal();
                        }}
                      >
                        Solana address
                      </button>
                    </>
                  )}
                  <button
                    onClick={async () => {
                      aarcModal.updateAppearance({
                        theme: ThemeName.DARK,
                      });
                      aarcModal.openModal();
                    }}
                  >
                    DARK MODE
                  </button>
                  <button
                    onClick={async () => {
                      aarcModal.updateAppearance({
                        theme: ThemeName.LIGHT,
                      });
                      aarcModal.openModal();
                    }}
                  >
                    LIGHT MODE
                  </button>
                  <button
                    onClick={async () => {
                      setAddress(config.destination.walletAddress);
                      aarcModal.reset();
                      aarcModal.openModal();
                    }}
                  >
                    RESET
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </AarcEthWalletConnector>
    </QueryClientProvider>
  );
}

export default App;
