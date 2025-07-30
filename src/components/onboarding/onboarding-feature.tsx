'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { WelcomeScreen } from './welcome-screen'
import { TokenExtensionsExplainer } from './token-extensions-explainer'
import { ComplianceFlowDiagram } from './compliance-flow-diagram'
import { WorkshopOverview } from './workshop-overview'
import { WalletOptions } from './wallet-options'

export interface OnboardingStep {
  id: string
  title: string
  component: React.ReactNode
}

interface OnboardingFeatureProps {
  onComplete: () => void
}

export function OnboardingFeature({ onComplete }: OnboardingFeatureProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Compliance Coin Workshop',
      component: <WelcomeScreen />,
    },
    {
      id: 'token-extensions',
      title: 'Understanding Token Extensions',
      component: <TokenExtensionsExplainer />,
    },
    {
      id: 'compliance-flow',
      title: 'Compliance Flow',
      component: <ComplianceFlowDiagram />,
    },
    {
      id: 'wallet-options',
      title: 'Wallet Options',
      component: <WalletOptions />,
    },
    {
      id: 'workshop-overview',
      title: 'Workshop Overview',
      component: <WorkshopOverview />,
    },
  ]

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl">
        {/* Progress Indicators */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`flex items-center ${
                  index !== steps.length - 1 ? 'flex-1' : ''
                }`}
                disabled={!completedSteps.has(index) && index > currentStep}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    index === currentStep
                      ? 'bg-purple-600 text-white scale-110'
                      : completedSteps.has(index)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {completedSteps.has(index) ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      completedSteps.has(index)
                        ? 'bg-green-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
          <h2 className="text-center text-xl font-semibold text-gray-800 dark:text-gray-200">
            {steps[currentStep].title}
          </h2>
        </div>

        {/* Content */}
        <Card className="p-8 min-h-[500px] flex flex-col">
          <div className="flex-1">{steps[currentStep].component}</div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {currentStep === steps.length - 1 ? 'Start Workshop' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}