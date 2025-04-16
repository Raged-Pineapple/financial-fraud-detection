// API service for handling server requests
const API = {
  baseUrl: 'http://localhost:3000/api',
  
  // Request cache to avoid unnecessary network requests
  cache: {
    data: {},
    timestamp: {},
    maxAge: 30000 // 30 seconds cache expiry
  },
  
  // Check if cached data is still valid
  isCacheValid(endpoint) {
    const now = Date.now();
    return this.cache.timestamp[endpoint] && 
           (now - this.cache.timestamp[endpoint] < this.cache.maxAge);
  },
  
  // Generic fetch method with error handling, caching, and loading state
  async fetchWithCache(endpoint, options = {}, useCache = true) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Return cached data if valid and cache usage is requested
    if (useCache && this.isCacheValid(endpoint)) {
      return this.cache.data[endpoint];
    }
    
    // Dispatch event to show loading state for specific section
    document.dispatchEvent(new CustomEvent('api:loading', { 
      detail: { endpoint } 
    }));
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
        },
        ...options
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the successful response
      if (useCache) {
        this.cache.data[endpoint] = data;
        this.cache.timestamp[endpoint] = Date.now();
      }
      
      // Dispatch event to hide loading state
      document.dispatchEvent(new CustomEvent('api:loaded', { 
        detail: { endpoint, data } 
      }));
      
      return data;
    } catch (error) {
      // Dispatch event for error handling
      document.dispatchEvent(new CustomEvent('api:error', { 
        detail: { endpoint, error: error.message } 
      }));
      
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Clear all cached data
  clearCache() {
    this.cache.data = {};
    this.cache.timestamp = {};
  },
  
  // Fetch flagged transactions with optional filters
  async getFlaggedTransactions(filters = {}) {
    // Convert filters to query string
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchWithCache(`/transactions/flagged${queryString}`);
  },
  
  // Take action on a transaction (block, approve, warn)
  async updateTransactionStatus(transactionId, action, notes = '') {
    const response = await this.fetchWithCache(`/transactions/${transactionId}/status`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    }, false);
    
    // Clear cache to ensure fresh data on next fetch
    this.clearCache();
    return response;
  },
  
  // Fetch dashboard statistics
  async getDashboardStats() {
    try {
      return await this.fetchWithCache('/dashboard/stats');
    } catch (error) {
      // Return fallback data if request fails
      return {
        totalFlagged: 0,
        avgDetectionScore: 0,
        reviewTime: 'N/A',
        mostCommonTag: 'N/A'
      };
    }
  },
  
  // Fetch fraud types distribution
  async getFraudTypesDistribution() {
    try {
      return await this.fetchWithCache('/dashboard/fraud-types');
    } catch (error) {
      return [];
    }
  },
  
  // Fetch suspicious activity trends
  async getActivityTrends(period = 'daily') {
    try {
      return await this.fetchWithCache(`/dashboard/activity-trends?period=${period}`);
    } catch (error) {
      return [];
    }
  },
  
  // New endpoint: Fetch historical fraud data
  async getFraudHistory(months = 6) {
    try {
      return await this.fetchWithCache(`/dashboard/fraud-history?months=${months}`);
    } catch (error) {
      return [];
    }
  },
  
  // New endpoint: Fetch geographic distribution of fraud
  async getGeoDistribution() {
    try {
      return await this.fetchWithCache('/dashboard/geo-distribution');
    } catch (error) {
      return [];
    }
  },
  
  // New endpoint: Export data in various formats
  async exportData(format = 'csv', filters = {}) {
    // Convert filters to query string
    const params = new URLSearchParams();
    params.append('format', format);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    try {
      const response = await fetch(`${this.baseUrl}/export?${params.toString()}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      // Handle different export formats
      if (format === 'csv' || format === 'excel') {
        const blob = await response.blob();
        const filename = response.headers.get('Content-Disposition')
          ?.split('filename=')[1]?.replace(/"/g, '') || `fraud-data.${format}`;
          
        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        return { success: true, filename };
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error('Export failed:', error);
      document.dispatchEvent(new CustomEvent('api:error', { 
        detail: { endpoint: '/export', error: error.message } 
      }));
      return { success: false, error: error.message };
    }
  }
};