import { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Constants
const TRANSFER_HOOK_PROGRAM = new PublicKey('HnX219hWBERpffdNcayam5t5Fju2QHus79uiDdnVqHEH');
const YOUR_TOKEN_ACCOUNT = new PublicKey('6WY5zToyDPGk1kQWTUDJz2Ew6bik4Eus6rpR4xrLFz1v');
const MINT = new PublicKey('HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z');

// Instruction discriminator for init_wallet (first 8 bytes of sha256("global:init_wallet"))
const INIT_WALLET_DISCRIMINATOR = Buffer.from([181, 84, 188, 41, 105, 15, 219, 201]);

async function main() {
  // Load your wallet keypair
  const homeDir = os.homedir();
  const walletPath = path.join(homeDir, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  try {
    // Derive the AB wallet PDA
    const [abWalletPDA] = PublicKey.findProgramAddressSync(
      [YOUR_TOKEN_ACCOUNT.toBuffer()],
      TRANSFER_HOOK_PROGRAM
    );

    // Derive the config PDA
    const [configPDA] = PublicKey.findProgramAddressSync(
      [MINT.toBuffer()],
      TRANSFER_HOOK_PROGRAM
    );

    console.log('Adding your token account to allowlist...');
    console.log('Your wallet:', walletKeypair.publicKey.toString());
    console.log('Your token account:', YOUR_TOKEN_ACCOUNT.toString());
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
        
        if (status === 0) {
          console.log('✅ Your token account is already on the allowlist!');
          return;
        }
      }
    }

    // Create the instruction data
    // Discriminator (8 bytes) + data (1 byte for Allow status)
    const data = Buffer.concat([
      INIT_WALLET_DISCRIMINATOR,
      Buffer.from([0]) // 0 = Allow
    ]);

    // Create the instruction
    const instruction = {
      programId: TRANSFER_HOOK_PROGRAM,
      keys: [
        { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true }, // payer
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
        { pubkey: abWalletPDA, isSigner: false, isWritable: true }, // ab_wallet
        { pubkey: configPDA, isSigner: false, isWritable: false }, // config
        { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: false }, // authority
      ],
      data: data
    };

    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('\\nSending transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [walletKeypair],
      { commitment: 'confirmed' }
    );

    console.log('✅ Successfully added to allowlist!');
    console.log('Transaction signature:', signature);

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);