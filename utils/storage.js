// 本地存储封装
const STORAGE_KEY = 'villageGameData'

function save(data) {
  try {
    wx.setStorageSync(STORAGE_KEY, data)
    return true
  } catch (e) {
    console.error('存储失败', e)
    return false
  }
}

function load() {
  try {
    return wx.getStorageSync(STORAGE_KEY) || {}
  } catch (e) {
    console.error('读取失败', e)
    return {}
  }
}

function clear() {
  try {
    wx.removeStorageSync(STORAGE_KEY)
    return true
  } catch (e) {
    console.error('清除失败', e)
    return false
  }
}

module.exports = {
  save,
  load,
  clear
}
