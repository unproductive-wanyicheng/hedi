//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    allPage: 1,
    timeActive: 0,
    timeList: ['24小时', '三天', '一周'],
    activeType: 0, // 0, 1, 2, 3
    activeDate: 0,
    activeTimeStart: '2018-11-8',
    activeTimeEnd: '2018-11-8',
    nowPage: 1,
    vrData:[]
  },
  onLoad: function () {
    
  },
  onShow: function () {
    this.getWarningList({})
  },
  getWarningList: function (params) {
    const _this = this
    const { type = 'init', nowPage = 1, closeLoading = true } = params

    if (nowPage > _this.data.allPage) {
      return false
    }
    _this.setData({
      nowPage: nowPage
    })

    const id = app.globalData.defaultMonitor.Id
    const starttime = _this.data.activeTimeStart
    const endtime = _this.data.activeTimeEnd
    const page = _this.data.nowPage
    const showType = _this.data.timeActive
    const pointId = 0
      
    app.globalData.fetch({
      url: `reach/mobile/videoimagelist/${id}/showtype/${showType}/starttime/${starttime}/endtime/${endtime}/nowPage/${page}/pointid/${pointId}`,
      closeLoading: closeLoading,
      cb: (res) => {
        console.log(res)
        
        if (res.data.Result && res.data.Result.DataList.length) {
           const array = type === 'init' ?  res.data.Result.DataList : _this.data.vrData.concat(res.data.Result.DataList)
           _this.setData({
            vrData: array,
            allPage: res.data.Result.AllPage
          })
        }
        if (!res.data.Result.DataList.length) {
            wx.showToast({
              title: '当前选择区间暂无数据',
              icon: 'none',
              duration: 1500
            })
          }
        _this.timeFormat(_this.data.vrData)
      }
    })
  },
  goWatchingDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/watching-detail/watching-detail?id=' + id
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
  },
  timeFormat: function(list) {
    list.map((item, index)=>{
      item.DateTime = item.DateTime.split('.')[0].replace("T", " ")
    })
    this.setData({
      vrData: list
    })
  }
})
