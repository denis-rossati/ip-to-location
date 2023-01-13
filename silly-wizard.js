const {isIP} = require('net');
const readline = require('node:readline');
const {Kafka, Partitioners, logLevel} = require('kafkajs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const kafka = new Kafka({
    clientId: 'silly-wizard',
    brokers: ['ec2-15-228-13-15.sa-east-1.compute.amazonaws.com:9094'],
    logLevel: logLevel.NOTHING,
});


const messages = [];
const inputs = [];

function handleIp(kafka) {
    return (ip) => {
        const trimmedIp = ip.trim();

        const isIp = isIP(trimmedIp);
        if (isIp) {
            const message = {
                ip: ip,
                clientId: 'silly-wizard',
                timestamp: Date.now(),
            };

            produce(kafka.producer, JSON.stringify(message)).catch(console.error);

            inputs.push(message);
        }
        broadcastMessages(isIp, kafka);
    }
}

function askForIp(validIpInput, kafka) {
    if (!validIpInput) {
        console.log('> Must be a valid IP.');
    }

    rl.question('> Insert an IP: ', handleIp(kafka));
}

function broadcastMessages(validIpInput, kafka) {
    console.clear();
    console.log('> Inputs:');
    inputs.forEach((input) => {
        const {ip, clientId, timestamp} = input;

        console.log(`— IP: ${ip} | client id: ${clientId} | timestamp: ${timestamp}`);
    });

    console.log('\n');

    console.log('> Broadcast:');
    messages.forEach((message) => {
        const {ip, city, latitude, longitude, country, region, clientId, timestamp} = JSON.parse(message);
        console.log(`— IP: ${ip} | country: ${country} | region: ${region} | city: ${city} | latitude: ${latitude} | longitude: ${longitude} | client id: ${clientId} | timestamp: ${timestamp}`);
    });

    console.log('\n');

    askForIp(validIpInput, kafka);
}

async function produce(producer, message) {
    await producer.connect()
    await producer.send({
        topic: 'location_input',
        messages: [
            {value: message},
        ],
    })
}

async function main() {
    let loadingMessage = 'Waiting wizard to initialize';
    const initialLength = loadingMessage.length;
    let waitingCount = 0;

    const interval = setInterval(() => {
        console.clear();
        if (initialLength + 3 <= loadingMessage.length) {
            loadingMessage = loadingMessage.slice(0, -3);
        } else {
            loadingMessage += '.';
        }
        waitingCount += 1;

        console.log(loadingMessage);
        if (waitingCount > 24) {
            console.log('Taking longer than usual...');
        }
    }, 250);

    const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});
    const consumer = kafka.consumer({groupId: 'reviewers'})

    const topicManagers = {
        producer,
        consumer,
    };

    await consumer.connect()

    await consumer.subscribe({topic: 'location_output', fromBeginning: false})
    await consumer.run({
        eachMessage: async ({message}) => {
            messages.push(message.value.toString());
            broadcastMessages(true, topicManagers);
        },
    }).then(() => {
        producer.connect().then(() => {
            clearInterval(interval);
            broadcastMessages(true, topicManagers);
        });
    });
}

main().catch(console.error);
