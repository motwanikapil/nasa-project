const express = require("express")
const planetsRouter = express.Router()
const planetsController = require("../planets/planets.controller")

planetsRouter.get("/", planetsController.httpGetAllPlanets)

module.exports = planetsRouter
