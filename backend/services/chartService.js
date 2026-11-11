const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');

/**
 * Generate pie chart image as base64
 * @param {number} critical - Critical count
 * @param {number} warning - Warning count
 * @param {number} info - Info count
 * @returns {Promise<string>} Base64 data URL of the chart image
 */
const generatePieChartImage = async (critical, warning, info) => {
  const width = 400;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Critical', 'Warning', 'Info'],
      datasets: [{
        data: [critical, warning, info],
        backgroundColor: [
          '#dc2626',  // Critical - Red
          '#f97316',  // Warning - Orange
          '#3b82f6',  // Info - Blue
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 14,
              family: 'Arial, sans-serif',
            },
            padding: 15,
            color: '#374151',
          },
        },
        title: {
          display: true,
          text: 'Event Distribution',
          font: {
            size: 18,
            weight: 'bold',
            family: 'Arial, sans-serif',
          },
          color: '#0f172a',
          padding: {
            top: 10,
            bottom: 20,
          },
        },
      },
    },
  });

  // Convert canvas to base64 data URL
  const imageData = canvas.toDataURL('image/png');
  
  return imageData;
};

module.exports = {
  generatePieChartImage,
};
