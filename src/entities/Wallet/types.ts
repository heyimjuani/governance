import { ChainId } from '@dcl/schemas'

export type WalletAttributes = {
  id: string,
  address: string,
  name: string,
  network: ChainId,
  created_at: Date
}

export type BlockExplorerLink = {
  link: string,
  name: string,
}
