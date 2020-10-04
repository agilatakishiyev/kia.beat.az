import "reflect-metadata"
import express from "express";
import { createConnection } from "typeorm";
import { User } from './entities/User';
import { GeneratedImage } from "./entities/GeneratedImage";

createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    // port: 5432,
    // host: "localhost",
    // username: "",
    // password: "",
    // database: "kia",
    entities: [
        User,
        GeneratedImage
    ]
}).then(async connection => {

    const app = express();
    app.use(express.json({
        type: 'application/json'
    }));
    app.use(express.urlencoded({ extended: false }));

    app.set('view engine', 'ejs');
    app.set("views", "src/views");

    app.get('/', async (_, res) => {
        const generatedImagesTillNow = await connection.manager.find(GeneratedImage);
        res.render('index', { generationCount: generatedImagesTillNow.length });
    });

    app.post('/new-user', (req, res) => {
        const { name, surname } = req.body;
        connection.manager.insert(User, {
            name,
            surname
        });
        res.json({ name, surname });
    });

    app.use(express.static(__dirname));

    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚡️[server]: Server is running at https://localhost:${process.env.PORT || 8000}`);
    });
}).catch(err => {
    console.log('could not connect to the db', err);
});

