// 粘土小游戏页面
const gameData = require('../../../utils/gameData.js')

Page({
  data: {
    stones: [],       // 石块列表
    caught: 0,        // 已收集
    basinX: 0,      // 盆的位置（横屏模式）
    basinWidth: 250,  // 盆的宽度（固定250px）
    timeLeft: 15,     // 剩余时间
    gameEnded: false, // 游戏结束
    allCaught: false,  // 全部收集
    timer: null,
    gameLoopTimer: null,
    canvasWidth: 390,  // 游戏区域宽度（横屏屏幕）
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
        x: Math.random() * 350 + 20,  // 随机X（屏幕宽度内）
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
      basinX: (390 - 250) / 2  // 盆初始居中
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

    const { stones, basinX, basinWidth, canvasWidth } = this.data
    const basinY = 680  // 盆的Y位置（靠近底部）
    let caught = this.data.caught
    let allCaught = true

    for (const stone of stones) {
      if (stone.caught) continue

      allCaught = false
      // 移动石块
      stone.y += stone.speed

      // 石块大小（300%放大后36px）
      const stoneSize = 36

      // 检测碰撞：石块必须掉落在盆的范围内才算接住
      // 盆的Y位置是680，盆高度125px
      // 石块的底部(y + stoneSize)必须在盆的范围内才算接住
      const stoneBottom = stone.y + stoneSize
      const basinTop = basinY - 50  // 盆的顶部区域
      const basinBottom = basinY + 70  // 盆的底部区域

      if (stoneBottom >= basinTop && stoneBottom <= basinBottom) {
        // 石块必须在盆的水平范围内
        if (stone.x >= basinX && stone.x + stoneSize <= basinX + basinWidth) {
          stone.caught = true
          caught++
          continue
        }
      }

      // 超出屏幕底部
      if (stone.y > 780) {
        stone.y = -20
        stone.x = Math.random() * (canvasWidth - 40) + 20
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
    const { canvasWidth, basinWidth } = this.data

    // 直接使用屏幕坐标，盆的宽度是屏幕的1/4
    let x = clientX - basinWidth / 2

    // 边界限制（盆不能超出屏幕）
    x = Math.max(0, Math.min(canvasWidth - basinWidth, x))
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
