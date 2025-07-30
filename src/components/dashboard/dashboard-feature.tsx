'use client'

import { AppHero } from '@/components/app-hero'
import { OnboardingFeature } from '@/components/onboarding/onboarding-feature'
import { useOnboarding } from '@/components/onboarding/use-onboarding'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

const links: { label: string; href: string }[] = [
  { label: 'Solana Docs', href: 'https://docs.solana.com/' },
  { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
  { label: 'Solana Cookbook', href: 'https://solana.com/developers/cookbook/' },
  { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
  { label: 'Solana Developers GitHub', href: 'https://github.com/solana-developers/' },
]

export function DashboardFeature() {
  const { hasCompletedOnboarding, setHasCompletedOnboarding, resetOnboarding } = useOnboarding()

  if (!hasCompletedOnboarding) {
    return <OnboardingFeature onComplete={() => setHasCompletedOnboarding(true)} />
  }

  return (
    <div>
      <AppHero title="Welcome to Compliance Coin" subtitle="Your journey into Solana token compliance starts here!" />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <Button
            onClick={resetOnboarding}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Replay Onboarding
          </Button>
        </div>
        
        <div className="space-y-2">
          <p>Here are some helpful links to get you started.</p>
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="hover:text-gray-500 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
