import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Flame, 
  Download,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export function WalletOptions() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-4">Choose Your Wallet Option</h2>
        <p className="text-gray-600 dark:text-gray-300">
          For this workshop, you can use either a burner wallet or a traditional wallet extension
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Burner Wallet Option */}
        <Card className="p-6 border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Burner Wallet</h3>
                <Badge className="mt-1 bg-orange-600">Recommended for Workshop</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              A temporary wallet created instantly in your browser - perfect for workshops!
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span className="text-sm">No downloads or extensions required</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span className="text-sm">Created instantly in your browser</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span className="text-sm">Export private key if you want to keep it</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <span className="text-sm">Setup time: ~30 seconds</span>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <p className="text-xs text-orange-800 dark:text-orange-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  This is a temporary wallet. Only use it for workshops and testing, 
                  never for storing real funds.
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Traditional Wallet Option */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Wallet className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Browser Extension</h3>
                <Badge variant="secondary" className="mt-1">Traditional Option</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Use a full-featured Solana wallet like Phantom, Solflare, or Backpack
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                <span className="text-sm">Full security features</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span className="text-sm">Permanent wallet for long-term use</span>
              </div>
              <div className="flex items-start gap-2">
                <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                <span className="text-sm">Requires browser extension download</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <span className="text-sm">Setup time: 5-10 minutes</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Popular options: Phantom, Solflare, Backpack. 
                Great for continued use after the workshop.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          How to Choose
        </h4>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <p>
            <strong>Choose Burner Wallet if:</strong> You&apos;re just here for the workshop, 
            can&apos;t install extensions, or want to get started quickly.
          </p>
          <p>
            <strong>Choose Browser Extension if:</strong> You already have a Solana wallet installed, 
            or plan to continue using Solana after the workshop.
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        You&apos;ll create or connect your wallet after completing this onboarding
      </div>
    </div>
  )
}