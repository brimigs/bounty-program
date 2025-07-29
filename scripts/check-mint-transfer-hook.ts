import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, getTransferHook } from '@solana/spl-token';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const mint = new PublicKey('HSHEMhjDuPag76qtf6LhRovmUJYm2J18MZ7sJVEdeB5Z');
  
  console.log('Checking mint:', mint.toString());
  
  try {
    const mintData = await getMint(
      connection,
      mint,
      'confirmed',
      new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
    );
    
    console.log('Mint supply:', mintData.supply.toString());
    console.log('Decimals:', mintData.decimals);
    
    const transferHook = getTransferHook(mintData);
    if (transferHook) {
      console.log('\nTransfer Hook Configuration:');
      console.log('Program ID:', transferHook.programId.toString());
      console.log('Authority:', transferHook.authority.toString());
    } else {
      console.log('\nNo transfer hook found on this mint');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

main().catch(console.error);