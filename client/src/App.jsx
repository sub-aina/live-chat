import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./components/Home";
import { Login } from "./components/login";

const App = () => {
	const [username, setUsername] = useState("");

	return username ? (
		<Home username={username} />
	) : (
		<Login onSubmit={setUsername} />
	);
};

export default App;
