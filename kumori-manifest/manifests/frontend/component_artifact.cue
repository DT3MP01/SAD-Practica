package component

#Artifact: {
  ref: name:  "sadapi"

  description: {

    srv: {
      server: {
        restapi: { protocol: "http", port: 3000 }
      }
      client: {
        kafkaclient: { protocol: "http", port:9092 }
      }
    }

    config: {
      parameter: {
        appconfig: {
          endpoint: "http://0.restapi/"
        }
      }
      resource: {}
    }

    // Applies to the whole role
    size: {
      bandwidth: { size: 10, unit: "M" }
    }


    code: {

      frontend: {
        name: "frontend"

        image: {
          hub: { name: "", secret: "" }
          tag: "sad-practica-worker"
        }

        mapping: {
          // Filesystem mapping: map the configuration into the JSON file
          // expected by the component
          env: {
            SESSION: "kafkasesion"
            KAFKAIPADDR: "0.kafkaclient"
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
