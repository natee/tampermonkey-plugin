// ==UserScript==
// @name         屏蔽斗鱼多余内容
// @version      0.1
// @description  弹幕、右侧评论、下方推荐、火箭、抽奖、导航栏，统统屏蔽！
// @author       You
// @include      *://www.douyu.com
// @include      *://www.douyu.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var noneClassName = 'hidden';//'（⊙\.⊙）';
  var palyerId = '#__h5player'; // 播放器id，需隐藏它的所有兄弟节点
  var timer = null;

  var hideElems = [
    '.Title-anchorPic',
    '#dysign-30008',
    '#js-bottom',
    '#js-chat-cont',
    '#js-chat-speak',
    '#js-live-room-normal-right',
    '#js-player-toolbar',
    '#js-recommand',
    '#js-room-activity',
    '#js-stats-and-actions',
    '#right_col_peck',
    '.PlayerCase-Sub',
    '.PlayerCaseSub',
    '.PlayerCaseSub-Main',
    '.PlayerSub',
    '.anchor-dynamic',
    '.announce',
    '.c-list',
    '.chat-cont',
    '.chat-cont-wrap',
    '.chat-speak',
    '.column',

    '.comment-2fc131', // 动态生成，但是前缀不变
    '.danmu-6e95c1',
    '.broadcastDiv-343e1a',

    '.embed-msg',
    '.live-room-normal-equal-right-item',
    '.live-room-normal-left',
    '.live-room-normal-right',
    '.luckDraw_bg-b94a06',
    '.pendant-wrap',
    '.recommand',
    '.room-ad-top',
    '.stats-and-actions',
    '.tab',
    '.text-cont',
    '.valentine1807',
    '.layout-Player-aside',
    '.layout-Aside',
    '.Title-roomOtherBottom',
    '.layout-Player-guessgame',
    '.guessGameContainer',
    '.YubaGroup',
  ];

  function addStyle() {
    const css = '.hidden { display:none!important; }';
    const head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
  }

  function hideBySelector() {
    setTimeout(() => {
      hideElems.forEach(v => {
        let el = document.querySelector(v);
        if (el) {
          el.classList.add(noneClassName)
        } else {
        }

      });
    }, 300)
  }


  function checkPlayerComponents(){
    // 屏蔽弹幕等
    timer = setTimeout(() => {
      var playerElem = document.querySelector(palyerId);
      var playserElemChildren = playerElem.children;

      // 表示各种乱七八糟的未加载完毕
      if(playserElemChildren.length < 10){
        checkPlayerComponents();
      }else{
        clearTimeout(timer);
        hidePlayerAds(playserElemChildren);
      }

    }, 2000);
  }

  function hidePlayerAds(playserElemChildren) {
    // 屏蔽弹幕等
    for (let i = 0; i < playserElemChildren.length; i++) {
      const v = playserElemChildren[i];
      const classArr = v.classList.toString();
      const hasClass = classArr != '';
      let isControl = false;

      // 视频控制器得显示出来，通过判断子元素是否有controlbar类
      if (!hasClass) {
        const emptyDivChildren = v.children;
        for (let j = 0; j < emptyDivChildren.length; j++) {
          const element = emptyDivChildren[j];
          if (element.classList.toString().indexOf('controlbar') > -1) {
            // 表示是播放器
            isControl = true;
            break;
          }
        }
      }

      if (!isControl && classArr.indexOf('video-container') < 0) {
        v.classList.add(noneClassName)
      }
    }
  }

  function setup() {
    hideBySelector();
    checkPlayerComponents();
    addStyle();
  }

  setup();

})();