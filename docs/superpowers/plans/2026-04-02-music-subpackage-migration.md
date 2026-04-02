# 音乐分包迁移方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 732KB 音乐资源从主包迁移到独立分包，减小主包体积，所有原有功能保持不变。

**Architecture:** 创建独立音乐分包 `pages/music/` 存放音乐资源，修改 audioManager 支持动态加载，app.js 启动时静默加载分包后播放BGM，按钮音效沿用现有机制。

**Tech Stack:** 微信小程序分包机制 wx.loadSubpackage()

---

## 文件结构变更

```
变更前：
├── assets/music/bgm.mp3      (695KB) → 移到主包外
├── assets/music/button.mp3   (52KB)  → 移到主包外
└── app.js                    (直接引用)

变更后：
├── pages/music/assets/music/bgm.mp3    (独立分包)
├── pages/music/assets/music/button.mp3 (独立分包)
├── utils/audioManager.js    (修改：支持动态路径)
└── app.js                   (修改：预加载音乐分包)
```

---

## 资源迁移分析

| 资源 | 原路径 | 新路径 | 大小 |
|------|--------|--------|------|
| bgm.mp3 | /assets/music/bgm.mp3 | /pages/music/assets/music/bgm.mp3 | 695KB |
| button.mp3 | /assets/music/button.mp3 | /pages/music/assets/music/button.mp3 | 52KB |

**主包减少：732KB**

---

## 关键风险点

### 风险1：主包启动时音乐文件不存在

**问题：** app.js 在 onLaunch() 时立即调用 audioManager.init() + playBgm()，但音乐在分包中，文件路径无效。

**解决方案：** app.js 启动时不播放BGM，改为延迟到首次用户交互时播放（index.js onShow 时触发）。或者 app.js 启动时静默预加载分包后再初始化 audioManager。

**推荐方案：** app.js 启动时预加载音乐分包，加载完成后初始化 audioManager。

### 风险2：按钮音效在分包页面无法播放

**问题：** clay.js 和 memory.js 在分包中，它们调用 audioManager.playButton() 时，audioManager 初始化时设置的 src 还是旧路径。

**解决方案：** audioManager.init() 不再硬编码 src，改为在 playBgm() 和 playButton() 时动态设置 src。或者保持 src 不变（主包路径），在分包加载完成后重新 init()。

**推荐方案：** audioManager 保持主包路径配置（不影响主包页面），分包页面通过 wx.loadSubpackage() 预加载后自然可以访问主包路径。**实际上分包可以访问主包资源，所以按钮音效不需要改！**

### 风险3：主包无法访问分包的路径

**问题：** /pages/music/assets/music/bgm.mp3 是分包路径，只有在分包加载后主包才能访问。

**解决方案：** BGM 在用户进入主页后播放，此时主包已加载，不需要分包。分包只在小游戏中使用，但小游戏可以访问主包资源。所以只需要确保 BGM 路径在主页可用即可。

**结论：** 主包保留按钮音效（52KB），只迁移 BGM（695KB）到分包。主包启动时不播放 BGM，改为主页加载后播放。

---

## Task 1: 创建音乐分包目录结构

**Files:**
- Create: `pages/music/music.json` (分包配置)
- Create: `pages/music/music.js` (空的启动文件)
- Create: `pages/music/assets/music/` (音乐资源目录)

**Note:** 分包不需要 wxml/wxss，只需要一个空 js 文件让分包含入。

```bash
mkdir -p "E:/Desk/Library/projects/village-exploration/pages/music/assets/music"
```

- [ ] **Step 1: 创建音乐分包目录**

```bash
mkdir -p "E:/Desk/Library/projects/village-exploration/pages/music/assets/music"
```

- [ ] **Step 2: 移动 bgm.mp3 到分包**

```bash
mv "E:/Desk/Library/projects/village-exploration/assets/music/bgm.mp3" "E:/Desk/Library/projects/village-exploration/pages/music/assets/music/bgm.mp3"
```

- [ ] **Step 3: 创建 music.js 空文件**

```javascript
// 音乐分包入口文件
// 此文件作为分包的启动点，确保分包被正确加载
```

- [ ] **Step 4: 创建 music.json 配置**

```json
{
  "package": "music"
}
```

- [ ] **Step 5: 提交变更**

```bash
git add pages/music/ assets/music/
git commit -m "feat: 创建音乐分包目录结构"
```

---

## Task 2: 修改 app.json 添加音乐分包配置

**Files:**
- Modify: `app.json` (添加 subpackages 配置)

**Warning:** minigame 分包已存在，需要合并配置，不能覆盖。

```json
{
  "pages": [...],
  "subpackages": [
    {
      "root": "pages/minigame",
      "name": "minigame",
      "pages": [...]
    },
    {
      "root": "pages/music",
      "name": "music",
      "pages": [
        "music"
      ]
    }
  ],
  ...
}
```

- [ ] **Step 1: 修改 app.json 添加音乐分包**

**当前 app.json:**
```json
{
  "pages": [
    "pages/home/home",
    "pages/index/index",
    "pages/village-info/village-info"
  ],
  "subpackages": [
    {
      "root": "pages/minigame",
      "name": "minigame",
      "pages": [
        "memory/memory",
        "catch/catch",
        "wheat/wheat",
        "clay/clay"
      ]
    }
  ],
  ...
}
```

**修改为:**
```json
{
  "pages": [
    "pages/home/home",
    "pages/index/index",
    "pages/village-info/village-info"
  ],
  "subpackages": [
    {
      "root": "pages/minigame",
      "name": "minigame",
      "pages": [
        "memory/memory",
        "catch/catch",
        "wheat/wheat",
        "clay/clay"
      ]
    },
    {
      "root": "pages/music",
      "name": "music",
      "pages": [
        "music"
      ]
    }
  ],
  ...
}
```

- [ ] **Step 2: 提交变更**

```bash
git add app.json
git commit -m "feat: 添加音乐分包配置到 app.json"
```

---

## Task 3: 修改 audioManager 支持动态路径

**Files:**
- Modify: `utils/audioManager.js`

**关键设计：**
- 音乐分包加载前：audioManager 使用主包路径 `/assets/music/bgm.mp3`（文件不存在，静默失败）
- 音乐分包加载后：audioManager 使用分包路径 `/pages/music/assets/music/bgm.mp3`
- 按钮音效保留在主包路径：`/assets/music/button.mp3`

```javascript
// 音频管理器
const audioManager = {
  bgmAudio: null,
  buttonAudio: null,
  isBgmPlaying: false,
  bgmPackageLoaded: false,
  bgmSrc: '/assets/music/bgm.mp3',  // 默认主包路径（文件已移走）
  buttonSrc: '/assets/music/button.mp3',

  // 预加载音乐分包
  async preloadMusicPackage() {
    if (this.bgmPackageLoaded) return

    try {
      const packageInfo = wx.loadSubpackage({
        name: 'music',
        success: () => {
          console.log('音乐分包加载成功')
          this.bgmPackageLoaded = true
          this.bgmSrc = '/pages/music/assets/music/bgm.mp3'
          // 分包加载完成后，重新初始化 BGM
          this.initBgm()
        },
        fail: (err) => {
          console.error('音乐分包加载失败:', err)
        }
      })
    } catch (e) {
      console.error('预加载音乐分包异常:', e)
    }
  },

  // 初始化背景音乐
  initBgm() {
    if (!this.bgmAudio) {
      this.bgmAudio = wx.createInnerAudioContext()
    }
    this.bgmAudio.src = this.bgmSrc
    this.bgmAudio.loop = true
    this.bgmAudio.volume = 0.5
  },

  // 初始化音频（按钮音效保留在主包）
  init() {
    // 创建按钮音效实例（主包资源，一直可用）
    this.buttonAudio = wx.createInnerAudioContext()
    this.buttonAudio.src = this.buttonSrc
    this.buttonAudio.volume = 0.8

    this.buttonAudio.onError((err) => {
      console.error('按钮音效错误:', err)
    })

    // 背景音乐初始化延迟到分包加载完成后
    // 不要在这里创建 bgmAudio，等 preloadMusicPackage 完成后再 initBgm()
  },

  // 播放背景音乐
  playBgm() {
    // 如果还没预加载，先预加载
    if (!this.bgmPackageLoaded) {
      this.preloadMusicPackage().then(() => {
        if (!this.isBgmPlaying) {
          if (!this.bgmAudio) this.initBgm()
          this.bgmAudio.play()
          this.isBgmPlaying = true
        }
      })
      return
    }

    if (!this.bgmAudio) {
      this.initBgm()
    }
    if (!this.isBgmPlaying) {
      this.bgmAudio.play()
      this.isBgmPlaying = true
    }
  },

  // 暂停背景音乐
  pauseBgm() {
    if (this.bgmAudio && this.isBgmPlaying) {
      this.bgmAudio.pause()
      this.isBgmPlaying = false
    }
  },

  // 停止背景音乐
  stopBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.stop()
      this.isBgmPlaying = false
    }
  },

  // 播放按钮音效
  playButton() {
    if (!this.buttonAudio) {
      this.init()
    }
    this.buttonAudio.stop()
    this.buttonAudio.play()
  }
}

module.exports = audioManager
```

**关键变更说明：**
1. `bgmSrc` 初始值为主包路径（文件已移走，会静默失败）
2. `preloadMusicPackage()` 调用 `wx.loadSubpackage()` 加载分包
3. 分包加载成功后 `bgmSrc` 切换到分包路径
4. `playBgm()` 调用时如果未加载则先加载再播放

- [ ] **Step 1: 备份并修改 audioManager.js**

将上述新代码完整替换 `utils/audioManager.js`

- [ ] **Step 2: 提交变更**

```bash
git add utils/audioManager.js
git commit -m "feat: audioManager 支持动态加载音乐分包"
```

---

## Task 4: 修改 app.js 适配新的初始化逻辑

**Files:**
- Modify: `app.js`

**变更说明：** app.js 原来在 onLaunch 时直接调用 init() + playBgm()，现在需要确保 audioManager 正确初始化但延迟 BGM 播放。

```javascript
App({
  onLaunch() {
    // 初始化游戏数据
    const savedData = wx.getStorageSync('villageGameData') || {}
    this.globalData = {
      player: {
        x: 400,
        y: 300,
        direction: 'down',
        speed: 3
      },
      inventory: savedData.inventory || [],
      tasks: savedData.tasks || {
        wheatCollected: false,
        maBingComplete: false,
        xiuNiangComplete: false,
        baiCiComplete: false
      }
    }

    // 初始化音频管理器（不播放BGM）
    const audioManager = require('./utils/audioManager.js')
    audioManager.init()
    // BGM 延迟到主页加载后播放（由 index.js onShow 触发）
  },

  saveData() {
    wx.setStorageSync('villageGameData', {
      inventory: this.globalData.inventory,
      tasks: this.globalData.tasks
    })
  }
})
```

**变更点：**
- 移除 `audioManager.playBgm()` 调用
- BGM 播放由 index.js 的 onShow 事件触发

- [ ] **Step 1: 修改 app.js 移除 playBgm() 调用**

修改 `app.js` 第21-24行：
```javascript
    // 初始化音频管理器（不播放BGM，等主页加载后播放）
    const audioManager = require('./utils/audioManager.js')
    audioManager.init()
```

- [ ] **Step 2: 提交变更**

```bash
git add app.js
git commit -m "feat: app.js 延迟BGM播放由主页触发"
```

---

## Task 5: 修改 index.js 在 onShow 时播放 BGM

**Files:**
- Modify: `pages/index/index.js`

**变更说明：** 主页面显示时触发 BGM 播放，确保用户进入游戏时能听到背景音乐。

```javascript
// 在 onShow 函数中添加 playBgm() 调用
onShow() {
  // 重新加载数据（可能从小游戏返回）
  const savedData = gameData.getGameData()
  this.setData({
    player: savedData.player || this.data.player,
    inventory: savedData.inventory || [],
    tasks: savedData.tasks || this.data.tasks,
    wheatCollected: savedData.tasks.wheatCollected || false,
    joystickVisible: true,
    playerImage: '/assets/player.png'
  })
  // 检查NPC接近状态（确保交互键状态正确）
  this.checkNpcProximity()
  // 重新启动游戏循环
  this.startGameLoop()
  // 播放背景音乐（主页显示时触发）
  audioManager.playBgm()
},
```

- [ ] **Step 1: 在 index.js onShow 中添加 playBgm()**

在 `pages/index/index.js` 第164行（onShow 函数末尾）添加：
```javascript
  // 播放背景音乐
  audioManager.playBgm()
```

- [ ] **Step 2: 提交变更**

```bash
git add pages/index/index.js
git commit -m "feat: index.js onShow 时播放BGM"
```

---

## Task 6: 验证所有功能

**验证清单：**

| 功能 | 验证方法 | 预期结果 |
|------|---------|---------|
| 主包启动 | 打开小程序 | 无报错，BGM 不播放 |
| 主页BGM | 进入主页（index） | BGM 开始播放 |
| 按钮音效 | 点击任意按钮 | 按钮音效正常播放 |
| 小游戏音乐 | 进入 wheat/clay/memory | 背景音乐继续播放 |
| 从小游戏返回 | 返回主页 | BGM 继续播放 |
| 分包资源 | 加载 wheat/clay 图片 | 图片正常显示 |

**测试步骤：**

1. [ ] 清空小程序缓存，重新编译
2. [ ] 打开小程序，观察无报错
3. [ ] 进入主页（index），确认 BGM 播放
4. [ ] 点击任意按钮，确认按钮音效
5. [ ] 进入麦田游戏，确认游戏正常
6. [ ] 返回主页，确认 BGM 继续播放
7. [ ] 进入粘土游戏，确认按钮音效正常
8. [ ] 检查主包大小是否减少约 695KB

---

## 风险回顾

| 风险 | 解决方案 | 状态 |
|------|---------|------|
| 主包启动时音乐文件不存在 | BGM 播放延迟到主页 onShow | ✅ 已解决 |
| 按钮音效在分包无法播放 | 按钮音效保留在主包 | ✅ 已解决 |
| 分包加载失败 | audioManager 静默处理 fail | ✅ 已解决 |

---

## 回滚方案

如果迁移失败，执行以下步骤回滚：

```bash
# 1. 移动音乐文件回主包
mv "pages/music/assets/music/bgm.mp3" "assets/music/bgm.mp3"

# 2. 还原 app.json（移除 music 分包配置）

# 3. 还原 app.js（恢复 playBgm() 调用）

# 4. 还原 audioManager.js（恢复硬编码路径）

# 5. 还原 index.js（移除 playBgm() 调用）

# 6. 删除音乐分包目录
rm -rf pages/music/
```

---

## 计划完成

**Plan complete and saved to `docs/superpowers/plans/2026-04-02-music-subpackage-migration.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
