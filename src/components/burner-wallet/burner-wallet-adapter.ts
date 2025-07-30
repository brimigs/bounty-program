import { 
  BaseMessageSignerWalletAdapter,
  WalletName,
  WalletReadyState,
  WalletNotConnectedError,
  WalletError
} from '@solana/wallet-adapter-base'
import { 
  PublicKey, 
  Transaction, 
  VersionedTransaction, 
  Keypair
} from '@solana/web3.js'
import bs58 from 'bs58'
import nacl from 'tweetnacl'

export const BurnerWalletName = 'Burner Wallet' as WalletName<'Burner Wallet'>

export class BurnerWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = BurnerWalletName
  url = 'https://github.com/solana-labs/wallet-adapter'
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSIjRkY2QjZCIiBzdHJva2U9IiNGRjQxNDEiIHN0cm9rZS13aWR0aD0iNSIvPgo8cGF0aCBkPSJNMzUgMzVDMzUgMzUgNDAgMjUgNTAgMjVDNjAgMjUgNjUgMzUgNjUgMzVDNjUgMzUgNjAgNDAgNTUgNDVDNTUgNDUgNTUgNTUgNTAgNjBDNDUgNjUgNDAgNjAgNDAgNTBDNDAgNDAgNDUgNDAgNDUgNDVDNDUgNDUgMzUgNDUgMzUgMzVaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPg=='
  readonly supportedTransactionVersions = new Set(['legacy', 0] as const)
  
  private _connecting: boolean
  private _keypair: Keypair | null
  private _publicKey: PublicKey | null
  private _readyState: WalletReadyState =
    typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable

  constructor() {
    super()
    this._connecting = false
    this._keypair = null
    this._publicKey = null
  }

  get publicKey() {
    return this._publicKey
  }

  get connecting() {
    return this._connecting
  }

  get readyState() {
    return this._readyState
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return
      if (this._readyState !== WalletReadyState.Loadable) throw new Error('Wallet not ready')

      this._connecting = true

      // Check if we have an existing keypair in localStorage
      const storedKeypair = localStorage.getItem('burnerWalletKeypair')
      
      if (storedKeypair) {
        try {
          const secretKey = bs58.decode(storedKeypair)
          this._keypair = Keypair.fromSecretKey(secretKey)
        } catch {
          // If stored keypair is invalid, create new one
          this._keypair = Keypair.generate()
          localStorage.setItem('burnerWalletKeypair', bs58.encode(this._keypair.secretKey))
        }
      } else {
        // Generate new keypair
        this._keypair = Keypair.generate()
        localStorage.setItem('burnerWalletKeypair', bs58.encode(this._keypair.secretKey))
      }

      this._publicKey = this._keypair.publicKey
      this._readyState = WalletReadyState.Installed

      this.emit('connect', this._publicKey)
    } catch (error) {
      const walletError = error instanceof WalletError ? error : new WalletError((error as Error)?.message || String(error))
      this.emit('error', walletError)
      throw walletError
    } finally {
      this._connecting = false
    }
  }

  async disconnect(): Promise<void> {
    if (this._keypair) {
      this._keypair = null
      this._publicKey = null
      this._readyState = WalletReadyState.Loadable
      // Don't remove from localStorage - keep for session persistence
      this.emit('disconnect')
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!this._keypair) throw new WalletNotConnectedError()

    try {
      if (transaction instanceof Transaction) {
        transaction.partialSign(this._keypair)
      } else {
        transaction.sign([this._keypair])
      }
      return transaction
    } catch (error) {
      const walletError = error instanceof WalletError ? error : new WalletError((error as Error)?.message || String(error))
      this.emit('error', walletError)
      throw walletError
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    if (!this._keypair) throw new WalletNotConnectedError()

    try {
      return transactions.map((transaction) => {
        if (transaction instanceof Transaction) {
          transaction.partialSign(this._keypair!)
        } else {
          transaction.sign([this._keypair!])
        }
        return transaction
      })
    } catch (error) {
      const walletError = error instanceof WalletError ? error : new WalletError((error as Error)?.message || String(error))
      this.emit('error', walletError)
      throw walletError
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._keypair) throw new WalletNotConnectedError()

    try {
      const signature = nacl.sign.detached(message, this._keypair.secretKey)
      return signature
    } catch (error) {
      const walletError = error instanceof WalletError ? error : new WalletError((error as Error)?.message || String(error))
      this.emit('error', walletError)
      throw walletError
    }
  }

  // Helper method to export private key
  exportPrivateKey(): string | null {
    if (!this._keypair) return null
    return bs58.encode(this._keypair.secretKey)
  }

  // Helper method to clear burner wallet
  clearBurnerWallet(): void {
    localStorage.removeItem('burnerWalletKeypair')
    this.disconnect()
  }
}