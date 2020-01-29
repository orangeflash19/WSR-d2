const config = require("config");
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = process.env.KEY;
const iv = process.env.IV;

function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(text) {
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}
// basic usage example
// var hw = encrypt("Some serious stuff");
// console.log(hw);
// console.log(decrypt(hw));

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
};
