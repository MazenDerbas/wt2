export class ProductionDisplay {
    #yearSelect
    #contry
    #productionForm
    #chart

    constructor () {
        this.#yearSelect = document.getElementById('productionYear')
        this.#contry = document.getElementById('country')
        this.#productionForm = document.getElementById('productionForm')
        this.#chart = document.getElementById('productionChart')

        this.#fetchYearsSelect()
        this.#productionForm.addEventListener('submit', (event) => this.#submitYear(event))
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

        data.countries.forEach(country => {
            const option = document.createElement('option')
            option.value = country
            option.textContent = country
            this.#contry .appendChild(option)
        });
      }

      async #submitYear(event) {
        event.preventDefault()

        const year = this.#yearSelect.value
        const country = this.#contry.value
        const url = `http://localhost:8080/api/production-data?country=${country}&year=${year}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        })

        console.log(response)
        const data = await response.json()

        this.#renderChart(data)
      }


      #renderChart(data) {
        const labels = data.map((item) => item.energyType || 'Unknown')
        const productionData = data.map((item) => item.production || 0)

        if (window.productionChart instanceof Chart) {
            window.productionChart.destroy()
          }

        window.productionChart = new Chart(this.#chart , {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Energy Production (GWh)',
            data: productionData,
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