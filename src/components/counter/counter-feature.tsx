'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram } from './counter-data-access'
import { BountyCreate, BountyList, ConfigInitialize, ConfigUpdate } from './counter-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, Settings, Shield } from 'lucide-react'

export default function CounterFeature() {
  const { publicKey } = useWallet()
  const { programId, configQuery } = useCounterProgram()

  return publicKey ? (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
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
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="text-3xl">Create New Bounty</CardTitle>
                <CardDescription className="text-base">
                  Submit a new bounty by entering a public key address and memo. 
                  <span className="font-semibold text-primary"> It costs 1 token to submit.</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <BountyCreate />
              </CardContent>
            </Card>
            
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Active Bounties</h2>
              <BountyList />
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
                  {configQuery.data && <ConfigUpdate />}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
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