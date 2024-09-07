import express from 'express'
import { DataController } from '../controllers/DataController.js'


export const router = express.Router()

const controller = new DataController()

router.get('/api/production-data', (req, res, next) => controller.fetchEnergyData(req, res, next));

router.get('/api/consumption-data', (req, res, next) => controller.fetchConsumptionData(req, res, next));

router.get('/api/countries-data', (req, res, next) => controller.getCountriesAndYears(req, res, next));

router.post('/api/search', (req, res, next) => controller.search(req, res, next));