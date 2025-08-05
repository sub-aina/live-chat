const { WebSocketServer } = require("ws")
const http = require("http")
const uuidv4 = require("uuid").v4
const url = require("url")
const fetch = require("node-fetch");

const server = http.createServer()
const wsServer = new WebSocketServer({ server })

const port = 8001
const connections = {}
const users = {}

async function summarizeMessages(messagesArray) {
    const res = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesArray }),
    });

    const data = await res.json();
    return data.summary;
}

const chatLog = [];

const handleMessage = (bytes, uuid) => {
    const message = JSON.parse(bytes.toString())

    if (message.type === "chat") {
        const chatMessage = JSON.stringify({
            type: "chat",
            username: users[uuid].username,
            text: message.text,
            timestamp: Date.now(),
        })
        chatLog.push(chatMessage.text);
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
    else if (message.text === "/summarize") {
        const recentMessages = chatLog.slice(-20);
        summarizeMessages(recentMessages).then((summary) => {
            const summaryMessage = JSON.stringify({
                type: "summary",
                text: summary,
                timestamp: Date.now(),
            });


            connections[uuid].send(summaryMessage);
            console.log(summaryMessage);
            console.log(`Sent chat summary to ${users[uuid].username}`);
        }).catch((err) => {
            console.error("Summarization error:", err);
        });
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