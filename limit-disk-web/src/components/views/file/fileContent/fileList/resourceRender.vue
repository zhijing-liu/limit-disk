<template lang="pug">
Popup(
  v-model:visible="visible"
  title="预览"
  :minimizeIcon="getFileSrc"
  v-model:full="fullscreen"
  ref="popupIns"
  )
  .arrowButton.leftButton(@click="emits('setLast')")
    img.icon(:src="lastImage")
  .arrowButton.rightButton(@click="emits('setNext')")
    img.icon(:src="nextImage")
  template(v-if="fileType==='audio'" )
    audio.displayArea(:src="getStaticPath" controls="true" autoplay="true")
  template(v-if="fileType==='video'" )
    video.displayArea(:src="getStaticPath" controls="true" autoplay="true")
  template(v-if="fileType==='pic'" )
    img.displayArea.image(:src="getStaticPath")
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Popup from '@/components/communal/popup.vue'
import lastImage from '@/assets/image/last.png'
import nextImage from '@/assets/image/next.png'

import { suffixImageMap, suffixMap } from '@/utils'

import type { FileListType } from '@/interface'

const props = defineProps<{
  file?: FileListType
  visible: boolean
}>()
const emits = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'setLast'): void
  (e: 'setNext'): void
}>()
const popupIns = ref()
const fullscreen = ref(true)
const fileType = computed(() => suffixMap[props.file?.suffix ?? ''])
const getFileSrc = computed<string>(() => suffixImageMap[fileType.value ?? 'file'])
const getStaticPath = computed(() => `/static/file/${props.file?.name}?path=${props.file?.path}`)
const visible = computed({
  get: () => props.visible,
  set: (v) => emits('update:visible', v)
})
watch(
  computed(() => props.file),
  () => {
    if (props.file) {
      popupIns.value.cancelMinimize()
    }
  }
)
</script>

<style scoped lang="stylus">
.arrowButton
  width 40px
  height 40px
  display flex
  justify-content center
  align-items center
  position absolute
  top 50%
  transform translateY(-50%)
  z-index 1
  cursor pointer
  border-radius 8px
  .icon
    width 80%
    height 80%
  &:hover
    background-color #444444
.leftButton
  left 10px
.rightButton
  right 10px
.image
  height 100%
  width 100%
  object-fit contain
.displayArea
  flex 1 0 100%
  //height inherit
  width inherit
</style>
