import { Shield, Coins, Users, Target } from 'lucide-react'

export function WelcomeScreen() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-24 h-24 text-purple-600" />
            <Coins className="w-12 h-12 text-yellow-500 absolute -bottom-2 -right-2" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Welcome to Compliance Coin Workshop
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Learn how Solana&apos;s Token Extensions enable business compliance in a fun, hands-on way!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <FeatureCard
          icon={<Shield className="w-8 h-8" />}
          title="Compliance Made Easy"
          description="Discover how token extensions enable built-in compliance features for real-world use cases"
        />
        <FeatureCard
          icon={<Users className="w-8 h-8" />}
          title="Interactive Learning"
          description="Get hands-on experience with allowlists, metadata, and permanent delegates"
        />
        <FeatureCard
          icon={<Target className="w-8 h-8" />}
          title="Bounty Hunt Challenge"
          description="Put your skills to the test by finding sanctioned entities in a gamified environment"
        />
      </div>

      <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-lg mb-2">What You&apos;ll Learn:</h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>How Token Extensions work on Solana</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Implementing allowlists for controlled token transfers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Using permanent delegates for compliance enforcement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Metadata integration for enhanced token information</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-purple-600 mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  )
}