//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    id: null,
    dotype: -1,
    choosenName: '',
    userInfoList: null,
    reason: ''
  },
  onLoad: function (e) {
    this.setData({
      id: e.id
    })
  },
  onShow: function () {
    const list = app.globalData.choosenUserList
    if (list && list.length) {
      let name = ''
      list.forEach((item, index) => {
        name += item.info.USER_INFO_NICKNAME + ' '
      })
      this.setData({
        dotype: 1,
        userInfoList: list,
        choosenName: name
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
      wx.showToast({
        title: '请选择提交方式',
        icon: 'none',
        duration: 3000
      })
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
    if(_this.data.userInfoList) {
       _this.data.userInfoList.forEach((item, index) => {
        data.UserIds.push(item.info.DEPT_INFO_ID)
      })
    }
    wx.showLoading({title: '加载中...',mask: true})
    app.globalData.fetch({
      url: `reach/mobile/dowarning/${monitorId}/warninid/${id}/dotype/${dotype}`, 
      method: 'POST',
      data: data,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        if (res.data.Result === true) {
          wx.showToast({
            title: '提交成功',
            icon: 'none',
            duration: 2000
          })
          app.globalData.choosenUserList = []
          app.globalData.refreshPage = true
          setTimeout(()=>{
            wx.switchTab({
              url: '/pages/warning/warning'
            })
          }, 2000)
        } else {
          wx.showToast({
            title: '提交失败',
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  }
})
