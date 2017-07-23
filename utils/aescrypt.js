/**
 * Created by Abdou on 11/02/2016.
 */
var CryptoJS=require('crypto-js');

var security = function () { };

// Encrypting using SHA1 this method is used to get a hashed key
security.sha1 = function (word) {
    var result = CryptoJS.SHA1(word);
    return result.toString().toUpperCase();
};


var theHash = security.sha1('blablablabla');
var theKey = theHash.substring(0, 16);
var theIv = '1234567812345678';


// Decrypting Aes Method
security.decrypt = function (message, key, iv) {
    if (key.length != 16) {
        //    console.error('Use chave de 16 digitos');
        return;
    }
    // console.log("the key to decrypt: "+key);
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


// Encrypting Aes Method
security.encrypt = function (content, key, iv) {
    if (key.length != 16) {
        //  console.error('Use chave de 16 digitos');
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
console.log('encrypt with AES');
    var encrypted = CryptoJS.AES.encrypt(content, key, options);

    return encrypted;
};

module.exports=function(cypher) {

    console.log('Launch my aes Crypt/Decrypt module');

    //  Decrypt the cypher using a fixed key and Iv (see above) the key and iv must be the same in android/iOS  side
    var dcrypt = security.decrypt(cypher, theKey, theIv);

    //  Convert Decrypted cypher to string
    var theDecryptedString= dcrypt.toString(CryptoJS.enc.Utf8);

    //  Return the Decrypted cypher
    return(theDecryptedString);

}

var AesDecrypt=function(cypher){

    var dcrypt = security.decrypt(cypher, theKey, theIv);

    //  Convert Decrypted cypher to string
    var theDecryptedString= dcrypt.toString(CryptoJS.enc.Utf8);

    //  Return the Decrypted cypher
    return(theDecryptedString);

}

var AesEncrypt=function(password){

   // callback(security.encrypt(password,theKey,theIv));

    console.log('theKey: '+theKey);
    console.log('theIv: '+theIv);

    return security.encrypt(password,theKey,theIv);
}

module.exports.AesDecrypt=AesDecrypt;
module.exports.AesEncrypt=AesEncrypt;