package component

#Artifact: {
  ref: name:  "calcworker"

  description: {

    srv: {
      server: {
        evalserver: { protocol: "http", port: 8080 }
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

    probe: worker: {
      liveness: {
        protocol: http : { port: srv.server.evalserver.port, path: "/health" }
        startupGraceWindow: { unit: "ms", duration: 30000, probe: true }
        frequency: "medium"
        timeout: 30000  // msec
      }
      readiness: {
        protocol: http : { port: srv.server.evalserver.port, path: "/health" }
        frequency: "medium"
        timeout: 30000 // msec
      }
    }

    code: {

      worker: {
        name: "worker"

        image: {
          hub: { name: "", secret: "" }
          tag: "kumoripublic/examples-node-calc-worker:v1.0.7"
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
            HTTP_SERVER_PORT_ENV: value: "\(srv.server.evalserver.port)"
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
