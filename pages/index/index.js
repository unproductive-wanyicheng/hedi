//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

import * as echarts from '../../ec-canvas/echarts'
let chart_4 = null

Page({
  data: {
    showPage: false,
    monitorInfo: null,
    mainMonitorInfo: {
      Status: 0,
      BadGoodCount: 1,
      AllPointCount: 100,
      GoodCount: 1,
      GoodRatio: 80,
      SampleRate : 0,
      WindowPointTypeOverviewRealContent: []
    },
    showModal: false,
    ec_4: {
      lazyLoad: true
      // onInit: initChart_4
    },
    rainleveldata: [],
    waterleveldata: [],
    asycDownNums: 0,
    asycMaxNums: 2,
    allPage: 1,
    nowPage: 1,
    warningInfo: null,
    baseCard: null,
    mapParams: {
      averageLongitude: 0,
      averageLatitude: 0,
      markers: [],
      polyline: [],
      scale: 15
    },
    ratio: 0,
    timeCaller: null,
    touch: {
      x: 0,
      y: 0
    },
    allowTouch: true,
    swiperList:[],
    current: 0
  },
  onShow: function () {
    if (!app.globalData.defaultMonitor) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
    else{
      app.globalData.setTitle()
      this.getMainInfo()
      this.getWarningInfo()
    }
    
  },
  onHide: function () {
    console.log('hide')
    if (this.data.timeCaller) {
      clearTimeout(this.data.timeCaller)
      this.setData({
        timeCaller: null
      })
    }
  },
  onUnload: function () {
    console.log('hide')
    if (this.data.timeCaller) {
      clearTimeout(this.data.timeCaller)
      this.setData({
        timeCaller: null
      })
    }
  },
  getMainInfo: function (params) {
    const id = app.globalData.defaultMonitor.Id
    const _this = this
    app.globalData.fetch({
      url: 'reach/mobile/getmonitorobjectinfo/' + id,
      noLoading: params ? params.noLoading ? params.noLoading : false : false,
      closeLoading: params ? true : false,
      cb: (res) => {
        console.log(res)
        const ratio = parseFloat(res.data.Result.SensorStatus.GoodCount/res.data.Result.SensorStatus.AllPointCount).toFixed(2)*100
        _this.setData({
          monitorInfo: res.data.Result,
          'mainMonitorInfo.Status': res.data.Result.Warning.Status,
          'mainMonitorInfo.BadGoodCount': res.data.Result.SensorStatus.BadGoodCount,
          'mainMonitorInfo.AllPointCount': res.data.Result.SensorStatus.AllPointCount,
          'mainMonitorInfo.GoodCount': res.data.Result.SensorStatus.GoodCount,
          'mainMonitorInfo.GoodRatio': ratio,
          ratio: ratio,
          'SampleRate': res.data.Result.SampleRate,
          'mainMonitorInfo.WindowPointTypeOverviewRealContent': res.data.Result.WindowPointTypeOverviewRealContent
        })
        !_this.data.showModal && _this.initChart_4(res.data.Result.SampleRate)
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
        const timeCaller = setTimeout(()=>{
          _this.getMainInfo({noLoading: true, closeLoading: true})
        }, 60000)
        _this.setData({
          timeCaller: timeCaller
        })
      }
    })
  },
  getWarningInfo: function (params) {
    const id = app.globalData.defaultMonitor.Id
    const _this = this
    const warningtype = 0
    const nowPage = params ? params.nowPage : _this.data.nowPage
    const swiperType = params ? params.swiperType : 'init'
    const pageCount = 1
    const url = `reach/mobile/getwarninginfobypagecount/${id}/warningtype/${warningtype}/nowPage/${nowPage}/pageCount/${pageCount}`
    wx.showLoading({title: '加载中...',mask: true})
    app.globalData.fetch({
      url: url,
      closeLoading: params ? true : false,
      cb: (res) => {
        console.log(res)
        const data = res.data.Result
        _this.setData({
          allPage: data.AllCount,
          nowPage: data.NowPage,
          warningInfo: data.DataList.length ? data.DataList[0] : null
        })
        if (_this.data.warningInfo) {
          _this.data.warningInfo.DateTime = _this.data.warningInfo.DateTime.replace('T', ' ')
          _this.setData({
            warningInfo: _this.data.warningInfo
          })
          _this.updateSwiperList({swiperType: swiperType})
        }
        _this.setData({
          allowTouch: true,
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
    })
  },
  closeLoading: function () {
    if (this.data.asycDownNums === this.data.asycMaxNums) {
      wx.hideLoading()
      this.setData({
        asycDownNums: 0
      })
    }
  },
  getmonitorobjectbaseinfo: function (params) {
    const id = params.Id
    const _this = this
    app.globalData.fetch({
      url: `reach/mobile/getmonitorobjectbaseinfo/${id}`,
      cb: (res) => {
        console.log(res)
        
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
    })
  },
  initChart_4: function (ratio) {
    const _this = this
    _this.echartsComponnet4 = _this.selectComponent('#mychart-dom-bar-4')
    _this.echartsComponnet4.init((canvas, width, height) => {
      chart_4 = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(chart_4);

      var option = {
        color:['#FF9900', '#0076FF'],
        series: [{
          name: '成功率',
          type: 'pie',
          center: ['50%', '50%'], // 饼图的圆心坐标
          radius: ['80%', '100%'],
          avoidLabelOverlap: false,
          hoverAnimation: false,
          legendHoverLink: false,
          avoidLabelOverlap: false,
          silent: true,
          label: { //  饼图图形上的文本标签
              normal: { // normal 是图形在默认状态下的样式
                  show: false,
                  position: 'center',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  formatter: `${ratio}%` // {b}:数据名； {c}：数据值； {d}：百分比
              }
          },
          data: [
              {
                  value: 100 - ratio,
                  name: 1,
                  label: {
                      normal: {
                          show: true
                      }
                  }
              },
              {
                  value: ratio,
                  name: 2,
                  label: {

                      normal: {
                      show: false
                      }
                  }
              }
            ]
        }]
      };

      chart_4.setOption(option)
      return chart_4
    })
  },
  showModal: function () {
  	// console.log('...')
  	this.setData({
  		showModal: !this.data.showModal
  	})
    if (!this.data.showModal) {
      this.initChart_4(this.data.ratio)
    }
    if (!this.data.showModal) {
      return false
    }
    const id = app.globalData.defaultMonitor.Id
    const _this = this
    const url = `reach/mobile/getmonitorobjectbaseinfo/${id}`
    wx.showLoading({title: '加载中...',mask: true})
    app.globalData.fetch({
      url: url,
      closeLoading: true,
      cb: (res) => {
        console.log(res)
        const data = res.data.Result
        _this.setData({
          baseCard: data
        })
        _this.updateMap()
      }
    })
  },
  updateMap: function () {
    let array = []
    let aveLon = 0
    let aveLau = 0
    const rangeL = this.data.baseCard.MapRangeData.length
    const pointL = this.data.baseCard.Points.length
    if (!rangeL || !pointL) {
      return false
    }
    this.data.baseCard.Points.map((item, index) => {
      const params = {
        iconPath: '../../assets/imgs/map-location.png',
        id: index,
        latitude: parseFloat(item.MapY),
        longitude: parseFloat(item.MapX),
        width: 15,
        height: 20,
        callout: {
          content: item.Name,
          bgColor: '#000',
          color: '#fff',
          display: 'ALWAYS',
          textAlign: 'center',
          padding: 5
        }
      }
      array.push(params)
    })

    const pointLineArray = []
    this.data.baseCard.MapRangeData.map((item, index) => {
      aveLon += parseFloat(item[0]) / rangeL
      aveLau += parseFloat(item[1]) / rangeL
      pointLineArray.push({
        longitude: item[0],
        latitude: item[1]
      })
    })

    this.setData({
      ['mapParams.markers']: array,
      ['mapParams.averageLatitude']: aveLau,
      ['mapParams.averageLongitude']: aveLon,
      ['mapParams.polyline']: [{
        points: pointLineArray,
        color:"#FF0000DD",
        width: 2,
        dottedLine: true
      }]
    })
  },
  goSpDetail: function (e) {
    wx.switchTab({
      url: '/pages/info-choose/info-choose'
    })
  },
  selectMonitor: function (e) {
    wx.redirectTo({
      url: '/pages/map/map'
    })
  },
  onShareAppMessage: function (res) {
    var pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return {
      title: '及时掌握河流汛情，堤坝位移和沿河水质监测，保障堤内居民和工农业生产安全',
      path: currentPage.route ,
    }
  },
  updateSwiperList: function (params) {
    const { swiperType } = params
    if (swiperType === 'init') {
      const swiperList = []
      for (let i = 0; i < this.data.allPage; i++) {
        swiperList.push(this.data.warningInfo)
      }
      this.setData({
        swiperList: swiperList
      })
    } else {
      this.setData({
        [`swiperList[${this.data.current}]`]: this.data.warningInfo
      })
    }
    
  },
  updateWarningInfo: function (params) {
    const {turn, swiperType} = params
    if (!turn) {
      return false
    }
    let nowPage = this.data.nowPage
    if (turn === 'left') {
      nowPage += 1
      if (nowPage > this.data.allPage) {
        return false
      }
    } else {
      nowPage -= 1
      if (nowPage <= 0) {
        return false
      }
    }
    this.setData({
      allowTouch: false
    })
    this.getWarningInfo({
      nowPage: nowPage,
      swiperType: swiperType
    })
  },
  touchStart: function (e) {
    this.setData({
      "touch.x": e.changedTouches[0].clientX,
      "touch.y": e.changedTouches[0].clientY
    })
  },
  touchEnd: function (e) {
    let x = e.changedTouches[0].clientX
    let y = e.changedTouches[0].clientY
    const turn = this.getTouchData(x, y, this.data.touch.x, this.data.touch.y)
    this.updateWarningInfo(turn)
  },
  getTouchData: function (endX, endY, startX, startY) {
    let turn = ""
    if (endX - startX > 50 && Math.abs(endY - startY) < 50) {      //右滑
      turn = "right"
    } else if (endX - startX < -50 && Math.abs(endY - startY) < 50) {   //左滑
      turn = "left"
    }
    return turn
  },
  changePage: function (e) {
    const currentChange = e.detail.current - this.data.current
    if (currentChange === 1) {
      this.updateWarningInfo({
        turn: 'left',
        swiperType: 'update'
      })
    } else {
      this.updateWarningInfo({
        turn: 'right',
        swiperType: 'update'
      })
    }
    this.setData({
      current: e.detail.current
    })
  }
})
