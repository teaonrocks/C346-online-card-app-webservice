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
	} finally {
		if (connection) {
			await connection.end();
		}
	}
});
