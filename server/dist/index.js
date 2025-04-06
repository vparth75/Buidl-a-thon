"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Setup provider and wallet
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
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
const contract = new ethers_1.ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
// Get contract info
app.get("/contract/info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [owner, recipient, startTime, pingedLast] = yield Promise.all([
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get contract info", details: error.message });
    }
}));
// Set recipient
app.post("/contract/set-recipient", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipient } = req.body;
    if (!ethers_1.ethers.isAddress(recipient)) {
        res.status(400).json({ error: "Invalid recipient address" });
        return;
    }
    try {
        const tx = yield contract.setRecipient(recipient);
        yield tx.wait();
        res.json({ success: true, txHash: tx.hash });
    }
    catch (error) {
        console.error("Error setting recipient:", error);
        res.status(500).json({ error: "Failed to set recipient", details: error.message });
    }
}));
// Change recipient
app.post("/contract/change-recipient", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newRecipient } = req.body;
    if (!ethers_1.ethers.isAddress(newRecipient)) {
        res.status(400).json({ error: "Invalid recipient address" });
        return;
    }
    try {
        const tx = yield contract.changeRecipient(newRecipient);
        yield tx.wait();
        res.json({ success: true, txHash: tx.hash });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to change recipient", details: error.message });
    }
}));
// Ping contract
app.post("/contract/ping", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tx = yield contract.ping();
        yield tx.wait();
        res.json({ success: true, txHash: tx.hash });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to ping contract", details: error.message });
    }
}));
// Get deposit transaction
app.post("/contract/prepare-deposit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, from } = req.body;
    if (!amount) {
        res.status(400).json({ error: "Amount is required" });
        return;
    }
    if (!ethers_1.ethers.isAddress(from)) {
        res.status(400).json({ error: "Invalid from address" });
        return;
    }
    try {
        const amountInWei = ethers_1.ethers.parseEther(amount.toString());
        // Create the transaction
        const tx = {
            to: contract.target,
            value: amountInWei.toString(),
            data: contract.interface.encodeFunctionData("deposit"),
            chainId: 31337
        };
        res.json(tx);
    }
    catch (error) {
        console.error("Error preparing deposit:", error);
        res.status(500).json({
            error: "Failed to prepare deposit",
            details: error.message,
            reason: error.reason
        });
    }
}));
// Submit signed transaction
app.post("/contract/submit-signed-tx", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { signedTx } = req.body;
    if (!signedTx) {
        res.status(400).json({ error: "Signed transaction is required" });
        return;
    }
    try {
        const tx = yield provider.broadcastTransaction(signedTx);
        res.json({ success: true, txHash: tx.hash });
    }
    catch (error) {
        console.error("Error submitting transaction:", error);
        res.status(500).json({
            error: "Failed to submit transaction",
            details: error.message
        });
    }
}));
// Claim funds
app.post("/contract/claim", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tx = yield contract.claim();
        yield tx.wait();
        res.json({ success: true, txHash: tx.hash });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to claim funds", details: error.message });
    }
}));
// Trigger reminder
app.post("/contract/trigger-reminder", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tx = yield contract.triggerReminder();
        yield tx.wait();
        res.json({ success: true, txHash: tx.hash });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to trigger reminder", details: error.message });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
