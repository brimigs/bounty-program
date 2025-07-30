'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Flame, 
  Copy, 
  Download, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Key,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { BurnerWalletAdapter } from './burner-wallet-adapter'

interface BurnerWalletFeatureProps {
  isOpen: boolean
  onClose: () => void
}

export function BurnerWalletFeature({ isOpen, onClose }: BurnerWalletFeatureProps) {
  const { wallet, publicKey, connect, disconnect, select } = useWallet()
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if we're using burner wallet
  const isBurnerWallet = wallet?.adapter.name === 'Burner Wallet'

  const handleCreateBurnerWallet = async () => {
    try {
      setIsConnecting(true)
      
      // Select burner wallet
      const burnerWallet = new BurnerWalletAdapter()
      select(burnerWallet.name)
      
      // Small delay to ensure wallet is selected
      setTimeout(async () => {
        await connect()
        toast.success('Burner wallet created successfully!')
        
        // Get private key
        if (burnerWallet.exportPrivateKey) {
          setPrivateKey(burnerWallet.exportPrivateKey())
        }
      }, 100)
    } catch (error) {
      console.error('Error creating burner wallet:', error)
      toast.error('Failed to create burner wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      toast.success('Address copied to clipboard!')
    }
  }

  const handleCopyPrivateKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey)
      toast.success('Private key copied to clipboard!')
    }
  }

  const handleExportWallet = () => {
    if (privateKey && publicKey) {
      const walletData = {
        publicKey: publicKey.toBase58(),
        privateKey: privateKey,
        type: 'burner-wallet',
        createdAt: new Date().toISOString(),
        warning: 'This is a temporary wallet. Store the private key securely if you want to use it later.'
      }
      
      const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `burner-wallet-${publicKey.toBase58().slice(0, 8)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Wallet exported successfully!')
    }
  }

  const handleClearWallet = () => {
    if (wallet?.adapter instanceof BurnerWalletAdapter) {
      wallet.adapter.clearBurnerWallet()
      disconnect()
      setPrivateKey(null)
      toast.success('Burner wallet cleared')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Workshop Burner Wallet
          </DialogTitle>
          <DialogDescription>
            Create a temporary wallet for this workshop - no extensions required!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!publicKey || !isBurnerWallet ? (
            <div className="space-y-4">
              <Card className="p-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  What is a Burner Wallet?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>A temporary wallet created in your browser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>No browser extension or mobile app needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Perfect for workshops and testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Can export the private key if you want to keep it</span>
                  </li>
                </ul>
              </Card>

              <Button
                onClick={handleCreateBurnerWallet}
                disabled={isConnecting}
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Creating Wallet...
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5 mr-2" />
                    Create Burner Wallet
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By creating a burner wallet, you understand this is temporary and should not be used for storing real funds
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Burner Wallet Active
                  </h3>
                  <Badge className="bg-green-600">Connected</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wallet Address
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">
                        {publicKey.toBase58()}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyAddress}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {showPrivateKey && privateKey && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Private Key (Keep Secret!)
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs break-all">
                          {privateKey}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyPrivateKey}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {showPrivateKey ? 'Hide' : 'Show'} Private Key
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleExportWallet}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Wallet
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleClearWallet}
                  className="w-full"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Clear Burner Wallet
                </Button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                  This will delete the wallet from your browser
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              Next Steps
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Once your wallet is created, share your address with the workshop facilitator to be added to the allowlist and receive tokens.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}