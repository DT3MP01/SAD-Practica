package component

#Artifact: {
  ref: name:  "sadworker"

  description: {

    srv: {
      server: {
        kafkaserver: { protocol: "http", port: 8080 }
      }
    }

    config: {
      parameter: {
        // Worker role configuration parameters
        appconfig: {
          language: string
        }
      }
      resource: {}
    }

    // Applies to the whole role
    size: {
      bandwidth: { size: 10, unit: "M" }
    }


    code: {

      worker: {
        name: "worker"

        image: {
          hub: { name: "", secret: "" }
          tag: "dtempo/sad-practica-worker"
        }

        mapping: {
          // Filesystem mapping: map the configuration into the JSON file
          // expected by the component
          filesystem: {
            "/config/config.json": {
              data: value: config.parameter.appconfig
              format: "json"
            }
          }
          env: {
            CONFIG_FILE: value: "/config/config.json"
            KAFKAIPADDR: "http://0.kafkaserver/"
          }
        }

        // Applies to each containr
        size: {
          memory: { size: 100, unit: "M" }
          mincpu: 100
          cpu: { size: 200, unit: "m" }
        }
      }
    }

  }
}
