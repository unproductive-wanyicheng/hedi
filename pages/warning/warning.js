//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    warningInfo: null,
    warningList: null,
    allPage: 1,
    timeActive: 0,
    timeList: ['今天', '一周', '一月'],
    asycDownNums: 0,
    asycMaxNums: 2,
    activeType: 0, // 0, 1, 2, 3
    activeDate: 0,
    activeTimeStart: '2018-11-8',
    activeTimeEnd: '2018-11-8',
    nowPage: 1
  },
  onLoad: function () {
    this.resetTime()
    this.getWarningInfo()
    this.getWarningList({})
  },
  onShow: function () {
    if (app.globalData.refreshPage) {
      this.getWarningInfo()
      this.getWarningList({})
      app.globalData.refreshPage = false
    }
  },
  resetTime: function () {
    let date = util.formatTime(new Date(), 'yyyy-MM-dd')
    this.setData({
      timeActive: 0,
      activeTimeStart: date,
      activeTimeEnd: date
    })
  },
  closeLoading: function () {
    if (this.data.asycDownNums === this.data.asycMaxNums) {
      this.setData({
        asycDownNums: 0
      })
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
    const { type = 'init', nowPage = 1, closeLoading = false } = params

    if (nowPage > _this.data.allPage) {
      return false
    }
    _this.setData({
      nowPage: nowPage
    })

    const id = app.globalData.defaultMonitor.Id
    const warningtype = _this.data.activeType
    const starttime = _this.data.activeTimeStart
    const endtime = _this.data.activeTimeEnd
    const page = _this.data.nowPage
    app.globalData.fetch({
      url: `sk/mobile/getwarninginfo/${id}/warningtype/${warningtype}/starttime/${starttime}/endtime/${endtime}/nowPage/${page}`,
      cb: (res) => {
        console.log(res)
        if (res.data.Result) {
           const array = type === 'init' ?  res.data.Result.DataList : _this.data.warningList.concat(res.data.Result.DataList)
           _this.setData({
            warningList: array,
            allPage: res.data.Result.AllPage
          })
          _this.setData({
            asycDownNums: ++_this.data.asycDownNums
          })
          _this.closeLoading()
          if (nowPage > 1 || closeLoading) {
            wx.hideLoading()
          }
          if (!_this.data.warningList.length) {
            wx.showToast({
              title: '当前选择区间暂无数据',
              icon: 'none',
              duration: 1500
            })
          }
        }
      }
    })
  },
  goWarningDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/warning-detail/warning-detail?id=' + id
    })
  },
  selectTime: function (e) {
    const index = parseInt(e.target.dataset.index)
    if (index === this.data.timeActive) {
      return false
    }
    let preTime = 0
    if (index === 1) {
      preTime = 7 * 24 * 60 * 60 * 1000
    }
    if (index === 2) {
      preTime = 30 * 24 * 60 * 60 * 1000
    }
    let startDate = util.formatTime(new Date(new Date() - preTime) , 'yyyy-MM-dd')
    let endDate = util.formatTime(new Date(), 'yyyy-MM-dd')
    this.setData({
      timeActive: index,
      activeTimeStart: startDate,
      activeTimeEnd: endDate
    })
    this.getWarningList({closeLoading: true})    
  },
  bindcancel: function () {
    this.setData({
      showPicker: !this.data.showPicker
    })
  },
  lower: function () {
    this.getWarningList({
      type: 'update',
      nowPage: ++this.data.nowPage
    })
  },
  bindDateChange: function (e) {
    const type = e.currentTarget.dataset.type
    const date = e.detail.value
    // let subStr= new RegExp('-', 'g');//创建正则表达式对象
    // let result = date.replace(subStr,"/");//把'is'替换为空字符串
    if(type === 'start') {
      if (date === this.data.activeTimeStart) {
        return false
      }
      this.setData({
        activeTimeStart: date
      })
    }else{
      if (date === this.data.activeTimeEnd) {
        return false
      }
      this.setData({
        activeTimeEnd: date
      })
    }
    this.getWarningList({closeLoading: true})
  },
  chooseActiveType: function (e) {
    const type = parseInt(e.currentTarget.dataset.type)
    if (type === this.data.activeType) {
      return false
    }
    this.setData({
      activeType: type
    })
    this.getWarningList({
      closeLoading: true
    })
  }
})
