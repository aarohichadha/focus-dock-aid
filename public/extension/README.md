# FocusDock Chrome Extension

A Chrome Extension (Manifest V3) that helps you:
- **Save pages as tasks** with priority levels and notes
- **Extract ATS-friendly keywords** from job descriptions
- **Summarize page content** into concise bullet points
- **Chat assistant** for quick commands

## Features

### To-Do Management
- Save any webpage as a task
- Set priority (P0/High, P1/Medium, P2/Low)
- Add notes describing what needs to be done
- Optional due dates
- Quick actions: open, mark done, delete

### ATS Keyword Extraction
- Extract skills, tools, roles, and soft skills
- Categorized keyword lists
- Suggested keywords from frequent phrases
- One-click copy functionality

### Page Summarization
- Condense page content into 6-10 bullet points
- Works offline using heuristic analysis
- Copy summary to clipboard

### Chat Assistant
Natural language commands:
- "show my tasks" - List all tasks
- "summarize" - Summarize current page
- "ats keywords" - Extract keywords
- "done [task]" - Mark task complete
- "delete [task]" - Remove a task
- "help" - Show all commands

## Installation (Development)

1. Clone or download this extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Click the FocusDock icon to open the sidebar

## Technical Details

- **Manifest V3** compliant
- Uses `chrome.storage.local` for offline data persistence
- Content script injects sidebar as an overlay
- Service worker handles extension lifecycle
- Works entirely offline for task management

## Optional: AI Enhancement

Add an OpenAI API key in settings for enhanced summarization and keyword extraction. Without a key, the extension uses built-in heuristic analysis.

## Files Structure

```
extension/
├── manifest.json      # Extension configuration
├── background.js      # Service worker
├── content.js         # Content script (page injection)
├── content.css        # Content script styles
├── sidebar.html       # Sidebar UI
├── sidebar.js         # Sidebar logic
├── sidebar.css        # Sidebar styles
└── icons/             # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Building for Production

The React app in this project serves as the sidebar UI. To build:

1. Run `npm run build`
2. Copy the built assets to the extension folder
3. Update manifest.json to reference the built files
4. Test in Chrome

## Privacy

- All data stored locally in your browser
- No external servers (unless you add an API key)
- No tracking or analytics
