class BarChart extends Chart {
    constructor(_config, data) {
        super(_config, data);
        this.updateVis();
    }

    updateVis(selectedCategory = 'Sports', selectedMetric = 'Sales') {
        const vis = this;

        if (!vis.data || vis.data.length === 0) {
            console.error("No data available.");
            return;
        }

        const filteredData = vis.data.filter(d => d.Category === selectedCategory);

        if (filteredData.length === 0) {
            console.error(`No data available for category ${selectedCategory}.`);
            return;
        }

        filteredData.sort((a, b) => d3.ascending(a.Year, b.Year));

        const groupedData = d3.group(filteredData, d => d.Year);
        const barData = Array.from(groupedData, ([year, values]) => {
            const totalValue = d3.sum(values, d => +d[selectedMetric]);
            return { year: year, value: totalValue };
        });

        if (barData.length === 0) {
            console.error(`No data available for category ${selectedCategory}.`);
            return;
        }

        vis.renderVis(selectedCategory, barData, selectedMetric);
    }

    renderVis(selectedCategory, barData, selectedMetric) {
        const vis = this;

        if (!vis.svg) {
            console.error('SVG element is undefined');
            return;
        }

        vis.svg.selectAll('*').remove();

        const margin = {top: 20, right: 50, bottom: 30, left: 50};
        const width = vis.width - margin.left - margin.right;
        const height = vis.height - margin.top - margin.bottom;

        const x = d3.scaleBand().domain(barData.map(d => d.year)).range([0, width]).padding(0.1);
        const y = d3.scaleLinear().domain([0, d3.max(barData, d => d.value)]).nice().range([height, 0]);

        vis.svg.append('text')
            .attr('x', vis.width / 2)
            .attr('y', margin.top)
            .attr('text-anchor', 'middle')
            .attr('font-size', '30px')
            .attr('fill','yellow')
            .attr('font-weight', 'bold')
            .attr('class', 'title')
            .text(`Total ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Over Time for ${selectedCategory}`);

        const xAxis = d3.axisBottom(x);
        vis.svg.append('g')
            .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
            .call(xAxis)
            .attr('class', 'x-axis')
            .selectAll('text')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', 'yellow');

        const yAxis = d3.axisLeft(y);
        vis.svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .call(yAxis)
            .attr('class', 'y-axis')
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', 'yellow');

        vis.svg.selectAll('.bar')
            .data(barData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.year) + margin.left)
            .attr('y', d => y(d.value) + margin.top)
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value))
            .attr('fill', '#87CEFA')
            .attr('rx', 10)
            .attr('ry', 10)
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.1)')
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('fill', '#4682B4')
                    .attr('transform', 'scale(1.1)');
            })
            .on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('fill', '#87CEFA')
                    .attr('transform', 'scale(1)');
            });

        const legend = vis.svg.append('g')
            .attr('transform', `translate(${width + margin.left + 20}, ${margin.top})`);

        legend.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', '#87CEFA');

        legend.append('text')
            .attr('x', 25)
            .attr('y', 9)
            .attr('dy', '.35em')
            .attr('font-size', '12px')
            .attr('fill', 'yellow')
            .text(selectedCategory);

        const categorySelect = vis.svg.append('foreignObject')
            .attr('x', width + margin.left-20 )
            .attr('y', margin.top + 50)
            .attr('width', 300)
            .attr('height', 100)
            .append('xhtml:select')
            .style('background-color', '#ffcc00')
            .style('color', '#333')
            .style('font-size', '14px')
            .style('border-radius', '5px')
            .style('padding', '5px')
            .on('change', function (event) {
                const selectedCategory = event.target.value;
                vis.updateVis(selectedCategory, selectedMetric);
            });

        categorySelect.selectAll('option')
            .data(['Sports', 'Home', 'Fashion', 'Electronics','Books'])
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => `${d}`);

        const metricSelect = vis.svg.append('foreignObject')
            .attr('x', width + margin.left +10)
            .attr('y', margin.top + 150)
            .attr('width', 300)
            .attr('height', 100)
            .append('xhtml:select')
            .style('background-color', '#ffcc00')
            .style('color', '#333')
            .style('font-size', '14px')
            .style('border-radius', '5px')
            .style('padding', '5px')
            .on('change', function (event) {
                const selectedMetric = event.target.value;
                vis.updateVis(selectedCategory, selectedMetric);
            });

        metricSelect.selectAll('option')
            .data(['Sales', 'Cost', 'Profit'])
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => `${d}`);

        const tooltip = d3.select("#tooltip");

        vis.svg.selectAll('.bar')
            .data(barData)
            .on('mouseover', function (event, d) {
                tooltip.style("display", "block")
                    .html(`Year: ${d.year}<br>${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}: ${d.value}`);
            })
            .on('mousemove', function (event) {
                tooltip.style("top", (event.pageY + 5) + "px")
                    .style("left", (event.pageX + 5) + "px");
            })
            .on('mouseout', function () {
                tooltip.style("display", "none");
            });
    }
}
