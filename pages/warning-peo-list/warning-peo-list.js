//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    choosenUser: null,
    activeIndex: -1,
    peoList: []
  },
  onLoad: function () {
    wx.showLoading()
    app.globalData.fetch({
      url: `reach/mobile/getalluser`,
      method: 'POST',
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        const data = res.data.Result || []
        if (!data || !data.length) {
          wx.showToast({
            title: '暂无数据',
            icon: 'none',
            duration: 1500
          })
        }
        this.setData({
          peoList: data
        })
      }
    })
  },
  chooseActive: function (e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      activeIndex: index
    })
  },
  confirm: function () {
    app.globalData.choosenUser = this.data.peoList[this.data.activeIndex]
    wx.navigateBack()
  }
})
