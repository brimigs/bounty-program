'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code2, 
  Terminal, 
  Cpu, 
  FileCode,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Play,
  Loader2
} from 'lucide-react'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { toast } from 'sonner'
import bs58 from 'bs58'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  points: number
  completed: boolean
}

export function TechnicalChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<string>('decoder')
  const [decodedData, setDecodedData] = useState<Record<string, unknown> | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const [customRpcQuery, setCustomRpcQuery] = useState('')
  const [rpcResult, setRpcResult] = useState<Record<string, unknown> | null>(null)
  const [memoInput, setMemoInput] = useState('')
  const [decodedMemo, setDecodedMemo] = useState('')
  const [contractCode, setContractCode] = useState(`// Challenge: Write a function to check if an address is sanctioned
// Hint: Check if the memo contains specific keywords

function isSanctioned(memo: string): boolean {
  // Your code here
  
}

// Test your function
const testMemos = [
  "Normal transfer",
  "SANCTIONED: Entity flagged by OFAC",
  "Payment for services",
  "ALERT: Suspicious activity detected"
];

testMemos.forEach(memo => {
  console.log(\`"\${memo}" -> \${isSanctioned(memo)}\`);
});`)

  const challenges: Challenge[] = [
    {
      id: 'decoder',
      title: 'Transaction Decoder',
      description: 'Decode base58 transaction signatures and analyze the data',
      difficulty: 'Easy',
      points: 10,
      completed: false
    },
    {
      id: 'memo-parser',
      title: 'Memo Parser Challenge',
      description: 'Parse and decode transaction memos to find hidden messages',
      difficulty: 'Medium',
      points: 20,
      completed: false
    },
    {
      id: 'rpc-explorer',
      title: 'Custom RPC Explorer',
      description: 'Build custom RPC queries to investigate on-chain data',
      difficulty: 'Hard',
      points: 30,
      completed: false
    },
    {
      id: 'contract-analyzer',
      title: 'Smart Contract Analyzer',
      description: 'Write code to analyze token compliance rules',
      difficulty: 'Medium',
      points: 25,
      completed: false
    }
  ]

  const handleDecode = async () => {
    setIsDecoding(true)
    try {
      // Simulate decoding a transaction or account data
      const mockData = {
        programId: TOKEN_2022_PROGRAM_ID.toBase58(),
        accountType: 'TokenAccount',
        owner: 'DemoSanctionedEntity123...',
        amount: '1000000',
        decimals: 6,
        extensions: ['TransferHook', 'PermanentDelegate'],
        metadata: {
          name: 'Compliance Coin',
          symbol: 'COMP',
          uri: 'https://example.com/metadata.json'
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setDecodedData(mockData)
      toast.success('Data decoded successfully!')
    } catch {
      toast.error('Failed to decode data')
    } finally {
      setIsDecoding(false)
    }
  }

  const handleMemoDecoding = () => {
    try {
      // Try different decoding methods
      const decodings: string[] = []
      
      // Base58 decode
      try {
        const base58Decoded = new TextDecoder().decode(bs58.decode(memoInput))
        decodings.push(`Base58: ${base58Decoded}`)
      } catch {}
      
      // Base64 decode
      try {
        const base64Decoded = atob(memoInput)
        decodings.push(`Base64: ${base64Decoded}`)
      } catch {}
      
      // Hex decode
      try {
        const hexDecoded = memoInput.match(/.{1,2}/g)?.map(byte => 
          String.fromCharCode(parseInt(byte, 16))
        ).join('')
        if (hexDecoded) decodings.push(`Hex: ${hexDecoded}`)
      } catch {}
      
      // Check for patterns
      if (memoInput.toLowerCase().includes('sanction')) {
        decodings.push('⚠️ ALERT: Sanctioned entity keyword detected!')
      }
      
      setDecodedMemo(decodings.join('\\n') || 'No valid encoding detected')
    } catch {
      setDecodedMemo('Failed to decode memo')
    }
  }

  const executeCustomRpc = async () => {
    try {
      setRpcResult({ loading: true })
      
      // Simulate RPC query execution
      const mockResults = {
        'getTokenAccountsByOwner': {
          value: [
            { pubkey: 'TokenAccount1...', account: { data: ['base64data'], owner: 'owner1' } },
            { pubkey: 'TokenAccount2...', account: { data: ['base64data'], owner: 'owner2' } }
          ]
        },
        'getTransaction': {
          slot: 12345,
          transaction: {
            message: {
              accountKeys: ['key1', 'key2'],
              instructions: [{ programIdIndex: 0, accounts: [1], data: 'instructionData' }]
            }
          },
          meta: {
            logMessages: [
              'Program Token2022 invoke [1]',
              'Program log: Transfer hook invoked',
              'Program log: Checking allowlist...',
              'Program log: SANCTIONED ENTITY DETECTED'
            ]
          }
        },
        'getAccountInfo': {
          owner: TOKEN_2022_PROGRAM_ID.toBase58(),
          data: ['base64EncodedData'],
          lamports: 2039280,
          executable: false
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Parse the custom query
      const method = customRpcQuery.split('(')[0]
      const result = mockResults[method as keyof typeof mockResults] || { error: 'Unknown method' }
      
      setRpcResult(result)
      toast.success('RPC query executed!')
    } catch {
      setRpcResult({ error: 'Failed to execute query' })
      toast.error('Invalid RPC query')
    }
  }

  const runContractCode = () => {
    try {
      // Create a safe evaluation environment
      const func = new Function('memo', contractCode + '\\nreturn isSanctioned')
      const isSanctioned = func()
      
      const testMemos = [
        "Normal transfer",
        "SANCTIONED: Entity flagged by OFAC",
        "Payment for services",
        "ALERT: Suspicious activity detected"
      ]
      
      const results = testMemos.map(memo => ({
        memo,
        result: isSanctioned(memo)
      }))
      
      toast.success('Code executed successfully! Check console for results.')
      console.log('Contract Analysis Results:', results)
      
      // Check if the solution is correct
      const expectedResults = [false, true, false, true]
      const isCorrect = results.every((r, i) => r.result === expectedResults[i])
      
      if (isCorrect) {
        toast.success('🎉 Challenge completed! You found the pattern!')
      } else {
        toast.error('Not quite right. Keep trying!')
      }
    } catch (error) {
      toast.error('Error in your code: ' + (error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Code2 className="w-6 h-6" />
            Technical Investigation Challenges
          </CardTitle>
          <CardDescription className="text-base">
            Complete coding challenges to uncover clues about the sanctioned entity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {challenges.map(challenge => (
              <Card 
                key={challenge.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedChallenge === challenge.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedChallenge(challenge.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={
                      challenge.difficulty === 'Easy' ? 'secondary' : 
                      challenge.difficulty === 'Medium' ? 'default' : 
                      'destructive'
                    }>
                      {challenge.difficulty}
                    </Badge>
                    <span className="text-sm font-bold">{challenge.points} pts</span>
                  </div>
                  <h4 className="font-semibold text-sm">{challenge.title}</h4>
                  {challenge.completed && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedChallenge} onValueChange={setSelectedChallenge}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="decoder">
            <Cpu className="w-4 h-4 mr-2" />
            Decoder
          </TabsTrigger>
          <TabsTrigger value="memo-parser">
            <FileCode className="w-4 h-4 mr-2" />
            Memo Parser
          </TabsTrigger>
          <TabsTrigger value="rpc-explorer">
            <Terminal className="w-4 h-4 mr-2" />
            RPC Explorer
          </TabsTrigger>
          <TabsTrigger value="contract-analyzer">
            <Lock className="w-4 h-4 mr-2" />
            Contract
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decoder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Data Decoder</CardTitle>
              <CardDescription>
                Decode and analyze on-chain account data to find compliance information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Account Address or Transaction Signature</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
                    placeholder="HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z"
                  />
                  <Button onClick={handleDecode} disabled={isDecoding}>
                    {isDecoding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Decoding...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Decode
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {decodedData && (
                <div className="p-4 bg-black text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{JSON.stringify(decodedData, null, 2)}</pre>
                </div>
              )}

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Look for extensions like TransferHook and PermanentDelegate - these are used for compliance!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memo-parser" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memo Decoder Challenge</CardTitle>
              <CardDescription>
                Transaction memos might be encoded. Try different decoding methods!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Encoded Memo</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background min-h-[100px] font-mono"
                  placeholder="U0FOQ1RJT05FRDogRW50aXR5IGZsYWdnZWQgYnkgT0ZBQw=="
                  value={memoInput}
                  onChange={(e) => setMemoInput(e.target.value)}
                />
              </div>

              <Button onClick={handleMemoDecoding} className="w-full">
                <Unlock className="w-4 h-4 mr-2" />
                Decode Memo
              </Button>

              {decodedMemo && (
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm font-medium mb-2">Decoded Results:</p>
                  <pre className="whitespace-pre-wrap text-sm">{decodedMemo}</pre>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  Hint: Try base58, base64, or hex encoding. Look for keywords like &quot;SANCTIONED&quot; or &quot;OFAC&quot;
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rpc-explorer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom RPC Query Builder</CardTitle>
              <CardDescription>
                Write custom RPC queries to investigate on-chain data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">RPC Method</label>
                <div className="flex gap-2">
                  <select 
                    className="px-4 py-2 rounded-lg border border-input bg-background"
                    onChange={(e) => setCustomRpcQuery(e.target.value)}
                  >
                    <option value="">Select a method...</option>
                    <option value="getTokenAccountsByOwner(owner, {programId: TOKEN_2022})">
                      getTokenAccountsByOwner
                    </option>
                    <option value="getTransaction(signature, {maxSupportedTransactionVersion: 0})">
                      getTransaction
                    </option>
                    <option value="getAccountInfo(pubkey)">
                      getAccountInfo
                    </option>
                  </select>
                  <Button onClick={executeCustomRpc} disabled={!customRpcQuery}>
                    <Terminal className="w-4 h-4 mr-2" />
                    Execute
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-black text-green-400 rounded-lg font-mono text-xs">
                <div className="mb-2 text-gray-400"># Custom RPC Query</div>
                <div>{customRpcQuery || '// Select a method above'}</div>
              </div>

              {rpcResult && !rpcResult.loading && (
                <div className="p-4 bg-black text-green-400 rounded-lg font-mono text-xs overflow-x-auto">
                  <div className="mb-2 text-gray-400"># Result</div>
                  <pre>{JSON.stringify(rpcResult, null, 2)}</pre>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  Pro tip: Check transaction logs for compliance-related messages!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract-analyzer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Contract Code Challenge</CardTitle>
              <CardDescription>
                Write a function to detect sanctioned entities based on memo patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Code Editor</label>
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(contractCode)
                    toast.success('Code copied!')
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-input bg-black text-green-400 font-mono text-sm min-h-[300px]"
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={runContractCode} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://jsfiddle.net', '_blank')}
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  Open in JSFiddle
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  Complete the function to identify sanctioned entities. Check the console for test results!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}