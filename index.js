const express = require('express');
const app = express();
const port = 5000;
const fileUpload = require('express-fileupload');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uixul.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


app.use(bodyParser.json())
app.use(cors())
app.use(express.static('doctors'))
app.use(fileUpload())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log(err)
  const appointmentCollection = client.db("doctorsPortal").collection("appoint");
  
  app.post('/addAppointment', (req,res) =>{
    const appointment = req.body;
    console.log(appointment)
    appointmentCollection.insertOne(appointment)
    .then(result =>{
      res.send(result.insertedCount > 0)
    })
  });


  app.post('/appointmentsByDate', (req,res) =>{
    const date = req.body;
    console.log(date.date)
    appointmentCollection.find({date: date.date})
    .toArray((err, document) =>{
        res.send(document)
    })
  });

  app.post('/addADoctor',(req,res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const file = req.files.file;
    console.log(name,email,file)
    file.mv(`${__dirname}/doctors/${file.name}`, err =>{
      if(err){
        console.log(err)
        return res.status(500).send({msg: 'Failed to upload image'})
      }
      return res.send({name: file.name, path: `/${file.name}`})
    })
  })


});

app.listen(process.env.PORT || port)