import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
} from "wagmi";
import { useState, useEffect, useRef } from "react";

export default function ConnectWallet() {
  const { address } = useAccount();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  const [showConnectPopup, setShowConnectPopup] = useState(false);
  const [showDisconnectPopup, setShowDisconnectPopup] = useState(false);
  const [connectedWalletIcon, setConnectedWalletIcon] = useState("");

  const connectRef = useRef<HTMLDivElement>(null);
  const disconnectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        connectRef.current &&
        !connectRef.current.contains(event.target as Node)
      ) {
        setShowConnectPopup(false);
      }
      if (
        disconnectRef.current &&
        !disconnectRef.current.contains(event.target as Node)
      ) {
        setShowDisconnectPopup(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-black flex justify-end pr-4 py-4">
      {address ? (
        <div className="relative inline-block" ref={disconnectRef}>
          <button
            onClick={() => setShowDisconnectPopup((prev) => !prev)}
            className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 border border-white"
          >
            {connectedWalletIcon && (
              <img
                src={connectedWalletIcon}
                alt="wallet icon"
                className="w-4 h-4"
              />
            )}
            {address.slice(0, 8)}
          </button>

          {showDisconnectPopup && (
            <div className="absolute mt-2 right-0 bg-black text-white border border-white rounded-md p-4 z-10 w-48">
              <p className="mb-2">Disconnect Wallet?</p>
              <button
                onClick={() => {
                  disconnect();
                  setShowDisconnectPopup(false);
                }}
                className="bg-red-600 hover:bg-red-700 w-full text-white py-1 rounded-md"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative inline-block" ref={connectRef}>
          <button
            onClick={() => setShowConnectPopup((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Connect Wallet
          </button>

          {showConnectPopup && (
            <div className="absolute mt-2 right-0 bg-black text-white border border-white rounded-md p-4 z-10 w-60">
              <div className="flex flex-col gap-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      if (connector.icon) {
                        setConnectedWalletIcon(connector.icon.toString());
                      }
                      connect({ connector });
                      setShowConnectPopup(false);
                    }}
                    className="bg-black hover:bg-gray-800 text-white px-3 py-1 rounded-md flex items-center gap-2 border border-white"
                  >
                    {connector.icon && (
                      <img
                        src={connector.icon.toString()}
                        alt="wallet"
                        className="w-4 h-4"
                      />
                    )}
                    {connector.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
