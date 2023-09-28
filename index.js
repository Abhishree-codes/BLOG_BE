const express = require("express")
const cors = require("cors")
const { connection } = require("./db")
const { apiRouter } = require("./routes/apiRouter")
const app = express()
app.use(cors())
app.use(express.json())
app.use("/api",apiRouter)

app.get("/",(req,res)=>{
    const event = new Date(Date());
    console.log(event.toLocaleString('en-GB', { timeZone: 'UTC' }).split(",")[0]);
    res.send("homepage")
})

app.listen(8080,async ()=>{
    try {
        await connection
        console.log("connected to db and running")
    } catch (error) {
        console.log(error)
    }
})