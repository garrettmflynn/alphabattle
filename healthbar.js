// Mona Rahimi
// This class establishes a healthbar for the AlphaBattle application
// designed for the 2021 CNT Hackathon hosted by the University of Washington

class healthbar {
    constructor(centerX, centerY, maxHealth) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.barScale = barScale;
        this.maxHealth = maxHealth;
        this.margin = 100;
    }

    setupBar() { // Sets up User Text 
        fill('white')
        textSize(20)
        textAlign(CENTER);
    }

    drawBar(health, colorVal) {
        this.health = health;
        let colorScaling = ((100 - this.health)/100);
        let currentColor = color(100 + 155*(this.colorScaling), 100 + 155 * (1-this.colorScaling),100 + 155 * (1-this.colorScaling) )
        currentColor.setAlpha(155);
        fill(currentColor);
        rect(this.centerX, this.centerX, (2 * ind - 1)*this.health*this.barScale, 10);
    }
}