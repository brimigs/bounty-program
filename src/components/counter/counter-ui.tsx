'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram, useCounterProgramAccount } from './counter-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export function BountyCreate() {
  const { createBounty } = useCounterProgram()
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')
  const [creating, setCreating] = useState(false)
  const [addressError, setAddressError] = useState('')

  const validateAddress = (addr: string) => {
    try {
      new PublicKey(addr)
      setAddressError('')
      return true
    } catch {
      setAddressError('Invalid address format')
      return false
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value)
    if (value) {
      validateAddress(value)
    } else {
      setAddressError('')
    }
  }

  const handleCreate = async () => {
    if (!validateAddress(address)) {
      return
    }

    setCreating(true)
    try {
      const pubkey = new PublicKey(address)
      await createBounty.mutateAsync({ keypair: Keypair.generate(), address: pubkey, memo })
      setAddress('')
      setMemo('')
    } finally {
      setCreating(false)
    }
  }

  const isValid = address && memo && !addressError

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Address (Pubkey)</label>
        <input
          className={`input input-bordered ${addressError ? 'input-error' : ''}`}
          type="text"
          placeholder="Enter public key address"
          value={address}
          onChange={handleAddressChange}
          disabled={creating}
        />
        {addressError && <span className="text-error text-sm">{addressError}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Memo</label>
        <input
          className="input input-bordered"
          type="text"
          placeholder="Enter memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          disabled={creating}
        />
      </div>

      <Button onClick={handleCreate} disabled={creating || !isValid}>
        Create{creating && '...'}
      </Button>
    </div>
  )
}

export function BountyList() {
  const { accounts, getProgramAccount } = useCounterProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <BountyCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No bounties</h2>
          No bounties found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function BountyCard({ account }: { account: PublicKey }) {
  const { accountQuery } = useCounterProgramAccount({ account })
  const bounty = accountQuery.data

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Bounty</CardTitle>
        <CardDescription>
          Account: <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <strong>Memo:</strong> {bounty?.memo}
        </div>
        <div>
          <strong>Address:</strong> {bounty?.address ? ellipsify(bounty.address.toString()) : 'N/A'}
        </div>
      </CardContent>
    </Card>
  )
}
