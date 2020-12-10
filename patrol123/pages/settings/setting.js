// pages/settings/setting.js
const app = getApp()
const WXAPI = require('../../config');
let pages;//获取当前打开的页面栈，返回为数组，索引顺序为打开的顺序
let prePages;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "title": '',
    "time": "",
    "state": '',
    "busiState":'',
    "isReceiveAdjust":'',
    "id":'',
    'setTab':0,
    'accessToken':'',
    "terminationTime":'',
    "openNum":'0',
    shareUrl:'',
    "todoData":[],
    ifDone:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    app.globalData.groupIds=[];
    self.setData({
      id: options.id,
      accessToken: wx.getStorageSync('accessToken'),
      state: options.state
    });
    self.getList(0);
  },
  getList:function(option){
    let self = this;
    self.setData({
      setTab:option
    })
    if (self.data.state != 2) {
      let data = {
        "id": self.data.id, //巡查单id
        "accessToken": wx.getStorageSync('accessToken')
      }
      WXAPI.request('POST', '/patrol/getPatrolItemList', data, (res) => {
        // console.log(res, "++++++++++","查询总大类的放回结果",res.data);
        if (res.code == 200) {
          self.setData({
            todoData: res.data,
            "title": res.patrol.organName,
            "time": res.patrol.startTime,
            "terminationTime": res.patrol.adjustEndTime,
            "busiState": res.patrol.busiState
          })
        } else if (res.code == 101) {
          wx.navigateTo({
            url: '../login/login'
          });
        } else if (res.code == 400) {
          wx.showModal({
            title: '提示',
            content: res.resMsg,
            showCancel: false
          });
        }
      }, (err) => {
        console.log(err)
      }, () => {
        console.log('next')
      })
    } else {
      let data = {
        "patrolId": self.data.id, //巡查单id
        "accessToken": wx.getStorageSync('accessToken')
      }
      WXAPI.request('POST', '/patrol/getAdjustItemList', data, (res) => {
        // console.log(res, "++++++++++", "待整改结果", res.data);
        if (res.code == 200) {
          self.setData({
            todoData: res.data,
            shareUrl: res.shareUrl,
            title: res.patrol.organName,
            time: res.patrol.startTime,
            terminationTime: res.patrol.adjustEndTime,
            isReceiveAdjust: res.patrol.isReceiveAdjust,
            busiState: res.patrol.busiState
          })
        } else if (res.code == 101) {
          wx.navigateTo({
            url: '../login/login'
          });
        } else if (res.code == 400) {
          wx.showModal({
            title: '提示',
            content: res.resMsg,
            showCancel: false
          });
        }
      }, (err) => {
        console.log(err)
      }, () => {
        console.log('next')
      })
    }      
  },
  handerback: function (e) {
    let self = this;
    
    // console.log(e, "handerback");
    wx.navigateBack({
      delta: 1,  // 返回上一级页面。
      success: function () {
        console.log('成功！')
      }
    })
  },
  handerhome: function () {
    let self = this;
    wx.switchTab({
      url: '../index/index'
    })
  },
  packUp: function (e){
    let self = this;
    let tab = e.currentTarget.dataset.tab,
      ind = e.currentTarget.dataset.index;
    
    if (self.data.setTab == ind) {     
      this.setData({
        ['todoData[' + ind + '].tab']: 1,
         setTab: -1
      })
    } else {
      if (tab == 1) {
        this.setData({
          ['todoData[' + ind + '].tab']: 0

        })
      } else {
        this.setData({
          ['todoData[' + ind + '].tab']: 1

        })
      }
    }
    
    
  },
  // 获取分享链接
  getShare:function(e){
    let self = this;
    // console.log(e.currentTarget.dataset.url,"分享");
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success(res) {
        wx.getClipboardData({
          success(res) {
            return res.data
            // console.log(res.data) // data
          }
        })
      }
    })
  },
  todoList: function (event){
    let self = this;
    // console.log(event);
    let groupCode = event.currentTarget.dataset.id;
    let maxcateid = event.currentTarget.dataset.maxcateid, 
      ind = event.currentTarget.dataset.ind,
      minCateId = event.currentTarget.dataset.mincateid;
    // console.log(ind, "++++++++++++++++++看看是那一组");
    if (self.data.state !=2 ){
      wx.navigateTo({
        url: '../order/order?id=' + self.data.id + "&groupCode=" + groupCode + "&maxcateid=" + maxcateid + "&preIndex=" + ind
      });
      app.globalData.groupIds=[];
      // console.log(self.data.todoData[ind].child, "++++++++++++++++++");
      self.data.todoData[ind].child.forEach(function (value, index, array) {
        // console.log(value, index, array, array[index].groupCode);
        app.globalData.groupIds.push(array[index].groupCode);
      }); 
    } else {
      if (self.data.busiState != 3 ){
        wx.navigateTo({
          url: '../order/order?id=' + self.data.id + "&minCateId=" + minCateId +"&preIndex=" + 0
        });
        app.globalData.groupIds = [];
        // console.log(self.data.todoData[ind].child, "++++++++++++++++++");
        self.data.todoData.forEach(function (value, index, array) {
          // console.log(value, index, array, array[index].groupCode);
          app.globalData.groupIds.push(array[index].minCateId);
        }); 
      }
      
      
    }
    
  },
  
  // 非整改项提交结果

  getSubmit:function(){
    let self = this;
    let data = {
      "patrolId": self.data.id, //巡查单id
      "accessToken": wx.getStorageSync('accessToken')
    }
    WXAPI.request('POST', '/patrol/checkIsCanSubmitEvaluate', data, (res) => {
      // console.log(res, "++++++++++", "待整改结果", res.data);
      if (res.code == 200) {
        self.setData({
          ifDone: true
        })
        wx.navigateTo({
          url: '../setrecord/setrecord?id=' + self.data.id
        });
      } else if (res.code == 101) {
        wx.navigateTo({
          url: '../login/login'
        });
      } else {
        self.setData({
          ifDone: false
        })
        wx.showModal({
          title: '提示',
          content: res.resMsg,
          showCancel: false
        });
      }
    }, (err) => {
      console.log(err)
    }, () => {
      console.log('next')
    })   
    if(self.data.ifDone == true){
      wx.navigateTo({
        url: '../setrecord/setrecord?id=' + self.data.id
      });
    } 
  },
  // 部分整改
  partRect:function(){
    let self = this;
    let data ={
      "patrolId": self.data.id,
      "accessToken": self.data.accessToken
    };
    wx.showModal({
      title: '提示',
      content: '只提交整改部分，未整改部分继续留存整改列表',
      success(res) {
        if (res.confirm) {
          WXAPI.request('POST', '/patrol/submitPatrolSectionAdjust', data, (res) => {
            if (res.code == 200){
              self.getList(0);
              self.goTop();
            } else if(res.code == 101){
              wx.navigateTo({
                url: '../login/login'
              });
            } else {
              wx.showModal({
                title: '提示',
                content: res.resMsg,
                showCancel: false
              });
            }          
          }, (err) => {
            console.log(err)
          }, () => {
            console.log('next');
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })

    
  },
  // 全部整改
  allRect: function () {
    let self = this;
    let data = {
      "patrolId": self.data.id,
      "accessToken": self.data.accessToken
    }
    wx.showModal({
      title: '提示',
      content: '提交后默认该机构完成巡查任务！',
      success(res) {
        if (res.confirm) {
          WXAPI.request('POST', '/patrol/submitPatrolCompleteAdjust', data, (res) => {
            if(res.code == 200){
              self.handerback();
            } else if(res.code == 101){
              wx.navigateTo({
                url: '../login/login'
              });
            } else if (res.code == 400) {
              wx.showModal({
                title: '提示',
                content: res.resMsg,
                showCancel: false
              });
            }
            
          }, (err) => {
            console.log(err)
          }, () => {
            console.log('next');
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
    
  },
  // 查看提交结果
  getCheck:function(){
    let self = this;
    wx.navigateTo({
      url: '../checkRecord/checkRecord?id=' + self.data.id
    });
  },
  // 删除巡查记录
  
  deleteList:function(){
    let self = this;
    let data = {
      "id": self.data.id, //巡查单id
      "accessToken": wx.getStorageSync('accessToken')
    }
    wx.showModal({
      title: '提示',
      content: '确定删除该机构完成巡查任务！',
      success(res) {
        if (res.confirm) {
          WXAPI.request('POST', '/patrol/delPatrolRecord', data, (res) => {
            if (res.code == 200) {
              prePages.getList(0, self.data.accessToken); 
              wx.navigateTo({
                url: '../index/index'
              });
            } else if (res.code == 101) {
              wx.navigateTo({
                url: '../login/login'
              });
            } else {
              wx.showModal({
                title: '提示',
                content: res.resMsg,
                showCancel: false
              });
            }
          }, (err) => {
            console.log(err)
          }, () => {
            console.log('next')
          })
        } else if(res.cancel) {

        console.log('用户点击取消');
        }
      } 
    })
   
  },
  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    let self = this;
    this.getList(self.data.setTab, self.data.accessToken)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    pages = getCurrentPages();//获取当前打开的页面栈，返回为数组，索引顺序为打开的顺序
    prePages = pages[pages.length - 2];//获取到上一个页面对象
    // console.log(pages, prePages, "++++++++++++++++++++++++++++++++++++"); 
  },




  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
 
})