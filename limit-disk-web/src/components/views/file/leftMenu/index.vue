<template lang="pug">
#leftMenu(:class="{expansion}")
  .title
    .text limit-disk
    img.icon(:src="menuImage" @click="expansion=!expansion")
  TreeView.treeView.scrollSmooth(
    :items="items"
    @clickLabel="clickLabel"
    :getReqData="getReqData"
    ref="treeViewIns"
    :selected="getGlobalStore.filePathInfo?.path"
    )
</template>
<script setup lang="ts">
import TreeView from '@/components/communal/tree/index.vue'
import { onBeforeMount, ref } from 'vue'
import { getDirInfoReq, Request } from '@/request'

import menuImage from '@/assets/image/menu.png'

import type { FileListType, ItemListType, TreeItemType } from '@/interface'

import { globalStore } from '@/stores'
const getGlobalStore = globalStore()

const treeViewIns = ref()
const expansion = ref(true)
withDefaults(
  defineProps<{
    items: TreeItemType[]
  }>(),
  {
    items: () => []
  }
)

const loadTreeData = new Request<TreeItemType[]>(
  {
    method: 'post',
    url: '/file-system/get-dir'
  },
  (items) =>
    items.map((item: FileListType) => ({
      name: item.name,
      id: item.path,
      leaf: item.isFile,
      parentId: item.parentPath
    }))
)
const getReqData = async (path: string) =>
  loadTreeData.req({
    data: {
      path
    }
  })

const clickLabel = async ({ item }: { e: MouseEvent; item: TreeItemType }) => {
  const path = item.leaf ? item.parentId.toString() : item.id.toString()
  console.log(item)
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
}
const refresh = (path: string) => {
  treeViewIns.value?.refresh(path)
}
defineExpose({
  refresh
})
</script>

<style scoped lang="stylus">
#leftMenu
  display flex
  flex-direction column
  width 50px
  background-color #282828
  transition all 0.3s
  .title
    display flex
    justify-content space-between
    align-items center
    .text
      display none
      overflow hidden
      white-space nowrap
      padding 20px
      font-size 26px
      font-weight bold
      user-select none
      text-transform uppercase
    .icon
      width 30px
      height 30px
      padding 5px
      border-radius 20px
      cursor pointer
      margin 10px 5px
      transform rotate(0)
      background-color #333333
      transition all 0.3s
      align-self flex-end
      &:hover
        background-color #444444
  .treeView
    flex 1 0 0
    overflow auto
    display none
#leftMenu.expansion
  width 300px
  .title
    .text
      display block
    .icon
      margin 20px
      transform rotate(90deg)
  .treeView
    display block
</style>
