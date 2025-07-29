import { Connection, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Constants
const TRANSFER_HOOK_PROGRAM = new PublicKey('HnX219hWBERpffdNcayam5t5Fju2QHus79uiDdnVqHEH');
const TREASURY_WALLET = new PublicKey('GrLCFRYBs3cPaEJgu18fMbQAujPJCmgJiD9V9zB4HufC');
const MINT = new PublicKey('HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z');

async function main() {
  // Load the wallet keypair
  const homeDir = os.homedir();
  const walletPath = path.join(homeDir, '.config', 'solana', 'id.json');
  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  try {
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

    console.log('Checking AB wallet for treasury...');
    console.log('Mint:', MINT.toString());
    console.log('Treasury wallet:', TREASURY_WALLET.toString());
    console.log('Treasury token account:', treasuryTokenAccount.toString());
    console.log('AB wallet PDA:', abWalletPDA.toString());
    console.log('Config PDA:', configPDA.toString());

    // Check if AB wallet already exists
    const abWalletInfo = await connection.getAccountInfo(abWalletPDA);
    if (abWalletInfo) {
      console.log('\\nAB wallet already exists!');
      
      // Try to decode the status
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

    console.log('\\n❌ AB wallet does NOT exist for treasury');
    console.log('\\nTo initialize the AB wallet, you need the transfer hook program authority.');
    console.log('The authority for this transfer hook is: d6DS9s7XJs4CvzBBEbdEvyW8HY2GYbfpdT23WfJP3uq');
    console.log('\\nIf you have access to this authority, you can initialize the AB wallet');
    console.log('by calling the init_wallet instruction on the transfer hook program.');

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);