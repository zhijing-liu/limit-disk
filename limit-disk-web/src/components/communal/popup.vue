<template lang="pug">
.popupMask(
  :class="{visible:watchVisible,[state]:true}"
  @click.stop="clickMask"
  ref="maskIns"
  )
  Transition(name="fade")
    .popup(
      v-if="watchVisible&&state!=='minimize'"
      @click.stop
      :style="getMinimizePopupStyle"
      )
      .header
        .title {{title??''}}
        .space
        img.closeIcon(:src="minimizeImage" @click="setMinimize")
        img.closeIcon(:src="fullScreenImage" @click="state=state==='fullscreen'?'normal':'fullscreen'")
        img.closeIcon(:src="closeImage" @click="close")
      .body
        slot(name="default" )
    .popup(
      v-else-if="watchVisible&&state==='minimize'"
      @click.stop
      @mousedown.stop="mousedown"
      :style="getMinimizePopupStyle"
      )
      img.minimizeIcon(:src="minimizeIcon" draggable="false")
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import closeImage from '@/assets/image/close.png'
import minimizeImage from '@/assets/image/minimize.png'
import fullScreenImage from '@/assets/image/fullScreen.png'

const props = withDefaults(
  defineProps<{
    visible: boolean
    clickMaskToClose?: boolean
    title?: string
    full?: boolean
    minimizeIcon: string
  }>(),
  {
    clickMaskToClose: true,
    full: false
  }
)
const emits = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'clickMask', event: MouseEvent): void
  (e: 'beforeClose'): void
  (e: 'afterClose'): void
  (e: 'beforeOpen'): void
  (e: 'afterOpen'): void
}>()
const maskIns = ref<HTMLDivElement | any>()
const watchVisible = ref(props.visible)
const state = ref(props.full ? 'fullscreen' : 'normal')
const clickMask = (e: MouseEvent) => {
  emits('clickMask', e)
  if (props.clickMaskToClose) {
    close()
  }
}
const minimizeOffset = reactive({
  x: 0,
  y: 0,
  lastX: 0,
  lastY: 0
})
const setMinimize = () => {
  minimizeOffset.x = minimizeOffset.lastX || maskIns.value.getBoundingClientRect().width / 2 - 30
  minimizeOffset.y = minimizeOffset.lastY
  nextTick(() => {
    state.value = 'minimize'
  })
}
const dragging = ref(false)
const mousedown = (e: MouseEvent) => {
  const startOffset = {
    x: e.x,
    y: e.y,
    startOffsetX: minimizeOffset.x,
    startOffsetY: minimizeOffset.y
  }
  dragging.value = true
  const rect = maskIns.value.getBoundingClientRect()
  const move = (e: MouseEvent) => {
    minimizeOffset.x = Math.max(
      -rect.width / 2 + 30,
      Math.min(rect.width / 2 - 30, e.x - startOffset.x + startOffset.startOffsetX)
    )
    minimizeOffset.y = Math.max(
      -rect.height / 2 + 30,
      Math.min(rect.height / 2 - 30, e.y - startOffset.y + startOffset.startOffsetY)
    )
  }
  const up = (e: MouseEvent) => {
    document.body.removeEventListener('mousemove', move)
    document.body.removeEventListener('mouseup', up)
    dragging.value = false
    if (Math.hypot(e.x - startOffset.x, e.y - startOffset.y) < 3) {
      minimizeOffset.lastX = minimizeOffset.x
      minimizeOffset.lastY = minimizeOffset.y
      minimizeOffset.x = 0
      minimizeOffset.y = 0
      nextTick(() => {
        state.value = props.full ? 'fullscreen' : 'normal'
      })
    }
    e.stopPropagation()
  }
  document.body.addEventListener('mousemove', move)
  document.body.removeEventListener('mouseleave', up)
  document.body.addEventListener('mouseup', up)
}
const getMinimizePopupStyle = computed(
  () =>
    `transform:translate(${minimizeOffset.x}px, ${minimizeOffset.y}px);${
      dragging.value ? 'transition-duration:0s' : ''
    }`
)
const close = () => {
  emits('update:visible', false)
}
const open = () => {
  emits('update:visible', true)
}
defineExpose({
  close,
  open
})
watch(
  computed(() => props.visible),
  () => {
    if (props.visible) {
      emits('beforeOpen')
      watchVisible.value = true
      emits('afterOpen')
    } else {
      emits('beforeClose')
      watchVisible.value = false
      emits('afterClose')
    }
  }
)
</script>

<style scoped lang="stylus">
.popupMask
  position fixed
  left 0
  right 0
  top 0
  bottom 0
  pointer-events none
  display flex
  flex-direction column
  justify-content center
  align-items center
  z-index 1
  transition all 0.5s
  .popup
    position absolute
    width 60vw
    height 60vh
    display flex
    flex-direction column
    justify-content center
    align-items center
    background-color #222222
    border-radius 20px
    overflow hidden
    transition all ease-in 0.5s
    .header
      height 60px
      display flex
      padding 10px 20px
      box-sizing border-box
      align-items center
      width 100%
      .title
        font-size 18px
        font-weight bold
        letter-spacing 3px
      .space
        flex 1
      .closeIcon
        height 25px
        cursor pointer
        margin 0 5px
        &:hover
          opacity 0.7
    .body
      flex 1 0 0
      display flex
      flex-direction column
      overflow hidden
      padding 10px
      box-sizing border-box
      width 100%
    .minimizeIcon
      height 60%
      width 60%
      object-fit contain
.popupMask.visible
  pointer-events all
  background-color rgba(33,33,33,.2)

.popupMask.fullscreen
  .popup
    width 100%
    height 100%
.popupMask.minimize
  pointer-events none
  .popup
    pointer-events all
    width 50px
    height 50px
    background-color rgba(77,77,77,.5)
    border-radius 50%
    cursor pointer
    user-select none
    &:hover
      background-color rgba(144,144,144,.5)
</style>
