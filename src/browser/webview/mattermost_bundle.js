/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "browser";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/browser/webview/mattermost.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/browser/webview/mattermost.js":
/*!*******************************************!*\
  !*** ./src/browser/webview/mattermost.js ***!
  \*******************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-magic-numbers */


const UNREAD_COUNT_INTERVAL = 1000;
const CLEAR_CACHE_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

Reflect.deleteProperty(global.Buffer); // http://electron.atom.io/docs/tutorial/security/#buffer-global

function isReactAppInitialized() {
  const initializedRoot = document.querySelector('#root.channel-view') || // React 16 webapp
  document.querySelector('#root .signup-team__container') || // React 16 login
  document.querySelector('div[data-reactroot]'); // Older React apps

  if (initializedRoot === null) {
    return false;
  }

  return initializedRoot.children.length !== 0;
}

function watchReactAppUntilInitialized(callback) {
  let count = 0;
  const interval = 500;
  const timeout = 30000;
  const timer = setInterval(() => {
    count += interval;

    if (isReactAppInitialized() || count >= timeout) {
      // assumed as webapp has been initialized.
      clearTimeout(timer);
      callback();
    }
  }, interval);
}

window.addEventListener('load', () => {
  if (document.getElementById('root') === null) {
    console.log('The guest is not assumed as mattermost-webapp');
    electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].sendToHost('onGuestInitialized');
    return;
  }

  watchReactAppUntilInitialized(() => {
    electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].sendToHost('onGuestInitialized', window.basename);
  });
}); // listen for messages from the webapp

window.addEventListener('message', ({
  origin,
  data: {
    type,
    message = {}
  } = {}
} = {}) => {
  if (origin !== window.location.origin) {
    return;
  }

  switch (type) {
    case 'webapp-ready':
      {
        // register with the webapp to enable custom integration functionality
        window.postMessage({
          type: 'register-desktop',
          message: {
            version: electron__WEBPACK_IMPORTED_MODULE_0__["remote"].app.getVersion()
          }
        }, window.location.origin);
        break;
      }

    case 'dispatch-notification':
      {
        const {
          title,
          body,
          channel,
          teamId,
          silent
        } = message;
        electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].sendToHost('dispatchNotification', title, body, channel, teamId, silent);
        break;
      }
  }
});
electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].on('notification-clicked', (event, {
  channel,
  teamId
}) => {
  window.postMessage({
    type: 'notification-clicked',
    message: {
      channel,
      teamId
    }
  }, window.location.origin);
});

function hasClass(element, className) {
  const rclass = /[\t\r\n\f]/g;

  if ((' ' + element.className + ' ').replace(rclass, ' ').indexOf(className) > -1) {
    return true;
  }

  return false;
}

function getUnreadCount() {
  if (!this.unreadCount) {
    this.unreadCount = 0;
  }

  if (!this.mentionCount) {
    this.mentionCount = 0;
  } // LHS not found => Log out => Count should be 0, but session may be expired.


  if (document.getElementById('sidebar-left') === null) {
    const extraParam = new URLSearchParams(window.location.search).get('extra');
    const sessionExpired = extraParam === 'expired';
    electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].sendToHost('onBadgeChange', sessionExpired, 0, 0, false, false);
    this.sessionExpired = sessionExpired;
    this.unreadCount = 0;
    this.mentionCount = 0;
    setTimeout(getUnreadCount, UNREAD_COUNT_INTERVAL);
    return;
  } // unreadCount in sidebar
  // Note: the active channel doesn't have '.unread-title'.


  let unreadCount = document.getElementsByClassName('unread-title').length; // unreadCount in team sidebar

  const teamSideBar = document.getElementsByClassName('team-sidebar'); // team-sidebar doesn't have id

  if (teamSideBar.length === 1) {
    unreadCount += teamSideBar[0].getElementsByClassName('unread').length;
  } // mentionCount in sidebar


  const elem = document.querySelectorAll('#sidebar-left .badge, #channel_view .badge');
  let mentionCount = 0;

  for (let i = 0; i < elem.length; i++) {
    if (isElementVisible(elem[i]) && !hasClass(elem[i], 'badge-notify')) {
      mentionCount += Number(elem[i].innerHTML);
    }
  }

  const postAttrName = 'data-reactid';
  const lastPostElem = document.querySelector('div[' + postAttrName + '="' + this.lastCheckedPostId + '"]');
  let isUnread = false;
  let isMentioned = false;

  if (lastPostElem === null || !isElementVisible(lastPostElem)) {
    // When load channel or change channel, this.lastCheckedPostId is invalid.
    // So we get latest post and save lastCheckedPostId.
    // find active post-list.
    const postLists = document.querySelectorAll('div.post-list__content');

    if (postLists.length === 0) {
      setTimeout(getUnreadCount, UNREAD_COUNT_INTERVAL);
      return;
    }

    let post = null;

    for (let j = 0; j < postLists.length; j++) {
      if (isElementVisible(postLists[j])) {
        post = postLists[j].children[0];
      }
    }

    if (post === null) {
      setTimeout(getUnreadCount, UNREAD_COUNT_INTERVAL);
      return;
    } // find latest post and save.


    post = post.nextSibling;

    while (post) {
      if (post.nextSibling === null) {
        if (post.getAttribute(postAttrName) !== null) {
          this.lastCheckedPostId = post.getAttribute(postAttrName);
        }
      }

      post = post.nextSibling;
    }
  } else if (lastPostElem !== null) {
    let newPostElem = lastPostElem.nextSibling;

    while (newPostElem) {
      this.lastCheckedPostId = newPostElem.getAttribute(postAttrName);
      isUnread = true;
      const activeChannel = document.querySelector('.active .sidebar-channel');
      const closeButton = activeChannel.getElementsByClassName('btn-close');

      if (closeButton.length === 1 && closeButton[0].getAttribute('aria-describedby') === 'remove-dm-tooltip') {
        // If active channel is DM, all posts is treated as mention.
        isMentioned = true;
        break;
      } else {
        // If active channel is public/private channel, only mentioned post is treated as mention.
        const highlight = newPostElem.getElementsByClassName('mention-highlight');

        if (highlight.length !== 0 && isElementVisible(highlight[0])) {
          isMentioned = true;
          break;
        }
      }

      newPostElem = newPostElem.nextSibling;
    }
  }

  if (this.sessionExpired || this.unreadCount !== unreadCount || this.mentionCount !== mentionCount || isUnread || isMentioned) {
    electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].sendToHost('onBadgeChange', false, unreadCount, mentionCount, isUnread, isMentioned);
  }

  this.unreadCount = unreadCount;
  this.mentionCount = mentionCount;
  this.sessionExpired = false;
  setTimeout(getUnreadCount, UNREAD_COUNT_INTERVAL);
}

setTimeout(getUnreadCount, UNREAD_COUNT_INTERVAL);

function isElementVisible(elem) {
  return elem.offsetHeight !== 0;
}

function resetMisspelledState() {
  electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].once('spellchecker-is-ready', () => {
    const element = document.activeElement;

    if (element) {
      element.blur();
      element.focus();
    }
  });
  electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].send('reply-on-spellchecker-is-ready');
}

function setSpellChecker() {
  const spellCheckerLocale = electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].sendSync('get-spellchecker-locale');
  electron__WEBPACK_IMPORTED_MODULE_0__["webFrame"].setSpellCheckProvider(spellCheckerLocale, {
    spellCheck(words, callback) {
      const misspeltWords = words.filter(text => {
        const res = electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].sendSync('checkspell', text);
        const isCorrect = res === null ? true : res;
        return !isCorrect;
      });
      callback(misspeltWords);
    }

  });
  resetMisspelledState();
}

setSpellChecker();
electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].on('set-spellchecker', setSpellChecker); // push user activity updates to the webapp

electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].on('user-activity-update', (event, {
  userIsActive,
  isSystemEvent
}) => {
  window.postMessage({
    type: 'user-activity-update',
    message: {
      userIsActive,
      manual: isSystemEvent
    }
  }, window.location.origin);
}); // exit fullscreen embedded elements like youtube - https://mattermost.atlassian.net/browse/MM-19226

electron__WEBPACK_IMPORTED_MODULE_0__["ipcRenderer"].on('exit-fullscreen', () => {
  if (document.fullscreenElement && document.fullscreenElement.nodeName.toLowerCase() === 'iframe') {
    document.exitFullscreen();
  }
}); // mattermost-webapp is SPA. So cache is not cleared due to no navigation.
// We needed to manually clear cache to free memory in long-term-use.
// http://seenaburns.com/debugging-electron-memory-usage/

setInterval(() => {
  electron__WEBPACK_IMPORTED_MODULE_0__["webFrame"].clearCache();
}, CLEAR_CACHE_INTERVAL);
/* eslint-enable no-magic-numbers */

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Jyb3dzZXIvd2Vidmlldy9tYXR0ZXJtb3N0LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImVsZWN0cm9uXCIiXSwibmFtZXMiOlsiVU5SRUFEX0NPVU5UX0lOVEVSVkFMIiwiQ0xFQVJfQ0FDSEVfSU5URVJWQUwiLCJSZWZsZWN0IiwiZGVsZXRlUHJvcGVydHkiLCJnbG9iYWwiLCJCdWZmZXIiLCJpc1JlYWN0QXBwSW5pdGlhbGl6ZWQiLCJpbml0aWFsaXplZFJvb3QiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJjaGlsZHJlbiIsImxlbmd0aCIsIndhdGNoUmVhY3RBcHBVbnRpbEluaXRpYWxpemVkIiwiY2FsbGJhY2siLCJjb3VudCIsImludGVydmFsIiwidGltZW91dCIsInRpbWVyIiwic2V0SW50ZXJ2YWwiLCJjbGVhclRpbWVvdXQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZ2V0RWxlbWVudEJ5SWQiLCJjb25zb2xlIiwibG9nIiwiaXBjUmVuZGVyZXIiLCJzZW5kVG9Ib3N0IiwiYmFzZW5hbWUiLCJvcmlnaW4iLCJkYXRhIiwidHlwZSIsIm1lc3NhZ2UiLCJsb2NhdGlvbiIsInBvc3RNZXNzYWdlIiwidmVyc2lvbiIsInJlbW90ZSIsImFwcCIsImdldFZlcnNpb24iLCJ0aXRsZSIsImJvZHkiLCJjaGFubmVsIiwidGVhbUlkIiwic2lsZW50Iiwib24iLCJldmVudCIsImhhc0NsYXNzIiwiZWxlbWVudCIsImNsYXNzTmFtZSIsInJjbGFzcyIsInJlcGxhY2UiLCJpbmRleE9mIiwiZ2V0VW5yZWFkQ291bnQiLCJ1bnJlYWRDb3VudCIsIm1lbnRpb25Db3VudCIsImV4dHJhUGFyYW0iLCJVUkxTZWFyY2hQYXJhbXMiLCJzZWFyY2giLCJnZXQiLCJzZXNzaW9uRXhwaXJlZCIsInNldFRpbWVvdXQiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwidGVhbVNpZGVCYXIiLCJlbGVtIiwicXVlcnlTZWxlY3RvckFsbCIsImkiLCJpc0VsZW1lbnRWaXNpYmxlIiwiTnVtYmVyIiwiaW5uZXJIVE1MIiwicG9zdEF0dHJOYW1lIiwibGFzdFBvc3RFbGVtIiwibGFzdENoZWNrZWRQb3N0SWQiLCJpc1VucmVhZCIsImlzTWVudGlvbmVkIiwicG9zdExpc3RzIiwicG9zdCIsImoiLCJuZXh0U2libGluZyIsImdldEF0dHJpYnV0ZSIsIm5ld1Bvc3RFbGVtIiwiYWN0aXZlQ2hhbm5lbCIsImNsb3NlQnV0dG9uIiwiaGlnaGxpZ2h0Iiwib2Zmc2V0SGVpZ2h0IiwicmVzZXRNaXNzcGVsbGVkU3RhdGUiLCJvbmNlIiwiYWN0aXZlRWxlbWVudCIsImJsdXIiLCJmb2N1cyIsInNlbmQiLCJzZXRTcGVsbENoZWNrZXIiLCJzcGVsbENoZWNrZXJMb2NhbGUiLCJzZW5kU3luYyIsIndlYkZyYW1lIiwic2V0U3BlbGxDaGVja1Byb3ZpZGVyIiwic3BlbGxDaGVjayIsIndvcmRzIiwibWlzc3BlbHRXb3JkcyIsImZpbHRlciIsInRleHQiLCJyZXMiLCJpc0NvcnJlY3QiLCJ1c2VySXNBY3RpdmUiLCJpc1N5c3RlbUV2ZW50IiwibWFudWFsIiwiZnVsbHNjcmVlbkVsZW1lbnQiLCJub2RlTmFtZSIsInRvTG93ZXJDYXNlIiwiZXhpdEZ1bGxzY3JlZW4iLCJjbGVhckNhY2hlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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aUJBQVQsQ0FBMkJDLFFBQTNCLENBQW9DQyxXQUFwQyxPQUFzRCxRQUF4RixFQUFrRztBQUNoR2xHLFlBQVEsQ0FBQ21HLGNBQVQ7QUFDRDtBQUNGLENBSkQsRSxDQU1BO0FBQ0E7QUFDQTs7QUFDQXpGLFdBQVcsQ0FBQyxNQUFNO0FBQ2hCMEUsbURBQVEsQ0FBQ2dCLFVBQVQ7QUFDRCxDQUZVLEVBRVIzRyxvQkFGUSxDQUFYO0FBSUEsb0M7Ozs7Ozs7Ozs7O0FDaFFBLHFDIiwiZmlsZSI6IndlYnZpZXcvbWF0dGVybW9zdF9idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcImJyb3dzZXJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvYnJvd3Nlci93ZWJ2aWV3L21hdHRlcm1vc3QuanNcIik7XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTUtMjAxNiBZdXlhIE9jaGlhaVxuLy8gQ29weXJpZ2h0IChjKSAyMDE2LXByZXNlbnQgTWF0dGVybW9zdCwgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy8gU2VlIExJQ0VOU0UudHh0IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxuJ3VzZSBzdHJpY3QnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1tYWdpYy1udW1iZXJzICovXG5cbmltcG9ydCB7aXBjUmVuZGVyZXIsIHdlYkZyYW1lLCByZW1vdGV9IGZyb20gJ2VsZWN0cm9uJztcblxuY29uc3QgVU5SRUFEX0NPVU5UX0lOVEVSVkFMID0gMTAwMDtcbmNvbnN0IENMRUFSX0NBQ0hFX0lOVEVSVkFMID0gNiAqIDYwICogNjAgKiAxMDAwOyAvLyA2IGhvdXJzXG5cblJlZmxlY3QuZGVsZXRlUHJvcGVydHkoZ2xvYmFsLkJ1ZmZlcik7IC8vIGh0dHA6Ly9lbGVjdHJvbi5hdG9tLmlvL2RvY3MvdHV0b3JpYWwvc2VjdXJpdHkvI2J1ZmZlci1nbG9iYWxcblxuZnVuY3Rpb24gaXNSZWFjdEFwcEluaXRpYWxpemVkKCkge1xuICBjb25zdCBpbml0aWFsaXplZFJvb3QgPVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyb290LmNoYW5uZWwtdmlldycpIHx8IC8vIFJlYWN0IDE2IHdlYmFwcFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyb290IC5zaWdudXAtdGVhbV9fY29udGFpbmVyJykgfHwgLy8gUmVhY3QgMTYgbG9naW5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXZbZGF0YS1yZWFjdHJvb3RdJyk7IC8vIE9sZGVyIFJlYWN0IGFwcHNcbiAgaWYgKGluaXRpYWxpemVkUm9vdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gaW5pdGlhbGl6ZWRSb290LmNoaWxkcmVuLmxlbmd0aCAhPT0gMDtcbn1cblxuZnVuY3Rpb24gd2F0Y2hSZWFjdEFwcFVudGlsSW5pdGlhbGl6ZWQoY2FsbGJhY2spIHtcbiAgbGV0IGNvdW50ID0gMDtcbiAgY29uc3QgaW50ZXJ2YWwgPSA1MDA7XG4gIGNvbnN0IHRpbWVvdXQgPSAzMDAwMDtcbiAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgY291bnQgKz0gaW50ZXJ2YWw7XG4gICAgaWYgKGlzUmVhY3RBcHBJbml0aWFsaXplZCgpIHx8IGNvdW50ID49IHRpbWVvdXQpIHsgLy8gYXNzdW1lZCBhcyB3ZWJhcHAgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH0sIGludGVydmFsKTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpID09PSBudWxsKSB7XG4gICAgY29uc29sZS5sb2coJ1RoZSBndWVzdCBpcyBub3QgYXNzdW1lZCBhcyBtYXR0ZXJtb3N0LXdlYmFwcCcpO1xuICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoJ29uR3Vlc3RJbml0aWFsaXplZCcpO1xuICAgIHJldHVybjtcbiAgfVxuICB3YXRjaFJlYWN0QXBwVW50aWxJbml0aWFsaXplZCgoKSA9PiB7XG4gICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdCgnb25HdWVzdEluaXRpYWxpemVkJywgd2luZG93LmJhc2VuYW1lKTtcbiAgfSk7XG59KTtcblxuLy8gbGlzdGVuIGZvciBtZXNzYWdlcyBmcm9tIHRoZSB3ZWJhcHBcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKHtvcmlnaW4sIGRhdGE6IHt0eXBlLCBtZXNzYWdlID0ge319ID0ge319ID0ge30pID0+IHtcbiAgaWYgKG9yaWdpbiAhPT0gd2luZG93LmxvY2F0aW9uLm9yaWdpbikge1xuICAgIHJldHVybjtcbiAgfVxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgY2FzZSAnd2ViYXBwLXJlYWR5Jzoge1xuICAgIC8vIHJlZ2lzdGVyIHdpdGggdGhlIHdlYmFwcCB0byBlbmFibGUgY3VzdG9tIGludGVncmF0aW9uIGZ1bmN0aW9uYWxpdHlcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdyZWdpc3Rlci1kZXNrdG9wJyxcbiAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgIHZlcnNpb246IHJlbW90ZS5hcHAuZ2V0VmVyc2lvbigpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW5cbiAgICApO1xuICAgIGJyZWFrO1xuICB9XG4gIGNhc2UgJ2Rpc3BhdGNoLW5vdGlmaWNhdGlvbic6IHtcbiAgICBjb25zdCB7dGl0bGUsIGJvZHksIGNoYW5uZWwsIHRlYW1JZCwgc2lsZW50fSA9IG1lc3NhZ2U7XG4gICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdCgnZGlzcGF0Y2hOb3RpZmljYXRpb24nLCB0aXRsZSwgYm9keSwgY2hhbm5lbCwgdGVhbUlkLCBzaWxlbnQpO1xuICAgIGJyZWFrO1xuICB9XG4gIH1cbn0pO1xuXG5pcGNSZW5kZXJlci5vbignbm90aWZpY2F0aW9uLWNsaWNrZWQnLCAoZXZlbnQsIHtjaGFubmVsLCB0ZWFtSWR9KSA9PiB7XG4gIHdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICB7XG4gICAgICB0eXBlOiAnbm90aWZpY2F0aW9uLWNsaWNrZWQnLFxuICAgICAgbWVzc2FnZToge1xuICAgICAgICBjaGFubmVsLFxuICAgICAgICB0ZWFtSWQsXG4gICAgICB9LFxuICAgIH0sXG4gICAgd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICApO1xufSk7XG5cbmZ1bmN0aW9uIGhhc0NsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICBjb25zdCByY2xhc3MgPSAvW1xcdFxcclxcblxcZl0vZztcbiAgaWYgKCgnICcgKyBlbGVtZW50LmNsYXNzTmFtZSArICcgJykucmVwbGFjZShyY2xhc3MsICcgJykuaW5kZXhPZihjbGFzc05hbWUpID4gLTEpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdldFVucmVhZENvdW50KCkge1xuICBpZiAoIXRoaXMudW5yZWFkQ291bnQpIHtcbiAgICB0aGlzLnVucmVhZENvdW50ID0gMDtcbiAgfVxuICBpZiAoIXRoaXMubWVudGlvbkNvdW50KSB7XG4gICAgdGhpcy5tZW50aW9uQ291bnQgPSAwO1xuICB9XG5cbiAgLy8gTEhTIG5vdCBmb3VuZCA9PiBMb2cgb3V0ID0+IENvdW50IHNob3VsZCBiZSAwLCBidXQgc2Vzc2lvbiBtYXkgYmUgZXhwaXJlZC5cbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWRlYmFyLWxlZnQnKSA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGV4dHJhUGFyYW0gPSAobmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKSkuZ2V0KCdleHRyYScpO1xuICAgIGNvbnN0IHNlc3Npb25FeHBpcmVkID0gZXh0cmFQYXJhbSA9PT0gJ2V4cGlyZWQnO1xuXG4gICAgaXBjUmVuZGVyZXIuc2VuZFRvSG9zdCgnb25CYWRnZUNoYW5nZScsIHNlc3Npb25FeHBpcmVkLCAwLCAwLCBmYWxzZSwgZmFsc2UpO1xuICAgIHRoaXMuc2Vzc2lvbkV4cGlyZWQgPSBzZXNzaW9uRXhwaXJlZDtcbiAgICB0aGlzLnVucmVhZENvdW50ID0gMDtcbiAgICB0aGlzLm1lbnRpb25Db3VudCA9IDA7XG4gICAgc2V0VGltZW91dChnZXRVbnJlYWRDb3VudCwgVU5SRUFEX0NPVU5UX0lOVEVSVkFMKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB1bnJlYWRDb3VudCBpbiBzaWRlYmFyXG4gIC8vIE5vdGU6IHRoZSBhY3RpdmUgY2hhbm5lbCBkb2Vzbid0IGhhdmUgJy51bnJlYWQtdGl0bGUnLlxuICBsZXQgdW5yZWFkQ291bnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd1bnJlYWQtdGl0bGUnKS5sZW5ndGg7XG5cbiAgLy8gdW5yZWFkQ291bnQgaW4gdGVhbSBzaWRlYmFyXG4gIGNvbnN0IHRlYW1TaWRlQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGVhbS1zaWRlYmFyJyk7IC8vIHRlYW0tc2lkZWJhciBkb2Vzbid0IGhhdmUgaWRcbiAgaWYgKHRlYW1TaWRlQmFyLmxlbmd0aCA9PT0gMSkge1xuICAgIHVucmVhZENvdW50ICs9IHRlYW1TaWRlQmFyWzBdLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3VucmVhZCcpLmxlbmd0aDtcbiAgfVxuXG4gIC8vIG1lbnRpb25Db3VudCBpbiBzaWRlYmFyXG4gIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjc2lkZWJhci1sZWZ0IC5iYWRnZSwgI2NoYW5uZWxfdmlldyAuYmFkZ2UnKTtcbiAgbGV0IG1lbnRpb25Db3VudCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChpc0VsZW1lbnRWaXNpYmxlKGVsZW1baV0pICYmICFoYXNDbGFzcyhlbGVtW2ldLCAnYmFkZ2Utbm90aWZ5JykpIHtcbiAgICAgIG1lbnRpb25Db3VudCArPSBOdW1iZXIoZWxlbVtpXS5pbm5lckhUTUwpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHBvc3RBdHRyTmFtZSA9ICdkYXRhLXJlYWN0aWQnO1xuICBjb25zdCBsYXN0UG9zdEVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdkaXZbJyArIHBvc3RBdHRyTmFtZSArICc9XCInICsgdGhpcy5sYXN0Q2hlY2tlZFBvc3RJZCArICdcIl0nKTtcbiAgbGV0IGlzVW5yZWFkID0gZmFsc2U7XG4gIGxldCBpc01lbnRpb25lZCA9IGZhbHNlO1xuICBpZiAobGFzdFBvc3RFbGVtID09PSBudWxsIHx8ICFpc0VsZW1lbnRWaXNpYmxlKGxhc3RQb3N0RWxlbSkpIHtcbiAgICAvLyBXaGVuIGxvYWQgY2hhbm5lbCBvciBjaGFuZ2UgY2hhbm5lbCwgdGhpcy5sYXN0Q2hlY2tlZFBvc3RJZCBpcyBpbnZhbGlkLlxuICAgIC8vIFNvIHdlIGdldCBsYXRlc3QgcG9zdCBhbmQgc2F2ZSBsYXN0Q2hlY2tlZFBvc3RJZC5cblxuICAgIC8vIGZpbmQgYWN0aXZlIHBvc3QtbGlzdC5cbiAgICBjb25zdCBwb3N0TGlzdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYucG9zdC1saXN0X19jb250ZW50Jyk7XG4gICAgaWYgKHBvc3RMaXN0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHNldFRpbWVvdXQoZ2V0VW5yZWFkQ291bnQsIFVOUkVBRF9DT1VOVF9JTlRFUlZBTCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBwb3N0ID0gbnVsbDtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc3RMaXN0cy5sZW5ndGg7IGorKykge1xuICAgICAgaWYgKGlzRWxlbWVudFZpc2libGUocG9zdExpc3RzW2pdKSkge1xuICAgICAgICBwb3N0ID0gcG9zdExpc3RzW2pdLmNoaWxkcmVuWzBdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocG9zdCA9PT0gbnVsbCkge1xuICAgICAgc2V0VGltZW91dChnZXRVbnJlYWRDb3VudCwgVU5SRUFEX0NPVU5UX0lOVEVSVkFMKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBmaW5kIGxhdGVzdCBwb3N0IGFuZCBzYXZlLlxuICAgIHBvc3QgPSBwb3N0Lm5leHRTaWJsaW5nO1xuICAgIHdoaWxlIChwb3N0KSB7XG4gICAgICBpZiAocG9zdC5uZXh0U2libGluZyA9PT0gbnVsbCkge1xuICAgICAgICBpZiAocG9zdC5nZXRBdHRyaWJ1dGUocG9zdEF0dHJOYW1lKSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMubGFzdENoZWNrZWRQb3N0SWQgPSBwb3N0LmdldEF0dHJpYnV0ZShwb3N0QXR0ck5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwb3N0ID0gcG9zdC5uZXh0U2libGluZztcbiAgICB9XG4gIH0gZWxzZSBpZiAobGFzdFBvc3RFbGVtICE9PSBudWxsKSB7XG4gICAgbGV0IG5ld1Bvc3RFbGVtID0gbGFzdFBvc3RFbGVtLm5leHRTaWJsaW5nO1xuICAgIHdoaWxlIChuZXdQb3N0RWxlbSkge1xuICAgICAgdGhpcy5sYXN0Q2hlY2tlZFBvc3RJZCA9IG5ld1Bvc3RFbGVtLmdldEF0dHJpYnV0ZShwb3N0QXR0ck5hbWUpO1xuICAgICAgaXNVbnJlYWQgPSB0cnVlO1xuICAgICAgY29uc3QgYWN0aXZlQ2hhbm5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hY3RpdmUgLnNpZGViYXItY2hhbm5lbCcpO1xuICAgICAgY29uc3QgY2xvc2VCdXR0b24gPSBhY3RpdmVDaGFubmVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2J0bi1jbG9zZScpO1xuICAgICAgaWYgKGNsb3NlQnV0dG9uLmxlbmd0aCA9PT0gMSAmJiBjbG9zZUJ1dHRvblswXS5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKSA9PT0gJ3JlbW92ZS1kbS10b29sdGlwJykge1xuICAgICAgICAvLyBJZiBhY3RpdmUgY2hhbm5lbCBpcyBETSwgYWxsIHBvc3RzIGlzIHRyZWF0ZWQgYXMgbWVudGlvbi5cbiAgICAgICAgaXNNZW50aW9uZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIGFjdGl2ZSBjaGFubmVsIGlzIHB1YmxpYy9wcml2YXRlIGNoYW5uZWwsIG9ubHkgbWVudGlvbmVkIHBvc3QgaXMgdHJlYXRlZCBhcyBtZW50aW9uLlxuICAgICAgICBjb25zdCBoaWdobGlnaHQgPSBuZXdQb3N0RWxlbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtZW50aW9uLWhpZ2hsaWdodCcpO1xuICAgICAgICBpZiAoaGlnaGxpZ2h0Lmxlbmd0aCAhPT0gMCAmJiBpc0VsZW1lbnRWaXNpYmxlKGhpZ2hsaWdodFswXSkpIHtcbiAgICAgICAgICBpc01lbnRpb25lZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld1Bvc3RFbGVtID0gbmV3UG9zdEVsZW0ubmV4dFNpYmxpbmc7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMuc2Vzc2lvbkV4cGlyZWQgfHwgdGhpcy51bnJlYWRDb3VudCAhPT0gdW5yZWFkQ291bnQgfHwgdGhpcy5tZW50aW9uQ291bnQgIT09IG1lbnRpb25Db3VudCB8fCBpc1VucmVhZCB8fCBpc01lbnRpb25lZCkge1xuICAgIGlwY1JlbmRlcmVyLnNlbmRUb0hvc3QoJ29uQmFkZ2VDaGFuZ2UnLCBmYWxzZSwgdW5yZWFkQ291bnQsIG1lbnRpb25Db3VudCwgaXNVbnJlYWQsIGlzTWVudGlvbmVkKTtcbiAgfVxuICB0aGlzLnVucmVhZENvdW50ID0gdW5yZWFkQ291bnQ7XG4gIHRoaXMubWVudGlvbkNvdW50ID0gbWVudGlvbkNvdW50O1xuICB0aGlzLnNlc3Npb25FeHBpcmVkID0gZmFsc2U7XG4gIHNldFRpbWVvdXQoZ2V0VW5yZWFkQ291bnQsIFVOUkVBRF9DT1VOVF9JTlRFUlZBTCk7XG59XG5zZXRUaW1lb3V0KGdldFVucmVhZENvdW50LCBVTlJFQURfQ09VTlRfSU5URVJWQUwpO1xuXG5mdW5jdGlvbiBpc0VsZW1lbnRWaXNpYmxlKGVsZW0pIHtcbiAgcmV0dXJuIGVsZW0ub2Zmc2V0SGVpZ2h0ICE9PSAwO1xufVxuXG5mdW5jdGlvbiByZXNldE1pc3NwZWxsZWRTdGF0ZSgpIHtcbiAgaXBjUmVuZGVyZXIub25jZSgnc3BlbGxjaGVja2VyLWlzLXJlYWR5JywgKCkgPT4ge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG4gIH0pO1xuICBpcGNSZW5kZXJlci5zZW5kKCdyZXBseS1vbi1zcGVsbGNoZWNrZXItaXMtcmVhZHknKTtcbn1cblxuZnVuY3Rpb24gc2V0U3BlbGxDaGVja2VyKCkge1xuICBjb25zdCBzcGVsbENoZWNrZXJMb2NhbGUgPSBpcGNSZW5kZXJlci5zZW5kU3luYygnZ2V0LXNwZWxsY2hlY2tlci1sb2NhbGUnKTtcbiAgd2ViRnJhbWUuc2V0U3BlbGxDaGVja1Byb3ZpZGVyKHNwZWxsQ2hlY2tlckxvY2FsZSwge1xuICAgIHNwZWxsQ2hlY2sod29yZHMsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBtaXNzcGVsdFdvcmRzID0gd29yZHMuZmlsdGVyKCh0ZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdjaGVja3NwZWxsJywgdGV4dCk7XG4gICAgICAgIGNvbnN0IGlzQ29ycmVjdCA9IChyZXMgPT09IG51bGwpID8gdHJ1ZSA6IHJlcztcbiAgICAgICAgcmV0dXJuICFpc0NvcnJlY3Q7XG4gICAgICB9KTtcbiAgICAgIGNhbGxiYWNrKG1pc3NwZWx0V29yZHMpO1xuICAgIH0sXG4gIH0pO1xuICByZXNldE1pc3NwZWxsZWRTdGF0ZSgpO1xufVxuc2V0U3BlbGxDaGVja2VyKCk7XG5pcGNSZW5kZXJlci5vbignc2V0LXNwZWxsY2hlY2tlcicsIHNldFNwZWxsQ2hlY2tlcik7XG5cbi8vIHB1c2ggdXNlciBhY3Rpdml0eSB1cGRhdGVzIHRvIHRoZSB3ZWJhcHBcbmlwY1JlbmRlcmVyLm9uKCd1c2VyLWFjdGl2aXR5LXVwZGF0ZScsIChldmVudCwge3VzZXJJc0FjdGl2ZSwgaXNTeXN0ZW1FdmVudH0pID0+IHtcbiAgd2luZG93LnBvc3RNZXNzYWdlKHt0eXBlOiAndXNlci1hY3Rpdml0eS11cGRhdGUnLCBtZXNzYWdlOiB7dXNlcklzQWN0aXZlLCBtYW51YWw6IGlzU3lzdGVtRXZlbnR9fSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG59KTtcblxuLy8gZXhpdCBmdWxsc2NyZWVuIGVtYmVkZGVkIGVsZW1lbnRzIGxpa2UgeW91dHViZSAtIGh0dHBzOi8vbWF0dGVybW9zdC5hdGxhc3NpYW4ubmV0L2Jyb3dzZS9NTS0xOTIyNlxuaXBjUmVuZGVyZXIub24oJ2V4aXQtZnVsbHNjcmVlbicsICgpID0+IHtcbiAgaWYgKGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50ICYmIGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpZnJhbWUnKSB7XG4gICAgZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKTtcbiAgfVxufSk7XG5cbi8vIG1hdHRlcm1vc3Qtd2ViYXBwIGlzIFNQQS4gU28gY2FjaGUgaXMgbm90IGNsZWFyZWQgZHVlIHRvIG5vIG5hdmlnYXRpb24uXG4vLyBXZSBuZWVkZWQgdG8gbWFudWFsbHkgY2xlYXIgY2FjaGUgdG8gZnJlZSBtZW1vcnkgaW4gbG9uZy10ZXJtLXVzZS5cbi8vIGh0dHA6Ly9zZWVuYWJ1cm5zLmNvbS9kZWJ1Z2dpbmctZWxlY3Ryb24tbWVtb3J5LXVzYWdlL1xuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICB3ZWJGcmFtZS5jbGVhckNhY2hlKCk7XG59LCBDTEVBUl9DQUNIRV9JTlRFUlZBTCk7XG5cbi8qIGVzbGludC1lbmFibGUgbm8tbWFnaWMtbnVtYmVycyAqL1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZWxlY3Ryb25cIik7Il0sInNvdXJjZVJvb3QiOiIifQ==