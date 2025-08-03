const { WebSocketServer } = require("ws")
const http = require("http")
const uuidv4 = require("uuid").v4
const url = require("url")

const server = http.createServer()
const wsServer = new WebSocketServer({ server })

const port = 8000
const connections = {}
const users = {}

const handleMessage = (bytes, uuid) => {
    const message = JSON.parse(bytes.toString())

    if (message.type === "chat") {
        const chatMessage = JSON.stringify({
            type: "chat",
            username: users[uuid].username,
            text: message.text,
            timestamp: Date.now(),
        })

        Object.values(connections).forEach((connection) => {
            connection.send(chatMessage);
        });

        console.log(
            `Received message from ${users[uuid].username}: ${JSON.stringify(message)}`
        )
    }
    else if (message.type === "private_chat") {
        const fromUser = users[uuid].username;
        const toUser = message.to;

        const targetUser = Object.keys(users).find(id => users[id].username === toUser);
        if (targetUser && connections[targetUser]) {
            const privateMessage = JSON.stringify({
                type: "private_chat",
                from: fromUser,
                to: toUser,
                text: message.text,
                timestamp: Date.now(),
            });

            connections[targetUser].send(privateMessage);
            // connections[uuid].send(privateMessage);

            console.log(`Private message from ${fromUser} to ${toUser}: ${message.text}`);
        } else {
            console.log(`User ${toUser} not found for private message`);
        }
    }
};

const handleClose = (uuid) => {
    console.log(`${users[uuid].username} disconnected`)
    delete connections[uuid]
    delete users[uuid]
    broadcast()
}

const broadcast = () => {
    Object.keys(connections).forEach((uuid) => {
        const connection = connections[uuid];
        const message = {
            type: "users",
            users: users,

        };
        connection.send(JSON.stringify(message));
    });
};


wsServer.on("connection", (connection, request) => {
    const { username } = url.parse(request.url, true).query
    console.log(`${username} connected`)
    const uuid = uuidv4()
    connections[uuid] = connection
    users[uuid] = {
        username,
        state: {},  //can be any state of client like online status , typing status
    }
    broadcast();

    connection.on("message", (message) => handleMessage(message, uuid))
    connection.on("close", () => handleClose(uuid))
})

server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`)
})