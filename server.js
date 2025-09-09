import "dotenv/config";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());


app.get('/test', (req, res) => {
    try {
        res.status(200).json({ msg: 'Connected to server successfully.' })
    } catch (error) {
        res.status(400).json({ msg: "Server error", error })
    }
})

app.post("/users", async (req, res) => {
    const { userName, email, password,age } = req.body;
    try {
        const user = await prisma.testUser.create({
            data: { userName, email, password,age },
        });
        res.json(user);
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
});

// Get all users
app.get("/getUser", async (req, res) => {
    const users = await prisma.testUser.findMany();
    res.json(users);
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
