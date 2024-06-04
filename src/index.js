import dotenv from 'dotenv'
import dbConnect from "./database/index.js";
import app from './app.js';

dotenv.config({
    path: './env'
}); 

dbConnect()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`); 
    }); 
})
.catch((error) => {
    console.log(`Failed to connect with Mongodb, ${error}`); 
})