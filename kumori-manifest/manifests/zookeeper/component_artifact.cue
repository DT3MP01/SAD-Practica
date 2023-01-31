package component

#Artifact: {
  ref: name:  "sadzookeeper"

  description: {

    srv: {
      server: {
        zookeeperserver: { protocol: "http", port: 2181 }
      }
    }

    config: {
      parameter: {
        appconfig: {
          endpoint: "http://0.zookeeperserver/"
        }
      }
      resource: {}
    }

    // Applies to the whole role
    size: {
      bandwidth: { size: 10, unit: "M" }
    }


    code: {

      zookeeper: {
        name: "zookeeper"

        image: {
          hub: { name: "bitnami/zookeeper:latest", secret: "" }
          tag: "bitnami/zookeeper:latest"
        }

        mapping: {
          // Filesystem mapping: map the configuration into the JSON file
          // expected by the component
          env: {
            ALLOW_ANONYMOUS_LOGIN: "yes"
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
