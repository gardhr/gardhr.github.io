/*
Copyright (c) 2020 Sebastian Garth

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
*/

var finabel = (function () {
  function dump(label, value, verbose) {
    if (verbose) console.log(label, ":", value.toString(16), "\n");
  }

  var hex = "0123456789abcdef";
  var lookup = new Array(256);
  for (var index = 0; index < 256; ++index)
    lookup[index] = hex.charAt(index >> 4) + hex.charAt(index & 0xf);

  function text_to_hex(data) {
    var result = "";
    for (var index = 0, length = data.length; index < length; ++index) {
      var code = data.codePointAt(index);
      do {
        result += lookup[code & 0xff];
        code >>= 8;
      } while (code != 0);
    }
    return result;
  }

  var primes = new Array(3);

  primes[0] = BigInt(
    "906746488931122279923087816774254262549325961021203686871024593960273364483640837461275651353839912478276312989231907136777434371442297783809058139703704548112582549231057887119837609961275494698594028464424938139236812786325180573685365716054578878269276609138278646089652565880503149299047623725983"
  );
  primes[1] = BigInt(
    "935963679945159621618108135650731602316123462844739918966791054002220621454733515962631838558167071714943415781502503512108093455147689164719674990397035764248808486754562236727013255473894080575022971540677037449750273014794528407667454650131576454015775014701175216242011377646611112897139737772263"
  );
  primes[2] = BigInt(
    "900868433651123753195857434154886592863492075718887214387046829406809805283361296277175990663685161530183997243896077623165157756007099732429029873106259069821886766195661979481563101826429797570890866473513531898785774896418926615059720815237664116812063491035355207065882456370964859448027182804663"
  );
  primes.sort();

  var minimum_digits = primes[2].toString(16).length;

  var A = primes[0];
  var B = primes[1];
  var C = primes[2];

  var record_separator = "\u001e";
  var field_separator = "\u001c";

  /*
 Key stretching function
*/

  function stretch(text) {
    var result = text;
    do {
      result += record_separator + text;
    } while (result.length < minimum_digits);
    return BigInt("0x" + text_to_hex(result));
  }

  /*
 Hash function interface
*/

  function hash(key, salt, rounds, digits, verbose) {
    if (rounds == null) rounds = 0;
    if (digits == null) digits = 0;
    var list = Array.isArray(key) ? key : [key];
    list.push(salt);

    /*
 Initial construction: concatenate keys/salt
*/

    var result = record_separator;
    for (var ldx = 0, lmx = list.length; ldx < lmx; ++ldx) {
      var next = list[ldx];
      if (next == null || next == "") continue;
      result += next + field_separator;
    }

    if (verbose) console.log("Merged: ", result, "\n");

    /*
 Compute the hash
*/

    do {
      var Q = stretch(result);
      dump("Q", Q, verbose);
      var R = stretch((Q * A) % B);
      dump("R", R, verbose);
      var F = (Q * R) % C;
      dump("F", F, verbose);
      result = F.toString(16);
    } while (rounds-- > 0);

    if (digits > 0) {
      var length = result.length;
      if (length > digits) return result.substr(0, digits);
      while (length++ < digits) result += "0";
    }

    return result;
  }

  return hash;
})();

if (typeof module !== "undefined") module.exports = finabel;
else if (typeof define === "function" && define.amd)
  define(function () {
    return finabel;
  });
