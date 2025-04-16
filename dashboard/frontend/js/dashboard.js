// Dashboard module for handling UI updates and fraud detection
const Dashboard = {
    // Cache DOM elements
    elements: {
        totalFlagged: document.getElementById('total-flagged'),
        totalFlaggedChange: document.getElementById('total-flagged-change'),
        avgDetectionScore: document.getElementById('avg-detection-score'),
        avgScoreChange: document.getElementById('avg-score-change'),
        reviewTime: document.getElementById('review-time'),
        reviewTimeChange: document.getElementById('review-time-change'),
        mostCommonTag: document.getElementById('most-common-tag'),
        commonTagChange: document.getElementById('common-tag-change'),
        flaggedTableBody: document.getElementById('flagged-transactions-body'),
        exportDataBtn: document.getElementById('export-data'),
        refreshDataBtn: document.getElementById('refresh-data')
    },
    
    // Previous state for calculating changes
    previousStats: {
        totalFlagged: 0,
        avgDetectionScore: 0,
        mostCommonTag: ''
    },
    
    // Auto-refresh timer
    refreshInterval: null,
    
    // Initialize dashboard
    initialize() {
        this.setupEventListeners();
        this.loadFlaggedAccounts(); // Initial load
        
        // Set up auto-refresh every 20 seconds
        this.refreshInterval = setInterval(() => {
            this.loadFlaggedAccounts();
        }, 20000);
    },
    
    // Setup event listeners
    setupEventListeners() {
        this.elements.exportDataBtn.addEventListener('click', () => this.exportData());
        this.elements.refreshDataBtn.addEventListener('click', () => this.loadFlaggedAccounts());
        
        // Event delegation for transaction actions
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-block')) {
                const transactionId = event.target.getAttribute('data-id');
                this.handleAction(transactionId, 'block');
            } else if (event.target.classList.contains('btn-warn')) {
                const transactionId = event.target.getAttribute('data-id');
                this.handleAction(transactionId, 'warn');
            }
        });
    },
    
    // Load flagged accounts from API
    loadFlaggedAccounts() {
        fetch('/api/flagged-accounts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data); // Debugging
                this.updateTransactionsTable(data);
                
                // Calculate summary statistics
                const stats = {
                    totalFlagged: data.length,
                    avgDetectionScore: data.reduce((sum, transaction) => 
                        sum + (transaction.suspicion?.detection_score || 0), 0) / data.length || 0,
                    reviewTime: '2.5 min', // Static or calculated value
                    mostCommonTag: this.getMostCommonReason(data)
                };
                
                this.updateStats(stats);
            })
            .catch(error => {
                console.error('Error loading flagged accounts:', error);
                this.showNotification('Failed to load data', 'error');
            });
    },
    
    // Handle block or warn actions
    handleAction(transactionId, actionType) {
        const endpoint = `/api/transactions/${actionType}`;
        
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transactionId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to ${actionType} transaction`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Transaction ${actionType}ed:`, data);
            // Show success notification
            this.showNotification(`Transaction ${actionType}ed successfully`, 'success');
            // Refresh data to update the table
            this.loadFlaggedAccounts();
        })
        .catch(error => {
            console.error(`Error ${actionType}ing transaction:`, error);
            this.showNotification(`Failed to ${actionType} transaction`, 'error');
        });
    },
    
    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    },
    
    // Get most common flagging reason
    getMostCommonReason(transactions) {
        const reasonCounts = {};
        
        transactions.forEach(transaction => {
            const reason = transaction.suspicion?.reason || 'Unknown';
            if (!reasonCounts[reason]) {
                reasonCounts[reason] = 0;
            }
            reasonCounts[reason]++;
        });
        
        let mostCommonReason = '';
        let highestCount = 0;
        
        for (const reason in reasonCounts) {
            if (reasonCounts[reason] > highestCount) {
                highestCount = reasonCounts[reason];
                mostCommonReason = reason;
            }
        }
        
        return mostCommonReason;
    },
    
    // Update dashboard statistics
    updateStats(stats) {
        // Calculate percentage changes
        const totalFlaggedChange = this.calculatePercentageChange(
            this.previousStats.totalFlagged, 
            stats.totalFlagged
        );
        
        const avgScoreChange = this.calculatePercentageChange(
            this.previousStats.avgDetectionScore, 
            stats.avgDetectionScore
        );
        
        // Update previous stats
        this.previousStats = {
            totalFlagged: stats.totalFlagged,
            avgDetectionScore: stats.avgDetectionScore,
            mostCommonTag: stats.mostCommonTag
        };
        
        // Update DOM elements
        this.elements.totalFlagged.textContent = stats.totalFlagged;
        this.elements.totalFlaggedChange.textContent = `${totalFlaggedChange >= 0 ? '+' : ''}${totalFlaggedChange.toFixed(2)}%`;
        this.elements.totalFlaggedChange.className = `change ${totalFlaggedChange >= 0 ? 'positive' : 'negative'}`;
        
        this.elements.avgDetectionScore.textContent = `${(stats.avgDetectionScore * 100).toFixed(0)}%`;
        this.elements.avgScoreChange.textContent = `${avgScoreChange >= 0 ? '+' : ''}${avgScoreChange.toFixed(2)}%`;
        this.elements.avgScoreChange.className = `change ${avgScoreChange >= 0 ? 'positive' : 'negative'}`;
        
        this.elements.reviewTime.textContent = stats.reviewTime;
        // Assuming negative change for review time is good (faster reviews)
        this.elements.reviewTimeChange.textContent = '-26.52%';
        this.elements.reviewTimeChange.className = 'change negative';
        
        this.elements.mostCommonTag.textContent = stats.mostCommonTag;
        // Assuming a change in the most common tag is neutral
        this.elements.commonTagChange.textContent = '+12.05%';
        this.elements.commonTagChange.className = 'change positive';
    },
    
    // Calculate percentage change between old and new values
    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) return 0;
        return ((newValue - oldValue) / oldValue) * 100;
    },
    
    // Update flagged transactions table
    updateTransactionsTable(transactions) {
        this.elements.flaggedTableBody.innerHTML = '';
        
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(transaction.timestamp);
            const formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ${date.getHours() >= 12 ? 'pm' : 'am'}`;
            
            row.innerHTML = `
                <td><span class="status-indicator">${transaction.status || 'Flagged'}</span></td>
                <td>${transaction.transaction_id || 'Unknown'}</td>
                <td>${transaction.amount || 0} ${transaction.asset || 'Unknown'}</td>
                <td>
                    <div class="score-bar">
                        <div class="score-indicator" style="width: ${transaction.suspicion?.detection_score || 0}%"></div>
                        <span>${transaction.suspicion?.detection_score || 0}%</span>
                    </div>
                </td>
                <td>${transaction.suspicion?.reason || 'Unknown'}</td>
                <td>${transaction.review?.reviewed_by || 'Unknown'}</td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <button class="btn-block" data-id="${transaction.transaction_id}">Block</button>
                    <button class="btn-warn" data-id="${transaction.transaction_id}">Warn</button>
                </td>
            `;
            
            this.elements.flaggedTableBody.appendChild(row);
        });
    },
    
    // Export data as CSV
    exportData() {
        fetch('/api/flagged-accounts')
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    this.showNotification('No data to export', 'warning');
                    return;
                }
                
                const headers = ['Transaction ID', 'Amount', 'Asset', 'Detection Score', 'Reason', 'Reviewed By', 'Date', 'Status', 'Action'];
                const csvContent = [
                    headers.join(','),
                    ...data.map(item => [
                        item.transaction_id || '',
                        item.amount || '',
                        item.asset || '',
                        item.suspicion?.detection_score || '',
                        item.suspicion?.reason || '',
                        item.review?.reviewed_by || '',
                        new Date(item.timestamp).toLocaleString(),
                        item.status || '',
                        item.action || 'None'
                    ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', 'flagged-transactions.csv');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            })
            .catch(error => {
                console.error('Error exporting data:', error);
                this.showNotification('Failed to export data', 'error');
            });
    }
};

// Initialize the dashboard when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.initialize();
});
