package main

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
	"sync"

	"github.com/rs/zerolog/log"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
	// 正在执行的cmd实例
	cmd *exec.Cmd
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// 选择目录对话框
func (a *App) OpenDirectoryDialog(title string) (string, error) {
	dir, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: title,
	})
	if err != nil {
		return "", err
	}
	if dir == "" {
		return "", fmt.Errorf("no directory selected")
	}
	return dir, nil
}

// 选择文件
func (a *App) OpenFileDialog(title string, accept string) (string, error) {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: title,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "选择文件",
				Pattern:     strings.Join(acceptToPatterns(accept), ";"),
			},
		},
	})
	if err != nil {
		return "", err
	}
	if file == "" {
		return "", fmt.Errorf("no file selected")
	}
	return file, nil
}

// acceptToPatterns 将前端的accept格式（如 "video/*"）转换为wails需要的文件扩展名模式
func acceptToPatterns(accept string) []string {
	switch accept {
	case "video/*":
		return []string{"*.mp4", "*.avi", "*.mkv", "*.mov", "*.flv", "*.wmv"}
	case "audio/*":
		return []string{"*.mp3", "*.wav", "*.aac", "*.flac"}
	default:
		return []string{"*"}
	}
}

func (a *App) ExecuteCommand(arg []string) {
	cmd := exec.Command(arg[0], arg[1:]...)
	a.cmd = cmd
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return
	}
	var wg sync.WaitGroup
	wg.Add(2)

	defer wg.Wait()
	defer stdout.Close()
	defer stderr.Close()

	// 读取 stdout
	go func() {
		defer wg.Done()
		buf := make([]byte, 1024)
		for {
			n, err := stdout.Read(buf)
			if n > 0 {
				output := string(buf[:n])
				log.Debug().Str("通道", "stdout").Msg(output)
				runtime.EventsEmit(a.ctx, "commandOutput", output)
			}
			if err != nil {
				if err.Error() != "EOF" {
					log.Err(err).Msg("读取stdout失败")
					runtime.EventsEmit(a.ctx, "commandOutput", err.Error())
					break
				}
			}
		}
	}()

	// 读取 stderr
	go func() {
		defer wg.Done()
		buf := make([]byte, 1024)
		for {
			n, err := stderr.Read(buf)
			if n > 0 {
				output := string(buf[:n])
				log.Debug().Str("通道", "stderr").Msg(output)
				runtime.EventsEmit(a.ctx, "commandOutput", output)
			}
			if err != nil {
				if err.Error() != "EOF" {
					log.Err(err).Msg("读取stderr失败")
					runtime.EventsEmit(a.ctx, "commandOutput", err.Error())
					break
				}
			}
		}
	}()

	if err := cmd.Start(); err != nil {
		runtime.EventsEmit(a.ctx, "commandOutput", err.Error())
		return
	}

	if err := cmd.Wait(); err != nil {
		log.Err(err).Msg("等待命令完成失败")
		runtime.EventsEmit(a.ctx, "commandOutput", err.Error())
	}
}

func (a *App) StopCommand() {
	if a.cmd != nil && a.cmd.Process != nil {
		err := a.cmd.Process.Kill()
		if err != nil {
			fmt.Println("停止命令失败:", err)
		} else {
			runtime.EventsEmit(a.ctx, "commandOutput", "命令已停止")
		}
	}
}
