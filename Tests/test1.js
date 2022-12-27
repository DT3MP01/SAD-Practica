var fib = function(n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
const myArgs = process.argv.slice(2);
console.log(fib(myArgs[0]))