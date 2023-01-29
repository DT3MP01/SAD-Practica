const { Kafka } = require("kafkajs")
var fs = require("fs");
var shell = require("shelljs")

const kafka = new Kafka({
	clientId:"consumer-1",
	brokers:[process.env.KAFKAIPADDR],
})
const pettopic="petition-topic"
const restopic="result-topic"
const producer = kafka.producer() 
var petition

/**
 * Enviar el error que ha detenido la ejecución de la petición.
 * @param {number} uuid El identificador de la petición a responder.
 * @param {string} text El error que se ha obtenido.
 */
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
			//console.log("enviado");
		} catch (err) {
			console.error("could not write message " + err)
		}
}
/**
 * Enviar el resultado de la ejecución obtenida.
 * @param {number} uuid El identificador de la petición a responder.
 */
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
						value:text,
					},
				],
			})
			//console.log("enviado");
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
/**
 * Limpieza del entorno para dejarlo como antes de realizar la petición
 */
 async function clearEnviroment(){
	if(petition.file.toString().includes(".py")){
		shell.exec("cd dir && pip uninstall -r requirements.txt -y",{silent:true})
	}
    shell.exec("rm -rf dir")
	shell.exec("rm "+petition.output)
	//console.log("LIMPIANDO ENVIROMENT")
}
/**
 * Descarga el repositorio de la petición en la carpeta dir.
 */
function dowloadRepo()  {
	//console.log("Descargando")
	if(petition.hasOwnProperty('token')){
		//clona el repositorio privado
		if(shell.exec('git clone '+petition.url.replace('https://','https://'+petition.token+'@')+ ' dir',{silent:true}).code !==0){
			throw new Error('El repositorio no existe o token sin acceso al repositorio');
		}
	}
	else{
		//clona el repositorio publico
		if(shell.exec('git clone '+petition.url+ ' dir',{silent:true}).code!==0){
			throw new Error('El repositorio no existe o es privado')
		}
		
	}
	
	codeExecution()

  }
/**
 * Ejecuta el codigo según los parametros especificados en la petición
 */
function codeExecution(){
	//El programa soporta javascript y python para su ejecución 
	if(petition.file.toString().includes(".js")){
		//Instala las dependencias del directorio raiz y ejecuta el archivo de la peticion
        shell.exec("cd dir && npm install",{silent:true})
		execution=shell.exec("node ./dir"+petition.path+"/"+petition.file+" "+petition.arguments,{silent:true})
		if(execution.code!==0){
			throw new Error(execution.stderr)
		}
		//console.log(execution)
    }
    else if(petition.file.toString().includes(".py")){
		//Instala las dependencias del directorio raiz y ejecuta el archivo de la peticion
		shell.exec("cd dir && pip install -r requirements.txt",{silent:true})
        execution=shell.exec("python3 ./dir"+petition.path+"/"+petition.file+" "+petition.arguments,{silent:true})
		if(execution.code!==0){
			throw new Error(execution.stderr)
		}	
    }
	else{
		throw new Error('Tipo de fichero no soportado')
	}
}
/**
 * Ejecuta el codigo según los parametros especificados en la petición
 */
const consume = async () => {
	// esperamos a que se conecte con la cola kafka y se suscriba al topic esperado
	await consumer.connect()
	await consumer.subscribe({ topic:pettopic, fromBeginning: true })
	await consumer.run({
		// cada vez que llegue una peticion se ejecuta este codigo
		eachMessage: async ({ message }) => {
			//console.log(message.offset)
			petition= JSON.parse(message.value.toString())
			try {
				dowloadRepo()
				//console.log("ENVIANDO")
				await sendOutput(message.key)
				clearEnviroment()
			} catch (error) {
				await sendMessage(message.key,'ERROR: '+error.message)
			}

		},
	})
}
//console.log("lanzando worker...")
consume()
