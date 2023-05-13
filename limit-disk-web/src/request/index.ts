import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { FileListType } from '@/interface'
axios.interceptors.request.use((config) => {
  config.params = { ...config.params, t: new Date().getTime() }
  return config
})
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = '/req'
}
export class Request<T = any, D = any> {
  staticInfo
  resData?: T
  status = 'noReq'
  reduce: (data: any) => T
  constructor(staticInfo: AxiosRequestConfig<D>, reduce: (data: any) => T = (data) => data) {
    this.staticInfo = staticInfo
    this.reduce = reduce
  }
  req(data?: AxiosRequestConfig<D>, finallyFn?: (data?: T) => void) {
    return axios({
      ...this.staticInfo,
      ...data
    })
      .then((r) => {
        if (r.data.result) {
          const data = this.reduce(r.data.data)
          this.resData = data
          this.status = 'success'
          return data
        } else {
          console.error(
            `error : ${this.staticInfo.url} , trace : ${r.data.trace} , msg : ${r.data.msg}`
          )
          throw new Error('数据请求错误')
        }
      })
      .catch((err) => {
        this.status = 'error'
        throw new Error(err)
      })
      .finally(() => {
        finallyFn?.(this.resData)
      })
  }
}
export const getDirInfoReq = new Request<FileListType, { path: string }>({
  url: '/file-system/get-dir-info',
  method: 'post'
})
