const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────
const GAME_URL = 'http://localhost:3000/';
const IS_DEV = process.argv.includes('--dev');
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

// ─── Auto-Updater Setup ───────────────────────────────────────────────────────
autoUpdater.logger = require('electron').app.isPackaged
  ? require('./logger')
  : console;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowDowngrade = false;

// ─── State ────────────────────────────────────────────────────────────────────
let mainWindow = null;
let splashWindow = null;
let updateReady = false;

// ─── App Initialization ───────────────────────────────────────────────────────
app.whenReady().then(async () => {
  createSplashWindow();

  if (IS_DEV) {
    console.log('[Dev Mode] Skipping update check');
    setTimeout(() => launchGame(), 1500);
  } else {
    setupAutoUpdater();
    checkForUpdatesAndLaunch();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) launchGame();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── Splash Screen ────────────────────────────────────────────────────────────
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.on('closed', () => { splashWindow = null; });
}

function sendToSplash(channel, data) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send(channel, data);
  }
}

// ─── Game Window ─────────────────────────────────────────────────────────────
function launchGame() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    show: false,
    title: 'Escape from Churkov',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Remove default menu (use custom one)
  buildAppMenu();

  mainWindow.once('ready-to-show', () => {
    // Close splash, show game
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load game:', errorCode, errorDescription);
    mainWindow.loadFile(path.join(__dirname, 'error.html'));
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in browser, not in the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(GAME_URL);
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
function buildAppMenu() {
  const template = [
    {
      label: 'Escape from Churkov',
      submenu: [
        {
          label: 'Reload Game',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.webContents.reload(),
        },
        {
          label: 'Full Screen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
          click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()),
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            if (IS_DEV) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Dev Mode',
                message: 'Auto-update is disabled in dev mode.',
              });
            } else {
              autoUpdater.checkForUpdates();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const zoom = mainWindow?.webContents.getZoomFactor() || 1;
            mainWindow?.webContents.setZoomFactor(Math.min(zoom + 0.1, 3));
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const zoom = mainWindow?.webContents.getZoomFactor() || 1;
            mainWindow?.webContents.setZoomFactor(Math.max(zoom - 0.1, 0.5));
          },
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWindow?.webContents.setZoomFactor(1),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── Auto Updater Logic ───────────────────────────────────────────────────────
function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    console.log('[Updater] Checking for update...');
    sendToSplash('update-status', { status: 'checking', message: 'Checking for updates...' });
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[Updater] Update available:', info.version);
    sendToSplash('update-status', {
      status: 'downloading',
      message: `Downloading update v${info.version}...`,
      version: info.version,
    });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[Updater] Up to date');
    sendToSplash('update-status', { status: 'ready', message: 'Launching Escape from Churkov...' });
    setTimeout(() => launchGame(), 800);
  });

  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent);
    console.log(`[Updater] Download progress: ${percent}%`);
    sendToSplash('update-progress', {
      percent,
      transferred: formatBytes(progress.transferred),
      total: formatBytes(progress.total),
      speed: formatBytes(progress.bytesPerSecond) + '/s',
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[Updater] Update downloaded:', info.version);
    updateReady = true;

    sendToSplash('update-status', {
      status: 'installing',
      message: `Update v${info.version} ready! Restarting...`,
    });

    // Auto-install after 3 seconds
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true);
    }, 3000);
  });

  autoUpdater.on('error', (err) => {
    console.error('[Updater] Error:', err.message);
    sendToSplash('update-status', {
      status: 'error',
      message: 'Update check failed. Launching anyway...',
    });
    // Launch game even if update fails
    setTimeout(() => launchGame(), 1500);
  });

  // Periodic update check while game is running
  setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      autoUpdater.checkForUpdates().catch(console.error);
    }
  }, UPDATE_CHECK_INTERVAL);
}

async function checkForUpdatesAndLaunch() {
  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    console.error('[Updater] Initial check failed:', err.message);
    sendToSplash('update-status', { status: 'ready', message: 'Launching Escape from Churkov...' });
    setTimeout(() => launchGame(), 800);
  }
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────
ipcMain.on('app-version', (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
