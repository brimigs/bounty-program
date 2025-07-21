// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import BountyIDL from '../target/idl/bounty.json'
import type { Bounty } from '../target/types/bounty'

// Re-export the generated IDL and type
export { Bounty, BountyIDL }

// The programId is imported from the program IDL.
export const COUNTER_PROGRAM_ID = new PublicKey(BountyIDL.address)

// This is a helper function to get the Bounty Anchor program.
export function getCounterProgram(provider: AnchorProvider, address?: PublicKey): Program<Bounty> {
  return new Program(
    { ...BountyIDL, address: address ? address.toBase58() : BountyIDL.address } as Bounty,
    provider,
  )
}

// This is a helper function to get the program ID for the Bounty program depending on the cluster.
export function getCounterProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Bounty program on devnet and testnet.
      return new PublicKey('vRF8A5fAANqXW8hpDvZ9gsugZKCPYhwGg5mbKffJx6P')
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID
  }
}