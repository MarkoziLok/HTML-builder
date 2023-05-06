const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const fileName = 'text.txt';

fs.writeFile(fileName, '', (err) => {
  if (err) throw err;
  console.log('File created successfully!');
  console.log('Enter text to write to file:');
});

rl.on('line', (input) => {
  if (input === 'exit') {
    console.log('Goodbye!');
    rl.close();
  } else {
    fs.appendFile(fileName, input + '\n', (err) => {
      if (err) throw err;
      console.log(`"${input}" has been written to file.`);
    });
  }
});

process.on('SIGINT', () => {
  console.log('\nGoodbye!');
  process.exit();
});