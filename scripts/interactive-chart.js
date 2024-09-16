function createInteractiveChart(container, chartId) {
  if (chartId === 'chart1') {
    createChart1(container);
  } else if (chartId === 'chart2') {
    createChart2(container);
  }
  // Add more chart types as needed
}

function createChart1(container) {
  const circles = [
    { id: 'nsdap', name: 'NSDAP', details: ['SA', 'SS', 'Hitler Youth', 'German Labor Front', 'Nazi shopfloor activists'], x: 300, y: 100, radius: 80 },
    // ... (rest of the circles data)
  ];

  const svg = d3.select(container).append('svg')
    .attr('viewBox', '0 0 700 700')
    .attr('width', '100%')
    .attr('height', '100%');

  // ... (rest of the chart creation code)
}

// Add more chart creation functions as needed