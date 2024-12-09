import { copyByFileType } from './copy-by-file-type.js';

function copyCssToLib() {
    copyByFileType('css', './src', './lib');
}

copyCssToLib();
