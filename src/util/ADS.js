
import wx from "weixin-js-sdk";

const timeago = (timestamp) => {
    let mistiming = Math.round((new Date())-timestamp)/1000;
  
    if(mistiming <= 1){
      return '1秒前';
    }
    let arrr = ['年','个月','星期','天','小时','分钟','秒'];
    let arrn = [31536000,2592000,604800,86400,3600,60,1];
    let inms=[];
    for(let i=6;i>=0;i--){
        let inm = Math.floor(mistiming/arrn[i]);
        if(inm != 0){
            inms.push(inm+arrr[i]+'前');
        }
    }

    return inms[inms.length-1]
}

const getLocalTime = (nS, symbol, index) => {
    if(nS){
        symbol = symbol || '-';
        index = index || 5;
        var date = new Date(Number(nS)),
            Y, M, D, h, m, s;
        Y = date.getFullYear() + symbol;
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + symbol;
        D = date.getDate() + ' ';
        h = appendzero(date.getHours()) + ':';
        m = appendzero(date.getMinutes()) + ':';
        s = appendzero(date.getSeconds());
        switch (index) {
            case 1:
                return (Y + M + D);
            case 2:
                return (Y + M);
            case 3:
                return (M + D);
            case 4:
                return (h + m + s);
            case 5:
                return (Y + M + D + h + m + s);
        }
    }else{
        return '';
    }
}

const setValue = (label,value) => {
	window.localStorage.setItem(label,value);
}

const getValue = (label) => {
	return window.localStorage.getItem(label);
}

const appendzero = (s) => {
	if (s < 10) return "0" + s;
	else return s;
}

const obj2str = (O) => {
    let s ='';
    for(let k in O){
        s = s + (!s ? '?' : '&') + k + '=' +O[k];
    }
    return s;
}

const createMsg = (msg='ok', flag = false) => {
    let time = Date.now(),className = flag ? 'msg_wrap_ok' : 'msg_wrap_warn';

    let str = '<span id='+time+' class="msg_wrap '+className+'">'+msg+'</span>';
    let range = document.createRange();
    range.selectNodeContents(document.documentElement); 
    let fragment = range.createContextualFragment(str);
    document.body.appendChild(fragment);

    let timer = setTimeout(() => {
        document.body.removeChild(document.getElementById(time));
        clearTimeout(timer);
    }, 5000);
}

const initMediaDevices = (config,callback) => {// 打开摄像头 麦克风
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }

    navigator.mediaDevices.getUserMedia(config).then(stream => {
        callback(stream);
    }).catch(console.error);
}

const qrcode = (url, id, w = 180) => {
    let qrcode = document.getElementById(id);
    qrcode.innerHTML = '';
    let QRCode = window.QRCode;
    let adaiQrcode = new QRCode(id,{
        text: url,
        width: w,
        height: w,
        colorDark : '#000000',
        colorLight : '#ffffff',
        correctLevel : QRCode.CorrectLevel.H
    });
}

const cacheImage = (data, callback) =>{
    let bg = new Image();
    bg.setAttribute("crossOrigin",'Anonymous');

    bg.src = data;
    bg.onload = () => {
        callback(data)
    }
}

Array.prototype.shuffle = function() {
    let m = this.length, i;
    while (m) {
        i = (Math.random() * m--) >>> 0;
        [this[m], this[i]] = [this[i], this[m]]
    }
    return this;
}

function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for(var i=0;i<vars.length;i++) {
         var pair = vars[i].split("=");
         if(pair[0] == variable){return pair[1];}
    }
    return '';
}

function getTodayZero(timestamp = ''){
    if(timestamp){
        return new Date(new Date(timestamp).toLocaleDateString()).getTime();
    }else{
        return new Date(new Date().toLocaleDateString()).getTime();
    }
}

function getSurplusDays(timestamp){
    return (getTodayZero() - getTodayZero(timestamp))/24/60/60/1000;
}

/**
 * html2canvas -> Canvas2Image
 * html DOM 转换成图片
 */
 function convert2canvas(id,callback) {
    var shareContent = document.querySelector(id);//需要截图的包裹的（原生的）DOM 对象
    var width = shareContent.offsetWidth; //获取dom 宽度
    var height = shareContent.offsetHeight; //获取dom 高度
    var canvas = document.createElement("canvas"); //创建一个canvas节点
    var scale = 2; //定义任意放大倍数 支持小数
    canvas.width = width * scale; //定义canvas 宽度 * 缩放
    canvas.height = height * scale; //定义canvas高度 *缩放
    canvas.getContext("2d").scale(scale, scale); //获取context,设置scale 
    var opts = {
        scale: scale, // 添加的scale 参数
        canvas: canvas, //自定义 canvas
        // logging: true, //日志开关，便于查看html2canvas的内部执行流程
        width: width, //dom 原始宽度
        height: height,
        useCORS: true // 【重要】开启跨域配置
    };
    
    html2canvas(shareContent, opts).then(function (canvas) {
        var context = canvas.getContext('2d');
        // 【重要】关闭抗锯齿
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;

        //获取base64
        let base64='';
        base64 = canvas.toDataURL('image/png')
        // 【重要】默认转化的格式为png,也可设置为其他格式 .replace("image/png", "image/octet-stream")
        // var img = Canvas2Image.convertToJPEG(canvas, canvas.width, canvas.height);
        callback(base64, canvas.width, canvas.height);
    });
}

// 获取当前月零点时间戳
function getCurrentMonthZero(t = 11){
    let time = new Date().setMonth(new Date().getMonth() - t); // || new Date(Date.now() - 1000*60*60*24*30*t)
        time = new Date(time);
        time.setDate(1);
        time.setHours(0);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);

    return time;
}

// 获取当前月份天数
function getDays(t = Date.now()){
    const date = new Date(t);
    const year = date.getFullYear();
    const month = date.getMonth()+1;

    const days = new Date(year, month, 0).getDate();

    return days*24*60*60*1000;
}

function Base642Blob(Base64){
    let arr = Base64.split(',');
    let mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    // let blob = new Blob([u8arr], { type: mime });
    // URL.createObjectURL(blob)

    return new Blob([u8arr], { type: mime });
}

// 随机长度字符串
function randomString(len = 32) {
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = $chars.length;
    let pwd = '';

    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }

    return pwd;
}

function getBase64ImgSize(str) {
    // 带上前缀时需去掉前缀
    // 一个字节是 8, base64是 6 
    return parseInt(0.75*str.replace('data:image/png;base64,', '').length);
}

const callCamera = (id) => {//打开摄像头
    // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            // 首先，如果有getUserMedia的话，就获得它
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            // 否则，为老的navigator.getUserMedia方法包裹一个Promise
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
    const constraints = {video: true};
    let v = document.querySelector(id);
    let promise = navigator.mediaDevices.getUserMedia(constraints);
    promise.then(stream => {
        // 旧的浏览器可能没有srcObject
        if("srcObject" in v){
            v.srcObject = stream;
        } else {
            // 防止再新的浏览器里使用它，应为它已经不再支持了
            v.src = window.URL.createObjectURL(stream);
        }
        v.onloadedmetadata =  (e) => {
            v.play();
        };
    }).catch(err => {
        createMsg('该设备没有摄像头');
        console.error(err.name + ": " + err.message);
    })
};

import { wechat } from './api';

// 微信分享
// 文档：https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#2
// 直接点链接分享不生效： https://developers.weixin.qq.com/community/develop/doc/0000ea53f1cf60dcfc1da027a55c00
// 一定要去公众号平台设置 js域名（分享页面的域名、图标用png格式）2023.3.22 baolf
const initWechat = async (url, title, desc, imgUrl ) => {
    const ua = window.navigator.userAgent.toLowerCase();
    // 判断是否是微信浏览器
    if (ua.indexOf("micromessenger") < 0) return false;
    // 最好在在 router 的全局钩子里调用这个方法，每次页面的 URL 发生变化时，都需要重新获取微信分享参数
    // 如果你的 router 使用的是 hash 形式，应该不用每次都重新获取微信分享参数
  
    const signature = await wechat.signature(url);
    wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: "wxa273ac80f9f74c3d", // 必填，公众号的唯一标识
      timestamp: parseInt(signature.result.timestamp), // 必填，生成签名的时间戳
      nonceStr: signature.result.nonceStr, // 必填，生成签名的随机串
      signature: signature.result.signature, // 必填，签名，见附录1
      jsApiList: ["updateAppMessageShareData", "updateTimelineShareData"], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
  
    wx.ready(function () {
      //需在用户可能点击分享按钮前就先调用
      wx.updateAppMessageShareData({
        title: title, // 分享标题
        desc: desc, // 分享描述
        link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: imgUrl, // 分享图标
        success: function () {
          // 设置成功
          console.log("分享成功");
        },
      });
      wx.updateTimelineShareData({
        title: title, // 分享标题
        link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: imgUrl, // 分享图标
        success: function () {
          // 设置成功
        },
      });
    });
}

// 命名导出 可以导出多个
export {
    timeago,
    getLocalTime,
    setValue,
    getValue,
    obj2str,
    createMsg,
    initMediaDevices,
    qrcode,
    cacheImage,
    getQueryVariable,
    getSurplusDays,
    convert2canvas,
    getCurrentMonthZero, 
    getDays, 
    Base642Blob, 
    randomString,
    getBase64ImgSize, 
    initWechat, 
}