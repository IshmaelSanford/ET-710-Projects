document.addEventListener('DOMContentLoaded', () => {
    // --- Lamp Physics (Ambient Only) ---
    const lamp = document.getElementById('swingLamp');
    // We don't need the hitbox for interaction anymore, but we keep the reference if needed
    // or just animate the lamp directly.
    
    let lampAngle = 0;
    let lampVelocity = 0;
    const lampGravity = 0.15;
    const lampDamping = 0.98;
    const lampMaxAngle = 70;
    
    // Mouse State for Bucket
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseVelocityX = e.clientX - lastMouseX;
        mouseVelocityY = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    function animateLamp() {
        // Simple pendulum physics for ambient movement
        const force = -Math.sin(lampAngle * Math.PI / 180) * lampGravity;
        lampVelocity += force;
        lampVelocity *= lampDamping;
        lampAngle += lampVelocity;
        
        // Add ambient sway
        const time = Date.now() / 1000;
        const ambientAngle = Math.sin(time * 1.5) * 3;
        let totalAngle = lampAngle + ambientAngle;

        // Clamp angles
        if (totalAngle > lampMaxAngle) {
            totalAngle = lampMaxAngle;
            lampVelocity *= -0.6;
            lampAngle = lampMaxAngle - ambientAngle;
        } else if (totalAngle < -lampMaxAngle) {
            totalAngle = -lampMaxAngle;
            lampVelocity *= -0.6;
            lampAngle = -lampMaxAngle - ambientAngle;
        }
        
        if (lamp) lamp.style.transform = `rotate(${totalAngle}deg)`;
        
        requestAnimationFrame(animateLamp);
    }
    animateLamp();

    // --- Bucket Physics ---
    const bucket = document.querySelector('.bucket');
    if (bucket) {
        let x = 0;
        let y = 0;
        let vx = 0;
        let vy = 0;
        let rotation = 0; // Initial CSS rotation
        let angularVelocity = 0;
        
        const gravity = 0.5;
        const friction = 0.95;
        const bounce = 0.5;

        // Paint System
        let puddle = null;
        let puddleScale = 0;
        let paintExhausted = false;
        
        function updateBucket() {
            // Apply Gravity
            vy += gravity;
            
            // Apply Velocity
            x += vx;
            y += vy;
            rotation += angularVelocity;
            
            // Floor Collision (y=0 is the starting floor level)
            if (y > 0) {
                y = 0;
                vy *= -bounce;
                vx *= friction;
                angularVelocity *= friction;
                
                // Snap to nearest 90 degrees when settling
                if (Math.abs(vy) < 1 && Math.abs(angularVelocity) < 1) {
                    const targetRotation = Math.round(rotation / 90) * 90;
                    rotation += (targetRotation - rotation) * 0.1;
                    angularVelocity = 0;
                }
            }

            // Apply Transform to get current screen position
            bucket.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            const rect = bucket.getBoundingClientRect();

            // Screen Boundaries
            const viewportWidth = window.innerWidth;
            
            // Left Wall
            if (rect.left < 0) {
                x += (0 - rect.left);
                vx *= -bounce;
            }
            // Right Wall
            else if (rect.right > viewportWidth) {
                x -= (rect.right - viewportWidth);
                vx *= -bounce;
            }
            // Ceiling
            if (rect.top < 0) {
                y += (0 - rect.top);
                vy *= -bounce;
            }
            
            // Re-apply Transform with boundary corrections
            bucket.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            
            // Collision Detection with Mouse
            // Check if mouse is inside the bucket's bounding box
            if (
                lastMouseX >= rect.left &&
                lastMouseX <= rect.right &&
                lastMouseY >= rect.top &&
                lastMouseY <= rect.bottom
            ) {
                // Only apply force if mouse is moving significantly
                const speed = Math.sqrt(mouseVelocityX*mouseVelocityX + mouseVelocityY*mouseVelocityY);
                if (speed > 2) {
                    // Add impulse based on mouse velocity
                    vx += mouseVelocityX * 0.3;
                    vy += mouseVelocityY * 0.3;
                    
                    // Add spin torque
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const hitX = lastMouseX - centerX;
                    const hitY = lastMouseY - centerY;
                    
                    // Torque = r x F (2D cross product approximation)
                    // Reduced multiplier significantly to fix fast spinning
                    angularVelocity += (hitX * mouseVelocityY - hitY * mouseVelocityX) * 0.002;
                    
                    // Clamp max angular velocity
                    const maxSpin = 15;
                    if (angularVelocity > maxSpin) angularVelocity = maxSpin;
                    if (angularVelocity < -maxSpin) angularVelocity = -maxSpin;
                }
            }

            // Paint Logic
            // If bucket is tilted more than 60 degrees from upright (0, 360, etc)
            const normalizedRot = Math.abs(rotation % 360);
            const isTilted = (normalizedRot > 60 && normalizedRot < 300);
            
            // Check if bucket is near the floor to spill "on the ground"
            // y=0 is floor.
            const isOnFloor = (y >= -10); // Tolerance

            // Reset paint supply if bucket is upright
            if (!isTilted) {
                paintExhausted = false;
            }

            if (isTilted && isOnFloor && !paintExhausted) {
                if (!puddle) {
                    puddle = document.createElement('div');
                    puddle.className = 'paint-puddle';
                    
                    // Position puddle at bucket's current horizontal center
                    const roomAssets = bucket.parentElement;
                    const roomRect = roomAssets.getBoundingClientRect();
                    
                    // Calculate left relative to container
                    const relativeLeft = rect.left - roomRect.left + rect.width / 2;
                    
                    puddle.style.left = `${relativeLeft}px`;
                    puddle.style.marginLeft = '-40px'; // Center the 80px puddle
                    
                    roomAssets.insertBefore(puddle, bucket);
                    puddleScale = 0;

                    // Schedule fade out
                    setTimeout(() => {
                        if (puddle) {
                            puddle.classList.add('fade-out');
                            // Remove from DOM after fade
                            setTimeout(() => {
                                if (puddle) {
                                    puddle.remove();
                                    puddle = null;
                                }
                            }, 2000); // Match CSS transition time
                        }
                        // Mark paint as exhausted for this spill session
                        paintExhausted = true;
                    }, 3000); // Puddle lasts 3 seconds before fading
                }
                
                // Grow puddle
                if (puddleScale < 10) { // Max size (reduced slightly since base is wider)
                    puddleScale += 0.05;
                    puddle.style.transform = `scale(${puddleScale})`;
                }
            }
            
            requestAnimationFrame(updateBucket);
        }
        updateBucket();
    }
});
