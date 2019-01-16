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
    const _this = this
    wx.showLoading({title: '加载中...',mask: true})
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
        const mapList = []
        data.map((item, index) => {
          let is_choose = false 
          app.globalData.choosenUserList.forEach((data) => {
            if (data.info.DEPT_INFO_ID === item.DEPT_INFO_ID && data.info.USER_INFO_NICKNAME === item.USER_INFO_NICKNAME) {
              is_choose = true
            }
          })
          mapList.push({
            info: item,
            choose: is_choose ? true : false
          })
        })
        _this.setData({
          peoList: mapList
        })
      }
    })
  },
  chooseActive: function (e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      [`peoList[${index}].choose`]: !this.data.peoList[index].choose
    })
  },
  confirm: function () {
    app.globalData.choosenUserList = []
    this.data.peoList.forEach((item, index) => {
      item.choose && app.globalData.choosenUserList.push(this.data.peoList[index])
    })
    wx.navigateBack()
  }
})
