# 乡村探索 - 项目状态文档

## 项目信息

**项目路径**: `E:\Desk\Library\projects\village-exploration`
**项目名称**: 乡村探索（乡村振兴主题横版探索游戏）
**类型**: 微信小程序

---

## 项目结构

```
village-exploration/
├── app.json              # 应用配置（横屏模式）
├── app.js                # 应用入口
├── app.wxss              # 全局样式
├── project.private.config.json  # MCP连接配置
│
├── pages/
│   ├── home/             # 首页（游戏入口）
│   │   ├── home.wxml
│   │   ├── home.js
│   │   └── home.wxss
│   │
│   ├── index/            # 游戏地图页面
│   │   ├── index.wxml
│   │   ├── index.js      # 核心游戏逻辑
│   │   └── index.wxss
│   │
│   └── minigame/
│       ├── memory/       # 记忆游戏
│       │   ├── memory.wxml
│       │   ├── memory.js
│       │   ├── memory.wxss
│       │   └── memory.json
│       │
│       └── catch/        # 接物游戏
│           ├── catch.wxml
│           ├── catch.js
│           ├── catch.wxss
│           └── catch.json
│
├── data/
│   └── npcs.js           # NPC配置（位置、对话、任务）
│
├── utils/
│   ├── gameData.js       # 游戏数据管理（存储、任务状态）
│   └── storage.js        # 本地存储封装
│
└── components/
    ├── dialog-box/       # 对话框组件
    └── qr-popup/         # 二维码奖励弹窗组件
```

---

## 当前功能状态

### 已完成
- [x] 横屏游戏地图 (800x400)
- [x] 玩家点击移动
- [x] 5个NPC配置（村长、阿明、麻饼、绣娘、白瓷）
- [x] 麦堆收集小麦
- [x] 麻饼任务 → 优惠券奖励
- [x] 记忆游戏（绣娘）
- [x] 接物游戏（白瓷）
- [x] 存储持久化
- [x] 首页入口页面

### 待开发
- [ ] 美化（图片素材替换emoji）
- [ ] 空气墙/障碍物碰撞
- [ ] 走路序列帧动画

---

## MCP连接配置

### 连接参数
```javascript
{
  "mode": "connect",
  "projectPath": "E:\\Desk\\Library\\projects\\village-exploration",
  "wsEndpoint": "ws://127.0.0.1:9420"
}
```

### 连接步骤
1. 启动微信开发者工具，打开 `village-exploration` 项目
2. 确保工具监听端口（工具 → 设置 → 安全设置 → 开启服务端口）
3. 使用 MCP 工具连接：
   - `mp_ensureConnection` - 检查连接状态
   - `mp_navigate` - 页面导航
   - `page_callMethod` - 调用页面方法
   - `page_getData` / `page_setData` - 获取/设置页面数据
   - `mp_screenshot` - 截图
   - `mp_getLogs` - 获取控制台日志

### 常用调试命令
```javascript
// 重置游戏数据（清除存储）
wx.clearStorage()

// 移动玩家到指定位置
page.callMethod('moveTo', [x, y])

// 查看玩家位置
page.getData('player')

// 查看任务状态
page.getData('tasks')

// 查看背包
page.getData('inventory')
```

---

## 任务数据

任务状态保存在 `wx.getStorageSync('gameData')` 中：
```javascript
{
  player: { x, y, direction, speed },
  inventory: [{ id, name, icon }],
  tasks: {
    wheatCollected: false,     // 是否收集小麦
    maBingComplete: false,     // 麻饼任务完成
    xiuNiangComplete: false,  // 记忆游戏完成
    baiCiComplete: false       // 接物游戏完成
  }
}
```

---

## 横屏配置

app.json 中配置：
```json
{
  "window": {
    "orientation": "landscape"
  }
}
```

地图尺寸：800x400（横屏）
边界：minX:50, maxX:750, minY:50, maxY:350

---

## 最近修改记录

### 2026-03-26
1. 修复接物游戏 `requestAnimationFrame` 错误 → 改用 `setTimeout`
2. 修复主页面 `requestAnimationFrame` 错误
3. 新增首页 `pages/home/home`
4. 修复对话框 `npcName` 警告
5. 装饰物位置调整为横屏范围
