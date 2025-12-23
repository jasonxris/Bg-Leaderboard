// Main application logic
const app = {
    init() {
        this.setupEventListeners();
        this.loadLeaderboard();
    },

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', () => this.loadLeaderboard());
    },

    async loadLeaderboard() {
        this.showLoading();
        this.hideError();

        try {
            const data = await this.fetchGoogleSheetData();
            this.renderLeaderboard(data);
            this.updateLastRefreshedTime();
        } catch (error) {
            this.showError(error.message);
            console.error('Error loading leaderboard:', error);
        } finally {
            this.hideLoading();
        }
    },

    async fetchGoogleSheetData() {
        if (!window.GOOGLE_SHEET_CONFIG) {
            throw new Error('Google Sheet configuration not found. Please set up config.js');
        }

        const { CSV_URL } = window.GOOGLE_SHEET_CONFIG;

        if (!CSV_URL) {
            throw new Error('Missing CSV_URL in config.js');
        }

        const response = await fetch(CSV_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();
        return this.parseCSV(csvText);
    },

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');

        if (lines.length < 2) {
            throw new Error('No data found in the CSV');
        }

        // Skip header row (first row)
        const dataRows = lines.slice(1);

        return dataRows.map(line => {
            // Simple CSV parsing - handles quoted fields
            const row = this.parseCSVLine(line);

            return {
                player: row[0] || 'Unknown',
                matchesWon: parseInt(row[1]) || 0,
                matchesLost: parseInt(row[2]) || 0,
                totalPoints: parseInt(row[3]) || 0,
                winRate: row[4] || '0%',
                cashBalance: row[5] || '$0'
            };
        }).filter(player => player.player !== 'Unknown' && player.player.trim() !== '');
    },

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    },

    renderLeaderboard(data) {
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';

        // Sort by total points (descending)
        data.sort((a, b) => b.totalPoints - a.totalPoints);

        data.forEach((player, index) => {
            const row = document.createElement('tr');

            const rank = index + 1;
            const winRateValue = parseFloat(player.winRate);
            const winRateClass = this.getWinRateClass(winRateValue);

            row.innerHTML = `
                <td class="rank">${rank}</td>
                <td class="player-name">${this.escapeHtml(player.player)}</td>
                <td>${player.matchesWon}</td>
                <td>${player.matchesLost}</td>
                <td><strong>${player.totalPoints}</strong></td>
                <td class="win-rate ${winRateClass}">${player.winRate}</td>
                <td>${this.escapeHtml(player.cashBalance)}</td>
            `;

            tbody.appendChild(row);
        });
    },

    getWinRateClass(winRate) {
        if (winRate >= 60) return 'high';
        if (winRate >= 40) return 'medium';
        return 'low';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    updateLastRefreshedTime() {
        const lastUpdatedEl = document.getElementById('lastUpdated');
        const now = new Date();
        lastUpdatedEl.textContent = `Last updated: ${now.toLocaleString()}`;
    },

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    },

    showError(message) {
        const errorEl = document.getElementById('error');
        errorEl.textContent = `Error: ${message}`;
        errorEl.classList.remove('hidden');
    },

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => app.init());
