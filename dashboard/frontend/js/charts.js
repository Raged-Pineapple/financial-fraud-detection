const Charts = {
  activityChart: null,
  fraudTypesChart: null,
  
  // Initialize charts
  initialize() {
    this.setupActivityChart();
    this.setupFraudTypesChart();
    // Set global Chart.js defaults for consistent styling
    this.setGlobalChartOptions();
  },
  
  // Set global chart options for consistent styling
  setGlobalChartOptions() {
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--light-text').trim();
    Chart.defaults.elements.line.tension = 0.4;
    Chart.defaults.elements.line.borderWidth = 3;
    Chart.defaults.elements.point.radius = 4;
    Chart.defaults.elements.point.hoverRadius = 6;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(17, 24, 39, 0.8)';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold', size: 14 };
    Chart.defaults.animation.duration = 1500;
    Chart.defaults.animation.easing = 'easeOutQuart';
  },
  
  // Setup the activity trends line chart
  setupActivityChart() {
    const ctx = document.getElementById('activity-chart').getContext('2d');
    
    // Create gradient for area under line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
    
    this.activityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Suspicious Activities',
          data: [],
          backgroundColor: gradient,
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'rgba(79, 70, 229, 1)',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animations: {
          tension: {
            duration: 1000,
            easing: 'linear',
            from: 0.4,
            to: 0.5,
            loop: true
          }
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: 'rgba(203, 213, 225, 0.2)'
            },
            ticks: {
              padding: 10,
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(203, 213, 225, 0.2)'
            },
            ticks: {
              padding: 10,
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                return `Time: ${tooltipItems[0].label}`;
              },
              label: function(context) {
                return `  Detected Events: ${context.raw}`;
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: true
        }
      }
    });
  },
  
  // Setup the fraud types pie chart with improved visual design
  setupFraudTypesChart() {
    const ctx = document.getElementById('fraud-types-chart').getContext('2d');
    
    this.fraudTypesChart = new Chart(ctx, {
      type: 'doughnut', // Changed to doughnut for more modern look
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgba(79, 70, 229, 0.8)',  // Primary color
            'rgba(124, 58, 237, 0.8)', // Secondary color
            'rgba(236, 72, 153, 0.8)', // Pink
            'rgba(248, 113, 113, 0.8)', // Red
            'rgba(251, 191, 36, 0.8)',  // Yellow
            'rgba(16, 185, 129, 0.8)'   // Green
          ],
          borderColor: 'white',
          borderWidth: 2,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%', // Makes the doughnut thinner
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.formattedValue;
                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        // Add a center text plugin to show total
        plugins: [{
          id: 'centerText',
          beforeDraw: function(chart) {
            const width = chart.width;
            const height = chart.height;
            const ctx = chart.ctx;
            
            ctx.restore();
            const fontSize = (height / 160).toFixed(2);
            ctx.font = `${fontSize}em sans-serif`;
            ctx.textBaseline = 'middle';
            
            const text = 'Total';
            const textWidth = ctx.measureText(text).width;
            
            const centerX = (width - textWidth) / 2;
            const centerY = height / 2 - 15;
            
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--light-text').trim();
            ctx.fillText(text, centerX, centerY);
            
            if (chart.data.datasets[0].data.length) {
              const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              ctx.font = `bold ${fontSize * 1.5}em sans-serif`;
              const totalText = total.toString();
              const totalTextWidth = ctx.measureText(totalText).width;
              ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
              ctx.fillText(totalText, (width - totalTextWidth) / 2, height / 2 + 15);
            }
            
            ctx.save();
          }
        }],
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  },
  
  // Update activity trends chart with new data and animations
  updateActivityChart(data) {
    if (!this.activityChart) return;
    console.log("Updating Activity Chart", data);
    
    const labels = data.map(item => `${item.hour}:00`);
    const counts = data.map(item => item.count);
    
    // Animate the updates
    this.activityChart.data.labels = labels;
    this.activityChart.data.datasets[0].data = counts;
    
    // Use animation to update
    this.activityChart.update('active');
  },
  
  // Update fraud types chart with new data and animations
  updateFraudTypesChart(data) {
    if (!this.fraudTypesChart) return;
    
    const labels = data.map(item => item._id);
    const counts = data.map(item => item.count);
    
    // Animate the updates
    this.fraudTypesChart.data.labels = labels;
    this.fraudTypesChart.data.datasets[0].data = counts;
    
    // Use animation to update
    this.fraudTypesChart.update('active');
  },
  
  // Add shimmer loading effect to charts
  showLoading() {
    const containers = document.querySelectorAll('.chart-container');
    containers.forEach(container => {
      container.classList.add('loading');
    });
  },
  
  // Remove loading effect
  hideLoading() {
    const containers = document.querySelectorAll('.chart-container');
    containers.forEach(container => {
      container.classList.remove('loading');
    });
  }
};