require('dotenv').config()
const dbConnect = require('./database/index.js');
const app = require('./app.js');

dbConnect() 
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log(`Failed to connect with Mongodb, ${error}`);
    });
