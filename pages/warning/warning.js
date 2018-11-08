//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    warningInfo: null,
    warningList: null,
    allPage: 0,
    timeActive: 0,
    timeList: ['今天', '一周', '一月'],
    showPicker: false,
    date: '2018/05/06',
    startDate: '2018/05/05',
    endDate: '2018/05/06',
    typeActive: 'start',
    asycDownNums: 0,
    asycMaxNums: 2,
    activeType: 0, // 0, 1, 2, 3
    activeDate: 0,
    activeTimeStart: '2018-11-8',
    activeTimeEnd: '2018-11-8',
    nowPage: 1
  },
  onLoad: function () {
    this.getWarningInfo()
    this.getWarningList()
  },
  closeLoading: function () {
    if (this.data.asycDownNums === this.data.asycMaxNums) {
      wx.hideLoading()
    }
  },
  getWarningInfo: function () {
    const id = app.globalData.defaultMonitor.Id
    const _this = this
    app.globalData.fetch({
      url: `sk/mobile/getwarningstaticinfo/${id}`,
      cb: (res) => {
        console.log(res)
        if (res.data.Result) {
           _this.setData({
            warningInfo: res.data.Result
          })
          _this.setData({
            asycDownNums: ++_this.data.asycDownNums
          })
          _this.closeLoading()
        }
      }
    })
  },
  getWarningList: function (params) {
    const _this = this
    const id = app.globalData.defaultMonitor.Id
    const warningtype = _this.data.activeType
    const starttime = _this.data.activeTimeStart
    const endtime = _this.data.activeTimeEnd
    const nowPage = _this.data.nowPage
    app.globalData.fetch({
      url: `sk/mobile/getwarninginfo/${id}/warningtype/${warningtype}/starttime/${starttime}/endtime/${endtime}/nowPage/${nowPage}`,
      cb: (res) => {
        console.log(res)
        if (res.data.Result) {
           _this.setData({
            warningList: res.data.Result.DataList,
            allPage: res.data.Result.AllPage
          })
          _this.setData({
            asycDownNums: ++_this.data.asycDownNums
          })
          _this.closeLoading()
        }
      }
    })
  },
  goWarningDetail: function () {
    wx.navigateTo({
      url: '/pages/warning-detail/warning-detail'
    })
  },
  selectTime: function (e) {
    const index = parseInt(e.target.dataset.index)
    this.setData({
      timeActive: index
    })
  },
  togglePicker: function (e) {
    const type = e.target.dataset.type
    this.setData({
      showPicker: !this.data.showPicker,
      typeActive: type
    })
  },
  bindcancel: function () {
    this.setData({
      showPicker: !this.data.showPicker
    })
  },
  bindDateChange: function (e) {
    console.log(e)
    let date = e.detail.value
    let subStr= new RegExp('-', 'g');//创建正则表达式对象
    let result = date.replace(subStr,"/");//把'is'替换为空字符串
    if(this.data.typeActive === 'start') {
      this.setData({
        startDate: result,
        date: result
      })
    }else{
      this.setData({
        endDate: result,
        date: result
      })
    }
    this.setData({
      showPicker: !this.data.showPicker,
    })
  }
})
