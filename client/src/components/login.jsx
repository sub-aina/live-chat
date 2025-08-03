import { useState } from "react";

export function Login({ onSubmit }) {
	const [username, setUsername] = useState("");

	return (
		<>
			<h1>Welcome</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit(username);
				}}
			>
				<input
					type="text"
					value={username}
					placeholder="Enter your username"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<button type="submit" disabled={!username}></button>
			</form>
		</>
	);
}
