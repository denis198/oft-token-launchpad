# OFT Token Launchpad — Инструкция по запуску

## 1. Установка зависимостей

```bash
cd "/Users/denispopov/Downloads/layer zero"
npm install
```

## 2. Настройка окружения

### 2.1 Создать `.env` для контрактов

```bash
cd contracts
cp .env.example .env
```

Заполнить `contracts/.env`:

```env
PRIVATE_KEY=ваш_приватный_ключ_без_0x
SEPOLIA_RPC_URL=https://rpc.sepolia.org
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ETHERSCAN_API_KEY=ваш_ключ_etherscan
```

### 2.2 WalletConnect Project ID

1. Зайти на https://cloud.walletconnect.com
2. Создать проект, скопировать Project ID
3. В файле `frontend/src/config/wagmi.ts` заменить `YOUR_WALLETCONNECT_PROJECT_ID`

## 3. Компиляция и тесты

```bash
cd contracts
npm run compile    # Компиляция контрактов
npm run test       # 26 тестов
```

## 4. Деплой на тестнет

Нужны тестовые ETH:
- Sepolia: https://www.alchemy.com/faucets/ethereum-sepolia
- Arbitrum Sepolia: https://www.alchemy.com/faucets/arbitrum-sepolia
- Base Sepolia: https://www.alchemy.com/faucets/base-sepolia

```bash
cd contracts
npm run deploy:sepolia
npm run deploy:mumbai              # опционально
npm run deploy:arbitrum-sepolia    # опционально
```

Скрипт выведет адрес фабрики — скопировать.

## 5. Обновить адреса во фронтенде

В `frontend/src/config/wagmi.ts` вставить адреса фабрик:

```typescript
export const FACTORY_ADDRESSES: Record<number, string> = {
  11155111: '0x...',  // Sepolia
  80001: '0x...',     // Mumbai
  421614: '0x...',    // Arbitrum Sepolia
  11155420: '0x...',  // Optimism Sepolia
  84532: '0x...',     // Base Sepolia
}
```

## 6. Запуск фронтенда

```bash
cd frontend
npm run dev
```

Открыть http://localhost:5173

## 7. Настройка кросс-чейн бриджа

Для бриджинга нужно задеплоить токен на двух сетях и связать их:

```bash
cd contracts

# 1) Создать токен на Sepolia
TOKEN_NAME="My Token" TOKEN_SYMBOL="MTK" INITIAL_SUPPLY=1000000 \
npx hardhat run scripts/createToken.ts --network sepolia
# Запомнить адрес: 0xAAA...

# 2) Создать токен на Arbitrum Sepolia (supply=0)
TOKEN_NAME="My Token" TOKEN_SYMBOL="MTK" INITIAL_SUPPLY=0 \
npx hardhat run scripts/createToken.ts --network arbitrumSepolia
# Запомнить адрес: 0xBBB...

# 3) Связать peer: Sepolia -> Arbitrum
TOKEN_ADDRESS=0xAAA PEER_NETWORK=arbitrumSepolia PEER_TOKEN_ADDRESS=0xBBB \
npx hardhat run scripts/setupPeers.ts --network sepolia

# 4) Связать peer: Arbitrum -> Sepolia
TOKEN_ADDRESS=0xBBB PEER_NETWORK=sepolia PEER_TOKEN_ADDRESS=0xAAA \
npx hardhat run scripts/setupPeers.ts --network arbitrumSepolia
```

## 8. Сборка для продакшена

```bash
cd frontend
npm run build
```

Файлы в `frontend/dist/`.

## Структура проекта

```
layer zero/
├── contracts/
│   ├── contracts/
│   │   ├── LaunchpadOFT.sol        — OFT-токен
│   │   ├── OFTFactory.sol          — Фабрика токенов
│   │   └── mocks/EndpointV2Mock.sol
│   ├── test/OFTFactory.test.ts     — 26 тестов
│   ├── scripts/
│   │   ├── deploy.ts
│   │   ├── createToken.ts
│   │   └── setupPeers.ts
│   └── hardhat.config.ts
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── config/wagmi.ts
│   │   ├── config/contracts.ts
│   │   └── components/
│   │       ├── CreateToken.tsx
│   │       ├── BridgeToken.tsx
│   │       ├── MyTokens.tsx
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   └── package.json
└── README.md
```

## Категории LayerZero

- **Best Use of OFT** ($2,000) — OFT launchpad
- **Best Use of LayerZero** ($3,000) — полный цикл деплоя и бриджинга через LayerZero V2
