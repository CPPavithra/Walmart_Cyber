// fetchEvents.js
let eventPollInterval;
const MAX_EVENTS = 50; // Maximum events to display


async function fetchEvents() {
    try {
        const response = await fetch(`http://localhost:8000/api/events`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const events = await response.json();
        processEvents(events);
    } catch (error) {
        console.error('Failed to fetch events:', error);
        // Add error to event stream
        addEventToStream({
            type: 'warning',
            message: `Failed to fetch events: ${error.message}`,
            timestamp: new Date()
        });
        
        // Retry after 10 seconds on error
        if (eventPollInterval) {
            clearInterval(eventPollInterval);
        }
        eventPollInterval = setTimeout(startEventPolling, 10000);
    }
}
function inferEventType(log) {
    const lowercase = log.toLowerCase();
    if (lowercase.includes("ransomware")) return "ransomware";
    if (lowercase.includes("brute")) return "bruteforce";
    if (lowercase.includes("ddos")) return "ddos";
    if (lowercase.includes("insider")) return "insider";
    return "generic";
}
function processEvents(events) {
    if (!Array.isArray(events)) {
        console.error('Received invalid events data:', events);
        return;
    }

    // Process newest events first
    events.slice().reverse().forEach(event => {
        if (typeof event === 'string' && event.trim() !== '') {
            const eventType = determineEventType(event);
            addEventToStream({
                type: eventType,
                message: event,
                timestamp: new Date()
            });
        }
    });
}

function determineEventType(eventText) {
    const lowerText = eventText.toLowerCase();
    
    if (lowerText.includes('scalingreplicaset') || 
        lowerText.includes('created') || 
        lowerText.includes('healthy')) {
        return 'recovery';
    } else if (lowerText.includes('killing') || 
               lowerText.includes('failed') || 
               lowerText.includes('error')) {
        return 'attack';
    } else if (lowerText.includes('backoff') || 
               lowerText.includes('warning')) {
        return 'warning';
    }
    return 'info';
}

// Make this available to other components
if (typeof addEventToStream !== 'function') {
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
        
        // Add to the top of the stream
        eventStream.insertBefore(eventElement, eventStream.firstChild);
        
        // Limit number of events
        while (eventStream.children.length > MAX_EVENTS) {
            eventStream.removeChild(eventStream.lastChild);
        }
    }
}

function startEventPolling() {
    setInterval(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/events'); // adjust if needed
            const data = await response.json();

            data.forEach(eventLine => {
                const event = {
                    timestamp: new Date(),
                    type: inferEventType(eventLine),
                    message: eventLine
                };
                addEventToStream(event);
            });
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }, 5000); // fetch every 5 seconds
}


