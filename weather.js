class WeatherSystem {
    constructor() {
        this.weather = 'clear';
        this.temperature = 25;
        this.wind = 0;
        this.types = ['clear', 'cloudy', 'rain', 'storm', 'fog', 'snow', 'heatwave'];
        this.tempRanges = {
            clear: [20, 35],
            cloudy: [15, 28],
            rain: [10, 22],
            storm: [5, 18],
            fog: [8, 20],
            snow: [-5, 5],
            heatwave: [35, 50]
        };
        this.transitionTimer = 0;
        this.transitionInterval = 120 + Math.random() * 120;
    }

    update() {
        this.transitionTimer++;
        if (this.transitionTimer >= this.transitionInterval) {
            this.transitionTimer = 0;
            this.transitionInterval = 120 + Math.random() * 120;
            this.randomize();
        }
        this.temperature += (Math.random() - 0.5) * 0.2;
        const range = this.tempRanges[this.weather] || [20, 35];
        this.temperature = Math.max(range[0], Math.min(range[1], this.temperature));
        this.wind = this.weather === 'storm' ? 5 + Math.random() * 5 : (this.weather === 'rain' ? 2 + Math.random() * 3 : Math.random() * 2);
    }

    randomize() {
        const weights = { clear: 30, cloudy: 20, rain: 15, storm: 5, fog: 10, snow: 5, heatwave: 5 };
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (const [type, weight] of Object.entries(weights)) {
            r -= weight;
            if (r <= 0) {
                this.weather = type;
                break;
            }
        }
        const range = this.tempRanges[this.weather] || [20, 35];
        this.temperature = range[0] + Math.random() * (range[1] - range[0]);
    }

    getWeatherData() {
        return {
            type: 'weather_update',
            weather: this.weather,
            temperature: Math.round(this.temperature),
            wind: Math.round(this.wind * 10) / 10
        };
    }
}

module.exports = { WeatherSystem };
