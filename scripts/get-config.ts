import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import IDL from '../anchor/target/idl/bounty.json';

const PROGRAM_ID = new PublicKey('vRF8A5fAANqXW8hpDvZ9gsugZKCPYhwGg5mbKffJx6P');

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Create a dummy wallet for provider
  const wallet = new anchor.Wallet(Keypair.generate());
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  
  const program = new Program(IDL as any, PROGRAM_ID, provider);
  
  // Derive the config PDA
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_config')],
    PROGRAM_ID
  );
  
  try {
    const config = await (program.account as any).programConfig.fetch(configPda);
    console.log('Program Config:');
    console.log('Authority:', config.authority.toString());
    console.log('Required Token Mint:', config.requiredTokenMint.toString());
    
    // Export for use in other script
    process.env.MINT_ADDRESS = config.requiredTokenMint.toString();
    
  } catch (error: any) {
    console.error('Error fetching config:', error.message);
    console.log('Config may not be initialized yet');
  }
}

main().catch(console.error);