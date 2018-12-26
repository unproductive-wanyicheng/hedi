//logs.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    warningInfo: null,
    warningList: null,
    allPage: 1,
    timeActive: 0,
    timeList: ['1小时', '一天', '一周'],
    asycDownNums: 0,
    asycMaxNums: 2,
    activeType: 0, // 0, 1, 2, 3
    activeDate: 0,
    activeTimeStart: '2018-11-8',
    activeTimeEnd: '2018-11-8',
    nowPage: 1,
    vrData:[
      {
            "Id":"9ad04843-4b17-460f-a244-9bd61ded55a0",//照片Id
            "Note":"视频监测图片1",
            "PhotoUrl":"http://www.chinairn.com/UserFiles/image/20170727/20170727094140_4541.jpeg",
            "DateTime":"2018-12-26T08:02:48.5534954+08:00",
            "MonitorId":"d4a168a1-c485-4a1a-af6b-87d0aa9bcfd5",//监测物id
            "PointMonitorInfos":[
                {
                    "PointId":1,
                    "PointType":23,
                    "PointName":"水位",
                    "CurrentValue":"48mm",
                    "Unit":null,
                    "Data":null
                },
                {
                    "PointId":2,
                    "PointType":24,
                    "PointName":"降雨量",
                    "CurrentValue":"20mm",
                    "Unit":null,
                    "Data":null
                },
                {
                    "PointId":2,
                    "PointType":28,
                    "PointName":"渗流",
                    "CurrentValue":"20pa",
                    "Unit":null,
                    "Data":null
                }
            ]
        },
        {
            "Id":"78a364e4-2c6b-474d-bfd0-48ac46f90b4f",
            "Note":"视频监测图片2",
            "PhotoUrl":"http://images.pccoo.cn/bbs/20111110/20111110231732125.jpg",
            "DateTime":"2018-12-26T09:02:48.5544924+08:00",
            "MonitorId":"5af362e3-5c88-4eab-9035-449342bd3ea5",
            "PointMonitorInfos":[
                {
                    "PointId":1,
                    "PointType":23,
                    "PointName":"水位",
                    "CurrentValue":"48mm",
                    "Unit":null,
                    "Data":null
                },
                {
                    "PointId":2,
                    "PointType":24,
                    "PointName":"降雨量",
                    "CurrentValue":"20mm",
                    "Unit":null,
                    "Data":null
                },
                {
                    "PointId":2,
                    "PointType":28,
                    "PointName":"渗流",
                    "CurrentValue":"20pa",
                    "Unit":null,
                    "Data":null
                }
            ]
        },
        {
            "Id":"77f299fe-f784-4218-a848-7fb7359591b8",
            "Note":"视频监测图片3",
            "PhotoUrl":"https://img.pconline.com.cn/images/upload/upc/tx/photoblog/1206/18/c11/12051116_12051116_1340030473921_mthumb.jpg",
            "DateTime":"2018-12-26T10:02:48.5544924+08:00",
            "MonitorId":"6a8e57ca-c077-43f3-b545-c9aa7eea1779",
            "PointMonitorInfos":[
                {
                    "PointId":1,
                    "PointType":23,
                    "PointName":"水位",
                    "CurrentValue":"48mm",
                    "Unit":null,
                    "Data":null
                },
                {
                    "PointId":2,
                    "PointType":24,
                    "PointName":"降雨量",
                    "CurrentValue":"20mm",
                    "Unit":null,
                    "Data":null
                },
                {
                    "PointId":2,
                    "PointType":28,
                    "PointName":"渗流",
                    "CurrentValue":"20pa",
                    "Unit":null,
                    "Data":null
                }
            ]
        },
        {
            "Id":"3bb4bc80-ab3e-41ed-ba9c-a32539151acd",
            "Note":"视频监测图片4",
            "PhotoUrl":"http://photocdn.sohu.com/20120630/Img346934936.jpg",
            "DateTime":"2018-12-26T11:02:48.5544924+08:00",
            "MonitorId":"862e23c5-e943-4322-af25-7d65c73a2045",
            "PointMonitorInfos":[
                {
                    "PointId":1,
                    "PointType":23,
                    "PointName":"水位",
                    "CurrentValue":"48mm",
                    "Unit":null,
                    "Data":null
                },
                {
                    "PointId":2,
                    "PointType":24,
                    "PointName":"降雨量",
                    "CurrentValue":"20mm",
                    "Unit":null,
                    "Data":null
                },
                {
                    "PointId":2,
                    "PointType":28,
                    "PointName":"渗流",
                    "CurrentValue":"20pa",
                    "Unit":null,
                    "Data":null
                }
            ]
        }
    ]
  },
  onLoad: function () {
    this.resetTime()
    this.getWarningInfo()
    this.getWarningList({})
  },
  onShow: function () {
    this.timeFormat(this.data.vrData)
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
      url: `reach/mobile/getwarningstaticinfo/${id}`,
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
    //const warningtype = _this.data.activeType
    const starttime = _this.data.activeTimeStart
    const endtime = _this.data.activeTimeEnd
    const page = _this.data.nowPage
    const showType = _this.data.timeActive
      
    app.globalData.fetch({
      url: `reach/mobile/monitorobjects/videophotolist/${id}/showtype/${showType}/starttime/${starttime}/endtime/${endtime}/nowPage/${page}`,
      cb: (res) => {
        console.log(res)
        // if (res.data.Result) {
        //    const array = type === 'init' ?  res.data.Result.DataList : _this.data.warningList.concat(res.data.Result.DataList)
        //    _this.setData({
        //     warningList: array,
        //     allPage: res.data.Result.AllPage
        //   })
        //   _this.setData({
        //     asycDownNums: ++_this.data.asycDownNums
        //   })
        //   _this.closeLoading()
        //   if (nowPage > 1 || closeLoading) {
        //     wx.hideLoading()
        //   }
        //   if (!_this.data.warningList.length) {
        //     wx.showToast({
        //       title: '当前选择区间暂无数据',
        //       icon: 'none',
        //       duration: 1500
        //     })
        //   }
        // }
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
    console.log(list)
    this.setData({
      vrData: list
    })
  }
})
