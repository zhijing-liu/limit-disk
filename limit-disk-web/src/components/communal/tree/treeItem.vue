<template lang="pug">
.treeItem
  .label(@click="(e)=>clickLabel({e,item})")
    img.icon(
      :src="item.leaf?starImage:triangleImage"
      :class="{expansionIcon:item.expansion}"
      @click.stop="()=>expansionItem(item)"
      )
    span {{item.name}}
  .expansion(v-if="item.expansion")
    TreeItem(
      v-if="item.children?.length>0"
      v-for="(childItem) in item.children"
      :item="childItem"
      :key="item.id"
      :ref="(ins)=>treeItemIns[item.id]=ins"
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
const expansionItem = inject<(item: TreeItemType) => void>('expansionItem')
const props = defineProps<{
  item: TreeItemType
}>()
const treeItemIns = reactive<{ [key: string]: any }>({})

const refresh = (path: string) => {
  for (const item of props.item.children ?? []) {
    if (path.startsWith(item.id.toString())) {
      if (path === item.id) {
        if (item.loaded) {
          item.loaded = false
          expansionItem?.(item)
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
    padding 2px 6px
    box-sizing border-box
    margin 2px
    user-select none
    max-width 150%
    overflow hidden
    text-overflow ellipsis
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
      &:hover
        background-color #555555
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
</style>
