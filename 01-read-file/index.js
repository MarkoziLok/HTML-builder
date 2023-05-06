const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname,'text.txt')

fs.readFile(filePath, (error,data) => {
        if(error) throw error; 
        const content = Buffer.from(data);
        console.log(content.toString()); 
    }
);