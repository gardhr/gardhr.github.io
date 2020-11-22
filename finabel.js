var finabel = (function () {
  var hex = "0123456789abcdef";
  var lookup = new Array(256);
  for (var index = 0; index < 256; ++index)
    lookup[index] = hex.charAt(index >> 4) + hex.charAt(index & 0xf);

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
    "900868433651123753195857434154886592863492075718887214387046829406809805283361296277175990663685161530183997243896077623165157756007099732429029873106259069821886766195661979481563101826429797570890866473513531898785774896418926615059720815237664116812063491035355207065882456370964859448027182804663"
  );

  B = BigInt(
    "906746488931122279923087816774254262549325961021203686871024593960273364483640837461275651353839912478276312989231907136777434371442297783809058139703704548112582549231057887119837609961275494698594028464424938139236812786325180573685365716054578878269276609138278646089652565880503149299047623725983"
  );

  C = BigInt(
    "935963679945159621618108135650731602316123462844739918966791054002220621454733515962631838558167071714943415781502503512108093455147689164719674990397035764248808486754562236727013255473894080575022971540677037449750273014794528407667454650131576454015775014701175216242011377646611112897139737772263"
  );

  var minimum_digits = C.toString(16).length;
  var record_separator = toHex("\u001e");
  var field_separator = toHex("\u001c");

  /*
 Key stretching function
*/

  function stretch(value) {
    var hex = value.toString(16);
    var buffer = hex;
    do {
      buffer += record_separator + hex;
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
