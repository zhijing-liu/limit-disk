<template lang="pug">
.tableCol(:style="getStyle" :class="{[`tableCol-${type}`]:true}")
  span(v-if="data.type==='head'") {{label}}
  slot(v-else name="default" :unit="getData")
    span(v-if="type==='text'" :title="getData") {{getData}}
    img.icon(v-else-if="type==='icon'" :src="getData")
    Button(v-else-if="type==='button'" size="small" v-bind="button" @click="(e)=>button?.click?.(e)")
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/communal/button.vue'
const props = withDefaults(
  defineProps<{
    onKey?: string | (() => string)
    data: { type: 'head' | 'body'; row?: { [key: string]: any } }
    fill?: boolean | number
    width?: string
    label?: string
    type?: 'text' | 'icon'
    button?: {
      label: string
      type?: 'primary' | 'error'
      click: (e: MouseEvent) => void
    }
  }>(),
  {
    fill: false,
    width: '30px',
    type: 'text'
  }
)
const getStyle = computed(() =>
  props.fill ? `flex:${+props.fill} 0 0;` : `flex:0 0 ${props.width};`
)
const getData = computed(() => {
  if (typeof props.onKey === 'string') {
    return props.data.row![props.onKey]
  } else if (typeof props.onKey === 'function') {
    return props.onKey()
  } else {
    return props.data.row
  }
})
</script>

<style scoped lang="stylus">
.tableCol
  overflow hidden
  font-size 12px
  font-weight bold
  display flex
  align-items center
  white-space nowrap
  .icon
    width 20px
    height 20px
  .button
    height 100%
.tableCol.tableCol-icon
  justify-content center
</style>
