<script lang="ts" setup>
import { useDark } from '@vueuse/core'
import { darkTheme, dateZhCN, NConfigProvider, NMessageProvider, zhCN } from 'naive-ui'

const isDark = useDark({ disableTransition: false })

window.addEventListener('keyup', (e) => {
  if (e.key === 'Escape') {
    isDark.value = !isDark.value
  }
})
</script>

<template>
  <NConfigProvider class="h100% w100%" :date-locale="dateZhCN" :locale="zhCN" :theme="isDark ? darkTheme : undefined">
    <NMessageProvider>
      <NLoadingBarProvider>
        <main class="h100% w100% dark:bg-dark">
          <Suspense>
            <Works />
          </Suspense>
        </main>
      </NLoadingBarProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style></style>
