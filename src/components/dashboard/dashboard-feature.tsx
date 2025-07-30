'use client'

import { AppHero } from '@/components/app-hero'
import { OnboardingFeature } from '@/components/onboarding/onboarding-feature'
import { useOnboarding } from '@/components/onboarding/use-onboarding'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RefreshCw, AlertTriangle, Award, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DashboardFeature() {
  const { hasCompletedOnboarding, setHasCompletedOnboarding, resetOnboarding } = useOnboarding()
  const router = useRouter()

  if (!hasCompletedOnboarding) {
    return <OnboardingFeature onComplete={() => setHasCompletedOnboarding(true)} />
  }

  return (
    <div>
      <AppHero title="Your Challenge" subtitle="Investigate on-chain activity to identify sanctioned entities" />
      <div className="max-w-4xl mx-auto py-2 sm:px-6 lg:px-8">
        <Card className="p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Compliance Alert: Sanctioned Entity Investigation
              </h2>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Your company issued a regulated token with strict compliance extensions: an enforceable allowlist, 
                  onchain metadata, memo required on transfer, and permanent delegate authority.
                </p>
                
                <p>
                  Recently, tokens were traced to a sanctioned entity. To uphold regulatory obligations, those 
                  tokens must be recovered — but only approved, trusted users (those on the allowlist) can 
                  formally request recovery.
                </p>
                
                <p>
                  In this scenario, the sanctioned entity was discovered through memos that were made when 
                  transferring the token.
                </p>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-yellow-500" />
                    <h3 className="font-semibold text-lg">Bounty Program</h3>
                  </div>
                  <p className="text-sm">
                    As a compliance bounty program, users who discover sanctioned activity and submit verified 
                    reports to the permanent delegate receive a reward.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => router.push('/counter')}
              size="lg"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
        
        <div className="text-center mt-8">
          <Button
            onClick={resetOnboarding}
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Replay Onboarding
          </Button>
        </div>
      </div>
    </div>
  )
}
