<template lang="pug">
Table.table(:data="favorites" onKey="path"
    @clickRow="(item)=>clickItem(item.path,item.name,item.parentPath)"
    )
  template(#default="{data}")
    TableCol(:data="data" :onKey="()=>getFileSrc(data.row)" type="icon" width="30px" )
    TableCol(:data="data" label="名称" onKey="name" :fill="true")
    TableCol(:data="data" label="创建时间" :onKey="()=>timeFormat(data.row.time)" :fill="true")
    TableCol(:data="data" label="路径" onKey="path" :fill="true")
    TableCol(:data="data" width="40px" flex="center")
        img.icon(:src="starImage" @click.stop="()=>emits('cancelCollectItem',data.row)")
</template>
<script setup lang="ts">
import Table from '@/components/communal/table.vue'
import TableCol from '@/components/communal/tableCol.vue'
import type { ItemListType } from '@/interface'
import { getFileSrc, timeFormat } from '@/utils'

import starImage from '@/assets/image/star.png'

const props = withDefaults(
  defineProps<{
    fileInfo?: { path: string; name: string; parentPath?: string }
    favorites: { [key: string]: ItemListType }
  }>(),
  {
    fileInfo: () => ({
      path: '',
      name: ''
    })
  }
)
const emits = defineEmits<{
  (e: 'update:fileInfo', fileInfo?: typeof props.fileInfo): void
  (e: 'cancelCollectItem', item: ItemListType): void
}>()
const clickItem = (path: string, name: string, parentPath?: string) => {
  emits('update:fileInfo', {
    path: path,
    name: name,
    parentPath
  })
}
</script>
<style scoped lang="stylus">
.table
  .icon
    width 20px
    height 20px
</style>
