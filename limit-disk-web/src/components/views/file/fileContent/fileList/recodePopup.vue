<template lang="pug">
Popup(
  v-model:visible="visible"
  title="暂存"
  :minimizeIcon="listImage"
  :full="false"
  ref="popupIns"
  @afterClose="close"
  )
  Table.table(
    :data="list"
    onKey="path"
  )
    template(#default="{data}")
      TableCol(:data="data" :onKey="()=>getFileSrc(data.row)" type="icon" width="50px" )
      TableCol(:data="data" label="名称" onKey="name" :fill="true")
      TableCol(:data="data" label="类型" :onKey="()=>data.row.suffix?.slice(1)??(data.row.isFile?'文件':'文件夹')" :fill="true")
      TableCol(:data="data" type="button" :button="{type:'primary',label:'移动',click:()=>moveTo(data.row)}" width="60px" )
      TableCol(:data="data" type="button" :button="{type:'primary',label:'复制',click:()=>copyTo(data.row)}" width="60px" )
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Popup from '@/components/communal/popup.vue'
import Table from '@/components/communal/table.vue'
import TableCol from '@/components/communal/tableCol.vue'

import listImage from '@/assets/image/list.png'
import type { FileListType } from '@/interface'
import { getFileSrc } from '@/utils'
import { Request } from '@/request'
import { globalStore } from '@/stores'

const props = defineProps<{}>()
const emits = defineEmits<{
  (e: 'refresh'): void
}>()
const list = reactive<Set<FileListType>>(new Set())
const popupIns = ref()
const getGlobalStore = globalStore()
const visible = computed({
  get: () => list.size > 0,
  set: () => list.clear()
})
const close = () => {
  list.clear()
}
const moveToReq = new Request({
  method: 'post',
  url: '/file-system/move-to'
})
const copyToReq = new Request({
  method: 'post',
  url: '/file-system/copy-to'
})
const moveTo = async (item: FileListType) => {
  console.log(item)
  await moveToReq.req({
    data: {
      items: [item],
      path: getGlobalStore.filePathInfo?.path
    }
  })
  list.delete(item)
  emits('refresh')
}
const copyTo = async (item: FileListType) => {
  console.log(item)
  await copyToReq.req({
    data: {
      items: [item],
      path: getGlobalStore.filePathInfo?.path
    }
  })
  list.delete(item)
  emits('refresh')
}
defineExpose({
  addItems: (items: FileListType[]) => {
    for (const item of items) {
      list.add(item)
    }
    popupIns.value.cancelMinimize()
  },
  close
})
</script>

<style scoped lang="stylus">
.list
  min-width 100%
  height 100%
  padding 1vh 2vw
  overflow auto
  box-sizing border-box
  .item
    display flex
    height 40px
    align-items center
    background-color #333333
    .icon
      height 20px
      width 20px
      margin 0 10px
    .label
      font-size 13px
      padding-left 20px
      font-weight bold
      overflow hidden
      white-space nowrap
      text-overflow ellipsis
</style>
