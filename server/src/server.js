const http = require("http")
require("dotenv").config()
const app = require("./app")
const { mongoConnect } = require("./services/mongo")
const { loadPlanetsData } = require("./models/planets.model")
const { loadLaunchesData } = require("./models/launches.model")

const PORT = 8000
const MONGO_URL =
  "mongodb+srv://kapilmotwani320:K%40pil1010@cluster0.lctioa2.mongodb.net/?retryWrites=true&w=majority"
const server = http.createServer(app)

async function startServer() {
  await mongoConnect()
  await loadPlanetsData()
  await loadLaunchesData()
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
  })
}

startServer()
