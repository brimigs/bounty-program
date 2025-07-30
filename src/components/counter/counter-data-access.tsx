'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey, AccountMeta } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { BN } from '@coral-xyz/anchor'
import { 
  ExtraAccountMetaAccountDataLayout, 
  resolveExtraAccountMeta 
} from '@solana/spl-token'

export function deriveBountyTokenAccount(bountyAccount: PublicKey, mint: PublicKey): PublicKey {
  // Derive the associated token account for the bounty
  const [bountyTokenAccount] = PublicKey.findProgramAddressSync(
    [
      bountyAccount.toBuffer(),
      new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(), // Default to Token program
      mint.toBuffer(),
    ],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  )
  return bountyTokenAccount
}

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
    mutationFn: async ({ keypair, address, memo }: { keypair: Keypair; address: PublicKey; memo: string }) => {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_config')],
        programId
      )
      
      // Get config to know the required mint
      const config = await program.account.programConfig.fetch(configPda)
      const mint = config.requiredTokenMint
      
      // Check if the mint uses Token-2022 or regular SPL Token
      const mintInfo = await connection.getAccountInfo(mint)
      if (!mintInfo) {
        throw new Error('Mint account not found')
      }
      
      const isToken2022 = mintInfo.owner.equals(new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'))
      const tokenProgramId = isToken2022 
        ? new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
        : new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      
      // Treasury wallet address
      const treasuryWallet = new PublicKey('d6DS9s7XJs4CvzBBEbdEvyW8HY2GYbfpdT23WfJP3uq')
      
      
      
      // For Token-2022 with transfer hooks, we need to fetch and add extra accounts
      const remainingAccounts: AccountMeta[] = []
      
      if (isToken2022) {
        try {
          // Get extra account metas if transfer hooks are enabled
          const [extraAccountMetaPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('extra-account-metas'), mint.toBuffer()],
            new PublicKey('7EWJHhmCttWpjqEUNmqGaW7bQWebnFfwNen7WXGxk5dV') // Transfer Hook Interface
          )
          
          const extraAccountInfo = await connection.getAccountInfo(extraAccountMetaPDA)
          if (extraAccountInfo && extraAccountInfo.data.length > 0) {
            const extraAccountMetas = ExtraAccountMetaAccountDataLayout.decode(extraAccountInfo.data)
            
            // Resolve PDAs for transfer instruction (discriminator: 163, 52, 200, 231, 140, 3, 69, 186)
            const transferDiscriminator = Buffer.from([163, 52, 200, 231, 140, 3, 69, 186])
            
            for (const extraMeta of extraAccountMetas.extraAccountsList.extraAccounts) {
              const resolvedMeta = await resolveExtraAccountMeta(
                connection,
                extraMeta,
                [], // Empty array for now - we'll need to fix this based on the transfer hook requirements
                transferDiscriminator,
                programId
              )
              remainingAccounts.push(resolvedMeta)
            }
          }
        } catch {
          console.log('No transfer hook extra accounts needed')
        }
      }
      
      return program.methods
        .createBounty(address, memo)
        .accounts({
          signer: provider.publicKey,
          bountyAccount: keypair.publicKey,
          mint,
          treasuryWallet,
          tokenProgram: tokenProgramId,
        })
        .remainingAccounts(remainingAccounts)
        .signers([keypair])
        .rpc()
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to create bounty')
    },
  })

  const initializeConfig = useMutation({
    mutationKey: ['config', 'initialize', { cluster }],
    mutationFn: ({ requiredTokenMint }: { requiredTokenMint: PublicKey }) => {
      return program.methods
        .initializeConfig(requiredTokenMint)
        .accounts({
          authority: provider.publicKey,
        })
        .rpc()
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      toast.success('Config initialized successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to initialize config: ${error.message}`)
    },
  })

  const updateRequiredMint = useMutation({
    mutationKey: ['config', 'update-mint', { cluster }],
    mutationFn: ({ newMint }: { newMint: PublicKey }) => {
      return program.methods
        .updateRequiredMint(newMint)
        .accounts({
          authority: provider.publicKey,
        })
        .rpc()
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      toast.success('Required mint updated successfully')
      await configQuery.refetch()
    },
    onError: (error: Error) => {
      toast.error(`Failed to update required mint: ${error.message}`)
    },
  })

  const updateBounty = useMutation({
    mutationKey: ['bounty', 'update', { cluster }],
    mutationFn: ({ bountyAccount, address, memo }: { bountyAccount: PublicKey; address: PublicKey; memo: string }) =>
      program.methods
        .updateBounty(address, memo)
        .accounts({
          signer: provider.publicKey,
          bountyAccount,
        })
        .rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to update bounty')
    },
  })

  const deleteBounty = useMutation({
    mutationKey: ['bounty', 'delete', { cluster }],
    mutationFn: ({ bountyAccount }: { bountyAccount: PublicKey }) =>
      program.methods
        .deleteBounty()
        .accounts({
          signer: provider.publicKey,
          bountyAccount,
        })
        .rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to delete bounty')
    },
  })

  const burnTokens = useMutation({
    mutationKey: ['token', 'burn', { cluster }],
    mutationFn: async ({ targetWallet, amount }: { targetWallet: PublicKey; amount: number }) => {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_config')],
        programId
      )
      
      const config = await program.account.programConfig.fetch(configPda)
      const mint = config.requiredTokenMint
      
      // Check if the mint uses Token-2022
      const mintInfo = await connection.getAccountInfo(mint)
      if (!mintInfo) {
        throw new Error('Mint account not found')
      }
      
      const isToken2022 = mintInfo.owner.equals(new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'))
      const tokenProgramId = isToken2022 
        ? new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
        : new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      
      
      // For Token-2022 with transfer hooks, we need to fetch and add extra accounts
      const remainingAccounts: AccountMeta[] = []
      
      if (isToken2022) {
        try {
          // Get extra account metas if transfer hooks are enabled
          const [extraAccountMetaPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('extra-account-metas'), mint.toBuffer()],
            new PublicKey('7EWJHhmCttWpjqEUNmqGaW7bQWebnFfwNen7WXGxk5dV') // Transfer Hook Interface
          )
          
          const extraAccountInfo = await connection.getAccountInfo(extraAccountMetaPDA)
          if (extraAccountInfo && extraAccountInfo.data.length > 0) {
            const extraAccountMetas = ExtraAccountMetaAccountDataLayout.decode(extraAccountInfo.data)
            
            // Resolve PDAs for burn instruction (discriminator: 116, 110, 29, 56, 107, 219, 42, 137)
            const burnDiscriminator = Buffer.from([116, 110, 29, 56, 107, 219, 42, 137])
            
            for (const extraMeta of extraAccountMetas.extraAccountsList.extraAccounts) {
              const resolvedMeta = await resolveExtraAccountMeta(
                connection,
                extraMeta,
                [], // Empty array for now - we'll need to fix this based on the transfer hook requirements
                burnDiscriminator,
                programId
              )
              remainingAccounts.push(resolvedMeta)
            }
          }
        } catch {
          console.log('No transfer hook extra accounts needed for burn')
        }
      }
      
      return program.methods
        .burnTokens(new BN(amount))
        .accountsPartial({
          authority: provider.publicKey,
          mint,
          targetWallet,
          tokenProgram: tokenProgramId,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      toast.success('Token burned successfully')
      await userTokenBalanceQuery.refetch()
    },
    onError: (error: Error) => {
      console.error('Burn error:', error)
      toast.error(`Failed to burn token: ${error.message || 'Unknown error'}`)
    },
  })

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_config')],
    programId
  )

  const configQuery = useQuery({
    queryKey: ['config', 'fetch', { cluster, configPda }],
    queryFn: () => program.account.programConfig.fetch(configPda),
    retry: false,
  })

  // Query to check user's token balance
  const userTokenBalanceQuery = useQuery({
    queryKey: ['token', 'balance', { cluster, user: provider.publicKey, mint: configQuery.data?.requiredTokenMint }],
    queryFn: async () => {
      if (!configQuery.data?.requiredTokenMint || !provider.publicKey) {
        return null
      }
      
      const mint = configQuery.data.requiredTokenMint
      
      // First check if the mint uses Token-2022 or regular SPL Token
      const mintInfo = await connection.getAccountInfo(mint)
      if (!mintInfo) {
        return null
      }
      
      // Check the owner to determine token program
      const isToken2022 = mintInfo.owner.equals(new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'))
      const tokenProgramId = isToken2022 
        ? new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
        : new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      
      // Derive the associated token account
      const [userTokenAccount] = PublicKey.findProgramAddressSync(
        [
          provider.publicKey.toBuffer(),
          tokenProgramId.toBuffer(),
          mint.toBuffer(),
        ],
        new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
      )
      
      try {
        const accountInfo = await connection.getTokenAccountBalance(userTokenAccount)
        return accountInfo.value
      } catch {
        // Try the other token program if the first one fails
        const alternateTokenProgramId = isToken2022 
          ? new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
          : new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
          
        const [alternateTokenAccount] = PublicKey.findProgramAddressSync(
          [
            provider.publicKey.toBuffer(),
            alternateTokenProgramId.toBuffer(),
            mint.toBuffer(),
          ],
          new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
        )
        
        try {
          const alternateAccountInfo = await connection.getTokenAccountBalance(alternateTokenAccount)
          return alternateAccountInfo.value
        } catch {
          // Account doesn't exist or has 0 balance
          return null
        }
      }
    },
    enabled: !!configQuery.data?.requiredTokenMint && !!provider.publicKey,
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createBounty,
    initializeConfig,
    updateRequiredMint,
    updateBounty,
    deleteBounty,
    burnTokens,
    configQuery,
    userTokenBalanceQuery,
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
