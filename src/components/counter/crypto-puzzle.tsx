'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Key, 
  Lock, 
  Unlock,
  Hash,
  Binary,
  CheckCircle2,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface PuzzleStage {
  id: number
  title: string
  description: string
  hint: string
  solution: string
}

export function CryptoPuzzle() {
  const [currentStage, setCurrentStage] = useState(0)
  const [input, setInput] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [solvedStages, setSolvedStages] = useState<number[]>([])

  const puzzleStages: PuzzleStage[] = [
    {
      id: 1,
      title: 'Stage 1: Decode the Address',
      description: 'This base58 encoded string contains a wallet address: "3Js7k6xYQbvXv5qX6u8pAR5DzF9nE4Kp9GuP5JdVqsBu"',
      hint: 'This is already a valid Solana address. Try using it as-is!',
      solution: '3Js7k6xYQbvXv5qX6u8pAR5DzF9nE4Kp9GuP5JdVqsBu'
    },
    {
      id: 2,
      title: 'Stage 2: Find the Hidden Message',
      description: 'Decode this hex string: 53414e4354494f4e45445f454e544954595f414c455254',
      hint: 'Convert hex to ASCII. Each pair of hex digits represents one character.',
      solution: 'SANCTIONED_ENTITY_ALERT'
    },
    {
      id: 3,
      title: 'Stage 3: Transaction Signature',
      description: 'The sanctioned transaction has this memo hash (SHA256): "9b7e0c6c3f8a2d1e4f5b6a9c8d7e6f5a4b3c2d1e0f". Find the original 8-character memo.',
      hint: 'The memo is "SANCTION" - verify by hashing it with SHA256',
      solution: 'SANCTION'
    },
    {
      id: 4,
      title: 'Stage 4: Program Derived Address',
      description: 'Calculate the PDA for seeds ["compliance", "sanctioned"] with program ID: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      hint: 'Use PublicKey.findProgramAddressSync() with the given seeds',
      solution: 'PDA_SOLUTION' // This would be calculated dynamically
    }
  ]

  const currentPuzzle = puzzleStages[currentStage]

  const checkSolution = () => {
    setAttempts(attempts + 1)
    
    if (input.trim().toUpperCase() === currentPuzzle.solution.toUpperCase()) {
      toast.success(`🎉 Stage ${currentStage + 1} solved!`)
      setSolvedStages([...solvedStages, currentStage])
      
      if (currentStage < puzzleStages.length - 1) {
        setCurrentStage(currentStage + 1)
        setInput('')
        setShowHint(false)
        setAttempts(0)
      } else {
        toast.success('🏆 All puzzles completed! You found the sanctioned entity!')
      }
    } else {
      toast.error('Incorrect. Try again!')
      
      if (attempts >= 2) {
        setShowHint(true)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Key className="w-6 h-6" />
              Cryptographic Investigation Puzzle
            </CardTitle>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Stage {currentStage + 1} of {puzzleStages.length}
            </Badge>
          </div>
          <CardDescription className="text-base">
            Solve cryptographic challenges to uncover the sanctioned entity&apos;s identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {puzzleStages.map((stage, index) => (
              <div
                key={stage.id}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  solvedStages.includes(index) 
                    ? 'bg-green-500' 
                    : index === currentStage 
                    ? 'bg-yellow-500 animate-pulse' 
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Attempts</p>
              <p className="text-2xl font-bold">{attempts}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Solved</p>
              <p className="text-2xl font-bold text-green-600">{solvedStages.length}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold">{puzzleStages.length - solvedStages.length}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {solvedStages.length * 25}pts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentStage < puzzleStages.length && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStage < solvedStages.length ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Lock className="w-5 h-5 text-yellow-500" />
              )}
              {currentPuzzle.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="font-medium mb-2">Challenge:</p>
              <p className="font-mono text-sm">{currentPuzzle.description}</p>
            </div>

            {showHint && (
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Hint:</strong> {currentPuzzle.hint}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Answer</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background font-mono"
                  placeholder="Enter your solution..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkSolution()}
                />
                <Button onClick={checkSolution}>
                  <Unlock className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setInput('')
                  setAttempts(0)
                  setShowHint(false)
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {solvedStages.length === puzzleStages.length && (
        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Puzzle Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Congratulations! You&apos;ve successfully identified the sanctioned entity:
            </p>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="font-mono text-lg">Address: 3Js7k6xYQbvXv5qX6u8pAR5DzF9nE4Kp9GuP5JdVqsBu</p>
              <p className="font-mono text-lg">Status: SANCTIONED_ENTITY_ALERT</p>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => copyToClipboard('3Js7k6xYQbvXv5qX6u8pAR5DzF9nE4Kp9GuP5JdVqsBu')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Sanctioned Address
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Coding Helper Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Binary className="w-5 h-5" />
            Helper Tools
          </CardTitle>
          <CardDescription>
            Use these tools to help solve the puzzles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button 
              variant="outline"
              onClick={() => window.open('https://www.rapidtables.com/convert/number/hex-to-ascii.html', '_blank')}
            >
              <Hash className="w-4 h-4 mr-2" />
              Hex to ASCII Converter
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://emn178.github.io/online-tools/sha256.html', '_blank')}
            >
              <Lock className="w-4 h-4 mr-2" />
              SHA256 Hash Calculator
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://explorer.solana.com/', '_blank')}
            >
              <Key className="w-4 h-4 mr-2" />
              Solana Explorer
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses', '_blank')}
            >
              <Binary className="w-4 h-4 mr-2" />
              PDA Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}