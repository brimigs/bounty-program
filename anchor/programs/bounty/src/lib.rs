use anchor_lang::prelude::*;

declare_id!("DvfS2GavVdWsTb4uvXwKUb5A6QysznCJCPB6cx3duQGE");

#[program]
pub mod test_transfer_hook {
    use super::*;

    pub fn create_bounty(
        ctx: Context<CreateBounty>,
        address: Pubkey,
        memo: String,
    ) -> Result<()> {
        let bounty = &mut ctx.accounts.bounty_account;
        bounty.address = address;
        bounty.memo = memo;
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct BountyInfo { 
    address: Pubkey, 
    #[max_len(1000)]
    memo: String,
}

#[derive(Accounts)]
pub struct CreateBounty<'info> {
    #[account( 
        init, 
        payer = signer,
        space = 8 + BountyInfo::INIT_SPACE
    )]
    pub bounty_account: Account<'info, BountyInfo>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
