//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    id: null,
    dotype: 1
  },
  onLoad: function (e) {
    this.setData({
      id: e.id
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
