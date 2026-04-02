# 匠心行 - 微信小程序

## 项目信息
- **Path**: `E:\Desk\Library\projects\village-exploration`
- **AppID**: wxb5abdec2d107a2a1
- **Repo**: https://github.com/whitefish666/village-exploration.git
- **CDN**: https://village-game-assets-1418646126.cos.ap-shanghai.myqcloud.com

## MCP连接 (WeChat DevTools)
调试小程序前必须先连接开发者工具：

### 快速连接
```bash
# 1. 启动开发者工具并打开项目
/e/software/微信web开发者工具/cli.bat auto --project "e:/Desk/Library/projects/village-exploration" --auto-port 9420

# 2. 确认端口监听
netstat -ano | grep 9420
```

### MCP工具调用
连接参数：
```json
{
  "connection": {
    "mode": "connect",
    "projectPath": "E:\\Desk\\Library\\projects\\village-exploration",
    "wsEndpoint": "ws://127.0.0.1:9420"
  }
}
```

常用工具：`mp_navigate`, `mp_screenshot`, `page_getElement`, `element_tap`

## 资源CDN
- 游戏资源已迁移至腾讯云COS CDN
- 本地保留：`/assets/player.png`, `/assets/qr/*.png`
- 配置域名：`mp.weixin.qq.com → 开发管理 → 开发设置 → downloadFile合法域名`

## 游戏分包
- `pages/minigame/memory/` - 记忆游戏
- `pages/minigame/wheat/` - 麦田小游戏
- `pages/minigame/clay/` - 粘土小游戏
- `pages/music/` - 音乐播放器
- `pages/village-info/` - 村庄介绍
