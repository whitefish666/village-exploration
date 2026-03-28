// 二维码奖励弹窗组件
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
      this.triggerEvent('close')
    }
  }
})
