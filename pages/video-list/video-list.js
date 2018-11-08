Page({
  data: {
    videoList: [
      {
        url: '../../assets/video/test.mp4',
        thumbnail: '../../assets/video/1.png',
        title: '北桥头'
      },
      {
        url: '../../assets/video/test.mp4',
        thumbnail: '../../assets/video/2.png',
        title: '南桥头'
      },
      {
        url: '../../assets/video/test.mp4',
        thumbnail: '../../assets/video/3.png',
        title: '桥头十字路口A'
      },
      {
        url: '../../assets/video/test.mp4',
        thumbnail: '../../assets/video/1.png',
        title: '桥头十字路口B'
      }
    ]
  },
  onLoad: function () {
    
  },
  goFullScreen: function (e) {
    const index = parseInt(e.currentTarget.dataset.index)
    wx.navigateTo({
      url: '/pages/video-detail/video-detail?title=' + this.data.videoList[index].title
    })
  }
})
