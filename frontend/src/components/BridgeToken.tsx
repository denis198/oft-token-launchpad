import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from 'wagmi'
import { parseEther, formatEther, pad } from 'viem'
import toast from 'react-hot-toast'
import { OFT_ABI } from '../config/contracts'
import { CHAIN_NAMES } from '../config/wagmi'

const SUPPORTED_CHAINS = [
  { id: 11155111, name: 'Sepolia', eid: 40161 },
  { id: 80001, name: 'Mumbai', eid: 40109 },
  { id: 421614, name: 'Arbitrum Sepolia', eid: 40231 },
  { id: 11155420, name: 'Optimism Sepolia', eid: 40232 },
  { id: 84532, name: 'Base Sepolia', eid: 40245 },
]

export default function BridgeToken() {
  const { address } = useAccount()
  const chainId = useChainId()
  
  const [tokenAddress, setTokenAddress] = useState('')
  const [destChainId, setDestChainId] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  const destChain = SUPPORTED_CHAINS.find(c => c.id === destChainId)

  // Read token balance
  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: OFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!tokenAddress && !!address,
    }
  })

  // Read token symbol
  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: OFT_ABI,
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress,
    }
  })

  // Check if peer is configured for destination chain
  const { data: peerBytes } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: OFT_ABI,
    functionName: 'peers',
    args: destChain ? [destChain.eid] : undefined,
    query: {
      enabled: !!tokenAddress && !!destChain,
    }
  })

  const hasPeer = peerBytes && peerBytes !== '0x0000000000000000000000000000000000000000000000000000000000000000'

  // Quote send fee (only if peer is configured)
  const { data: quoteFee, error: quoteError } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: OFT_ABI,
    functionName: 'quoteSend',
    args: destChain && amount ? [
      {
        dstEid: destChain.eid,
        to: pad((recipient || address || '0x0') as `0x${string}`, { size: 32 }),
        amountLD: parseEther(amount || '0'),
        minAmountLD: parseEther(amount || '0'),
        extraOptions: '0x' as `0x${string}`,
        composeMsg: '0x' as `0x${string}`,
        oftCmd: '0x' as `0x${string}`,
      },
      false,
    ] : undefined,
    query: {
      enabled: !!tokenAddress && !!destChain && !!amount && parseFloat(amount) > 0 && !!hasPeer,
    }
  })

  const [txComplete, setTxComplete] = useState(false)
  const [completedHash, setCompletedHash] = useState<string>()

  const { writeContract, data: hash, isPending, reset } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  if (isSuccess && !txComplete) {
    setTxComplete(true)
    setCompletedHash(hash)
  }

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tokenAddress || !destChain || !amount) {
      toast.error('Please fill in all fields')
      return
    }

    if (!hasPeer) {
      toast.error(`No peer configured for ${destChain.name}. Deploy token on ${destChain.name} and run setPeer() first.`)
      return
    }

    if (!quoteFee) {
      toast.error('Unable to quote fee. Check that peers are configured correctly.')
      return
    }

    const recipientAddr = recipient || address
    if (!recipientAddr) {
      toast.error('No recipient address')
      return
    }

    try {
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: OFT_ABI,
        functionName: 'send',
        args: [
          {
            dstEid: destChain.eid,
            to: pad(recipientAddr as `0x${string}`, { size: 32 }),
            amountLD: parseEther(amount),
            minAmountLD: parseEther(amount),
            extraOptions: '0x' as `0x${string}`,
            composeMsg: '0x' as `0x${string}`,
            oftCmd: '0x' as `0x${string}`,
          },
          {
            nativeFee: quoteFee.nativeFee,
            lzTokenFee: BigInt(0),
          },
          recipientAddr as `0x${string}`,
        ],
        value: quoteFee.nativeFee,
      })
      toast.success('Bridge transaction submitted!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to bridge tokens')
    }
  }

  if (txComplete) {
    return (
      <div className="gradient-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">Bridge Initiated!</h3>
        <p className="text-gray-400 mb-4">
          Your tokens are being bridged to {destChain?.name}.
          This may take a few minutes.
        </p>
        <a
          href={`https://layerzeroscan.com/tx/${completedHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline"
        >
          Track on LayerZero Scan
        </a>
        <button
          onClick={() => {
            setTxComplete(false)
            setCompletedHash(undefined)
            setTokenAddress('')
            setDestChainId('')
            setAmount('')
            setRecipient('')
            reset()
          }}
          className="block mx-auto mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Bridge More
        </button>
      </div>
    )
  }

  return (
    <div className="gradient-border p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </span>
        Bridge Tokens
      </h2>

      <form onSubmit={handleBridge} className="space-y-6">
        {/* Token Address */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            OFT Token Address
          </label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors font-mono text-sm"
          />
          {balance !== undefined && symbol && (
            <p className="text-xs text-gray-500 mt-1">
              Balance: {formatEther(balance)} {symbol}
            </p>
          )}
        </div>

        {/* Source Chain */}
        <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">From</span>
            <span className="font-medium">{CHAIN_NAMES[chainId] || `Chain ${chainId}`}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Destination Chain */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            To Chain
          </label>
          <select
            value={destChainId}
            onChange={(e) => setDestChainId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors"
          >
            <option value="">Select destination chain</option>
            {SUPPORTED_CHAINS.filter(c => c.id !== chainId).map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Peer Warning */}
        {destChain && tokenAddress && !hasPeer && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm font-medium mb-1">Peer not configured</p>
            <p className="text-gray-400 text-xs">
              This token has no peer connection to {destChain.name}.
              You need to deploy the token on {destChain.name} and run setPeer() on both chains before bridging.
            </p>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              min="0"
              step="any"
              className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors pr-20"
            />
            {balance !== undefined && (
              <button
                type="button"
                onClick={() => setAmount(formatEther(balance))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400 hover:text-cyan-300"
              >
                MAX
              </button>
            )}
          </div>
        </div>

        {/* Recipient (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Recipient (optional)
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={address || '0x...'}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to send to your own address
          </p>
        </div>

        {/* Fee Estimate */}
        {quoteFee && (
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Bridge Fee</span>
              <span className="font-medium">{formatEther(quoteFee.nativeFee)} ETH</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || isConfirming || !tokenAddress || !destChainId || !amount || !hasPeer}
          className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isPending ? 'Confirm in Wallet...' : 'Bridging...'}
            </span>
          ) : (
            'Bridge Tokens'
          )}
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <h4 className="font-medium text-purple-400 mb-2">Important</h4>
        <p className="text-sm text-gray-400">
          Make sure the token has peer connections set up on both chains. 
          Without peers configured, the bridge will fail.
        </p>
      </div>
    </div>
  )
}
