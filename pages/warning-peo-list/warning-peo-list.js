//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    choosenUser: null,
    activeIndex: -1,
    peoList: [],
    chooseList: []
  },
  onLoad: function () {
    const _this = this
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
        const mapList = []
        data.map((item, index) => {
          mapList.push({
            choose: false
          })
        })
        _this.setData({
          peoList: data,
          chooseList: mapList
        })
      }
    })
  },
  chooseActive: function (e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      [`chooseList[${index}].choose`]: !this.data.chooseList[index].choose
    })
  },
  confirm: function () {
    this.data.chooseList.forEach((item, index) => {
      item.choose && app.globalData.choosenUserList.push(this.data.peoList[index])
    })
    wx.navigateBack()
  }
})
