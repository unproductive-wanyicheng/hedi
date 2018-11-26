//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    id: null,
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
    const dotype = parseInt(e.currentTarget.dataset.dotype)
    this.setData({
      dotype: dotype
    })
  },
  confirm: function () {
    const _this = this
    const monitorId = app.globalData.defaultMonitor.Id
    const id = _this.data.id
    const dotype = _this.data.dotype
    const data = {
      Reason: '',
      HandlerType: '',
      UserIds: []
    }
    app.globalData.fetch({
      url: `sk/mobile/dowarning/${monitorId}/warningid/${id}/dotype/${dotype}`,
      method: 'POST',
      data: data,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
      }
    })
    // wx.showToast({
    //   title: '提交成功',
    //   icon: 'success',
    //   duration: 1000
    // })
    // let _this = wx
    // setTimeout(function() {
    //   _this.switchTab({
    //     url: '/pages/warning/warning'
    //   })
    // }, 1000)
  }
})
