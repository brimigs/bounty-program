'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCounterProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['bounty', 'all', { cluster }],
    queryFn: () => program.account.bountyInfo.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createBounty = useMutation({
    mutationKey: ['bounty', 'create', { cluster }],
    mutationFn: ({ keypair, address, memo }: { keypair: Keypair; address: PublicKey; memo: string }) =>
      program.methods
        .createBounty(address, memo)
        .accounts({
          bountyAccount: keypair.publicKey,
          signer: provider.publicKey,
          systemProgram: '11111111111111111111111111111111',
        })
        .signers([keypair])
        .rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to create bounty')
    },
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createBounty,
  }
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const { program } = useCounterProgram()

  const accountQuery = useQuery({
    queryKey: ['bounty', 'fetch', { cluster, account }],
    queryFn: () => program.account.bountyInfo.fetch(account),
  })

  return {
    accountQuery,
  }
}
