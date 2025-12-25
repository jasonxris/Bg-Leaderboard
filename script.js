// Main application logic
const app = {
    currentSort: 'matchesWon',
    sortDirection: 'desc',
    leaderboardData: [],

    init() {
        this.setupEventListeners();
        this.loadLeaderboard();
    },

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', () => this.loadLeaderboard());

        // Add sort listeners to table headers
        document.querySelectorAll('th.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.dataset.sort;
                this.sortBy(sortKey);
            });
        });
    },

    async loadLeaderboard() {
        this.showLoading();
        this.hideError();

        try {
            const data = await this.fetchGoogleSheetData();
            this.leaderboardData = data;
            this.renderLeaderboard();
            this.updateLastRefreshedTime();
        } catch (error) {
            this.showError(error.message);
            console.error('Error loading leaderboard:', error);
        } finally {
            this.hideLoading();
        }
    },

    sortBy(key) {
        // Toggle direction if clicking the same column
        if (this.currentSort === key) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = key;
            this.sortDirection = 'desc'; // Default to descending for new column
        }

        this.renderLeaderboard();
        this.updateSortIndicators();
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

            const cashBalanceValue = row[5] ? row[5].trim() : '0';

            return {
                player: row[0] || 'Unknown',
                matchesWon: parseInt(row[1]) || 0,
                matchesLost: parseInt(row[2]) || 0,
                totalPoints: parseInt(row[3]) || 0,
                winRate: row[4] || '0%',
                cashBalance: cashBalanceValue || '0'
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

    renderLeaderboard() {
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';

        // Create a copy of data for sorting
        const sortedData = [...this.leaderboardData];

        // Sort based on current sort key and direction
        sortedData.sort((a, b) => {
            let aVal = a[this.currentSort];
            let bVal = b[this.currentSort];

            // Handle different data types
            if (this.currentSort === 'player') {
                // String comparison
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
                return this.sortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            } else if (this.currentSort === 'winRate') {
                // Parse percentage
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (this.currentSort === 'cashBalance') {
                // Parse cash balance
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }

            // Numeric comparison
            return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });

        sortedData.forEach((player, index) => {
            const row = document.createElement('tr');

            const rank = index + 1;
            const winRateValue = parseFloat(player.winRate);
            const winRateClass = this.getWinRateClass(winRateValue);

            row.innerHTML = `
                <td class="rank">${rank}</td>
                <td class="player-name">${this.escapeHtml(player.player)}</td>
                <td>${player.matchesWon}</td>
                <td>${player.matchesLost}</td>
                <td class="win-rate ${winRateClass}">${player.winRate}</td>
                <td>${this.escapeHtml(player.cashBalance)}</td>
            `;

            tbody.appendChild(row);
        });

        // Calculate and display bank balance
        this.updateBankBalance(sortedData);
    },

    updateSortIndicators() {
        // Remove active class and arrows from all headers
        document.querySelectorAll('th.sortable').forEach(header => {
            header.classList.remove('active');
            const arrow = header.querySelector('.sort-arrow');
            arrow.textContent = '';
        });

        // Add active class and arrow to current sort column
        const activeHeader = document.querySelector(`th[data-sort="${this.currentSort}"]`);
        if (activeHeader) {
            activeHeader.classList.add('active');
            const arrow = activeHeader.querySelector('.sort-arrow');
            arrow.textContent = this.sortDirection === 'asc' ? '▲' : '▼';
        }
    },

    updateBankBalance(data) {
        const totalCashBalance = data.reduce((sum, player) => {
            return sum + (parseFloat(player.cashBalance) || 0);
        }, 0);

        const bankBalance = 500 - totalCashBalance;
        const bankBalanceEl = document.getElementById('bankBalanceAmount');
        bankBalanceEl.textContent = `$${bankBalance.toFixed(2)}`;
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
