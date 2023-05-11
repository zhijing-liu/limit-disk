export interface TreeItemType {
  name: string | number
  id: string | number
  leaf: boolean
  loaded?: boolean
  children?: TreeItemType[]
  expansion?: boolean
  [key: string]: any
}
export interface FolderTyped {
  path: string
  isFile: false
  name: string
  time: number
  id: number
  parentPath?: string
}
export interface FileType {
  path: string
  isFile: true
  name: string
  suffix: string
  size: number
  time: number
  id: number
  parentPath?: string
}
export type ItemListType = FolderTyped | FileType
export interface FileListType {
  path: string
  isFile: true
  parentPath: string
  name: string
  suffix?: string
  size?: number
  time: number
}
