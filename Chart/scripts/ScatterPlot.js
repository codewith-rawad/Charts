class ScatterPlot extends Chart {
    constructor(_config, data) {
        super(_config, data);
        this.updateVis();
    }

    updateVis(selectedRatingRange = '>3') {
        const vis = this;

        if (!vis.data || vis.data.length === 0) {
            console.error("No data available.");
            return;
        }

        let filteredData = vis.data;
        if (selectedRatingRange !== 'All') {
            const minRating = parseFloat(selectedRatingRange.replace('>', ''));
            filteredData = vis.data.filter(d => d.Rating > minRating);
        }

        if (filteredData.length === 0) {
            console.error(`No data available for rating range ${selectedRatingRange}.`);
            return;
        }

        filteredData.sort((a, b) => d3.ascending(a.Year, b.Year));

        vis.renderVis(filteredData, selectedRatingRange);
    }

    renderVis(filteredData, selectedRatingRange) {
        const vis = this;

        if (!vis.svg) {
            console.error('SVG element is undefined');
            return;
        }

        vis.svg.selectAll('*').remove();

        const margin = {top: 20, right: 50, bottom: 30, left: 50};
        const width = vis.width - margin.left - margin.right;
        const height = vis.height - margin.top - margin.bottom;

        const x = d3.scaleLinear().domain([0, d3.max(filteredData, d => d.Sales)]).nice().range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max(filteredData, d => d.Profit)]).nice().range([height, 0]);

        vis.svg.append('text')
            .attr('x', vis.width / 2)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '30px')
            .attr('fill', 'yellow')
            .attr('font-weight', 'bold')
            .attr('class', 'title')
            .text(`Sales vs Profit (Rating: ${selectedRatingRange})`);

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

        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([d3.min(filteredData, d => d.Rating), d3.max(filteredData, d => d.Rating)]);

        vis.svg.selectAll('.dot')
            .data(filteredData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.Sales) + margin.left)
            .attr('cy', d => y(d.Profit) + margin.top)
            .attr('r', 5)
            .attr('fill', d => colorScale(d.Rating))
            .on('mouseover', function (event, d) {
                const tooltip = document.getElementById('tooltip');
                tooltip.style.display = 'block';
                tooltip.style.top = (event.pageY + 5) + "px";
                tooltip.style.left = (event.pageX + 5) + "px";
                tooltip.innerHTML = `Year: ${d.Year}<br>Sales: ${d.Sales}<br>Profit: ${d.Profit}<br>Rating: ${d.Rating}`;
            })
            .on('mouseout', function () {
                const tooltip = document.getElementById('tooltip');
                tooltip.style.display = 'none';
            });

        const ratingSelect = vis.svg.append('foreignObject')
            .attr('x', width + margin.left - 30)
            .attr('y', margin.top + 50)
            .attr('width', 300)
            .attr('height', 200)
            .append('xhtml:select')
            .style('background-color', '#ffcc00')
            .style('color', '#333')
            .style('font-size', '14px')
            .style('border-radius', '5px')
            .style('padding', '5px')
            .on('change', function (event) {
                const selectedRange = event.target.value;
                vis.updateVis(selectedRange);
            });

        ratingSelect.selectAll('option')
            .data(['>3', '>4', '>5', 'All'])
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => {
                if (d === 'All') return 'All Ratings';
                return `Rating ${d}`;
            });
    }
}
