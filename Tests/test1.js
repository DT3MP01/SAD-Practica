const fs = require('fs');

var fib = function(n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
const myArgs = process.argv.slice(2);
const content = fib(myArgs[0]);
fs.writeFile(myArgs[1], content.toString(), err => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});