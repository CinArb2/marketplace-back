const { app } = require('./app')
require('dotenv').config()

// Models
const { initModels } = require('./models/initModels')

// Utils
const { db } = require('./utils/db')

// Authenticate database
db.authenticate()
  .then(() => console.log('successful connection'))
  .catch((err) => console.log(err))

// Establish models relations
initModels()

// Sync sequelize models
db.sync()
  .then(() => console.log('synced database'))
  .catch(err => console.log(err))

// Spin up server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`)
})
