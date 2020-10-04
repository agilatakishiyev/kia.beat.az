import "reflect-metadata"
import express from "express";
import { Connection, createConnection } from "typeorm";
import { User } from './entities/User';
import { Image } from "./entities/Image";

async function getImagesCount (connection: Connection): Promise<number> {
    try {
        const images = await connection.manager.find(Image)
        console.log(images.length);
        return images.length;
    } catch (error) {
        console.error(error)
        return 0;
    }
}

createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
        User,
        Image
    ],
    migrationsRun: true
}).then(async connection => {

    const app = express();
    app.use(express.json({
        type: 'application/json'
    }));
    app.use(express.urlencoded({ extended: false }));

    app.set('view engine', 'ejs');
    app.set("views", "src/views");

    app.get('/', async (_, res) => {
        const count = await getImagesCount(connection);
        res.render('index', { generationCount: count });
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

