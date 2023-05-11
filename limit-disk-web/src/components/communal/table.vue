<template lang="pug">
.table
  .header.row
    slot(
      name="default"
      :data="{type:'head'}"
    )
  .body
    .row(
      v-for="item in data"
      :key="item[onKey]"
      @click="emits('clickRow',item)"
      @dblclick="emits('dblclickRow',item)"
      )
      slot(
        name="default"
        :data="{type:'body',row:item}"
        )
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    data: any[]
    onKey: string
  }>(),
  {
    data: () => [],
    onKey: 'id'
  }
)
const emits = defineEmits<{
  (e: 'clickRow', item: any): void
  (e: 'dblclickRow', item: any): void
}>()
</script>

<style scoped lang="stylus">
.table
  flex 1 0 0
  display flex
  flex-direction column
  overflow hidden
  .body
    flex 1 0 0
    display flex
    flex-direction column
    overflow auto
  .row
    display flex
    height 40px
    flex 0 0 40px
    align-items center
    padding 0 10px
    box-sizing border-box
    font-size 12px
    background-color #282828
    margin 2px 0
    cursor pointer
    user-select none
    &:hover
      background-color #444444
  .row.header
    background-color #333333
</style>
