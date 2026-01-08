// process.env.AWS_SDK_LOAD_CONFIG = '1';
const express = require('express');

const AWS = require("aws-sdk");
const https = require('https');


require("dotenv").config();
// console.log(process.env.LOCAL_AWS_ENVIRONMENT);
// console.log(process.env.NODE_ENV);

if(process.env.NODE_ENV==='development'){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const app = express();
const PORT = process.env.PORT || 8000;

const _agent = new https.Agent({
  keepAlive: true,
  maxSockets: 100
});

const s3Client = new AWS.S3(
    { 
        region: 'us-east-1', 
        httpOptions: {
            _agent,
            timeout: 5000
        } 
    }
);


// if(process.env.LOCAL_AWS_ENVIRONMENT==='true'){
//     console.log("working");
//     const credentials = new AWS.SharedIniFileCredentials({ profile: 'lm-dev-chelladurai' });
//     AWS.config.credentials = credentials;
// }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/qa_api_testing", async(req, res) => {
    console.log("working");

    const _bucketName = req.query.bucketname;
    const _fileName = req.query.filename;

    if (!_bucketName || !_fileName) {
        return res.status(400).json({ status: "failed", message: "bucketname and filename required" });
    }

    try {

        const params = {
            // Bucket: "lm-content-testing-working",
            Bucket: _bucketName,
            Key: _fileName+".json"
        };

        const data = await s3Client.getObject(params).promise();
        const contents = JSON.parse(data.Body.toString('utf-8'));
        console.log(contents);
        res.status(200).json({ status: "success", data: contents });
    } catch (err) {
        console.error(err);
        res.status(500).json({status: "failed", data: "Failed to fetch files" });
    }
  
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

