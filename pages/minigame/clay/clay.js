// 粘土小游戏页面
const gameData = require('../../../utils/gameData.js')
const audioManager = require('../../../utils/audioManager.js')
const CDN = 'https://village-game-assets-1418646126.cos.ap-shanghai.myqcloud.com'

Page({
  data: {
    // CDN常量
    CDN: CDN,
    stones: [],       // 石块列表
    caught: 0,        // 已收集
    basinX: 0,      // 盆的位置（横屏模式）
    basinWidth: 280,  // 盆的宽度（固定280px）
    gameEnded: false, // 游戏结束
    allCaught: false,  // 全部收集
    gameLoopTimer: null,
    canvasWidth: 390,  // 游戏区域宽度（横屏屏幕）
    canvasHeight: 500
  },

  onLoad() {
    this.initGame()
  },

  onUnload() {
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
        x: Math.random() * 200 + 40,  // 随机X（盆可移动范围内）
        y: -20 - Math.random() * 200, // 初始在屏幕上方
        speed: 2 + Math.random() * 2,  // 随机速度
        caught: false
      })
    }

    this.setData({
      stones: stones,
      caught: 0,
      gameEnded: false,
      allCaught: false,
      basinX: (390 - 280) / 2  // 盆初始居中
    })

    // 启动游戏循环
    this.startGameLoop()
  },

  startGameLoop() {
    this.updateStones()
  },

  updateStones() {
    if (this.data.gameEnded) return

    const { stones, basinX, canvasWidth } = this.data
    const basinWidth = 280  // 与CSS中盆的宽度一致
    const screenHeight = 700  // 游戏区域高度（约700px）
    const basinBottom = screenHeight - 20  // 盆底部Y（距离顶部）
    const basinTop = basinBottom - 60  // 盆开口顶部Y（收集判定区域）
    const stoneSize = 40  // 石头视觉尺寸（与CSS一致）
    let caught = this.data.caught
    let allCaught = true

    for (const stone of stones) {
      if (stone.caught) continue

      allCaught = false
      // 移动石块
      stone.y += stone.speed

      // 检测碰撞：石块必须掉落到盆的开口范围内才算接住
      // 石块中心点(y + stoneSize/2)必须在盆开口区域内
      const stoneCenterY = stone.y + stoneSize / 2

      if (stoneCenterY >= basinTop && stoneCenterY <= basinBottom) {
        // 石块中心X必须在盆的水平范围内
        const stoneCenterX = stone.x + stoneSize / 2
        if (stoneCenterX >= basinX && stoneCenterX <= basinX + basinWidth) {
          stone.caught = true
          caught++
          continue
        }
      }

      // 超出屏幕底部
      if (stone.y > screenHeight) {
        stone.y = -20
        stone.x = Math.random() * 200 + 40
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
    clearTimeout(this.data.gameLoopTimer)
    this.setData({
      gameEnded: true,
      allCaught: allCaught
    })

    // 如果全部收集，添加物品到背包
    if (allCaught) {
      gameData.addItem({ id: 'clay', name: '粘土', icon: '🟤' })
    }
  },

  closeGame() {
    // 播放按钮音效
    audioManager.playButton()
    wx.navigateBack()
  }
})
