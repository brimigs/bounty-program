'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  hasCompletedOnboarding: boolean
  currentStep: number
  completedSteps: number[]
  setHasCompletedOnboarding: (completed: boolean) => void
  setCurrentStep: (step: number) => void
  markStepCompleted: (step: number) => void
  resetOnboarding: () => void
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      currentStep: 0,
      completedSteps: [],
      setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),
      setCurrentStep: (step) => set({ currentStep: step }),
      markStepCompleted: (step) => set((state) => ({
        completedSteps: [...new Set([...state.completedSteps, step])]
      })),
      resetOnboarding: () => set({
        hasCompletedOnboarding: false,
        currentStep: 0,
        completedSteps: []
      })
    }),
    {
      name: 'compliance-coin-onboarding'
    }
  )
)