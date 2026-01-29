import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Header() {
  return (
    <header className="border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg">OFT Launchpad</h1>
            <p className="text-xs text-gray-500">Powered by LayerZero</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="https://docs.layerzero.network" target="_blank" rel="noopener noreferrer" 
             className="text-gray-400 hover:text-white transition-colors">
            Docs
          </a>
          <a href="https://layerzeroscan.com" target="_blank" rel="noopener noreferrer"
             className="text-gray-400 hover:text-white transition-colors">
            Explorer
          </a>
          <a href="https://github.com/LayerZero-Labs" target="_blank" rel="noopener noreferrer"
             className="text-gray-400 hover:text-white transition-colors">
            GitHub
          </a>
        </nav>

        {/* Connect Button */}
        <ConnectButton 
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </header>
  )
}
