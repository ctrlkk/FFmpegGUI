package app

import (
	"context"
	"os/exec"
)

type App struct {
	ctx context.Context
	cmd *exec.Cmd
}

func NewApp() *App {
	return &App{}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}
