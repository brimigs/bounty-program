'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useCounterProgram, useCounterProgramAccount } from './counter-data-access'
import { ellipsify } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Trophy,
  User,
  FileText,
  TrendingUp,
  Search,
  Trash2
} from 'lucide-react'

interface InvestigationStatus {
  status: 'pending' | 'verified' | 'rejected'
  label: string
  icon: React.ReactNode
  color: string
}

const statusMap: Record<string, InvestigationStatus> = {
  pending: {
    status: 'pending',
    label: 'Under Review',
    icon: <Clock className="w-4 h-4" />,
    color: 'bg-yellow-500'
  },
  verified: {
    status: 'verified',
    label: 'Verified',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  rejected: {
    status: 'rejected',
    label: 'Invalid',
    icon: <XCircle className="w-4 h-4" />,
    color: 'bg-red-500'
  }
}

export function InvestigationHistory() {
  const { accounts, getProgramAccount } = useCounterProgram()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!getProgramAccount.data?.value) {
    return (
      <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
        <AlertCircle className="w-4 h-4 text-orange-600" />
        <AlertDescription>
          Investigation history will appear here once the program is initialized.
        </AlertDescription>
      </Alert>
    )
  }

  const filteredAccounts = accounts.data?.filter(() => {
    // In a real app, you'd filter based on actual status from the account data
    // For now, we'll show all accounts
    return filterStatus === 'all' || true
  })

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{accounts.data?.length || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">{accounts.data?.length || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by address or memo..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </Button>
          <Button
            variant={filterStatus === 'verified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('verified')}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Verified
          </Button>
        </div>
      </div>

      {/* Investigation List */}
      {accounts.isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredAccounts?.length ? (
        <div className="space-y-4">
          {filteredAccounts.map((account) => (
            <InvestigationCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No Investigations Yet</h3>
            <p className="text-muted-foreground">
              Start investigating suspicious addresses and submit your findings above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InvestigationCard({ account }: { account: PublicKey }) {
  const { accountQuery } = useCounterProgramAccount({ account })
  const { deleteBounty } = useCounterProgram()
  const investigation = accountQuery.data
  const [isExpanded, setIsExpanded] = useState(false)

  // For demo purposes, assign random status
  const status = statusMap.pending

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this investigation?')) {
      try {
        await deleteBounty.mutateAsync({ bountyAccount: account })
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  if (!investigation) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-24" />
      </Card>
    )
  }

  // Parse evidence from memo if it exists
  const memoSplit = investigation.memo.split(' | Evidence: ')
  const mainMemo = memoSplit[0]
  const evidence = memoSplit[1]?.split('; ') || []

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge className={`${status.color} text-white`}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                Submitted {new Date().toLocaleDateString()}
              </span>
            </div>
            <CardTitle className="text-lg">Investigation #{account.toString().slice(-4)}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Investigator: {ellipsify(investigation.owner.toString())}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Suspected Address</p>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-secondary px-2 py-1 rounded">
                {ellipsify(investigation.address.toString())}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() => window.open(`https://solscan.io/account/${investigation.address}?cluster=devnet`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Initial Findings</p>
            <p className="text-sm">{mainMemo}</p>
          </div>

          {isExpanded && (
            <>
              {evidence.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Evidence Submitted</p>
                  <ul className="space-y-1">
                    {evidence.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Bounty Status</span>
                  </div>
                  {status.status === 'verified' ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Reward Claimed
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending Review</Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}