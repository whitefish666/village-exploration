// 首页
Page({
  data: {},

  goToGame() {
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },

  goToAchievement() {
    wx.showToast({
      title: '暂未开放',
      icon: 'none',
      duration: 1500
    })
  },

  goToIntro() {
    wx.navigateTo({
      url: '/pages/village-info/village-info'
    })
  }
})
