<template lang="pug">
.button(@click.stop="(e)=>emits('click',e)")
  img.icon(:src="leftIcon" v-if="leftIcon")
  .buttonContent
    slot(name="default")
    span {{label??''}}
  img.icon(:src="rightIcon" v-if="rightIcon")
</template>

<script setup lang="ts">
const props = defineProps<{
  leftIcon?: string
  rightIcon?: string
  label?: string
}>()
const emits = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<style scoped lang="stylus">
.button
  padding 8px 15px
  background-color #444444
  display flex
  align-items center
  border-radius 8px
  user-select none
  cursor pointer
  .buttonContent
    padding 0 7px
    font-size 13px
    font-weight bold
    height 20px
    display flex
    align-items center
    justify-content center
  .icon
    width 20px
    height 20px
    object-fit contain
  &:hover
    background-color #4D4D4D
</style>
