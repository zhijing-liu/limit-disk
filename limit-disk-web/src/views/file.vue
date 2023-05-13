<template lang="pug">
#File
  LeftMenu(:items="items" ref="leftMenuIns" @updateData="updateData")
  FileContent(:items="items" ref="fileContent" @updateData="updateData")
</template>
<script setup lang="ts">
import LeftMenu from '@/components/views/file/leftMenu/index.vue'
import FileContent from '@/components/views/file/fileContent/index.vue'
import { onBeforeMount, ref } from 'vue'
import { Request } from '@/request'
import type { TreeItemType } from '@/interface'

const leftMenuIns = ref()
const fileContent = ref()

const items = ref<TreeItemType[]>([])
const getDiskCharacter = new Request({
  method: 'get',
  url: '/file-system/disk-character'
})
const updateData = (path: string) => {
  leftMenuIns.value.refresh(path)
  fileContent.value.refresh(path)
}
onBeforeMount(async () => {
  await getDiskCharacter.req()
  items.value = getDiskCharacter.resData.map((char: string) => ({
    expansion: false,
    name: char,
    id: char,
    leaf: false,
    parentId: ''
  }))
})
</script>

<style scoped lang="stylus">
#File
  height 100%
  width 100%
  display flex
  overflow hidden
</style>
