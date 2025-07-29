'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey, AccountMeta, AccountInfo } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { BN } from '@coral-xyz/anchor'
import { 
  getExtraAccountMetaAddress, 
  ExtraAccountMetaAccountDataLayout, 
  resolveExtraAccountMeta, 
  ExtraAccountMeta,
  addExtraAccountMetasForExecute 
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
      
      // Derive token accounts
      const [userTokenAccount] = PublicKey.findProgramAddressSync(
        [
          provider.publicKey.toBuffer(),
          tokenProgramId.toBuffer(),
          mint.toBuffer(),
        ],
        new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
      )
      
      const [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
        [
          treasuryWallet.toBuffer(),
          tokenProgramId.toBuffer(),
          mint.toBuffer(),
        ],
        new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
      )
      
      // For Token-2022 with transfer hooks, we need to fetch and add extra accounts
      let remainingAccounts: AccountMeta[] = []
      
      if (isToken2022) {
        try {
          // Use the SPL Token helper to add all required transfer hook accounts
          await addExtraAccountMetasForExecute(
            connection,
            remainingAccounts,
            mint,
            userTokenAccount,
            treasuryTokenAccount,
            provider.publicKey,
            0, // amount doesn't matter for fetching accounts
            'confirmed'
          )
          
          console.log('Transfer hook accounts added:', remainingAccounts.length)
          remainingAccounts.forEach((acc, i) => {
            console.log(`  [${i}] ${acc.pubkey.toString()} (writable: ${acc.isWritable}, signer: ${acc.isSigner})`)
          })
        } catch (error) {
          console.log('Error adding transfer hook accounts:', error)
          // Continue without transfer hook accounts - the transaction will fail but with a clearer error
        }
      }
      
      return program.methods
        .createBounty(address, memo)
        .accounts({
          signer: provider.publicKey,
          bountyAccount: keypair.publicKey,
          programConfig: configPda,
          mint,
          treasuryWallet,
          treasuryTokenAccount,
          userTokenAccount,
          tokenProgram: tokenProgramId,
          associatedTokenProgram: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
          systemProgram: '11111111111111111111111111111111',
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
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_config')],
        programId
      )
      return program.methods
        .initializeConfig(requiredTokenMint)
        .accounts({
          authority: provider.publicKey,
          programConfig: configPda,
          systemProgram: '11111111111111111111111111111111',
        })
        .rpc()
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      toast.success('Config initialized successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to initialize config: ${error.message}`)
    },
  })

  const updateRequiredMint = useMutation({
    mutationKey: ['config', 'update-mint', { cluster }],
    mutationFn: ({ newMint }: { newMint: PublicKey }) => {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_config')],
        programId
      )
      return program.methods
        .updateRequiredMint(newMint)
        .accounts({
          authority: provider.publicKey,
          programConfig: configPda,
        })
        .rpc()
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      toast.success('Required mint updated successfully')
      await configQuery.refetch()
    },
    onError: (error: any) => {
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
          owner: provider.publicKey,
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
          owner: provider.publicKey,
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
      } catch (error) {
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
