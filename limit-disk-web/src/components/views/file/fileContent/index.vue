<template lang="pug">
FileList(
    v-if="getGlobalStore.filePathInfo"
    v-model:fileInfo="getGlobalStore.filePathInfo"
    :favorites="favorites"
    @cancelCollectItem="cancelCollectItem"
    @collectItem="collectItem"
    @skipPath="skipPath"
    @updateData="(data)=>emits('updateData',data)"
    ref="fileListIns"
    )
#fileContent(v-else)
  #commonly.body
    .title · 磁盘
    .diskCharacters
      .char(v-for="item in items" :key="item.id" @click="()=>clickItem(item.id,item.name)")
        img.icon(:src="folderImage")
        .title 本地 : {{item.name[0]}}
    template(v-if="Object.values(favorites).length>0")
      .title · 收藏夹
      FavoritesList(
        v-model:fileInfo="getGlobalStore.filePathInfo"
        @cancelCollectItem="cancelCollectItem"
        :favorites="favorites"
        )
</template>
<script setup lang="ts">
import { globalStore } from '@/stores'
import FileList from './fileList/index.vue'
import FavoritesList from './favorites/index.vue'

import folderImage from '@/assets/image/folder.png'

import type { ItemListType, TreeItemType } from '@/interface'
import { ref } from 'vue'
import { getDirInfoReq, Request } from '@/request'

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
const emits = defineEmits<{
  (e: 'updateData', path: string): void
}>()
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
getFavorites()
const clickItem = (path: string | number, name: string | number, parentPath?: string) => {
  getGlobalStore.filePathInfo = {
    path: path as string,
    name: name as string,
    parentPath
  }
}

const skipPath = async (path = getGlobalStore.filePathInfo?.parentPath) => {
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
const fileListIns = ref()
const refreshFileList = () => {
  fileListIns.value?.refresh()
}
defineExpose({
  refresh: refreshFileList
})
</script>

<style scoped lang="stylus">
#fileContent
  flex 1 0 0
  overflow hidden
  display flex
  flex-direction column
  padding 10px
  box-sizing border-box
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
