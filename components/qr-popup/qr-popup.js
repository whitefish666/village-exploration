// 二维码奖励弹窗组件
const audioManager = require('../../utils/audioManager.js')

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    qrCodeUrl: {
      type: String,
      value: ''
    },
    rewardDesc: {
      type: String,
      value: '消费券奖励'
    }
  },

  methods: {
    close() {
      // 播放按钮音效
      audioManager.playButton()
      this.triggerEvent('close')
    }
  }
})
