const express = require('express');

const keycloak = require('./config/keycloak-config.js').initKeycloak()
const app = express();
const morgan=require('morgan');
const { Kafka } = require('kafkajs')
const { randomUUID } = require('crypto');
// require filesystem module
const fs = require("fs");
const petitionDict = {}

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKAIPADDR]
})
const restopic="result-topic"
const pettopic = "petition-topic"
const producer = kafka.producer() 
const fields=["url","path","file","arguments","output"]
const consumer = kafka.consumer({
	groupId: "app-rest",
	minBytes: 5,
	maxBytes: 1e6,
	// wait for at most 3 seconds before receiving new data
	maxWaitTimeInMs: 3000,
})

const consume = async () => {
	// first, we wait for the client to connect and subscribe to the given topic
	await consumer.connect()
	await consumer.subscribe({ topic:restopic, fromBeginning: true })
	await consumer.run({
		// this function is called every time the consumer gets a new message
		eachMessage: ({ message }) => {
			console.log(`Result message: ${message.value} y ${message.key}`)
			fs.writeFile("./result/"+message.key, message.value, function(err) {
				if(err) {
					return console.log(err);
				}
				console.log("The file was saved!");
			}); 			
		},
	})
}
//Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2)
 
//Middleware
app.use(keycloak.middleware())
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
 
//Nuestro primer WS Get
app.get('/', (req, res) => {    
    res.json(
        {
            "Title": "API REST DE PETICIONES"
        }
    );
})

/**
 * Ruta que permite comprobar el estado de una petición
 */
app.get('/result/',keycloak.protect('user'), (req, res) => { 
	if(petitionDict.hasOwnProperty(req.query.id)){
		fs.access('./result/'+req.query.id, (error) => {
			//  Si no se encuentra el archivo , la petición se sigue procesando
			if (error) {
			console.log(error);
			res.json(
				{
					"ERROR": "LA PETICIÓN SE SIGUE PROCESANDO"
				}
			);
			return;
			}
			//enviar el resultado de la petición
			fs.createReadStream('./result/'+req.query.id).pipe(res);
			setTimeout(deletePetition, 30*60*1000, req.query.id)
		}); 
	}
	else{
		res.json({"ERROR": "NO HAY PETICIÓN CON ESE ID"})
	}  
})

/**
 * Elimina la petición debido a que se ha agotado el tiempo de espera.
 * @param {number} id El identificador de la petición a eliminar.
 */
function deletePetition(id){
	console.log("FILE REMOVED "+id)
	delete petitionDict[id];
	fs.unlink('./result/'+id, (error) => {
		if (error) {
		console.log(error);
		return;
		}
	});	
}

/**
 * Enviar el error que ha detenido la ejecución de la petición.
 */
app.post('/', keycloak.protect('user'),function(request, response){
	var json= request.body;      // your JSON
	for (const property in fields) {
		//Se comprueba el formato de la petición
		if(!(Object.keys(json).includes(fields[property]))){
			response.send("ERROR en el formato de la petición: No se ha encontrado el campo "+fields[property]); 
			return
		}
	}
	//Se asigna un identificador aleatorio a la petición, este será el id de consulta y se devuelve al usuario
	id = randomUUID()
	petitionDict[id] = true;
	sendMessage(JSON.stringify(json),id);
	response.send("Se ha añadido la petición a la cola con id: " +id); 

  });
  
//Iniciando el servidor
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);
	consume();
});

/**
 * Enviar el error que ha detenido la ejecución de la petición.
 * @param {string} petition El json de la petición
 * @param {number} id El identificador de la petición a responder.
 */
var sendMessage = async (petition,id) => {
	console.log(id)
	await producer.connect()
		try {
			// send a message to the configured topic with
			// the key and value formed from the current value of `i`
			await producer.send({
				topic:pettopic,
				messages: [
					{
						key: id,
						value: petition,
					},
				],
			})
		} catch (err) {
			console.error("could not write message " + err)
		}
}
