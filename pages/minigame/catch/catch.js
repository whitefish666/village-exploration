// 接物游戏页面
const gameData = require('../../../utils/gameData.js')

Page({
  data: {
    gameState: 'idle', // idle, playing, ended
    caughtCount: 0,
    targetCount: 10,
    bagX: 150,
    bagY: 500,
    bagWidth: 80,
    bagHeight: 25,
    items: [],
    itemSpeed: 3,
    spawnInterval: 1500,
    lastSpawnTime: 0,
    animationFrame: null,
    showResult: false,
    resultTitle: '',
    resultDesc: ''
  },

  onLoad() {
    this.initCanvas()
  },

  onUnload() {
    this.stopGame()
  },

  initCanvas() {
    this.ctx = wx.createCanvasContext('catchCanvas')
    // 获取画布尺寸
    const query = wx.createSelectorQuery().select('.game-canvas')
    query.boundingClientRect((rect) => {
      this.canvasWidth = rect.width
      this.canvasHeight = rect.height
      this.setData({ bagY: this.canvasHeight - 60 })
    }).exec()
  },

  onTouchStart(e) {
    if (this.data.gameState !== 'playing') return
    const touch = e.touches[0]
    this.updateBagPosition(touch.clientX)
  },

  onTouchMove(e) {
    if (this.data.gameState !== 'playing') return
    const touch = e.touches[0]
    this.updateBagPosition(touch.clientX)
  },

  onTouchEnd(e) {
    // nothing
  },

  updateBagPosition(clientX) {
    const query = wx.createSelectorQuery().select('.game-canvas')
    query.boundingClientRect((rect) => {
      const relativeX = clientX - rect.left
      let bagX = relativeX - this.data.bagWidth / 2
      bagX = Math.max(0, Math.min(rect.width - this.data.bagWidth, bagX))
      this.setData({ bagX })
    }).exec()
  },

  startGame() {
    this.setData({
      gameState: 'playing',
      caughtCount: 0,
      items: [],
      showResult: false
    })
    this.lastSpawnTime = Date.now()
    this.gameLoop()
  },

  stopGame() {
    if (this.data.animationFrame) {
      clearTimeout(this.data.animationFrame)
      this.data.animationFrame = null
    }
    // 额外清理：确保游戏状态停止
    this.setData({ gameState: 'idle' })
  },

  gameLoop() {
    if (this.data.gameState !== 'playing') return

    const now = Date.now()

    // 生成新物品
    if (now - this.lastSpawnTime > this.data.spawnInterval) {
      this.spawnItem()
      this.lastSpawnTime = now
    }

    // 更新物品位置
    this.updateItems()

    // 绘制
    this.draw()

    // 微信小程序不支持 requestAnimationFrame，使用 setTimeout 模拟
    if (this.data.gameState === 'playing') {
      this.data.animationFrame = setTimeout(() => this.gameLoop(), 16)
    }
  },

  spawnItem() {
    const item = {
      x: Math.random() * (this.canvasWidth - 40) + 20,
      y: -20,
      radius: 15,
      speed: 2 + Math.random() * 2
    }
    this.data.items.push(item)
  },

  updateItems() {
    const { items, bagX, bagY, bagWidth, bagHeight, canvasHeight } = this.data
    let caughtCount = this.data.caughtCount

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]
      item.y += item.speed

      // 圆形与矩形碰撞检测
      const closestX = Math.max(bagX, Math.min(item.x, bagX + bagWidth))
      const closestY = Math.max(bagY, Math.min(item.y, bagY + bagHeight))
      const distanceX = item.x - closestX
      const distanceY = item.y - closestY
      const distanceSquared = distanceX * distanceX + distanceY * distanceY

      if (distanceSquared < item.radius * item.radius) {
        // 接到物品
        caughtCount++
        items.splice(i, 1)
        this.setData({ caughtCount })

        if (caughtCount >= this.data.targetCount) {
          this.gameWin()
          return
        }
        continue
      }

      // 超出画布
      if (item.y > canvasHeight) {
        items.splice(i, 1)
      }
    }

    this.data.items = items
  },

  draw() {
    const ctx = this.ctx
    const { items, bagX, bagY, bagWidth, bagHeight } = this.data

    // 清空画布
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

    // 绘制地面
    ctx.setFillStyle('#90EE90')
    ctx.fillRect(0, this.canvasHeight - 20, this.canvasWidth, 20)

    // 绘制物品
    ctx.setFillStyle('#B8860B')
    for (const item of items) {
      ctx.beginPath()
      ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI)
      ctx.fill()
    }

    // 绘制布袋
    ctx.setFillStyle('#8B4513')
    ctx.fillRect(bagX, bagY, bagWidth, bagHeight)

    // 布袋装饰
    ctx.setFillStyle('#D4A574')
    ctx.fillRect(bagX + 10, bagY + 5, bagWidth - 20, bagHeight - 15)

    ctx.draw()
  },

  gameWin() {
    this.setData({ gameState: 'ended' })
    this.stopGame()

    // 标记任务完成
    gameData.completeTask('baiCi')

    this.setData({
      showResult: true,
      resultTitle: '恭喜通关！',
      resultDesc: '你成功接住了10个粘土！\n获得了白瓷制作体验券奖励！'
    })
  },

  closeResult() {
    this.setData({ showResult: false })
  },

  goBack() {
    // 确保游戏停止
    this.stopGame()
    // 短暂延迟确保清理完成
    setTimeout(() => {
      wx.navigateBack({
        fail: () => {
          wx.redirectTo({ url: '/pages/index/index' })
        }
      })
    }, 50)
  }
})
