// ==UserScript==
// @name         屏蔽斗鱼多余内容
// @version      0.2
// @description  弹幕、右侧评论、下方推荐、火箭、抽奖、导航栏，统统屏蔽！
// @author       kerncink@gmail.com
// @include      *://www.douyu.com
// @include      *://www.douyu.com/*
// @grant        none
// ==/UserScript==

/**
 * 完全可以remove页面元素，但是为了防止它的js代码报错导致异常，还是直接隐藏即可
 */

(function () {
  'use strict';

  const noneClassName = 'hidden';//'（⊙\.⊙）';
  const noneClassName1 = 'hidden1';
  const noneClassName2 = 'hidden2';
  const palyerId = '#__h5player'; // 播放器id，需隐藏它的所有兄弟节点

  const hideElems = [
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
    '.embed-msg',
    '.live-room-normal-equal-right-item',
    '.live-room-normal-left',
    '.live-room-normal-right',
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
    '#ad1'
  ];

  const promiseDelay = ms => {
    let timeout

    return {
      promise: () => {
        return new Promise(resolve => {
          timeout = setTimeout(resolve, ms)
        })
      },
      clearTimeout: () => clearTimeout(timeout)
    }
  }

  const addStyle = () => {
    const css = `
      .hidden.hidden1.hidden2,
      .LotteryContainer-svgaWrap,
      .LotteryContainer { 
        display:none!important;
      }`;
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

  const hide = (element) => {
    if(element){
      element.classList.add(noneClassName, noneClassName1, noneClassName2)
    }
  }

  /**
   * 直接屏蔽页面元素，比如右侧的评论框，左侧的导航栏，下方的推荐、广告各种垃圾
   */
  const hideBySelector = () => {
    const timeout = promiseDelay(300);
    timeout.promise().then(() => {
      hideElems.forEach(seletor => {
        hide(document.querySelector(seletor))
      });
      timeout.clearTimeout()
    })
  }


  const checkPlayerComponents = () => {

    const timeout2 = promiseDelay(2000);
    timeout2.promise().then(() => {
      const playerElem = document.querySelector(palyerId);
      const playserElemChildren = playerElem.children;

      // 表示各种乱七八糟的未加载完毕
      if (playserElemChildren.length < 10) {
        checkPlayerComponents();
      } else {
        timeout2.clearTimeout();
        hidePlayerAds(playserElemChildren);
        hideSlowElem(playserElemChildren);
      }
    });

  }

  // 播放器区域内部元素不一定2s内可以显示
  const dynamicClass = [
    'broadcastDiv',  // 火箭
    'comment',
    'luckDraw',
    'focusModel', // 主播求关注的漂浮物
  ];

  const hideSlowElem = (playserElemChildren) => {

    const timeout1 = promiseDelay(5000);
    timeout1.promise().then(() => {
      // TODO 这里遍历了多余的元素，hidePlayerAds处理过的元素无需再处理
      for (let i = 0; i < playserElemChildren.length; i++) {
        const v = playserElemChildren[i];
        const classArr = v.classList.toString();

        for (let j = 0; j < dynamicClass.length; j++) {
          const element = dynamicClass[j];
          if (classArr.indexOf(element) > -1) {
            hide(v)
          }
        }
      }

      timeout1.clearTimeout();
    });


  }

  /**
   * 屏蔽播放器区域的弹幕、飞机、各种漂浮物等
   * 这个需要等到播放器加载后才能渲染
   * @param { DOMTokenList } playserElemChildren 
   */
  const hidePlayerAds = (playserElemChildren) => {
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
        hide(v)
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