import childProcess from 'child_process';
import { copyByFileType } from '../copy-by-file-type.js';

copyByFileType('css', './src', '../docs');
childProcess.execSync("cp index.html ../docs");
