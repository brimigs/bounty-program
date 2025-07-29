import { Connection, PublicKey } from '@solana/web3.js';
import { ExtraAccountMetaAccountDataLayout, ExtraAccountMeta } from '@solana/spl-token';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const extraAccountMetasPDA = new PublicKey('3abKjssAGx1MWfDN4TnSRAyxWHP3c8tfWv2mWDCAZADk');
  
  const accountInfo = await connection.getAccountInfo(extraAccountMetasPDA);
  if (!accountInfo) {
    console.error('Extra account metas PDA not found');
    return;
  }
  
  // Parse the account data
  const decoded = ExtraAccountMetaAccountDataLayout.decode(accountInfo.data);
  
  console.log('Extra Account Metas Data:');
  console.log('Instruction discriminator:', decoded.instructionDiscriminator);
  console.log('Length:', decoded.length);
  console.log('Extra accounts count:', decoded.extraAccountsList.length);
  
  // Access the metas array directly
  const metas = decoded.extraAccountsList;
  metas.forEach((meta: any, index: number) => {
    console.log(`\n[${index}]`);
    console.log('  Discriminator:', meta.discriminator);
    console.log('  Address Config:', meta.addressConfig);
    console.log('  Is Signer:', meta.isSigner);
    console.log('  Is Writable:', meta.isWritable);
  });
}

main().catch(console.error);