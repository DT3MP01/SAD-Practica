package deployment

import (
  s ".../service:service"
)

#Deployment: {
  name: "saddep"
  artifact: s.#Artifact
  config: {
    // Assign the values to the service configuration parameters
    parameter: {
      language: "en"
    }
    resource: {}
    scale: detail: {
      zookeeper: hsize: 1
      kafka: hsize: 1
      frontend: hsize: 1
      worker: hsize: 3

    }
    resilience: 0
  }
}

