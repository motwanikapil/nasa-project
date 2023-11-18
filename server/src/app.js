const path = require("path")
const express = require("express")
const cors = require("cors")
// const planetsRouter = require("./routes/planets/planets.router")
const app = express()
const morgan = require("morgan")
const api = require("./routes/api")
// const launchRouter = require("./routes/launches/launches.router")

app.use(
  cors({
    origin: "http://localhost:3000",
  })
)
app.use(morgan("combined"))

app.use(express.json())
app.use(express.static(path.join(__dirname, "..", "public")))

// app.use("/v1/planets", planetsRouter)
// app.use("/v1/launches", launchesRouter)

app.use("/v1", api)

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

module.exports = app
