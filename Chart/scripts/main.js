let data;

// Load Data
d3.csv('data/sales_data_100.csv').then(_data => {
    // Convert values to numbers (Sales, Profit, Rating, Cost)
    data = _data.map(d => {
        d.Sales = +d.Sales;   // Convert Sales to number
        d.Profit = +d.Profit; // Convert Profit to number
        d.Rating = +d.Rating; // Convert Rating to number
        d.Cost = +d.Cost;     // Convert Cost to number
        return d;
    });

    // Log data to console
    console.log('Data loaded successfully:', data);

    // Load default chart (Bar Chart)
    loadChart('area');
}).catch(error => {
    console.error('Error loading the data:', error);
});

// Toggle Sidebar

// Add event listeners to chart options
document.getElementById('lineChart').addEventListener('click', () => loadChart('line'));
document.getElementById('barChart').addEventListener('click', () => loadChart('bar'));
document.getElementById('scatterChart').addEventListener('click', () => loadChart('scatter'));
document.getElementById('pieChart').addEventListener('click', () => loadChart('pie'));
document.getElementById('areaChart').addEventListener('click', () => loadChart('area'));
// Load Charts with Smooth Transitions
function loadChart(type) {
    const chartElement = document.getElementById('chart');

    // Fade out current chart
    chartElement.style.opacity = 0;

    // Wait for fade-out animation to complete
    setTimeout(() => {
        // Clear the chart container
        chartElement.innerHTML = '';

        // Fade in new chart
        chartElement.style.opacity = 1;

        const config = {
            parentElement: '#chart',
            containerWidth: 700,
            containerHeight: 430
        };

        let chart;
        switch (type) {
            case 'area':
                chart = new AreaChart(config, data);
                break;
            case 'scatter':
                chart = new ScatterPlot(config, data);
                break;
            case 'pie':
                chart = new PieChart(config, data);
                break;
            case 'bar':
                chart = new BarChart(config, data);
                break;
            case 'line':
                chart = new LineChart(config, data);
                break;
            
            default:
                console.error("Unknown chart type");
        }
    }, 500); // Match the transition duration in CSS
}
