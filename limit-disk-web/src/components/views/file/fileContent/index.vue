<template lang="pug">
#fileContent(v-if="getGlobalStore.filePathInfo")
  .header
    Button(@click="getGlobalStore.filePathInfo=undefined" :left-icon="homeImage" type="primary" ) 主页
    .interval
    Button(@click="()=>skipPath()" :left-icon="upperImage") 上一级
    .interval
    Button(@click="uploadFile" :left-icon="uploadImage") 上传文件
    .interval
    .paths
      template(v-for="item in getPathList")
        .path(@click="()=>skipPath(item.path)") {{item.name}}
        .split \
  Table.table(:data="fileList" onKey="path" @dblclickRow="clickFileListItem")
    template(#default="{data}")
      TableCol(:data="data" :onKey="()=>getFileSrc(data.row)" type="icon" width="30px" )
      TableCol(:data="data" label="名称" onKey="name" :fill="true")
      TableCol(:data="data" label="创建时间" :onKey="()=>timeFormat(data.row.time)" :fill="true")
      TableCol(:data="data" label="文件大小" :onKey="()=>getSize(data.row.size)" :fill="true")
      TableCol(:data="data" label="类型" :onKey="()=>data.row.suffix?.slice(1)??data.row.isFile?'文件':'文件夹'" width="60px")
      TableCol(:data="data" width="40px" flex="center")
        img.icon(:src="starImage" :class="{gray:!favorites[data.row.path]}" @click.stop="()=>favorites[data.row.path]?cancelCollectItem(data.row):collectItem(data.row)")
      TableCol(:data="data" type="button" :button="{type:'error',label:'删除',click:()=>removeItems([data.row])}" width="60px")
#fileContent(v-else)
  #commonly.body
    .title · 磁盘
    .diskCharacters
      .char(v-for="item in items" :key="item.id" @click="()=>clickItem(item.id,item.name)")
        img.icon(:src="folderImage")
        .title 本地 : {{item.name[0]}}
    template(v-if="Object.values(favorites).length>0")
      .title · 收藏夹
      Table(:data="favorites" onKey="path" @clickRow="(item)=>clickItem(item.path,item.name,item.parentPath)")
        template(#default="{data}")
          TableCol(:data="data" :onKey="()=>getFileSrc(data.row)" type="icon" width="30px" )
          TableCol(:data="data" label="名称" onKey="name" :fill="true")
          TableCol(:data="data" label="创建时间" :onKey="()=>timeFormat(data.row.time)" :fill="true")
          TableCol(:data="data" label="路径" onKey="path" :fill="true")
          TableCol(:data="data" width="40px" flex="center")
            img.icon(:src="starImage" @click.stop="()=>cancelCollectItem(data.row)")
ResourceRender(
  v-model:visible="resourceRenderVisible"
  :file="renderResourceFile"
  )
</template>
<script setup lang="ts">
import { globalStore } from '@/stores'
import Button from '@/components/communal/button.vue'
import Table from '@/components/communal/table.vue'
import TableCol from '@/components/communal/tableCol.vue'
import ResourceRender from '@/components/views/file/fileContent/resourceRender.vue'

import folderImage from '@/assets/image/folder.png'
import upperImage from '@/assets/image/upper.png'
import uploadImage from '@/assets/image/upload.png'
import homeImage from '@/assets/image/home.png'
import starImage from '@/assets/image/star.png'

import type { FileListType, FileType, ItemListType, TreeItemType } from '@/interface'
import { computed, onBeforeMount, reactive, ref, watch } from 'vue'
import { getDirInfoReq, Request } from '@/request'
import { getSize, suffixImageMap, suffixMap, timeFormat } from '@/utils'
const getFileSrc = (item: ItemListType | FileListType) =>
  item.isFile ? suffixImageMap[suffixMap[(item as FileType).suffix] ?? 'file'] : folderImage
const getGlobalStore = globalStore()
const favorites = ref<{ [key: string]: ItemListType }>({})
withDefaults(
  defineProps<{
    items: TreeItemType[]
  }>(),
  {
    items: () => []
  }
)
const getFavoritesReq = new Request<ItemListType[]>({
  method: 'get',
  url: '/file-system/collect-path'
})
const getFavorites = async () => {
  await getFavoritesReq.req()
  if (getFavoritesReq.resData) {
    const map: { [key: string]: ItemListType } = {}
    for (const item of getFavoritesReq.resData) {
      map[item.path as string] = item
    }
    favorites.value = map
  }
}
const fileList = ref<FileListType[]>([])
onBeforeMount(() => {
  getFavorites()
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

const skipPath = async (path = getGlobalStore.filePathInfo?.parentPath) => {
  console.log(path)
  if (path) {
    await getDirInfoReq.req({
      data: {
        path
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
    renderResourceFile.value = item
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
// path 路径
const getPathList = computed({
  get: () => {
    const list = (getGlobalStore.filePathInfo?.path ?? '').split('\\').filter((r) => r)
    return list.map((item: string, index: number) => ({
      name: item,
      path: `${list.slice(0, index + 1).join('\\')}\\`
    }))
  },
  set: () => {}
})
// 上传
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
// 删除
const removeItemsReq = new Request<FormData>({
  url: '/file-system/remove-items',
  method: 'post'
})
const removeItems = async (itemList: ItemListType[]) => {
  await removeItemsReq.req({
    data: {
      pathList: itemList.map(({ path }) => path)
    }
  })
  itemList.forEach(({ path, isFile, parentPath }) => {
    if (isFile) {
      emits('updateData', parentPath as string)
    } else {
      emits('updateData', path)
    }
  })
}
// 收藏
const collectItemReq = new Request<FormData>({
  url: '/file-system/add-collect-path',
  method: 'post'
})
const collectItem = async (item: ItemListType) => {
  await collectItemReq.req({
    data: {
      path: item.path
    }
  })
  await getFavorites()
}
// 取消收藏
const cancelCollectItemReq = new Request<FormData>({
  url: '/file-system/cancel-collect-path',
  method: 'post'
})
const cancelCollectItem = async (item: ItemListType) => {
  await cancelCollectItemReq.req({
    data: {
      path: item.path
    }
  })
  await getFavorites()
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
// 在线预览
const resourceRenderVisible = computed({
  get: () => !!renderResourceFile.value,
  set: () => {
    renderResourceFile.value = null
  }
})
const renderResourceFile = ref<FileListType | null>(null)
defineExpose({
  refresh: refreshFileList
})
// 监听变化
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
    .paths
      flex 1 0 0
      font-size 12px
      font-weight bold
      background-color #333333
      padding 10px 15px
      border-radius  8px 0 0 8px
      letter-spacing 1px
      display flex
      align-items center
      .path
        padding 3px 5px
        border-radius 4px
        cursor pointer
        &:hover
          background-color #666666
      .split
        padding 0 2px
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
  .table
    .icon
      width 20px
      height 20px
</style>
