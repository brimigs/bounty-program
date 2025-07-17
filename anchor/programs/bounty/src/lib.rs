use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked},
};

declare_id!("vRF8A5fAANqXW8hpDvZ9gsugZKCPYhwGg5mbKffJx6P");

pub const REQUIRED_TOKEN_MINT: Pubkey = anchor_lang::solana_program::pubkey!("11111111111111111111111111111111");
#[program]
pub mod bounty {
    use super::*;

    pub fn create_bounty(
        ctx: Context<CreateBounty>,
        address: Pubkey,
        memo: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.mint.key() == REQUIRED_TOKEN_MINT,
            ErrorCode::InvalidTokenMint
        );

        let bounty = &mut ctx.accounts.bounty_account;
        bounty.owner = ctx.accounts.signer.key();
        bounty.address = address;
        bounty.memo = memo;
        bounty.created_at = Clock::get()?.unix_timestamp;
        bounty.updated_at = Clock::get()?.unix_timestamp;

        let transfer_cpi_accounts = TransferChecked { 
            from: ctx.accounts.user_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.bounty_token_account.to_account_info(), 
            authority: ctx.accounts.signer.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info(); 

        let cpi_context = CpiContext::new(cpi_program, transfer_cpi_accounts); 

        let decimals = ctx.accounts.mint.decimals; 

        let base_fee: u64 = 1; 

        token_interface::transfer_checked(cpi_context, base_fee, decimals)?; 

        Ok(())
    }

    pub fn update_bounty(
        ctx: Context<UpdateBounty>,
        address: Pubkey,
        memo: String,
    ) -> Result<()> {
        let bounty = &mut ctx.accounts.bounty_account;
        require!(bounty.owner == ctx.accounts.signer.key(), ErrorCode::Unauthorized);
        
        bounty.address = address;
        bounty.memo = memo;
        bounty.updated_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn delete_bounty(ctx: Context<DeleteBounty>) -> Result<()> {
        let bounty = &ctx.accounts.bounty_account;
        require!(bounty.owner == ctx.accounts.signer.key(), ErrorCode::Unauthorized);
        
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct BountyInfo { 
    owner: Pubkey,
    address: Pubkey, 
    #[max_len(1000)]
    memo: String,
    created_at: i64,
    updated_at: i64,
}

#[derive(Accounts)]
pub struct CreateBounty<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account( 
        init, 
        payer = signer,
        space = 8 + BountyInfo::INIT_SPACE
    )]
    pub bounty_account: Account<'info, BountyInfo>,
    #[account(
        constraint = mint.key() == REQUIRED_TOKEN_MINT @ ErrorCode::InvalidTokenMint
    )]
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub bounty_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account( 
        mut, 
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateBounty<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub bounty_account: Account<'info, BountyInfo>,
    pub owner: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct DeleteBounty<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized,
        close = signer
    )]
    pub bounty_account: Account<'info, BountyInfo>,
    pub owner: SystemAccount<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid token mint. Only the specified Token-2022 token is accepted")]
    InvalidTokenMint,
}
