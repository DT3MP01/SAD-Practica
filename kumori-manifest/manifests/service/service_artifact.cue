package service

import (
  f ".../frontend:component"
  w ".../worker:component"
  k ".../kafka:component"
  z ".../zookeeper:component"
)

#Artifact: {
  ref: name: "sadservice"

  description: {

    //
    // Kumori Component roles and configuration
    //

    // Configuration (parameters and resources) to be provided to the Kumori
    // Service Application.
    config: {
      parameter: {
        language: string
      }
      resource: {}
    }

    // List of Kumori Components of the Kumori Service Application.
    role: {
      frontend: artifact: f.#Artifact
      worker: artifact: w.#Artifact
      kafka: artifact: k.#Artifact
      zookeeper: artifact: z.#Artifact
    }

    // Configuration spread:
    // Using the configuration service parameters, spread it into each role
    // parameters
    role: {
      frontend: {
        config: {
          parameter: {}
          resource: {}
        }
      }
      worker: {
        config: {
          parameter: {}
          resource: {}
        }
      }
      kafka: {
        config: {
          parameter: {}
          resource: {}
        }
      }
      kafka: {
        config: {
          parameter: {}
          resource: {}
        }
      }
    }

    //
    // Kumori Service topology: how roles are interconnected
    //

    // Connectivity of a service application: the set of channels it exposes.
    srv: {
      server: {
        calc: { protocol: "http", port: 3000 }
      }
    }

    // Connectors, providing specific patterns of communication among channels
    // and specifying the topology graph.
    connect: {
      // Outside -> frontend (LB connector)
      serviceconnector: {
        as: "lb"
  			from: self: "calc"
        to: frontend: "restapi": _
      }
      // frontend -> kafka (LB connector)
      fkconnector: {
        as: "lb"
        from: frontend: "kafkaclient"
        to: kafka: "kafkaserver": _
      }
      // worker -> kafka (LB connector)
      wkconnector: {
        as: "lb"
        from: worker: "kafkaclient"
        to: kafka: "kafkaserver": _
      }
      // KAFKA -> zookeeper (LB connector)
      kzconnector: {
        as: "lb"
        from: kafka: "zookeeperclient"
        to: zookeeper: "zookeeperserver": _
      }
    }

  }
}
