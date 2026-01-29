# OFT Token Launchpad

## One-liner

A no-code launchpad for creating and bridging cross-chain tokens powered by LayerZero V2 OFT standard.

## Problem

Deploying cross-chain tokens today requires deep Solidity knowledge, manual contract configuration, and complex peer setup across multiple networks. There is no simple tool for creators and communities to launch omnichain tokens.

## Solution

OFT Token Launchpad lets anyone deploy an OFT-compatible token on any supported chain with a single click, then bridge it seamlessly to other networks through LayerZero messaging — all from a modern web UI.

## Key Features

- **One-Click Token Creation** — Deploy a fully functional OFT token via a factory contract. No Solidity needed.
- **Cross-Chain Bridging** — Transfer tokens between chains using LayerZero V2 with real-time fee estimation.
- **Token Dashboard** — View all created tokens, balances, and contract links per network.
- **Multi-Chain Support** — Sepolia, Mumbai, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia.
- **Factory Pattern** — All tokens are tracked on-chain: by creator, with pagination, and event indexing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.22, Hardhat, OpenZeppelin |
| Cross-Chain | LayerZero V2 Endpoint, OFT Standard |
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Wallet | RainbowKit, Wagmi 2, Viem |
| Testing | Hardhat + Chai (26 tests) |

## Architecture

```
User → Frontend (React) → Wagmi/Viem → Smart Contracts
                                            │
                                      OFTFactory.sol
                                            │
                                      LaunchpadOFT.sol
                                            │
                                   LayerZero Endpoint V2
                                            │
                                    Cross-Chain Message
                                            │
                                   Destination Chain OFT
```

### Smart Contracts

**OFTFactory.sol** — Factory that deploys OFT tokens and tracks all deployments on-chain:
- `createToken(name, symbol, initialSupply)` — deploy a new OFT
- `createTokenWithDelegate(name, symbol, initialSupply, delegate)` — deploy with custom LZ delegate
- `getTokensByCreator(address)` — list tokens by creator
- `getDeployedTokens(offset, limit)` — paginated listing
- `isFactoryToken(address)` — verify factory origin

**LaunchpadOFT.sol** — OFT token with metadata:
- Inherits LayerZero OFT for native cross-chain transfers
- Stores `creator`, `createdAt`, `initialSupply` as immutables
- 18 decimals, standard ERC-20 interface

### Frontend

Three main views:
1. **Create Token** — form with name, symbol, supply; deploys via factory
2. **Bridge** — select token, destination chain, amount; quotes fee and sends via LZ
3. **My Tokens** — lists user's tokens with balances and explorer links

## How LayerZero Is Used

1. **OFT Standard** — every token created through the launchpad is a native LayerZero OFT, not a wrapper
2. **Endpoint V2** — factory passes the chain's LZ Endpoint to each token at deployment
3. **Peer Connections** — tokens on different chains are linked via `setPeer()` for bidirectional messaging
4. **Cross-Chain Send** — bridging calls OFT's `send()` which uses LayerZero messaging under the hood
5. **Fee Quoting** — UI calls `quoteSend()` to show users the exact native fee before bridging

## Test Coverage

26 tests covering:
- Factory deployment and validation
- Token creation and event emission
- Creator tracking and token separation
- Pagination (edge cases: offset beyond range, partial pages)
- Delegate functionality
- OFT metadata and ERC-20 operations
- Zero supply edge case

## Bounty Categories

### Best Use of OFT ($2,000)
Native OFT implementation with a full launchpad UX — tokens are OFTs from birth, not adapters or wrappers.

### Best Use of LayerZero ($3,000)
End-to-end LayerZero V2 integration: Endpoint V2, OFT standard, peer setup, cross-chain messaging, fee quoting — all accessible through a polished UI.

## Demo Flow

1. Connect wallet (MetaMask via RainbowKit)
2. Create token on Sepolia — "MyToken", "MTK", 1,000,000 supply
3. View token in "My Tokens" tab with balance and explorer link
4. Set up peers between Sepolia and Arbitrum Sepolia
5. Bridge 1,000 MTK from Sepolia to Arbitrum Sepolia
6. Track transfer on LayerZero Scan

## Links

- [LayerZero Docs](https://docs.layerzero.network/v2)
- [OFT Standard](https://docs.layerzero.network/v2/developers/evm/oft/quickstart)
- [LayerZero Scan](https://layerzeroscan.com)
