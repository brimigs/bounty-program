'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity,
  AlertCircle,
  ArrowUpDown,
  Clock,
  Hash,
  Play,
  Pause,
  RefreshCw,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface Transaction {
  signature: string
  blockTime: number
  memo?: string
  amount?: string
  from?: string
  to?: string
  suspicious?: boolean
}

export function LiveTransactionMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionCount, setTransactionCount] = useState(0)
  const [suspiciousCount, setSuspiciousCount] = useState(0)

  // Simulated transaction data
  const mockTransactions: Transaction[] = [
    {
      signature: '5Kh9...xY2p',
      blockTime: Date.now() - 30000,
      memo: 'Normal transfer',
      amount: '10.5',
      from: 'Demo...123',
      to: 'User...456',
      suspicious: false
    },
    {
      signature: '3Js7...sBu',
      blockTime: Date.now() - 60000,
      memo: 'SANCTIONED: Entity flagged',
      amount: '100.0',
      from: 'Sanc...789',
      to: 'Hide...321',
      suspicious: true
    },
    {
      signature: '7Yx2...pQ8',
      blockTime: Date.now() - 90000,
      memo: 'Payment for services',
      amount: '25.75',
      from: 'Merc...654',
      to: 'Serv...987',
      suspicious: false
    },
    {
      signature: '9Bz4...mN6',
      blockTime: Date.now() - 120000,
      memo: 'ALERT: Compliance check failed',
      amount: '500.0',
      from: 'Flag...135',
      to: 'Risk...246',
      suspicious: true
    }
  ]

  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Simulate receiving new transactions
      const randomTx = mockTransactions[Math.floor(Math.random() * mockTransactions.length)]
      const newTx: Transaction = {
        ...randomTx,
        signature: Math.random().toString(36).substring(2, 8) + '...' + Math.random().toString(36).substring(2, 6),
        blockTime: Date.now()
      }

      setTransactions(prev => [newTx, ...prev].slice(0, 10))
      setTransactionCount(prev => prev + 1)
      
      if (newTx.suspicious) {
        setSuspiciousCount(prev => prev + 1)
        toast.warning(`Suspicious transaction detected: ${newTx.signature}`)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  const resetMonitor = () => {
    setTransactions([])
    setTransactionCount(0)
    setSuspiciousCount(0)
    setIsMonitoring(false)
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Live Transaction Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              {isMonitoring && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 font-medium">Live</span>
                </div>
              )}
              <Button
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetMonitor}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          <CardDescription className="text-base">
            Monitor live transactions for suspicious patterns and sanctioned entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{transactionCount}</p>
                </div>
                <ArrowUpDown className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suspicious</p>
                  <p className="text-2xl font-bold text-orange-600">{suspiciousCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500 opacity-20" />
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Detection Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {transactionCount > 0 
                      ? Math.round((suspiciousCount / transactionCount) * 100) 
                      : 0}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Feed</CardTitle>
          <CardDescription>
            Real-time transaction monitoring with compliance checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isMonitoring && transactions.length === 0 ? (
            <Alert>
              <Activity className="w-4 h-4" />
              <AlertDescription>
                Click &quot;Start&quot; to begin monitoring transactions
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div
                  key={`${tx.signature}-${index}`}
                  className={`p-4 rounded-lg border transition-all ${
                    tx.suspicious 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <code className="text-sm font-mono">{tx.signature}</code>
                        {tx.suspicious && (
                          <Badge variant="destructive" className="animate-pulse">
                            Suspicious
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(tx.blockTime)}
                        </span>
                        {tx.amount && (
                          <span>{tx.amount} tokens</span>
                        )}
                      </div>
                      {tx.memo && (
                        <div className="mt-2 p-2 bg-secondary rounded text-sm">
                          <span className="font-medium">Memo:</span> {tx.memo}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(tx.signature)
                        toast.success('Signature copied!')
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="border-purple-500 bg-purple-50 dark:bg-purple-950/20">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Look for patterns in suspicious transactions. Sanctioned entities often use specific keywords in memos or transfer to known flagged addresses.
        </AlertDescription>
      </Alert>
    </div>
  )
}