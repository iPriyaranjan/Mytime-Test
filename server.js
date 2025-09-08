import "dotenv/config";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectToDatabase } from './db/connection.js';
import encryptedRoutes from './routes/encrypted.js';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

await connectToDatabase();

app.use('/api/encrypted', encryptedRoutes);

app.get('/test',(req,res)=>{
    try{
        res.status(200).json({msg:'Connected to server successfully.'})
    }catch(error){
        res.status(400).json({ msg: "Server error",error })
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
