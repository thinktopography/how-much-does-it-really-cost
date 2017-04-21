const path = require('path')
const fs = require('fs')
const domparser = require('xmldom').DOMParser
const togeojson = require('togeojson')

const data = fs.readFileSync(path.join('.','src','data.kml'), 'utf8')
const kml = new domparser().parseFromString(data)
const converted = togeojson.kml(kml)
fs.writeFileSync(path.join('.','src','data.json'), JSON.stringify(converted))
