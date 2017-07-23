/**
 * Created by Abdou on 29/01/2016.
 */

//var NodeRSA = require('node-rsa');
var CryptoJS=require('crypto-js');

module.exports=function(key){

console.log('Launch my RSA Crypt/Decrypt module');

    //  Getting Public Key
    var publicDer = key.exportKey('pkcs8-public-pem');

    console.log("The public Key: "+publicDer);

  //  var privateDer = key.exportKey('pkcs8-private-pem');

  //  console.log('privateDer: '+privateDer);


    //  var encrypted=key.encrypt(text,'base64');
    // Method to decrypt RSA Crypted msg using Private Key
   // var decrypt=key.decrypt(encrypted,'utf-8');


    var security = function () { };

    security.sha1 = function (word) {
        var result = CryptoJS.SHA1(word);
        return result.toString().toUpperCase();
    };

    security.encrypt = function (content, key, iv) {
        if (key.length != 16) {
            console.error('Use chave de 16 digitos');
            return;
        }
        content = CryptoJS.enc.Utf8.parse(content);
        key = CryptoJS.enc.Utf8.parse(key);
        var iv = CryptoJS.enc.Utf8.parse(iv);

        var options = {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: iv
        };

        var encrypted = CryptoJS.AES.encrypt(content, key, options);

        return encrypted;
    };

    security.decrypt = function (message, key, iv) {
        if (key.length != 16) {
            console.error('Use chave de 16 digitos');
            return;
        }
        console.log("the key to decrypt: "+key);
        key = CryptoJS.enc.Utf8.parse(key);
        var iv = CryptoJS.enc.Utf8.parse(iv)

        var options = {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: iv
        };
        var result = CryptoJS.AES.decrypt(message, key, options);

        return result;
    };

    var hash = security.sha1('blablablabla');
    var key = hash.substring(0, 16);
    var iv = '1234567812345678';
   // var iv = null;

    console.log("Encrypting the public key of RSA with AES ");

    //  Encrypt the PublicKey using a fixed key and Iv (see above) the key and iv must be the same in android/iOS  side
    var crypto = security.encrypt(publicDer, key, iv);

   // console.log("public key cipher: "+crypto.ciphertext);

    //  Return the a Crypted public Key to use on mobile app side to encrypt the password
    return crypto.ciphertext;

};

