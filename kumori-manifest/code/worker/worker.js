const { Kafka } = require("kafkajs")
var fs = require("fs");
var shellExec = require("shell-exec")

const kafka = new Kafka({
	clientId:"consumer-1",
	brokers:[process.env.KAFKAIPADDR],
})
const pettopic="petition-topic"
const restopic="result-topic"
const producer = kafka.producer() 
var petition

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
			var text = fs.readFileSync(petition.output,"utf8");
			// send a message to the configured topic with
			// the key and value formed from the current value of `i`
			await producer.send({
				topic:restopic,
				messages: [
					{
						key: uuid,
						value: 'Result :'+text,
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

 async function clearEnviroment(){
    await shellExec.default("rm -rf dir")
	console.log("LIMPIANDO ENVIROMENT")
}

async function dowloadRepo() {
	console.log("Descargando")
	await shellExec.default('curl -fsS '+petition.url)
	if(petition.hasOwnProperty('token')){
		await shellExec.default('git clone '+petition.url.replace('https://','https://'+petition.token+'@')+ ' dir')
	}
	else{
		await shellExec.default('git clone '+petition.url+ ' dir')
	}
	await codeExecution()
  }

async function codeExecution(){
	if(petition.file.toString().includes(".js")){
        await shellExec.default("cd dir && npm install")
		await shellExec.default("node ./dir"+petition.path+"/"+petition.file+" "+petition.arguments)
		await clearEnviroment()
    }
    else if(petition.file.toString().includes(".py")){
		await shellExec.default("cd dir && pip install -r requirements.txt")
        await shellExec.default("python3 ./dir"+petition.path+"/"+petition.file+" "+petition.arguments)
		await clearEnviroment()
    }
}

const consume = async () => {
	// first, we wait for the client to connect and subscribe to the given topic
	await consumer.connect()
	await consumer.subscribe({ topic:pettopic, fromBeginning: true })
	await consumer.run({
		// this function is called every time the consumer gets a new message
		eachMessage: async ({ message }) => {
			console.log(message.offset)
			petition= JSON.parse(message.value.toString())
			// // here, we just log the message to the standard output
			await dowloadRepo()
			console.log("ENVIANDO")
			await sendOutput(message.key)
		},
	})
}
console.log("lanzando worker...")
consume()
