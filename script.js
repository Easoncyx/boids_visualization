class Boid {
    constructor(canvasWidth, canvasHeight) {
        this.position = new Vector(Math.random() * canvasWidth, Math.random() * canvasHeight);
        this.velocity = Vector.random();
        this.acceleration = new Vector(0, 0);
        this.maxSpeed = 1;
        this.maxAcceleration = 0.1;
        this.perceptionRadius = 50;
        this.separation_factor = 35;
        this.alignment_factor = 1.0;
        this.cohesion_factor = 1.0;
    }
    print(label = '') {
        console.log(`${label} Boid: x=${this.position.x}, y=${this.position.y}`);
    }
    update(boids, predators, canvasWidth, canvasHeight) {
        this.get_acceleration(boids, predators);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.multiply(0); // Reset acceleration
        
        // cross to the other side
        if (this.position.x > canvasWidth) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = canvasWidth;
        }
        if (this.position.y > canvasHeight) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = canvasHeight;
        }

        // // bounce back if reaching canvas boundaries
        // if (this.position.x > canvasWidth) {
        //     this.velocity.x *= -1;
        //     this.position.x = canvasWidth; // Push back into the canvas
        // } else if (this.position.x < 0) {
        //     this.velocity.x *= -1;
        //     this.position.x = 0; // Push back into the canvas
        // }

        // if (this.position.y > canvasHeight) {
        //     this.velocity.y *= -1;
        //     this.position.y = canvasHeight; // Push back into the canvas
        // } else if (this.position.y < 0) {
        //     this.velocity.y *= -1;
        //     this.position.y = 0; // Push back into the canvas
        // }
    }

    get_acceleration(boids, predators) {
        let separation = this.separate(boids).multiply(this.separation_factor);
        let alignment = this.align(boids).multiply(this.alignment_factor);
        let cohesion = this.cohere(boids).multiply(this.cohesion_factor);
        let avoid = this.avoid(predators);

        this.acceleration.add(separation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(avoid);
        
        this.acceleration.limit(this.maxAcceleration);
    }

    separate(boids) {
        // Logic for separation from nearby boids
        let steering = new Vector(0, 0);
        let total = 0;
        for (let other of boids) {
            let distance = Vector.distance(this.position, other.position);
            if (other !== this && distance < this.perceptionRadius) {
                let diff = new Vector(this.position.x, this.position.y);
                diff.subtract(other.position);
                diff.divide(distance); // Weight by distance
                // diff.divide(distance * distance); // Weight by distance
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.divide(total);
        }
        return steering;
    }

    align(boids) {
        // Logic for aligning with nearby boids
        let steering = new Vector(0, 0);
        let total = 0;
        for (let other of boids) {
            let distance = Vector.distance(this.position, other.position);
            if (other !== this && distance < this.perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.divide(total);
        }
        return steering;
    }

    cohere(boids) {
        // Logic for moving towards the average position of nearby boids
        let steering = new Vector(0, 0);
        let total = 0;
        for (let other of boids) {
            let distance = Vector.distance(this.position, other.position);
            if (other !== this && distance < this.perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.divide(total);
            steering.subtract(this.position);
        }
        return steering;
    }

    avoid(predators) {
        let steering = new Vector(0, 0);
        let total = 0;
        for (let predator of predators){
            let d = Vector.distance(this.position, predator.position);
            if (d < this.perceptionRadius) { // Avoid if within a certain range
                let diff = new Vector(this.position.x, this.position.y);
                diff.subtract(predator.position);
                diff.multiply(this.maxSpeed);
                steering.add(diff);
            }
        }
        if (total > 0) {
            steering.divide(total);
        }
        return steering;
    }

    draw(ctx) {
        // dot shape
        // ctx.beginPath();
        // ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
        // ctx.fillStyle = 'black';
        // ctx.fill();
        
        // Y shape
        // const angle = Math.atan2(this.velocity.y, this.velocity.x);

        // ctx.save(); // Save the current state of the canvas
        // ctx.translate(this.position.x, this.position.y); // Move to the boid's position
        // ctx.rotate(angle); // Rotate the canvas to align with the boid's velocity

        // // Draw the arrow
        // ctx.beginPath();
        // ctx.moveTo(-10, -5);
        // ctx.lineTo(0, 0);
        // ctx.lineTo(-10, 5);
        // ctx.moveTo(0, 0);
        // ctx.lineTo(10, 0);
        // ctx.strokeStyle = 'black';
        // ctx.stroke();

        // ctx.restore(); // Restore the canvas to its original state

        // Arrow
        const angle = Math.atan2(this.velocity.y, this.velocity.x);

        ctx.save(); // Save the current state of the canvas
        ctx.translate(this.position.x, this.position.y); // Move to the boid's position
        ctx.rotate(angle); // Rotate the canvas to align with the boid's velocity

        // Draw the arrow
        ctx.beginPath();
        ctx.moveTo(0, 0); // Start at the tip of the arrow
        ctx.lineTo(-15, 5); // Line to the bottom corner of the tail
        ctx.lineTo(-10, 0); // Line to the middle of the tail
        ctx.lineTo(-15, -5); // Line to the top corner of the tail
        ctx.closePath(); // Close the path to create a filled arrow
        ctx.fillStyle = 'black';
        ctx.fill();

        ctx.restore(); // Restore the canvas to its original state
    }
}

class Predator {
    constructor(canvasWidth, canvasHeight) {
        this.position = new Vector(Math.random() * canvasWidth, Math.random() * canvasHeight);
        this.velocity = Vector.random();
        this.acceleration = new Vector(0, 0);
        this.maxSpeed = 2; // Might be faster than a regular boid
        this.maxAcceleration = 0.1;
        this.perceptionRadius = 100;
    }

    update(boids, predators, canvasWidth, canvasHeight) {
        this.get_acceleration(boids);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.multiply(0);
        // cross to the other side
        if (this.position.x > canvasWidth) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = canvasWidth;
        }
        if (this.position.y > canvasHeight) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = canvasHeight;
        }
    }

    get_acceleration(boids) {
        let cloest = this.cloest(boids);
        let cohesion = this.cohere(boids);
        this.acceleration.add(cloest);
        this.acceleration.add(cohesion);
        this.acceleration.limit(this.maxAcceleration);
    }

    cloest(boids){
        let steering = new Vector(0, 0);
        let closest = null;
        let closestD = Infinity;
        for (let boid of boids) {
            let d = Vector.distance(this.position, boid.position);
            if (d < closestD) {
                closest = boid;
                closestD = d;
            }
        }
        if (closest != null) {
            let diff = new Vector(closest.position.x, closest.position.y);
            diff.subtract(this.position).multiply(this.maxAcceleration);
            steering.add(diff);
        }
        return steering;
    }

    cohere(boids){
        let steering = new Vector(0, 0);
        let total = 0;
        for (let other of boids) {
            let distance = Vector.distance(this.position, other.position);
            if (distance < this.perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.divide(total);
            steering.subtract(this.position);
        }
        return steering;
    }

    draw(ctx) {
        // Drawing the predator as a red arrow
        const angle = Math.atan2(this.velocity.y, this.velocity.x);

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-20, -10);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        ctx.restore();
    }
}


class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply(factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    }

    divide(divisor) {
        this.x /= divisor;
        this.y /= divisor;
        return this;
    }
    
    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y);
        if (length > 0) {  // Ensure we don't divide by zero
            this.x /= length;
            this.y /= length;
        }
        return this;
    }

    limit(max) {
        const magnitudeSquared = this.x * this.x + this.y * this.y;
        if (magnitudeSquared > max * max) {
            this.divide(Math.sqrt(magnitudeSquared)); // normalize
            this.multiply(max);
        }
        return this;
    }

    static distance(v1, v2) {
        return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
    }

    static random() {
        const angle = Math.random() * Math.PI * 2;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
    
    print(label = '') {
        console.log(`${label} Vector: x=${this.x}, y=${this.y}`);
    }
}

function initializeBoids(count, canvasWidth, canvasHeight) {
    const newBoids = [];
    for (let i = 0; i < count; i++) {
        newBoids.push(new Boid(canvasWidth, canvasHeight));
    }
    return newBoids;
}

const canvas = document.getElementById('boidsCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 50;

let boids = [];
const BOID_COUNT = 1000;
let predators = []
const PREDATOR_COUNT = 3;

for (let i = 0; i < BOID_COUNT; i++) {
    boids.push(new Boid(canvas.width, canvas.height));
}
for (let i = 0; i < PREDATOR_COUNT; i++) {
    predators.push(new Predator(canvas.width, canvas.height));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let predator of predators) {
        predator.update(boids, predators, canvas.width, canvas.height);
        predator.draw(ctx);
    }
    for (let boid of boids) {
        boid.update(boids, predators, canvas.width, canvas.height);
        boid.draw(ctx);
    }
    requestAnimationFrame(animate);
}

animate();


// Event listeners for user controls
document.getElementById('speedRange').addEventListener('input', (e) => {
    // Adjust maxSpeed of each boid based on the slider value
    const speed = parseFloat(e.target.value);
    boids.forEach(boid => boid.maxSpeed = speed);
});

document.getElementById('perceptionRange').addEventListener('input', (e) => {
    // Adjust perceptionRadius of each boid based on the slider value
    const perceptionRadius = parseFloat(e.target.value);
    boids.forEach(boid => boid.perceptionRadius = perceptionRadius);
});

document.getElementById('maxAcceleration').addEventListener('input', (e) => {
    const maxAcceleration = parseFloat(e.target.value);
    boids.forEach(boid => boid.maxAcceleration = maxAcceleration);
});


document.getElementById('restartButton').addEventListener('click', () => {
    // Re-initialize the boids array
    boids = [];
    for (let i = 0; i < BOID_COUNT; i++) {
        boids.push(new Boid(canvas.width, canvas.height));
    }

    // Optionally, reset any other settings or controls to their initial values
    // For example, if you have sliders for speed or perception radius, reset them here
});