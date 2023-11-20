const mongoose = require("mongoose")

// const MONGO_URL = process.env.MONGO_URL
const MONGO_URL = "mongodb+srv://kapilmotwani320:K%40pil1010@cluster0.lctioa2.mongodb.net/?retryWrites=true&w=majority"

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready!")
})

mongoose.connection.on("error", (err) => {
  // console.error(err)
})

async function mongoConnect() {
  await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
  await mongoose.disconnect()
}

module.exports = { mongoConnect, mongoDisconnect }
