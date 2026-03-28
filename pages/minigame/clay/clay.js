// 粘土小游戏页面
const gameData = require('../../../utils/gameData.js')

Page({
  data: {
    stones: [],       // 石块列表
    caught: 0,        // 已收集
    basinX: 150,      // 盆的位置
    timeLeft: 15,     // 剩余时间
    gameEnded: false, // 游戏结束
    allCaught: false,  // 全部收集
    timer: null,
    gameLoopTimer: null,
    canvasWidth: 320,
    canvasHeight: 500
  },

  onLoad() {
    this.initGame()
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
    if (this.data.gameLoopTimer) {
      clearTimeout(this.data.gameLoopTimer)
    }
  },

  initGame() {
    // 生成10个石块
    const stones = []
    for (let i = 0; i < 10; i++) {
      stones.push({
        id: i,
        x: Math.random() * 260 + 30,  // 随机X
        y: -20 - Math.random() * 200, // 初始在屏幕上方
        speed: 2 + Math.random() * 2,  // 随机速度
        caught: false
      })
    }

    this.setData({
      stones: stones,
      caught: 0,
      timeLeft: 15,
      gameEnded: false,
      allCaught: false,
      basinX: 120
    })

    // 启动计时器
    this.startTimer()
    // 启动游戏循环
    this.startGameLoop()
  },

  startTimer() {
    this.data.timer = setInterval(() => {
      const timeLeft = this.data.timeLeft - 1
      if (timeLeft <= 0) {
        this.endGame(false)
      } else {
        this.setData({ timeLeft })
      }
    }, 1000)
  },

  startGameLoop() {
    this.updateStones()
  },

  updateStones() {
    if (this.data.gameEnded) return

    const { stones, basinX, canvasWidth } = this.data
    const basinWidth = 80
    const basinY = 480  // 盆的Y位置
    let caught = this.data.caught
    let allCaught = true

    for (const stone of stones) {
      if (stone.caught) continue

      allCaught = false
      // 移动石块
      stone.y += stone.speed

      // 检测碰撞（盆的范围内）
      if (stone.y >= basinY - 20 && stone.y <= basinY + 30) {
        if (stone.x >= basinX - 10 && stone.x <= basinX + basinWidth + 10) {
          stone.caught = true
          caught++
          continue
        }
      }

      // 超出屏幕
      if (stone.y > 520) {
        stone.y = -20
        stone.x = Math.random() * 260 + 30
      }
    }

    // 检查是否全部收集
    if (caught >= 10) {
      this.endGame(true)
      return
    }

    this.setData({ stones: stones, caught: caught })

    // 继续循环
    this.data.gameLoopTimer = setTimeout(() => {
      this.updateStones()
    }, 30)
  },

  onTouchStart(e) {
    const touch = e.touches[0]
    this.updateBasin(touch.clientX)
  },

  onTouchMove(e) {
    const touch = e.touches[0]
    this.updateBasin(touch.clientX)
  },

  onTouchEnd(e) {
    // nothing
  },

  updateBasin(clientX) {
    // 将屏幕坐标转换为游戏坐标
    // 游戏区域是320px宽，屏幕是390px宽，居中时左边距是35px
    const screenWidth = 390
    const gameWidth = this.data.canvasWidth
    const offsetX = (screenWidth - gameWidth) / 2

    // 盆的宽度是80px，半宽是40
    const basinHalfWidth = 40
    let x = clientX - offsetX - basinHalfWidth

    // 边界限制
    x = Math.max(0, Math.min(gameWidth - 80, x))
    this.setData({ basinX: x })
  },

  endGame(allCaught) {
    clearInterval(this.data.timer)
    clearTimeout(this.data.gameLoopTimer)
    this.setData({
      gameEnded: true,
      allCaught: allCaught,
      timeLeft: 0
    })

    // 如果全部收集，添加物品到背包
    if (allCaught) {
      gameData.addItem({ id: 'clay', name: '粘土', icon: '🟤' })
    }
  },

  closeGame() {
    wx.navigateBack()
  }
})
