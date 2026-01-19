const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get("/allcards", async (req, res) => {
	try {
		let connection = await mysql.createConnection(dbConfig);
		const [rows] = await connection.execute("SELECT * FROM defaultdb.cards");
		res.json(rows);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch cards" });
		console.error(error);
	}
});

app.post("/addcard", async (req, res) => {
	const { card_name, card_pic } = req.body;
	try {
		let connection = await mysql.createConnection(dbConfig);
		const [result] = await connection.execute(
			"INSERT INTO defaultdb.cards (card_name, card_pic) VALUES (?, ?)",
			[card_name, card_pic]
		);
		res
			.status(201)
			.json({ message: "Card added successfully", card_id: result.insertId });
	} catch (error) {
		res.status(500).json({ error: `Failed to add card ${card_name}` });
		console.error(error);
	}
});

app.delete("/deletecard/:card_id", async (req, res) => {
	const card_id = req.params.card_id;
	try {
		let connection = await mysql.createConnection(dbConfig);
		const [result] = await connection.execute("DELETE FROM defaultdb.cards WHERE card_id = ?", [card_id]);
		res.json({ message: "Card deleted successfully", card_id: card_id });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete card" });
		console.error(error);
	}
});

app.put("/updatecard/:card_id", async (req, res) => {
	const card_id = req.params.card_id;
	const { card_name, card_pic } = req.body;
	try {
		let connection = await mysql.createConnection(dbConfig);
		const [result] = await connection.execute("UPDATE defaultdb.cards SET card_name = ?, card_pic = ? WHERE card_id = ?", [card_name, card_pic, card_id]);
		res.json({ message: "Card updated successfully", card_id: card_id });
	} catch (error) {
		res.status(500).json({ error: "Failed to update card" });
		console.error(error);
	}	
});