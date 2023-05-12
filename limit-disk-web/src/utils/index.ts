import moment from 'moment'

import picImage from '@/assets/image/pic.png'
import audioImage from '@/assets/image/audio.png'
import videoImage from '@/assets/image/video.png'
import itemImage from '@/assets/image/item.png'

export const getSize = (size?: string | number): string => {
  if (size === undefined || isNaN(+size)) {
    return ''
  } else {
    if (size < 1600) {
      return `${size}B`
    } else if (size < 1600000) {
      return `${(+size / 1000).toFixed(1)}KB`
    } else if (size < 1600000000) {
      return `${(+size / 1000000).toFixed(1)}MB`
    } else {
      return `${(+size / 1000000000).toFixed(1)}GB`
    }
  }
}
export const timeFormat = (time: number, format?: string): string =>
  moment(time).format(format ?? 'YYYY年MM月DD日 hh:mm:ss')
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
