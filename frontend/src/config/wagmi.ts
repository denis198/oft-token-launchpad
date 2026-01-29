import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { 
  sepolia, 
  arbitrumSepolia, 
  optimismSepolia,
  baseSepolia,
  polygonMumbai,
} from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'OFT Token Launchpad',
  projectId: 'e68684b701ce6e8f5cde4fecd92239c8',
  chains: [sepolia, arbitrumSepolia, optimismSepolia, baseSepolia, polygonMumbai],
  ssr: false,
})

// LayerZero Endpoint IDs for each chain
export const LZ_EID: Record<number, number> = {
  11155111: 40161,  // Sepolia
  80001: 40109,     // Mumbai
  421614: 40231,    // Arbitrum Sepolia
  11155420: 40232,  // Optimism Sepolia
  84532: 40245,     // Base Sepolia
}

// Chain names for display
export const CHAIN_NAMES: Record<number, string> = {
  11155111: 'Sepolia',
  80001: 'Mumbai',
  421614: 'Arbitrum Sepolia',
  11155420: 'Optimism Sepolia',
  84532: 'Base Sepolia',
}

// Block explorer URLs per chain
export const EXPLORER_URLS: Record<number, string> = {
  11155111: 'https://sepolia.etherscan.io',
  80001: 'https://mumbai.polygonscan.com',
  421614: 'https://sepolia.arbiscan.io',
  11155420: 'https://sepolia-optimism.etherscan.io',
  84532: 'https://sepolia.basescan.org',
}

// Factory addresses (update after deployment)
export const FACTORY_ADDRESSES: Record<number, string> = {
  11155111: '0xfE955CC21241aB7bdE6B3406794F481646048CC0', // Sepolia
  80001: '',    // Mumbai
  421614: '',   // Arbitrum Sepolia
  11155420: '', // Optimism Sepolia
  84532: '',    // Base Sepolia
}
