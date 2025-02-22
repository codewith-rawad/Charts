class PieChart extends Chart {
    constructor(_config, data) {
        super(_config, data);
        this.updateVis();
    }

    updateVis(selectedYear = '2020') {
        const vis = this;

        if (!vis.data || vis.data.length === 0) {
            console.error("No data available.");
            return;
        }

        const filteredData = vis.data.filter(d => d.Year === selectedYear);
        const groupedData = d3.group(filteredData, d => d.Category);

        if (groupedData.size === 0) {
            console.error(`No categories available for the year ${selectedYear}.`);
            return;
        }

        vis.pieData = Array.from(groupedData, ([key, values]) => ({
            label: key,
            value: d3.sum(values, d => +d.Sales) || 0
        }));

        if (vis.pieData.length === 0) {
            console.error(`No data available for the year ${selectedYear}.`);
            return;
        }

        vis.renderVis(selectedYear);
    }

    renderVis(selectedYear) {
        const vis = this;

        if (!vis.svg) {
            console.error('SVG element is undefined');
            return;
        }

        vis.svg.selectAll('.arc').remove();
        vis.svg.selectAll('.legend').remove();
        vis.svg.selectAll('text.title').remove();

        const radius = Math.min(vis.width, vis.height) / 2;
        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        vis.svg.append('text')
            .attr('x', vis.width / 2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('font-size', '30px')
            .attr('margin-bottom','20px')
            .attr('fill','yellow')
            .attr('font-weight', 'bold')
            .attr('class', 'title')
            .text(`Sales Distribution by Category in ${selectedYear}`);

        const arcs = vis.svg.selectAll('.arc')
            .data(pie(vis.pieData))
            .enter()
            .append('g')
            .attr('class', 'arc')
            .attr('transform', `translate(${vis.width / 2}, ${vis.height / 2+30})`);

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => color(i))
            .on('mouseover', function (event, d) {
                d3.select(this).transition().duration(200).attr('d', d3.arc().innerRadius(0).outerRadius(radius + 10));
            })
            .on('mouseout', function (event, d) {
                d3.select(this).transition().duration(200).attr('d', arc);
            });

        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#fff')
            .text(d => {
                const total = d3.sum(vis.pieData, data => data.value);
                const percentage = total > 0 ? Math.round((d.data.value / total) * 100) : 0;
                return `${d.data.label}: ${percentage}%`;
            });

        const legend = vis.svg.append('g')
            .attr('transform', `translate(${vis.width / 2 + radius + 20}, 50)`);

        const legendItems = legend.selectAll('.legend')
            .data(vis.pieData)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);

        legendItems.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', (d, i) => color(i));

        legendItems.append('text')
            .attr('x', 25)
            .attr('y', 9)
            .attr('dy', '.35em')
            .attr('font-size', '12px')
            .attr('fill','yellow')
            .text(d => d.label);

        const tooltip = d3.select(vis.svg.node().parentNode)
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background-color', 'rgba(0, 0, 0, 0.7)')
            .style('color', '#fff')
            .style('padding', '5px')
            .style('border-radius', '3px');

        legendItems.on('mouseover', function (event, d) {
            const total = d3.sum(vis.pieData, data => data.value);
            const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;
            tooltip.style('visibility', 'visible')
                .html(`${d.label}: ${percentage}%`);
        }).on('mousemove', function (event) {
            tooltip.style('top', (event.pageY + 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        }).on('mouseout', function () {
            tooltip.style('visibility', 'hidden');
        });

        const yearSelect = vis.svg.append('foreignObject')
            .attr('x', vis.width / 2 + radius + 20)
            .attr('y', vis.height / 2 - 30)
            .attr('width', 150)
            .attr('height', 200)
            .append('xhtml:select')
            .style('background-color', '#ffcc00')
            .style('color', '#333')
            .style('font-size', '14px')
            .style('border-radius', '5px')
            .style('padding', '5px')
            .on('change', function (event) {
                const selectedYear = event.target.value;
                vis.updateVis(selectedYear);
            });

        yearSelect.selectAll('option')
            .data(['2020', '2021', '2022', '2023','2015','2017','2018'])
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => `Year ${d}`);
    }
}
