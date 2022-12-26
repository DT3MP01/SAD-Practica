const { Kafka } = require("kafkajs")
//import shellExec from 'shell-exec'

const kafka = new Kafka({
	clientId:"consumer-1",
	brokers:["localhost:9093"],
})
const pettopic="petition-topic"
const restopic="result-topic"
const producer = kafka.producer() 

var sendMessage = async (uuid,url) => {
	await producer.connect()
		try {
			// send a message to the configured topic with
			// the key and value formed from the current value of `i`
			await producer.send({
				topic:restopic,
				messages: [
					{
						key: uuid,
						value: url,
					},
				],
			})
			console.log("enviado");
		} catch (err) {
			console.error("could not write message " + err)
		}
}

// the kafka instance and configuration variables are the same as before
// create a new consumer from the kafka client, and set its group ID
// the group ID helps Kafka keep track of the messages that this client
// is yet to receive
const consumer = kafka.consumer({
	groupId: "consumers",
	minBytes: 5,
	maxBytes: 1e6,
	// wait for at most 3 seconds before receiving new data
	maxWaitTimeInMs: 3000,
})

const consume = async () => {
	// first, we wait for the client to connect and subscribe to the given topic
	await consumer.connect()
	await consumer.subscribe({ topic:pettopic, fromBeginning: true })
	await consumer.run({
		// this function is called every time the consumer gets a new message
		eachMessage: ({ message }) => {
			console.log(message.offset)
			console.log(message.key.toString)
			// here, we just log the message to the standard output
			sendMessage(message.key,message.value)
			//shellExec('git clone '+message.value).then(console.log).catch(console.log)
			console.log(`received message: ${message.value}`)
		},
	})
}
console.log("lanzando worker...")
consume()
