// ==UserScript==
// @name         屏蔽虎牙直播多余内容
// @version      0.1
// @description  弹幕、右侧评论、下方推荐、火箭、抽奖、导航栏，统统屏蔽！
// @author       kerncink@gmail.com
// @include      *://www.huya.com
// @include      *://www.huya.com/*
// @grant        none
// ==/UserScript==

/**
 * 完全可以remove页面元素，但是为了防止它的js代码报错导致异常，还是直接隐藏即可
 */

(function () {
  'use strict';

  const hideElems = [
    '.special-bg', // 顶部大banner
    '#chatRoom', // 聊天滚屏
    '.room-footer', // 播放器下方内容
    '.hy-side', // 首页右侧让你下载等垃圾内容
    '.mod-news-section', // 首页新闻
    '.live-box', // 首页没什么用的东西
    '#player-marquee-wrap', // 视频区域上方滚动内容
    '.diy-activity-icon', // 操作栏陪玩主播推荐等
    '.more-activity-icon', // 更多垃圾内容
    '.player-banner-gift', // 贵族送礼特效
    '.ab-icon'
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
    let css = `
      .hidden.hidden1.hidden2 {
        display:none!important;
      }
    `;
    hideElems.forEach(seletor => {
      css += `${seletor}{display:none!important;}`
    });

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
    if (element) {
      element.classList.add('hidden', 'hidden1', 'hidden2')
    }
  }

  function setup() {
    hideBySelector();
    hideSiblings();
    addStyle();
  }

  setup();


  /**
   * 直接屏蔽页面元素，比如右侧的评论框，左侧的导航栏，下方的推荐、广告各种垃圾
   */
  function hideBySelector() {
    
    const timeout = promiseDelay(300);
    timeout.promise().then(() => {
      hideElems.forEach(seletor => {
        hide(document.querySelector(seletor))
      });
      timeout.clearTimeout()
    })
  }


  function checkElementLoaded(elemId) {

    const timeout2 = promiseDelay(2000);
    timeout2.promise().then(() => {
      const playerElem = document.querySelector(elemId);

      if (!playerElem) {
        checkElementLoaded(elemId);
      } else {
        const playerParent = playerElem.parentNode;
        const siblings = Array.from(playerParent.children);

        timeout2.clearTimeout();

        for (let i = 0; i < siblings.length; i++) {
          const v = siblings[i];
          if (v !== playerElem) {
            hide(v)
          }
        }
      }
    });

  }

  function hideSiblings() {
    checkElementLoaded('#hy-video'); // 播放器id，需隐藏它的所有兄弟节点
    checkElementLoaded('.player-gift-left');
  }

})();