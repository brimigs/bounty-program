// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TestTransferHookIDL from '../target/idl/test_transfer_hook.json'
import type { TestTransferHook } from '../target/types/test_transfer_hook'

// Re-export the generated IDL and type
export { TestTransferHook, TestTransferHookIDL }

// The programId is imported from the program IDL.
export const COUNTER_PROGRAM_ID = new PublicKey(TestTransferHookIDL.address)

// This is a helper function to get the TestTransferHook Anchor program.
export function getCounterProgram(provider: AnchorProvider, address?: PublicKey): Program<TestTransferHook> {
  return new Program(
    { ...TestTransferHookIDL, address: address ? address.toBase58() : TestTransferHookIDL.address } as TestTransferHook,
    provider,
  )
}

// This is a helper function to get the program ID for the TestTransferHook program depending on the cluster.
export function getCounterProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the TestTransferHook program on devnet and testnet.
      return new PublicKey('vRF8A5fAANqXW8hpDvZ9gsugZKCPYhwGg5mbKffJx6P')
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID
  }
}
