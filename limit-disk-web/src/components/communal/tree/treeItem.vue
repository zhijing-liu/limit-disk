<template lang="pug">
.treeItem(:class="{selected:selected===item.id}")
  .label(@click="(e)=>clickLabel({e,item})")
    img.icon(
      :src="item.leaf?starImage:triangleImage"
      :class="{expansionIcon:item.expansion}"
      @click.stop="()=>expansionItem(item)"
      )
    span {{item.name}}
  .expansion(v-if="item.expansion")
    template(v-if="item.children?.length>0")
      TreeItem(
        v-for="(childItem) in item.children"
        :item="childItem"
        :key="item.id"
        :ref="(ins)=>treeItemIns[item.id]=ins"
        :selected="selected"
        )
    .empty(v-else) 空
</template>
<script setup lang="ts">
import { inject, reactive } from 'vue'
import triangleImage from '@/assets/image/triangle.png'
import starImage from '@/assets/image/star.png'

import type { TreeItemType } from '@/interface'

const lazy = inject('lazy', () => false)

const clickLabel = inject<(data: { e: MouseEvent; item: TreeItemType }) => any>('clickLabel')
const loadItemData = inject<(item: TreeItemType) => Promise<void>>('loadItemData', async () => {})
const props = defineProps<{
  item: TreeItemType
  selected?: string | number
}>()
const expansionItem = async (item: TreeItemType) => {
  if (!item.leaf) {
    if (!item.loaded) {
      await loadItemData?.(item)
    }
    item.expansion = !item.expansion
    item.loaded = true
  }
}
const treeItemIns = reactive<{ [key: string]: any }>({})

const refresh = (path: string) => {
  for (const item of props.item.children ?? []) {
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
.treeItem
  display flex
  flex-direction column
  .label
    display flex
    align-items center
    cursor pointer
    font-size 12px
    font-weight bold
    padding 2px 4px
    box-sizing border-box
    margin 2px 6px
    user-select none
    max-width 150%
    overflow hidden
    text-overflow ellipsis
    &:hover
      background-color #555555
    .icon
      width 8px
      height 8px
      margin-left 5px
      padding 10px
      transition transform 0.3s
      transform rotate(-90deg)
    .icon.expansionIcon
      transform rotate(0deg)
      transform-origin center center
    span
      height 28px
      flex 1 0 0
      padding-left 10px
      box-sizing border-box
      display flex
      align-items center
      transition all 0.1s
  .expansion
    padding-left 20px
    .empty
      height 40px
      font-size 12px
      display flex
      align-items center
      padding-left 20px
      font-weight bold
      pointer-events none
.treeItem.selected
  >.label
    background-color #1b615f
    >span
      background-color transparent
</style>
