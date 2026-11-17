import { WebSocketServer } from "ws";

export default function attachRealtime(server) {
	// Le même serveur HTTP accepte aussi les connexions WebSocket, sur /ws.
	const wss = new WebSocketServer({ server, path: "/ws" });

    wss.on("connection", (ws, req) => {
	// Une connexion vient de s'ouvrir. `ws` la représente ; `req` est la
	// requête HTTP d'ouverture (URL, en-têtes, cookies).

	let game = null;
	let username = null;

	ws.on("message", (data) => {
		let message;
		try {
			message = JSON.parse(data.toString());
		} catch {
			return ws.send(
				JSON.stringify({ type: "error", error: "Message illisible." }),
			);
		}

		if (message.type === "chat") {
			const text =
				typeof message.text === "string" ? message.text.trim() : "";
			if (text === "" || text.length > 200) {
				return ws.send(
					JSON.stringify({
						type: "error",
						error: "Message invalide.",
					}),
				);
			}
			// …
		}
	});

	ws.on("close", (code, reason) => {
		// La connexion est fermée : on fait le ménage.
	});

	// Sans gestionnaire 'error', une trame invalide fait planter Node.
	ws.on("error", console.error);
});
}



