const launches = require("./launches.mongo")
const planets = require("./planets.mongo")
// const launches = new Map()
let latestFlightNumber = 100
const DEFAULT_FLIGHT_NUMBER = 100
const axios = require("axios")

// const launch = {
//   flightNumber: 100, // flight_number
//   mission: "Kepler Exploration X", // name
//   rocket: "Explorer IS1", // rocket.name
//   launchDate: new Date("December 27, 2030"), // date_local
//   target: "Kepler-442 b", // not applicable
//   customers: ["ZTM", "NASA"], // payloads.customers
//   upcoming: true, // upcoming
//   success: true, // success
// }

// saveLaunch(launch)

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  })

  if (firstLaunch) {
    console.log("Launch data already loaded")
    
  }else{
    populateLaunches()
  }
  

}

// launches.set(launch.flightNumber, launch)

async function findLaunch(filter) {
  return await launches.findOne(filter)
}

async function existsLaunchWithId(launchId) {
  // return launches.has(launchId)
  // return await launches.findOne({ flightNumber: launchId })
  return await findLaunch({ flightNumber: launchId })
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne({}).sort("-flightNumber")
  // the above line states that we will sort the collection in descending order by using the minus sign and also
  // after sorting the array in descening order it will return the first document.
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER
  }
  return latestLaunch.flightNumber
}

async function getAllLaunches(skip,limit) {
  // return Array.from(launches.values())
  return await launches.find({}, { _id: 0, __v: 0 }).sort({ flightNumber: 1 }).skip(skip).limit(limit)
  // -1 for descending order in sorting
}

function addNewLaunch(launch) {
  latestFlightNumber++
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      success: true,
      upcoming: true,
      customers: ["Zero to Mastery", "NASA"],
      flightNumber: latestFlightNumber,
    })
  )
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  })

  if (!planet) {
    throw new Error("No matching planet found")
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"],
    flightNumber: newFlightNumber,
  })

  await saveLaunch(newLaunch)
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  )
}

async function abortLaunchById(launchId) {
  // const aborted = launches.get(launchId)
  // aborted.upcoming = false
  // aborted.success = false
  // return aborted

  const { modifiedCount, acknowledged } = await launches.updateOne(
    { flightNumber: launchId },
    {
      upcoming: false,
      success: false,
    }
  )

  return modifiedCount === 1 && acknowledged === true
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query"

async function populateLaunches() {
  console.log("Downloading launch data")
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  })

  if(response.status !== 200){
    console.log("Problem downloading launch data")
    throw new Error("Launch Data download failed")
  }
  const launchDocs = response.data.docs
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads
    const customers = payloads.flatMap((payload) => {
      return payload["customers"]
    })
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers,
    }
    console.log(`${launch.flightNumber} ${launch.mission}`)

    await saveLaunch(launch)
  }
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  scheduleNewLaunch,
  abortLaunchById,
  loadLaunchesData,
}
