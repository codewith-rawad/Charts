class LineChart extends Chart {
    constructor(_config, data) {
        super(_config, data);
        this.updateVis();
    }

    updateVis(selectedCategory = 'Sports') {
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
        const lineData = Array.from(groupedData, ([year, values]) => ({
            year: year,
            sales: d3.sum(values, d => +d.Sales)
        }));

        if (lineData.length === 0) {
            console.error(`No data available for category ${selectedCategory}.`);
            return;
        }

        vis.renderVis(selectedCategory, lineData);
    }

    renderVis(selectedCategory, lineData) {
        const vis = this;

        if (!vis.svg) {
            console.error('SVG element is undefined');
            return;
        }

        vis.svg.selectAll('*').remove();

        const margin = {top: 20, right: 50, bottom: 30, left: 50};
        const width = vis.width - margin.left - margin.right;
        const height = vis.height - margin.top - margin.bottom;

        const x = d3.scaleBand().domain(lineData.map(d => d.year)).range([0, width]).padding(0.1);
        const y = d3.scaleLinear().domain([0, d3.max(lineData, d => d.sales)]).nice().range([height, 0]);

        vis.svg.append('text')
            .attr('x', vis.width / 2)
            .attr('y', margin.top)
            .attr('text-anchor', 'middle')
            .attr('font-size', '30px')
            .attr('fill','yellow')
            .attr('font-weight', 'bold')
            .attr('class', 'title')
            .text(`Sales Over Time for ${selectedCategory}`);

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

        const line = d3.line()
            .x(d => x(d.year) + margin.left)
            .y(d => y(d.sales) + margin.top);

        vis.svg.append('path')
            .data([lineData])
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', '#87CEFA')
            .attr('stroke-width', 2)
            .attr('d', line);

        const legend = vis.svg.append('g')
            .attr('transform', `translate(${width + margin.left + 20}, ${margin.top})`);

        legend.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', '#ffcc00');

        legend.append('text')
            .attr('x', 25)
            .attr('y', 9)
            .attr('dy', '.35em')
            .attr('font-size', '12px')
            .attr('fill', 'yellow')
            .text(selectedCategory);

        const categorySelect = vis.svg.append('foreignObject')
            .attr('x', width + margin.left-30 )
            .attr('y', margin.top + 50)
            .attr('width',300)
            .attr('height', 200)
            .append('xhtml:select')
            .style('background-color', '#ffcc00')
            .style('color', '#333')
            .style('font-size', '14px')
            .style('border-radius', '5px')
            .style('padding', '5px')
            .on('change', function (event) {
                const selectedCategory = event.target.value;
                vis.updateVis(selectedCategory);
            });

        categorySelect.selectAll('option')
            .data(['Sports', 'Home', 'Fashion', 'Electronics','Books'])
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => `${d}`);

        const tooltip = d3.select("#tooltip");

        vis.svg.selectAll('.dot')
            .data(lineData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.year) + margin.left)
            .attr('cy', d => y(d.sales) + margin.top)
            .attr('r', 5)
            .attr('fill', '#ffcc00')
            .on('mouseover', function (event, d) {
                tooltip.style("display", "block")
                    .html(`Year: ${d.year}<br>Sales: ${d.sales}`);
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
