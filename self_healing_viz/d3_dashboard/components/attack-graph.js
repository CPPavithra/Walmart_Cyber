let anomalyData = [];
let annotations = [];

function initAttackGraph() {
    const container = d3.select('#attack-graph');
    const width = container.node().clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    const x = d3.scaleTime().range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => x(d.timestamp))
        .y(d => y(d.value));

    svg.append('g').attr('class', 'x-axis')
        .attr('transform', `translate(0,${height - margin.bottom})`);

    svg.append('g').attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`);

    const path = svg.append('path')
        .attr('class', 'anomaly-line')
        .attr('fill', 'none')
        .attr('stroke-width', 2);

    const annotationGroup = svg.append('g').attr('class', 'annotations');

    function render() {
        if (anomalyData.length < 2) return;

        x.domain(d3.extent(anomalyData, d => d.timestamp));
        y.domain([0, d3.max(anomalyData, d => d.value) + 20]);

        svg.select('.x-axis').call(d3.axisBottom(x));
        svg.select('.y-axis').call(d3.axisLeft(y));

        const lastPoint = anomalyData[anomalyData.length - 1];
        const color = lastPoint.type === 'attack' ? '#ff2a6d' : '#00ff9d';

        path.datum(anomalyData)
            .attr('stroke', color)
            .attr('d', line);

        // Clear previous annotations
        annotationGroup.selectAll('*').remove();

        if (lastPoint.label) {
            annotationGroup.append('text')
                .attr('x', x(lastPoint.timestamp) + 10)
                .attr('y', y(lastPoint.value) - 15)
                .attr('fill', color)
                .attr('font-size', '14px')
                .attr('font-family', 'Orbitron, monospace')
                .text(lastPoint.label);
        }
    }

    // External function to simulate attack spike
    window.simulateAttackSpike = function () {
        const now = new Date();

        // ATTACK spike
        anomalyData.push({ timestamp: now, value: 90, type: 'attack', label: 'ATTACK ALERT' });
        render();

        // AUTO-REMEDIATION fallback after 5 seconds
        setTimeout(() => {
            const t = new Date();
            anomalyData.push({ timestamp: t, value: 30, type: 'remediate', label: 'AUTO-REMEDIATION' });
            render();
        }, 5000);
    };

    render();
}

