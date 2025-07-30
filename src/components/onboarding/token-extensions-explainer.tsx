'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Shield, Database, Key, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

interface ExtensionCard {
  id: string
  title: string
  icon: React.ReactNode
  shortDescription: string
  detailedDescription: string
  useCases: string[]
  technicalDetails: string
  complianceFeature: string
}

export function TokenExtensionsExplainer() {
  const [expandedCard, setExpandedCard] = useState<string | null>('allowlist')

  const extensions: ExtensionCard[] = [
    {
      id: 'allowlist',
      title: 'Allowlist Transfer Hook',
      icon: <Shield className="w-6 h-6" />,
      shortDescription: 'Control who can receive and send tokens',
      detailedDescription: 'The Transfer Hook extension enables custom logic to be executed during token transfers. For compliance, this allows implementing allowlists that restrict transfers to pre-approved addresses only.',
      useCases: [
        'KYC/AML compliance',
        'Accredited investor verification',
        'Geographic restrictions',
        'Regulatory compliance'
      ],
      technicalDetails: 'Requires a CPI (Cross-Program Invocation) to a transfer hook program that validates transfers against an allowlist before execution.',
      complianceFeature: 'Ensures only verified, compliant entities can participate in token transfers'
    },
    {
      id: 'permanent-delegate',
      title: 'Permanent Delegate',
      icon: <Key className="w-6 h-6" />,
      shortDescription: 'Irrevocable authority for compliance enforcement',
      detailedDescription: 'A permanent delegate has irrevocable authority over token operations. This enables compliance programs to maintain control over tokens for regulatory purposes.',
      useCases: [
        'Asset recovery for fraud',
        'Court-ordered freezing',
        'Regulatory compliance actions',
        'Emergency intervention'
      ],
      technicalDetails: 'The mint designates a permanent delegate that cannot be revoked, giving it authority to burn or transfer tokens as needed.',
      complianceFeature: 'Provides mechanisms for regulatory intervention and compliance enforcement'
    },
    {
      id: 'metadata',
      title: 'Metadata Extension',
      icon: <Database className="w-6 h-6" />,
      shortDescription: 'Rich token information and compliance data',
      detailedDescription: 'Embed metadata directly into the token mint, including compliance information, regulatory status, and other relevant data for business use cases.',
      useCases: [
        'Token identification',
        'Regulatory information',
        'Compliance certificates',
        'Audit trail references'
      ],
      technicalDetails: 'Stores arbitrary key-value pairs directly in the token mint account, accessible on-chain without external calls.',
      complianceFeature: 'Provides transparent, on-chain compliance information for all participants'
    }
  ]

  const toggleExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Token Extensions for Compliance</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Solana&apos;s Token-2022 program introduces powerful extensions that enable built-in compliance features
        </p>
      </div>

      <div className="space-y-4">
        {extensions.map((extension) => {
          const isExpanded = expandedCard === extension.id
          
          return (
            <Card
              key={extension.id}
              className={`p-6 cursor-pointer transition-all ${
                isExpanded ? 'ring-2 ring-purple-600' : 'hover:shadow-lg'
              }`}
              onClick={() => toggleExpand(extension.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-purple-600">{extension.icon}</div>
                    <h3 className="text-xl font-semibold">{extension.title}</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{extension.shortDescription}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Badge variant="outline" className="ml-auto">
                      Click to {isExpanded ? 'collapse' : 'expand'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {extension.shortDescription}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm leading-relaxed">{extension.detailedDescription}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-purple-600" />
                            Use Cases
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {extension.useCases.map((useCase, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-600 mt-1">•</span>
                                <span>{useCase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Technical Implementation</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {extension.technicalDetails}
                          </p>
                        </div>
                      </div>

                      <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                        <h4 className="font-semibold mb-1 text-purple-800 dark:text-purple-300">
                          Compliance Feature
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-400">
                          {extension.complianceFeature}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 text-gray-400">
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            These extensions work together to create a comprehensive compliance framework. 
            In this workshop, you&apos;ll see how Compliance Coin uses all three to ensure regulatory compliance.
          </span>
        </p>
      </div>
    </div>
  )
}