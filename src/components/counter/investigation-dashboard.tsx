'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  ExternalLink,
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
      title: 'Token Information',
      description: 'View all token information, transactions, and holders on Solscan',
      icon: <Search className="w-5 h-5" />,
      action: () => window.open(`https://solscan.io/token/${COMPLIANCE_COIN_MINT}?cluster=devnet`, '_blank'),
      actionLabel: 'Open Block Explorer'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Token Information Card */}
      <div className="max-w-3xl mx-auto">
        {investigationTools.map((tool, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {tool.icon}
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{tool.description}</CardDescription>
                </div>
                <Button 
                  onClick={tool.action}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {tool.actionLabel}
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
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