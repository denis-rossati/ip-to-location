# IP to Location

## What is this?

This is an application that takes an IP and retrieves the location based on that IP. In other words, if you send your IP, the application must show you your approximate location. To use the application, see the section "How to use it?" below.

The structure of the project was made following the below drawing:

<img src="https://user-images.githubusercontent.com/943036/148793496-5f73bd8f-f515-4e28-8fa6-9fbc88aa0ca4.png">

---

## Tests

### Unitary

To run the tests, you'll just need npm and to install the dependencies:

```shell
npm i && npm test
```

### end-to-end

- In development

---

## How to use it?

You have three ways to use this application, keep in mind that the three of them have the same output:

#### Production

The recommended way, and only requires you to have node installed.

<details></details>

#### Development

Recommended for development usage. Must have docker and docker-compose installed.

<details></details>

---

## Decisions through the project

- Notice that the application doesn't meet the integration tests requirement. I think it is my lack of experience with kafka, but I couldn't isolate my modules from the kafka service itself. Instead, I create some e2e tests :)

- Currently, the topics only accept and producer messages that are a valid JSON with 'clientId', 'timestamp' and 'ip'. Unfortunately, the client doesn't have ways to know what is the schema of the message, unless they read this README. The way I could solve this problem would be with a schema registry. In the draw I put in the begining of the file would have an extra service between the input and output topic. 

- One problem that could be solved with a extra service was the ignored messages. Currently, the application ignore the messages that doesn't meet the standards to be outputed to the 'location_output' topic. In other words, if the message is not a valid JSON, if ipstack doesn't return a valid answer, etc... If a fail case occurs, the application just ignore the message. Which I think it's not ideal, I would solve this issue with a extra topic called 'invalid_messages' that would be a queue to try to correct any JSON mispellings or try to recover the data from the API.

---
