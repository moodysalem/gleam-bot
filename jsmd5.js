/**
 * they apparently modified this script because it produces different hashes than v0.1.2 of js-md5
 */

/*
 * js-md5 v0.1.2
 * https://github.com/emn178/js-md5
 *
 * Copyright 2014, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
(function(root, undefined) {
  "use strict";
  var HEX_CHARS = "0123456789abcdef"
    , HEX_TABLE = {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      a: 10,
      b: 11,
      c: 12,
      d: 13,
      e: 14,
      f: 15,
      A: 10,
      B: 11,
      C: 12,
      D: 13,
      E: 14,
      F: 15
    }
    , R = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]
    , K = [3614090360, 3905402710, 606105819, 3250441966, 4118548399, 1200080426, 2821735955, 4249261313, 1770035416, 2336552879, 4294925233, 2304563134, 1804603682, 4254626195, 2792965006, 1236535329, 4129170786, 3225465664, 643717713, 3921069994, 3593408605, 38016083, 3634488961, 3889429448, 568446438, 3275163606, 4107603335, 1163531501, 2850285829, 4243563512, 1735328473, 2368359562, 4294588738, 2272392833, 1839030562, 4259657740, 2763975236, 1272893353, 4139469664, 3200236656, 681279174, 3936430074, 3572445317, 76029189, 3654602809, 3873151461, 530742520, 3299628645, 4096336452, 1126891415, 2878612391, 4237533241, 1700485571, 2399980690, 4293915773, 2240044497, 1873313359, 4264355552, 2734768916, 1309151649, 4149444226, 3174756917, 718787259, 3951481745]
    , jsmd5 = function(message) {
      for (var blocks = hasUTF8(message) ? UTF8toBlocks(message) : ASCIItoBlocks(message), h0 = 1732584193, h1 = 4023233417, h2 = 2562383102, h3 = 271733878, i = 0, length = blocks.length; length > i; i += 16) {
        for (var f, g, tmp, x, y, a = h0, b = h1, c = h2, d = h3, j = 0; 64 > j; ++j)
          16 > j ? (f = d ^ b & (c ^ d),
            g = j) : 32 > j ? (f = c ^ d & (b ^ c),
            g = (5 * j + 1) % 16) : 48 > j ? (f = b ^ c ^ d,
            g = (3 * j + 5) % 16) : (f = c ^ (b | ~d),
            g = 7 * j % 16),
            tmp = d,
            d = c,
            c = b,
            x = a + f + K[j] + blocks[i + g],
            y = R[j],
            b += x << y | x >>> 32 - y,
            a = tmp;
        h0 = h0 + a | 0,
          h1 = h1 + b | 0,
          h2 = h2 + c | 0,
          h3 = h3 + d | 0
      }
      return toHexString(h1) + toHexString(h0) + toHexString(h3) + toHexString(h2)
    }
    , toHexString = function(num) {
      for (var hex = "", i = 0; 4 > i; i++) {
        var offset = i << 3;
        hex += HEX_CHARS.charAt(num >> offset + 4 & 15) + HEX_CHARS.charAt(num >> offset & 15)
      }
      return hex
    }
    , hasUTF8 = function(message) {
      for (var i = message.length; i--; )
        if (message.charCodeAt(i) > 127)
          return !0;
      return !1
    }
    , ASCIItoBlocks = function(message) {
      var i, length = message.length, chunkCount = (length + 8 >> 6) + 1, blockCount = chunkCount << 4, blocks = [];
      for (i = 0; blockCount > i; ++i)
        blocks[i] = 0;
      for (i = 0; length > i; ++i)
        blocks[i >> 2] |= message.charCodeAt(i) << (i % 4 << 3);
      return blocks[i >> 2] |= 128 << (i % 4 << 3),
        blocks[blockCount - 2] = length << 3,
        blocks
    }
    , UTF8toBlocks = function(message) {
      for (var uri = encodeURIComponent(message), blocks = [], i = 0, bytes = 0, length = uri.length; length > i; ++i) {
        var c = uri.charCodeAt(i);
        37 == c ? blocks[bytes >> 2] |= (HEX_TABLE[uri.charAt(++i)] << 4 | HEX_TABLE[uri.charAt(++i)]) << (bytes % 4 << 3) : blocks[bytes >> 2] |= c << (bytes % 4 << 3),
          ++bytes
      }
      var chunkCount = (bytes + 8 >> 6) + 1
        , blockCount = chunkCount << 4
        , index = bytes >> 2;
      blocks[index] |= 128 << (bytes % 4 << 3);
      for (var i = index + 1; blockCount > i; ++i)
        blocks[i] = 0;
      return blocks[blockCount - 2] = bytes << 3,
        blocks
    }
    ;
  "undefined" != typeof module ? module.exports = jsmd5 : root && (root.jsmd5 = jsmd5)
})(this);