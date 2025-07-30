import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, Wallet, ArrowRight, Building, User } from 'lucide-react'

export function MintVsTokenAccount() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mint Account */}
        <Card className="p-6 border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Mint Account</h3>
            </div>
            <Badge className="bg-purple-600">Token Definition</Badge>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The &quot;blueprint&quot; or &quot;factory&quot; that defines a token
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Coins className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Stores token metadata (name, symbol, logo)</span>
              </div>
              <div className="flex items-start gap-2">
                <Coins className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Controls total supply and decimals</span>
              </div>
              <div className="flex items-start gap-2">
                <Coins className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Manages token extensions (like compliance rules)</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <p className="text-xs font-medium text-purple-800 dark:text-purple-300">
                Think of it like: The U.S. Mint that prints dollar bills
              </p>
            </div>
          </div>
        </Card>

        {/* Token Account */}
        <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Token Account</h3>
            </div>
            <Badge className="bg-blue-600">Your Balance</Badge>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Your personal &quot;wallet&quot; that holds tokens
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Owned by your wallet address</span>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Holds your balance of specific tokens</span>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>One account per token type you own</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                Think of it like: Your personal bank account that holds dollars
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Connection Diagram */}
      <div className="flex items-center justify-center gap-4 py-6">
        <div className="text-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full mb-2">
            <Building className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm font-medium">Compliance Coin Mint</p>
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowRight className="w-6 h-6 text-gray-400" />
          <span className="text-sm text-gray-500">creates</span>
          <ArrowRight className="w-6 h-6 text-gray-400" />
        </div>
        
        <div className="text-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-2">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm font-medium">Your Token Account</p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>In Summary:</strong> The Compliance Coin <span className="text-purple-600">Mint</span> defines the token, 
          while your <span className="text-blue-600">Token Account</span> holds your balance of those tokens.
        </p>
      </div>
    </div>
  )
}