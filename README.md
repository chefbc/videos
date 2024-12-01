# Video Library Player

A simple, standalone video player that reads from a CSV file to display and play your video collection.

## Quick Start

1. Download the latest release for your platform from the [Releases page](../../releases)
2. Extract the application
3. Place your videos and video_mapping.csv next to the application

## Development Setup

1. Make sure [Node.js](https://nodejs.org/) is installed
2. Run `npm install` to install dependencies
3. Run `npm start` to launch the player

## Directory Structure

For development:
```
video-library/
├── index.html          # Player interface
├── main.js            # Electron main process
├── package.json       # Project configuration
├── video_mapping.csv  # Your video list
└── videos/            # Your video files
    ├── 1.mp4
    ├── 2.mp4
    └── ...
```

After extracting release:
```
Application Directory/
├── Video Library.app  # The application (macOS)
│   or
├── Video Library.exe  # The application (Windows)
├── video_mapping.csv  # Place next to the app
└── videos/           # Place next to the app
    ├── 1.mp4
    ├── 2.mp4
    └── ...
```

## Setting Up Your Videos

1. Put your video files in a `videos/` directory next to the application
2. Create `video_mapping.csv` next to the application with your video information:
   ```csv
   Movie Title,videos/1.mp4
   Another Movie,videos/2.mp4
   Third Movie,videos/3.mp4
   ```

## Building Manually

To create a standalone application:

```bash
# For Windows
npm run build:win

# For macOS
npm run build:mac
```

The built application will be in the `dist` directory.

## Automated Builds

This repository uses GitHub Actions to automatically build the application:

- Every push to main creates a new release
- Builds are available for both macOS and Windows
- Release artifacts are automatically uploaded
- Each release includes:
  - Video-Library-macOS.zip
  - Video-Library-Windows.zip

To use the automated builds:
1. Go to the [Releases page](../../releases)
2. Download the version for your platform
3. Extract the ZIP file
4. Place your videos and video_mapping.csv next to the application

## Features

- Simple, clean interface
- Video search functionality
- Remembers video locations
- Works offline
- No installation needed
- Videos and mapping file stay external to the app
- Automated builds for macOS and Windows

## Troubleshooting

If videos don't play:
1. Check that video files are in the `videos/` directory next to the application
2. Verify paths in `video_mapping.csv` are correct (should be relative to the application)
3. Make sure video files are MP4 format
4. Check file permissions

## System Requirements

- Windows 7 or later
- macOS 10.11 or later
- 64-bit operating system