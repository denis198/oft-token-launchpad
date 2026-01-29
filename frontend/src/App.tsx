import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import Header from './components/Header'
import CreateToken from './components/CreateToken'
import BridgeToken from './components/BridgeToken'
import MyTokens from './components/MyTokens'
import Footer from './components/Footer'

type Tab = 'create' | 'bridge' | 'tokens'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('create')
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            OFT Token Launchpad
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Create cross-chain tokens powered by LayerZero. Deploy once, bridge anywhere.
          </p>
        </div>

        {/* Connect Wallet */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="glass rounded-2xl p-8 text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center float">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">
                Connect your wallet to create and manage cross-chain tokens
              </p>
              <ConnectButton />
            </div>
          </div>
        )}

        {/* Main Content */}
        {isConnected && (
          <>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="glass rounded-full p-1 flex gap-1">
                <TabButton 
                  active={activeTab === 'create'} 
                  onClick={() => setActiveTab('create')}
                >
                  Create Token
                </TabButton>
                <TabButton 
                  active={activeTab === 'bridge'} 
                  onClick={() => setActiveTab('bridge')}
                >
                  Bridge
                </TabButton>
                <TabButton 
                  active={activeTab === 'tokens'} 
                  onClick={() => setActiveTab('tokens')}
                >
                  My Tokens
                </TabButton>
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-2xl mx-auto">
              {activeTab === 'create' && <CreateToken />}
              {activeTab === 'bridge' && <BridgeToken />}
              {activeTab === 'tokens' && <MyTokens />}
            </div>
          </>
        )}

        {/* Supported Networks */}
        <div className="max-w-4xl mx-auto mt-16 mb-8">
          <h3 className="text-center text-xl font-bold mb-6 text-gray-300">Supported Networks</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: 'Sepolia', color: 'from-blue-500 to-blue-600' },
              { name: 'Mumbai', color: 'from-purple-500 to-purple-600' },
              { name: 'Arbitrum Sepolia', color: 'from-sky-500 to-sky-600' },
              { name: 'Optimism Sepolia', color: 'from-red-500 to-red-600' },
              { name: 'Base Sepolia', color: 'from-blue-600 to-indigo-600' },
            ].map((net) => (
              <div key={net.name} className="glass rounded-lg p-3 text-center">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r ${net.color} flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">{net.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-center text-xl font-bold mb-6 text-gray-300">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl font-bold text-purple-400">1</div>
              <h4 className="font-semibold mb-2">Create Token</h4>
              <p className="text-sm text-gray-400">Deploy your OFT token on any supported chain with a single click</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl font-bold text-blue-400">2</div>
              <h4 className="font-semibold mb-2">Set Up Peers</h4>
              <p className="text-sm text-gray-400">Connect token deployments across chains for cross-chain transfers</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-500/20 flex items-center justify-center text-2xl font-bold text-cyan-400">3</div>
              <h4 className="font-semibold mb-2">Bridge Tokens</h4>
              <p className="text-sm text-gray-400">Transfer tokens seamlessly between chains via LayerZero messaging</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function TabButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full font-medium transition-all ${
        active 
          ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export default App
