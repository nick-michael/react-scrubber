const childProcess = require('child_process');

childProcess.execSync("find ./src -name '*.css' -type f -exec cp -P {} ../docs \\;");
childProcess.execSync("cp index.html ../docs");
