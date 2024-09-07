export class ConsumptionDisplay {
    #yearSelect
    #consumptionForm
    #chart

    constructor () {
        this.#yearSelect = document.getElementById('consumptionYear')
        this.#consumptionForm = document.getElementById('consumptionForm')
        this.#chart = document.getElementById('consumptionChart')
        this.#fetchYearsSelect()

        this.#consumptionForm.addEventListener('submit', (event) => this.#submitYear(event))
    }


    async #fetchYearsSelect() {
        const url = 'http://localhost:8080/api/countries-data'

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        })
        const data = await response.json()
        
        data.years.forEach(year => {
            const option = document.createElement('option')
            option.value = year
            option.textContent = year
            this.#yearSelect.appendChild(option)
        });
      }

      async #submitYear(event) {
        event.preventDefault()

        const year = this.#yearSelect.value
        const url = `http://localhost:8080/api/consumption-data?year=${year}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        })
        const data = await response.json()

        this.#renderChart(data)
      }

      #renderChart(data) {
        const labels = data.map((item) => item.countries || 'Unknown')
        const consumptionData = data.map((item) => item.consumption || 0)

        if (window.consumptionChart instanceof Chart) {
            window.consumptionChart.destroy()
          }

        window.consumptionChart = new Chart(this.#chart , {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Energy Consumption (GWh)',
            data: consumptionData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
      console.log('Chart rendered successfully!')
    }
      
}