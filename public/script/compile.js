const fs = require('fs')
const path = require('path')
const async = require('async')

fs.readdir(path.join(__dirname,'./reduxStore'), function(err, files) {
    if (err) return;
    
    files = files.filter((row)=>{
        return (row!='.DS_Store')
    })

    let importString = "";
    let reducerString = "";
    let actionString = "";
    files.map((fullName)=>{
        var name = fullName.split('.')[0];
        importString += `import {${name}Reducer,${name}Action} from './reduxStore/${fullName}'\n`;
        reducerString += `\t${name}:${name}Reducer,\n`;
        actionString += `window.${name}Action = ${name}Action(storeApp);\n`
    })

    let mainFileString = fs.readFileSync(path.join(__dirname,'./mainTemplate.js'), 'utf-8');
    mainFileString = mainFileString.replace("//!import", importString);
    mainFileString = mainFileString.replace("//!reducer", reducerString);
    mainFileString = mainFileString.replace("//!action", actionString);

    fs.writeFile(path.join(__dirname,'./main.js'), mainFileString, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
    
});

