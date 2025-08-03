import useWebSocket from "react-use-websocket";
import React, { useEffect, useRef, useState } from "react";
import { color } from "d3";

export function Home({ username }) {
	const WS_URL = `ws://127.0.0.1:8000`;
	const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
		share: true,
		queryParams: { username },
	});

	const [chatInput, setChatInput] = useState("");
	const [users, setUsers] = useState({});
	const [chatMessages, setChatMessages] = useState([]);
	const [privMessage, setPrivMessage] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const chatEndRef = useRef(null);

	useEffect(() => {
		if (!lastJsonMessage) return;

		if (lastJsonMessage.type === "chat") {
			setChatMessages((prev) => [...prev, lastJsonMessage]);
		} else if (lastJsonMessage.type === "users") {
			setUsers(lastJsonMessage.users);
		} else if (lastJsonMessage.type === "private_chat") {
			setPrivMessage((prev) => [...prev, lastJsonMessage]);
		}
	}, [lastJsonMessage]);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatMessages]);

	const sendChatMessage = (e) => {
		e.preventDefault();
		if (!chatInput.trim()) return;

		if (selectedUser) {
			// Send private message
			sendJsonMessage({
				type: "private_chat",
				to: selectedUser,
				text: chatInput,
				timestamp: Date.now(),
			});
			setPrivMessage((prev) => [
				...prev,
				{
					from: username,
					to: selectedUser,
					text: chatInput,
					timestamp: Date.now(),
				},
			]);
		} else {
			// Send global message
			sendJsonMessage({
				type: "chat",
				username,
				text: chatInput,
				timestamp: Date.now(),
			});
		}

		setChatInput("");
	};

	return (
		<div style={styles.container}>
			<div style={styles.sidebar}>
				<h2 style={styles.sidebarTitle}>🟢 Active Users</h2>
				<ul style={styles.userList}>
					{Object.values(users).map((user, index) => (
						<li
							key={index}
							style={{
								...styles.userItem,
								cursor: "pointer",
								fontWeight: selectedUser === user.username ? "bold" : "normal",
							}}
							onClick={() => setSelectedUser(user.username)}
						>
							{user.username} {user.username === username ? "(you)" : ""}
						</li>
					))}
				</ul>
			</div>

			<div style={styles.chatSection}>
				<header style={styles.chatHeader}>
					<h1 style={{ margin: 0 }}>💬 yapp</h1>
				</header>

				<div style={styles.messagesArea}>
					<h3 style={{ marginBottom: 10 }}>
						{selectedUser ? `Private chat with ${selectedUser}` : "Public chat"}
					</h3>

					{(selectedUser
						? privMessage.filter(
								(msg) =>
									(msg.from === username && msg.to === selectedUser) ||
									(msg.from === selectedUser && msg.to === username)
						  )
						: chatMessages
					).map((msg, index) => (
						<div key={index} style={styles.messageBubble}>
							<strong>{msg.from || msg.username}</strong>: {msg.text}
						</div>
					))}

					<div ref={chatEndRef} />
				</div>

				<form onSubmit={sendChatMessage} style={styles.inputForm}>
					<input
						type="text"
						value={chatInput}
						onChange={(e) => setChatInput(e.target.value)}
						placeholder="Type a message..."
						style={styles.input}
					/>
					<button type="submit" style={styles.sendButton}>
						Send
					</button>
				</form>
			</div>
		</div>
	);
}

const styles = {
	container: {
		display: "flex",
		height: "100vh",
		width: "100vw",
		fontFamily: "sans-serif",
		background: "#f9fafb",
		color: "#111827",
	},

	sidebar: {
		width: "250px",
		background: "#111827",
		color: "#fff",
		padding: "20px",
		display: "flex",
		flexDirection: "column",
		gap: "10px",
		overflowY: "auto",
	},

	sidebarTitle: {
		marginBottom: "10px",
		fontSize: "18px",
	},

	userList: {
		listStyle: "none",
		padding: 0,
		margin: 0,
	},

	userItem: {
		marginBottom: "8px",
		color: "#d1d5db",
	},

	chatSection: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		color: "#111827",
	},

	chatHeader: {
		background: "#1f2937",
		color: "white",
		padding: "16px",
		boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
	},

	messagesArea: {
		flex: 1,
		padding: "20px",
		overflowY: "auto",
		display: "flex",
		flexDirection: "column",
		gap: "10px",
		color: "#111827",
	},

	messageBubble: {
		background: "#e5e7eb",
		padding: "10px 14px",
		borderRadius: "8px",
		maxWidth: "70%",
		alignSelf: "flex-start",
		wordBreak: "break-word",
	},

	inputForm: {
		display: "flex",
		padding: "16px",
		borderTop: "1px solid #e5e7eb",
		gap: "10px",
	},

	input: {
		flex: 1,
		padding: "10px",
		borderRadius: "8px",
		border: "1px solid #d1d5db",
		outline: "none",
		fontSize: "14px",
	},

	sendButton: {
		background: "#3b82f6",
		color: "white",
		border: "none",
		padding: "10px 16px",
		borderRadius: "8px",
		cursor: "pointer",
		fontWeight: "bold",
	},
};
