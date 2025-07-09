export const ffmpegPresetVersion = 1

export interface FFmpegParameter {
  /** 参数类型：数字/字符串/布尔值/下拉选择/多选/文件/时间/滑块/颜色/目录 */
  type: 'number' | 'string' | 'boolean' | 'select' | 'multiselect' | 'file' | 'time' | 'slider' | 'color' | 'directory'
  /** 参数显示名称 */
  label: string
  /** 参数默认值 */
  default: any
  /** 下拉选项列表（仅type为select/multiselect时有效） */
  options?: Array<{ label: string, value: any }>
  /** 最小值（仅type为number/slider时有效） */
  min?: number
  /** 最大值（仅type为number/slider时有效） */
  max?: number
  /** 步长（仅type为number/slider时有效） */
  step?: number
  /** 单位（仅type为number时有效） */
  unit?: string
  /** 文件接受类型（仅type为file时有效） */
  accept?: string
  /** 输入框占位文本 */
  placeholder?: string
  /** 参数描述说明 */
  description?: string
  /** 滑块刻度标记（仅type为slider时有效） */
  marks?: Record<number, string>
}

export interface FFmpegPreset {
  id: string
  name: string
  template: string[]
  parameters: {
    [key: string]: FFmpegParameter
  }[]
}

export function replaceFFmpegTemplate(template: string[], parameters: Array<{ [key: string]: any }>): string[] {
  const result = [...template]
  parameters.forEach((paramObj) => {
    if (Object.keys(paramObj).length === 0)
      return
    const paramKeys = Object.keys(paramObj)
    paramKeys.forEach((key) => {
      const placeholder = `{${key}}`
      const value = paramObj[key].default ?? paramObj[key].value ?? ''
      const templateIndex = result.findIndex(str => str.includes(placeholder))
      if (templateIndex !== -1) {
        result[templateIndex] = result[templateIndex].replace(placeholder, value.toString())
      }
    })
  })
  return result
}

export const ffmpegPreset: FFmpegPreset[] = [
  {
    id: 'crop',
    name: '视频裁切',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '-filter:v',
      'crop={width}:{height}:{x}:{y}',
      '-c:a',
      'copy',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入视频', default: 'input.mp4', accept: 'video/*', description: '选择需要裁切的视频文件' } },
      {},
      {
        width: { type: 'number', label: '裁切宽度', default: 1280, min: 1, max: 7680, unit: 'px', description: '裁切区域的宽度' },
        height: { type: 'number', label: '裁切高度', default: 720, min: 1, max: 4320, unit: 'px', description: '裁切区域的高度' },
        x: { type: 'number', label: 'X坐标', default: 0, min: 0, unit: 'px', description: '裁切区域左上角的X坐标' },
        y: { type: 'number', label: 'Y坐标', default: 0, min: 0, unit: 'px', description: '裁切区域左上角的Y坐标' },
      },
      {},
      {},
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: { type: 'string', label: '输出文件名', default: 'cropped.mp4', description: '裁切后视频的文件名' },
      },
    ],
  },
  {
    id: 'extract',
    name: '提取音频',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '-vn',
      '-acodec',
      '{codec}',
      '{bitrate_flag}',
      '{bitrate_value}',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入文件', default: 'input.mp4', accept: 'video/*,audio/*', description: '选择包含音频的视频或音频文件' } },
      {},
      {},
      {
        codec: {
          type: 'select',
          label: '音频格式',
          default: 'mp3',
          options: [
            { label: 'MP3 - 通用格式', value: 'mp3' },
            { label: 'AAC - 高效编码', value: 'aac' },
            { label: 'WAV - 无损格式', value: 'pcm_s16le' },
            { label: 'FLAC - 无损压缩', value: 'flac' },
            { label: 'OGG - 开源格式', value: 'libvorbis' },
          ],
          description: '选择输出的音频编码格式',
        },
      },
      { bitrate_flag: { type: 'string', label: '比特率标志', default: '-b:a' } },
      {
        bitrate_value: {
          type: 'select',
          label: '音频比特率',
          default: '192k',
          options: [
            { label: '96k - 低质量', value: '96k' },
            { label: '128k - 标准质量', value: '128k' },
            { label: '192k - 高质量', value: '192k' },
            { label: '256k - 极高质量', value: '256k' },
            { label: '320k - 最高质量', value: '320k' },
          ],
          description: '选择音频的比特率，影响音质和文件大小',
        },
      },
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: { type: 'string', label: '输出文件名', default: 'audio.mp3', description: '提取后音频的文件名' },
      },
    ],
  },
  {
    id: 'compress',
    name: '视频压缩',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '-c:v',
      'libx264',
      '-crf',
      '{crf}',
      '-preset',
      '{preset}',
      '-c:a',
      'aac',
      '-b:a',
      '{audio_bitrate}',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入视频', default: 'input.mp4', accept: 'video/*', description: '选择需要压缩的视频文件' } },
      {},
      {},
      {},
      {
        crf: {
          type: 'slider',
          label: '视频质量 (CRF)',
          default: 23,
          min: 0,
          max: 51,
          step: 1,
          marks: { 0: '无损', 18: '极高', 23: '高', 28: '中', 35: '低', 51: '极低' },
          description: 'CRF值越小，画质越好，文件越大',
        },
      },
      {},
      {
        preset: {
          type: 'select',
          label: '编码速度',
          default: 'medium',
          options: [
            { label: '极快 - ultrafast', value: 'ultrafast' },
            { label: '超快 - superfast', value: 'superfast' },
            { label: '很快 - veryfast', value: 'veryfast' },
            { label: '快速 - faster', value: 'faster' },
            { label: '快 - fast', value: 'fast' },
            { label: '中等 - medium', value: 'medium' },
            { label: '慢 - slow', value: 'slow' },
            { label: '很慢 - slower', value: 'slower' },
            { label: '极慢 - veryslow', value: 'veryslow' },
          ],
          description: '编码速度越慢，压缩效率越高，耗时越长',
        },
      },
      {},
      {},
      {},
      {
        audio_bitrate: {
          type: 'select',
          label: '音频比特率',
          default: '128k',
          options: [
            { label: '64k - 低质量', value: '64k' },
            { label: '96k - 标准', value: '96k' },
            { label: '128k - 高质量', value: '128k' },
            { label: '192k - 极高', value: '192k' },
            { label: '256k - 最高', value: '256k' },
          ],
          description: '选择音频的比特率，影响音质',
        },
      },
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: { type: 'string', label: '输出文件名', default: 'compressed.mp4', description: '压缩后视频的文件名' },
      },
    ],
  },
  {
    id: 'cut',
    name: '视频剪切',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '-ss',
      '{start}',
      '-t',
      '{duration}',
      '-c',
      'copy',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入视频', default: 'input.mp4', accept: 'video/*,audio/*', description: '选择需要剪切的视频或音频文件' } },
      {},
      { start: { type: 'time', label: '开始时间', default: '00:00:00', placeholder: 'HH:MM:SS', description: '剪切的起始时间点' } },
      {},
      { duration: { type: 'time', label: '持续时长', default: '00:00:30', placeholder: 'HH:MM:SS', description: '剪切的持续时间' } },
      {},
      {},
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: { type: 'string', label: '输出文件名', default: 'cut.mp4', description: '剪切后文件的文件名' },
      },
    ],
  },
  {
    id: 'watermark',
    name: '添加水印',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '-i',
      '{watermark}',
      '-filter_complex',
      'overlay={x}:{y}',
      '-c:a',
      'copy',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入视频', default: 'input.mp4', accept: 'video/*', description: '选择需要添加水印的视频文件' } },
      {},
      { watermark: { type: 'file', label: '水印图片', default: 'watermark.png', accept: 'image/*', description: '支持PNG、JPG格式，建议使用透明背景PNG' } },
      {},
      {
        x: { type: 'number', label: '水印X位置', default: 10, min: 0, unit: 'px', description: '水印左上角的水平位置' },
        y: { type: 'number', label: '水印Y位置', default: 10, min: 0, unit: 'px', description: '水印左上角的垂直位置' },
      },
      {},
      {},
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: { type: 'string', label: '输出文件名', default: 'watermarked.mp4', description: '添加水印后视频的文件名' },
      },
    ],
  },
  {
    id: 'convert-video',
    name: '视频格式转换',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '-c:v',
      '{video_codec}',
      '-c:a',
      '{audio_codec}',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入视频', default: 'input.mp4', accept: 'video/*', description: '选择需要转换格式的视频文件' } },
      {},
      {
        video_codec: {
          type: 'select',
          label: '视频编码',
          default: 'libx264',
          options: [
            { label: 'H.264 - 广泛兼容', value: 'libx264' },
            { label: 'H.265/HEVC - 高压缩率', value: 'libx265' },
            { label: 'VP9 - 开源格式', value: 'libvpx-vp9' },
            { label: 'AV1 - 新一代编码', value: 'libaom-av1' },
          ],
          description: '选择输出的视频编码格式',
        },
      },
      {},
      {
        audio_codec: {
          type: 'select',
          label: '音频编码',
          default: 'aac',
          options: [
            { label: 'AAC - 高效编码', value: 'aac' },
            { label: 'MP3 - 通用格式', value: 'mp3' },
            { label: 'AC3 - 家庭影院', value: 'ac3' },
            { label: 'FLAC - 无损格式', value: 'flac' },
          ],
          description: '选择输出的音频编码格式',
        },
      },
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: { type: 'string', label: '输出文件名', default: 'converted.mp4', description: '转换后视频的文件名' },
      },
    ],
  },
  {
    id: 'convert-audio',
    name: '音频格式转换',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '-c:a',
      '{codec}',
      '-b:a',
      '{bitrate}',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入音频', default: 'input.mp3', accept: 'audio/*', description: '选择需要转换格式的音频文件' } },
      {},
      {
        codec: {
          type: 'select',
          label: '音频编码',
          default: 'mp3',
          options: [
            { label: 'MP3 - 通用格式', value: 'mp3' },
            { label: 'AAC - 高效编码', value: 'aac' },
            { label: 'WAV - 无损格式', value: 'pcm_s16le' },
            { label: 'FLAC - 无损压缩', value: 'flac' },
            { label: 'OGG - 开源格式', value: 'libvorbis' },
          ],
          description: '选择输出的音频编码格式',
        },
      },
      {},
      {
        bitrate: {
          type: 'select',
          label: '音频比特率',
          default: '192k',
          options: [
            { label: '96k - 低质量', value: '96k' },
            { label: '128k - 标准质量', value: '128k' },
            { label: '192k - 高质量', value: '192k' },
            { label: '256k - 极高质量', value: '256k' },
            { label: '320k - 最高质量', value: '320k' },
          ],
          description: '选择音频的比特率，影响音质和文件空间大小',
        },
      },
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: { type: 'string', label: '输出文件名', default: 'converted.mp3', description: '转换后音频的文件名' },
      },
    ],
  },
  {
    id: 'convert-image',
    name: '图片格式转换',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入图片', default: 'input.png', accept: 'image/*', description: '选择需要转换格式的图片文件' } },
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: {
          type: 'string',
          label: '输出文件名',
          default: 'converted.jpg',
          description: '转换后图片的文件名（建议包含目标格式后缀，如 .jpg, .png, .webp）',
        },
      },
    ],
  },
  {
    id: 'video-to-gif',
    name: '视频转GIF',
    template: [
      'ffmpeg',
      '-i',
      '{input}',
      '-vf',
      'fps={fps},scale={width}:{height}:flags=lanczos',
      '-loop',
      '{loop}',
      '{output_dir}/{output}',
    ],
    parameters: [
      {},
      {},
      { input: { type: 'file', label: '输入视频', default: 'input.mp4', accept: 'video/*', description: '选择需要转换为GIF的视频文件' } },
      {},
      {
        fps: {
          type: 'number',
          label: '帧率',
          default: 15,
          min: 1,
          max: 60,
          step: 1,
          unit: 'fps',
          description: 'GIF的帧率，影响流畅度和文件大小',
        },
        width: {
          type: 'number',
          label: '宽度',
          default: 640,
          min: 1,
          max: 1920,
          unit: 'px',
          description: 'GIF的宽度，保持比例建议只设置一个维度',
        },
        height: {
          type: 'number',
          label: '高度',
          default: -1,
          min: -1,
          max: 1080,
          unit: 'px',
          description: 'GIF的高度，设为-1保持原始比例',
        },
      },
      {},
      {
        loop: {
          type: 'select',
          label: '循环设置',
          default: '0',
          options: [
            { label: '无限循环', value: '0' },
            { label: '不循环', value: '-1' },
          ],
          description: '选择GIF是否无限循环播放',
        },
      },
      {
        output_dir: { type: 'directory', label: '输出目录', default: '', description: '选择输出文件的保存路径' },
        output: { type: 'string', label: '输出文件名', default: 'output.gif', description: '转换后GIF的文件名' },
      },
    ],
  },
]
