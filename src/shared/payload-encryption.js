import CryptoJS from 'crypto-js';

/**
 * Encryption class for encrypt/decrypt that works between programming languages.
 * 
 * @author Vee Winch.
 * @link https://stackoverflow.com/questions/41222162/encrypt-in-php-openssl-and-decrypt-in-javascript-cryptojs Reference.
 * @link https://github.com/brix/crypto-js/releases crypto-js.js can be download from here.
 */
class Encryption {


    /**
     * @var integer Return encrypt method or Cipher method number. (128, 192, 256)
     */
    get encryptMethodLength() {
        var encryptMethod = this.encryptMethod;
        // get only number from string.
        // @link https://stackoverflow.com/a/10003709/128761 Reference.
        var aesNumber = encryptMethod.match(/\d+/)[0];
        return parseInt(aesNumber);
    }// encryptMethodLength


    /**
     * @var integer Return cipher method divide by 8. example: AES number 256 will be 256/8 = 32.
     */
    get encryptKeySize() {
        var aesNumber = this.encryptMethodLength;
        return parseInt(aesNumber / 8);
    }// encryptKeySize


    /**
     * @link http://php.net/manual/en/function.openssl-get-cipher-methods.php Refer to available methods in PHP if we are working between JS & PHP encryption.
     * @var string Cipher method. 
     *              Recommended AES-128-CBC, AES-192-CBC, AES-256-CBC 
     *              due to there is no `openssl_cipher_iv_length()` function in JavaScript 
     *              and all of these methods are known as 16 in iv_length.
     */
    get encryptMethod() {
        return 'AES-256-CBC';
    }// encryptMethod


    /**
     * Decrypt string.
     * 
     * @link https://stackoverflow.com/questions/41222162/encrypt-in-php-openssl-and-decrypt-in-javascript-cryptojs Reference.
     * @link https://stackoverflow.com/questions/25492179/decode-a-base64-string-using-cryptojs Crypto JS base64 encode/decode reference.
     * @param string encryptedString The encrypted string to be decrypt.
     * @param string key The key.
     * @return string Return decrypted string.
     */
    decrypt(encryptedString, key) {

        var orgStr = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(decodeURIComponent(encryptedString))));
        
        // if(!key) key = 'eTJmS3F6UlM5SVlSRG5sa1owOUF4dEpk';
       // if(!key) key = 'ABFE538E1664B722899673B1BB466E282A5700FA298D3549';
       if(!key) key = 'C496F11C96DCCDD373DA1478E2D086E93E1AB006C0D322783CE7BDC34AA8D52B';

        
        /* var salt = CryptoJS.enc.Hex.parse(json.salt);
        var iv = CryptoJS.enc.Hex.parse(json.iv);
        var encrypted = json.ciphertext;// no need to base64 decode. */

        let salt = CryptoJS.enc.Hex.parse(orgStr.substring(32, 544));
        let iv = CryptoJS.enc.Hex.parse(orgStr.substring(0, 32));
        let encrypted = orgStr.substring(544);// no need to base64 decode.

        /* var iterations = parseInt(json.iterations);
        if (iterations <= 0) {
            iterations = 999;
        } */
        var iterations = 999;
        var encryptMethodLength = (this.encryptMethodLength/4);// example: AES number is 256 / 4 = 64
        var hashKey = CryptoJS.PBKDF2(key, salt, {'hasher': CryptoJS.algo.SHA512, 'keySize': (encryptMethodLength/8), 'iterations': iterations});

        var decrypted = CryptoJS.AES.decrypt(encrypted, hashKey, {'mode': CryptoJS.mode.CBC, 'iv': iv});

        return decrypted.toString(CryptoJS.enc.Utf8);
    }// decrypt

    /**
     * Encrypt string.
     * 
     * @link https://stackoverflow.com/questions/41222162/encrypt-in-php-openssl-and-decrypt-in-javascript-cryptojs Reference.
     * @link https://stackoverflow.com/questions/25492179/decode-a-base64-string-using-cryptojs Crypto JS base64 encode/decode reference.
     * @param string string The original string to be encrypt.
     * @param string key The key.
     * @return string Return encrypted string.
     */
    encrypt(string, key) {
        
        // if(!key) key = 'eTJmS3F6UlM5SVlSRG5sa1owOUF4dEpk';
       // if(!key) key = 'ABFE538E1664B722899673B1BB466E282A5700FA298D3549';
       if(!key) key = 'C496F11C96DCCDD373DA1478E2D086E93E1AB006C0D322783CE7BDC34AA8D52B';
        var iv = CryptoJS.lib.WordArray.random(16);// the reason to be 16, please read on `encryptMethod` property.

        var salt = CryptoJS.lib.WordArray.random(256);
        var iterations = 999;
        var encryptMethodLength = (this.encryptMethodLength/4);// example: AES number is 256 / 4 = 64
        var hashKey = CryptoJS.PBKDF2(key, salt, {'hasher': CryptoJS.algo.SHA512, 'keySize': (encryptMethodLength/8), 'iterations': iterations});

        var encrypted = CryptoJS.AES.encrypt(string, hashKey, {'mode': CryptoJS.mode.CBC, 'iv': iv});
        var encryptedString = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);

        /* var output = {
            'ciphertext': encryptedString,
            'iv': CryptoJS.enc.Hex.stringify(iv),
            'salt': CryptoJS.enc.Hex.stringify(salt),
            'iterations': iterations
        };
        */

        var output = ""+CryptoJS.enc.Hex.stringify(iv)+""+CryptoJS.enc.Hex.stringify(salt)+""+encryptedString;
        return encodeURIComponent(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(output))));
    }// encrypt

}

export default Encryption;