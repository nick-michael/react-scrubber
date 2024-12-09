import childProcess from 'child_process';

export function copyByFileType(fileType, fromDir, toDir) {
    if (process.platform === 'win32') {
        childProcess.execSync(`find ${fromDir} -name '*.${fileType}' -type f -exec cp -P {} ${toDir} \;`);
    } else {
        childProcess.execSync(`find ${fromDir} -name '*.${fileType}' -type f -exec cp -P {} ${toDir} \;`);
    }
}
