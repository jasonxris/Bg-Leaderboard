# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static HTML/CSS/JavaScript leaderboard webpage designed for GitHub Pages deployment. Data is fetched from a published Google Sheets CSV URL.

## Development Commands

### Local Testing
```bash
# Open index.html directly in browser
open index.html

# Or use a simple HTTP server (if Python is available)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Deployment
Deployed via GitHub Pages. Any push to `main` branch automatically deploys to the live site.

```bash
git add .
git commit -m "Update leaderboard"
git push origin main
```

## Architecture

### Data Flow
1. `config.js` contains the published Google Sheets CSV URL
2. `script.js` fetches CSV data from the URL on page load
3. CSV is parsed into player objects, sorted by total points, and rendered as HTML table rows
4. User can refresh data manually via the refresh button

### File Responsibilities

**index.html**
- Main page structure with leaderboard table
- Loading spinner and error message containers
- Includes both config.js and script.js

**script.js**
- `app.init()`: Entry point, sets up event listeners and loads data
- `fetchGoogleSheetData()`: Fetches CSV data from published Google Sheets URL
- `parseCSV()`: Parses CSV text into player objects
- `parseCSVLine()`: Handles CSV parsing including quoted fields
- `renderLeaderboard()`: Sorts data and generates table HTML
- Error handling and loading states

**config.js**
- Contains the published Google Sheets CSV URL
- No API keys required - uses publicly published CSV endpoint

**styles.css**
- Responsive design with mobile breakpoints
- Gradient header and modern UI styling
- Special styling for top 3 ranks (gold, silver, bronze)
- Win rate color coding (green ≥60%, yellow ≥40%, red <40%)

### Google Sheets Data Format

Expected columns (in order):
1. Player (string)
2. Matches Won (number)
3. Matches Lost (number)
4. Total Points (number)
5. Win Rate (string, e.g., "75.5%")

Row 1 must be headers. Data starts at row 2.

## Key Constraints

### Static Site Limitations
- No backend server or database
- All data fetching happens client-side
- Cannot use environment variables or secrets management
- Relies on CORS-friendly public CSV endpoint

### Google Sheets CSV Publishing
- Sheet must be published to the web as CSV (File > Share > Publish to web)
- No API key required - simpler setup than Google Sheets API
- Published URL format: `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv`
- CSV is publicly accessible to anyone with the URL

## Making Changes

### Adding New Columns
1. Update Google Sheet with new column
2. Modify `parseCSV()` to extract new field from row array (update the index)
3. Add new `<th>` in `index.html` table header
4. Add new `<td>` in `renderLeaderboard()` method
5. Re-publish the sheet if needed (changes auto-update in published CSV)

### Changing Sort Order
Modify the sort function in `renderLeaderboard()`:
```javascript
data.sort((a, b) => b.totalPoints - a.totalPoints);
```

### Styling Changes
All visual customization is in `styles.css`. Key classes:
- `.rank`, `.player-name`, `.win-rate`: Text styling
- `.win-rate.high/.medium/.low`: Win rate color coding
- `tbody tr:nth-child(1/2/3)`: Top 3 rank special styling

### Data Source Configuration
If changing to a different Google Sheet:
1. Publish the new sheet to web as CSV (File > Share > Publish to web)
2. Copy the published CSV URL
3. Update `CSV_URL` in `config.js`
4. Ensure new sheet maintains same column structure (Player, Matches Won, Matches Lost, Total Points, Win Rate)
