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

    // 初始化音频管理器并播放BGM
    const audioManager = require('./utils/audioManager.js')
    audioManager.init()
    audioManager.playBgm()
  },

  saveData() {
    wx.setStorageSync('villageGameData', {
      inventory: this.globalData.inventory,
      tasks: this.globalData.tasks
    })
  }
})
