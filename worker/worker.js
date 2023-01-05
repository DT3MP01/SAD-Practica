const { Kafka } = require("kafkajs")
var fs = require("fs");
var shellExec = require("shell-exec")

const kafka = new Kafka({
	clientId:"consumer-1",
	brokers:["kafka:9092"],
})
const pettopic="petition-topic"
const restopic="result-topic"
const producer = kafka.producer() 
var petition
const fields=["url","path","file","arguments","output"]
var sendMessage = async (uuid,text) => {
	await producer.connect()
		try {
			// send a message to the configured topic with
			// the key and value formed from the current value of `i`
			await producer.send({
				topic:restopic,
				messages: [
					{
						key: uuid,
						value: text,
					},
				],
			})
			console.log("enviado");
		} catch (err) {
			console.error("could not write message " + err)
		}
}

var sendOutput = async (uuid) => {
	await producer.connect()
		try {
			var text = fs.readFileSync("./"+petition.output).toString('utf-8');
			// send a message to the configured topic with
			// the key and value formed from the current value of `i`
			await producer.send({
				topic:restopic,
				messages: [
					{
						key: uuid,
						value: text,
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

function clearEnviroment(){
    shellExec.default("cp ./dir"+petition.path+"/"+petition.output+" .")
    //shellExec.default("rm -rf dir")
}
function codeExecution(){
    if(petition.file.toString().includes(".js")){
        shellExec.default("cd dir && npm install")
		shellExec.default("touch ./dir"+petition.path+"/"+petition.output)
        shellExec.default("node ./dir"+petition.path+"/"+petition.file+" "+petition.arguments).then(clearEnviroment).catch(console.log)
    }
    else if(petition.file.toString().includes(".py")){
        shellExec.default('cd dir && python3 .'+petition.path+"/"+petition.file+" "+petition.arguments).then(console.log).catch(console.log)
    }
}
function publicRepo() {
    shellExec.default('git clone '+petition.url+ ' dir').then(codeExecution).catch(console.log)
  }
  

const consume = async () => {
	// first, we wait for the client to connect and subscribe to the given topic
	await consumer.connect()
	await consumer.subscribe({ topic:pettopic, fromBeginning: true })
	await consumer.run({
		// this function is called every time the consumer gets a new message
		eachMessage: ({ message }) => {
			console.log(message.offset)

			petition= JSON.parse(message.value.toString())
			for (const property in fields) {
				if(!(property in Object.keys(petition))){
					sendMessage(message.key,"Error: Formato json incorrecto")
					console.log("Error en la petición")
					return
				}
			}
			// // here, we just log the message to the standard output
			shellExec.default('curl -fsS '+petition.url).then(publicRepo).catch(console.log)
			sendOutput(message.key)
			console.log("YAY")
			


		},
	})
}
console.log("lanzando worker...")
consume()
