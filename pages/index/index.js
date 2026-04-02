// 主页面：2D俯视角地图游戏核心
const gameData = require('../../utils/gameData.js')
const npcsConfig = require('../../data/npcs.js')
const audioManager = require('../../utils/audioManager.js')
const CDN = 'https://village-game-assets-1418646126.cos.ap-shanghai.myqcloud.com'

Page({
  data: {
    // 游戏配置
    mapSize: npcsConfig.mapSize,
    bounds: npcsConfig.bounds,
    wheatPile: npcsConfig.wheatPile,
    clayPile: npcsConfig.clayPile,

    // 视口/摄像机
    viewport: { width: 0, height: 0 },
    camera: { x: 0, y: 0 },

    // 玩家状态
    player: {
      x: 1250,
      y: 300,
      direction: 'down',
      speed: 1.0,
      frameIndex: 1,
      animationTimer: 0
    },

    // CDN常量
    CDN: CDN,

    // 玩家图片路径
    playerImage: `${CDN}/asset/character_walk/front/1.png`,

    // NPC列表
    npcs: [],

    // 背包物品
    inventory: [],

    // 麦堆收集状态
    wheatCollected: false,

    // 对话框状态
    dialogVisible: false,
    currentNpc: { name: '', dialog: [] },

    // 二维码弹窗
    qrPopupVisible: false,
    qrCodeUrl: '',
    rewardDesc: '',

    // 移动相关
    isMoving: false,
    targetX: 0,
    targetY: 0,
    showTarget: false,

    // 遥控杆相关
    joystickVisible: true,
    joystickActive: false,
    joystickDirection: null,
    joystickOffsetX: 0,
    joystickOffsetY: 0,
    joystickCenterX: 80,
    joystickCenterY: 580,

    // 触摸相关
    touchStartX: 0,
    touchStartY: 0,

    // 动画帧
    animationFrame: null,

    // 交互状态
    nearNpcId: null,

    // 交互键
    interactVisible: true,
    interactEnabled: false,
    interactTarget: null,

    // 待显示奖励（对话框关闭后显示）
    pendingRewardTaskId: null,

    // 任务状态
    tasks: {
      wheatCollected: false,
      maBingComplete: false,
      xiuNiangComplete: false,
      baiCiComplete: false
    }
  },

  onLoad() {
    // 加载保存的数据
    const savedData = gameData.getGameData()
    console.log('加载游戏数据:', savedData)

    // NPC表情映射
    const emojiMap = {
      'village_chief': '👴',
      'a_ming': '🧑',
      'ma_bing': '👨',
      'xiu_niang': '👩',
      'bai_ci': '👨‍🍳'
    }

    // 初始化NPC列表
    const npcs = npcsConfig.npcs.map(npc => ({
      ...npc,
      direction: npc.direction || 'down',
      emoji: emojiMap[npc.id] || '👤'
    }))

    this.setData({
      player: savedData.player || this.data.player,
      inventory: savedData.inventory || [],
      npcs: npcs,
      tasks: savedData.tasks || this.data.tasks,
      wheatCollected: (savedData.tasks && savedData.tasks.wheatCollected) || false
    })

    // 启动游戏循环
    this.startGameLoop()

    // 获取视口尺寸并初始化摄像机
    const query = wx.createSelectorQuery().select('.game-map')
    query.boundingClientRect((rect) => {
      this.setData({
        viewport: { width: rect.width, height: rect.height }
      })
      this.updateCamera()
    }).exec()
  },

  onUnload() {
    // 停止游戏循环
    if (this.data.animationFrame) {
      clearInterval(this.data.animationFrame)
    }
  },

  onHide() {
    // 停止游戏循环
    if (this.data.animationFrame) {
      clearInterval(this.data.animationFrame)
    }
    // 隐藏遥控杆
    this.setData({ joystickVisible: false })
  },

  onShow() {
    // 重新加载数据（可能从小游戏返回）
    const savedData = gameData.getGameData()
    this.setData({
      player: savedData.player || this.data.player,
      inventory: savedData.inventory || [],
      tasks: savedData.tasks || this.data.tasks,
      wheatCollected: savedData.tasks.wheatCollected || false,
      joystickVisible: true,
      playerImage: `${CDN}/asset/characters/protagonist2.png`
    })
    // 检查NPC接近状态（确保交互键状态正确）
    this.checkNpcProximity()
    // 重新启动游戏循环
    this.startGameLoop()
    // 播放背景音乐（主页显示时触发）
    audioManager.playBgm()
  },

  // 开始游戏循环
  startGameLoop() {
    // 确保清理任何现有的定时器
    if (this.data.animationFrame) {
      clearInterval(this.data.animationFrame)
    }
    // 额外保护：确保旧的定时器被完全清理
    setTimeout(() => {
      this.data.animationFrame = setInterval(() => {
        this.update()
      }, 16) // 约60fps
    }, 0)
  },

  // 更新游戏状态
  update() {
    if (this.data.isMoving) {
      this.movePlayer()
      this.checkNpcProximity()
      this.updateAnimation()
    } else if (this.data.joystickActive) {
      // 遥控杆控制移动
      this.updatePlayerByJoystick()
      this.checkNpcProximity()
      this.updateAnimation()
    } else {
      // 站立时显示站立图片
      if (this.data.playerImage !== `${CDN}/asset/characters/protagonist2.png`) {
        this.setData({ playerImage: `${CDN}/asset/characters/protagonist2.png` })
      }
      // 检测NPC接近（站立时也需要检测）
      this.checkNpcProximity()
    }
    this.updateCamera()
  },

  // 更新摄像机位置
  updateCamera() {
    const { player, viewport, mapSize } = this.data
    if (!viewport.width || !viewport.height) return

    let camX = player.x - viewport.width / 2
    let camY = 0  // 地图高度 < 视口高度，顶部对齐

    // X 边界限制
    const maxCamX = mapSize.width - viewport.width
    camX = Math.max(0, Math.min(maxCamX, camX))

    this.setData({ camera: { x: camX, y: camY } })
  },

  // 更新走路动画
  updateAnimation() {
    const { player, joystickActive, isMoving } = this.data

    if (isMoving || joystickActive) {
      // 增加animationTimer
      let animationTimer = (player.animationTimer || 0) + 1
      let frameIndex = player.frameIndex || 1
      const direction = player.direction

      // 每4帧更新一次动画（约15fps），减少setData调用
      if (animationTimer >= 4) {
        animationTimer = 0
        // 根据方向获取最大帧数
        const maxFrames = (direction === 'left' || direction === 'right') ? 6 : 2
        frameIndex = (frameIndex % maxFrames) + 1
        // 更新图片路径
        this.updatePlayerImage(direction, frameIndex)
      }

      // 保存animationTimer和frameIndex
      this.setData({
        'player.animationTimer': animationTimer,
        'player.frameIndex': frameIndex
      })
    } else if (player.frameIndex !== 1) {
      // 站立时只重置帧索引
      this.setData({
        'player.frameIndex': 1,
        'player.animationTimer': 0
      })
    }
  },

  // 更新玩家图片路径
  updatePlayerImage(direction, frameIndex) {
    // 确保frameIndex有默认值
    if (frameIndex === undefined || frameIndex === null) {
      frameIndex = 1
    }
    const dirMap = {
      'up': 'back',
      'down': 'front',
      'left': 'left',
      'right': 'right'
    }
    const folder = dirMap[direction] || 'front'
    this.setData({
      playerImage: `${CDN}/asset/character_walk/${folder}/${frameIndex}.png`
    })
  },

  // 移动玩家
  movePlayer() {
    const { player, targetX, targetY, bounds } = this.data
    const dx = targetX - player.x
    const dy = targetY - player.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < player.speed) {
      // 到达目标
      this.setData({
        'player.x': targetX,
        'player.y': targetY,
        isMoving: false,
        showTarget: false
      })
      // 保存位置
      gameData.updatePlayerPosition(targetX, targetY)

      // 到达目标后检查NPC交互
      this.checkNpcInteraction()
    } else {
      // 计算方向向量
      const vx = (dx / distance) * player.speed
      const vy = (dy / distance) * player.speed

      // 更新朝向
      let direction = this.getDirection(vx, vy)

      // 计算新位置
      let newX = player.x + vx
      let newY = player.y + vy

      // 边界检测
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX))
      newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY))

      // 如果方向改变，更新图片
      if (direction !== player.direction) {
        this.updatePlayerImage(direction, player.frameIndex)
      }

      this.setData({
        'player.x': newX,
        'player.y': newY,
        'player.direction': direction
      })
    }
  },

  // 根据移动向量获取朝向
  getDirection(vx, vy) {
    if (Math.abs(vx) > Math.abs(vy)) {
      return vx > 0 ? 'right' : 'left'
    } else {
      return vy > 0 ? 'down' : 'up'
    }
  },

  // 获取主角图片路径
  getPlayerImage() {
    const { direction, frameIndex } = this.data.player
    // 方向映射：代码方向 -> 文件夹名
    const dirMap = {
      'up': 'back',
      'down': 'front',
      'left': 'left',
      'right': 'right'
    }
    const folder = dirMap[direction] || 'front'
    return `${CDN}/asset/character_walk/${folder}/${frameIndex}.png`
  },

  // 触摸开始
  onTouchStart(e) {
    const touch = e.touches[0]
    this.data.touchStartX = touch.clientX
    this.data.touchStartY = touch.clientY
  },

  // 触摸移动
  onTouchMove(e) {
    // 可以在这里实现拖拽移动
  },

  // 点击小麦堆
  onWheatPileTap() {
    wx.navigateTo({ url: '/pages/minigame/wheat/wheat' })
  },

  // 点击粘土堆
  onClayPileTap() {
    wx.navigateTo({ url: '/pages/minigame/clay/clay' })
  },

  // 遥控杆开始触摸
  onJoystickStart(e) {
    const touch = e.touches[0]
    this.data.joystickActive = true
    this.updateJoystickPosition(touch.clientX, touch.clientY)
  },

  // 遥控杆移动
  onJoystickMove(e) {
    if (!this.data.joystickActive) return
    const touch = e.touches[0]
    this.updateJoystickPosition(touch.clientX, touch.clientY)
  },

  // 遥控杆释放
  onJoystickEnd(e) {
    this.data.joystickActive = false
    this.data.joystickDirection = null
    this.setData({
      joystickOffsetX: 0,
      joystickOffsetY: 0,
      playerImage: `${CDN}/asset/characters/protagonist2.png`
    })
  },

  // 交互键点击
  onInteractTap() {
    // 播放按钮音效
    audioManager.playButton()

    const { interactTarget, player, npcs, tasks, inventory, nearNpcId } = this.data

    // 麦堆交互
    if (interactTarget && interactTarget.type === 'wheat') {
      wx.navigateTo({ url: '/pages/minigame/wheat/wheat' })
      return
    }

    // 粘土堆交互
    if (interactTarget && interactTarget.type === 'clay') {
      wx.navigateTo({ url: '/pages/minigame/clay/clay' })
      return
    }

    // 找到最近的NPC
    let targetNpc = null
    const interactDistance = 60

    // 如果有interactTarget且是NPC，使用它
    if (interactTarget && !interactTarget.type) {
      targetNpc = interactTarget
    } else if (nearNpcId) {
      // 否则从npcs列表中找到对应的NPC
      targetNpc = npcs.find(npc => npc.id === nearNpcId)
    }

    // 如果找到了NPC，检查距离
    if (targetNpc) {
      const dx = targetNpc.x - player.x
      const dy = targetNpc.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance >= interactDistance) return
    } else {
      // 没有找到NPC且不是麦堆/粘土堆，返回
      if (!interactTarget || (!interactTarget.type && !interactTarget.type === 'wheat' && !interactTarget.type === 'clay')) {
        return
      }
    }

    // 确保有NPC
    if (!targetNpc) {
      // 如果既没有目标也不是麦堆/粘土堆，直接返回
      if (!interactTarget || (!interactTarget.type && !interactTarget.type === 'wheat' && !interactTarget.type === 'clay')) {
        return
      }
    }

    const npc = targetNpc

    // 触发对应NPC的交互
    if (npc && npc.trigger === 'auto') {
      this.showDialog(npc)
      return
    }

    // 麻饼任务
    if (npc && npc.task === 'wheat' && !tasks.maBingComplete) {
      const hasWheat = inventory.some(item => item.id === 'wheat')
      if (hasWheat) {
        gameData.removeItem('wheat')
        gameData.completeTask('maBing')
        this.setData({
          tasks: { ...tasks, maBingComplete: true },
          inventory: this.data.inventory.filter(item => item.id !== 'wheat'),
          pendingRewardTaskId: 'maBing'
        })
        this.showDialog({
          name: npc.name,
          dialog: ['谢谢你帮我收集小麦！', '这是你的奖励，以后常来玩哦！']
        })
      } else {
        this.showDialog({
          name: npc.name,
          dialog: ['我是麻饼！', '我需要麦穗来做麻饼，你能帮我去麦田收集一些吗？']
        })
      }
      return
    }

    // 绣娘记忆游戏
    if (npc && npc.task === 'memory' && !tasks.xiuNiangComplete) {
      wx.navigateTo({ url: '/pages/minigame/memory/memory' })
      return
    }

    // 白瓷任务
    if (npc && npc.task === 'clay' && !tasks.baiCiComplete) {
      const hasClay = inventory.some(item => item.id === 'clay')
      if (hasClay) {
        gameData.removeItem('clay')
        gameData.completeTask('baiCi')
        this.setData({
          tasks: { ...tasks, baiCiComplete: true },
          inventory: this.data.inventory.filter(item => item.id !== 'clay'),
          pendingRewardTaskId: 'baiCi'
        })
        this.showDialog({
          name: npc.name,
          dialog: ['谢谢你帮我收集粘土！', '这是你的奖励，以后常来玩哦！']
        })
      } else {
        this.showDialog({
          name: npc.name,
          dialog: [npc.dialog[0], '我需要粘土来做瓷器，你能帮我去收集一些吗？']
        })
      }
      return
    }

    // 已完成的任务对话 - 每次都会弹出二维码
    if (npc && tasks.maBingComplete && npc.task === 'wheat') {
      this.setData({ pendingRewardTaskId: 'maBing' })
      this.showDialog({
        name: npc.name,
        dialog: ['谢谢你帮我收集小麦！', '这是你的奖励，以后常来玩哦！']
      })
      return
    }

    if (npc && tasks.xiuNiangComplete && npc.task === 'memory') {
      this.setData({ pendingRewardTaskId: 'xiuNiang' })
      this.showDialog({
        name: npc.name,
        dialog: ['记忆游戏很有趣吧？', '这是你的奖励，欢迎再来玩！']
      })
      return
    }

    if (npc && tasks.baiCiComplete && npc.task === 'clay') {
      this.setData({ pendingRewardTaskId: 'baiCi' })
      this.showDialog({
        name: npc.name,
        dialog: ['谢谢你帮我收集粘土！', '这是你的奖励，以后常来玩哦！']
      })
      return
    }

    // 默认对话
    if (npc) {
      this.showDialog(npc)
    }
  },

  // 更新遥控杆位置
  updateJoystickPosition(clientX, clientY) {
    const { joystickCenterX, joystickCenterY } = this.data
    const maxDistance = 40  // 最大偏移距离

    let dx = clientX - joystickCenterX
    let dy = clientY - joystickCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 限制最大偏移
    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance
      dy = (dy / distance) * maxDistance
    }

    // 判断方向 - 简化为8方向
    let direction = null
    if (distance > 15) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx > absDy * 1.5) {
        // 水平方向为主
        direction = dx > 0 ? 'right' : 'left'
      } else if (absDy > absDx * 1.5) {
        // 垂直方向为主
        direction = dy > 0 ? 'down' : 'up'
      } else {
        // 对角方向 - 取水平方向
        direction = dx > 0 ? 'right' : 'left'
      }
    }

    this.setData({
      joystickOffsetX: dx,
      joystickOffsetY: dy,
      joystickDirection: direction
    })
  },

  // 根据遥控杆方向更新玩家位置
  updatePlayerByJoystick() {
    const { joystickDirection, player, bounds } = this.data
    if (!joystickDirection) return

    const speed = player.speed
    let newX = player.x
    let newY = player.y
    let newDirection = player.direction
    let needUpdateImage = false

    switch (joystickDirection) {
      case 'up':
        newY -= speed
        if (newDirection !== 'up') { newDirection = 'up'; needUpdateImage = true }
        break
      case 'down':
        newY += speed
        if (newDirection !== 'down') { newDirection = 'down'; needUpdateImage = true }
        break
      case 'left':
        newX -= speed
        if (newDirection !== 'left') { newDirection = 'left'; needUpdateImage = true }
        break
      case 'right':
        newX += speed
        if (newDirection !== 'right') { newDirection = 'right'; needUpdateImage = true }
        break
    }

    // 边界检测
    newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX))
    newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY))

    const dataToUpdate = {
      'player.x': newX,
      'player.y': newY,
      'player.direction': newDirection
    }

    // 只有方向改变时才更新图片
    if (needUpdateImage) {
      this.updatePlayerImage(newDirection, player.frameIndex)
    }

    this.setData(dataToUpdate)
  },

  // 触摸结束 - 点击地图移动
  onTouchEnd(e) {
    const touch = e.changedTouches[0]
    const rect = wx.createSelectorQuery().select('.game-map').boundingClientRect()

    rect.exec((res) => {
      if (res && res[0]) {
        const mapRect = res[0]
        // 触摸点在屏幕上的位置
        const screenX = touch.clientX - mapRect.left
        const screenY = touch.clientY - mapRect.top

        // 转换为世界坐标 = 屏幕位置 + 摄像机偏移
        const { camera } = this.data
        const gameX = screenX + camera.x
        const gameY = screenY + camera.y

        this.moveTo(gameX, gameY)
      }
    })
  },

  // 移动到目标位置
  moveTo(x, y) {
    const { bounds } = this.data

    // 边界限制
    x = Math.max(bounds.minX, Math.min(bounds.maxX, x))
    y = Math.max(bounds.minY, Math.min(bounds.maxY, y))

    this.setData({
      targetX: x,
      targetY: y,
      showTarget: true,
      isMoving: true
    })
  },

  // 检查NPC接近
  checkNpcProximity() {
    const { player, npcs, isMoving, joystickActive } = this.data
    const interactDistance = 60
    let foundTarget = null

    for (const npc of npcs) {
      const dx = npc.x - player.x
      const dy = npc.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < interactDistance) {
        foundTarget = { nearNpcId: npc.id, interactEnabled: true, interactTarget: npc }
        break
      }
    }

    // 检查麦堆
    if (!foundTarget) {
      const { wheatPile, clayPile } = this.data
      const wheatDx = wheatPile.x - player.x
      const wheatDy = wheatPile.y - player.y
      if (Math.sqrt(wheatDx * wheatDx + wheatDy * wheatDy) < interactDistance) {
        foundTarget = { nearNpcId: 'wheat_pile', interactEnabled: true, interactTarget: { type: 'wheat' } }
      }
    }

    // 检查粘土堆
    if (!foundTarget) {
      const { wheatPile, clayPile } = this.data
      const clayDx = clayPile.x - player.x
      const clayDy = clayPile.y - player.y
      if (Math.sqrt(clayDx * clayDx + clayDy * clayDy) < interactDistance) {
        foundTarget = { nearNpcId: 'clay_pile', interactEnabled: true, interactTarget: { type: 'clay' } }
      }
    }

    // 更新交互状态
    if (foundTarget) {
      this.setData(foundTarget)
    } else {
      this.setData({
        nearNpcId: null,
        interactEnabled: false,
        interactTarget: null
      })
    }
  },

  // 检查NPC交互（到达目标后）
  checkNpcInteraction() {
    const { player, npcs, tasks, inventory } = this.data
    const interactDistance = 60

    for (const npc of npcs) {
      const dx = npc.x - player.x
      const dy = npc.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < interactDistance) {
        // 自动触发对话
        if (npc.trigger === 'auto') {
          this.showDialog(npc)
          return
        }

        // 检查任务相关NPC
        if (npc.task === 'wheat' && !tasks.maBingComplete) {
          // 麻饼任务：检查是否有麦穗
          const hasWheat = inventory.some(item => item.id === 'wheat')
          if (hasWheat) {
            // 完成任务，给优惠券
            gameData.removeItem('wheat')
            gameData.completeTask('maBing')
            this.setData({
              tasks: { ...tasks, maBingComplete: true },
              inventory: this.data.inventory.filter(item => item.id !== 'wheat')
            })
            this.showReward('maBing')
          } else {
            // 第一次对话：求助
            this.showDialog({
              name: npc.name,
              dialog: ['我是麻饼！', '我需要麦穗来做麻饼，你能帮我去麦田收集一些吗？']
            })
          }
          return
        }

        // 其他任务NPC
        if (npc.task === 'memory' && !tasks.xiuNiangComplete) {
          wx.navigateTo({ url: '/pages/minigame/memory/memory' })
          return
        }

        // 白瓷任务：检查是否有粘土
        if (npc.task === 'clay' && !tasks.baiCiComplete) {
          const hasClay = inventory.some(item => item.id === 'clay')
          if (hasClay) {
            // 完成任务，给优惠券
            gameData.removeItem('clay')
            gameData.completeTask('baiCi')
            this.setData({
              tasks: { ...tasks, baiCiComplete: true },
              inventory: this.data.inventory.filter(item => item.id !== 'clay')
            })
            this.showReward('baiCi')
          } else {
            // 第一次对话：求助
            this.showDialog({
              name: npc.name,
              dialog: [npc.dialog[0], '我需要粘土来做瓷器，你能帮我去收集一些吗？']
            })
          }
          return
        }

        // 已完成的任务
        if (tasks.maBingComplete && npc.task === 'wheat') {
          this.setData({ pendingRewardTaskId: 'maBing' })
          this.showDialog({
            name: npc.name,
            dialog: ['谢谢你帮我收集小麦！', '这是你的奖励，以后常来玩哦！']
          })
          return
        }

        if (tasks.xiuNiangComplete && npc.task === 'memory') {
          this.setData({ pendingRewardTaskId: 'xiuNiang' })
          this.showDialog({
            name: npc.name,
            dialog: ['记忆游戏很有趣吧？', '这是你的奖励，欢迎再来玩！']
          })
          return
        }

        if (tasks.baiCiComplete && npc.task === 'clay') {
          this.setData({ pendingRewardTaskId: 'baiCi' })
          this.showDialog({
            name: npc.name,
            dialog: ['谢谢你帮我收集粘土！', '这是你的奖励，以后常来玩哦！']
          })
          return
        }

        // 默认对话
        this.showDialog(npc)
        return
      }
    }

    // 检查麦堆交互
    const { wheatPile, clayPile } = this.data
    const wheatDx = wheatPile.x - player.x
    const wheatDy = wheatPile.y - player.y
    const wheatDistance = Math.sqrt(wheatDx * wheatDx + wheatDy * wheatDy)

    if (wheatDistance < interactDistance) {
      wx.navigateTo({ url: '/pages/minigame/wheat/wheat' })
    }

    // 检查粘土堆交互
    const clayDx = clayPile.x - player.x
    const clayDy = clayPile.y - player.y
    const clayDistance = Math.sqrt(clayDx * clayDx + clayDy * clayDy)

    if (clayDistance < interactDistance) {
      wx.navigateTo({ url: '/pages/minigame/clay/clay' })
    }
  },

  // 显示对话框
  showDialog(npc) {
    this.setData({
      dialogVisible: true,
      currentNpc: npc
    })
  },

  // 关闭对话框
  closeDialog() {
    this.setData({ dialogVisible: false })

    // 检查是否有待显示的奖励
    if (this.data.pendingRewardTaskId) {
      const taskId = this.data.pendingRewardTaskId
      this.setData({ pendingRewardTaskId: null })
      this.showReward(taskId)
    }
  },

  // 收集小麦
  collectWheat() {
    const { tasks, inventory } = this.data

    if (tasks.wheatCollected) {
      return
    }

    // 添加小麦到背包
    gameData.addItem({ id: 'wheat', name: '小麦', icon: '🌾' })

    // 更新任务状态
    tasks.wheatCollected = true
    gameData.saveGameData({
      player: this.data.player,
      inventory: [...inventory, { id: 'wheat', name: '小麦', icon: '🌾' }],
      tasks: tasks
    })

    this.setData({
      tasks: tasks,
      inventory: [...this.data.inventory, { id: 'wheat', name: '小麦', icon: '🌾' }],
      wheatCollected: true
    })

    wx.showToast({
      title: '收集到小麦！',
      icon: 'success',
      duration: 1500
    })
  },

  // 显示奖励
  showReward(taskId) {
    const rewards = {
      maBing: {
        desc: '消费券',
        qrCodeUrl: '/assets/qr/1.png'
      },
      xiuNiang: {
        desc: '消费券',
        qrCodeUrl: '/assets/qr/2.png'
      },
      baiCi: {
        desc: '消费券',
        qrCodeUrl: '/assets/qr/3.png'
      }
    }

    const reward = rewards[taskId] || { desc: '消费券', qrCodeUrl: '/assets/qr/1.png' }

    this.setData({
      qrPopupVisible: true,
      rewardDesc: reward.desc,
      qrCodeUrl: reward.qrCodeUrl
    })
  },

  // 关闭二维码弹窗
  closeQrPopup() {
    this.setData({ qrPopupVisible: false })
  },

})
