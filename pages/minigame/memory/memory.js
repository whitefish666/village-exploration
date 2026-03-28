// 记忆游戏页面
const gameData = require('../../../utils/gameData.js')

Page({
  data: {
    patterns: [
      { id: 0, icon: '/assets/戏曲/上.png', active: false, matched: false },
      { id: 1, icon: '/assets/戏曲/中.png', active: false, matched: false },
      { id: 2, icon: '/assets/戏曲/下.png', active: false, matched: false }
    ],
    gameState: 'idle', // idle, showing, input, ended
    sequence: [],
    playerSequence: [],
    currentShowIndex: -1,
    statusText: '点击开始按钮来玩游戏',
    correctCount: 0,
    totalPatterns: 3,
    showingPattern: false
  },

  onLoad() {
    // 重置游戏状态
    this.resetGame()
  },

  resetGame() {
    this.setData({
      patterns: [
        { id: 0, icon: '/assets/戏曲/上.png', active: false, matched: false },
        { id: 1, icon: '/assets/戏曲/中.png', active: false, matched: false },
        { id: 2, icon: '/assets/戏曲/下.png', active: false, matched: false }
      ],
      gameState: 'idle',
      sequence: [],
      playerSequence: [],
      currentShowIndex: -1,
      statusText: '点击开始按钮来玩游戏',
      correctCount: 0,
      showingPattern: false
    })
  },

  startGame() {
    this.resetGame()
    this.setData({ gameState: 'showing' })

    // 生成随机序列（每个图案只出现一次）
    const sequence = [0, 1, 2]
    // 洗牌算法 Fisher-Yates
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = sequence[i]
      sequence[i] = sequence[j]
      sequence[j] = temp
    }

    this.setData({ sequence })

    // 显示序列
    this.showSequence(sequence)
  },

  async showSequence(sequence) {
    this.setData({ statusText: '记住图案顺序...' })

    for (let i = 0; i < sequence.length; i++) {
      await this.delay(600)
      const patternIndex = sequence[i]
      this.setData({
        [`patterns[${patternIndex}].active`]: true,
        currentShowIndex: i
      })

      await this.delay(500)
      this.setData({
        [`patterns[${patternIndex}].active`]: false
      })
    }

    await this.delay(300)
    this.setData({
      gameState: 'input',
      statusText: '请按顺序点击图案',
      playerSequence: []
    })
  },

  onPatternTap(e) {
    const { index } = e.currentTarget.dataset
    const { gameState, playerSequence, sequence, patterns } = this.data

    if (gameState !== 'input') return

    // 检查是否已点击
    if (patterns[index].matched) return

    // 添加到玩家序列
    playerSequence.push(index)
    this.setData({ playerSequence })

    const currentIndex = playerSequence.length - 1

    // 检查是否正确
    if (sequence[currentIndex] === index) {
      // 正确
      this.setData({
        [`patterns[${index}].matched`]: true
      })

      if (playerSequence.length === sequence.length) {
        // 全部正确
        this.gameWin()
      } else {
        this.setData({ statusText: `正确！继续 (${playerSequence.length}/${sequence.length})` })
      }
    } else {
      // 错误
      this.setData({
        [`patterns[${index}].active`]: true
      })
      setTimeout(() => {
        this.setData({ [`patterns[${index}].active`]: false })
      }, 300)

      this.gameLose()
    }
  },

  gameWin() {
    this.setData({
      gameState: 'ended',
      statusText: '太棒了！你记住了所有顺序！',
      correctCount: this.data.totalPatterns
    })

    // 标记任务完成
    gameData.completeTask('xiuNiang')

    wx.showToast({
      title: '游戏通关！',
      icon: 'success',
      duration: 2000
    })
  },

  gameLose() {
    this.setData({
      gameState: 'ended',
      statusText: '顺序错了，再来一次吧！'
    })

    wx.showToast({
      title: '顺序错误',
      icon: 'none',
      duration: 1500
    })
  },

  goBack() {
    wx.redirectTo({ url: '/pages/index/index' })
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
})
