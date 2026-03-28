// 麦田小游戏页面
const gameData = require('../../../utils/gameData.js')

Page({
  data: {
    wheatItems: [],      // 麦穗列表
    collected: 0,       // 已收集
    total: 0,           // 总数
    timeLeft: 15,        // 剩余时间
    gameEnded: false,    // 游戏结束
    allCollected: false, // 全部收集
    timer: null
  },

  onLoad() {
    this.initGame()
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  initGame() {
    // 随机生成6-10个麦穗位置
    const count = Math.floor(Math.random() * 5) + 6  // 6-10
    const items = []
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        x: Math.random() * 280 + 20,   // 随机X
        y: Math.random() * 400 + 100,   // 随机Y
        collected: false
      })
    }

    this.setData({
      wheatItems: items,
      collected: 0,
      total: count,
      timeLeft: 15,
      gameEnded: false,
      allCollected: false
    })

    // 启动计时器
    this.startTimer()
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

  collectWheat(e) {
    const id = e.currentTarget.dataset.id
    const items = this.data.wheatItems
    const item = items.find(i => i.id === id)
    if (item && !item.collected) {
      item.collected = true
      const collected = this.data.collected + 1
      this.setData({
        wheatItems: items,
        collected: collected
      })

      // 检查是否全部收集
      if (collected >= this.data.total) {
        this.endGame(true)
      }
    }
  },

  endGame(allCollected) {
    clearInterval(this.data.timer)
    this.setData({
      gameEnded: true,
      allCollected: allCollected,
      timeLeft: 0
    })

    // 如果全部收集，添加物品到背包
    if (allCollected) {
      gameData.addItem({ id: 'wheat', name: '麦穗', icon: '🌾' })
    }
  },

  closeGame() {
    wx.navigateBack()
  }
})
