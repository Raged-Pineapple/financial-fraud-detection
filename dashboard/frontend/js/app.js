// Main application module that coordinates data fetching and UI updates
const App = {
    // Refresh interval in milliseconds (2 minutes)
    refreshInterval: 120000,
    intervalId: null,
    
    // Initialize the application
    initialize() {
      // Initialize modules
      Charts.initialize();
      Dashboard.initialize();
      
      // Fetch initial data
      this.fetchData();
      
      // Set up automatic refresh
      this.startAutoRefresh();
    },
    
    // Start automatic data refresh
    startAutoRefresh() {
      this.intervalId = setInterval(() => {
        this.fetchData();
      }, this.refreshInterval);
    },
    
    // Stop automatic data refresh
    stopAutoRefresh() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
    
    // Fetch all data from API and update UI
    async fetchData() {
      try {
        // Show loading state (could be enhanced with actual loading indicators)
        console.log('Fetching data...');
        
        // Fetch all data in parallel
        const [transactions, stats, fraudTypes, activityTrends] = await Promise.all([
          API.getFlaggedTransactions(),
          API.getDashboardStats(),
          API.getFraudTypesDistribution(),
          API.getActivityTrends()
        ]);
        
        // Update UI components
        Dashboard.updateStats(stats);
        Dashboard.updateTransactionsTable(transactions);
        Charts.updateActivityChart(activityTrends);
        Charts.updateFraudTypesChart(fraudTypes);
        
        console.log('Data update complete');
      } catch (error) {
        console.error('Error updating dashboard:', error);
      }
    }
  };
  
  // Initialize the application when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    App.initialize();
  });