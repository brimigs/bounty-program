use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked, Burn},
};

declare_id!("vRF8A5fAANqXW8hpDvZ9gsugZKCPYhwGg5mbKffJx6P");

pub const PROGRAM_CONFIG_SEED: &[u8] = b"program_config";
pub const TREASURY_WALLET: &str = "d6DS9s7XJs4CvzBBEbdEvyW8HY2GYbfpdT23WfJP3uq";

#[program]
pub mod bounty {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        required_token_mint: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.program_config;
        config.authority = ctx.accounts.authority.key();
        config.required_token_mint = required_token_mint;
        Ok(())
    }

    pub fn update_required_mint(
        ctx: Context<UpdateRequiredMint>,
        new_mint: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.program_config;
        config.required_token_mint = new_mint;
        Ok(())
    }

    pub fn create_bounty<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateBounty<'info>>,
        address: Pubkey,
        memo: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.mint.key() == ctx.accounts.program_config.required_token_mint,
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
            to: ctx.accounts.treasury_token_account.to_account_info(), 
            authority: ctx.accounts.signer.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info(); 

        // Collect remaining accounts
        let remaining_accounts: Vec<AccountInfo> = ctx.remaining_accounts.iter().cloned().collect();

        // Create CPI context with remaining accounts for transfer hooks
        let cpi_context = CpiContext::new(cpi_program, transfer_cpi_accounts)
            .with_remaining_accounts(remaining_accounts);

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

    pub fn burn_tokens<'info>(
        ctx: Context<'_, '_, '_, 'info, BurnTokens<'info>>,
        amount: u64,
    ) -> Result<()> {
        // Ensure only the program authority can burn tokens
        require!(
            ctx.accounts.authority.key() == ctx.accounts.program_config.authority,
            ErrorCode::Unauthorized
        );

        let burn_cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.target_token_account.to_account_info(),
            authority: ctx.accounts.mint.to_account_info(), // Mint is the permanent delegate
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        
        // Collect remaining accounts for transfer hooks if needed
        let remaining_accounts: Vec<AccountInfo> = ctx.remaining_accounts.iter().cloned().collect();
        
        let cpi_context = CpiContext::new(cpi_program, burn_cpi_accounts)
            .with_remaining_accounts(remaining_accounts);

        token_interface::burn(cpi_context, amount)?;

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

#[account]
#[derive(InitSpace)]
pub struct ProgramConfig {
    pub authority: Pubkey,
    pub required_token_mint: Pubkey,
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + ProgramConfig::INIT_SPACE,
        seeds = [PROGRAM_CONFIG_SEED],
        bump
    )]
    pub program_config: Account<'info, ProgramConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateRequiredMint<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [PROGRAM_CONFIG_SEED],
        bump,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub program_config: Account<'info, ProgramConfig>,
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
        seeds = [PROGRAM_CONFIG_SEED],
        bump
    )]
    pub program_config: Account<'info, ProgramConfig>,
    #[account(
        constraint = mint.key() == program_config.required_token_mint @ ErrorCode::InvalidTokenMint
    )]
    pub mint: InterfaceAccount<'info, Mint>,
    /// CHECK: This is the treasury wallet that will receive tokens
    #[account(
        constraint = treasury_wallet.key() == TREASURY_WALLET.parse::<Pubkey>().unwrap() @ ErrorCode::InvalidTreasury
    )]
    pub treasury_wallet: UncheckedAccount<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = treasury_wallet,
        associated_token::token_program = token_program
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account( 
        init_if_needed,
        payer = signer,
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

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [PROGRAM_CONFIG_SEED],
        bump,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub program_config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    /// CHECK: The wallet that holds tokens to be burned
    pub target_wallet: UncheckedAccount<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = target_wallet,
        associated_token::token_program = token_program
    )]
    pub target_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid token mint. Only the specified Token-2022 token is accepted")]
    InvalidTokenMint,
    #[msg("Invalid treasury wallet address")]
    InvalidTreasury,
}
