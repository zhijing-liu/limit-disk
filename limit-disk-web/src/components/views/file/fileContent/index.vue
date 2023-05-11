<template lang="pug">
#fileContent(v-if="getGlobalStore.filePathInfo")
  .header
    Button(@click="upperLevel" :left-icon="upperImage") 上一级
    .interval
    Button(@click="uploadFile" :left-icon="uploadImage") 上传文件
    .interval
    .path {{getGlobalStore.filePathInfo?.path}}
  Table(:data="fileList" onKey="path" @dblclickRow="clickFileListItem")
    template(#default="{data}")
      TableCol(:data="data" :onKey="()=>getFileSrc(data.row)" type="icon" width="30px" )
      TableCol(:data="data" label="名称" onKey="name" :fill="true")
      TableCol(:data="data" label="创建时间" :onKey="()=>timeFormat(data.row.time)" :fill="true")
      TableCol(:data="data" label="文件大小" :onKey="()=>getSize(data.row.size)" :fill="true")
      TableCol(:data="data" label="类型" :onKey="()=>data.row.suffix?.slice(1)??data.row.isFile?'文件':'文件夹'" width="60px" )
#fileContent(v-else)
  #commonly.body
    .title · 磁盘
    .diskCharacters
      .char(v-for="item in items" :key="item.id" @click="()=>clickItem(item.id,item.name)")
        img.icon(:src="folderImage")
        .title 本地 : {{item.name[0]}}
    .title · 收藏夹
    Table(:data="favorites" onKey="path" @clickRow="(item)=>clickItem(item.path,item.name,item.parentPath)")
      template(#default="{data}")
        TableCol(:data="data" :onKey="()=>getFileSrc(data.row)" type="icon" width="30px" )
        TableCol(:data="data" label="名称" onKey="name" :fill="true")
        TableCol(:data="data" label="创建时间" :onKey="()=>timeFormat(data.row.time)" :fill="true")
        TableCol(:data="data" label="路径" onKey="path" :fill="true")
</template>
<script setup lang="ts">
import { globalStore } from '@/stores'
import Button from '@/components/communal/button.vue'
import Table from '@/components/communal/table.vue'
import TableCol from '@/components/communal/tableCol.vue'

import folderImage from '@/assets/image/folder.png'
import picImage from '@/assets/image/pic.png'
import videoImage from '@/assets/image/video.png'
import audioImage from '@/assets/image/audio.png'
import itemImage from '@/assets/image/item.png'
import upperImage from '@/assets/image/upper.png'
import uploadImage from '@/assets/image/upload.png'

import type { FileListType, FileType, ItemListType, TreeItemType } from '@/interface'
import { computed, onBeforeMount, reactive, ref, watch } from 'vue'
import { getDirInfoReq, Request } from '@/request'
import { getSize, timeFormat } from '@/utils'

const suffixMap: { [key: string]: 'pic' | 'audio' | 'video' } = {
  '.png': 'pic',
  '.jpg': 'pic',
  '.jpeg': 'pic',
  '.svg': 'pic',
  '.mp3': 'audio',
  '.flac': 'audio',
  '.wav': 'audio',
  '.mp4': 'video',
  '.ts': 'video'
}
const suffixImageMap: { pic: string; audio: string; video: string; file: string } = {
  pic: picImage,
  audio: audioImage,
  video: videoImage,
  file: itemImage
}
const getFileSrc = (item: ItemListType | FileListType) =>
  item.isFile ? suffixImageMap[suffixMap[(item as FileType).suffix] ?? 'file'] : folderImage
const getGlobalStore = globalStore()
const favorites = ref<ItemListType[]>([])
withDefaults(
  defineProps<{
    items: TreeItemType[]
  }>(),
  {
    items: () => []
  }
)
const getFavorites = new Request<ItemListType[]>({
  method: 'get',
  url: '/file-system/collect-path'
})
const fileList = ref<FileListType[]>([])
onBeforeMount(async () => {
  await getFavorites.req()
  favorites.value = getFavorites.resData ?? []
})
const getDirDataReq = new Request<FileListType[]>({
  method: 'post',
  url: '/file-system/get-dir'
})
const clickItem = (path: string | number, name: string | number, parentPath?: string) => {
  getGlobalStore.filePathInfo = {
    path: path as string,
    name: name as string,
    parentPath
  }
}

const upperLevel = async () => {
  if (getGlobalStore.filePathInfo?.parentPath) {
    await getDirInfoReq.req({
      data: {
        path: getGlobalStore.filePathInfo.parentPath
      }
    })
    if (getDirInfoReq.resData) {
      getGlobalStore.filePathInfo = {
        path: getDirInfoReq.resData.path,
        parentPath: getDirInfoReq.resData.parentPath,
        name: getDirInfoReq.resData.name
      }
    }
  } else {
    getGlobalStore.filePathInfo = undefined
  }
}
const clickFileListItem = (item: FileListType) => {
  if (item.isFile) {
    console.log(111)
  } else {
    getGlobalStore.filePathInfo = {
      path: item.path,
      name: item.name,
      parentPath: item.parentPath
    }
  }
}
const emits = defineEmits<{
  (e: 'updateData', path: string): void
}>()
const uploadFileReq = new Request<FormData>({
  url: '/file-system/upload-files',
  method: 'post',
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
const uploadFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'accept'
  input.multiple = true
  input.addEventListener('change', async () => {
    const formData = new FormData()
    for (const file of Array.from(input.files ?? [])) {
      formData.append('files', file)
    }
    formData.append('path', getGlobalStore.filePathInfo?.path as string)
    await uploadFileReq.req({
      data: formData
    })
    emits('updateData', getGlobalStore.filePathInfo?.path as string)
  })
  input.click()
  input.remove()
}
const getDirData = async (info: { path: string }) => {
  await getDirDataReq.req({
    data: {
      path: info.path,
      detail: true
    }
  })
  fileList.value = getDirDataReq.resData ?? []
}
const refreshFileList = () => {
  getGlobalStore.filePathInfo && getDirData(getGlobalStore.filePathInfo)
}
defineExpose({
  refresh: refreshFileList
})
watch(
  computed(() => getGlobalStore.filePathInfo),
  () => {
    if (getGlobalStore.filePathInfo) {
      getDirData(getGlobalStore.filePathInfo)
    }
  }
)
</script>

<style scoped lang="stylus">
#fileContent
  flex 1 0 0
  overflow hidden
  display flex
  flex-direction column
  padding 10px
  box-sizing border-box
  .header
    display flex
    align-items center
    padding 5px 0
    .interval
      flex 0 0 16px
    .path
      flex 1 0 0
      font-size 12px
      font-weight bold
      background-color #333333
      padding 10px 15px
      border-radius  8px 0 0 8px
      letter-spacing 1px
  .body
    flex 1 0 0
    display flex
    flex-direction column
  #commonly
    >.title
      font-size 4vh
      font-weight bold
      cursor pointer
      border-radius 5px
      padding 1vh 2vw
      box-sizing border-box
      background-color #333333
    .diskCharacters
      display flex
      flex-wrap wrap
      padding 3vh 0
      flex 0 0 200px
      overflow hidden
      .char
        width 20vw
        height 80px
        margin 10px
        background-color #444444
        padding 10px 20px
        box-sizing border-box
        font-size 12px
        display flex
        border-radius 10px
        align-items center
        cursor pointer
        &:hover
          opacity 0.8
        .icon
          width 30px
          height 30px
        .title
          font-size 18px
          font-weight bold
          flex 1 0 0
          text-align center
</style>
