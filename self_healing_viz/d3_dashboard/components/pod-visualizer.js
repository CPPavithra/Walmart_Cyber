// components/pod-visualizer.js
let graphInstance;

function initGraphVisualizer() {
    const container = document.getElementById('pod-visualizer');
    if (!container) {
        console.error('Visualizer container not found');
        return;
    }

    // Dummy initial data
    const data = {
        nodes: [
            { id: 'API', group: 1 },
            { id: 'DB', group: 2 },
            { id: 'Auth', group: 3 },
            { id: 'Cache', group: 3 }
        ],
        links: [
            { source: 'API', target: 'DB' },
            { source: 'API', target: 'Auth' },
            { source: 'Auth', target: 'DB' },
            { source: 'API', target: 'Cache' }
        ]
    };

    graphInstance = ForceGraph3D()(container)
        .graphData(data)
        .nodeLabel(node => `${node.id}`)
        .nodeColor(node => {
            if (node.group === 1) return '#00ffe7';
            if (node.group === 2) return '#ff2a6d';
            return '#f7e600';
        })
        .linkWidth(1.5)
        .backgroundColor('#0d0221');
}

function updateGraphVisualizerStatus() {
    if (!graphInstance) return;

    const intensity = state.metrics.cpu / 100;
    graphInstance.nodeColor(node => {
        if (state.currentAttack === 'ransomware') {
            return '#ff0000';
        }
        return node.group === 1
            ? d3.interpolateCool(intensity)
            : node.group === 2
            ? d3.interpolateWarm(intensity)
            : '#f7e600';
    });
}

