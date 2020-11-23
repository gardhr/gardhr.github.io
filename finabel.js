var finabel = (function () {
  var hexadecimal = "0123456789abcdef";
  var lookup = new Array(256);
  for (var index = 0; index < 256; ++index)
    lookup[index] = hexadecimal.charAt(index >> 4) + hexadecimal.charAt(index & 0xf);

  function toHex(text) {
    var result = "";
    let encoded = encodeURIComponent(text);
    for (let index = 0; index < encoded.length; ++index) {
      let code = undefined;
      let ch = encoded[index];
      if (ch == "%") {
        code = Number("0x" + encoded[index + 1] + encoded[index + 2]);
        index += 2;
      } else code = ch.codePointAt(0);
      result += lookup[code];
    }
    return result;
  }

  A = BigInt(
      "90086843365112375319585743415488659286349207571888" +
      "72143870468294068098052833612962771759906636851615" +
      "30183997243896077623165157756007099732429029873106" +
      "25906982188676619566197948156310182642979757089086" +
      "64735135318987857748964189266150597208152376641168" +
      "12063491035355207065882456370964859448027182804663"
  );

  B = BigInt(
      "90674648893112227992308781677425426254932596102120" +
      "36868710245939602733644836408374612756513538399124" +
      "78276312989231907136777434371442297783809058139703" +
      "70454811258254923105788711983760996127549469859402" +
      "84644249381392368127863251805736853657160545788782" +
      "69276609138278646089652565880503149299047623725983"
  );

  C = BigInt(
      "93596367994515962161810813565073160231612346284473" +
      "99189667910540022206214547335159626318385581670717" +
      "14943415781502503512108093455147689164719674990397" +
      "03576424880848675456223672701325547389408057502297" +
      "15406770374497502730147945284076674546501315764540" +
      "15775014701175216242011377646611112897139737772263"
  );

  var minimum_digits = C.toString(16).length;
  var record_separator = toHex("\u001e");
  var field_separator = toHex("\u001c");

  /*
 Key stretching function
*/

  function stretch(value) {
    var hexadecimal = value.toString(16);
    var buffer = hexadecimal;
    do {
      buffer += record_separator + hexadecimal;
    } while (buffer.length < minimum_digits);
    return BigInt("0x" + buffer);
  }

  /*
 Hash function interface
*/

  function hash(key, salt, rounds, digits) {
    if (rounds == null) rounds = 0;
    if (digits == null) digits = 0;
    var keys = Array.isArray(key) ? key : [key];
    keys.push(salt);

    /*
 Initial construction: concatenate keys/salt
*/

    var merged = record_separator;
    for (var index = 0, limit = keys.length; index < limit; ++index) {
      var next = keys[index];
      if (next == null || next == "") continue;
      merged += toHex(next) + field_separator;
    }

    /*
 Compute the hash
*/

    var V = BigInt("0x" + merged);
    do {
      var Q = stretch(V);
      var R = (Q * A) % B;
      var S = stretch(R);
      V = (Q * S) % C;
    } while (rounds-- > 0);

    var text = V.toString(16);

    if (digits > 0) {
      var length = text.length;
      if (length > digits) return text.substr(0, digits);
      while (length++ < digits) text += "0";
    }

    return text;
  }

  return hash;
})();

if (typeof module !== "undefined") module.exports = finabel;
else if (typeof define === "function" && define.amd)
  define(function () {
    return finabel;
  });
