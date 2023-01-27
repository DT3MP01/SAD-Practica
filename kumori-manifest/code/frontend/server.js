/*
* Copyright 2020 Kumori systems S.L.
*
* Licensed under the EUPL, Version 1.2 or – as soon they
* will be approved by the European Commission - subsequent
* versions of the EUPL (the "Licence");
* You may not use this work except in compliance with the
* Licence.
* You may obtain a copy of the Licence at:
*
* https://joinup.ec.europa.eu/software/page/eupl
*
* Unless required by applicable law or agreed to in
* writing, software distributed under the Licence is
* distributed on an "AS IS" basis,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
* express or implied.
* See the Licence for the specific language governing
* permissions and limitations under the Licence.
 */

const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const hostname = '0.0.0.0'
const port = process.env.HTTP_SERVER_PORT_ENV
const configFile = process.env.CONFIG_FILE

readConfig = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(configFile, "utf8", (err, jsonString) => {
      if (err) {
        reject(err)
        return
      }
      try {
        appConfig = JSON.parse(jsonString)
        resolve(appConfig)
      } catch (err) {
        reject(err)
      }
    })
  })
}

createExpressApp = (config) => {
  var app = express()
  app.use(bodyParser.json())

  app.post('/calc', (req, res) => {
    console.log(`Received request ${JSON.stringify(req.body)}`)
    axios.post(config.endpoint, req.body)
    .then(result => {
      res.send(result.data)
    })
    .catch(err => {
      res.status(503).send(`Unexpected error: ${err.message}`)
    })
  })

  app.get('/health', (req, res) => {
    console.log('Health request')
    res.send('OK')
  })

  app.use(function(req, res, next) {
    res.status(404).send('Not found')
  })

  return app
}

config = readConfig()
.then((config) => {
  app = createExpressApp(config)
  app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  })
})
.catch((err) => {
  console.log(`Error initializating component: ${err.message}`)
})
