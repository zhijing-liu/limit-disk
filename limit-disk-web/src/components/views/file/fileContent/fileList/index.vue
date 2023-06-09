<template lang="pug">
#fileContent(v-if="fileInfo")
    .header
        Button(@click="emits('update:fileInfo')" :left-icon="homeImage" type="primary" ) 主页
        .interval
        Button(@click="()=>emits('skipPath')" :left-icon="upperImage") 上一级
        .interval
        template(v-if="selectedSize===0" )
          Button(@click="uploadFile" :left-icon="uploadImage") 上传文件
        template(v-else )
          Button(@click="()=>removeItems()" :left-icon="removeImage") 删除
          .interval
          Button(@click="()=>addRecode()" :left-icon="addImage") 添加剪切板
        .interval
        .paths
            template(v-for="(item,index) in getPathList.slice(0,-1)")
              .path.button(@click="()=>emits('skipPath',item.path)") {{item.name}}
              .split \
            .path {{getPathList[getPathList.length-1]?.name}}
    Table.table(
        :data="fileList"
        onKey="path"
        @dblclickRow="clickFileListItem"
        :loading="fileListLoading"
        :contextButtons="contextButtons"
        :allowSelect="true"
        @selectedChanged="selectedChanged"
        ref="tableIns"
    )
        template(#default="{data}")
            TableCol(:data="data" :onKey="()=>getFileSrc(data.row)" type="icon" width="30px" )
            TableCol(:data="data" label="名称" onKey="name" :fill="true")
            TableCol(:data="data" label="创建时间" :onKey="()=>timeFormat(data.row.time)" :fill="true")
            TableCol(:data="data" label="文件大小" :onKey="()=>getSize(data.row.size)" :fill="true")
            TableCol(:data="data" label="类型" :onKey="()=>data.row.suffix?.slice(1)??(data.row.isFile?'文件':'文件夹')" width="60px")
            TableCol(:data="data" width="40px" flex="center")
                img.icon(:src="starImage" :class="{gray:!favorites[data.row.path]}" @click.stop="()=>favorites[data.row.path]?emits('cancelCollectItem',data.row):emits('collectItem',data.row)")
ResourceRender(
    v-model:visible="resourceRenderVisible"
    :file="renderResourceFile"
    @setLast="setLast"
    @setNext="setNext"
)
RecodePopup(ref="recodePopupIns" @refresh="refresh")
</template>
<script setup lang="ts">
import ResourceRender from './resourceRender.vue'
import RecodePopup from './recodePopup.vue'
import Table from '@/components/communal/table.vue'
import TableCol from '@/components/communal/tableCol.vue'
import Button from '@/components/communal/button.vue'

import upperImage from '@/assets/image/upper.png'
import uploadImage from '@/assets/image/upload.png'
import homeImage from '@/assets/image/home.png'
import starImage from '@/assets/image/star.png'
import removeImage from '@/assets/image/remove.png'
import downloadImage from '@/assets/image/download.png'
import addImage from '@/assets/image/add.png'

import { Request } from '@/request'
import { computed, reactive, ref, watch } from 'vue'
import type { FileListType, ItemListType } from '@/interface'
import { getFileSrc, timeFormat, getSize } from '@/utils'

const props = withDefaults(
  defineProps<{
    fileInfo?: { path: string; name: string; parentPath?: string }
    favorites: { [key: string]: ItemListType }
  }>(),
  {
    fileInfo: () => ({
      path: '',
      name: ''
    })
  }
)
const emits = defineEmits<{
  (e: 'update:fileInfo', fileInfo?: typeof props.fileInfo): void
  (e: 'skipPath', path?: string): void
  (e: 'updateData', path: string): void
  (e: 'collectItem', item: ItemListType): void
  (e: 'cancelCollectItem', item: ItemListType): void
}>()

const tableIns = ref()
// 选择
const selectedSize = ref(0)
const selectedChanged = (selected: Set<number | string>) => {
  selectedSize.value = selected.size
}
// 移动复制
const recodePopupIns = ref()
const addRecode = (itemList: FileListType[] = tableIns.value.getSelection()) => {
  recodePopupIns.value.addItems(itemList)
}
// 数据加载
const fileListLoading = ref(false)
const fileList = ref<FileListType[]>([])
const getDirDataReq = new Request<FileListType[]>({
  method: 'post',
  url: '/file-system/get-dir'
})
const contextButtons = (item: FileListType) => {
  const list = [
    {
      title: '删除',
      click: (data: FileListType) => {
        removeItems([data])
      },
      icon: removeImage
    },
    {
      title: '添加剪切板',
      click: (data: FileListType) => {
        recodePopupIns.value.addItems([data])
      },
      icon: addImage
    }
  ]
  if (item.isFile) {
    list.push({
      title: '下载',
      click: (data: FileListType) => {
        downloadFile(data)
      },
      icon: downloadImage
    })
  }
  return list
}
const downloadFile = (item: FileListType) => {
  console.log(item)
  const a = document.createElement('a')
  a.href = getStaticPath(item)
  a.click()
  a.remove()
}
const getStaticPath = (item: FileListType) =>
  `/static/file/${item.name}?path=${item.path}&download=true`
const getDirData = async (info?: { path: string }) => {
  if (info) {
    fileList.value = []
    fileListLoading.value = true
    await getDirDataReq
      .req({
        data: {
          path: info.path,
          detail: true
        }
      })
      .finally(() => {
        fileListLoading.value = false
      })
    fileList.value = getDirDataReq.resData ?? []
  }
}
const refresh = () => {
  getDirData(props.fileInfo)
}
const findRenderResourceIndex = () =>
  fileList.value.findIndex((item) => item.path === renderResourceFile.value?.path)

const setLast = () => {
  const index = findRenderResourceIndex()
  if (index > 0) {
    renderResourceFile.value = fileList.value[index - 1]
  }
}
const setNext = () => {
  const index = findRenderResourceIndex()
  if (index >= 0 && index < fileList.value.length - 1) {
    renderResourceFile.value = fileList.value[index + 1]
  }
}
watch(
  computed(() => props.fileInfo),
  () => {
    if (props.fileInfo.path) {
      getDirData(props.fileInfo)
    }
  },
  {
    immediate: true
  }
)
// 上传
const uploadFileReq = new Request<FormData>({
  url: '/file-system/upload-files',
  method: 'post',
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
const uploadFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  // input.accept = '*'
  input.multiple = true
  input.addEventListener('change', async () => {
    const formData = new FormData()
    for (const file of Array.from(input.files ?? [])) {
      formData.append('files', file)
    }
    formData.append('path', props.fileInfo.path)
    await uploadFileReq.req({
      data: formData
    })
    emits('updateData', props.fileInfo.path)
  })
  input.click()
  input.remove()
}
// path 路径
const getPathList = computed(() => {
  const list = props.fileInfo.path.split('\\').filter((r) => r)
  return list.map((item: string, index: number) => ({
    name: item,
    path: `${list.slice(0, index + 1).join('\\')}\\`
  }))
})

// 删除
const removeItemsReq = new Request<FormData>({
  url: '/file-system/remove-items',
  method: 'post'
})
const removeItems = async (itemList: FileListType[] = tableIns.value.getSelection()) => {
  await removeItemsReq.req({
    data: {
      pathList: itemList.map(({ path }) => path)
    }
  })
  itemList.forEach(({ path, isFile, parentPath }) => {
    if (isFile) {
      emits('updateData', parentPath as string)
    } else {
      emits('updateData', path)
    }
  })
}
// 组件
// 在线预览
const resourceRenderVisible = computed({
  get: () => !!renderResourceFile.value,
  set: (v) => {
    !v && (renderResourceFile.value = null)
  }
})
const renderResourceFile = ref<FileListType | null>(null)
// event
// * click
const clickFileListItem = (item: FileListType) => {
  if (item.isFile) {
    renderResourceFile.value = item
  } else {
    emits('update:fileInfo', {
      path: item.path,
      name: item.name,
      parentPath: item.parentPath
    })
  }
}
defineExpose({
  refresh
})
</script>
<style scoped lang="stylus">
#fileContent
  flex 1 0 0
  overflow hidden
  display flex
  flex-direction column
  padding 10px
  box-sizing border-box
  .header
    display flex
    align-items center
    padding 5px 0
    .interval
      flex 0 0 16px
    .paths
      flex 1 0 0
      font-size 12px
      font-weight bold
      background-color #333333
      padding 10px 15px
      border-radius 8px 0 0 8px
      letter-spacing 1px
      display flex
      align-items center
      overflow hidden
      .path
        padding 3px
        border-radius 4px
        overflow hidden
        white-space nowrap
        text-overflow ellipsis
      .path.button
        padding 3px 5px
        cursor pointer
        &:hover
          background-color #666666
      .split
        padding 0 2px
  .body
    flex 1 0 0
    display flex
    flex-direction column
  .table
    .icon
      width 20px
      height 20px
</style>
