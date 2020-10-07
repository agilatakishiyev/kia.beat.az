import "reflect-metadata";
import express from "express";
import { Connection, createConnection } from "typeorm";
import { User } from "./entities/User";
import { Image } from "./entities/Image";
import { v4 as uuidv4 } from "uuid";
import ejs from "ejs";
import fs from "fs";

var enforce = require('express-sslify');
const nodeHtmlToImage = require("node-html-to-image");

async function getImagesCount (connection: Connection): Promise<number> {
    try {
        const images = await connection.manager.find(Image);
        return images.length;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL || "postgresql://localhost:5433/kia",
    entities: [User, Image],
    synchronize: true,
    migrationsRun: true,
}).then(async (connection) => {
    const app = express();
    app.use(express.json({ type: "application/json" }));
    app.use(express.urlencoded({ extended: false }));
    app.use(enforce.HTTPS({ trustProtoHeader: true }));

    app.set("view engine", "ejs");
    app.set("views", "src/views");

    app.get("/", async (_, res) => {
        const count = await getImagesCount(connection);
        res.render("index", { generationCount: count });
    });

    app.post("/new-user", async (req, res) => {
        const userRepostiory = connection.getRepository(User);
        const user = new User();
        user.name = req.body.name;
        user.surname = req.body.surname;
        const newUser = await userRepostiory.save(user);

        res.send({
            name: req.body.name,
            surname: req.body.surname,
            userID: newUser.id,
        });
    });

    app.post("/generate", async (req, res) => {
        const data = req.body;
        const image = fs.readFileSync(
            `${__dirname}/assets/map_images/${data.city.toLowerCase()}.jpg`
        );
        if (!Boolean(data.user.userID) || !Boolean(data.city)) {
            res.status(404).send("not found image or user");
            return;
        }
        if (image) {
            const base64Image = Buffer.from(image).toString("base64");
            const imageURI = "data:image/jpeg;base64," + base64Image;
            const html: string = await ejs.renderFile(
                `${__dirname}/assets/template.ejs`,
                { ...data, imageURI },
                { async: true }
            );

            const imageName = `${data.user.userID}-${uuidv4()}`;

            nodeHtmlToImage({
                output: `${__dirname}/assets/generated_images/${imageName}.jpg`,
                html,
                puppeteerArgs: {
                    args: ["--no-sandbox", "--disable-setuid-sandbox"],
                },
            }).then(async () => {
                const newImage = new Image();
                newImage.image = imageName;
                newImage.date = new Date();
                const imageRepository = connection.getRepository(Image);
                await imageRepository.save(newImage);
                const userRepostiory = connection.getRepository(User);

                userRepostiory
                    .findOne(data.user.userID)
                    .then((user) => {
                        if (user) {
                            user.image = newImage;
                            userRepostiory.save(user);
                            res.download(
                                `${__dirname}/assets/generated_images/${imageName}.jpg`
                            );
                        }
                    })
                    .catch((err) => {
                        res.status(404).send(`not found ${err}`);
                    });
            });
        } else {
            res.status(404).send("not found");
        }
    });

    app.get("/get-image/:userID", (req, res) => {
        const userRepostiory = connection.getRepository(User);
        const imageRepository = connection.getRepository(Image);
        userRepostiory
            .findOne(req.params.userID, { relations: ["image"] })
            .then((user) => {
                if (user) {
                    imageRepository
                        .findOne({ id: user.image.id })
                        .then((image) => {
                            if (image) {
                                res.download(
                                    `${__dirname}/assets/generated_images/${image.image}.jpg`,
                                    `${image.image}.jpg`
                                );
                            }
                        })
                        .catch((err) => {
                            res.status(404).send(`image not found: ${err}`);
                        });
                }
            })
            .catch((err) => {
                res.status(404).send(`user not found: ${err}`);
            });
    });

    app.get("/sitemap.xml", (_, res) => {
        res.sendFile(`${__dirname}/sitemap.xml`);
    });

    app.use(express.static(__dirname));

    app.listen(process.env.PORT || 7777, () => {
        console.log(`⚡️[server]: Server is running at https://localhost:${process.env.PORT || 7777}`);
    });
}).catch((err) => {
    console.log("could not connect to the db", err);
});
