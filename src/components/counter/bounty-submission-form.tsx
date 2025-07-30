'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useCounterProgram } from './counter-data-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  Search, 
  FileText, 
  Copy, 
  CheckCircle2,
  Info,
  Loader2,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface EvidenceItem {
  type: 'transaction' | 'memo' | 'pattern'
  description: string
  link?: string
}

export function BountySubmissionForm() {
  const { createBounty, userTokenBalanceQuery } = useCounterProgram()
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')
  const [creating, setCreating] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [nextKeypair] = useState(() => Keypair.generate())
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([])
  const [newEvidence, setNewEvidence] = useState('')
  const [selectedTab, setSelectedTab] = useState('address')

  const validateAddress = (addr: string) => {
    try {
      new PublicKey(addr)
      setAddressError('')
      return true
    } catch {
      setAddressError('Invalid address format')
      return false
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value)
    if (value) {
      validateAddress(value)
    } else {
      setAddressError('')
    }
  }

  const handleAddEvidence = () => {
    if (newEvidence.trim()) {
      setEvidenceItems([...evidenceItems, {
        type: 'memo',
        description: newEvidence
      }])
      setNewEvidence('')
    }
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard!')
    }
  }

  const handleViewOnExplorer = () => {
    if (address && validateAddress(address)) {
      window.open(`https://solscan.io/account/${address}?cluster=devnet`, '_blank')
    }
  }

  const handleCreate = async () => {
    if (!validateAddress(address)) {
      return
    }

    // Construct memo with evidence
    const evidenceMemo = evidenceItems.length > 0 
      ? `${memo} | Evidence: ${evidenceItems.map(e => e.description).join('; ')}`
      : memo

    setCreating(true)
    try {
      const pubkey = new PublicKey(address)
      await createBounty.mutateAsync({ keypair: nextKeypair, address: pubkey, memo: evidenceMemo })
      setAddress('')
      setMemo('')
      setEvidenceItems([])
      setSelectedTab('address')
      toast.success('Bounty submitted successfully!')
    } catch {
      toast.error('Failed to submit bounty')
    } finally {
      setCreating(false)
    }
  }

  const isValid = address && memo && !addressError
  const hasRequiredToken = userTokenBalanceQuery.data && parseFloat(String(userTokenBalanceQuery.data.uiAmount || '0')) >= 1

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="address">
            <Search className="w-4 h-4 mr-2" />
            Address
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <FileText className="w-4 h-4 mr-2" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="review">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Suspected Sanctioned Entity
              </CardTitle>
              <CardDescription>
                Enter the wallet address you believe belongs to a sanctioned entity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Wallet Address</label>
                <div className="relative">
                  <input
                    className={`w-full px-4 py-3 rounded-lg border ${addressError ? 'border-destructive focus:ring-destructive' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    type="text"
                    placeholder="Enter the suspicious wallet address"
                    value={address}
                    onChange={handleAddressChange}
                    disabled={creating || !hasRequiredToken}
                  />
                  {address && !addressError && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyAddress}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleViewOnExplorer}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {addressError && <span className="text-destructive text-sm font-medium">{addressError}</span>}
              </div>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Make sure this address has shown suspicious activity in memo fields or transaction patterns
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Initial Findings</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all min-h-[100px]"
                  placeholder="Briefly explain why you suspect this address..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  disabled={creating || !hasRequiredToken}
                />
              </div>

              <Button 
                onClick={() => setSelectedTab('evidence')} 
                disabled={!address || !memo || !!addressError}
                className="w-full"
              >
                Continue to Evidence
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supporting Evidence</CardTitle>
              <CardDescription>
                Add any evidence that supports your investigation findings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Add Evidence Item</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    type="text"
                    placeholder="Transaction hash, memo content, or pattern description"
                    value={newEvidence}
                    onChange={(e) => setNewEvidence(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEvidence()}
                  />
                  <Button onClick={handleAddEvidence} disabled={!newEvidence.trim()}>
                    Add
                  </Button>
                </div>
              </div>

              {evidenceItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Evidence List:</p>
                  <div className="space-y-2">
                    {evidenceItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm flex-1">{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Strong evidence includes transaction hashes, suspicious memo content, or unusual transfer patterns
                </AlertDescription>
              </Alert>

              <Button 
                onClick={() => setSelectedTab('review')} 
                className="w-full"
              >
                Continue to Review
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Submission</CardTitle>
              <CardDescription>
                Confirm your findings before submitting the bounty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspected Address</p>
                  <p className="font-mono text-sm break-all">{address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Initial Findings</p>
                  <p className="text-sm">{memo || 'Not provided'}</p>
                </div>
                {evidenceItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Evidence Items</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {evidenceItems.map((item, index) => (
                        <li key={index}>{item.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {userTokenBalanceQuery.data && hasRequiredToken && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-300">
                    Token Balance: {userTokenBalanceQuery.data.uiAmountString} - Ready to submit!
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCreate}
                disabled={creating || !isValid || !hasRequiredToken}
                className="w-full py-6 text-lg font-semibold"
                size="lg"
              >
                {creating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Investigation...
                  </span>
                ) : !hasRequiredToken ? (
                  'Insufficient Token Balance'
                ) : (
                  'Submit Investigation (1 Token)'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}