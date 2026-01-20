const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();
const port = process.env.PORT || 3000;
const cors = require("cors");
const allowedOrigins = [
"http://localhost:3000",
// "https://YOUR-frontend.vercel.app", // add later
// "https://YOUR-frontend.onrender.com" // add later
];



const dbConfig = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 100,
	queueLimit: 0,
};

const app = express();

app.use(express.json());

app.use(
	cors({
		origin: function (origin, callback) {
			// allow requests with no origin (Postman/server-to-server)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: false,
	})
);

app.use((req, res, next) => {
	const start = Date.now();
	res.on("finish", () => {
		console.log(
			`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`
		);
	});
	next();
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get("/allcards", async (req, res) => {
	let connection;
	try {
		connection = await mysql.createConnection(dbConfig);
		const [rows] = await connection.execute("SELECT * FROM defaultdb.cards");
		res.status(200).json(rows);
	} catch (error) {
		console.error("GET /allcards failed:", error);
		res.status(500).json({ error: "Failed to fetch cards" });
	} finally {
		if (connection) {
			await connection.end();
		}
	}
});

app.post("/addcard", async (req, res) => {
	const { card_name, card_pic } = req.body;
	if (!card_name || !card_pic) {
		return res.status(400).json({ error: "card_name and card_pic are required" });
	}
	let connection;
	try {
		connection = await mysql.createConnection(dbConfig);
		const [result] = await connection.execute(
			"INSERT INTO defaultdb.cards (card_name, card_pic) VALUES (?, ?)",
			[card_name, card_pic]
		);
		res
			.status(201)
			.json({ message: "Card added successfully", card_id: result.insertId });
	} catch (error) {
		console.error("POST /addcard failed:", error);
		res.status(500).json({ error: `Failed to add card ${card_name}` });
	} finally {
		if (connection) {
			await connection.end();
		}
	}
});

app.delete("/deletecard/:card_id", async (req, res) => {
	const id = req.params.card_id;
	if (!id) {
		return res.status(400).json({ error: "Missing card id" });
	}
	let connection;
	try {
		connection = await mysql.createConnection(dbConfig);
		const [result] = await connection.execute("DELETE FROM defaultdb.cards WHERE id = ?", [id]);
		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "Card not found" });
		}
		res.status(200).json({ message: "Card deleted successfully", card_id: id });
	} catch (error) {
		console.error(`DELETE /deletecard/${id} failed:`, error);
		res.status(500).json({ error: "Failed to delete card" });
	} finally {
		if (connection) {
			await connection.end();
		}
	}
});

app.put("/updatecard/:card_id", async (req, res) => {
	const id = req.params.card_id;
	const { card_name, card_pic } = req.body;
	if (!id) {
		return res.status(400).json({ error: "Missing card id" });
	}
	if (!card_name || !card_pic) {
		return res.status(400).json({ error: "card_name and card_pic are required" });
	}
	let connection;
	try {
		connection = await mysql.createConnection(dbConfig);
		const [result] = await connection.execute("UPDATE defaultdb.cards SET card_name = ?, card_pic = ? WHERE id = ?", [card_name, card_pic, id]);
		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "Card not found" });
		}
		res.status(200).json({ message: "Card updated successfully", card_id: id });
	} catch (error) {
		console.error(`PUT /updatecard/${id} failed:`, error);
		res.status(500).json({ error: "Failed to update card" });
	} finally {
		if (connection) {
			await connection.end();
		}
	}	
});
