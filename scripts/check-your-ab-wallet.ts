import { Connection, PublicKey } from '@solana/web3.js';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  const TRANSFER_HOOK_PROGRAM = new PublicKey('HnX219hWBERpffdNcayam5t5Fju2QHus79uiDdnVqHEH');
  const YOUR_TOKEN_ACCOUNT = new PublicKey('6WY5zToyDPGk1kQWTUDJz2Ew6bik4Eus6rpR4xrLFz1v');
  
  // Derive the AB wallet PDA for your token account
  const [abWalletPDA] = PublicKey.findProgramAddressSync(
    [YOUR_TOKEN_ACCOUNT.toBuffer()],
    TRANSFER_HOOK_PROGRAM
  );
  
  console.log('Your token account:', YOUR_TOKEN_ACCOUNT.toString());
  console.log('AB wallet PDA:', abWalletPDA.toString());
  
  const abWalletInfo = await connection.getAccountInfo(abWalletPDA);
  if (abWalletInfo) {
    console.log('✅ AB wallet exists!');
    
    // Try to decode the status
    if (abWalletInfo.data.length >= 9) {
      const status = abWalletInfo.data[8];
      const statusMap: { [key: number]: string } = {
        0: 'Allow',
        1: 'Block',
        2: 'None'
      };
      console.log('Status:', statusMap[status] || `Unknown (${status})`);
    }
  } else {
    console.log('❌ AB wallet does NOT exist - your token account is not on the allowlist');
  }
}

main().catch(console.error);