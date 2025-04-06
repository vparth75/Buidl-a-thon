import express, { Request, Response } from "express";
import { ethers } from "ethers";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Contract setup
const contractABI = [
  "function setRecipient(address _recipient) external",
  "function changeRecipient(address newRecipient) external",
  "function ping() external",
  "function deposit() external payable",
  "function claim() external",
  "function triggerReminder() external",
  "function owner() public view returns (address)",
  "function recipient() public view returns (address)",
  "function startTime() public view returns (uint256)",
  "function pingedLast() public view returns (uint256)",
  "event remindUser(address indexed user)"
];

// Create contract instance with signer
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  contractABI,
  wallet
);

// Get contract info
app.get("/contract/info", async (req: Request, res: Response) => {
  try {
    const [owner, recipient, startTime, pingedLast] = await Promise.all([
      contract.owner(),
      contract.recipient(),
      contract.startTime(),
      contract.pingedLast()
    ]);
    
    res.json({
      owner,
      recipient,
      startTime: startTime.toString(),
      pingedLast: pingedLast.toString()
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get contract info", details: error.message });
  }
});

// Set recipient
app.post("/contract/set-recipient", async (req: Request, res: Response) => {
  const { recipient } = req.body;

  if (!ethers.isAddress(recipient)) {
    res.status(400).json({ error: "Invalid recipient address" });
    return;
  }

  try {
    const tx = await contract.setRecipient(recipient);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    console.error("Error setting recipient:", error);
    res.status(500).json({ error: "Failed to set recipient", details: error.message });
  }
});

// Change recipient
app.post("/contract/change-recipient", async (req: Request, res: Response) => {
  const { newRecipient } = req.body;

  if (!ethers.isAddress(newRecipient)) {
    res.status(400).json({ error: "Invalid recipient address" });
    return;
  }

  try {
    const tx = await contract.changeRecipient(newRecipient);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to change recipient", details: error.message });
  }
});

// Ping contract
app.post("/contract/ping", async (req: Request, res: Response) => {
  try {
    const tx = await contract.ping();
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to ping contract", details: error.message });
  }
});

// Get deposit transaction
app.post("/contract/prepare-deposit", async (req: Request, res: Response) => {
  const { amount, from } = req.body;

  if (!amount) {
    res.status(400).json({ error: "Amount is required" });
    return;
  }

  if (!ethers.isAddress(from)) {
    res.status(400).json({ error: "Invalid from address" });
    return;
  }

  try {
    const amountInWei = ethers.parseEther(amount.toString());
    
    // Create the transaction
    const tx = {
      to: contract.target,
      value: amountInWei.toString(),
      data: contract.interface.encodeFunctionData("deposit"),
      chainId: 31337
    };

    res.json(tx);
  } catch (error: any) {
    console.error("Error preparing deposit:", error);
    res.status(500).json({ 
      error: "Failed to prepare deposit", 
      details: error.message,
      reason: error.reason
    });
  }
});

app.post("/contract/submit-signed-tx", async (req: Request, res: Response) => {
  const { signedTx } = req.body;

  if (!signedTx) {
    res.status(400).json({ error: "Signed transaction is required" });
    return;
  }

  try {
    const tx = await provider.broadcastTransaction(signedTx);
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    console.error("Error submitting transaction:", error);
    res.status(500).json({ 
      error: "Failed to submit transaction", 
      details: error.message
    });
  }
});

// Claim funds
app.post("/contract/claim", async (req: Request, res: Response) => {
  try {
    const tx = await contract.claim();
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to claim funds", details: error.message });
  }
});

// Trigger reminder
app.post("/contract/trigger-reminder", async (req: Request, res: Response) => {
  try {
    const tx = await contract.triggerReminder();
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to trigger reminder", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});