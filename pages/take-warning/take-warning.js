//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    id: null,
    dotype: -1,
    choosenName: '',
    userInfo: null,
    reason: ''
  },
  onLoad: function (e) {
    this.setData({
      id: e.id
    })
  },
  onShow: function () {
    const userInfo = app.globalData.choosenUser
    console.log(userInfo)
    if (userInfo) {
      this.setData({
        dotype: 1,
        userInfo: userInfo,
        choosenName: userInfo.USER_INFO_NICKNAME
      })
    }
  },
  chooseActive: function (e) {
    const dotype = parseInt(e.currentTarget.dataset.dotype)
    if (dotype === 1) {
      wx.navigateTo({
        url: '/pages/warning-peo-list/warning-peo-list'
      })
    } else {
      this.setData({
        dotype: dotype
      })
    }
  },
  inputValue: function (e) {
    this.setData({
      reason: e.detail.value
    })
  },
  confirm: function () {
    const _this = this
    if (_this.data.dotype === -1) {
      return false
    }
    const monitorId = app.globalData.defaultMonitor.Id
    const id = _this.data.id
    const dotype = _this.data.dotype
    const data = {
      Reason: _this.data.reason,
      HandlerType: _this.data.dotype,
      UserIds: []
    }
    data.UserIds.push(_this.data.userInfo.DEPT_INFO_ID)
    app.globalData.fetch({
      url: `reach/mobile/dowarning/${monitorId}/warningid/${id}/dotype/${dotype}`, 
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
