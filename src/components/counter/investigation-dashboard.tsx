'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  ExternalLink, 
  FileSearch, 
  AlertTriangle,
  Trophy,
  Clock,
  Activity,
  TrendingUp,
  Info,
  ArrowRight
} from 'lucide-react'

interface InvestigationTool {
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  actionLabel: string
}

export function InvestigationDashboard() {
  const COMPLIANCE_COIN_MINT = 'HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z'

  const investigationTools: InvestigationTool[] = [
    {
      title: 'Token Transaction Explorer',
      description: 'View all transactions for Compliance Coin',
      icon: <Search className="w-5 h-5" />,
      action: () => window.open(`https://solscan.io/token/${COMPLIANCE_COIN_MINT}?cluster=devnet#txs`, '_blank'),
      actionLabel: 'Open Explorer'
    },
    {
      title: 'Token Holders List',
      description: 'See all addresses holding Compliance Coin',
      icon: <FileSearch className="w-5 h-5" />,
      action: () => window.open(`https://solscan.io/token/${COMPLIANCE_COIN_MINT}?cluster=devnet#holders`, '_blank'),
      actionLabel: 'View Holders'
    },
    {
      title: 'Recent Transfers',
      description: 'Track recent token movements and memos',
      icon: <Activity className="w-5 h-5" />,
      action: () => window.open(`https://solscan.io/token/${COMPLIANCE_COIN_MINT}?cluster=devnet#txs`, '_blank'),
      actionLabel: 'View Transfers'
    },
    {
      title: 'Known Sanctioned Entities',
      description: 'Reference list of flagged addresses',
      icon: <AlertTriangle className="w-5 h-5" />,
      action: () => window.open('https://sanctionssearch.ofac.treas.gov/', '_blank'),
      actionLabel: 'OFAC List'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Mission Brief */}
      <Card className="border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Active Mission: Find the Sanctioned Entity
            </CardTitle>
            <Badge className="bg-red-600 text-white animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              URGENT
            </Badge>
          </div>
          <CardDescription className="text-base mt-2">
            Tokens have been traced to a sanctioned entity. Use the investigation tools below to track transactions 
            and identify the compromised address through memo analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <p className="text-sm font-medium">Reward</p>
              </div>
              <p className="text-lg font-bold">Bounty Tokens</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-medium">Status</p>
              </div>
              <p className="text-lg font-bold text-green-600">Active Hunt</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <p className="text-sm font-medium">Submissions</p>
              </div>
              <p className="text-lg font-bold">0 Verified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investigation Hints */}
      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <Info className="w-4 h-4" />
        <AlertDescription>
          <strong>Investigation Tips:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Look for transactions with suspicious memos</li>
            <li>• Check token holders with large balances</li>
            <li>• Trace the flow of tokens between accounts</li>
            <li>• Sanctioned entities often have specific patterns in their memos</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Investigation Tools */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Investigation Tools
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {investigationTools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {tool.icon}
                  {tool.title}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={tool.action}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {tool.actionLabel}
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Start Guide */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            How to Start Your Investigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">1.</span>
              <span>Open the Token Transaction Explorer to see all Compliance Coin transfers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">2.</span>
              <span>Look for transactions with memos - sanctioned entities are identified through these</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">3.</span>
              <span>Note any suspicious addresses or patterns in the memo fields</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">4.</span>
              <span>Once you identify a sanctioned entity, submit your findings below</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}