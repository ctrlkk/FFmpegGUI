<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
import { EventsOn } from '../../wailsjs/runtime/runtime'

const { copy } = useClipboard()
const message = useMessage()

const logs = ref<string>('')
const isAutoScroll = ref(true)

function addLog(message: string) {
  logs.value += message

  if (isAutoScroll.value) {
    nextTick(() => {
      const logContainer = document.querySelector('.log-container')
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight
      }
    })
  }
}

function clearLogs() {
  logs.value = ''
}

async function copyLogs() {
  await copy(logs.value)
  message.success('日志已复制')
}

onMounted(() => {
  EventsOn('commandOutput', (event) => {
    addLog(event)
  })
})
</script>

<template>
  <NCard size="small" class="min-h-96">
    <template #header>
      <div class="w-full flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i-carbon-terminal />
          <span>执行日志</span>
          <NBadge
            v-if="logs"
            :value="logs.split('\n').filter(Boolean).length"
            type="info"
            size="small"
          />
        </div>
        <NSpace size="small">
          <NTooltip trigger="hover">
            <template #trigger>
              <NButton
                size="tiny"
                :type="isAutoScroll ? 'primary' : 'default'"
                @click="isAutoScroll = !isAutoScroll"
              >
                <template #icon>
                  <i-carbon-arrow-down />
                </template>
              </NButton>
            </template>
            {{ isAutoScroll ? '关闭自动滚动' : '开启自动滚动' }}
          </NTooltip>
          <NButton size="tiny" :disabled="!logs" @click="copyLogs">
            <template #icon>
              <i-carbon-copy />
            </template>
            复制
          </NButton>
          <NButton size="tiny" :disabled="!logs" @click="clearLogs">
            <template #icon>
              <i-carbon-trash-can />
            </template>
            清空
          </NButton>
        </NSpace>
      </div>
    </template>

    <div class="log-container h-80 overflow-y-auto rounded-md bg-gray-50 p-3 dark:bg-gray-800">
      <NCode
        v-if="logs"
        :code="logs"
        class="h-full min-h-full text-xs leading-relaxed"
        show-line-numbers
        word-wrap
      />
      <div v-else class="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <i-carbon-terminal class="mb-4 text-4xl opacity-50" />
        <div class="text-center">
          <div class="mb-2 text-lg font-medium">
            暂无日志输出
          </div>
          <div class="text-sm opacity-70">
            点击 "模拟执行" 按钮查看示例日志输出
          </div>
        </div>
      </div>
    </div>
  </NCard>
</template>

<style scoped lang="scss">
/* 自定义滚动条样式 */
.log-container::-webkit-scrollbar {
  width: 6px;
}

.log-container::-webkit-scrollbar-track {
  background: transparent;
}

.log-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 暗黑模式滚动条 */
.dark .log-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .log-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
