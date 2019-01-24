//app.js
App({
  onLaunch: function () {
    
  },
  globalData: {
  	debug: true,
  	loginInfo: null,
    userInfo: null,
    monitorsChooseList: [],
    monitorList: null,
    defaultMonitor: null,
    choosenUserList: [],
    refreshPage: false,
    socketOpen: false,
    canLogin: true,
  	doLogin: function (params) {
  		const _this = this
  		const tokenCb = function (res, params) {
  			const { token } = res
  			const {account, password, cb} = params
  			const url = 'reach/Api/Account/mlogin'
  			const data = {
  				UserName: account,
  				PassWord: password
  			}
  			_this.fetch({
  				url: url,
  				data: data,
  				method: 'POST',
  				closeLoading: true,
  				cb: cb,
  				successCode: 200,
  				successMessage: '登录成功',
  				waitClose: true
  			})
  		}
  		wx.showLoading({title: '加载中...',mask: true})
  		_this.getToken({
  			cbParams: params,
  			tokenCb: tokenCb
  		})
  	},
  	fetch: function (params) {
  		const fetchCb = function (res, originParams) {
  			const baseUrl = 'https://mapi.aeroiot.cn/'
  			const { access_token, token_type } = res
  			const { url, query = '', data = null, cb, method = 'GET',successMessage = '', successCode = 200, closeLoading = false, noLoading = false, waitClose = false } = originParams
  			!noLoading && wx.showLoading({title: '加载中...',mask: true})
  			wx.request({
		      url: baseUrl + url + query,
		      data: data,
		      header: {
		        'content-type': 'application/json', // 默认值
		        'Authorization': token_type + ' ' + access_token
		      },
		      method : method,
		      success (res) {
		      	if (!res) {
		      		wx.showToast({
							  title: '后台数据报错',
							  icon: 'none',
							  duration: 3000
							})
							return false
		      	}
		      	if (res.data.Code === 401) {
							wx.removeStorageSync('__HEDI_LOGIN_INFO__')
							wx.removeStorageSync('__HEDI_USER_INFO__')
							wx.showToast({
							  title: res.data.Message,
							  icon: 'none',
							  duration: 2000
							})
							setTimeout(()=>{
								wx.redirectTo({
									url: '/pages/login/login'
								})
							}, 2000)
		      	}
		      	if (res && res.data) {
		      		const { Code, Message = '后台数据报错' } = res.data
		      		if (Code !== successCode) {
		      			wx.showToast({
								  title: Message,
								  icon: 'none',
								  duration: 3000
								})
								setTimeout(()=>{
				      		closeLoading && wx.hideLoading()
				      	}, 3000)
		      		} else {
		      			successMessage.length && wx.showToast({
								  title: successMessage,
								  icon: 'none',
								  duration: 2000
								})
								cb & cb(res)
								setTimeout(()=>{
				      		closeLoading && wx.hideLoading()
				      	}, waitClose ? 2000 : 0)
		      		}
		      	}
		      },
		      complete: function (res) {
		      	
		      }
		    })
  		}
  		this.getToken({
  			cbParams: params,
  			tokenCb: fetchCb
  		})
  	},
  	getUserInfo: function () {
  		const userInfo = wx.getStorageSync('__HEDI_USER_INFO__')
  		if (userInfo) {
  			return userInfo
  		} else {
  			wx.navigateTo({
          url: '/pages/login/login'
        })
  		}
  	},
  	getToken: function (params) {
  		const _this = this
	  	const url = 'https://sso.aeroiot.cn/Token'
	  	const loginInfo = wx.getStorageSync('__HEDI_LOGIN_INFO__')
	  	let query = null
	  	if (!loginInfo) {
		    query = 'grant_type=client_credentials&scope=app&client_id=8&client_secret=0d8e486d45694940a43735acd05b682a'
		    wx.request({
		      url: url,
		      data: query,
		      header: {
		        'content-type': 'application/x-www-form-urlencoded' // 默认值
		      },
		      method : 'POST',
		      success (res) {
		      	if (res && res.data) {
		      		console.log(res)
			      	const expires = {
			      		expires: new Date().getTime()
			      	}
			        _this.loginInfo = Object.assign({}, res.data, expires)
			        wx.setStorageSync('__HEDI_LOGIN_INFO__', _this.loginInfo)
			      	_this.getToken(params)
		      	} else {
		      		wx.showToast({
							  title: 'token获取失败',
							  icon: 'none',
							  duration: 3000
							})
		      	}
		      }
		    })
	  	} else {
		  	const { access_token, expires_in, refresh_token, token_type, expires } = loginInfo
		  	const nowTime = new Date().getTime()
		  	if (!access_token) {
		  		wx.showToast({
					  title: 'token获取失败',
					  icon: 'none',
					  duration: 3000
					})
					return false
		  	}
		  	if (nowTime >= expires_in*1000 + expires) {
		    	// query = `grant_type=refresh_token&refresh_token=${refresh_token}&client_id=8&client_secret=0d8e486d45694940a43735acd05b682a`
		    	query = {
		    		grant_type: 'refresh_token',
		    		refresh_token: refresh_token,
		    		client_id: 8,
		    		client_secret: '0d8e486d45694940a43735acd05b682a'
		    	}
		    	wx.request({
			      url: url,
			      data: query,
			      header: {
			        'content-type': 'application/x-www-form-urlencoded' // 默认值
			      },
			      method : 'POST',
			      success (res) {
			      	console.log(res)
			      	if (res && res.data && res.data.access_token) {
			      		const expires = {
				      		expires: new Date().getTime()
				      	}
				        _this.loginInfo = Object.assign({}, res.data, expires)
			        	wx.setStorageSync('__HEDI_LOGIN_INFO__', _this.loginInfo)
				      	_this.getToken(params)
			      	} else {
			     //  		wx.showToast({
								//   title: 'token刷新失败',
								//   icon: 'none',
								//   duration: 1500
								// })
								wx.removeStorageSync('__HEDI_LOGIN_INFO__')
								_this.getToken(params)
			      	}
			      }
			    })
		  	} else {
		  		const { cbParams, tokenCb } = params
		  		tokenCb(loginInfo, cbParams)
		  	}
	  	}
	  },
	  setTitle: function (title) {
	  	const _this = this
	  	if ( title || _this.defaultMonitor) {
	  		wx.setNavigationBarTitle({
		      title: title ? title : _this.defaultMonitor ? _this.defaultMonitor.Name : '河堤小程序'
		    })
	  	}
	  }
  }
})