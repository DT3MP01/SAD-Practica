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
const mexp = require('math-expression-evaluator')
const express = require('express')
const bodyParser = require('body-parser')

const hostname = '0.0.0.0'
const port = process.env.HTTP_SERVER_PORT_ENV
const configFile = process.env.CONFIG_FILE
const literals = {
  en: {
    success: "Expression evaluated correctly",
    error: "Error evaluating expression"
  },
  es: {
    success: "Expresión evaluada correctamente",
    error: "Error evaluando expresión"
  }
}

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

evaluateExpr = (expr, language) => {
  return new Promise((resolve) => {
    try {
      value = mexp.eval(expr)
      console.log(`Expr evaluation: '${value}`)
      resolve({
        success: true,
        message: literals[language].success,
        value: value
      })
    } catch (err) {
      console.log(`Error evaluating expression '${expr}': ${err.message}`)
      resolve({
        success: false,
        message: literals[language].error + ": '" + expr + "'",
        value: null
      })
    }
  })
}

createExpressApp = () => {
  var app = express()
  app.use(bodyParser.json())

  app.post('/calc', (req, res) => {
    console.log(`Received request ${JSON.stringify(req.body)}`)
    expr = ""
    if ( (req.body != undefined) && ((req.body.expr != undefined)) ) {
      expr = req.body.expr
    }
    readConfig()
    .then((config) => {
      return evaluateExpr(expr, config.language)
    })
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
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
