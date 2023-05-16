<template lang="pug">
.table(@click="contextMenu=undefined")
  Transition(name="fade")
    .loading(v-show="loading")
        img.icon(:src="loadingImage")
  .header.row
    slot(
      name="default"
      :data="{type:'head'}"
    )
  .body
    .row(
      v-for="(item,index) in data"
      :key="item[onKey]??index"
      @click="(e)=>clickRow(e,item,index)"
      @dblclick="emits('dblclickRow',item)"
      @contextmenu.stop.prevent="contextMenu=item[onKey]"
      :class="{selected:selectedRow.has(item[onKey])}"
      )
      slot(
        name="default"
        :data="{type:'body',row:item}"
        )
      .contextMenu(
          @click.stop="contextMenu=undefined"
          @dblclick.stop
          :class="{visible:contextMenu===item[onKey]}"
          @contextmenu.stop.prevent="contextMenu=undefined"
          )
        img.button(
            v-for="button in getContextButtons(item)"
            @click="()=>button.click(item)"
            :src="button.icon"
            :class="{type:button.type}"
            :title="button.title"
            )
</template>
<script setup lang="ts">
import loadingImage from '@/assets/svg/loading.svg'
import { computed, reactive, ref, watch } from 'vue'
const props = withDefaults(
  defineProps<{
    data: any[] | { [key: string]: any }
    onKey: string
    loading?: boolean
    allowSelect?: boolean
    contextButtons?:
      | {
          icon: string
          title: string
          click: (data: any) => void
          type?: string
        }[]
      | ((item: any) => {
          icon: string
          title: string
          click: (data: any) => void
          type?: string
        }[])
  }>(),
  {
    data: () => [],
    onKey: 'id',
    allowSelect: false
  }
)
const getContextButtons = computed(() => {
  if (typeof props.contextButtons === 'function') {
    return props.contextButtons
  } else if (typeof props.contextButtons === 'object') {
    return (item: any) => props.contextButtons
  } else {
    return () => []
  }
})
const contextMenu = ref()
const emits = defineEmits<{
  (e: 'clickRow', item: any): void
  (e: 'dblclickRow', item: any): void
  (e: 'selectedChanged', list: typeof selectedRow): void
}>()
const selectedRow = reactive(new Set())
watch(
  computed(() => props.data),
  () => {
    selectedRow.clear()
    shiftSelectKey.value = undefined
  }
)
watch(selectedRow, () => {
  emits('selectedChanged', selectedRow)
})
const shiftSelectKey = ref()
const clickRow = (e: MouseEvent, item: any, index: number) => {
  if (props.allowSelect) {
    const key = item[props.onKey] ?? index
    if (e.ctrlKey) {
      selectedRow.has(key) ? selectedRow.delete(key) : selectedRow.add(key)
      shiftSelectKey.value = undefined
    } else if (e.shiftKey) {
      if (shiftSelectKey.value && shiftSelectKey.value !== key) {
        let start = false
        props.data.forEach((item: any, index: number) => {
          if (
            (item[props.onKey] ?? index) === shiftSelectKey.value ||
            (item[props.onKey] ?? index) === key
          ) {
            start = !start
            selectedRow.add(item[props.onKey] ?? index)
          }
          if (start) {
            selectedRow.add(item[props.onKey] ?? index)
          }
        })
      } else {
        shiftSelectKey.value = key
        selectedRow.add(key)
      }
    } else {
      shiftSelectKey.value = undefined
      selectedRow.clear()
    }
  }
  emits('clickRow', item)
}
defineExpose({
  getSelection: () => {
    return props.data.filter((item: any, index: number) =>
      selectedRow.has(item[props.onKey] ?? index)
    )
  }
})
</script>

<style scoped lang="stylus">
.table
  flex 1 0 0
  display flex
  flex-direction column
  overflow hidden
  position relative
  .loading
    position absolute
    width 100%
    height 100%
    display flex
    flex-direction column
    justify-content center
    align-items center
    overflow hidden
    .icon
      width 40px
      height 40px
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
    position relative
    overflow hidden
    &:hover
      background-color #444444
    .contextMenu
      position absolute
      display flex
      right 0
      background-color #235d5d
      height 100%
      //width 100%
      //padding 0 15px
      box-sizing border-box
      align-items center
      transition all 0.3s
      transform translateX(100%)
      transform-origin top
      border-radius 8px 0 0 8px
      overflow hidden
      .button
        height 100%
        //width 20px
        box-sizing border-box
        padding 8px
        //border-radius 5px
        background-color #235d5d
        //margin 2px
        &:hover
          background-color #297876
    .contextMenu.visible
      transform rotate3d(1,0,0,0deg)
  .row.header
    background-color #333333
  .row.selected
    background-color #268785
</style>
