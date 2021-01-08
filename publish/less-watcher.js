const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const exec = require('child_process').exec;

function compileTotal( productionConfig = 'dev'){
    const lessPath = path.join(__dirname,'resource','less');
    const jsPath = path.join(__dirname,'resource','js');
    const lessFolders = fs.readdirSync(lessPath); 
    const jsFolders = fs.readdirSync(jsPath); 

    for( const folder of lessFolders ){
        _compileLess( folder, productionConfig );
    }
}

function _compileLess( folder , productionConfig = 'dev'){
    const lessPath = path.join(__dirname,'resource','less');
    const jsPath = path.join(__dirname,'resource','js');

    const targetFile = path.join( lessPath, folder, 'component.less' );
    const targetFolder = path.join(__dirname,'static','css',folder);
    
    if( !fs.existsSync(targetFolder)  ){
        fs.mkdirSync(targetFolder);
    }

    if( fs.existsSync(targetFile) ){
        console.log('******************컴파일 시작*********************');

        let commandLine = 'lessc ';

        commandLine += targetFile + ' ' + path.join(targetFolder,'component.css');

        if( productionConfig != 'dev' ){
            commandLine += ' -x';
        }

        exec( commandLine, function (error, stdout, stderr) {
            if (error !== null) {
                console.log(error);
            }

            if (stdout) {
                console.error(stdout);
            }
        });
        console.log(commandLine);

        console.log('*******************컴파일 끝********************');
    }
    
}

/**
 * 우선 사용 안함
 */
async function getAllFiles( pathName ) {
    const entries = await fsPromises.readdir(pathName, { withFileTypes: true });

    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => ({ ...file, path: path.join( pathName, file.name ) }));

    const folders = entries.filter(folder => folder.isDirectory());

    for (const folder of folders)
        files.push(...await getFiles(`${path.join( pathName, folder.name )}`));

    return files;
}



module.exports = ( productionConfig = 'dev' ) =>{
    compileTotal( productionConfig );

    fs.watch( path.join(__dirname,'resource','less'), {recursive:true}, (event, filename) =>{
        console.log('***************************************');
        console.log(`event is: ${event} >> ${filename}`);
    
        if (filename) {
            const compileFolder = filename.split('\\')[0];
            if( compileFolder ){
                _compileLess( compileFolder , productionConfig );
            }
        } else {
    
            console.log('filename not provided');
    
        }

        //compileTotal( productionConfig );
    
    })
}

