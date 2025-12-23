# BG Leaderboard

A static leaderboard webpage that fetches data from Google Sheets and displays player rankings.

## Features

- Real-time data fetching from Google Sheets
- Automatic ranking based on total points
- Win rate calculation and color-coded display
- Responsive design for mobile and desktop
- One-click refresh to get latest data
- Clean, modern UI with gradient styling

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet with the following column structure:
   ```
   Player | Matches Won | Matches Lost | Total Points | Win Rate
   ```

2. Fill in your data. Example:
   ```
   Alice  | 10          | 3            | 150          | 76.9%
   Bob    | 8           | 5            | 120          | 61.5%
   Carol  | 5           | 8            | 85           | 38.5%
   ```

3. Publish your sheet as CSV:
   - Go to **File** > **Share** > **Publish to web**
   - In the dialog, choose the specific sheet you want to publish
   - For format, select **Comma-separated values (.csv)**
   - Click **Publish**
   - Copy the published URL (it will look like `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv`)

### 2. Configure the Application

1. Open `config.js`
2. Replace the `CSV_URL` value with your published CSV URL

### 3. Test Locally

**Important:** You cannot open `index.html` directly in your browser due to CORS restrictions. You must run a local web server.

**Option 1: Python (Recommended)**
```bash
cd /path/to/Bg-Leaderboard
python3 -m http.server 8000
```
Then visit: http://localhost:8000

**Option 2: Node.js (if you have npx)**
```bash
npx http-server -p 8000
```
Then visit: http://localhost:8000

**Option 3: VS Code Live Server**
- Install the "Live Server" extension
- Right-click `index.html` and select "Open with Live Server"

### 4. Deploy to GitHub Pages

1. Initialize a git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

4. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Select "main" branch as source
   - Click Save

5. Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## File Structure

```
Bg-Leaderboard/
├── index.html      # Main HTML page
├── styles.css      # Styling and layout
├── script.js       # Data fetching and rendering logic
├── config.js       # Google Sheets configuration
└── README.md       # This file
```

## Customization

### Styling
Edit `styles.css` to customize colors, fonts, and layout.

### Data Source
To use a different data source, modify the `fetchGoogleSheetData()` method in `script.js`.

### Ranking Logic
The leaderboard sorts by `Total Points` in descending order. To change this, modify the sort function in the `renderLeaderboard()` method.

## Security Notes

- The published CSV URL is public and can be accessed by anyone
- No API keys or authentication required
- Only publish sheets that contain non-sensitive data

## Troubleshooting

**CORS Error: "Access to fetch has been blocked by CORS policy"**
- This happens when opening `index.html` directly in the browser (file:// protocol)
- **Solution:** Run a local web server (see "Test Locally" section above)
- Note: This issue does NOT occur when deployed to GitHub Pages

**Error: "Failed to fetch data"**
- Check that your sheet is published to the web as CSV
- Verify the CSV_URL in `config.js` is correct
- Try opening the CSV URL directly in your browser to verify it works
- Ensure you're running a local web server (not opening file:// directly)

**No data displayed**
- Check browser console for errors
- Verify your sheet has the correct column headers
- Ensure data starts on row 2 (row 1 should be headers)

**Win Rate not calculating**
- The Win Rate should be pre-calculated in your Google Sheet
- Format: "75.5%" or "75.5"
