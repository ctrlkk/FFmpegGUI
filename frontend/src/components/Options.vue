<script lang="ts" setup>
import type { FFmpegPreset } from '../data/ffmpeg-preset'
import { OpenDirectoryDialog, OpenFileDialog } from '../../wailsjs/go/main/App'

const parameters = defineModel<FFmpegPreset['parameters']>('parameters')
const parameterValues = defineModel<Array<Record<string, any>>>('parameterValues', {
  default: [],
})

// 拉起文件选择器
function selectFile(index: number, key: string, accept?: string) {
  OpenFileDialog('选择文件', accept!).then((filePath) => {
    parameterValues.value[index][key].default = filePath
  }).catch(() => {})
}

// 选择目录
function selectDir(index: number, key: string) {
  OpenDirectoryDialog('选择输出位置').then((dir) => {
    parameterValues.value[index][key].default = dir
  }).catch(() => {})
}

// 分辨率更新方法
// function updateResolution(key: string) {
//   const width = parameterValues[index].value[`${key}_width`]
//   const height = parameterValues[index].value[`${key}_height`]
//   if (width && height) {
//     parameterValues[index].value[key] = `${width}x${height}`
//   }
// }
</script>

<template>
  <NCard size="small" title="参数配置" class="h-fit">
    <template #header-extra>
      <i-carbon-settings />
    </template>
    <NGrid :cols="4" :x-gap="12" :y-gap="12" responsive="screen">
      <template v-for="(item, index) in parameters" :key="index">
        <template v-for="[key, param] in Object.entries(item || {})" :key="key">
          <NGridItem :span="param.type === 'string' ? 4 : 2" :xs-span="4" :sm-span="param.type === 'string' ? 4 : 2">
            <div class="space-y-2">
              <div class="text-sm text-gray-700 font-medium dark:text-gray-300">
                {{ param.label }}
                <span v-if="param.unit" class="ml-1 text-xs text-gray-500">({{ param.unit }})</span>
              </div>

              <!-- 文件输入类型 -->
              <div v-if="param.type === 'file'" class="flex space-x-2">
                <NInput
                  v-model:value="parameterValues[index][key].default"
                  size="small"
                  :placeholder="`选择${param.label}`"
                  readonly
                  class="flex-1"
                />
                <NButton size="small" @click="selectFile(index, key, param.accept)">
                  <template #icon>
                    <NIcon><i-carbon-folder /></NIcon>
                  </template>
                  选择
                </NButton>
              </div>

              <!-- 目录输入类型 -->
              <div v-else-if="param.type === 'directory'" class="flex space-x-2">
                <NInput
                  v-model:value="parameterValues[index][key].default"
                  size="small"
                  :placeholder="`选择${param.label}`"
                  readonly
                  class="flex-1"
                />
                <NButton size="small" @click="selectDir(index, key)">
                  <template #icon>
                    <NIcon><i-carbon-folder /></NIcon>
                  </template>
                  选择
                </NButton>
              </div>

              <!-- 数字输入 -->
              <NInputNumber
                v-else-if="param.type === 'number'"
                v-model:value="parameterValues[index][key].default"
                :min="param.min"
                :max="param.max"
                :step="param.step || 1"
                size="small"
                class="w-full"
              />

              <!-- 字符串输入 -->
              <NInput
                v-else-if="param.type === 'string'"
                v-model:value="parameterValues[index][key].default"
                size="small"
                :placeholder="`输入${param.label}`"
              />

              <!-- 时间输入 -->
              <NInput
                v-else-if="param.type === 'time'"
                v-model:value="parameterValues[index][key].default"
                size="small"
                :placeholder="param.placeholder || 'HH:MM:SS'"
                maxlength="8"
              />

              <!-- 选择器 -->
              <NSelect
                v-else-if="param.type === 'select'"
                v-model:value="parameterValues[index][key].default"
                :options="param.options"
                size="small"
              />

              <!-- 多选器 -->
              <NSelect
                v-else-if="param.type === 'multiselect'"
                v-model:value="parameterValues[index][key].default"
                :options="param.options"
                multiple
                size="small"
              />

              <!-- 开关 -->
              <NSwitch
                v-else-if="param.type === 'boolean'"
                v-model:value="parameterValues[index][key].default"
                size="small"
              />

              <!-- 滑块 -->
              <div v-else-if="param.type === 'slider'" class="space-y-1">
                <NSlider
                  v-model:value="parameterValues[index][key].default"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step || 1"
                  :marks="param.marks"
                />
                <div class="text-center text-xs text-gray-500">
                  {{ parameterValues[index][key].default }}
                </div>
              </div>

              <!-- 颜色选择器 -->
              <NColorPicker
                v-else-if="param.type === 'color'"
                v-model:value="parameterValues[index][key].default"
                size="small"
              />

              <!-- 帮助提示 -->
              <div v-if="param.description" class="mt-1 text-xs text-gray-500">
                {{ param.description }}
              </div>
            </div>
          </NGridItem>
        </template>
      </template>
    </NGrid>
  </NCard>
</template>

<style scoped lang="scss"></style>
