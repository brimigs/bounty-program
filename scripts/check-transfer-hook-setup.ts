import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, getExtraAccountMetaAddress } from '@solana/spl-token';

// Constants
const TRANSFER_HOOK_PROGRAM = new PublicKey('CW8xj9GkRSGqG2MtgizRKci5RNYeug4FofFJUAJBhJmA');
const TREASURY_WALLET = new PublicKey('GrLCFRYBs3cPaEJgu18fMbQAujPJCmgJiD9V9zB4HufC');

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Get the mint address from args
  const mintAddress = process.argv[2];
  if (!mintAddress) {
    console.error('Please provide the mint address as an argument');
    process.exit(1);
  }
  const mint = new PublicKey(mintAddress);

  console.log('Checking transfer hook setup...');
  console.log('Mint:', mint.toString());
  console.log('Transfer hook program:', TRANSFER_HOOK_PROGRAM.toString());
  console.log('Treasury wallet:', TREASURY_WALLET.toString());
  console.log('');

  // 1. Check extra-account-metas PDA
  const extraAccountMetasPDA = getExtraAccountMetaAddress(mint, TRANSFER_HOOK_PROGRAM);
  console.log('Extra account metas PDA:', extraAccountMetasPDA.toString());
  
  const extraAccountInfo = await connection.getAccountInfo(extraAccountMetasPDA);
  if (extraAccountInfo) {
    console.log('✅ Extra account metas PDA exists');
    console.log('   Owner:', extraAccountInfo.owner.toString());
    console.log('   Data length:', extraAccountInfo.data.length);
  } else {
    console.log('❌ Extra account metas PDA does NOT exist');
    console.log('   This needs to be initialized by the transfer hook program authority');
  }
  console.log('');

  // 2. Check treasury token account
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    mint,
    TREASURY_WALLET,
    false,
    TOKEN_2022_PROGRAM_ID
  );
  console.log('Treasury token account:', treasuryTokenAccount.toString());
  
  const treasuryTokenInfo = await connection.getAccountInfo(treasuryTokenAccount);
  if (treasuryTokenInfo) {
    console.log('✅ Treasury token account exists');
  } else {
    console.log('⚠️  Treasury token account does NOT exist (will be created on first transfer)');
  }
  console.log('');

  // 3. Check AB wallet PDA
  const [abWalletPDA] = PublicKey.findProgramAddressSync(
    [treasuryTokenAccount.toBuffer()],
    TRANSFER_HOOK_PROGRAM
  );
  console.log('AB wallet PDA:', abWalletPDA.toString());
  
  const abWalletInfo = await connection.getAccountInfo(abWalletPDA);
  if (abWalletInfo) {
    console.log('✅ AB wallet PDA exists');
    console.log('   Owner:', abWalletInfo.owner.toString());
    console.log('   Data length:', abWalletInfo.data.length);
    
    // Try to decode the status (first byte after discriminator)
    if (abWalletInfo.data.length >= 9) {
      const status = abWalletInfo.data[8];
      const statusMap: { [key: number]: string } = {
        0: 'Allow',
        1: 'Block',
        2: 'None'
      };
      console.log('   Status:', statusMap[status] || `Unknown (${status})`);
    }
  } else {
    console.log('❌ AB wallet PDA does NOT exist');
    console.log('   This needs to be initialized using the init_wallet instruction');
  }
  console.log('');

  // 4. Check config PDA
  const [configPDA] = PublicKey.findProgramAddressSync(
    [mint.toBuffer()],
    TRANSFER_HOOK_PROGRAM
  );
  console.log('Config PDA:', configPDA.toString());
  
  const configInfo = await connection.getAccountInfo(configPDA);
  if (configInfo) {
    console.log('✅ Config PDA exists');
    console.log('   Owner:', configInfo.owner.toString());
  } else {
    console.log('❌ Config PDA does NOT exist');
    console.log('   The transfer hook may not be properly initialized for this mint');
  }
}

main().catch(console.error);