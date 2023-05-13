<template lang="pug">
Popup(
  v-model:visible="visible"
  title="预览"
  @beforeOpen="beforeOpen"
  :minimizeIcon="getFileSrc"
  v-model:full="fullscreen"
  ref="popupIns"
  )
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

import { suffixImageMap, suffixMap } from '@/utils'

import type { FileListType } from '@/interface'

const props = defineProps<{
  file?: FileListType
  visible: boolean
}>()
const emits = defineEmits<{
  (e: 'update:visible', visible: boolean): void
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
const beforeOpen = () => {
  console.log(props.file)
}
</script>

<style scoped lang="stylus">
.image
  height 100%
  width 100%
  object-fit contain
.displayArea
  flex 1 0 100%
  height 100%
</style>
