<template lang="pug">
.button(@click.stop="(e)=>emits('click',e)" :class="{[size]:size,[type]:type}" )
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
  size?: 'small' | 'large'
  type?: 'primary' | 'error'
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
.button.small
  padding 4px 8px
  border-radius 4px
  .buttonContent
    padding 0 4px
    height 16px
  .icon
    width 16px
    height 16px
.button.primary
  background-color rgb(38,135,133)
  &:hover
    background-color rgb(120,194,196)
.button.error
  background-color rgb(225,107,140)
  &:hover
    background-color #E87A90
</style>
