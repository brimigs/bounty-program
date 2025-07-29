import { Connection, PublicKey } from '@solana/web3.js';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('vRF8A5fAANqXW8hpDvZ9gsugZKCPYhwGg5mbKffJx6P');
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_config')],
    programId
  );
  
  const configAccount = await connection.getAccountInfo(configPda);
  if (!configAccount) {
    console.error('Config account not found');
    return;
  }
  
  // Skip 8-byte discriminator
  const authority = new PublicKey(configAccount.data.slice(8, 40));
  const requiredTokenMint = new PublicKey(configAccount.data.slice(40, 72));
  
  console.log('Program Config:');
  console.log('Authority:', authority.toString());
  console.log('Required Token Mint:', requiredTokenMint.toString());
}

main().catch(console.error);