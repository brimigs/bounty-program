'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram } from './counter-data-access'
import { ConfigInitialize, ConfigUpdate, BurnTokens } from './counter-ui'
import { InvestigationDashboard } from './investigation-dashboard'
import { BountySubmissionForm } from './bounty-submission-form'
import { InvestigationHistory } from './investigation-history'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Info, 
  Settings, 
  Shield, 
  ExternalLink
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CounterFeature() {
  const { publicKey } = useWallet()
  const { programId, configQuery, userTokenBalanceQuery } = useCounterProgram()
  const router = useRouter()
  
  const hasRequiredToken = userTokenBalanceQuery.data && parseFloat(String(userTokenBalanceQuery.data.uiAmount || '0')) >= 1

  return publicKey ? (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {!hasRequiredToken ? (
        <div className="min-h-screen">
          <h1 className="text-5xl font-bold text-center pt-16 mb-24">Compliance Coin Bounties</h1>
          <div className="flex items-center justify-center">
            <div className="text-center max-w-4xl px-8">
            <div className="bg-white/50 dark:bg-white/10 p-6 rounded-lg mb-8">
              <p className="text-lg text-muted-foreground">
                You can only access this website if you own the Compliance Coin. This website is token-gated so that only the people who have access to this token are allowed to view the website.
              </p>
            </div>
            <p className="text-lg text-muted-foreground mb-12">
              If you should have access to this website, please reach out to admin to add your wallet to the allowlist and received a transfer of the token into your wallet. You can submit a request by adding your wallet to this{' '}
              <a 
                href="https://docs.google.com/spreadsheets/d/1oMleTnbR1SHGs3bV91qaCys9lAapjfk6PXWQBlHvGgI/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                form
              </a>.
            </p>
            <a 
              href="https://solscan.io/token/HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              For more information on the Compliance Coin, please visit the block explorer.
            </a>
            
            <div className="mt-12 flex justify-center">
              <Button
                onClick={() => router.push('/allowlist-request')}
                size="lg"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Allowlist Request
              </Button>
            </div>
          </div>
          </div>
        </div>
      ) : (
        <>
          <AppHero
            title="Compliance Coin Bounties"
            subtitle={"Your account must be on the token's allowlist to be able to submit a bounty."}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="outline" className="px-3 py-1">
                <Shield className="w-3 h-3 mr-1" />
                Program ID
              </Badge>
              <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
            </div>
          </AppHero>
          
          <div className="max-w-7xl mx-auto px-4 pb-12">
            <Tabs defaultValue="bounties" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="bounties" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Info className="w-4 h-4 mr-2" />
                  Bounties
                </TabsTrigger>
                <TabsTrigger value="config" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="bounties" className="space-y-8 mt-0">
                {/* Investigation Dashboard */}
                <InvestigationDashboard />
                
                {/* Bounty Submission Section */}
                <Card className="border-2 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="text-3xl">Submit Your Findings</CardTitle>
                    <CardDescription className="text-base">
                      Found the sanctioned entity? Submit the address and supporting evidence. 
                      <span className="font-semibold text-primary"> It costs 1 token to submit.</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <BountySubmissionForm />
                  </CardContent>
                </Card>
                
                {/* Current Active Bounties */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-center">Current Active Bounties</h2>
                  <InvestigationHistory />
                </div>
              </TabsContent>
              
              <TabsContent value="config" className="space-y-6 mt-0">
                <Card className="border-2 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-secondary/20 to-secondary/10">
                    <CardTitle className="text-2xl">Program Configuration</CardTitle>
                    <CardDescription>View the current program configuration settings</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {configQuery.isLoading ? (
                      <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-lg"></span>
                      </div>
                    ) : configQuery.error ? (
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-800 dark:text-blue-200">
                          Configuration not initialized yet. Please initialize it in the Admin tab.
                        </p>
                      </div>
                    ) : configQuery.data ? (
                      <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Authority</p>
                          <ExplorerLink 
                            path={`address/${configQuery.data.authority}`} 
                            label={ellipsify(configQuery.data.authority.toString())} 
                          />
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Required Token Mint</p>
                          <ExplorerLink 
                            path={`address/${configQuery.data.requiredTokenMint}`} 
                            label={ellipsify(configQuery.data.requiredTokenMint.toString())} 
                          />
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-6 mt-0">
                <Card className="border-2 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-destructive/10 to-destructive/5">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      Admin Functions
                    </CardTitle>
                    <CardDescription>Administrative functions for managing the program configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {!configQuery.data && <ConfigInitialize />}
                      {configQuery.data && (
                        <>
                          <ConfigUpdate />
                          <BurnTokens />
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to Compliance Coin Bounties</CardTitle>
          <CardDescription className="text-base mt-2">
            Connect your wallet to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <WalletButton />
        </CardContent>
      </Card>
    </div>
  )
}