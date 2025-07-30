import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Constants
const TRANSFER_HOOK_PROGRAM = new PublicKey('CW8xj9GkRSGqG2MtgizRKci5RNYeug4FofFJUAJBhJmA');
const TREASURY_WALLET = new PublicKey('GrLCFRYBs3cPaEJgu18fMbQAujPJCmgJiD9V9zB4HufC');
const MINT = new PublicKey('AfFvJhNEp9xwGYQR5q1exU5xxbcDgaZUeU7K5B29GqqD');

// Instruction discriminator for init_wallet (first 8 bytes of sha256("global:init_wallet"))
const INIT_WALLET_DISCRIMINATOR = Buffer.from([219, 89, 106, 226, 125, 109, 126, 231]);

async function main() {
  // Load the wallet keypair
  const homeDir = os.homedir();
  const walletPath = path.join(homeDir, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  console.log('Wallet public key:', walletKeypair.publicKey.toString());

  // Derive the treasury token account
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    MINT,
    TREASURY_WALLET,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  // Derive the AB wallet PDA
  const [abWalletPDA] = PublicKey.findProgramAddressSync(
    [treasuryTokenAccount.toBuffer()],
    TRANSFER_HOOK_PROGRAM
  );

  // Derive the config PDA
  const [configPDA] = PublicKey.findProgramAddressSync(
    [MINT.toBuffer()],
    TRANSFER_HOOK_PROGRAM
  );

  console.log('Initializing AB wallet for treasury...');
  console.log('Mint:', MINT.toString());
  console.log('Treasury wallet:', TREASURY_WALLET.toString());
  console.log('Treasury token account:', treasuryTokenAccount.toString());
  console.log('AB wallet PDA:', abWalletPDA.toString());
  console.log('Config PDA:', configPDA.toString());

  // Check if AB wallet already exists
  const abWalletInfo = await connection.getAccountInfo(abWalletPDA);
  if (abWalletInfo) {
    console.log('AB wallet already exists!');
    if (abWalletInfo.data.length >= 9) {
      const status = abWalletInfo.data[8];
      const statusMap: { [key: number]: string } = {
        0: 'Allow',
        1: 'Block',
        2: 'None'
      };
      console.log('Current status:', statusMap[status] || `Unknown (${status})`);
    }
    return;
  }

  try {
    // Build the instruction data
    // discriminator (8 bytes) + args { data: u8 }
    const instructionData = Buffer.concat([
      INIT_WALLET_DISCRIMINATOR,
      Buffer.from([0]) // 0 = Allow
    ]);

    // Create the instruction
    const instruction = {
      programId: TRANSFER_HOOK_PROGRAM,
      keys: [
        { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true }, // payer
        { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // system_program
        { pubkey: abWalletPDA, isSigner: false, isWritable: true }, // ab_wallet
        { pubkey: configPDA, isSigner: false, isWritable: false }, // config
        { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: false }, // authority
      ],
      data: instructionData
    };

    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('Sending transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [walletKeypair],
      { commitment: 'confirmed' }
    );

    console.log('Transaction signature:', signature);
    console.log('AB wallet initialized successfully with Allow status!');

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error && 'logs' in error) {
      console.error('Transaction logs:', (error as any).logs);
    }
  }
}

main().catch(console.error);