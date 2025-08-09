import useWebSocket from "react-use-websocket";
import React, { useEffect, useRef, useState } from "react";
import { config } from "../config";
import "./style.css";

export function Home({ username }) {
	const { sendJsonMessage, lastJsonMessage } = useWebSocket(config.WS_URL, {
		share: true,
		queryParams: { username },
	});

	const [chatInput, setChatInput] = useState("");
	const [users, setUsers] = useState({});
	const [chatMessages, setChatMessages] = useState([]);
	const [privMessage, setPrivMessage] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [showSummaryModal, setShowSummaryModal] = useState(false);
	const [summaryContent, setSummaryContent] = useState("");
	const [isLoadingSummary, setIsLoadingSummary] = useState(false);
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
	}, [chatMessages, privMessage]);

	const handleSummarize = async () => {
		console.log("Summarize button clicked");
		setIsLoadingSummary(true);

		const messagesToSummarize = selectedUser
			? privMessage
					.filter(
						(msg) =>
							(msg.from === username && msg.to === selectedUser) ||
							(msg.from === selectedUser && msg.to === username)
					)
					.map((msg) => msg.text)
			: chatMessages.map((msg) => msg.text);

		try {
			const res = await fetch(`${config.API_URL}/summarize`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ messages: messagesToSummarize }),
			});

			const data = await res.json();
			setSummaryContent(data.summary);
			setShowSummaryModal(true);
		} catch (error) {
			console.error("Summarization error:", error);
			setSummaryContent(
				"Something went wrong while summarizing the conversation. Please try again."
			);
			setShowSummaryModal(true);
		} finally {
			setIsLoadingSummary(false);
		}
	};

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

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const currentMessages = selectedUser
		? privMessage.filter(
				(msg) =>
					(msg.from === username && msg.to === selectedUser) ||
					(msg.from === selectedUser && msg.to === username)
		  )
		: chatMessages;

	const activeUserCount = Object.keys(users).length;

	return (
		<div className="chat-container">
			<div className="chat-sidebar">
				<div className="sidebar-title">🟢 Active Users</div>
				<div className="sidebar-subtitle">
					{activeUserCount} user{activeUserCount !== 1 ? "s" : ""} online
				</div>

				<ul className="user-list">
					<li
						className={`user-item ${!selectedUser ? "selected" : ""}`}
						onClick={() => setSelectedUser(null)}
					>
						💬 Public Chat
					</li>
					{Object.values(users).map((user, index) => (
						<li
							key={index}
							className={`user-item ${
								selectedUser === user.username ? "selected" : ""
							} ${user.username === username ? "current-user" : ""}`}
							onClick={() => setSelectedUser(user.username)}
						>
							{user.username === username ? "👤" : "💭"} {user.username}
							{user.username === username ? " (you)" : ""}
						</li>
					))}
				</ul>
			</div>

			<div className="chat-section">
				<header className="chat-header">
					<h1>Talky</h1>
					<div className="chat-status">
						<div className="status-indicator"></div>
						{selectedUser
							? `Private chat with ${selectedUser}`
							: "Public chat room"}
					</div>
				</header>

				<div className="messages-area">
					<div className="chat-mode-header">
						<div className="chat-mode-title">
							{selectedUser ? `Private Chat` : "Public Chat"}
						</div>
						<div className="chat-mode-subtitle">
							{selectedUser
								? `Chatting privately with ${selectedUser}`
								: `${activeUserCount} user${
										activeUserCount !== 1 ? "s" : ""
								  } in the room`}
						</div>
					</div>

					{currentMessages.map((msg, index) => {
						const isOwnMessage = (msg.from || msg.username) === username;
						return (
							<div
								key={index}
								className={`message-bubble ${
									isOwnMessage ? "own-message" : ""
								}`}
							>
								<div className="message-author">{msg.from || msg.username}</div>
								<div className="message-text">{msg.text}</div>
								<div className="message-time">{formatTime(msg.timestamp)}</div>
							</div>
						);
					})}

					{/* {currentMessages.length > 0 && (
						<button
							onClick={handleSummarize}
							className="summarize-button"
							disabled={isLoadingSummary}
						>
							{isLoadingSummary ? <>Analyzing...</> : <>Summarize Chat</>}
						</button>
					)} */}

					<div ref={chatEndRef} />
				</div>

				<form onSubmit={sendChatMessage} className="input-form">
					<input
						type="text"
						value={chatInput}
						onChange={(e) => setChatInput(e.target.value)}
						placeholder={
							selectedUser ? `Message ${selectedUser}...` : "Type a message..."
						}
						className="input-field"
					/>
					<button type="submit" className="send-button">
						Send
					</button>
				</form>
			</div>

			{/* Summary Modal */}
			{showSummaryModal && (
				<div
					className="summary-modal-overlay"
					onClick={() => setShowSummaryModal(false)}
				>
					<div className="summary-modal" onClick={(e) => e.stopPropagation()}>
						<div className="summary-header">
							<div className="summary-title">Chat Summary</div>
							<button
								className="summary-close"
								onClick={() => setShowSummaryModal(false)}
							>
								×
							</button>
						</div>
						<div className="summary-content">{summaryContent}</div>
					</div>
				</div>
			)}
		</div>
	);
}