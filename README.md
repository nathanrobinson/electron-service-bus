# Electron Service Bus

## Usage

Before running you should be logged into Azure. To log in via the cli just do `az login`.
To send or receive messages, your account must have `Azure Service Bus Data Owner` permissions for the service bus object.

1. Run `yarn` from root.
2. Run `yarn` from ./app.
3. Run `yarn start` from root.
4. Browse your subscriptions and Service Bus namespaces.

## Roadmap

1. ~~peek, receive, and send messages to/from queues and subscriptions~~
2. ~~support dead-letter queues~~
3. ~~refresh data~~
4. delete queues, topics, and subscriptions
5. add and edit queues, topics, and subscriptions
6. forward queues and subscriptions
7. edit forward rules
