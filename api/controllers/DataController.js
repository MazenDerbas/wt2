import { Client } from '@elastic/elasticsearch';

export class DataController {

    async connectToElastic() {
        const client = new Client({
            cloud: {
                id: process.env.CLOUD_ID
            },
            auth: {
                apiKey: process.env.API_KEY
            }
        });

        return client;
    }

    async fetchEnergyData(req, res, next) {
        try {
            const { country, year } = req.query;
            const client = await this.connectToElastic();

            const response = await client.search({
                index: 'energy',
                size: 1000, 
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { Country: country } },
                                { match: { Year: year } }
                            ]
                        }
                    },
                    aggs: {
                        energy_types: {
                            terms: { field: 'Energy Type' },
                            aggs: {
                                total_production: {
                                    sum: { field: 'Production (GWh)' }
                                }
                            }
                        }
                    }
                }
            });

            const buckets = response.aggregations.energy_types.buckets.map(bucket => ({
                energyType: bucket.key,
                production: bucket.total_production.value
            }));

            res.json(buckets);
        } catch (error) {
            console.error('Error fetching energy data:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
    async fetchConsumptionData(req, res, next) {
        try {
            const { year } = req.query;
            const client = await this.connectToElastic();
            const response = await client.search({
                index: 'energy',
                size: 1000, 
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { Year: year } }
                            ]
                        }
                    },
                    aggs: {
                        countries_data: {
                            terms: { field: 'Country' },
                            aggs: {
                                consumption: {
                                    sum: { field: 'Energy Consumption' }
                                }
                            }
                        }
                    }
                }
            });

            const buckets = response.aggregations.countries_data.buckets.map(bucket => ({
                countries: bucket.key,
                consumption: bucket.consumption.value
            }));

            res.json(buckets);
        } catch (error) {
            console.error('Error fetching energy data:', error);
            res.status(500).send('Internal Server Error');
        }

    }

   

    async getCountriesAndYears(req, res, next) {
        const client = await this.connectToElastic();
    
        const response = await client.search({
            index: 'energy',
            size: 0,
            body: {
                aggs: {
                    countries: {
                        terms: { field: 'Country', size: 1000 } 
                    },
                    years: {
                        terms: { field: 'Year', order: { "_key": "asc" }, size: 1000 }
                    }
                }
            }
        });

        const countries = response.aggregations.countries.buckets.map(bucket => bucket.key);
        const years = response.aggregations.years.buckets.map(bucket => bucket.key);
        res.json({ countries, years });
    }

    async search(req, res, next) {

        const { query } = req.body;
        const client = await this.connectToElastic();
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit) 
        const startIndex = (page - 1) * limit; 

        const sortField = req.query.sortField || 'Year';
        const sortOrder = req.query.sortOrder || 'asc'; 

        try {
            const result = await client.search({
                index: 'energy', 
                from: startIndex,
                size: limit,
                body: {
                    query: {
                        multi_match: {
                            query: query,
                            fields: ['Country'] 
                        }
                    },
                    sort: [{ [sortField]: { order: sortOrder } }]
                }
            });
    
            const searchResults = result.hits.hits.map(hit => ({
                country: hit._source.Country,
                production: hit._source['Production (GWh)'],
                consumption: hit._source['Energy Consumption'],
                gdp: hit._source.GDP, 
                electricityExports: hit._source['Energy Exports'], 
                electricityImports: hit._source['Energy Imports'], 
                co2Emissions: hit._source['CO2 Emissions'],  
                year: hit._source.Year
            }));
    
    
            res.json({searchResults,
                totalResults: result.hits.total.value,
                currentPage: page,
                totalPages: Math.ceil(result.hits.total.value / limit)
            });
        } catch (error) {
            console.error('Search error', error);
            res.status(500).send('Search failed');
        }         
    }

}
