<script setup lang="ts">
import type { FFmpegPreset } from '../data/ffmpeg-preset'
import { useClipboard, useDark, useScroll } from '@vueuse/core'
import { throttle } from 'lodash'
import { quote } from 'shell-quote'
import { createHighlighter } from 'shiki'
import { ShikiMagicMove } from 'shiki-magic-move/vue'
import { ExecuteCommand, StopCommand } from '../../wailsjs/go/main/App'

import { ffmpegPreset, replaceFFmpegTemplate } from '../data/ffmpeg-preset'
import 'shiki-magic-move/dist/style.css'

const { copy } = useClipboard()
const message = useMessage()
const isDark = useDark({ disableTransition: false })

const presets = ref<FFmpegPreset[]>(ffmpegPreset)
const selectedPresetId = ref<string>('crop')
const isExecuting = ref(false)

const { y: scrollY } = useScroll(window)
const isScrolled = computed(() => throttle(() => scrollY.value > 80, 200)())

const presetOptions = computed(() => {
  return presets.value.map(preset => ({ label: preset.name, value: preset.id }))
})

const currentPreset = computed(() => {
  return presets.value.find(p => p.id === selectedPresetId.value)
})

const generatedCommand = computed(() => {
  if (!currentPreset.value)
    return ''
  const command = replaceFFmpegTemplate(currentPreset.value.template, currentPreset.value.parameters)
  currentPreset.value.parameters.forEach((param, index) => {
    let isFile = false
    Object.entries(param).forEach(([_, value]) => {
      if (value.type === 'file' || value.type === 'directory') {
        isFile = true
      }
    })
    if (isFile) {
      command[index] = quote([command[index]])
    }
  })
  return command.join(' ')
})

const highlighter = await createHighlighter({
  themes: [
    'dark-plus',
    'light-plus',
  ],
  langs: ['shell'],
})

async function submitCommand() {
  if (isExecuting.value) {
    // 中断执行
    try {
      await StopCommand()
      message.success('命令已中断')
    }
    catch (error) {
      message.error('中断命令失败')
      console.error('Stop command error:', error)
    }
    finally {
      isExecuting.value = false
    }
  }
  else {
    // 开始执行
    isExecuting.value = true
    try {
      await ExecuteCommand(replaceFFmpegTemplate(currentPreset.value!.template, currentPreset.value!.parameters))
      message.success('命令执行完成')
    }
    catch (error) {
      message.error('命令执行失败')
      console.error('Execute command error:', error)
    }
    finally {
      isExecuting.value = false
    }
  }
}

async function copyCommand() {
  await copy(generatedCommand.value)
  message.success('已复制')
}

function resetParameters() {}

function onDragEnter(e: DragEvent) {
  e.preventDefault()
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    const files = e.dataTransfer.files
    for (let i = 0; i < files.length; i++) {
      message.info(files[i].name)
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900" @drop="onDrop" @dragenter="onDragEnter" @dragover="onDragOver" @dragleave="onDragLeave">
    <div class="bg-white px-4 pt-2 dark:bg-gray-800">
      <div class="flex items-center justify-between">
        <i-logos-ffmpeg class="text-2xl" />
        <NSpace size="small">
          <NButton size="small" @click="resetParameters">
            <template #icon>
              <i-carbon-reset />
            </template>
            重置
          </NButton>
          <NButton size="small" type="primary" @click="copyCommand">
            <template #icon>
              <i-carbon-copy />
            </template>
            复制命令
          </NButton>
          <NButton
            size="small"
            :type="isExecuting ? 'error' : 'info'"
            @click="submitCommand"
          >
            <template #icon>
              <i-carbon-stop v-if="isExecuting" />
              <i-carbon-play v-else />
            </template>
            {{ isExecuting ? '中断' : '执行' }}
          </NButton>
        </NSpace>
      </div>
    </div>

    <!-- 命令显示区域 -->
    <div class="sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div class="border border-gray-200 rounded-lg bg-gray-100 px-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
        <NScrollbar :x-scrollable="true">
          <ShikiMagicMove
            lang="shell"
            :theme="isDark ? 'dark-plus' : 'light-plus'"
            :highlighter="highlighter"
            :code="generatedCommand"
            :options="{ duration: 300, stagger: 0.3, lineNumbers: false }"
          />
        </NScrollbar>
      </div>

      <div class="relative w-100% flex justify-end">
        <Transition mode="in-out" name="slide-bounce">
          <NSpace v-show="isScrolled" size="small" class="absolute z-50 border border-gray-200 border-rounded bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <NButton size="small" type="primary" @click="copyCommand">
              <template #icon>
                <i-carbon-copy />
              </template>
            </NButton>
            <NButton
              size="small"
              :type="isExecuting ? 'error' : 'info'"
              @click="submitCommand"
            >
              <template #icon>
                <i-carbon-stop v-if="isExecuting" />
                <i-carbon-play v-else />
              </template>
            </NButton>
          </NSpace>
        </Transition>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="pb-8 pt-4">
      <div class="mx-auto max-w-7xl px-4">
        <NGrid :cols="12" :x-gap="16" :y-gap="16" responsive="screen">
          <!-- 预设选择区域 -->
          <NGridItem :span="12" :md-span="4">
            <NCard size="small" title="预设模板" class="h-fit">
              <NSelect
                v-model:value="selectedPresetId"
                :options="presetOptions"
                size="medium"
                placeholder="选择预设模板"
              />
              <template #header-extra>
                <i-carbon-template />
              </template>
            </NCard>
          </NGridItem>

          <!-- 参数配置区域 -->
          <NGridItem :span="12" :md-span="8">
            <Options v-model:parameters="currentPreset!.parameters" v-model:parameter-values="currentPreset!.parameters" />
          </NGridItem>

          <!-- 日志输出区域 -->
          <NGridItem :span="12">
            <LogsCard />
          </NGridItem>
        </NGrid>

        <!-- 底部提示 -->
        <div class="mt-6">
          <NAlert type="info" size="small" :show-icon="false" class="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <div class="text-sm text-blue-700 dark:text-blue-300">
              <strong>使用提示：</strong> 点击执行按钮开始处理，执行中可点击中断按钮停止处理
            </div>
          </NAlert>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.slide-bounce-enter-active {
  animation: slide-in 0.5s ease-out;
}

.slide-bounce-leave-active {
  animation: slide-in 0.5s ease-out reverse;
}

@keyframes slide-in {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  60% {
    transform: translateY(10%);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

:deep(.shiki-magic-move-container) {
  background-color: initial !important;
}
</style>
