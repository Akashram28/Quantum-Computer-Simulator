const math = require('mathjs')
const nj = require('numjs')
let col1 = math.kron([[1,0] , [0,1]],[[0,1] , [1,0]])
let col2 = math.kron([[1,0] , [0,1]],[[1,0] , [0,1]])
let dot = nj.dot(col1,col2)
let dm = math.multiply(col1,col2)
let input = [1,0,0,0]
let output = nj.dot(dot,input)
console.log(dm)
console.log(dot.selection.data)
console.log(output.selection.data)