'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { AppHero } from '@/components/app-hero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BurnerWalletFeature } from '@/components/burner-wallet/burner-wallet-feature'
import { WalletButton } from '@/components/solana/solana-provider'
import { 
  CheckCircle2, 
  Circle, 
  Wallet, 
  Coins, 
  FileText,
  ExternalLink,
  Flame,
  Info,
  ArrowRight,
  Copy,
  Loader2,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { MintVsTokenAccount } from './mint-vs-token-account'
import { PublicKey, Transaction } from '@solana/web3.js'
import { 
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token'

interface Step {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'current' | 'completed'
}

export function AllowlistRequestFeature() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [showBurnerWallet, setShowBurnerWallet] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [hasTokenAccount, setHasTokenAccount] = useState(false)

  // Define the compliance coin mint address
  const COMPLIANCE_COIN_MINT = 'HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z'

  const steps: Step[] = [
    {
      id: 'wallet',
      title: 'Create or Connect Wallet',
      description: 'Set up a Solana wallet to participate',
      icon: <Wallet className="w-5 h-5" />,
      status: connected ? 'completed' : currentStep === 0 ? 'current' : 'pending'
    },
    {
      id: 'token-account',
      title: 'Understand Token Accounts',
      description: 'Learn about token accounts and create one',
      icon: <Coins className="w-5 h-5" />,
      status: connected ? (currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending') : 'pending'
    },
    {
      id: 'submit',
      title: 'Submit Allowlist Request',
      description: 'Submit your wallet address to the form',
      icon: <FileText className="w-5 h-5" />,
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending'
    }
  ]

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      toast.success('Wallet address copied to clipboard!')
    }
  }

  const handleCopyMint = () => {
    navigator.clipboard.writeText(COMPLIANCE_COIN_MINT)
    toast.success('Mint address copied to clipboard!')
  }

  const createTokenAccount = async () => {
    if (!publicKey || !connection) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsCreatingAccount(true)

    try {
      const mintPubkey = new PublicKey(COMPLIANCE_COIN_MINT)
      
      // Get the associated token address
      const associatedTokenAddress = getAssociatedTokenAddressSync(
        mintPubkey,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )

      // Check if the account already exists
      const accountInfo = await connection.getAccountInfo(associatedTokenAddress)
      
      if (accountInfo) {
        toast.success('Token account already exists!')
        setHasTokenAccount(true)
        return
      }

      // Create the instruction to create the associated token account
      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        publicKey, // payer
        associatedTokenAddress, // token account address
        publicKey, // owner
        mintPubkey, // mint
        TOKEN_2022_PROGRAM_ID, // token program
        ASSOCIATED_TOKEN_PROGRAM_ID // associated token program
      )

      // Create and send the transaction
      const transaction = new Transaction().add(createAccountInstruction)
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      })

      if (confirmation.value.err) {
        throw new Error('Transaction failed')
      }

      toast.success(`Token account created successfully!`)
      setHasTokenAccount(true)
      
      // Show transaction link
      const cluster = connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet-beta'
      toast.success(
        <div className="flex items-center gap-2">
          <span>View transaction</span>
          <a 
            href={`https://solscan.io/tx/${signature}?cluster=${cluster}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            on Solscan
          </a>
        </div>
      )
    } catch (error) {
      console.error('Error creating token account:', error)
      toast.error(`Failed to create token account: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <AppHero 
        title="Allowlist Request Guide" 
        subtitle="Follow these steps to request access to Compliance Coin"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${step.status === 'completed' ? 'bg-green-600 text-white' : 
                      step.status === 'current' ? 'bg-purple-600 text-white scale-110' : 
                      'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                  `}>
                    {step.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-sm font-medium ${
                      step.status === 'current' ? 'text-purple-600 dark:text-purple-400' : ''
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    steps[index].status === 'completed' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Wallet Setup */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className={`w-6 h-6 ${connected ? 'text-green-600' : 'text-purple-600'}`} />
              Step 1: Create or Connect Your Wallet
            </CardTitle>
            <CardDescription>
              You need a Solana wallet to receive Compliance Coins
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!connected ? (
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Choose one of the following options to set up your wallet:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-2 hover:border-purple-500 transition-colors cursor-pointer" 
                        onClick={() => setShowBurnerWallet(true)}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Burner Wallet
                      </CardTitle>
                      <Badge className="w-fit">Quick Setup</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Instant wallet creation in your browser. Perfect for workshops!
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-purple-500 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-purple-600" />
                        Browser Extension
                      </CardTitle>
                      <Badge variant="secondary" className="w-fit">Full Featured</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use Phantom, Solflare, or Backpack wallet
                      </p>
                      <WalletButton />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-300">
                    Wallet connected successfully!
                  </AlertDescription>
                </Alert>
                
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium mb-2">Your Wallet Address:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded text-xs break-all">
                      {publicKey?.toBase58()}
                    </code>
                    <Button size="sm" variant="outline" onClick={handleCopyAddress}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={() => setCurrentStep(1)} 
                  className="w-full"
                  disabled={currentStep > 0}
                >
                  Continue to Step 2
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Token Account Education */}
        <Card className={`mb-8 ${currentStep < 1 ? 'opacity-50' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className={`w-6 h-6 ${currentStep > 1 ? 'text-green-600' : currentStep === 1 ? 'text-purple-600' : 'text-gray-400'}`} />
              Step 2: Understanding Token Accounts
            </CardTitle>
            <CardDescription>
              Learn the difference between mint accounts and token accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={currentStep < 1 ? 'pointer-events-none' : ''}>
              <MintVsTokenAccount />
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  About Your Token Account
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  When you receive Compliance Coins, a token account will be automatically created for you 
                  if you don&apos;t already have one. This account will hold your balance of Compliance Coins.
                </p>
                <div className="p-3 bg-white dark:bg-gray-800 rounded mb-4">
                  <p className="text-xs font-medium mb-1">Compliance Coin Mint Address:</p>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="flex-1 p-1 bg-gray-100 dark:bg-gray-900 rounded text-xs break-all">
                      {COMPLIANCE_COIN_MINT}
                    </code>
                    <Button size="sm" variant="ghost" onClick={handleCopyMint}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => window.open('https://solscan.io/token/HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z?cluster=devnet', '_blank')}
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Block Explorer
                  </Button>
                </div>

                {/* Create Token Account Button */}
                <div className="space-y-3">
                  <Button
                    onClick={createTokenAccount}
                    disabled={isCreatingAccount || hasTokenAccount}
                    variant="secondary"
                    className="w-full"
                  >
                    {isCreatingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Token Account...
                      </>
                    ) : hasTokenAccount ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Token Account Created
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Token Account Now
                      </>
                    )}
                  </Button>
                  {hasTokenAccount && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-center">
                      Your token account is ready to receive Compliance Coins!
                    </p>
                  )}
                </div>
              </div>

              {currentStep >= 1 && (
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  className="w-full mt-6"
                  disabled={currentStep > 1}
                >
                  Continue to Step 3
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Submit Request */}
        <Card className={`mb-8 ${currentStep < 2 ? 'opacity-50' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className={`w-6 h-6 ${currentStep > 2 ? 'text-green-600' : currentStep === 2 ? 'text-purple-600' : 'text-gray-400'}`} />
              Step 3: Submit Your Allowlist Request
            </CardTitle>
            <CardDescription>
              Submit your wallet address to request access to Compliance Coin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={currentStep < 2 ? 'pointer-events-none' : ''}>
              <div className="space-y-4">
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Make sure you have your wallet address copied before opening the form. 
                    You&apos;ll need to paste it in the submission form.
                  </AlertDescription>
                </Alert>

                {publicKey && (
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium mb-2">Your Wallet Address (to submit):</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded text-xs break-all">
                        {publicKey.toBase58()}
                      </code>
                      <Button size="sm" variant="outline" onClick={handleCopyAddress}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => window.open('https://docs.google.com/spreadsheets/d/1oMleTnbR1SHGs3bV91qaCys9lAapjfk6PXWQBlHvGgI/edit?gid=0#gid=0', '_blank')}
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Open Allowlist Request Form
                </Button>

                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>The workshop facilitator will review your request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Your wallet will be added to the allowlist</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>You&apos;ll receive Compliance Coins to participate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Return to the Bounty Program page to start investigating</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BurnerWalletFeature 
        isOpen={showBurnerWallet} 
        onClose={() => setShowBurnerWallet(false)} 
      />
    </div>
  )
}