// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
'use strict';

import {app, dialog, Menu, shell} from 'electron';

function createTemplate(mainWindow, config, isDev) {
  const settingsURL = isDev ? 'http://localhost:8080/browser/settings.html' : `file://${app.getAppPath()}/browser/settings.html`;

  const separatorItem = {
    type: 'separator',
  };

  const appName = app.getName();
  const firstMenuName = (process.platform === 'darwin') ? appName : '文件';
  const template = [];

  let platformAppMenu = process.platform === 'darwin' ? [{
    label: '关于 ' + appName,
    role: 'about',
    click() {
      dialog.showMessageBox(mainWindow, {
        buttons: ['OK'],
        message: `${appName} Desktop ${app.getVersion()}`,
      });
    },
  }, separatorItem, {
    label: '设置...',
    accelerator: 'CmdOrCtrl+,',
    click() {
      mainWindow.loadURL(settingsURL);
    },
  }] : [{
    label: '设置...',
    accelerator: 'CmdOrCtrl+,',
    click() {
      mainWindow.loadURL(settingsURL);
    },
  }];

  if (config.enableServerManagement === true) {
    platformAppMenu.push({
      label: '连接新服务器',
      click() {
        mainWindow.webContents.send('add-server');
      },
    });
  }

  platformAppMenu = platformAppMenu.concat(process.platform === 'darwin' ? [
    separatorItem, {
      role: 'hide',
    }, {
      role: 'hideothers',
    }, {
      role: 'unhide',
    }, separatorItem, {
      role: 'quit',
    }] : [
    separatorItem, {
      role: 'quit',
      accelerator: 'CmdOrCtrl+Q',
      click() {
        app.quit();
      },
    }]
  );

  template.push({
    label: '&' + firstMenuName,
    submenu: [
      ...platformAppMenu,
    ],
  });
  template.push({
    label: '&编辑',
    submenu: [{
      label: '取消',
      accelerator: 'CmdOrCtrl+Z',
      click() {
        mainWindow.webContents.send('undo');
      },
    }, {
      label: '撤回',
      accelerator: 'CmdOrCtrl+SHIFT+Z',
      click() {
        mainWindow.webContents.send('redo');
      },
    }, separatorItem, {
      label: '剪切',
      accelerator: 'CmdOrCtrl+X',
      click() {
        mainWindow.webContents.send('cut');
      },
    }, {
      label: '拷贝',
      accelerator: 'CmdOrCtrl+C',
      click() {
        mainWindow.webContents.send('copy');
      },
    }, {
      label: '粘贴',
      accelerator: 'CmdOrCtrl+V',
      click() {
        mainWindow.webContents.send('paste');
      },
    }, {
      label: '粘贴并匹配',
      accelerator: 'CmdOrCtrl+SHIFT+V',
      visible: process.platform === 'darwin',
      click() {
        mainWindow.webContents.send('paste-and-match');
      },
    }, {
      role: 'selectall',
    }],
  });
  template.push({
    label: '&浏览',
    submenu: [{
      label: '查找..',
      accelerator: 'CmdOrCtrl+F',
      click(item, focusedWindow) {
        focusedWindow.webContents.send('toggle-find');
      },
    }, {
      label: '重新加载',
      accelerator: 'CmdOrCtrl+R',
      click(item, focusedWindow) {
        if (focusedWindow) {
          if (focusedWindow === mainWindow) {
            mainWindow.webContents.send('reload-tab');
          } else {
            focusedWindow.reload();
          }
        }
      },
    }, {
      label: '清空缓存并重新加载',
      accelerator: 'Shift+CmdOrCtrl+R',
      click(item, focusedWindow) {
        if (focusedWindow) {
          if (focusedWindow === mainWindow) {
            mainWindow.webContents.send('clear-cache-and-reload-tab');
          } else {
            focusedWindow.webContents.session.clearCache(() => {
              focusedWindow.reload();
            });
          }
        }
      },
    }, {
      role: 'togglefullscreen',
    }, separatorItem, {
      label: '实际大小',
      accelerator: 'CmdOrCtrl+0',
      click() {
        mainWindow.webContents.send('zoom-reset');
      },
    }, {
      label: '缩放增大',
      accelerator: 'CmdOrCtrl+SHIFT+=',
      click() {
        mainWindow.webContents.send('zoom-in');
      },
    }, {
      label: '缩放减小',
      accelerator: 'CmdOrCtrl+-',
      click() {
        mainWindow.webContents.send('zoom-out');
      },
    }, separatorItem, {
      label: '应用开发工具',
      accelerator: (() => {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I';
        }
        return 'Ctrl+Shift+I';
      })(),
      click(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
    }, {
      label: '服务器开发工具',
      click() {
        mainWindow.webContents.send('open-devtool');
      },
    }],
  });
  template.push({
    label: '&历史',
    submenu: [{
      label: '返回',
      accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Alt+Left',
      click: (item, focusedWindow) => {
        if (focusedWindow === mainWindow) {
          mainWindow.webContents.send('go-back');
        } else if (focusedWindow.webContents.canGoBack()) {
          focusedWindow.goBack();
        }
      },
    }, {
      label: '前进',
      accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Alt+Right',
      click: (item, focusedWindow) => {
        if (focusedWindow === mainWindow) {
          mainWindow.webContents.send('go-forward');
        } else if (focusedWindow.webContents.canGoForward()) {
          focusedWindow.goForward();
        }
      },
    }],
  });

  const teams = config.teams;
  const windowMenu = {
    label: '&窗口',
    submenu: [{
      role: 'minimize',

      // empty string removes shortcut on Windows; null will default by OS
      accelerator: process.platform === 'win32' ? '' : null,
    }, {
      role: 'close',
    }, separatorItem, ...teams.slice(0, 9).map((team, i) => {
      return {
        label: team.name,
        accelerator: `CmdOrCtrl+${i + 1}`,
        click() {
          mainWindow.show(); // for OS X
          mainWindow.webContents.send('switch-tab', i);
        },
      };
    }), separatorItem, {
      label: '选择下一个服务器',
      accelerator: 'Ctrl+Tab',
      click() {
        mainWindow.webContents.send('select-next-tab');
      },
      enabled: (teams.length > 1),
    }, {
      label: '选择上一个服务器',
      accelerator: 'Ctrl+Shift+Tab',
      click() {
        mainWindow.webContents.send('select-previous-tab');
      },
      enabled: (teams.length > 1),
    }],
  };
  template.push(windowMenu);
  const submenu = [];
  if (config.helpLink) {
    submenu.push({
      label: '了解更多',
      click() {
        shell.openExternal(config.helpLink);
      },
    });
    submenu.push(separatorItem);
  }
  submenu.push({
    label: `版本 ${app.getVersion()}`,
    enabled: false,
  });

  template.push({label: '帮助', submenu});
  return template;
}

function createMenu(mainWindow, config, isDev) {
  return Menu.buildFromTemplate(createTemplate(mainWindow, config, isDev));
}

export default {
  createMenu,
};
