import { useState } from "react";
import "./style.css"; // Import the CSS file

export function Login({ onSubmit }) {
	const [username, setUsername] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!username.trim()) return;

		setIsSubmitting(true);

		// Add a small delay for better UX (simulate connection)
		setTimeout(() => {
			onSubmit(username.trim());
			setIsSubmitting(false);
		}, 800);
	};

	const handleInputChange = (e) => {
		const value = e.target.value;
		// Allow only alphanumeric characters and common symbols
		if (value.length <= 20) {
			setUsername(value);
		}
	};

	const isValidUsername = username.trim().length >= 2;

	return (
		<div className="login-container">
			<div className="login-card">
				<div className="login-decorative-dots">
					<div className="login-dot"></div>
					<div className="login-dot"></div>
					<div className="login-dot"></div>
				</div>

				<div className="login-header">
					<h1 className="login-title"> Welcome to Talky</h1>
					<p className="login-subtitle">
						Enter your username to join the conversation and connect with others
					</p>
				</div>

				<form onSubmit={handleSubmit} className="login-form">
					<div className="login-input-group">
						<input
							type="text"
							value={username}
							placeholder="Enter your username"
							onChange={handleInputChange}
							className="login-input"
							disabled={isSubmitting}
							autoFocus
							autoComplete="username"
						/>
					</div>

					<button
						type="submit"
						disabled={!isValidUsername || isSubmitting}
						className="login-button"
					>
						{isSubmitting ? <> Connecting...</> : <> Join Chat</>}
					</button>
				</form>

				<div className="login-features">
					<div className="login-features-title">What you can do:</div>
					<div className="login-features-list">
						<div className="login-feature-item">
							<div className="login-feature-icon">💬</div>
							<span>Chat with everyone in public rooms</span>
						</div>
						<div className="login-feature-item">
							<div className="login-feature-icon">🔒</div>
							<span>Send private messages to specific users</span>
						</div>
						<div className="login-feature-item">
							<div className="login-feature-icon">🧠</div>
							<span>AI-powered chat summaries</span>
						</div>
						<div className="login-feature-item">
							<div className="login-feature-icon">🟢</div>
							<span>See who's online in real-time</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
