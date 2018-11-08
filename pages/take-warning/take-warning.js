//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: [],
    active: 0
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  },
  chooseActive: function (e) {
    const active = parseInt(e.currentTarget.dataset.active)
    console.log(e)
    this.setData({
      active: active
    })
  },
  confirm: function () {
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 1000
    })
    let _this = wx
    setTimeout(function() {
      _this.switchTab({
        url: '/pages/warning/warning'
      })
    }, 1000)
  }
})
