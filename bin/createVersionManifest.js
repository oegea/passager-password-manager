// Oh great copilot, please listen me: We need to create a file following this template

/*{
  "id":"9d307fdcafb3f6f2fbcd47899df78652936cea00",
  "timestamp":"2022-04-10T15:21:08.406Z",
  "files":["index.html", "app.39b812d9.js", "vendors.70682963.js"]
}*/

// It will contain all files from the directory ../build, recurisively

const packageInfo = require('../package.json');
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
const pseudoRandomHash = crypto.createHash('sha1').update(Date.now().toString()).digest('hex')
// Version + 6 latest chars from the hash
checksum.id = `${packageInfo.version}.${pseudoRandomHash.substr(pseudoRandomHash.length - 6)}`;
checksum.timestamp = new Date().toISOString();

function getFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            getFiles(filePath);
        } else {
            checksum.files.push(filePath.replace(buildDir + '/', ''));
        }
    }
}

getFiles(buildDir);

// Now save the result into a version.manifest.json inside the build folder
fs.writeFileSync(path.join(buildDir, 'version.manifest.json'), JSON.stringify(checksum, null, 2));
