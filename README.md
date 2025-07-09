# FFmpegGUI

可视化，参数化的生成ffmpeg命令并执行

![alt text](./docs/dark.png)
![alt text](./docs/light.png)

# 构建

## 环境要求

- go 版本要求 >= 1.24.3
- node 版本要求 >= 20

```bash
npm install -g pnpm
go install github.com/wailsapp/wails/v2/cmd/wails@latest

wails build

# ubuntu中可能需要使用
# https://github.com/wailsapp/wails/issues/4382
wails build -tags webkit2_41
```
