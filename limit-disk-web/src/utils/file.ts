import { FileListType, FileType, ItemListType } from '@/interface'
import folderImage from '@/assets/image/folder.png'
import picImage from '@/assets/image/pic.png'
import audioImage from '@/assets/image/audio.png'
import videoImage from '@/assets/image/video.png'
import itemImage from '@/assets/image/item.png'
export const suffixMap: { [key: string]: 'pic' | 'audio' | 'video' } = {
  '.png': 'pic',
  '.jpg': 'pic',
  '.jpeg': 'pic',
  '.svg': 'pic',
  '.mp3': 'audio',
  '.flac': 'audio',
  '.wav': 'audio',
  '.mp4': 'video',
  '.ts': 'video',
  '.mkv': 'video'
}
export const suffixImageMap: { pic: string; audio: string; video: string; file: string } = {
  pic: picImage,
  audio: audioImage,
  video: videoImage,
  file: itemImage
}
export const getFileSrc = (item: ItemListType | FileListType) =>
  item.isFile ? suffixImageMap[suffixMap[(item as FileType).suffix] ?? 'file'] : folderImage
