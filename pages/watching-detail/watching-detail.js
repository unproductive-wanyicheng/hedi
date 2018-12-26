//logs.js
import * as echarts from '../../ec-canvas/echarts'
const util = require('../../utils/util.js')
const app = getApp()

let chart_0 = null
let chart_1 = null
let chart_2 = null

Page({
  data: {
    ec_0: {
      lazyLoad: true
    },
    ec_1: {
      lazyLoad: true
    },
    ec_2: {
      lazyLoad: true
    },
    vrData: {
        "Id":"9452730d-f590-43ab-9905-73a9d98ed46f",
        "Note":"视频监测图片1",
        "PhotoUrl":"http://images.pccoo.cn/bbs/20111110/20111110231732125.jpg",
        "DateTime":"2018-12-26T08:05:15.2771488+08:00",
        "MonitorId":"b1390edb-ea4c-422c-a9fb-fc554b40f812",
        "PointMonitorInfos":[
            {
                "PointId":1,
                "PointType":23,
                "PointName":"水位",
                "CurrentValue":"48mm",
                "Unit":"mm",
                "Data":[
                    {
                        "data":[
                            [
                                145456456456,
                                56.99
                            ],
                            [
                                145456456488,
                                56.99
                            ]
                        ],
                        "name":"水位",
                        "datatype":null
                    }
                ]
            },
            {
                "PointId":2,
                "PointType":24,
                "PointName":"降雨量",
                "CurrentValue":"20mm",
                "Unit":"mm",
                "Data":[
                    {
                        "data":[
                            [
                                145456456456,
                                56.99
                            ],
                            [
                                145456456488,
                                56.99
                            ]
                        ],
                        "name":"降雨量",
                        "datatype":null
                    }
                ]
            },
            {
                "PointId":2,
                "PointType":28,
                "PointName":"渗流",
                "CurrentValue":"20pa",
                "Unit":"pa",
                "Data":[
                    {
                        "data":[
                            [
                                145456456456,
                                56.99
                            ],
                            [
                                145456456488,
                                56.99
                            ]
                        ],
                        "name":"渗流",
                        "datatype":null
                    }
                ]
            }
        ]
    }
  },
  onLoad: function (e) {
    this.getData(e.id)
    const _this = this
    app.globalData.setTitle(_this.data.vrData.Note)
  },
  getData: function (photoid) {
    const _this = this
    const id = app.globalData.defaultMonitor.Id
    const url = `reach/mobile/monitorobjects/videophotodetail/${id}/photoid/${photoid}`
    app.globalData.fetch({
      url: url,
      cb: (res) => {
        console.log(res)
        
      }
    })
  }
})
