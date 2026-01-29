import { useState } from 'react'
import { useAccount, useChainId, useReadContract, useReadContracts } from 'wagmi'
import { formatEther } from 'viem'
import { FACTORY_ABI, OFT_ABI } from '../config/contracts'
import { FACTORY_ADDRESSES, CHAIN_NAMES, EXPLORER_URLS } from '../config/wagmi'

interface TokenInfo {
  tokenAddress: string
  name: string
  symbol: string
  initialSupply: bigint
  creator: string
  createdAt: bigint
}

export default function MyTokens() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [manualToken, setManualToken] = useState('')

  const factoryAddress = FACTORY_ADDRESSES[chainId]

  // Get tokens created by user
  const { data: userTokens, isLoading } = useReadContract({
    address: factoryAddress as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getTokensByCreator',
    args: address ? [address] : undefined,
    query: {
      enabled: !!factoryAddress && !!address,
    }
  })

  return (
    <div className="space-y-6">
      {/* Created Tokens Section */}
      <div className="gradient-border p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </span>
          My Tokens on {CHAIN_NAMES[chainId] || 'this network'}
        </h2>

        {!factoryAddress && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm">
              Factory not deployed on this network. Switch to a supported network.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {factoryAddress && !isLoading && (!userTokens || userTokens.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>You haven't created any tokens on this network yet.</p>
            <p className="text-sm mt-2">Go to "Create Token" to deploy your first OFT!</p>
          </div>
        )}

        {userTokens && userTokens.length > 0 && (
          <div className="space-y-3">
            {userTokens.map((tokenAddr: string) => (
              <TokenCard key={tokenAddr} address={tokenAddr} chainId={chainId} />
            ))}
          </div>
        )}
      </div>

      {/* Manual Token Lookup */}
      <div className="gradient-border p-8">
        <h3 className="text-xl font-bold mb-4">Look Up Token</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Enter token address..."
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors font-mono text-sm"
          />
        </div>
        {manualToken && manualToken.startsWith('0x') && manualToken.length === 42 && (
          <div className="mt-4">
            <TokenCard address={manualToken} chainId={chainId} />
          </div>
        )}
      </div>
    </div>
  )
}

function TokenCard({ address: tokenAddress, chainId }: { address: string; chainId: number }) {
  const { address: userAddress } = useAccount()
  const explorerUrl = EXPLORER_URLS[chainId] || 'https://sepolia.etherscan.io'

  const { data: results } = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'name',
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'symbol',
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'totalSupply',
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'balanceOf',
        args: userAddress ? [userAddress] : undefined,
      },
    ],
  })

  const name = results?.[0]?.result as string | undefined
  const symbol = results?.[1]?.result as string | undefined
  const totalSupply = results?.[2]?.result as bigint | undefined
  const balance = results?.[3]?.result as bigint | undefined

  if (!name && !symbol) {
    return (
      <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
        <p className="text-gray-400 text-sm">Loading token info...</p>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-lg">{name || 'Unknown'}</h4>
          <p className="text-purple-400 font-mono">{symbol || '???'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Your Balance</p>
          <p className="font-bold">{balance !== undefined ? formatEther(balance) : '...'}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Supply</span>
          <span>{totalSupply !== undefined ? formatEther(totalSupply) : '...'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Contract</span>
          <a 
            href={`${explorerUrl}/address/${tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-mono"
          >
            {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
          </a>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => navigator.clipboard.writeText(tokenAddress)}
          className="flex-1 py-2 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition-colors"
        >
          Copy Address
        </button>
        <a 
          href={`${explorerUrl}/token/${tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm text-center transition-colors"
        >
          View on Explorer
        </a>
      </div>
    </div>
  )
}
