// CDN资源配置文件
// 使用方式: const { CDN } = require('../config/resourceConfig.js')
// 或直接 const CDN = 'https://village-game-assets-1418646126.cos.ap-shanghai.myqcloud.com'

const CDN = 'https://village-game-assets-1418646126.cos.ap-shanghai.myqcloud.com'

module.exports = {
  CDN,

  // 地图背景
  MAP: `${CDN}/asset/ultimate_images/ultimate_image.png`,

  // 玩家站立图
  PLAYER_STAND: `${CDN}/asset/characters/player.png`,

  // 玩家走路动画帧（direction: front/back/left/right, frame: 1-3）
  playerWalkUrl(direction, frame) {
    const dirMap = { up: 'back', down: 'front', left: 'left', right: 'right' }
    const dir = dirMap[direction] || 'front'
    return `${CDN}/asset/character_walk/${dir}/${frame}.png`
  },

  // NPC头像
  npcAvatar: {
    village_chief: `${CDN}/asset/characters/village_chief.png`,
    a_ming: `${CDN}/asset/characters/bamboo_weaving.png`,
    ma_bing: `${CDN}/asset/characters/sesame_cake.png`,
    xiu_niang: `${CDN}/asset/characters/xian_opera.png`,
    bai_ci: `${CDN}/asset/characters/white_ceramic.png`
  },

  // 音乐
  BGM: `${CDN}/asset/music/bgm.mp3`,
  BUTTON_SFX: `${CDN}/asset/music/button.mp3`,

  // 粘土游戏
  CLAY_BASIN: `${CDN}/asset/game/clay/basin.png`,    // 盆 (bowl.jpg → basin.png)
  CLAY_BLOCK: `${CDN}/asset/game/clay/clay_block.png`, // 粘土块 (clay.jpg → clay_block.png)

  // 麦田游戏
  WHEAT_BG: `${CDN}/asset/game/wheat/background.png`,   // 背景 (background.jpg → background.png)
  WHEAT_ITEM: `${CDN}/asset/game/wheat/wheat_ear.png`, // 麦穗 (wheat.jpg → wheat_ear.png)

  // 戏曲记忆游戏
  OPERA_TOP: `${CDN}/asset/game/opera/top.png`,
  OPERA_MIDDLE: `${CDN}/asset/game/opera/middle.png`,
  OPERA_BOTTOM: `${CDN}/asset/game/opera/bottom.png`
}
