// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components if they exist
if (typeof initAttackGraph === 'function') {
    initAttackGraph();
}
    if (typeof initPodVisualizer === 'function') {
        initPodVisualizer();
    }
    
    if (typeof initAttackControls === 'function') {
        initAttackControls();
    }
    
    if (typeof startEventPolling === 'function') {
        startEventPolling();
    } else {
        console.warn('startEventPolling function not found');
    }
    
    updateClock();
    setInterval(updateMetrics, 2000);
});

function updateClusterStatus(status, message) {
    const healthIndicator = document.getElementById('cluster-health');
    if (!healthIndicator) return;
    
    healthIndicator.className = `health-indicator ${status}`;
    const statusText = healthIndicator.querySelector('.status-text');
    if (statusText) {
        statusText.textContent = message || status.toUpperCase();
    }
    
    if (status === 'healthy' && document.getElementById('recovery-sound')) {
        document.getElementById('recovery-sound').play();
    }
}

function addEventToStream(event) {
    const eventStream = document.getElementById('event-timeline');
    if (!eventStream) return;
    
    const eventElement = document.createElement('div');
    eventElement.className = `event ${event.type}`;
    
    const timestamp = document.createElement('span');
    timestamp.className = 'event-timestamp';
    timestamp.textContent = event.timestamp.toLocaleTimeString();
    
    const message = document.createElement('span');
    message.className = 'event-message';
    message.textContent = event.message;
    
    eventElement.appendChild(timestamp);
    eventElement.appendChild(message);
    eventStream.insertBefore(eventElement, eventStream.firstChild);
    
    if (eventStream.children.length > 50) {
        eventStream.removeChild(eventStream.lastChild);
    }
}

function updateMetrics() {

    if (state.currentAttack === 'ransomware') {
        state.metrics.podCount = 0;
    } else if (state.currentAttack === 'bruteforce') {
        state.metrics.cpu = Math.min(100, state.metrics.cpu + Math.random() * 30);
        state.metrics.memory = Math.min(100, state.metrics.memory + Math.random() * 15);
    } else {
        state.metrics.cpu = Math.max(0, state.metrics.cpu - Math.random() * 5);
        state.metrics.memory = Math.max(0, state.metrics.memory - Math.random() * 3);
        state.metrics.podCount = 1;
    }
    
    // Update UI
    updateElementText('cpu-load', `${Math.round(state.metrics.cpu)}%`);
    updateElementText('memory-usage', `${Math.round(state.metrics.memory)}%`);
    updateElementText('pod-count', state.metrics.podCount);
    
    updateGauge('cpu-gauge', state.metrics.cpu);
    updateGauge('memory-gauge', state.metrics.memory);
    updateGauge('pod-gauge', state.metrics.podCount * 100);
    
    if (typeof updatePodVisualizerStatus === 'function') {
        updatePodVisualizerStatus();
    }
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

function updateGauge(id, percent) {
    const gauge = document.getElementById(id);
    if (gauge) gauge.style.width = `${percent}%`;
}

function updateClock() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString();
        setTimeout(updateClock, 1000);
    }
}
