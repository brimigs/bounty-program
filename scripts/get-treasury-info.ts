import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

async function main() {
  const TREASURY_WALLET = new PublicKey('GrLCFRYBs3cPaEJgu18fMbQAujPJCmgJiD9V9zB4HufC');
  const MINT = new PublicKey('HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z');
  const TRANSFER_HOOK_PROGRAM = new PublicKey('HnX219hWBERpffdNcayam5t5Fju2QHus79uiDdnVqHEH');

  // Derive the treasury token account
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    MINT,
    TREASURY_WALLET,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  console.log('=== Treasury Information for Allowlist ===\n');
  console.log('Treasury Wallet Address:');
  console.log(TREASURY_WALLET.toString());
  console.log('\nTreasury Token Account (THIS IS WHAT NEEDS TO BE ALLOWLISTED):');
  console.log(treasuryTokenAccount.toString());
  console.log('\n=== Additional Information ===\n');
  console.log('Token Mint:', MINT.toString());
  console.log('Transfer Hook Program:', TRANSFER_HOOK_PROGRAM.toString());
  console.log('Transfer Hook Authority:', 'd6DS9s7XJs4CvzBBEbdEvyW8HY2GYbfpdT23WfJP3uq');
  
  console.log('\n=== Instructions for Transfer Hook Authority ===\n');
  console.log('The transfer hook authority needs to call the init_wallet instruction');
  console.log('on the transfer hook program with the following parameters:');
  console.log('- Token Account:', treasuryTokenAccount.toString());
  console.log('- Status: Allow (0)');
}

main().catch(console.error);