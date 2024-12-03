const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function getAppDirectory() {
    if (app.isPackaged) {
      // For packaged app
      if (process.platform === 'darwin') {
        // Mac: Get directory containing the .app bundle
        const appPath = process.execPath
        const appBundlePath = path.resolve(appPath, '../../..')
        return path.dirname(appBundlePath)
      } else {
        // Windows: Use portable dir or executable directory
        return process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath)
      }
    }
    // Development mode
    return __dirname
  }

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false  // Allow loading local files
        },
        title: 'Video Library',
        show: false // Don't show until ready
    });

    mainWindow.loadFile('index.html');
    
    // Open DevTools by default in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
    
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App initialization
app.whenReady().then(() => {
    // Set development environment in npm start
    if (process.argv[2] === '--dev') {
        process.env.NODE_ENV = 'development';
    }

    createWindow();

    
    // Check if video_mapping.csv exists
    const appDir = getAppDirectory();
    const mappingPath = path.join(appDir, 'video_mapping.csv');
    console.log('App directory:', appDir);
    console.log('Looking for video_mapping.csv at:', mappingPath);

    if (!fs.existsSync(mappingPath)) {
        dialog.showErrorBox(
            'Configuration Missing',
            `Please place video_mapping.csv in:\n${appDir}`
        );
    }
});

// Handle macOS behavior
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle video mapping request
ipcMain.handle('get-video-mapping', async () => {
    try {
        const appDir = getAppDirectory();
        const mappingPath = path.join(appDir, 'video_mapping.csv');
        console.log('Reading video_mapping.csv from:', mappingPath);
        
        // Check if mapping file exists
        if (!fs.existsSync(mappingPath)) {
            throw new Error(`Please place video_mapping.csv in:\n${appDir}`);
        }

        const content = fs.readFileSync(mappingPath, 'utf8');
        const videos = [];
        
        // Parse CSV and validate each entry
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle quoted titles
            let title, filename;
            if (line.startsWith('"')) {
                const matches = line.match(/"([^"]+)",(.+)/);
                if (matches) {
                    title = matches[1];
                    filename = matches[2].trim();
                }
            } else {
                [title, filename] = line.split(',').map(item => item.trim());
            }

            if (!title || !filename) {
                console.warn(`Skipping invalid line ${i + 1}: ${line}`);
                continue;
            }

            const videoPath = path.join(appDir, filename);
            console.log('Checking video file:', videoPath);

            if (!fs.existsSync(videoPath)) {
                console.warn(`Warning: Video file not found: ${videoPath}`);
                continue;
            }

            // Convert to absolute file path
            const absolutePath = path.resolve(videoPath);
            videos.push({
                title,
                filename: `file://${absolutePath}`
            });
        }

        if (videos.length === 0) {
            throw new Error('No valid video entries found');
        }

        console.log('Successfully loaded videos:', videos);
        return videos;
    } catch (error) {
        console.error('Error reading video mapping:', error);
        dialog.showErrorBox(
            'Error Loading Videos',
            `Failed to load video list: ${error.message}`
        );
        throw error;
    }
});

// Handle video file verification
ipcMain.handle('verify-video', async (event, filePath) => {
    try {
        const videoPath = new URL(filePath).pathname;
        // On Windows, remove leading slash
        const normalizedPath = process.platform === 'win32' 
            ? videoPath.slice(1) 
            : videoPath;
        console.log('Verifying video file:', normalizedPath);
        return fs.existsSync(normalizedPath);
    } catch (error) {
        console.error('Error verifying video:', error);
        return false;
    }
}); 