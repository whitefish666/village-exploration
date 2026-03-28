// NPC 配置 - 横屏版本
module.exports = {
  // 地图尺寸 (横屏: 宽度 > 高度)
  mapSize: {
    width: 2500,
    height: 600
  },

  // 边界
  bounds: {
    minX: 0,
    maxX: 2500,
    minY: 0,
    maxY: 600
  },

  // 5个NPC - 横屏布局
  npcs: [
    {
      id: 'village_chief',
      name: '村长',
      x: 1200,
      y: 420,
      direction: 'down',
      dialog: [
        '欢迎来到我们的小村庄！',
        '希望你能在这里度过愉快的时光。'
      ],
      trigger: 'auto',
      task: null,
      avatar: '/assets/村长.png'
    },
    {
      id: 'a_ming',
      name: '阿明',
      x: 1900,
      y: 420,
      direction: 'left',
      dialog: [
        '你好，我是阿明。',
        '村里最近很热闹，欢迎常来玩！'
      ],
      trigger: 'click',
      task: null,
      avatar: '/assets/竹编.png'
    },
    {
      id: 'ma_bing',
      name: '麻饼',
      x: 1630,
      y: 420,
      direction: 'down',
      dialog: [
        '我是麻饼！',
        '我需要麦穗来做麻饼，你能帮我去麦田收集一些吗？'
      ],
      trigger: 'click',
      task: 'wheat',
      avatar: '/assets/麻饼.png'
    },
    {
      id: 'xiu_niang',
      name: '绣娘',
      x: 2350,
      y: 420,
      direction: 'right',
      dialog: [
        '我是绣娘，擅长刺绣。',
        '来玩个记忆游戏吧！'
      ],
      trigger: 'click',
      task: 'memory',
      avatar: '/assets/绣娘.png'
    },
    {
      id: 'bai_ci',
      name: '白瓷',
      x: 1450,
      y: 420,
      direction: 'up',
      dialog: [
        '我是白瓷手艺人。',
        '我需要一些粘土来做瓷器，你能帮我去收集一些吗？'
      ],
      trigger: 'click',
      task: 'clay',
      avatar: '/assets/白瓷.png'
    }
  ],

  // 麦堆位置
  wheatPile: {
    x: 580,
    y: 180
  },

  // 粘土堆位置
  clayPile: {
    x: 300,
    y: 500
  }
}
