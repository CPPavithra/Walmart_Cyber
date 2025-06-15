// Configuration
const config = {
  apiEndpoint: 'http://localhost:8000/api/events',
  simulationEndpoint: 'http://localhost:8000/simulate',
  updateInterval: 2000,
  animationDuration: 500,
  threatLevels: {
    normal: { color: "#2ecc71", threshold: 0 },
    warning: { color: "#f39c12", threshold: 3 },
    critical: { color: "#e74c3c", threshold: 5 }
  }
};

// Error Handling System
const errorHandler = {
  init: function() {
    // Create error display element if it doesn't exist
    if (!d3.select("#error-display").node()) {
      d3.select("body").append("div")
        .attr("id", "error-display")
        .style("position", "fixed")
        .style("bottom", "20px")
        .style("left", "50%")
        .style("transform", "translateX(-50%)")
        .style("background", "#e74c3c")
        .style("color", "white")
        .style("padding", "10px 20px")
        .style("border-radius", "4px")
        .style("box-shadow", "0 2px 10px rgba(0,0,0,0.2)")
        .style("z-index", "1000")
        .style("display", "none");
    }
  },
  
  show: function(message) {
    d3.select("#error-display")
      .style("display", "block")
      .html(`
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-weight: bold">⚠️ Error:</span>
          <span>${message}</span>
        </div>
      `);
    
    // Auto-hide after 5 seconds
    setTimeout(() => this.hide(), 5000);
  },
  hide: function() {
    d3.select("#error-display").style("display", "none");
  }
};

// Initialize error handler when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  errorHandler.init();
  initDashboard();
  addSimulationUI();
});


// Main visualization function
function initDashboard() {
  // Create main container
  const container = d3.select("#dashboard-container")
    .html("") // Clear existing content
    .style("display", "grid")
    .style("grid-template-columns", "1fr 1fr 1fr")
    .style("grid-template-rows", "80px 1fr 1fr")
    .style("gap", "20px")
    .style("padding", "20px")
    .style("background-color", "#0a1929")
    .style("color", "white")
    .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");

  // Header
  container.append("div")
    .attr("class", "dashboard-header")
    .style("grid-column", "1 / 4")
    .html(`
      <div style="display: flex; justify-content: space-between; align-items: center">
        <div>
          <h1 style="margin: 0; font-size: 2rem">Walmart NeuroRetailX Command Center</h1>
          <p style="margin: 0; opacity: 0.8">Real-time Cyber Immune System Monitoring</p>
        </div>
        <div id="threat-level" style="background: #2ecc71; padding: 10px 20px; border-radius: 20px; font-weight: bold">
          THREAT LEVEL: NORMAL
        </div>
      </div>
    `);

  // System Health Gauge
  createHealthGauge(container);

  // Network Activity Graph
  createNetworkGraph(container);

  // Threat Timeline
  createThreatTimeline(container);

  // Attack Simulation Controls
  createSimulationControls(container);

  // Pod Status Grid
  createPodStatusGrid(container);

  // Log Stream
  createLogStream(container);

  // Initial load
  fetchData();

  // Set up periodic updates
  setInterval(fetchData, config.updateInterval);
}

function createHealthGauge(container) {
  const gaugeContainer = container.append("div")
    .attr("class", "gauge-container")
    .style("grid-column", "1")
    .style("grid-row", "2")
    .style("background", "#14253d")
    .style("border-radius", "8px")
    .style("padding", "20px");

  gaugeContainer.append("h3")
    .style("margin-top", "0")
    .style("border-bottom", "1px solid #2a3a56")
    .style("padding-bottom", "10px")
    .text("SYSTEM HEALTH");

  const svg = gaugeContainer.append("svg")
    .attr("width", "100%")
    .attr("height", "200")
    .attr("viewBox", "0 0 200 100");

  // Gauge background
  svg.append("path")
    .attr("d", "M 20 80 A 60 60 0 0 1 180 80")
    .attr("fill", "none")
    .attr("stroke", "#2a3a56")
    .attr("stroke-width", "15");

  // Gauge fill (will be updated)
  svg.append("path")
    .attr("d", "M 20 80 A 60 60 0 0 1 180 80")
    .attr("fill", "none")
    .attr("stroke", "#2ecc71")
    .attr("stroke-width", "15")
    .attr("stroke-dasharray", "188.5")
    .attr("stroke-dashoffset", "94.25")
    .attr("class", "gauge-fill");

  // Gauge needle
  svg.append("path")
    .attr("d", "M 100 20 L 95 80 L 105 80 Z")
    .attr("fill", "#fff")
    .attr("class", "gauge-needle");

  // Gauge labels
  svg.append("text")
    .attr("x", 30)
    .attr("y", 70)
    .text("0%")
    .attr("fill", "#7f8c8d");

  svg.append("text")
    .attr("x", 100)
    .attr("y", 30)
    .text("50%")
    .attr("fill", "#7f8c8d")
    .attr("text-anchor", "middle");

  svg.append("text")
    .attr("x", 170)
    .attr("y", 70)
    .text("100%")
    .attr("fill", "#7f8c8d");

  // Current value
  svg.append("text")
    .attr("x", 100)
    .attr("y", 95)
    .attr("text-anchor", "middle")
    .attr("font-size", "24")
    .attr("font-weight", "bold")
    .text("0%")
    .attr("class", "gauge-value");
}

function createNetworkGraph(container) {
  const graphContainer = container.append("div")
    .attr("class", "network-graph")
    .style("grid-column", "2 / 4")
    .style("grid-row", "2")
    .style("background", "#14253d")
    .style("border-radius", "8px")
    .style("padding", "20px");

  graphContainer.append("h3")
    .style("margin-top", "0")
    .style("border-bottom", "1px solid #2a3a56")
    .style("padding-bottom", "10px")
    .text("NETWORK ACTIVITY & THREAT DETECTION");

  const svg = graphContainer.append("svg")
    .attr("width", "100%")
    .attr("height", "300")
    .attr("viewBox", "0 0 800 300");

  // Create force-directed graph simulation
  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(400, 150));

  // Will be populated with real data
  svg.append("g").attr("class", "links");
  svg.append("g").attr("class", "nodes");
}

// Modified simulateAttack function
async function simulateAttack(type) {
  try {
    errorHandler.hide(); // Clear any previous errors
    
    const response = await fetch(`${config.simulationEndpoint}/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    const data = await response.json();
    
    // Visual feedback
    const attackDiv = d3.select("#dashboard-container")
      .append("div")
      .attr("class", "attack-notification")
      .style("position", "fixed")
      .style("top", "50%")
      .style("left", "50%")
      .style("transform", "translate(-50%, -50%)")
      .style("background", "rgba(231, 76, 60, 0.9)")
      .style("color", "white")
      .style("padding", "20px 40px")
      .style("border-radius", "8px")
      .style("z-index", "1000")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text(`SIMULATING ${type.toUpperCase()} ATTACK!`);
  setTimeout(() => attackDiv.remove(), 2000);
    
    // Update dashboard immediately
    fetchData();
    
  } catch (error) {
    console.error("Simulation failed:", error);
    errorHandler.show(`Attack simulation failed: ${error.message}`);
  }
}



function createThreatTimeline(container) {
  const timelineContainer = container.append("div")
    .attr("class", "threat-timeline")
    .style("grid-column", "1 / 3")
    .style("grid-row", "3")
    .style("background", "#14253d")
    .style("border-radius", "8px")
    .style("padding", "20px");

  timelineContainer.append("h3")
    .style("margin-top", "0")
    .style("border-bottom", "1px solid #2a3a56")
    .style("padding-bottom", "10px")
    .text("THREAT TIMELINE");

  const svg = timelineContainer.append("svg")
    .attr("width", "100%")
    .attr("height", "250")
    .attr("viewBox", "0 0 800 250");

  // X axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0,200)");

  // Y axis
  svg.append("g")
    .attr("class", "y-axis");

  // Line path
  svg.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#e74c3c")
    .attr("stroke-width", 2);
}

function createSimulationControls(container) {
  const controls = container.append("div")
    .attr("class", "simulation-controls")
    .style("grid-column", "3")
    .style("grid-row", "3")
    .style("background", "#14253d")
    .style("border-radius", "8px")
    .style("padding", "20px")
    .style("display", "flex")
    .style("flex-direction", "column");

  controls.append("h3")
    .style("margin-top", "0")
    .style("border-bottom", "1px solid #2a3a56")
    .style("padding-bottom", "10px")
    .text("ATTACK SIMULATIONS");

  const attackTypes = [
    { name: "Ransomware", color: "#e74c3c", icon: "💀" },
    { name: "Brute Force", color: "#f39c12", icon: "🔥" },
    { name: "DDoS", color: "#9b59b6", icon: "🌐" },
    { name: "Insider Threat", color: "#3498db", icon: "👤" }
  ];

  attackTypes.forEach(attack => {
    controls.append("button")
      .style("background", attack.color)
      .style("color", "white")
      .style("border", "none")
      .style("padding", "10px")
      .style("margin", "5px 0")
      .style("border-radius", "4px")
      .style("cursor", "pointer")
      .style("display", "flex")
      .style("align-items", "center")
      .style("gap", "10px")
      .style("transition", "all 0.3s")
      .on("mouseover", function() {
        d3.select(this).style("transform", "scale(1.02)");
      })
      .on("mouseout", function() {
        d3.select(this).style("transform", "scale(1)");
      })
      .on("click", () => simulateAttack(attack.name.toLowerCase()))
      .html(`${attack.icon} Simulate ${attack.name} Attack`);
  });

  // System controls
  controls.append("div")
    .style("margin-top", "auto")
    .style("padding-top", "20px")
    .style("border-top", "1px solid #2a3a56")
    .html(`
      <h4>System Controls</h4>
      <button id="auto-heal-btn" style="background: #2ecc70; color: white; border: none; padding: 8px; border-radius: 4px; width: 100%; cursor: pointer">
        🛡️ Toggle Auto-Healing
      </button>
    `);
}


// Update your attack buttons to use consistent types
function addSimulationUI() {
  const controls = d3.select("body")
    .append("div")
    .attr("class", "simulation-controls");

  const attacks = [
    { name: "Ransomware", type: "ransomware" },
    { name: "Brute Force", type: "bruteforce" },
    { name: "DDoS", type: "ddos" },
    { name: "Insider Threat", type: "insiderthreat" }
  ];

  attacks.forEach(attack => {
    controls.append("button")
      .text(`Simulate ${attack.name}`)
      .on("click", () => simulateAttack(attack.type));
// Add to your addSimulationUI() function
controls.append("button")
    .text("🚀 Run Full Simulation")
    .style("background", "linear-gradient(90deg, #e74c3c, #f39c12)")
    .on("click", () => simulateAttack("all"));
  });
}

function createPodStatusGrid(container) {
  const grid = container.append("div")
    .attr("class", "pod-grid")
    .style("grid-column", "1")
    .style("grid-row", "4")
    .style("background", "#14253d")
    .style("border-radius", "8px")
    .style("padding", "20px");

  grid.append("h3")
    .style("margin-top", "0")
    .style("border-bottom", "1px solid #2a3a56")
    .style("padding-bottom", "10px")
    .text("POD STATUS GRID");

  grid.append("div")
    .attr("class", "grid-container")
    .style("display", "grid")
    .style("grid-template-columns", "repeat(auto-fill, minmax(120px, 1fr))")
    .style("gap", "10px");
}

function createLogStream(container) {
  const logContainer = container.append("div")
    .attr("class", "log-stream")
    .style("grid-column", "2 / 4")
    .style("grid-row", "4")
    .style("background", "#14253d")
    .style("border-radius", "8px")
    .style("padding", "20px");

  logContainer.append("h3")
    .style("margin-top", "0")
    .style("border-bottom", "1px solid #2a3a56")
    .style("padding-bottom", "10px")
    .text("SECURITY EVENT LOG STREAM");

  logContainer.append("div")
    .attr("class", "log-content")
    .style("height", "200px")
    .style("overflow-y", "auto")
    .style("font-family", "monospace")
    .style("font-size", "12px")
    .style("background", "#0e1a2b")
    .style("padding", "10px")
    .style("border-radius", "4px");
}

// Data processing and visualization updates
// Modified fetchData function with proper error handling
async function fetchData() {
  try {
    const response = await fetch(config.apiEndpoint);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    updateAllVisualizations(data);
    errorHandler.hide();
  } catch (error) {
    console.error("Fetch error:", error);
    errorHandler.show(`Connection error: ${error.message}. Showing simulated data.`);
    updateAllVisualizations(generateMockData());
    
    // Try to reconnect after delay
    setTimeout(fetchData, 5000);
  }
}

function updateAllVisualizations(data) {
  const processedData = processEvents(data);
  
  // Update threat level
  updateThreatLevel(processedData);
  
  // Update system health gauge
  updateHealthGauge(processedData);
  
  // Update network graph
  updateNetworkGraph(processedData);
  
  // Update threat timeline
  updateThreatTimeline(processedData);
  
  // Update pod grid
  updatePodGrid(processedData);
  
  // Update log stream
  updateLogStream(processedData);
}

function updateThreatLevel(data) {
  const threatCount = data.filter(d => d.status !== "healthy").length;
  let threatLevel, color;
  
  if (threatCount >= config.threatLevels.critical.threshold) {
    threatLevel = "CRITICAL";
    color = config.threatLevels.critical.color;
  } else if (threatCount >= config.threatLevels.warning.threshold) {
    threatLevel = "WARNING";
    color = config.threatLevels.warning.color;
  } else {
    threatLevel = "NORMAL";
    color = config.threatLevels.normal.color;
  }
  
  d3.select("#threat-level")
    .text(`THREAT LEVEL: ${threatLevel}`)
    .style("background", color)
    .style("animation", threatLevel !== "NORMAL" ? "pulse 1s infinite" : "none");
}

function updateHealthGauge(data) {
  const healthyPods = data.filter(d => d.status === "healthy").length;
  const totalPods = data.length;
  const healthPercentage = totalPods > 0 ? Math.round((healthyPods / totalPods) * 100) : 100;
  
  // Update gauge fill
  const offset = 188.5 - (188.5 * healthPercentage / 100);
  d3.select(".gauge-fill")
    .attr("stroke-dashoffset", offset)
    .attr("stroke", getHealthColor(healthPercentage));
  
  // Update needle rotation
  const rotation = healthPercentage * 1.8 - 90; // Convert percentage to degrees (-90 to 90)
  d3.select(".gauge-needle")
    .attr("transform", `rotate(${rotation}, 100, 80)`);
  
  // Update value text
  d3.select(".gauge-value")
    .text(`${healthPercentage}%`)
    .attr("fill", getHealthColor(healthPercentage));
}

function getHealthColor(percentage) {
  if (percentage < 50) return "#e74c3c";
  if (percentage < 80) return "#f39c12";
  return "#2ecc71";
}

function updateNetworkGraph(data) {
  // Create nodes and links from pod data
  const nodes = data.map(pod => ({
    id: pod.name,
    group: pod.status === "healthy" ? 1 : pod.status === "restarting" ? 2 : 3,
    status: pod.status
  }));
  
  // Create some sample links between nodes
  const links = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    if (Math.random() > 0.7) { // Random connections
      links.push({
        source: nodes[i].id,
        target: nodes[i+1].id,
        value: Math.floor(Math.random() * 5) + 1
      });
    }
  }
  
  const svg = d3.select(".network-graph svg");
  
  // Update links
  const link = svg.select(".links")
    .selectAll("line")
    .data(links);
  
  link.enter()
    .append("line")
    .attr("stroke", "#3498db")
    .attr("stroke-width", d => d.value)
    .attr("stroke-opacity", 0.6)
    .merge(link)
    .attr("stroke", d => d.value > 3 ? "#e74c3c" : "#3498db");
  
  link.exit().remove();
  
  // Update nodes
  const node = svg.select(".nodes")
    .selectAll("g")
    .data(nodes, d => d.id);
  
  const nodeEnter = node.enter()
    .append("g")
    .attr("class", "node");
  
  nodeEnter.append("circle")
    .attr("r", 10)
    .attr("fill", d => {
      if (d.status === "healthy") return "#2ecc71";
      if (d.status === "restarting") return "#f39c12";
      return "#e74c3c";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);
  
  nodeEnter.append("text")
    .attr("dy", -15)
    .attr("text-anchor", "middle")
    .text(d => d.id.split("-")[0])
    .attr("fill", "#fff")
    .attr("font-size", "10px");
  
  node.merge(nodeEnter);
  node.exit().remove();
  
  // Restart simulation with new data
  d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(400, 150))
    .on("tick", () => {
      svg.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      svg.selectAll(".node")
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });
}

function updateThreatTimeline(data) {
  // Group events by time and count threats
  const threatCounts = data.reduce((acc, event) => {
    const time = new Date(event.timestamp || new Date()).getMinutes();
    acc[time] = (acc[time] || 0) + (event.status !== "healthy" ? 1 : 0);
    return acc;
  }, {});
  
  const timelineData = Object.entries(threatCounts).map(([time, count]) => ({
    time: parseInt(time),
    threats: count
  }));
  
  const svg = d3.select(".threat-timeline svg");
  const width = 800;
  const height = 250;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  
  // Create scales
  const x = d3.scaleLinear()
    .domain(d3.extent(timelineData, d => d.time))
    .range([margin.left, width - margin.right]);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(timelineData, d => d.threats)])
    .range([height - margin.bottom, margin.top]);
  
  // Update axes
  svg.select(".x-axis")
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}m`));
  
  svg.select(".y-axis")
    .call(d3.axisLeft(y));
  
  // Create line generator
  const line = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.threats));
  
  // Update line path
  svg.select(".line")
    .datum(timelineData)
    .attr("d", line);
  
  // Add circles for data points
  const points = svg.selectAll(".data-point")
    .data(timelineData);
  
  points.enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("r", 4)
    .attr("fill", "#e74c3c")
    .merge(points)
    .attr("cx", d => x(d.time))
    .attr("cy", d => y(d.threats));
  
  points.exit().remove();
}

function updatePodGrid(data) {
  const grid = d3.select(".grid-container")
    .selectAll(".pod-card")
    .data(data, d => d.id);
  
  const enter = grid.enter()
    .append("div")
    .attr("class", "pod-card")
    .style("background", "#0e1a2b")
    .style("border-radius", "4px")
    .style("padding", "10px")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center");
  
  enter.append("div")
    .attr("class", "pod-status")
    .style("width", "20px")
    .style("height", "20px")
    .style("border-radius", "50%")
    .style("margin-bottom", "5px");
  
  enter.append("div")
    .attr("class", "pod-name")
    .style("font-weight", "bold")
    .style("font-size", "12px")
    .style("text-align", "center")
    .style("margin-bottom", "5px");
  
  enter.append("div")
    .attr("class", "pod-time")
    .style("font-size", "10px")
    .style("opacity", "0.7");
  
  // Update all elements
  grid.merge(enter)
    .select(".pod-status")
    .style("background", d => {
      if (d.status === "healthy") return "#2ecc71";
      if (d.status === "restarting") return "#f39c12";
      return "#e74c3c";
    })
    .style("box-shadow", d => {
      if (d.status === "healthy") return "0 0 8px rgba(46, 204, 113, 0.5)";
      if (d.status === "restarting") return "0 0 8px rgba(243, 156, 18, 0.5)";
      return "0 0 8px rgba(231, 76, 60, 0.5)";
    });
  
  grid.merge(enter)
    .select(".pod-name")
    .text(d => d.name.split("-")[0]);
  
  grid.merge(enter)
    .select(".pod-time")
    .text(d => {
      const match = d.event.match(/(\d+m|\d+s)/);
      return match ? match[0] : "now";
    });
  
  grid.exit().remove();
}

function updateLogStream(data) {
  const logContent = d3.select(".log-content");
  
  // Add new entries
  data.forEach(event => {
    const timestamp = new Date().toLocaleTimeString();
    let logClass = "log-normal";
    
    if (event.status === "restarting") logClass = "log-warning";
    if (event.status === "crashed") logClass = "log-error";
    
    logContent.append("div")
      .attr("class", `log-entry ${logClass}`)
      .html(`
        <span class="log-time">[${timestamp}]</span>
        <span class="log-message">${event.event}</span>
      `);
  });
  
  // Limit to 50 entries
  const entries = logContent.selectAll(".log-entry");
  if (entries.size() > 50) {
    entries.nodes().slice(0, entries.size() - 50).forEach(n => n.remove());
  }
  
  // Auto-scroll to bottom
  logContent.node().scrollTop = logContent.node().scrollHeight;
}

function processEvents(events) {
  return events.map((event, i) => {
    const podMatch = event.match(/pod\/([\w-]+)/);
    const podName = podMatch ? podMatch[1] : `pod-${i}`;
    
    let status = "healthy";
    if (event.includes("Killing") || event.includes("Pulling")) status = "restarting";
    if (event.includes("BackOff") || event.includes("Failed")) status = "crashed";
    
    return {
      id: podName,
      name: podName,
      status: status,
      event: event,
      timestamp: new Date() // Add current timestamp
    };
  });
}

function generateMockData() {
  const statuses = ["Normal", "Warning", "Normal", "Warning", "Normal", "Failed"];
  return statuses.map((status, i) => {
    const podName = `neuroretailx-pod-${i}`;
    return `${i}m ${status} Event pod/${podName} Sample event message`;
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initDashboard);
