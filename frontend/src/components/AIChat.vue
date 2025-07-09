<script lang="ts" setup>
const description = ref('')
const isLoadingLLama = ref(true)
const streamData = ref<string>('')
const isAnalyzing = ref(false)

onMounted(() => {
  // window.electron.loadLLama((loadProgress: number) => {
  //   console.warn(loadProgress)
  // }).then(() => {
  //   isLoadingLLama.value = false
  // })
})

async function aiAnalytic() {
  isAnalyzing.value = true
  streamData.value = ''

  // window.electron.getLLamaCmd(description.value, (text) => {
  //   streamData.value += text
  // }).then((_: string) => {
  // }).catch((err) => {
  //   console.error(err)
  // }).finally(() => {
  //   isAnalyzing.value = false
  // })
}

function stopAnalysis() {
  isAnalyzing.value = false
  streamData.value = ''
}
</script>

<template>
  <NSpin :show="isLoadingLLama">
    <NCard
      size="small"
      title="需求描述"
      class="ai-description-card transition-all duration-500 ease-out"
      :class="{ analyzing: isAnalyzing }"
    >
      <template #header-extra>
        <i-carbon-chat />
      </template>

      <!-- 输入区域 -->
      <div class="input-section transition-all duration-500 ease-out" :class="{ minimized: isAnalyzing }">
        <NSpace vertical>
          <NInput
            v-model:value="description"
            type="textarea"
            :rows="isAnalyzing ? 1 : 3"
            :disabled="isAnalyzing"
            placeholder="请描述您的需求，例如：我想把视频压缩到1MB以下，保持清晰度..."
            :size="isAnalyzing ? 'small' : 'medium'"
            class="description-input transition-all duration-500 ease-out"
          />
          <div class="flex justify-end">
            <NButton
              v-if="!isAnalyzing"
              type="primary"
              :disabled="!description.trim()"
              @click="aiAnalytic"
            >
              <template #icon>
                <i-carbon-magic-wand />
              </template>
              分析需求
            </NButton>
            <NButton
              v-else
              type="error"
              @click="stopAnalysis"
            >
              <template #icon>
                <i-carbon-stop />
              </template>
              停止分析
            </NButton>
          </div>
        </NSpace>
      </div>

      <!-- AI输出区域 -->
      <Transition name="slide-down" mode="out-in">
        <div v-if="isAnalyzing || streamData" class="ai-output-section mt-4 transition-all duration-500 ease-out">
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-gray-700 font-medium dark:text-gray-300">
              <i-carbon-bot />
              <span>AI 分析结果</span>
              <NSpin v-if="isAnalyzing" size="small" />
            </div>
            <NButton
              v-if="streamData && !isAnalyzing"
              size="tiny"
            >
              <template #icon>
                <i-carbon-copy />
              </template>
              应用
            </NButton>
          </div>
          <div class="ai-output-container border border-gray-200 rounded-lg bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
            <NScrollbar style="max-height: 100px;">
              <NCode
                :code="streamData || '正在分析中...'"
                language="markdown"
                class="text-sm leading-relaxed"
                word-wrap
              />
            </NScrollbar>
          </div>
        </div>
      </Transition>
    </NCard>
  </NSpin>
</template>

<style scoped lang="scss">
/* AI 描述卡片动画 */
.ai-description-card {
  overflow: hidden;
}

.ai-description-card.analyzing {
  border-color: rgb(34, 197, 94);
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.1);
}

/* 输入区域动画 */
.input-section {
  transform-origin: top;
}

.input-section.minimized {
  opacity: 0.7;
}

.description-input {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* AI 输出区域动画 */
.ai-output-section {
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-output-container {
  animation: fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

/* 动画关键帧 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .ai-output-container {
    max-height: 250px;
  }
}

/* 加载状态的脉冲效果 */
.analyzing .ai-output-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
