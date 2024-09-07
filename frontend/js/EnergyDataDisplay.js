export class EnergyDataDisplay {
    #searchInput
    #searchForm
    #consumptionContainer
    #productionContainer
    #searchTable
    #currentPage
    #totalPages
    #pagination
    #searchSortControls
    #sortField
    #sortOrder
    #sortBtn
    #searchQuery 

    constructor () {
        this.#searchInput = document.getElementById('search-box')
        this.#searchForm = document.getElementById('searchForm')
        this.#consumptionContainer = document.getElementById('consumption-container')
        this.#productionContainer = document.getElementById('production-container')
        this.#searchTable = document.getElementById('search-tabel')
        this.#currentPage = 1
        this.#totalPages = 1
        this.#pagination = document.getElementById('pagination-controls')
        this.#searchSortControls = document.getElementById('search-sort-controls')
        this.#sortField = document.getElementById('sortField')
        this.#sortOrder = document.getElementById('sortOrder')
        this.#sortBtn = document.getElementById('sortBtn')  
        this.#searchQuery = ''



        this.#searchForm.addEventListener('submit', (event) => this.#fetchEnergyData(event))
        this.#sortBtn.addEventListener('click', () => this.#sortData())
    }


    async #fetchEnergyData(event) {
        event.preventDefault()

        this.#consumptionContainer.classList.add('hidden')
        this.#productionContainer.classList.add('hidden')
        this.#searchSortControls.classList.remove('hidden')

        this.#searchQuery = this.#searchInput.value
        this.#searchInput.value = ''
        const url = `http://localhost:8080/api/search?page=${this.#currentPage}&limit=25`
        const searchQuery = {
            query: this.#searchQuery 
        }

        
        const response = await fetch (url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(searchQuery)
        })
        const data = await response.json()

        

        const { searchResults, currentPage, totalPages } = data
        
        if (searchResults.length === 0) {
            const noDataMessage = document.createElement('p')
            noDataMessage.textContent = 'No results found for the given country. Available countires are : France, China, India, Japan, Australia, Russia, Brazil, Germany, USA, Canada'
            noDataMessage.id = 'no-data-message'
            noDataMessage.style.color = 'red'
            this.#searchTable.parentNode.insertBefore(noDataMessage, this.#searchTable)
            this.#searchTable.classList.add('hidden')
        } 

        this.#currentPage = currentPage
        this.#totalPages = totalPages
        this.#renderEnergyData(searchResults)
        this.#renderPagingsbuttons()
    }

    #renderEnergyData(data) {

        const tbody = this.#searchTable.querySelector('tbody')
        tbody.textContent = '' 

        data.forEach(item => {
            const row = document.createElement('tr')

            row.innerHTML = `
                <td>${item.country || 'N/A'}</td>
                <td>${item.year || 'N/A'}</td>
                <td>${item.production || 'N/A'} GWh</td>
                <td>${item.consumption || 'N/A'} GWh</td>
                <td>${item.gdp || 'N/A'} USD</td>
                <td>${item.electricityExports || 'N/A'} GWh</td>
                <td>${item.electricityImports || 'N/A'} GWh</td>
                <td>${item.co2Emissions || 'N/A'} Mt</td>
            `

            tbody.appendChild(row)
        })

        // Show the search table once data is rendered
        this.#searchTable.classList.remove('hidden')
    }

    #renderPagingsbuttons() {
        const nextButton = document.createElement('button')
        const previousButton = document.createElement('button')
        this.#pagination.innerHTML= ''

        nextButton.textContent= 'Next page'
        previousButton.textContent = 'Previous Page'

        previousButton.disabled = this.#currentPage === 1
        previousButton.addEventListener('click', (event) => {
            if (this.#currentPage < this.#totalPages) {
                this.#currentPage = this.#currentPage - 1
                this.#fetchEnergyData(event)
            }
        })


        nextButton.disabled = this.#currentPage === this.#totalPages
        nextButton.addEventListener('click', (event) => {
            if (this.#currentPage < this.#totalPages) {
                this.#currentPage = this.#currentPage + 1
                this.#fetchEnergyData(event)
            }
        })

        

        this.#pagination.appendChild(previousButton)
        this.#pagination.appendChild(nextButton)
    }

    async #sortData() {
        const url = `http://localhost:8080/api/search?page=${this.#currentPage}&limit=25&sortField=${this.#sortField.value}&sortOrder=${this.#sortOrder.value}`
        
        const searchQuery = {
            query: this.#searchQuery
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(searchQuery)
        })

        const data = await response.json()
        const { searchResults, currentPage, totalPages } = data

        this.#currentPage = currentPage
        this.#totalPages = totalPages
        this.#renderEnergyData(searchResults)
        this.#renderPagingsbuttons()
    }
}