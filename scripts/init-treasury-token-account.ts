import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function main() {
  // Constants
  const TREASURY_WALLET = new PublicKey('GrLCFRYBs3cPaEJgu18fMbQAujPJCmgJiD9V9zB4HufC');
  const MINT = new PublicKey('HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z');

  // Load the wallet keypair (payer)
  const homeDir = os.homedir();
  const walletPath = path.join(homeDir, '.config', 'solana', 'id.json');
  const payerKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  try {
    // Derive the treasury token account
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      MINT,
      TREASURY_WALLET,
      false, // allowOwnerOffCurve
      TOKEN_2022_PROGRAM_ID
    );

    console.log('Treasury Token Account Address:', treasuryTokenAccount.toString());

    // Check if the account already exists
    const accountInfo = await connection.getAccountInfo(treasuryTokenAccount);
    
    if (accountInfo) {
      console.log('✅ Treasury token account already exists!');
      console.log('Owner:', accountInfo.owner.toString());
      console.log('Balance:', accountInfo.lamports / 1e9, 'SOL');
      return;
    }

    console.log('❌ Treasury token account does not exist. Creating it...');

    // Create the instruction to initialize the token account
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      payerKeypair.publicKey, // payer
      treasuryTokenAccount,    // ata
      TREASURY_WALLET,         // owner
      MINT,                    // mint
      TOKEN_2022_PROGRAM_ID,   // token program
      ASSOCIATED_TOKEN_PROGRAM_ID // associated token program
    );

    // Create and send transaction
    const transaction = new Transaction().add(createATAInstruction);
    
    console.log('Sending transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payerKeypair],
      { commitment: 'confirmed' }
    );

    console.log('✅ Treasury token account created successfully!');
    console.log('Transaction signature:', signature);
    console.log('Treasury token account:', treasuryTokenAccount.toString());
    
    console.log('\n⚠️  Important: This token account still needs to be added to the transfer hook allowlist');
    console.log('The transfer hook authority needs to initialize the ab_wallet for this account.');

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);