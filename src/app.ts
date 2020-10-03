import "reflect-metadata"
import express from "express";
import { createConnection } from "typeorm";
import { User } from './entities/User';

createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}).then(async connection => {
    console.log('connected succeessfully to the db');

    const app = express();
    app.use(express.json({
        type: 'application/json'
    }));
    app.use(express.urlencoded({ extended: false }));

    app.set('view engine', 'ejs');
    app.set("views", "src/views");

    app.get('/', async (_, res) => {
        // const generatedImagesTillNow = await connection.manager.query('SELECT all from generated_images');
        // res.render('index', { generationCount: generatedImagesTillNow.length });
        res.render('index', { generationCount: 5 });
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

