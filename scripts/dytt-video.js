// ==UserScript==
// @name         电影淘淘看剧简易操作
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  视频全屏播放时没有按钮切换集数，一个小工具显示操作按钮（上下集切换），跳过片头90s（不准确），自动播放下一集（暂定片尾140s，不准确）
// @author       natee
// @include      *://*.dytt.com/vod-play-id-*-src-*-num-*.html
// @grant        none
// @run-at       document-end
// ==/UserScript==

/**
 * A tiny helper for document.createElement.
 * https://gist.github.com/MoOx/8614711
 * @param {*} options 
    document.body.appendChild(createElement({
      tagName: "div",
      className: "my-class",
      text: "Blah blah",
      attributes: {
        "id": "element id",
        "data-truc": "value"
      },
      childs: []
    }))
 */
function createElement(options) {
  var el
    , a
    , i
  if (!options.tagName) {
    el = document.createDocumentFragment()
  }
  else {
    el = document.createElement(options.tagName)
    if (options.className) {
      el.className = options.className
    }

    if (options.attributes) {
      for (a in options.attributes) {
        el.setAttribute(a, options.attributes[a])
      }
    }

    if (options.html !== undefined) {
      el.innerHTML = options.html
    }
  }

  if (options.text) {
    el.appendChild(document.createTextNode(options.text))
  }

  // IE 8 doesn"t have HTMLElement
  if (window.HTMLElement === undefined) {
    window.HTMLElement = Element
  }

  if (options.childs && options.childs.length) {
    for (i = 0; i < options.childs.length; i++) {
      el.appendChild(options.childs[i] instanceof window.HTMLElement ? options.childs[i] : createElement(options.childs[i]))
    }
  }

  return el
}

(function () {
  "use strict";

  /*
  MacPlayer ={
    "Status": true,
    "Parse": "",
    "Agent": "mozilla/5.0 (macintosh; intel mac os x 10_15_5) applewebkit/537.36 (khtml, like gecko) chrome/84.0.4147.89 safari/537.36",
    "Width": "100%",
    "Height": "100%",
    "Prestrain": "//union.maccms.com/html/prestrain.html",
    "Buffer": "//union.maccms.com/html/buffer.html",
    "Second": "5",
    "Flag": "play",
    "Trysee": 0,
    "Points": 0,
    "Link": "",
    "PlayFrom": "ckm3u8",
    "PlayNote": "",
    "PlayServer": "",
    "PlayUrl": "",
    "PlayUrlNext": "",
    "PlayLinkNext": "",
    "PlayLinkPre": "",
    "Path": "/static/player/",
    "offsetHeight": 400,
    "offsetWidth": 1080,
    "Html": ""
  }
  */

  let playerDocument = null;
  let playerWindow = null;
  let dplayer = null;
  let dyttTimer = null;
  let totalTime = 0;
  let currentTime = 0;

  function promiseDelay(ms) {
    let timeout;

    return {
      promise: () => {
        return new Promise((resolve) => {
          timeout = setTimeout(resolve, ms);
        });
      },
      clearTimeout: () => clearTimeout(timeout),
    };
  }

  init();

  function init() {
    const pdObj = promiseDelay(2000);

    pdObj.promise().then(() => {
      playerSetup(pdObj)
    });
  }

  function playerSetup(pdObj){
    const playerIframe = document.querySelectorAll("iframe")[2];
    playerDocument = playerIframe.contentDocument;
    playerWindow = playerIframe.contentWindow;
    dplayer = getDPlayer();

    if(!dplayer){
      pdObj.clearTimeout();
      pdObj.promise().then(() => {
        console.log('re check player')
        playerSetup(pdObj)
      });
      return;
    }

    console.log('player loaded:', dplayer);

    createCustomHandler();

    bindEvents();

    setTimeout(() => {
      // 从 1:30 开始播放
      play(90);
      play(); // 自动播放上一行会触发暂停
    });
    
    startCheck();

    pdObj.clearTimeout();
  }

  function bindEvents(){
    dplayer.on('play', () => {
      console.log('on play')
      startCheck()
    });

    dplayer.on('pause', () => {
      console.log('on pause')
      stopCheck()
    })
  }

  // 跳转到指定秒数播放
  function play(time) {
    time ? dplayer.seek(time) : dplayer.play()
  }

  function getDPlayer() {
    return playerWindow.dp;
  }

  // 视频总时长（秒）
  function getTotalTime() {
    return dplayer.video.duration;
  }

  // 当前播放时间（秒）
  function getCurrentTime() {
    return dplayer.video.currentTime;
  }

  function enterFullScreen(){
    dplayer.fullScreen.request('browser');
  }

  function getProgress(){
    totalTime = getTotalTime();

    currentTime = getCurrentTime();

    // 视频播放超过95%进度自动播放下一集
    // 暂定片尾140s
    if(totalTime - currentTime < 140) {
      stopCheck()
      jumpTo('next')
    }
  }

  function startCheck() {
    getProgress()
    dyttTimer = setInterval(() => {
      getProgress()
    }, 10000)
  }

  // 切换集数
  function jumpTo(type){
    location.href = type === 'next' ? MacPlayer.PlayLinkNext : MacPlayer.PlayLinkPre;
    init();
  }

  function stopCheck(){
    clearInterval(dyttTimer);
  }

  let playerControlTimer = null;
  function createCustomHandler(){
    const body = playerDocument.querySelector("body");
    const buttonWrap = body.querySelector(".dplayer-icons.dplayer-icons-left");

    if(!buttonWrap) {
      playerControlTimer = setTimeout(function(){
        console.log("control未渲染")
        createCustomHandler()
      }, 3000)
      return;
    }else{
      try{
        enterFullScreen();
      }catch(err){
        console.log(err);
      }
      clearTimeout(playerControlTimer)
    }

    const preButton = createElement({
      tagName: "button",
      className: "dplayer-pre",
      text: "上一集"
    });
    const nextButton = createElement({
      tagName: "button",
      className: "dplayer-next",
      text: "下一集"
    });
    // const slowButton = createElement({
    //   tagName: "button",
    //   className: "dplayer-slow",
    //   text: "<< 30s"
    // });
    // const fastButton = createElement({
    //   tagName: "button",
    //   className: "dplayer-fast",
    //   text: ">> 30s"
    // });

    preButton.addEventListener("click", function(){
      jumpTo('pre')
    });
    nextButton.addEventListener("click", function(){
      jumpTo('next')
    });

    buttonWrap.appendChild(preButton);
    buttonWrap.appendChild(nextButton);
  }

})();
