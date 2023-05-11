import { defineStore } from 'pinia'
import type { ItemListType } from '@/interface'

export const globalStore = defineStore('global', {
  state: (): {
    filePathInfo?: {
      path: string
      name: string
      parentPath?: string
    }
    displayFile?: ItemListType
  } => ({
    filePathInfo: undefined,
    displayFile: undefined
  })
})
