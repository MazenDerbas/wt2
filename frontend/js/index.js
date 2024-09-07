import { ConsumptionDisplay } from "./ConsumptionDisplay.js";
import { EnergyDataDisplay } from "./EnergyDataDisplay.js";
import { ProductionDisplay } from "./ProductionDisplay.js";

export function init () {
    document.addEventListener('DOMContentLoaded', () => {
        const consumption = new ConsumptionDisplay();
        const production = new ProductionDisplay
        const data = new EnergyDataDisplay
        console.log('ConsumptionDisplay instance created');
    });
}

init();
