import { defineStore } from 'pinia'

export const globalStore = defineStore('global', {
  state: (): {
    filePathInfo?: {
      path: string
      name: string
      parentPath?: string
    }
  } => ({
    filePathInfo: undefined
  })
})
