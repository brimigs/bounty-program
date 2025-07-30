'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram, useCounterProgramAccount, deriveBountyTokenAccount } from './counter-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function BountyCreate() {
  const { createBounty, configQuery, userTokenBalanceQuery } = useCounterProgram()
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')
  const [creating, setCreating] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [nextKeypair] = useState(() => Keypair.generate())

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
      await createBounty.mutateAsync({ keypair: nextKeypair, address: pubkey, memo })
      setAddress('')
      setMemo('')
    } finally {
      setCreating(false)
    }
  }
  

  const isValid = address && memo && !addressError
  const hasRequiredToken = userTokenBalanceQuery.data && parseFloat(userTokenBalanceQuery.data.uiAmount || '0') >= 1

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Wallet Address</label>
        <input
          className={`w-full px-4 py-2 rounded-lg border ${addressError ? 'border-destructive focus:ring-destructive' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
          type="text"
          placeholder="Potential sanctioned entity"
          value={address}
          onChange={handleAddressChange}
          disabled={creating || !hasRequiredToken}
        />
        {addressError && <span className="text-destructive text-sm font-medium">{addressError}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Memo</label>
        <input
          className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          type="text"
          placeholder="Explain your reasoning here"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          disabled={creating || !hasRequiredToken}
        />
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleCreate}
          disabled={creating || !isValid || !hasRequiredToken}
          title={!hasRequiredToken ? 'You need the required token to create a bounty' : ''}
          className="w-full py-6 text-lg font-semibold"
          size="lg"
        >
          {creating ? (
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              Creating Bounty...
            </span>
          ) : !hasRequiredToken ? (
            'Insufficient Token Balance'
          ) : (
            'Submit Bounty'
          )}
        </Button>

        {userTokenBalanceQuery.data && hasRequiredToken && (
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Token Balance: {userTokenBalanceQuery.data.uiAmountString}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfigInitialize() {
  const { initializeConfig } = useCounterProgram()
  const [mintAddress, setMintAddress] = useState('')
  const [initializing, setInitializing] = useState(false)
  const [mintError, setMintError] = useState('')

  const validateMint = (addr: string) => {
    try {
      new PublicKey(addr)
      setMintError('')
      return true
    } catch {
      setMintError('Invalid mint address format')
      return false
    }
  }

  const handleMintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMintAddress(value)
    if (value) {
      validateMint(value)
    } else {
      setMintError('')
    }
  }

  const handleInitialize = async () => {
    if (!validateMint(mintAddress)) {
      return
    }

    setInitializing(true)
    try {
      const mint = new PublicKey(mintAddress)
      await initializeConfig.mutateAsync({ requiredTokenMint: mint })
      setMintAddress('')
    } finally {
      setInitializing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initialize Config</CardTitle>
        <CardDescription>Set up the program configuration with the required token mint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Required Token Mint</label>
          <input
            className={`input input-bordered ${mintError ? 'input-error' : ''}`}
            type="text"
            placeholder="Enter token mint address"
            value={mintAddress}
            onChange={handleMintChange}
            disabled={initializing}
          />
          {mintError && <span className="text-error text-sm">{mintError}</span>}
        </div>
        <Button onClick={handleInitialize} disabled={initializing || !mintAddress || !!mintError}>
          Initialize{initializing && '...'}
        </Button>
      </CardContent>
    </Card>
  )
}

export function ConfigUpdate() {
  const { updateRequiredMint, configQuery } = useCounterProgram()
  const [newMint, setNewMint] = useState('')
  const [updating, setUpdating] = useState(false)
  const [mintError, setMintError] = useState('')

  const validateMint = (addr: string) => {
    try {
      new PublicKey(addr)
      setMintError('')
      return true
    } catch {
      setMintError('Invalid mint address format')
      return false
    }
  }

  const handleMintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMint(value)
    if (value) {
      validateMint(value)
    } else {
      setMintError('')
    }
  }

  const handleUpdate = async () => {
    if (!validateMint(newMint)) {
      return
    }

    setUpdating(true)
    try {
      const mint = new PublicKey(newMint)
      await updateRequiredMint.mutateAsync({ newMint: mint })
      setNewMint('')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Required Mint</CardTitle>
        <CardDescription>Change the required token mint for creating bounties</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {configQuery.data && (
          <Alert>
            <AlertDescription>
              Current Required Mint:{' '}
              <ExplorerLink
                path={`address/${configQuery.data.requiredTokenMint}`}
                label={ellipsify(configQuery.data.requiredTokenMint.toString())}
              />
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">New Token Mint</label>
          <input
            className={`input input-bordered ${mintError ? 'input-error' : ''}`}
            type="text"
            placeholder="Enter new token mint address"
            value={newMint}
            onChange={handleMintChange}
            disabled={updating}
          />
          {mintError && <span className="text-error text-sm">{mintError}</span>}
        </div>
        <Button onClick={handleUpdate} disabled={updating || !newMint || !!mintError}>
          Update{updating && '...'}
        </Button>
      </CardContent>
    </Card>
  )
}

export function BountyList() {
  const { accounts, getProgramAccount } = useCounterProgram()

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-6 border border-blue-200 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-200 text-center">
          Program account not found. Make sure you have deployed the program and are on the correct cluster.
        </p>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-6">
          {accounts.data?.map((account) => (
            <BountyCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <h2 className={'text-2xl font-bold mb-2'}>No Bounties Yet</h2>
            <p className="text-muted-foreground">Be the first to create a bounty! Submit one using the form above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function BountyCard({ account }: { account: PublicKey }) {
  const { accountQuery } = useCounterProgramAccount({ account })
  const { updateBounty, deleteBounty } = useCounterProgram()
  const bounty = accountQuery.data
  const [isEditing, setIsEditing] = useState(false)
  const [editAddress, setEditAddress] = useState('')
  const [editMemo, setEditMemo] = useState('')
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

  const handleEdit = () => {
    if (bounty) {
      setEditAddress(bounty.address.toString())
      setEditMemo(bounty.memo)
      setIsEditing(true)
    }
  }

  const handleUpdate = async () => {
    if (!validateAddress(editAddress)) {
      return
    }
    try {
      await updateBounty.mutateAsync({
        bountyAccount: account,
        address: new PublicKey(editAddress),
        memo: editMemo,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this bounty?')) {
      try {
        await deleteBounty.mutateAsync({ bountyAccount: account })
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  return accountQuery.isLoading ? (
    <div className="flex justify-center p-8">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  ) : (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="text-xl">Bounty</CardTitle>
        <CardDescription>
          <span className="font-medium">Account:</span>{' '}
          <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {isEditing ? (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Address</label>
              <input
                className={`input input-bordered ${addressError ? 'input-error' : ''}`}
                type="text"
                value={editAddress}
                onChange={(e) => {
                  setEditAddress(e.target.value)
                  if (e.target.value) validateAddress(e.target.value)
                }}
              />
              {addressError && <span className="text-error text-sm">{addressError}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Memo</label>
              <input
                className="input input-bordered"
                type="text"
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} disabled={!editAddress || !editMemo || !!addressError}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs font-medium text-muted-foreground mb-1">Submitted by:</p>
                <p className="font-mono text-sm">{bounty?.owner ? ellipsify(bounty.owner.toString()) : 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs font-medium text-muted-foreground mb-1">Suspicious Account:</p>
                <p className="font-mono text-sm">{bounty?.address ? ellipsify(bounty.address.toString()) : 'N/A'}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs font-medium text-muted-foreground mb-1">Memo</p>
                <p className="font-medium">{bounty?.memo || 'No memo provided'}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleEdit} size="sm" variant="outline">
                Edit
              </Button>
              <Button onClick={handleDelete} variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
