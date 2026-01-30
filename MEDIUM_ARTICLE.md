# Building an OFT Token Launchpad with LayerZero V2: A Complete Developer Guide

*How I built a no-code cross-chain token launchpad using LayerZero's OFT standard — from smart contracts to a live frontend.*

---

## Introduction

Cross-chain tokens are the future of DeFi, but deploying them is still painful. You need deep Solidity knowledge, manual contract configuration for each chain, and complex peer setup. I wanted to change that.

I built **OFT Token Launchpad** — a web application that lets anyone create a cross-chain token with a single click, then bridge it to any supported network through LayerZero V2.

**Live demo:** [https://frontend-pi-henna-62.vercel.app](https://frontend-pi-henna-62.vercel.app)
**Source code:** [https://github.com/denis198/oft-token-launchpad](https://github.com/denis198/oft-token-launchpad)

---

## Why LayerZero OFT?

LayerZero's **Omnichain Fungible Token (OFT)** standard solves a fundamental problem: how do you create a token that natively exists on multiple blockchains without wrappers or bridges?

Traditional bridged tokens use lock-and-mint mechanisms, creating wrapped versions (like WETH) that fragment liquidity. OFT tokens are different — they use LayerZero messaging to burn tokens on the source chain and mint on the destination chain. The token is native everywhere.

This makes OFT perfect for:
- **Community tokens** that need to exist on multiple chains
- **Governance tokens** for cross-chain DAOs
- **Utility tokens** for multi-chain protocols

---

## Architecture Overview

The project has three layers:

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│    RainbowKit + Wagmi + TailwindCSS     │
├─────────────────────────────────────────┤
│          Smart Contracts                │
│   OFTFactory.sol → LaunchpadOFT.sol     │
├─────────────────────────────────────────┤
│       LayerZero V2 Protocol             │
│    Endpoint V2 → Cross-chain Messaging  │
└─────────────────────────────────────────┘
```

### Smart Contracts

**OFTFactory.sol** — The factory contract that handles all token deployments:

```solidity
function createToken(
    string memory _name,
    string memory _symbol,
    uint256 _initialSupply
) external returns (address)
```

Every token created through the factory is automatically tracked on-chain. The factory stores:
- Token address
- Creator address
- Name, symbol, initial supply
- Creation timestamp

It also supports pagination for listing all deployed tokens and filtering by creator — essential for the frontend dashboard.

**LaunchpadOFT.sol** — Each token inherits from LayerZero's OFT contract:

```solidity
contract LaunchpadOFT is OFT {
    uint256 public immutable initialSupply;
    uint256 public immutable createdAt;
    address public immutable creator;

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate,
        uint256 _initialSupply,
        address _creator
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {
        initialSupply = _initialSupply;
        createdAt = block.timestamp;
        creator = _creator;
        if (_initialSupply > 0) {
            _mint(_creator, _initialSupply);
        }
    }
}
```

Key design decisions:
- Metadata is stored as `immutable` — gas efficient and permanently on-chain
- The creator receives the initial supply, not the factory
- Zero initial supply is supported for chains where tokens should only arrive via bridge

---

## How Cross-Chain Bridging Works

This is where LayerZero shines. Here's the flow when a user bridges tokens:

1. **User initiates bridge** on the frontend → calls `OFT.send()` on the source chain
2. **Tokens are burned** on the source chain
3. **LayerZero Endpoint** picks up the message and routes it through DVNs (Decentralized Verifier Networks)
4. **Message arrives** at the destination chain's Endpoint
5. **Tokens are minted** to the recipient on the destination chain

Before sending, the UI calls `quoteSend()` to get the exact native fee, so users know exactly what they'll pay.

For bridging to work, tokens on different chains need to be **peered** — this is a one-time setup where each token contract stores the address of its counterpart on other chains:

```bash
# On Sepolia: point to Arbitrum Sepolia counterpart
token.setPeer(arbSepoliaEid, bytes32(arbTokenAddress))

# On Arbitrum Sepolia: point to Sepolia counterpart
token.setPeer(sepoliaEid, bytes32(sepoliaTokenAddress))
```

---

## Frontend: Making It User-Friendly

The frontend is built with React, Vite, and TailwindCSS. Wallet connection is handled by RainbowKit, which provides a clean multi-wallet UI out of the box.

### Three Main Views

**1. Create Token**

A simple form: enter name, symbol, and initial supply. One click deploys the token through the factory. The UI shows wallet confirmation state and links to the block explorer on success.

[INSERT SCREENSHOT: Create Token form]

**2. Bridge Tokens**

Select your token, choose a destination chain, enter an amount. The UI automatically quotes the LayerZero fee and handles the `send()` call. After submission, users get a link to track the transfer on LayerZero Scan.

[INSERT SCREENSHOT: Bridge interface]

**3. My Tokens**

Dashboard showing all tokens created by the connected wallet, with balances and links to the block explorer. Supports manual token lookup by address.

[INSERT SCREENSHOT: My Tokens dashboard]

### Dynamic Chain Support

The frontend adapts to whichever network the user is connected to. Block explorer links dynamically switch between Etherscan, Arbiscan, BaseScan, etc.

---

## Testing

I wrote 26 Hardhat tests covering:

- Factory deployment and validation (zero address rejection)
- Token creation with event emission
- Creator-based token tracking
- Pagination (partial pages, out-of-bounds offsets, oversized limits)
- Delegate functionality for custom LZ configuration
- Full ERC-20 operations (transfer, balance, supply)
- Edge case: zero initial supply

```
OFTFactory
  Deployment
    ✔ should set the correct LZ endpoint
    ✔ should revert with zero address endpoint
    ✔ should start with zero deployed tokens
  createToken
    ✔ should create a token and emit event
    ✔ should track the created token
    ✔ should assign tokens to creator
    ...
LaunchpadOFT
    ✔ should set correct name and symbol
    ✔ should mint initial supply to creator
    ✔ should support ERC20 transfers
    ...

26 passing
```

Testing LayerZero contracts locally required creating an `EndpointV2Mock` — a minimal mock of the LayerZero Endpoint that implements the interface stubs needed for OFT deployment.

---

## Supported Networks

The launchpad currently supports 5 testnet networks:

| Network | Chain ID | LZ EID |
|---------|----------|--------|
| Sepolia | 11155111 | 40161 |
| Mumbai | 80001 | 40109 |
| Arbitrum Sepolia | 421614 | 40231 |
| Optimism Sepolia | 11155420 | 40232 |
| Base Sepolia | 84532 | 40245 |

Adding a new network is straightforward — just add the chain config and deploy the factory.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contracts | Solidity 0.8.22, Hardhat |
| Standards | LayerZero OFT (V2), OpenZeppelin |
| Frontend | React 18, TypeScript, Vite |
| Styling | TailwindCSS with custom animations |
| Wallet | RainbowKit, Wagmi 2, Viem |
| Testing | Hardhat + Chai |
| Deployment | Vercel (frontend), Sepolia (contracts) |

---

## What I Learned

1. **OFT is simpler than expected.** The LayerZero OFT contract handles all the cross-chain messaging complexity. You just inherit and deploy.

2. **Factory pattern is essential.** Without a factory, each user would need to deploy contracts manually. The factory makes token creation a single transaction.

3. **Peer setup is the tricky part.** The actual cross-chain connection requires deploying the same token on multiple chains and calling `setPeer()` on each. Automating this is the next step.

4. **Mock contracts are necessary for testing.** LayerZero's Endpoint is complex, so you need a mock to run local tests. I built a minimal `EndpointV2Mock` that implements just enough of the interface.

---

## What's Next

- **Mainnet deployment** — move from testnets to Ethereum, Arbitrum, Base, Optimism
- **Automated peer setup** — one-click multi-chain deployment with automatic peer configuration
- **Token metadata** — add logo upload and description stored on IPFS
- **Token discovery** — public registry of all launchpad tokens with search and filtering

---

## Try It Out

- **Live app:** [https://frontend-pi-henna-62.vercel.app](https://frontend-pi-henna-62.vercel.app)
- **GitHub:** [https://github.com/denis198/oft-token-launchpad](https://github.com/denis198/oft-token-launchpad)
- **LayerZero Docs:** [https://docs.layerzero.network/v2](https://docs.layerzero.network/v2)

Connect your wallet on Sepolia testnet and create your first cross-chain token in under a minute.

---

*Built with LayerZero V2. If you have questions or want to contribute, open an issue on GitHub.*
