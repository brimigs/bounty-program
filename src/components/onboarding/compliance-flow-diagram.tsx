'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  UserCheck, 
  Send, 
  Shield, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Info
} from 'lucide-react'

interface FlowStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'success' | 'blocked'
}

export function ComplianceFlowDiagram() {
  const [selectedStep, setSelectedStep] = useState<string>('wallet-creation')
  const [simulationMode, setSimulationMode] = useState<'compliant' | 'non-compliant'>('compliant')

  const getSteps = (mode: 'compliant' | 'non-compliant'): FlowStep[] => {
    const baseSteps: FlowStep[] = [
      {
        id: 'wallet-creation',
        title: 'Create Wallet',
        description: 'User creates a Solana wallet to participate',
        icon: <Wallet className="w-6 h-6" />,
        status: 'success'
      },
      {
        id: 'allowlist-check',
        title: 'Allowlist Verification',
        description: mode === 'compliant' 
          ? 'Wallet is verified against the allowlist'
          : 'Wallet is NOT on the allowlist',
        icon: <UserCheck className="w-6 h-6" />,
        status: mode === 'compliant' ? 'success' : 'blocked'
      },
      {
        id: 'token-transfer',
        title: 'Token Transfer',
        description: mode === 'compliant'
          ? 'Transfer hook validates and approves transfer'
          : 'Transfer blocked by compliance rules',
        icon: <Send className="w-6 h-6" />,
        status: mode === 'compliant' ? 'success' : 'blocked'
      },
      {
        id: 'compliance-monitoring',
        title: 'Ongoing Compliance',
        description: mode === 'compliant'
          ? 'Permanent delegate monitors for compliance'
          : 'Non-compliant activity detected',
        icon: <Shield className="w-6 h-6" />,
        status: mode === 'compliant' ? 'success' : 'blocked'
      }
    ]

    return baseSteps
  }

  const steps = getSteps(simulationMode)

  const getStepDetails = (stepId: string) => {
    const details: Record<string, { info: string; technical: string }> = {
      'wallet-creation': {
        info: 'Users need a Solana wallet to interact with Compliance Coin. This can be any standard Solana wallet.',
        technical: 'Standard Solana wallet creation process. No special requirements at this stage.'
      },
      'allowlist-check': {
        info: simulationMode === 'compliant'
          ? 'The Transfer Hook extension checks if the wallet address is on the approved allowlist before allowing any transfers.'
          : 'Transfers are blocked because the wallet is not on the allowlist. Only pre-approved addresses can transact.',
        technical: 'Transfer Hook CPI validates sender and receiver addresses against on-chain allowlist before transfer execution.'
      },
      'token-transfer': {
        info: simulationMode === 'compliant'
          ? 'Once verified, tokens can be transferred. The transfer hook runs automatically with every transfer.'
          : 'The transfer is rejected by the transfer hook program because compliance checks failed.',
        technical: 'Token-2022 transfer instruction triggers CPI to transfer hook program for validation.'
      },
      'compliance-monitoring': {
        info: simulationMode === 'compliant'
          ? 'The permanent delegate continuously monitors for compliance violations and can take action if needed.'
          : 'The permanent delegate can freeze or burn tokens if compliance violations are detected.',
        technical: 'Permanent delegate has irrevocable authority to execute burn or transfer operations for compliance enforcement.'
      }
    }
    return details[stepId] || { info: '', technical: '' }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-4">Compliance Flow Visualization</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          See how token extensions work together to enforce compliance
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setSimulationMode('compliant')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              simulationMode === 'compliant'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <CheckCircle className="inline w-4 h-4 mr-2" />
            Compliant Flow
          </button>
          <button
            onClick={() => setSimulationMode('non-compliant')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              simulationMode === 'non-compliant'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <XCircle className="inline w-4 h-4 mr-2" />
            Non-Compliant Flow
          </button>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="relative">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                onClick={() => setSelectedStep(step.id)}
                className={`cursor-pointer transition-all ${
                  selectedStep === step.id ? 'scale-110' : ''
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    step.status === 'success'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : step.status === 'blocked'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                  }`}
                >
                  {step.icon}
                </div>
                <p className="text-xs text-center mt-2 font-medium max-w-[80px]">
                  {step.title}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="mx-2">
                  <ArrowRight 
                    className={`w-6 h-6 ${
                      steps[index + 1].status === 'blocked' 
                        ? 'text-red-500' 
                        : 'text-gray-400'
                    }`} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Step Details */}
      <Card className="p-6">
        {steps.map((step) => {
          if (step.id !== selectedStep) return null
          const details = getStepDetails(step.id)
          
          return (
            <div key={step.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {step.icon}
                  {step.title}
                </h3>
                <Badge 
                  variant={step.status === 'success' ? 'default' : 'destructive'}
                  className={
                    step.status === 'success' 
                      ? 'bg-green-600' 
                      : step.status === 'blocked'
                      ? 'bg-red-600'
                      : ''
                  }
                >
                  {step.status === 'success' ? 'Allowed' : 'Blocked'}
                </Badge>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    How it works
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{details.info}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-1">Technical Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{details.technical}</p>
                </div>
              </div>

              {step.status === 'blocked' && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-300">
                        Compliance Violation
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        This step shows how the compliance system prevents unauthorized actions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </Card>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Click on any step in the flow to see details
      </div>
    </div>
  )
}