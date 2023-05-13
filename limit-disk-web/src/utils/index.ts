import moment from 'moment'

export * from './file'
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
