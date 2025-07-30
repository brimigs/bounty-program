import { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Constants
const TRANSFER_HOOK_PROGRAM = new PublicKey('CW8xj9GkRSGqG2MtgizRKci5RNYeug4FofFJUAJBhJmA');
const TREASURY_WALLET = new PublicKey('GrLCFRYBs3cPaEJgu18fMbQAujPJCmgJiD9V9zB4HufC');

// ABL Token Program IDL (minimal version for init_wallet)
const IDL = {
  "version": "0.1.0",
  "name": "abl_token",
  "instructions": [
    {
      "name": "initWallet",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "abWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitArgs"
          }
        }
      ]
    }
  ],
  "types": [
    {
      "name": "InitArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

async function main() {
  // Load the wallet keypair
  const homeDir = os.homedir();
  const walletPath = path.join(homeDir, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Create provider
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  anchor.setProvider(provider);

  // Create program interface
  const program = new anchor.Program(IDL as any, provider);

  try {
    // Get the mint address from config or args
    const mintAddress = process.argv[2];
    if (!mintAddress) {
      console.error('Please provide the mint address as an argument');
      process.exit(1);
    }
    const mint = new PublicKey(mintAddress);

    // Derive the treasury token account
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      mint,
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
      [mint.toBuffer()],
      TRANSFER_HOOK_PROGRAM
    );

    console.log('Initializing AB wallet for treasury...');
    console.log('Mint:', mint.toString());
    console.log('Treasury wallet:', TREASURY_WALLET.toString());
    console.log('Treasury token account:', treasuryTokenAccount.toString());
    console.log('AB wallet PDA:', abWalletPDA.toString());
    console.log('Config PDA:', configPDA.toString());

    // Check if AB wallet already exists
    const abWalletInfo = await connection.getAccountInfo(abWalletPDA);
    if (abWalletInfo) {
      console.log('AB wallet already exists!');
      // You might want to check its status here
      return;
    }

    // Initialize the AB wallet with "Allow" status (0 = Allow in the ABL program)
    const tx = await program.methods
      .initWallet({ data: 0 }) // 0 = Allow
      .accounts({
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        abWallet: abWalletPDA,
        config: configPDA,
        authority: wallet.publicKey,
      })
      .rpc();

    console.log('Transaction signature:', tx);
    console.log('AB wallet initialized successfully with Allow status!');

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);