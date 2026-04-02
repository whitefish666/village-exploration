// 音频管理器
const CDN = 'https://village-game-assets-1418646126.cos.ap-shanghai.myqcloud.com'

const audioManager = {
  bgmAudio: null,
  buttonAudio: null,
  isBgmPlaying: false,
  bgmSrc: `${CDN}/asset/music/bgm.mp3`,
  buttonSrc: `${CDN}/asset/music/button.mp3`,

  // 初始化音频
  init() {
    // 初始化背景音乐
    if (!this.bgmAudio) {
      this.bgmAudio = wx.createInnerAudioContext()
      this.bgmAudio.src = this.bgmSrc
      this.bgmAudio.loop = true
      this.bgmAudio.volume = 0.5

      const self = this
      this.bgmAudio.onEnded(function() {
        self.isBgmPlaying = false
      })

      this.bgmAudio.onError(function(err) {
        console.error('BGM播放错误:', err)
        self.isBgmPlaying = false
      })
    }

    // 初始化按钮音效
    if (!this.buttonAudio) {
      this.buttonAudio = wx.createInnerAudioContext()
      this.buttonAudio.src = this.buttonSrc
      this.buttonAudio.volume = 0.8

      this.buttonAudio.onError(function(err) {
        console.error('按钮音效错误:', err)
      })
    }
  },

  // 播放背景音乐
  playBgm() {
    if (!this.bgmAudio) {
      this.init()
    }
    if (!this.isBgmPlaying) {
      this.bgmAudio.play()
      this.isBgmPlaying = true
    }
  },

  // 暂停背景音乐
  pauseBgm() {
    if (this.bgmAudio && this.isBgmPlaying) {
      this.bgmAudio.pause()
      this.isBgmPlaying = false
    }
  },

  // 停止背景音乐
  stopBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.stop()
      this.isBgmPlaying = false
    }
  },

  // 播放按钮音效
  playButton() {
    if (!this.buttonAudio) {
      this.init()
    }
    this.buttonAudio.stop()
    this.buttonAudio.play()
  }
}

module.exports = audioManager
