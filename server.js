const express = require('express')

const server = express()

server.use(express.static('dist'))

server.listen(3000, () => {
  console.log('Listening on 3000')
})
