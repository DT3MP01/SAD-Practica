package component

#Artifact: {
  ref: name:  "sadkafka"

  description: {

    srv: {
      server: {
        kafkaserver: { protocol: "http", port: 9092 }
      }
      client: {
        zookeeperclient: { protocol: "http", port: 2181  }
      }
    }

    config: {
      parameter: {
        appconfig: {
          endpoint: "http://0.kafkaserver/"
        }
      }
      resource: {}
    }

    // Applies to the whole role
    size: {
      bandwidth: { size: 10, unit: "M" }
    }


    code: {

      kafka: {
        name: "kafka"

        image: {
          hub: { name: "bitnami/kafka:latest", secret: "" }
          tag: "bitnami/kafka:latest"
        }

        mapping: {
          // Filesystem mapping: map the configuration into the JSON file
          // expected by the component
          env: {
            KAFKA_CFG_ZOOKEEPER_CONNECT: "http://0.zookeeperclient:2181"
            ALLOW_PLAINTEXT_LISTENER: "yes"
            KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: "CLIENT:PLAINTEXT"
            KAFKA_CFG_LISTENERS: "CLIENT://:9092,EXTERNAL://:9093"
            KAFKA_CFG_ADVERTISED_LISTENERS: "CLIENT://kafka:9092,EXTERNAL:http://0.kafkaserver:9093"
            KAFKA_CFG_INTER_BROKER_LISTENER_NAME: "CLIENT"
            KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE: "true"
            KAFKAJS_NO_PARTITIONER_WARNING: "1"
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
