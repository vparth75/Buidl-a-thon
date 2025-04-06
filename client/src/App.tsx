import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useWalletClient, useChainId } from "wagmi";
import { config } from "./utils/config";
import { parseEther } from "ethers";
import { switchChain } from "viem/actions";

// Create a separate component for the main content
function MainContent() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const fetchContractInfo = async () => {
    try {
      const response = await fetch("http://localhost:3000/contract/info");
      const data = await response.json();
      setContractInfo(data);
    } catch (error) {
      console.error("Error fetching contract info:", error);
      setError("Failed to fetch contract info");
    }
  };

  const setRecipientAddress = async () => {
    if (!recipient) {
      setError("Please enter a recipient address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/contract/set-recipient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setError("");
        await fetchContractInfo();
      }
    } catch (error) {
      console.error("Error setting recipient:", error);
      setError("Failed to set recipient");
    }
    setLoading(false);
  };

  const depositEth = async () => {
    if (!amount) {
      setError("Please enter an amount");
      return;
    }

    if (!walletClient || !address) {
      setError("Please connect your wallet");
      return;
    }

    // Check network
    if (chainId !== 31337) {  // Changed from 11155111
      try {
        await walletClient.switchChain({ id: 31337 })  // Changed from 11155111
      } catch (error) {
        setError("Please switch to Local Anvil network in your wallet")  // Updated message
        return;
      }
    }

    setLoading(true);
    try {
      // Get transaction data from backend
      const prepareResponse = await fetch("http://localhost:3000/contract/prepare-deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          from: address
        }),
      });

      const txData = await prepareResponse.json();
      if (txData.error) {
        throw new Error(txData.error);
      }

      // Send transaction through wallet
      const hash = await walletClient.sendTransaction({
        to: txData.to as `0x${string}`,
        value: BigInt(txData.value),
        data: txData.data as `0x${string}`,
        chainId: 31337  // Changed from 11155111
      });

      console.log("Transaction sent:", hash);
      setError("");
      await fetchContractInfo();
    } catch (error: any) {
      console.error("Error depositing ETH:", error);
      setError(error.shortMessage || error.message || "Failed to deposit ETH");
    }
    setLoading(false);
  };

  const pingContract = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/contract/ping", {
        method: "POST",
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setError("");
        await fetchContractInfo();
      }
    } catch (error) {
      console.error("Error pinging contract:", error);
      setError("Failed to ping contract");
    }
    setLoading(false);
  };

  const claimFunds = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/contract/claim", {
        method: "POST",
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setError("");
        await fetchContractInfo();
      }
    } catch (error) {
      console.error("Error claiming funds:", error);
      setError("Failed to claim funds");
    }
    setLoading(false);
  };

  return (
    <div className="text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Will Contract Interface</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contract Info Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
            {contractInfo ? (
              <div className="space-y-2">
                <p>Owner: {contractInfo.owner}</p>
                <p>Recipient: {contractInfo.recipient}</p>
                <p>Start Time: {new Date(Number(contractInfo.startTime) * 1000).toLocaleString()}</p>
                <p>Last Ping: {new Date(Number(contractInfo.pingedLast) * 1000).toLocaleString()}</p>
              </div>
            ) : (
              <button
                onClick={fetchContractInfo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Load Contract Info
              </button>
            )}
          </div>

          {/* Actions Section */}
          <div className="space-y-6">
            {/* Set Recipient */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Set Recipient</h2>
              <input
                className="w-full bg-gray-700 text-white p-2 rounded mb-2"
                placeholder="Enter recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <button
                onClick={setRecipientAddress}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                {loading ? "Processing..." : "Set Recipient"}
              </button>
            </div>

            {/* Deposit ETH */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Deposit ETH</h2>
              <input
                className="w-full bg-gray-700 text-white p-2 rounded mb-2"
                placeholder="Enter amount in ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={depositEth}
                disabled={loading || !walletClient}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                {loading ? "Processing..." : "Deposit"}
              </button>
            </div>

            {/* Ping Contract */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Ping Contract</h2>
              <button
                onClick={pingContract}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                {loading ? "Processing..." : "Ping"}
              </button>
            </div>

            {/* Claim Funds */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Claim Funds</h2>
              <button
                onClick={claimFunds}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                {loading ? "Processing..." : "Claim"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App component that provides the providers
function App() {
  const client = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <div className="bg-black min-h-screen">
          <div className="bg-white">
            <ConnectWallet />
          </div>
          <MainContent />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
