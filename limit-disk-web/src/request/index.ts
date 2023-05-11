import axios, { AxiosRequestConfig } from 'axios'
import { FileListType } from '@/interface'
axios.defaults.baseURL = '/req'
axios.interceptors.request.use((config) => {
  config.params = { ...config.params, t: new Date().getTime() }
  return config
})
export class Request<T = any, D = any> {
  staticInfo
  resData?: T
  status = 'noReq'
  constructor(staticInfo: AxiosRequestConfig<D>) {
    this.staticInfo = staticInfo
  }
  req(data?: AxiosRequestConfig<D>) {
    return axios({
      ...this.staticInfo,
      ...data
    })
      .then((r) => {
        if (r.data.result) {
          this.resData = r.data.data
          this.status = 'success'
          return r.data.data
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
  }
}
export const getDirInfoReq = new Request<FileListType, { path: string }>({
  url: '/file-system/get-dir-info',
  method: 'post'
})
