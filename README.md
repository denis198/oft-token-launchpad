# OFT Token Launchpad

A cross-chain token launchpad powered by **LayerZero V2**. Create and deploy OFT (Omnichain Fungible Token) tokens that can be bridged seamlessly across multiple blockchains.

## Features

- **Create OFT Tokens**: Deploy cross-chain compatible tokens with a simple UI
- **Bridge Tokens**: Transfer tokens between supported chains using LayerZero
- **Multi-chain Support**: Deploy on Sepolia, Mumbai, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia
- **Modern UI**: Beautiful React frontend with RainbowKit wallet connection

## Project Structure

```
oft-token-launchpad/
├── contracts/               # Solidity smart contracts
│   ├── contracts/
│   │   ├── LaunchpadOFT.sol    # OFT token implementation
│   │   └── OFTFactory.sol      # Factory for deploying tokens
│   ├── scripts/
│   │   ├── deploy.ts           # Deploy factory contract
│   │   ├── createToken.ts      # Create new token via factory
│   │   └── setupPeers.ts       # Configure cross-chain peers
│   └── hardhat.config.ts
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── config/             # Wagmi & contract configs
│   │   └── App.tsx
│   └── package.json
│
└── package.json             # Root package (workspaces)
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or another Web3 wallet
- Testnet ETH (Sepolia, etc.)

### Installation

```bash
# Clone and install dependencies
cd "layer zero"
npm install

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. Copy the environment file:
```bash
cd contracts
cp .env.example .env
```

2. Add your private key and RPC URLs to `.env`:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

3. Get a WalletConnect Project ID from [https://cloud.walletconnect.com](https://cloud.walletconnect.com) and update `frontend/src/config/wagmi.ts`

### Deploy Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Deploy to other networks
npm run deploy:mumbai
npm run deploy:arbitrum-sepolia
```

After deployment, update `FACTORY_ADDRESSES` in `frontend/src/config/wagmi.ts` with your deployed addresses.

### Run Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage Guide

### Creating a Token

1. Connect your wallet
2. Go to "Create Token" tab
3. Enter token name, symbol, and initial supply
4. Click "Create Token" and confirm the transaction
5. Your OFT token is now deployed!

### Setting Up Cross-Chain

To enable bridging, you need to deploy the same token on multiple chains and set up peer connections:

1. **Deploy on Chain A** (e.g., Sepolia):
```bash
TOKEN_NAME="My Token" TOKEN_SYMBOL="MTK" INITIAL_SUPPLY=1000000 \
npx hardhat run scripts/createToken.ts --network sepolia
# Note the token address: 0xAAA...
```

2. **Deploy on Chain B** (e.g., Mumbai):
```bash
TOKEN_NAME="My Token" TOKEN_SYMBOL="MTK" INITIAL_SUPPLY=0 \
npx hardhat run scripts/createToken.ts --network mumbai
# Note the token address: 0xBBB...
```

3. **Set up peers** (both directions):
```bash
# On Sepolia, point to Mumbai
TOKEN_ADDRESS=0xAAA PEER_NETWORK=mumbai PEER_TOKEN_ADDRESS=0xBBB \
npx hardhat run scripts/setupPeers.ts --network sepolia

# On Mumbai, point to Sepolia
TOKEN_ADDRESS=0xBBB PEER_NETWORK=sepolia PEER_TOKEN_ADDRESS=0xAAA \
npx hardhat run scripts/setupPeers.ts --network mumbai
```

### Bridging Tokens

1. Go to "Bridge" tab in the UI
2. Enter your OFT token address
3. Select destination chain
4. Enter amount to bridge
5. Click "Bridge Tokens" and confirm
6. Track your transfer on [LayerZero Scan](https://layerzeroscan.com)

## Supported Networks (Testnet)

| Network | Chain ID | LayerZero EID |
|---------|----------|---------------|
| Sepolia | 11155111 | 40161 |
| Mumbai | 80001 | 40109 |
| Arbitrum Sepolia | 421614 | 40231 |
| Optimism Sepolia | 11155420 | 40232 |
| Base Sepolia | 84532 | 40245 |

## Smart Contract Architecture

### LaunchpadOFT.sol

Extends LayerZero's OFT standard with additional metadata:
- `initialSupply`: Tracks initial mint amount
- `createdAt`: Timestamp of deployment
- `creator`: Address that deployed the token

### OFTFactory.sol

Factory pattern for deploying OFT tokens:
- `createToken()`: Deploy a new OFT token
- `getTokensByCreator()`: List tokens by creator
- `getDeployedTokens()`: Paginated list of all tokens
- Emits `TokenCreated` event for tracking

## Hackathon Categories

This project is suitable for:

- **Best Use of OFT** ($2,000): Native OFT implementation with launchpad functionality
- **Best Use of LayerZero** ($3,000): Full cross-chain token deployment and bridging

## Resources

- [LayerZero Documentation](https://docs.layerzero.network/v2)
- [OFT Standard](https://docs.layerzero.network/v2/developers/evm/oft/quickstart)
- [LayerZero Scan](https://layerzeroscan.com)
- [Testnet Faucets](https://www.alchemy.com/faucets)

## License

MIT
