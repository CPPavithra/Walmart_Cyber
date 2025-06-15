// attack-controls.js

function initAttackControls() {
    const attackButtons = document.querySelectorAll('.cyber-button');

    attackButtons.forEach(button => {
        // Add ripple effect
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });

        // Add attack functionality with cooldown
        button.addEventListener('click', async function () {
            if (this.classList.contains('cooldown')) return;

            const attackType = this.dataset.attack || 'full';
            const isDestructive = attackType === 'ransomware' || attackType === 'full';

            if (isDestructive && !confirm(`This will simulate a ${attackType.toUpperCase()} attack. Continue?`)) {
                return;
            }

            // Set cooldown
            this.classList.add('cooldown');
            this.disabled = true;

            // Show countdown
            let cooldown = 10;
            const originalText = this.innerHTML;

            const countdownInterval = setInterval(() => {
                this.innerHTML = `${originalText} (${cooldown}s)`;
                cooldown--;

                if (cooldown < 0) {
                    clearInterval(countdownInterval);
                    this.innerHTML = originalText;
                    this.classList.remove('cooldown');
                    this.disabled = false;
                }
            }, 1000);

            // Execute attack
            try {
                const response = await fetch(`http://localhost:8000/simulate/${attackType}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': 'your-secure-key'
                    }
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                // Visual feedback
                showAttackAnimation(attackType);

                // ✅ Trigger the graph spike
                if (typeof simulateAttackSpike === 'function') {
                    simulateAttackSpike();
                }

                // Optional: for ransomware-specific healing message
                if (attackType === 'ransomware') {
                    setTimeout(() => {
                        updateClusterStatus('healthy', 'SELF-HEALING COMPLETE');
                    }, 8000);
                }

            } catch (error) {
                console.error('Attack simulation failed:', error);
                addEventToStream({
                    type: 'warning',
                    message: `Attack simulation failed: ${error.message}`,
                    timestamp: new Date()
                });
            }
        });
    });
}

function showAttackAnimation(attackType) {
    const visualizer = document.getElementById('pod-visualizer');
    if (!visualizer) return;

    const attackEffect = document.createElement('div');
    attackEffect.className = `attack-effect ${attackType}`;
    visualizer.appendChild(attackEffect);

    setTimeout(() => {
        attackEffect.remove();
    }, 2000);
}

