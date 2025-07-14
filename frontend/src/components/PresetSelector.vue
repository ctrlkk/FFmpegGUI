<script setup lang="ts">
import type { FFmpegPreset } from '../data/ffmpeg-preset'
import ArrowRight from '~icons/carbon/arrow-right'
import Image from '~icons/carbon/image'
import Music from '~icons/carbon/music'
import Star from '~icons/carbon/star'
import Video from '~icons/carbon/video'

const props = defineProps<{
  presets: FFmpegPreset[]
}>()

const modelValue = defineModel<string>()

const categories = ['video', 'audio', 'image', 'format-conversion'] as const

const categoryIcons = {
  'start': Star,
  'video': Video,
  'audio': Music,
  'image': Image,
  'format-conversion': ArrowRight,
}

const starPresets = ref<FFmpegPreset[]>([])
const showStarPresets = ref(false)
const query = ref('')

const options = computed(() => {
  return props.presets.filter((preset) => {
    return preset.name.includes(query.value)
  }).map((preset) => {
    return {
      label: preset.name,
      value: preset.id,
    }
  })
})

const categorizedPresets = computed(() => {
  const result: Record<string, FFmpegPreset[]> = {}
  categories.forEach((category) => {
    result[category] = props.presets.filter(preset => preset.category.includes(category))
  })
  return result
})
</script>

<template>
  <NCard size="small">
    <template #header>
      <div class="flex gap-2">
        <NAutoComplete
          v-model:value="query"
          class="w-50"
          placeholder="搜索预设"
          :options="options"
          :filterable="true"
        />
      </div>
    </template>
    <Transition mode="default" name="slide">
      <NList v-if="showStarPresets" hoverable clickable size="small">
        <NListItem v-for="preset in starPresets" :key="preset.id" @click="modelValue = preset.id">
          <NThing>
            <template #header>
              <span style="font-size: small;">{{ preset.name }}</span>
            </template>
          </NThing>
        </NListItem>
      </NList>
      <NTabs v-else placement="left" type="card">
        <NTabPane v-for="category in categories" :key="category" :name="category">
          <template #tab>
            <NIcon>
              <component :is="categoryIcons[category]" />
            </NIcon>
          </template>
          <NScrollbar class="max-h-80vh">
            <NList hoverable clickable size="small">
              <NListItem v-for="preset in categorizedPresets[category]" :key="preset.id" @click="modelValue = preset.id">
                <NThing>
                  <template #header>
                    <span style="font-size: small;">{{ preset.name }}</span>
                  </template>
                  <template #header-extra>
                    <Star />
                  </template>
                </NThing>
              </NListItem>
            </NList>
          </NScrollbar>
        </NTabPane>
      </NTabs>
    </Transition>
    <template #header-extra>
      <i-carbon-template />
    </template>
  </NCard>
</template>

<style scoped lang="scss">
.n-icon {
  font-size: 16px;
  vertical-align: middle;
}
</style>
