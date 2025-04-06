# Inheritance Smart Contract Project

A decentralized application that allows users to create a digital will, where funds can be claimed by a designated recipient after a period of inactivity.

## Project Structure

```
inheritance/
├── client/           # React frontend application
├── server/           # Express backend server
└── SmartContract/    # Solidity smart contracts
```

## Prerequisites

- Node.js (v18 or higher)
- Foundry (for smart contract development)
- MetaMask (or any Web3 wallet)
- Anvil (local Ethereum node)

## Setup Instructions

### 1. Smart Contract Setup

```bash
cd SmartContract
forge install
forge build
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

## Smart Contract Features

The smart contract (`Contract.sol`) implements the following features:

1. **Owner Management**
   - Set and change recipient address
   - Deposit ETH
   - Ping the contract to show activity

2. **Recipient Features**
   - Claim funds after 10 seconds of inactivity
   - View contract status

3. **Security Features**
   - Only owner can deposit and set recipient
   - Only recipient can claim funds
   - Inactivity timer for fund claiming

## API Endpoints

### Backend Server (Port 3000)

1. **Contract Info**
   - `GET /contract/info` - Get contract details

2. **Owner Actions**
   - `POST /contract/set-recipient` - Set recipient address
   - `POST /contract/change-recipient` - Change recipient address
   - `POST /contract/ping` - Ping the contract
   - `POST /contract/prepare-deposit` - Prepare ETH deposit transaction

3. **Recipient Actions**
   - `POST /contract/claim` - Claim funds

## Frontend Features

1. **Wallet Connection**
   - Connect MetaMask wallet
   - Switch to local Anvil network

2. **Contract Interaction**
   - View contract information
   - Set/change recipient
   - Deposit ETH
   - Ping contract
   - Claim funds

## Development Workflow

1. Start local Anvil node:
```bash
anvil
```

2. Deploy contract:
```bash
cd SmartContract
forge create src/Contract.sol:Will --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

3. Update contract address in server's `.env`

4. Start backend server:
```bash
cd server
npm run dev
```

5. Start frontend:
```bash
cd client
npm run dev
```

## Testing

### Smart Contract Tests
```bash
cd SmartContract
forge test
```

### Frontend Testing
```bash
cd client
npm test
```

## Security Considerations

1. **Private Keys**
   - Never commit private keys to version control
   - Use environment variables for sensitive data
   - Use test accounts for development

2. **Contract Security**
   - All functions have proper access control
   - Time-based checks for fund claiming
   - Reentrancy protection

3. **Frontend Security**
   - Input validation for all user inputs
   - Proper error handling
   - Secure wallet connection

## Troubleshooting

1. **MetaMask Connection Issues**
   - Ensure MetaMask is installed
   - Add local Anvil network (Chain ID: 31337)
   - Check if wallet is connected

2. **Transaction Failures**
   - Check if you have enough ETH
   - Verify network connection
   - Check contract address

3. **Backend Issues**
   - Verify RPC URL in `.env`
   - Check contract address
   - Ensure Anvil node is running

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
