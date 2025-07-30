import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  UserPlus, 
  Coins, 
  Search, 
  Trophy,
  Clock,
  Users,
  CheckCircle2
} from 'lucide-react'

interface WorkshopStep {
  number: number
  title: string
  description: string
  icon: React.ReactNode
  duration: string
  interactive: boolean
}

export function WorkshopOverview() {
  const workshopSteps: WorkshopStep[] = [
    {
      number: 1,
      title: 'Explore Compliance Coin',
      description: 'View the token on Solana Explorer and understand its metadata, allowlist transfer hook, and permanent delegate extensions',
      icon: <Search className="w-5 h-5" />,
      duration: '5 min',
      interactive: false
    },
    {
      number: 2,
      title: 'Create Your Wallet',
      description: 'Set up a Solana wallet and submit your address to join the workshop',
      icon: <Wallet className="w-5 h-5" />,
      duration: '5 min',
      interactive: true
    },
    {
      number: 3,
      title: 'Join the Allowlist',
      description: 'Watch as your wallet is added to the allowlist in real-time',
      icon: <UserPlus className="w-5 h-5" />,
      duration: '2 min',
      interactive: false
    },
    {
      number: 4,
      title: 'Receive Compliance Coins',
      description: 'Get your tokens and see the transfer hook in action',
      icon: <Coins className="w-5 h-5" />,
      duration: '3 min',
      interactive: true
    },
    {
      number: 5,
      title: 'Bounty Hunt Challenge',
      description: 'Search for sanctioned entities on the blockchain and submit your findings',
      icon: <Trophy className="w-5 h-5" />,
      duration: '10-15 min',
      interactive: true
    }
  ]

  const totalDuration = '25-30 minutes'

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Workshop Journey</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Your step-by-step guide to mastering Solana token compliance
        </p>
        <div className="flex justify-center items-center gap-4 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalDuration}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Interactive Workshop
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {workshopSteps.map((step, index) => (
          <Card key={step.number} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">{step.number}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {step.icon}
                    {step.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {step.duration}
                    </Badge>
                    {step.interactive && (
                      <Badge className="bg-blue-600 text-xs">
                        Interactive
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>

                {index < workshopSteps.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Workshop Goals
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
            <span className="text-sm">Understand how Token Extensions enable compliance</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
            <span className="text-sm">Experience allowlist functionality firsthand</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
            <span className="text-sm">Learn to identify compliance violations on-chain</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
            <span className="text-sm">Compete in a fun bounty hunting challenge</span>
          </li>
        </ul>
      </Card>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ready to start your compliance journey?
        </p>
        <div className="inline-flex items-center gap-2 text-purple-600 font-medium">
          <span>Click &quot;Start Workshop&quot; to begin</span>
          <Trophy className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}