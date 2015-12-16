const path = require('path')
const express = require('express')
const webpack = require('webpack')
const config = require('./webpack.config.dev')

const app = express()
const compiler = webpack(config)
const port = process.env.PORT || 3000

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}))

app.use(require('webpack-hot-middleware')(compiler))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

const server = app.listen(port, 'localhost', function (err) {
  if (err) {
    console.log(err)
    return
  }

  console.log(`Listening at http://localhost:${port}`)
})
