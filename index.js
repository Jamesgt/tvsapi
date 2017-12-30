const { Tvs } = require('./Tvs.js')
const config = require('./config.json')

const tvs = new Tvs(config)
tvs.magic('hu').then((result) => {
  console.log(result)
})
