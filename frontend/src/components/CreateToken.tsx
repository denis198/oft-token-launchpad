import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther } from 'viem'
import toast from 'react-hot-toast'
import { FACTORY_ABI } from '../config/contracts'
import { FACTORY_ADDRESSES, CHAIN_NAMES, EXPLORER_URLS } from '../config/wagmi'

export default function CreateToken() {
  const { address } = useAccount()
  const chainId = useChainId()
  
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [supply, setSupply] = useState('')

  const factoryAddress = FACTORY_ADDRESSES[chainId]

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!factoryAddress) {
      toast.error(`Factory not deployed on ${CHAIN_NAMES[chainId] || 'this network'}`)
      return
    }

    if (!name || !symbol || !supply) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      writeContract({
        address: factoryAddress as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'createToken',
        args: [name, symbol, parseEther(supply)],
      })
      toast.success('Transaction submitted!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to create token')
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
        <h3 className="text-2xl font-bold mb-2">Token Created!</h3>
        <p className="text-gray-400 mb-4">
          Your OFT token has been deployed successfully.
        </p>
        <a
          href={`${EXPLORER_URLS[chainId] || 'https://sepolia.etherscan.io'}/tx/${completedHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline"
        >
          View Transaction
        </a>
        <button
          onClick={() => {
            setTxComplete(false)
            setCompletedHash(undefined)
            setName('')
            setSymbol('')
            setSupply('')
            reset()
          }}
          className="block mx-auto mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Create Another
        </button>
      </div>
    )
  }

  return (
    <div className="gradient-border p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </span>
        Create OFT Token
      </h2>

      {!factoryAddress && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-yellow-400 text-sm">
            Factory contract not deployed on {CHAIN_NAMES[chainId] || 'this network'}. 
            Please switch to a supported network or deploy the factory first.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Token Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Token"
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Token Symbol */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Token Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="MAT"
            maxLength={10}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors uppercase"
          />
        </div>

        {/* Initial Supply */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Initial Supply
          </label>
          <input
            type="number"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            placeholder="1000000"
            min="0"
            step="any"
            className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tokens will be minted to your wallet ({address?.slice(0, 6)}...{address?.slice(-4)})
          </p>
        </div>

        {/* Network Info */}
        <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Deploying on</span>
            <span className="font-medium">{CHAIN_NAMES[chainId] || `Chain ${chainId}`}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || isConfirming || !factoryAddress}
          className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isPending ? 'Confirm in Wallet...' : 'Creating Token...'}
            </span>
          ) : (
            'Create Token'
          )}
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-medium text-blue-400 mb-2">What is OFT?</h4>
        <p className="text-sm text-gray-400">
          OFT (Omnichain Fungible Token) is LayerZero's standard for cross-chain tokens. 
          After creating your token, you can deploy it on other chains and set up peer 
          connections to enable seamless bridging.
        </p>
      </div>
    </div>
  )
}
