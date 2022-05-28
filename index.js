const path = require('path')
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const multer = require('multer')

const app = express()
const port = 3000
const mongoURL = 'mongodb://jorge:jorgefelix@proyectodb.crjiru6beih6.us-east-2.docdb.amazonaws.com:27017/dev?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false'

async function initMongo(){
  console.log('Initialising MongoDB...')
  let success = false
  let client
  while(!success){
    try {
      client = await MongoClient.connect(mongoURL, { 
        useNewUrlParser: true
      })
      success = true
    } catch {
      console.log('Error connecting to MongoDB, retrying in 1 second')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  console.log('MongoDB initialised')
  return client.db(client.s.options.dbName).collection('images')
}

async function retrieveImages(db) {
  const images = (await db.find().toArray()).reverse()
  return images
}

async function saveImage(db, note) {
  await db.insertOne(note)
}

async function start() {
  // const db = await initMongo()
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");
  app.use(express.static(path.join(__dirname, 'public')))
  
  app.get("/", async (req, res) => {
    // res.render("index", { title: "Home", images: await retrieveImages() });
    res.render("index", { title: "Home", images: [] });
  });

  app.post(
    '/note',
    multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
    async (req, res) => {
      if (!req.body.upload && req.body.description) {
        // await saveImage(db, { description: req.body.description })
        res.redirect('/')
      } else if (req.body.upload && req.file) {
        const link = `/uploads/${encodeURIComponent(req.file.filename)}`
        res.render('index', {
          content: `${req.body.description} ![](${link})`,
          // images: await retrieveImages(db),
          images: [],
        })
      }
    }
  )

  app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`)
  })
}



start()


