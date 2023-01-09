const express = require('express');

//const keycloak = require('./config/keycloak-config.js').initKeycloak()
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
const fields=["url","path","file","arguments","output","password"]
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
//app.use(keycloak.middleware())
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
 
//Nuestro primer WS Get
app.get('/', (req, res) => {    
    res.json(
        {
            "Title": "Hola mundo"
        }
    );
})

app.get('/result/', (req, res) => { 
	if(petitionDict.hasOwnProperty(req.query.uuid) && petitionDict[req.query.uuid]== req.query.password){
		fs.access('./result/'+req.query.uuid, (error) => {
			//  if any error
			if (error) {
			console.log(error);
			res.json(
				{
					"ERROR": "LA PETICIÓN SE SIGUE PROCESANDO"
				}
			);
			return;
			}
			//enviar la petición
			fs.createReadStream('./result/'+req.query.uuid).pipe(res);
			console.log("File Exists!");
		}); 
	}
	else{
		res.json({"ERROR": " ACCESO A LA PETICIÓN DENEGADO"})
	}

  
})

 
app.post('/', function(request, response){
	var json= request.body;      // your JSON
	for (const property in fields) {
		if(!(Object.keys(json).includes(fields[property]))){
			response.send("ERROR en el formato de la petición: No se ha encontrado el campo "+fields[property]); 
			return
		}
	}
	id = randomUUID()
	petitionDict[id] = json.password;
	// delete json.password;
	sendMessage(JSON.stringify(json),id);
	response.send("Se ha procesado la petición con id:" +id); 
  });
  
//Iniciando el servidor
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);
	consume();
});


var sendMessage = async (url,id) => {
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
						value: url,
					},
				],
			})
		} catch (err) {
			console.error("could not write message " + err)
		}
}
