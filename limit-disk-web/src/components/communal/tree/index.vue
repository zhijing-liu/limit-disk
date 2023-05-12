<template lang="pug">
.treeView
  TreeItem(
    v-for="item in items"
    :item="item"
    :key="item.id"
    :ref="(ins)=>treeItemIns[item.id]=ins"
    )
</template>
<script setup lang="ts">
import TreeItem from './treeItem.vue'
import { provide, reactive } from 'vue'
import type { TreeItemType } from '@/interface'

provide('lazy', true)
provide('clickLabel', ({ e, item }: { e: MouseEvent; item: TreeItemType }) => {
  emits('clickLabel', { e, item })
})
const loadItemData = async (item: TreeItemType) => {
  item.children = (await props.getReqData?.(item.id)) ?? []
}
provide('loadItemData', loadItemData)
const treeItemIns = reactive<{ [key: string]: TreeItem }>({})
const props = withDefaults(
  defineProps<{
    items: TreeItemType[]
    getReqData: (path: number | string) => Promise<TreeItemType[]>
  }>(),
  {
    items: () => []
  }
)

const emits = defineEmits<{
  (
    e: 'clickLabel',
    click: {
      e: MouseEvent
      item: TreeItemType
    }
  ): boolean
}>()
const refresh = (path: string) => {
  for (const item of props.items) {
    if (path.startsWith(item.id.toString())) {
      if (path === item.id) {
        if (item.loaded) {
          loadItemData?.(item)
        }
      } else {
        treeItemIns[item.id.toString()]?.refresh(path)
      }
      break
    }
  }
}
defineExpose({
  refresh
})
</script>

<style scoped lang="stylus">
.treeView
  overflow auto
  margin-right 8px
  *
    white-space nowrap
</style>
