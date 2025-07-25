// backend/scripts/generateHash.js
const bcrypt = require('bcryptjs');

const plainPassword = 'LocalDevPass2025!';
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(plainPassword, salt);

console.log('Your plain text password is:');
console.log(plainPassword);
console.log('\nYour hashed password is (use this in mongosh):');
console.log(hashedPassword);

