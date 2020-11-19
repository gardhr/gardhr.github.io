var finabel = (function () {
  var hex = "0123456789abcdef";
  var lookup = new Array(256);
  for (var index = 0; index < 256; ++index)
    lookup[index] = hex.charAt(index >> 4) + hex.charAt(index & 0xf);

  function toHex(text) {
    var result = "";
    for (var index = 0, limit = text.length; index < limit; ++index) {
      var code = text.codePointAt(index);
      do {
        result += lookup[code & 0xff];
        code >>= 8;
      } while (code != 0);
    }
    return result;
  }

  var primes = new Array(3);

  primes[0] = BigInt(
    "900868433651123753195857434154886592863492075718887214387046829406809805283361296277175990663685161530183997243896077623165157756007099732429029873106259069821886766195661979481563101826429797570890866473513531898785774896418926615059720815237664116812063491035355207065882456370964859448027182804663"
  );

  primes[1] = BigInt(
    "906746488931122279923087816774254262549325961021203686871024593960273364483640837461275651353839912478276312989231907136777434371442297783809058139703704548112582549231057887119837609961275494698594028464424938139236812786325180573685365716054578878269276609138278646089652565880503149299047623725983"
  );

  primes[2] = BigInt(
    "935963679945159621618108135650731602316123462844739918966791054002220621454733515962631838558167071714943415781502503512108093455147689164719674990397035764248808486754562236727013255473894080575022971540677037449750273014794528407667454650131576454015775014701175216242011377646611112897139737772263"
  );

  primes.sort();

  var minimum_digits = primes[2].toString(16).length;

  var A = primes[0];
  var B = primes[1];
  var C = primes[2];

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

  function hash(key, salt, rounds, digits, verbose) {
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

    var result = BigInt("0x" + merged);
    do {
      var Q = stretch(result);
      var R = stretch((Q * A) % B);
      var F = (Q * R) % C;
      result = F;
    } while (rounds-- > 0);

    var text = result.toString(16);

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
