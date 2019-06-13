const childProcess = require('child_process');

function copyCssToLib() {
    childProcess.execSync("find ./src -name '*.css' -type f -exec cp -P {} ./lib \\;");
}

copyCssToLib();
