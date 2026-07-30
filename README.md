# rent 前端项目

## 一键联调启动

确保目录结构如下（前后端同级）：

- `/Users/bytedance/Desktop/codex/rent`
- `/Users/bytedance/Desktop/codex/rent-server`

在前端目录执行：

```bash
npm run dev:all
```

说明：

- 会自动启动后端：`go run main.go`（在 `rent-server`）
- 会自动启动前端：`npm run dev`（在 `rent`）
- 控制台按 `Ctrl + C` 可同时停止前后端

## 单独启动

### 前端

```bash
npm run dev
```

### 后端

```bash
cd ../rent-server
go run main.go
```
