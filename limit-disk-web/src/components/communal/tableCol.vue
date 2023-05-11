<template lang="pug">
.tableCol(:style="getStyle" :class="{[`tableCol-${type}`]:true}")
  span(v-if="data.type==='head'") {{label}}
  slot(v-else name="default" :unit="getData")
    span(v-if="type==='text'" :title="getData") {{getData}}
    img.icon(v-else-if="type==='icon'" :src="getData" )
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    onKey: string | (() => string)
    data: { type: 'head' | 'body'; row?: { [key: string]: any } }
    fill?: boolean | number
    width?: string
    label?: string
    type?: 'text' | 'icon'
  }>(),
  {
    fill: false,
    width: '40px',
    type: 'text'
  }
)
const getStyle = computed(() => `flex:${+props.fill} 0 ${props.width};`)
const getData = computed(() => {
  if (typeof props.onKey === 'string') {
    return props.data.row![props.onKey]
  } else {
    return props.onKey()
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
.tableCol.tableCol-icon
  justify-content center
</style>
