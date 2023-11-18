// const planets = []
// module.exports = planets
const fs = require("fs")
const path = require("path")
const { parse } = require("csv-parse")

const planets = require("./planets.mongo")

// const habitablePlanets = []

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  )
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "..", "data", "kepler_data.csv"))
      .pipe(parse({ comment: "#", columns: true }))
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // habitablePlanets.push(data)
          // insert + update = upsert
          // await planets.create({
          //   keplerName: data.kepler_name,
          // })
          savePlanet(data)
        }
      })
      .on("error", (err) => {
        console.error(err)
        reject(err)
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length
        console.log(`${countPlanetsFound} habitable planets found`)
        resolve()
      })
  })
}

async function getAllPlanets() {
  // return habitablePlanets
  // return planets.find({ keplerName: "Kepler-62 f" }, { "-keplerName anotherField"})
  const response = await planets.find()
  return response
  // to search include and exclude the fields
  // pass the second object with a string to include and pass
  // negative s ign along with it to exlucde that field
  // $gte & $lte for operators like greater than equal and less than equal
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name },
      { upsert: true }
    )
  } catch (error) {
    console.error(`Could not save planet ${error}`)
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
}
