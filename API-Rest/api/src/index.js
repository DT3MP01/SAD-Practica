const express = require('express');
//const keycloak = require('./config/keycloak-config.js').initKeycloak()
const app = express();
const morgan=require('morgan');
const { Kafka } = require('kafkajs')
const { randomUUID } = require('crypto');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKAIPADDR]
})
const restopic="result-topic"
const pettopic = "petition-topic"
const producer = kafka.producer() 

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
			console.log(`Result message: ${message.value}`)
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
    res.json(
        {
            "Title": "Hola mundo"
        }
    );
})


app.post('/', function(request, response){
	var json= request.body;      // your JSON
	sendMessage(JSON.stringify(json));
	response.send("OK  " +json.url);    // echo the result back
  });
  
//Iniciando el servidor
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);
	consume();
});


var sendMessage = async (url) => {
	id = randomUUID()
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
