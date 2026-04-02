// 对话框组件
const audioManager = require('../../utils/audioManager.js')

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    npcName: {
      type: String,
      value: ''
    },
    dialog: {
      type: Array,
      value: []
    }
  },

  data: {
    currentIndex: 0,
    currentText: '',
    hasNext: false
  },

  observers: {
    'visible, dialog': function(visible, dialog) {
      if (visible && dialog.length > 0) {
        this.setData({
          currentIndex: 0,
          currentText: dialog[0],
          hasNext: dialog.length > 1
        })
      }
    }
  },

  methods: {
    nextDialog() {
      // 播放按钮音效
      audioManager.playButton()

      const { currentIndex, dialog } = this.data
      if (currentIndex < dialog.length - 1) {
        const nextIndex = currentIndex + 1
        this.setData({
          currentIndex: nextIndex,
          currentText: dialog[nextIndex],
          hasNext: nextIndex < dialog.length - 1
        })
      } else {
        this.triggerEvent('close')
      }
    }
  }
})
