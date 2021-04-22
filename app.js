let mqtt = require('mqtt')
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const port = 3000


// ========= MQTT ==============

// mqtt setup 
//const IP = "192.168.1.13";
//test
const IP = "192.168.1.10";
const PORT ="1883";
const ENDPOINT = `mqtt://${IP}:${PORT}`;
const database_name = "pidev_data"
let subTopic=""
let subTopics = ["gaz", "flame", "temp", "light"]
let client = {}



// ========== MONGO =============
mongoose.connect(`mongodb://localhost:27017/${database_name}`, { useNewUrlParser: true,  useUnifiedTopology: true })
const db = mongoose.connection


const signals_schema = new mongoose.Schema({
  temp: []
})

const Signal = mongoose.model('Signal', signals_schema)


// Get all predefined containers and subscribe to their channels (where they report data according to standardized channel naming schema) 
// setupMQTT();
//setupSubscriptions(containerRefs);
  
  
 
app.get('/updatedsignals',(req,res)=>{
  Signal.updateOne( {_id: '60644f813188a417f7fff119'},
  {$push: {
    "temp": {
      $each: [65],
      $position: 0 // Insert at the begging of the array
    }
  }},
  (err, docs)=> {
    if (err) console.log(`Error: ${err}`);
    // console.log(`update result ${JSON.stringify(res)}`);
    console.log("[Updated] TEMPERATURE data")
    res.json({"tem":"ok"})
  } 
);
})
app.get('/allSignals', (req,res) => {
  Signal.find({}, (err, docs)=> {
    res.json(docs);
  })
})



// Development purpose 
// app.get('/add', (req, res) => {
//   Measurement.updateOne(
//     {containerRef: '123'},
//     {$push: {
//       "data.temp": {
//         $each: [{value:123, time:new Date().toISOString()}],
//         $position: 0 // Insert at the begging of the array
//       }
//     }},
//     (err, res) => {
//       if(err) console.log(`Error: ${err}`)
//       console.log("[Updated] TEMPERATURE data")
//     }
//   );
//   res.json('ok')
// });



app.listen(3000, "0.0.0.0", () => {
  console.log(`Express app listening at http://0.0.0.0:${port}`)
})





// HELPER functions 

function setupMQTT () {
   client = mqtt.connect(ENDPOINT)


  console.log("starting client");

  // on CONNECT
  client.on('connect', ()=>{
    console.log("Connected to MQTT broker successfuly");
  })

  // ON ERROR
  client.on('error', (err)=>{
    console.log(`Error ${err}`);
  })


  client.on('message', (topic, message, packet) => { // save data to db depending on data type/containerRef
    // console.log(`[Received] Topic: ${topic}, Message:${message}, Packet:${packet}`);
    console.log(`[Received] Topic: ${topic}, Value:${message}`);
 
  // Save data to database
  if(topic.includes("temp")) {
    Signal.updateOne(
      {_id: '60644f813188a417f7fff119'},
      {$push: {
        "temp": {
          $each: [{value:parseInt(message), time:new Date().toISOString()}],
          $position: 0 // Insert at the begging of the array
        }
      }},
      (err, res)=> {
        if (err) console.log(`Error: ${err}`);
        // console.log(`update result ${JSON.stringify(res)}`);
        console.log("[Updated] TEMPERATURE data")
      }
    );
  }// do temp update
})

}

function setupSubscriptions (containersRefs) {
  // SUBSCRIBE
    subTopics.forEach((topic) => { // subscribe to needed subchannels
      const channel = `${cont}/${topic}`;
      client.subscribe(channel, {qos: 1});
      console.log(`[Subscription] ${channel} Channel`);
    })
}

// ======== EXPRESS ==========




