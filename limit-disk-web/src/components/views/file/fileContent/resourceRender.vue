<template lang="pug">
Popup(
  v-model:visible="visible"
  title="预览"
  @beforeOpen="beforeOpen"
  :minimizeIcon="getFileSrc"
  )
  template(v-if="fileType==='audio'" )
    audio(:src="getStaticPath" controls="true")
</template>
<script setup lang="ts">
import { computed } from 'vue'
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
const fileType = computed(() => suffixMap[props.file?.suffix ?? ''])
const getFileSrc = computed<string>(() => suffixImageMap[fileType.value ?? 'file'])
const getStaticPath = computed(() => `/static/file/${props.file?.name}?path=${props.file?.path}`)
const visible = computed({
  get: () => props.visible,
  set: (v) => emits('update:visible', v)
})
const beforeOpen = () => {
  console.log(props.file)
}
</script>

<style scoped lang="stylus"></style>
