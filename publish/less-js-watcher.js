const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const exec = require('child_process').exec;
const uglifyJS = require('uglify-js');

function compileTotal( productionConfig = 'dev'){
    const lessPath = path.join(__dirname,'resource','less');
    const jsPath = path.join(__dirname,'resource','js');
    const lessFolders = fs.readdirSync(lessPath); 
    const jsFolders = fs.readdirSync(jsPath); 

    for( const folder of lessFolders ){
        _compileLess( folder, productionConfig );
    }

    for( const folder of jsFolders ){
        _compileJs( folder, productionConfig );
    }
}

async function _compileJs( folder , productionConfig = 'dev'){
    const jsPath = path.join(__dirname,'resource','js');

    const targetFile = path.join( jsPath, folder );
    const targetFolder = path.join(__dirname,'static','js',folder);
    
    if( !fs.existsSync(targetFolder)  ){
        fs.mkdirSync(targetFolder);
    }
    
    const files = await getAllFiles( targetFile );
    if(files.length > 0){
        console.log('******************JS 컴파일 시작*********************');
        if( folder === 'etc' ){
            for( const file of files ){
                console.log(path.join(targetFolder,file.name));
                fs.writeFile(path.join(targetFolder,file.name), file.data.toString(), function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("File was successfully saved.");
                    }
                });
            }
        } else {
            const fileBuffers = files.reduce( ( result, file ) => { 
                result.push(file.data)
                result.push(Buffer.from('\r\n\r\n'));
                console.log(file.path);
                return result;
            } , [] );
            
            let jsConcatText = Buffer.concat(fileBuffers).toString();

            if( productionConfig !== 'dev' ){
                // 옵션 관련 https://github.com/mishoo/UglifyJS#minify-options
                const jsConcatText = uglifyJS.minify(jsConcatText , {
                    compress : {
                        drop_console : true
                    },
                    mangle : {
                        eval : true,
                        toplevel: true
                    }
                }).code;
            }

            fs.writeFile(path.join(targetFolder,`component.js`), jsConcatText, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("File was successfully saved.");
                }
            });
        }

        console.log('*******************JS 컴파일 끝********************');
    }
}

async function _compileLess( folder , productionConfig = 'dev'){
    const lessPath = path.join(__dirname,'resource','less');

    const targetFile = path.join( lessPath, folder, 'component.less' );
    const targetFolder = path.join(__dirname,'static','css',folder);
    if( !fs.existsSync(targetFolder)  ){
        fs.mkdirSync(targetFolder);
    }

    if( folder === 'etc' ){
        const files = await getAllFiles( path.join( lessPath, folder ));
        for( const file of files ){
            fs.writeFile(path.join(targetFolder,file.name), file.data.toString(), function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("File was successfully saved.");
                }
            });
        }
    } else {
        if( fs.existsSync(targetFile) ){
            console.log('******************LESS 컴파일 시작*********************');
    
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
    
            console.log('*******************LESS 컴파일 끝********************');
        }
    }
}

/**
 * 우선 사용 안함
 */
async function getAllFiles( pathName, result = [] ) {
    const entries = await fsPromises.readdir(pathName, { withFileTypes: true });
    for( file of entries ){
        if( file ){
            if( file.isDirectory() ){
                await getAllFiles(`${path.join( pathName, file.name )}`,result);
            } else {
                result.push ( { ...file, path: path.join( pathName, file.name ), data : fs.readFileSync( path.join( pathName, file.name )) } );
            }
        }
    }
    return result;
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
    })

    fs.watch( path.join(__dirname,'resource','js'), {recursive:true}, (event, filename) =>{
        console.log('***************************************');
        console.log(`event is: ${event} >> ${filename}`);
    
        if (filename) {
            const compileFolder = filename.split('\\')[0];
            if( compileFolder ){
                _compileJs( compileFolder , productionConfig );
            }
        } else {
    
            console.log('filename not provided');
    
        }
    })
}

