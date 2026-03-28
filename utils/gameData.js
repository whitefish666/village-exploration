// 游戏数据管理
const storage = require('./storage.js')

// 默认数据
const defaultData = {
  player: {
    x: 400,
    y: 200,
    direction: 'down',
    speed: 3
  },
  inventory: [],
  tasks: {
    wheatCollected: false,
    maBingComplete: false,
    xiuNiangComplete: false,
    baiCiComplete: false
  }
}

// 获取游戏数据（返回深拷贝，防止模块缓存问题）
function getGameData() {
  const saved = storage.load()
  return {
    player: saved.player ? { ...saved.player } : { ...defaultData.player },
    inventory: saved.inventory ? [...saved.inventory] : [],
    tasks: saved.tasks ? { ...saved.tasks } : { ...defaultData.tasks }
  }
}

// 保存游戏数据
function saveGameData(data) {
  storage.save(data)
}

// 更新玩家位置
function updatePlayerPosition(x, y) {
  const data = getGameData()
  data.player.x = x
  data.player.y = y
  saveGameData(data)
}

// 更新玩家朝向
function updatePlayerDirection(direction) {
  const data = getGameData()
  data.player.direction = direction
  saveGameData(data)
}

// 添加物品到背包
function addItem(item) {
  const data = getGameData()
  data.inventory.push(item)
  saveGameData(data)
  return data.inventory
}

// 获取物品列表
function getInventory() {
  const data = getGameData()
  return data.inventory
}

// 检查是否有特定物品
function hasItem(itemId) {
  const data = getGameData()
  return data.inventory.some(item => item.id === itemId)
}

// 移除物品
function removeItem(itemId) {
  const data = getGameData()
  data.inventory = data.inventory.filter(item => item.id !== itemId)
  saveGameData(data)
  return data.inventory
}

// 完成任务
function completeTask(taskId) {
  const data = getGameData()
  if (taskId === 'maBing') {
    data.tasks.maBingComplete = true
  } else if (taskId === 'xiuNiang') {
    data.tasks.xiuNiangComplete = true
  } else if (taskId === 'baiCi') {
    data.tasks.baiCiComplete = true
  }
  saveGameData(data)
}

// 检查任务是否完成
function isTaskComplete(taskId) {
  const data = getGameData()
  if (taskId === 'maBing') {
    return data.tasks.maBingComplete
  } else if (taskId === 'xiuNiang') {
    return data.tasks.xiuNiangComplete
  } else if (taskId === 'baiCi') {
    return data.tasks.baiCiComplete
  }
  return false
}

// 获取所有任务状态
function getTasks() {
  const data = getGameData()
  return data.tasks
}

// 重置游戏数据
function resetGameData() {
  storage.clear()
}

module.exports = {
  getGameData,
  saveGameData,
  updatePlayerPosition,
  updatePlayerDirection,
  addItem,
  getInventory,
  hasItem,
  removeItem,
  completeTask,
  isTaskComplete,
  getTasks,
  resetGameData
}
