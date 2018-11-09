import * as echarts from '../../ec-canvas/echarts'
const app = getApp()

let chart = null

function initChart(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
    title: {
      text: '历史数据分析(mm)',
      left: 'center',
      top: 10,
      textStyle: {
        color: "#000",
        fontSize: 12
      }
    },
    grid: {
      left: 40,
      right: 40,
      bottom: 40,
      top: 60,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['22:00','22:00', '22:00', '22:00',  '23:00','23:00', '23:00', '23:00',  '5月6日', '5月6日', '5月6日', '5月6日', '01:00','01:00', '01:00', '01:00',  '02:00','02:00', '02:00', '02:00' , '03:00','03:00', '03:00', '03:00',  '04:00','04:00', '04:00','04:00'],
      axisLine: {
        lineStyle: {
          color: "#CBCBCB"
        },
      },
      axisLabel: {
        align: 'center',
        interval: 3,
        color: '#000',
        fontSize: 10
      }
      // show: false
    },
    yAxis: [
      {
        x: 'center',
        type: 'value',
        min: function(value) {
          return value.min - 10
        },
        max: function(value) {
          return value.max
        },
        axisLine: {
          lineStyle: {
            color: "#CBCBCB"
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          },
          show: false
        },
        minInterval: 1,
        axisLabel: {
          color: '#000',
          fontSize: 10
        }
      }
    ],
    visualMap: {
      show: false,
        pieces: [
        {
            gt: 0,
            lte: 55,
            color: '#FF5890'
        },
        {
            gt: 55,
            color: '#0071FF'
        }]
      },
    series: [{
      name: '水平位移(mm)',
      type: 'line',
      symbol:'none',
      smooth: true,
      markLine: {
        symbol: ['none', 'none'],
        label: {
          show: false
        },
        lineStyle: {
            color: '#FF9900',
            type: 'solid'
        },  
        data: [
          {
            name: 'Y 轴值为 55 的水平线',
            yAxis: 55
        },
        ]
      },
      
      areaStyle: {
        color: {
          type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0, color: '#C68874' // 0% 处的颜色
        }, {
            offset: 1, color: '#C76D89' // 100% 处的颜色
        }],
        }
      },
      lineStyle: {
        normal: {
          width: 1,
        }
      },
      data: [10, 20,10, 20, 40,20,40,20, 60,40,50,40, 40,20,40,20, 20,10,20,30, 10,20,40,20,50, 40]
    }]
  };

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    id: null,
    ec_1: {
      onInit: initChart
    },
    warningInfo: null,
    gnssData: null,
    anData: null,
    asycDownNums: 0,
    asycMaxNums: 2
  },
  onLoad: function (e) {
    this.setData({
      id: e.id
    })
  },
  closeLoading: function () {
    if (this.data.asycDownNums === this.data.asycMaxNums) {
      wx.hideLoading()
    }
  },
  onShow: function () {
    this.getMainInfo()
  },
  getMainInfo: function () {
    const _this = this
    const monitorId = app.globalData.defaultMonitor.Id
    const id = _this.data.id
    app.globalData.fetch({
      url: `sk/mobile/getwarningdetailinfo/${monitorId}/warninid/${id}`,
      cb: (res) => {
        console.log(res)
        _this.setData({
          warningInfo: res.data.Result.WarniBaseInfo,
          gnssData: res.data.Result.GnssData,
          anData: res.data.Result.AnData,
        })
        wx.setNavigationBarTitle({
          title: res.data.Result.WarniBaseInfo.PointName
        })
        _this.setData({
          asycDownNums: ++_this.data.asycDownNums
        })
        _this.closeLoading()
      }
    })
  },
  takeWarning: function () {
    wx.navigateTo({
      url: '/pages/take-warning/take-warning'
    })
  },
  back: function () {
    wx.navigateBack()
  }
})
