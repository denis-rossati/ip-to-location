# IP to Location

## What is this?

This is an application that takes an IP and retrieves the location based on that IP. In other words, if you send your
IP, the application must show you your approximate location. To use the application, see the section "How to use it?"
below.

The structure of the project was made following the below drawing:

<img src="https://user-images.githubusercontent.com/943036/148793496-5f73bd8f-f515-4e28-8fa6-9fbc88aa0ca4.png">

---

## Running tests

### Unitary

To run the tests, you'll just need npm and to install the dependencies:

```shell
npm i && npm test
```

### End-to-end

- In development

---

## How to use it?

You have two ways to use this application, keep in mind that the two of them have the same output:

### Production

The recommended way, and only requires you to have node installed.

<details>

You just need to execute the silly-wizard.js:

  ```shell
  node silly-wizard.js 
  ```

And type a valid IPv4 or IPv6:

  <figure>
    <img src="https://user-images.githubusercontent.com/74881282/212126977-89eee6ad-e809-45f5-ae10-fbfd4e115c6c.png" alt="Prompt with input">
    <figcaption>Prompt with input</figcaption>
  </figure>

  <figure>
    <img src="https://user-images.githubusercontent.com/74881282/212126964-6a52c74b-22d3-441a-936d-32a09d4a2dd3.png" alt="Prompt with output">
    <figcaption>Prompt with broadcasted response</figcaption>
  </figure>


<i>Since you are watching the output topic directly, the responses are broadcast-like, in other words, you'll see everyone else
messages, and everyone else will see your messages.</i>

</details>

### Development

Recommended for development purpose. Must have docker and docker-compose installed.

<details>
Run the following command to get the app up an running. The .dev.env file has valid environment variables:

```shell
docker compose --env-file .dev.env --profile full-app up
```

Them you will connect to connect to the input and output topics. Open two terminal instances and in the first terminal,
do the following to get access to the kafka service command line:

```shell
docker container exec -ti kafka bash
```

In that command line, create a consumer console connected to the development kafka broker and the 'location_output'
topic:

```shell
kafka-console-consumer --bootstrap-server kafka:9092 --topic location_output
```

In the other terminal instance, connect to the kafka again:

```shell
docker container exec -ti kafka bash
```

But now, create a producer connected to the 'location_input':

```shell
kafka-console-producer --bootstrap-server kafka:9092 --topic location_input
```

As soon as the console is ready, you can produce messages with the following schema:

```JSON
{"clientId": "your_client_id", "timestamp": 123, "ip": "insert_ipv4_or_ipv6"}
```

And then check your output terminal. The location must be there :) 

</details>

---

## Decisions through development phase

- Notice that the application doesn't meet the integration tests requirement. I think it is my lack of experience with
  kafka, but I couldn't isolate my modules from the kafka service itself. Instead, I create some e2e tests :)


- Currently, the topics only accept and producer messages that are a valid JSON with 'clientId', 'timestamp' and 'ip'.
  Unfortunately, the client doesn't have ways to know what is the schema of the message, unless they read this README.
  The way I could solve this problem would be with a schema registry. In the draw I put in the begining of the file
  would have an extra service between the input and output topic.


- One problem that could be solved with a extra service was the ignored messages. Currently, the application ignore the
  messages that doesn't meet the standards to be outputed to the 'location_output' topic. In other words, if the message
  is not a valid JSON, if ipstack doesn't return a valid answer, etc... If a fail case occurs, the application just
  ignore the message. Which I think it's not ideal, I would solve this issue with a extra topic called '
  invalid_messages' that would be a queue to try to correct any JSON mispellings or try to recover the data from the
  API.

---
