// Oh great copilot, please listen me: We need to create a file following this template

/*{
  "id":"9d307fdcafb3f6f2fbcd47899df78652936cea00",
  "timestamp":"2022-04-10T15:21:08.406Z",
  "files":[
    {
      "path":"index.html",
      "hash":"064c47308009992f133a44e368cf1dcfdaa9d85e"
    },
    {
      "path":"app.39b812d9.js",
      "hash":"1bd6e3344fbc3363b1faa00d1115378135aac5ce"
    },
    {
      "path":"vendors.70682963.js",
      "hash":"5b055ca612c8e6883decd76258261d85da3de644"
    }
  ]
}*/

// It will contain all files from the directory ../build, recurisively

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const buildDir = path.join(__dirname, '../build');

// Remove any previous checksum.json
if (fs.existsSync(path.join(buildDir, 'checksum.json'))) {
    fs.unlinkSync(path.join(buildDir, 'checksum.json'));
}

const checksum = {
    id: '',
    timestamp: '',
    files: []
};

// Generate id and timestamp
checksum.id = crypto.createHash('sha1').update(Date.now().toString()).digest('hex');
checksum.timestamp = new Date().toISOString();

function getFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            getFiles(filePath);
        } else {
            checksum.files.push({
                path: filePath.replace(buildDir + '/', ''),
                hash: crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex')
            });
        }
    }
}

getFiles(buildDir);

// Now save the result into a checksum.json inside the build folder
fs.writeFileSync(path.join(buildDir, 'checksum.json'), JSON.stringify(checksum, null, 2));
