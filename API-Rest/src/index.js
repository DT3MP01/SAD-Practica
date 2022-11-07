const express = require('express');
const app = express();
const morgan=require('morgan');
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9093']
})
const topic = "topic-name"
const producer = kafka.producer() 


//Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2)
 
//Middleware
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

app.post('/', function (req, res) {

    res.send('[POST]Saludos desde express'+req);
    
  });

//Iniciando el servidor
app.listen(app.get('port'),()=>{
    console.log(`Server listening on port ${app.get('port')}`);
});


var sendMessage = async (url) => {
	await producer.connect()
	let i = 0
		try {
			// send a message to the configured topic with
			// the key and value formed from the current value of `i`
			await producer.send({
				topic,
				messages: [
					{
						key: String(i),
						value: url,
					},
				],
			})

			// if the message is written successfully, log it and increment `i`
			console.log("writes: ", i)
			i++
		} catch (err) {
			console.error("could not write message " + err)
		}
}
