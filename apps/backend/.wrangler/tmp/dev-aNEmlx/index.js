var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../node_modules/.bun/@neondatabase+serverless@1.1.0/node_modules/@neondatabase/serverless/index.mjs
var So = Object.create;
var Ie = Object.defineProperty;
var Eo = Object.getOwnPropertyDescriptor;
var Ao = Object.getOwnPropertyNames;
var Co = Object.getPrototypeOf;
var _o = Object.prototype.hasOwnProperty;
var Io = /* @__PURE__ */ __name((r, e, t) => e in r ? Ie(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t, "Io");
var a = /* @__PURE__ */ __name((r, e) => Ie(r, "name", { value: e, configurable: true }), "a");
var G = /* @__PURE__ */ __name((r, e) => () => (r && (e = r(r = 0)), e), "G");
var T = /* @__PURE__ */ __name((r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports), "T");
var ie = /* @__PURE__ */ __name((r, e) => {
  for (var t in e) Ie(r, t, {
    get: e[t],
    enumerable: true
  });
}, "ie");
var Dn = /* @__PURE__ */ __name((r, e, t, n) => {
  if (e && typeof e == "object" || typeof e == "function") for (let i2 of Ao(e)) !_o.call(r, i2) && i2 !== t && Ie(r, i2, { get: /* @__PURE__ */ __name(() => e[i2], "get"), enumerable: !(n = Eo(e, i2)) || n.enumerable });
  return r;
}, "Dn");
var Se = /* @__PURE__ */ __name((r, e, t) => (t = r != null ? So(Co(r)) : {}, Dn(e || !r || !r.__esModule ? Ie(t, "default", { value: r, enumerable: true }) : t, r)), "Se");
var O = /* @__PURE__ */ __name((r) => Dn(Ie({}, "__esModule", { value: true }), r), "O");
var E = /* @__PURE__ */ __name((r, e, t) => Io(r, typeof e != "symbol" ? e + "" : e, t), "E");
var Qn = T((lt) => {
  "use strict";
  p();
  lt.byteLength = Po;
  lt.toByteArray = Bo;
  lt.fromByteArray = ko;
  var ae = [], te = [], To = typeof Uint8Array < "u" ? Uint8Array : Array, qt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (Ee = 0, On = qt.length; Ee < On; ++Ee) ae[Ee] = qt[Ee], te[qt.charCodeAt(Ee)] = Ee;
  var Ee, On;
  te[45] = 62;
  te[95] = 63;
  function qn(r) {
    var e = r.length;
    if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var t = r.indexOf("=");
    t === -1 && (t = e);
    var n = t === e ? 0 : 4 - t % 4;
    return [t, n];
  }
  __name(qn, "qn");
  a(qn, "getLens");
  function Po(r) {
    var e = qn(r), t = e[0], n = e[1];
    return (t + n) * 3 / 4 - n;
  }
  __name(Po, "Po");
  a(Po, "byteLength");
  function Ro(r, e, t) {
    return (e + t) * 3 / 4 - t;
  }
  __name(Ro, "Ro");
  a(Ro, "_byteLength");
  function Bo(r) {
    var e, t = qn(r), n = t[0], i2 = t[1], s = new To(Ro(r, n, i2)), o = 0, u = i2 > 0 ? n - 4 : n, c;
    for (c = 0; c < u; c += 4) e = te[r.charCodeAt(c)] << 18 | te[r.charCodeAt(c + 1)] << 12 | te[r.charCodeAt(c + 2)] << 6 | te[r.charCodeAt(c + 3)], s[o++] = e >> 16 & 255, s[o++] = e >> 8 & 255, s[o++] = e & 255;
    return i2 === 2 && (e = te[r.charCodeAt(
      c
    )] << 2 | te[r.charCodeAt(c + 1)] >> 4, s[o++] = e & 255), i2 === 1 && (e = te[r.charCodeAt(c)] << 10 | te[r.charCodeAt(c + 1)] << 4 | te[r.charCodeAt(c + 2)] >> 2, s[o++] = e >> 8 & 255, s[o++] = e & 255), s;
  }
  __name(Bo, "Bo");
  a(Bo, "toByteArray");
  function Lo(r) {
    return ae[r >> 18 & 63] + ae[r >> 12 & 63] + ae[r >> 6 & 63] + ae[r & 63];
  }
  __name(Lo, "Lo");
  a(Lo, "tripletToBase64");
  function Fo(r, e, t) {
    for (var n, i2 = [], s = e; s < t; s += 3) n = (r[s] << 16 & 16711680) + (r[s + 1] << 8 & 65280) + (r[s + 2] & 255), i2.push(Lo(n));
    return i2.join("");
  }
  __name(Fo, "Fo");
  a(Fo, "encodeChunk");
  function ko(r) {
    for (var e, t = r.length, n = t % 3, i2 = [], s = 16383, o = 0, u = t - n; o < u; o += s) i2.push(Fo(
      r,
      o,
      o + s > u ? u : o + s
    ));
    return n === 1 ? (e = r[t - 1], i2.push(ae[e >> 2] + ae[e << 4 & 63] + "==")) : n === 2 && (e = (r[t - 2] << 8) + r[t - 1], i2.push(ae[e >> 10] + ae[e >> 4 & 63] + ae[e << 2 & 63] + "=")), i2.join("");
  }
  __name(ko, "ko");
  a(ko, "fromByteArray");
});
var Nn = T((Qt) => {
  p();
  Qt.read = function(r, e, t, n, i2) {
    var s, o, u = i2 * 8 - n - 1, c = (1 << u) - 1, l = c >> 1, f = -7, y = t ? i2 - 1 : 0, g = t ? -1 : 1, A = r[e + y];
    for (y += g, s = A & (1 << -f) - 1, A >>= -f, f += u; f > 0; s = s * 256 + r[e + y], y += g, f -= 8) ;
    for (o = s & (1 << -f) - 1, s >>= -f, f += n; f > 0; o = o * 256 + r[e + y], y += g, f -= 8) ;
    if (s === 0) s = 1 - l;
    else {
      if (s === c) return o ? NaN : (A ? -1 : 1) * (1 / 0);
      o = o + Math.pow(2, n), s = s - l;
    }
    return (A ? -1 : 1) * o * Math.pow(2, s - n);
  };
  Qt.write = function(r, e, t, n, i2, s) {
    var o, u, c, l = s * 8 - i2 - 1, f = (1 << l) - 1, y = f >> 1, g = i2 === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, A = n ? 0 : s - 1, C = n ? 1 : -1, D = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
    for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, o = f) : (o = Math.floor(Math.log(e) / Math.LN2), e * (c = Math.pow(2, -o)) < 1 && (o--, c *= 2), o + y >= 1 ? e += g / c : e += g * Math.pow(2, 1 - y), e * c >= 2 && (o++, c /= 2), o + y >= f ? (u = 0, o = f) : o + y >= 1 ? (u = (e * c - 1) * Math.pow(2, i2), o = o + y) : (u = e * Math.pow(2, y - 1) * Math.pow(2, i2), o = 0)); i2 >= 8; r[t + A] = u & 255, A += C, u /= 256, i2 -= 8) ;
    for (o = o << i2 | u, l += i2; l > 0; r[t + A] = o & 255, A += C, o /= 256, l -= 8) ;
    r[t + A - C] |= D * 128;
  };
});
var ii = T((Be) => {
  "use strict";
  p();
  var Nt = Qn(), Pe = Nn(), Wn = typeof Symbol == "function" && typeof Symbol.for == "function" ? /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom") : null;
  Be.Buffer = h;
  Be.SlowBuffer = Qo;
  Be.INSPECT_MAX_BYTES = 50;
  var ft = 2147483647;
  Be.kMaxLength = ft;
  h.TYPED_ARRAY_SUPPORT = Mo();
  !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function Mo() {
    try {
      let r = new Uint8Array(1), e = { foo: a(function() {
        return 42;
      }, "foo") };
      return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(r, e), r.foo() === 42;
    } catch {
      return false;
    }
  }
  __name(Mo, "Mo");
  a(Mo, "typedArraySupport");
  Object.defineProperty(h.prototype, "parent", { enumerable: true, get: a(function() {
    if (h.isBuffer(this)) return this.buffer;
  }, "get") });
  Object.defineProperty(h.prototype, "offset", { enumerable: true, get: a(function() {
    if (h.isBuffer(
      this
    )) return this.byteOffset;
  }, "get") });
  function he(r) {
    if (r > ft) throw new RangeError('The value "' + r + '" is invalid for option "size"');
    let e = new Uint8Array(r);
    return Object.setPrototypeOf(e, h.prototype), e;
  }
  __name(he, "he");
  a(he, "createBuffer");
  function h(r, e, t) {
    if (typeof r == "number") {
      if (typeof e == "string") throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      );
      return $t(r);
    }
    return Gn(r, e, t);
  }
  __name(h, "h");
  a(h, "Buffer");
  h.poolSize = 8192;
  function Gn(r, e, t) {
    if (typeof r == "string") return Do(r, e);
    if (ArrayBuffer.isView(r)) return Oo(r);
    if (r == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
    if (ue(r, ArrayBuffer) || r && ue(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ue(r, SharedArrayBuffer) || r && ue(
      r.buffer,
      SharedArrayBuffer
    ))) return jt(r, e, t);
    if (typeof r == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    let n = r.valueOf && r.valueOf();
    if (n != null && n !== r) return h.from(n, e, t);
    let i2 = qo(r);
    if (i2) return i2;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function") return h.from(r[Symbol.toPrimitive]("string"), e, t);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
  }
  __name(Gn, "Gn");
  a(Gn, "from");
  h.from = function(r, e, t) {
    return Gn(r, e, t);
  };
  Object.setPrototypeOf(
    h.prototype,
    Uint8Array.prototype
  );
  Object.setPrototypeOf(h, Uint8Array);
  function Vn(r) {
    if (typeof r != "number") throw new TypeError(
      '"size" argument must be of type number'
    );
    if (r < 0) throw new RangeError('The value "' + r + '" is invalid for option "size"');
  }
  __name(Vn, "Vn");
  a(Vn, "assertSize");
  function Uo(r, e, t) {
    return Vn(r), r <= 0 ? he(r) : e !== void 0 ? typeof t == "string" ? he(r).fill(e, t) : he(r).fill(e) : he(r);
  }
  __name(Uo, "Uo");
  a(Uo, "alloc");
  h.alloc = function(r, e, t) {
    return Uo(r, e, t);
  };
  function $t(r) {
    return Vn(r), he(r < 0 ? 0 : Gt(r) | 0);
  }
  __name($t, "$t");
  a($t, "allocUnsafe");
  h.allocUnsafe = function(r) {
    return $t(
      r
    );
  };
  h.allocUnsafeSlow = function(r) {
    return $t(r);
  };
  function Do(r, e) {
    if ((typeof e != "string" || e === "") && (e = "utf8"), !h.isEncoding(e)) throw new TypeError("Unknown encoding: " + e);
    let t = zn(r, e) | 0, n = he(t), i2 = n.write(
      r,
      e
    );
    return i2 !== t && (n = n.slice(0, i2)), n;
  }
  __name(Do, "Do");
  a(Do, "fromString");
  function Wt(r) {
    let e = r.length < 0 ? 0 : Gt(r.length) | 0, t = he(e);
    for (let n = 0; n < e; n += 1) t[n] = r[n] & 255;
    return t;
  }
  __name(Wt, "Wt");
  a(Wt, "fromArrayLike");
  function Oo(r) {
    if (ue(r, Uint8Array)) {
      let e = new Uint8Array(r);
      return jt(e.buffer, e.byteOffset, e.byteLength);
    }
    return Wt(r);
  }
  __name(Oo, "Oo");
  a(Oo, "fromArrayView");
  function jt(r, e, t) {
    if (e < 0 || r.byteLength < e) throw new RangeError('"offset" is outside of buffer bounds');
    if (r.byteLength < e + (t || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let n;
    return e === void 0 && t === void 0 ? n = new Uint8Array(r) : t === void 0 ? n = new Uint8Array(r, e) : n = new Uint8Array(
      r,
      e,
      t
    ), Object.setPrototypeOf(n, h.prototype), n;
  }
  __name(jt, "jt");
  a(jt, "fromArrayBuffer");
  function qo(r) {
    if (h.isBuffer(r)) {
      let e = Gt(r.length) | 0, t = he(e);
      return t.length === 0 || r.copy(t, 0, 0, e), t;
    }
    if (r.length !== void 0) return typeof r.length != "number" || zt(r.length) ? he(0) : Wt(r);
    if (r.type === "Buffer" && Array.isArray(r.data)) return Wt(r.data);
  }
  __name(qo, "qo");
  a(qo, "fromObject");
  function Gt(r) {
    if (r >= ft) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + ft.toString(16) + " bytes");
    return r | 0;
  }
  __name(Gt, "Gt");
  a(Gt, "checked");
  function Qo(r) {
    return +r != r && (r = 0), h.alloc(+r);
  }
  __name(Qo, "Qo");
  a(Qo, "SlowBuffer");
  h.isBuffer = a(function(e) {
    return e != null && e._isBuffer === true && e !== h.prototype;
  }, "isBuffer");
  h.compare = a(function(e, t) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), ue(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(e) || !h.isBuffer(t)) throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    );
    if (e === t) return 0;
    let n = e.length, i2 = t.length;
    for (let s = 0, o = Math.min(n, i2); s < o; ++s) if (e[s] !== t[s]) {
      n = e[s], i2 = t[s];
      break;
    }
    return n < i2 ? -1 : i2 < n ? 1 : 0;
  }, "compare");
  h.isEncoding = a(function(e) {
    switch (String(e).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  }, "isEncoding");
  h.concat = a(function(e, t) {
    if (!Array.isArray(e)) throw new TypeError(
      '"list" argument must be an Array of Buffers'
    );
    if (e.length === 0) return h.alloc(0);
    let n;
    if (t === void 0)
      for (t = 0, n = 0; n < e.length; ++n) t += e[n].length;
    let i2 = h.allocUnsafe(t), s = 0;
    for (n = 0; n < e.length; ++n) {
      let o = e[n];
      if (ue(o, Uint8Array)) s + o.length > i2.length ? (h.isBuffer(o) || (o = h.from(o)), o.copy(i2, s)) : Uint8Array.prototype.set.call(i2, o, s);
      else if (h.isBuffer(o)) o.copy(i2, s);
      else throw new TypeError('"list" argument must be an Array of Buffers');
      s += o.length;
    }
    return i2;
  }, "concat");
  function zn(r, e) {
    if (h.isBuffer(r)) return r.length;
    if (ArrayBuffer.isView(r) || ue(r, ArrayBuffer)) return r.byteLength;
    if (typeof r != "string") throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r
    );
    let t = r.length, n = arguments.length > 2 && arguments[2] === true;
    if (!n && t === 0) return 0;
    let i2 = false;
    for (; ; ) switch (e) {
      case "ascii":
      case "latin1":
      case "binary":
        return t;
      case "utf8":
      case "utf-8":
        return Ht(r).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return t * 2;
      case "hex":
        return t >>> 1;
      case "base64":
        return ni(r).length;
      default:
        if (i2) return n ? -1 : Ht(r).length;
        e = ("" + e).toLowerCase(), i2 = true;
    }
  }
  __name(zn, "zn");
  a(zn, "byteLength");
  h.byteLength = zn;
  function No(r, e, t) {
    let n = false;
    if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e)) return "";
    for (r || (r = "utf8"); ; ) switch (r) {
      case "hex":
        return Zo(this, e, t);
      case "utf8":
      case "utf-8":
        return Yn(this, e, t);
      case "ascii":
        return Ko(this, e, t);
      case "latin1":
      case "binary":
        return Yo(
          this,
          e,
          t
        );
      case "base64":
        return Vo(this, e, t);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Jo(
          this,
          e,
          t
        );
      default:
        if (n) throw new TypeError("Unknown encoding: " + r);
        r = (r + "").toLowerCase(), n = true;
    }
  }
  __name(No, "No");
  a(
    No,
    "slowToString"
  );
  h.prototype._isBuffer = true;
  function Ae(r, e, t) {
    let n = r[e];
    r[e] = r[t], r[t] = n;
  }
  __name(Ae, "Ae");
  a(Ae, "swap");
  h.prototype.swap16 = a(function() {
    let e = this.length;
    if (e % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t = 0; t < e; t += 2) Ae(this, t, t + 1);
    return this;
  }, "swap16");
  h.prototype.swap32 = a(function() {
    let e = this.length;
    if (e % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t = 0; t < e; t += 4) Ae(this, t, t + 3), Ae(this, t + 1, t + 2);
    return this;
  }, "swap32");
  h.prototype.swap64 = a(
    function() {
      let e = this.length;
      if (e % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let t = 0; t < e; t += 8) Ae(this, t, t + 7), Ae(this, t + 1, t + 6), Ae(this, t + 2, t + 5), Ae(this, t + 3, t + 4);
      return this;
    },
    "swap64"
  );
  h.prototype.toString = a(function() {
    let e = this.length;
    return e === 0 ? "" : arguments.length === 0 ? Yn(
      this,
      0,
      e
    ) : No.apply(this, arguments);
  }, "toString");
  h.prototype.toLocaleString = h.prototype.toString;
  h.prototype.equals = a(function(e) {
    if (!h.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
    return this === e ? true : h.compare(this, e) === 0;
  }, "equals");
  h.prototype.inspect = a(function() {
    let e = "", t = Be.INSPECT_MAX_BYTES;
    return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
  }, "inspect");
  Wn && (h.prototype[Wn] = h.prototype.inspect);
  h.prototype.compare = a(function(e, t, n, i2, s) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), !h.isBuffer(e)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
    if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), i2 === void 0 && (i2 = 0), s === void 0 && (s = this.length), t < 0 || n > e.length || i2 < 0 || s > this.length) throw new RangeError("out of range index");
    if (i2 >= s && t >= n) return 0;
    if (i2 >= s) return -1;
    if (t >= n) return 1;
    if (t >>>= 0, n >>>= 0, i2 >>>= 0, s >>>= 0, this === e) return 0;
    let o = s - i2, u = n - t, c = Math.min(o, u), l = this.slice(
      i2,
      s
    ), f = e.slice(t, n);
    for (let y = 0; y < c; ++y) if (l[y] !== f[y]) {
      o = l[y], u = f[y];
      break;
    }
    return o < u ? -1 : u < o ? 1 : 0;
  }, "compare");
  function Kn(r, e, t, n, i2) {
    if (r.length === 0) return -1;
    if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, zt(t) && (t = i2 ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
      if (i2) return -1;
      t = r.length - 1;
    } else if (t < 0) if (i2) t = 0;
    else return -1;
    if (typeof e == "string" && (e = h.from(
      e,
      n
    )), h.isBuffer(e)) return e.length === 0 ? -1 : jn(r, e, t, n, i2);
    if (typeof e == "number") return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? i2 ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : jn(r, [e], t, n, i2);
    throw new TypeError("val must be string, number or Buffer");
  }
  __name(Kn, "Kn");
  a(Kn, "bidirectionalIndexOf");
  function jn(r, e, t, n, i2) {
    let s = 1, o = r.length, u = e.length;
    if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
      if (r.length < 2 || e.length < 2) return -1;
      s = 2, o /= 2, u /= 2, t /= 2;
    }
    function c(f, y) {
      return s === 1 ? f[y] : f.readUInt16BE(y * s);
    }
    __name(c, "c");
    a(c, "read");
    let l;
    if (i2) {
      let f = -1;
      for (l = t; l < o; l++) if (c(r, l) === c(e, f === -1 ? 0 : l - f)) {
        if (f === -1 && (f = l), l - f + 1 === u) return f * s;
      } else f !== -1 && (l -= l - f), f = -1;
    } else for (t + u > o && (t = o - u), l = t; l >= 0; l--) {
      let f = true;
      for (let y = 0; y < u; y++) if (c(r, l + y) !== c(e, y)) {
        f = false;
        break;
      }
      if (f) return l;
    }
    return -1;
  }
  __name(jn, "jn");
  a(jn, "arrayIndexOf");
  h.prototype.includes = a(function(e, t, n) {
    return this.indexOf(
      e,
      t,
      n
    ) !== -1;
  }, "includes");
  h.prototype.indexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, true);
  }, "indexOf");
  h.prototype.lastIndexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, false);
  }, "lastIndexOf");
  function Wo(r, e, t, n) {
    t = Number(t) || 0;
    let i2 = r.length - t;
    n ? (n = Number(n), n > i2 && (n = i2)) : n = i2;
    let s = e.length;
    n > s / 2 && (n = s / 2);
    let o;
    for (o = 0; o < n; ++o) {
      let u = parseInt(e.substr(o * 2, 2), 16);
      if (zt(u)) return o;
      r[t + o] = u;
    }
    return o;
  }
  __name(Wo, "Wo");
  a(Wo, "hexWrite");
  function jo(r, e, t, n) {
    return ht(Ht(e, r.length - t), r, t, n);
  }
  __name(jo, "jo");
  a(jo, "utf8Write");
  function Ho(r, e, t, n) {
    return ht(ra(e), r, t, n);
  }
  __name(Ho, "Ho");
  a(
    Ho,
    "asciiWrite"
  );
  function $o(r, e, t, n) {
    return ht(ni(e), r, t, n);
  }
  __name($o, "$o");
  a($o, "base64Write");
  function Go(r, e, t, n) {
    return ht(
      na(e, r.length - t),
      r,
      t,
      n
    );
  }
  __name(Go, "Go");
  a(Go, "ucs2Write");
  h.prototype.write = a(function(e, t, n, i2) {
    if (t === void 0) i2 = "utf8", n = this.length, t = 0;
    else if (n === void 0 && typeof t == "string") i2 = t, n = this.length, t = 0;
    else if (isFinite(t))
      t = t >>> 0, isFinite(n) ? (n = n >>> 0, i2 === void 0 && (i2 = "utf8")) : (i2 = n, n = void 0);
    else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let s = this.length - t;
    if ((n === void 0 || n > s) && (n = s), e.length > 0 && (n < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    i2 || (i2 = "utf8");
    let o = false;
    for (; ; ) switch (i2) {
      case "hex":
        return Wo(this, e, t, n);
      case "utf8":
      case "utf-8":
        return jo(this, e, t, n);
      case "ascii":
      case "latin1":
      case "binary":
        return Ho(this, e, t, n);
      case "base64":
        return $o(this, e, t, n);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Go(this, e, t, n);
      default:
        if (o) throw new TypeError("Unknown encoding: " + i2);
        i2 = ("" + i2).toLowerCase(), o = true;
    }
  }, "write");
  h.prototype.toJSON = a(function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  }, "toJSON");
  function Vo(r, e, t) {
    return e === 0 && t === r.length ? Nt.fromByteArray(r) : Nt.fromByteArray(r.slice(e, t));
  }
  __name(Vo, "Vo");
  a(Vo, "base64Slice");
  function Yn(r, e, t) {
    t = Math.min(r.length, t);
    let n = [], i2 = e;
    for (; i2 < t; ) {
      let s = r[i2], o = null, u = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1;
      if (i2 + u <= t) {
        let c, l, f, y;
        switch (u) {
          case 1:
            s < 128 && (o = s);
            break;
          case 2:
            c = r[i2 + 1], (c & 192) === 128 && (y = (s & 31) << 6 | c & 63, y > 127 && (o = y));
            break;
          case 3:
            c = r[i2 + 1], l = r[i2 + 2], (c & 192) === 128 && (l & 192) === 128 && (y = (s & 15) << 12 | (c & 63) << 6 | l & 63, y > 2047 && (y < 55296 || y > 57343) && (o = y));
            break;
          case 4:
            c = r[i2 + 1], l = r[i2 + 2], f = r[i2 + 3], (c & 192) === 128 && (l & 192) === 128 && (f & 192) === 128 && (y = (s & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | f & 63, y > 65535 && y < 1114112 && (o = y));
        }
      }
      o === null ? (o = 65533, u = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), n.push(o), i2 += u;
    }
    return zo(n);
  }
  __name(Yn, "Yn");
  a(Yn, "utf8Slice");
  var Hn = 4096;
  function zo(r) {
    let e = r.length;
    if (e <= Hn) return String.fromCharCode.apply(String, r);
    let t = "", n = 0;
    for (; n < e; ) t += String.fromCharCode.apply(String, r.slice(n, n += Hn));
    return t;
  }
  __name(zo, "zo");
  a(zo, "decodeCodePointsArray");
  function Ko(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i2 = e; i2 < t; ++i2) n += String.fromCharCode(r[i2] & 127);
    return n;
  }
  __name(Ko, "Ko");
  a(Ko, "asciiSlice");
  function Yo(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i2 = e; i2 < t; ++i2) n += String.fromCharCode(r[i2]);
    return n;
  }
  __name(Yo, "Yo");
  a(Yo, "latin1Slice");
  function Zo(r, e, t) {
    let n = r.length;
    (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
    let i2 = "";
    for (let s = e; s < t; ++s) i2 += ia[r[s]];
    return i2;
  }
  __name(Zo, "Zo");
  a(Zo, "hexSlice");
  function Jo(r, e, t) {
    let n = r.slice(e, t), i2 = "";
    for (let s = 0; s < n.length - 1; s += 2) i2 += String.fromCharCode(n[s] + n[s + 1] * 256);
    return i2;
  }
  __name(Jo, "Jo");
  a(Jo, "utf16leSlice");
  h.prototype.slice = a(function(e, t) {
    let n = this.length;
    e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
    let i2 = this.subarray(e, t);
    return Object.setPrototypeOf(i2, h.prototype), i2;
  }, "slice");
  function q(r, e, t) {
    if (r % 1 !== 0 || r < 0) throw new RangeError("offset is not uint");
    if (r + e > t) throw new RangeError("Trying to access beyond buffer length");
  }
  __name(q, "q");
  a(q, "checkOffset");
  h.prototype.readUintLE = h.prototype.readUIntLE = a(
    function(e, t, n) {
      e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
      let i2 = this[e], s = 1, o = 0;
      for (; ++o < t && (s *= 256); ) i2 += this[e + o] * s;
      return i2;
    },
    "readUIntLE"
  );
  h.prototype.readUintBE = h.prototype.readUIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(
      e,
      t,
      this.length
    );
    let i2 = this[e + --t], s = 1;
    for (; t > 0 && (s *= 256); ) i2 += this[e + --t] * s;
    return i2;
  }, "readUIntBE");
  h.prototype.readUint8 = h.prototype.readUInt8 = a(
    function(e, t) {
      return e = e >>> 0, t || q(e, 1, this.length), this[e];
    },
    "readUInt8"
  );
  h.prototype.readUint16LE = h.prototype.readUInt16LE = a(function(e, t) {
    return e = e >>> 0, t || q(
      e,
      2,
      this.length
    ), this[e] | this[e + 1] << 8;
  }, "readUInt16LE");
  h.prototype.readUint16BE = h.prototype.readUInt16BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 2, this.length), this[e] << 8 | this[e + 1];
  }, "readUInt16BE");
  h.prototype.readUint32LE = h.prototype.readUInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
  }, "readUInt32LE");
  h.prototype.readUint32BE = h.prototype.readUInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
  }, "readUInt32BE");
  h.prototype.readBigUInt64LE = we(a(function(e) {
    e = e >>> 0, Re(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i2 = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, s = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
    return BigInt(i2) + (BigInt(s) << BigInt(32));
  }, "readBigUInt64LE"));
  h.prototype.readBigUInt64BE = we(a(function(e) {
    e = e >>> 0, Re(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i2 = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], s = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
    return (BigInt(i2) << BigInt(
      32
    )) + BigInt(s);
  }, "readBigUInt64BE"));
  h.prototype.readIntLE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(
      e,
      t,
      this.length
    );
    let i2 = this[e], s = 1, o = 0;
    for (; ++o < t && (s *= 256); ) i2 += this[e + o] * s;
    return s *= 128, i2 >= s && (i2 -= Math.pow(2, 8 * t)), i2;
  }, "readIntLE");
  h.prototype.readIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i2 = t, s = 1, o = this[e + --i2];
    for (; i2 > 0 && (s *= 256); ) o += this[e + --i2] * s;
    return s *= 128, o >= s && (o -= Math.pow(2, 8 * t)), o;
  }, "readIntBE");
  h.prototype.readInt8 = a(function(e, t) {
    return e = e >>> 0, t || q(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
  }, "readInt8");
  h.prototype.readInt16LE = a(function(e, t) {
    e = e >>> 0, t || q(
      e,
      2,
      this.length
    );
    let n = this[e] | this[e + 1] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16LE");
  h.prototype.readInt16BE = a(function(e, t) {
    e = e >>> 0, t || q(e, 2, this.length);
    let n = this[e + 1] | this[e] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16BE");
  h.prototype.readInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
  }, "readInt32LE");
  h.prototype.readInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
  }, "readInt32BE");
  h.prototype.readBigInt64LE = we(a(function(e) {
    e = e >>> 0, Re(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i2 = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
    return (BigInt(i2) << BigInt(
      32
    )) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
  }, "readBigInt64LE"));
  h.prototype.readBigInt64BE = we(a(function(e) {
    e = e >>> 0, Re(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i2 = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
    return (BigInt(i2) << BigInt(32)) + BigInt(
      this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n
    );
  }, "readBigInt64BE"));
  h.prototype.readFloatLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, true, 23, 4);
  }, "readFloatLE");
  h.prototype.readFloatBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, false, 23, 4);
  }, "readFloatBE");
  h.prototype.readDoubleLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(this, e, true, 52, 8);
  }, "readDoubleLE");
  h.prototype.readDoubleBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(
      this,
      e,
      false,
      52,
      8
    );
  }, "readDoubleBE");
  function V(r, e, t, n, i2, s) {
    if (!h.isBuffer(r)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e > i2 || e < s) throw new RangeError('"value" argument is out of bounds');
    if (t + n > r.length) throw new RangeError("Index out of range");
  }
  __name(V, "V");
  a(V, "checkInt");
  h.prototype.writeUintLE = h.prototype.writeUIntLE = a(function(e, t, n, i2) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i2) {
      let u = Math.pow(2, 8 * n) - 1;
      V(
        this,
        e,
        t,
        n,
        u,
        0
      );
    }
    let s = 1, o = 0;
    for (this[t] = e & 255; ++o < n && (s *= 256); ) this[t + o] = e / s & 255;
    return t + n;
  }, "writeUIntLE");
  h.prototype.writeUintBE = h.prototype.writeUIntBE = a(function(e, t, n, i2) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i2) {
      let u = Math.pow(2, 8 * n) - 1;
      V(this, e, t, n, u, 0);
    }
    let s = n - 1, o = 1;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) this[t + s] = e / o & 255;
    return t + n;
  }, "writeUIntBE");
  h.prototype.writeUint8 = h.prototype.writeUInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
  }, "writeUInt8");
  h.prototype.writeUint16LE = h.prototype.writeUInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeUInt16LE");
  h.prototype.writeUint16BE = h.prototype.writeUInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeUInt16BE");
  h.prototype.writeUint32LE = h.prototype.writeUInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
  }, "writeUInt32LE");
  h.prototype.writeUint32BE = h.prototype.writeUInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeUInt32BE");
  function Zn(r, e, t, n, i2) {
    ri(e, n, i2, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, t;
  }
  __name(Zn, "Zn");
  a(Zn, "wrtBigUInt64LE");
  function Jn(r, e, t, n, i2) {
    ri(e, n, i2, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t + 7] = s, s = s >> 8, r[t + 6] = s, s = s >> 8, r[t + 5] = s, s = s >> 8, r[t + 4] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t + 3] = o, o = o >> 8, r[t + 2] = o, o = o >> 8, r[t + 1] = o, o = o >> 8, r[t] = o, t + 8;
  }
  __name(Jn, "Jn");
  a(Jn, "wrtBigUInt64BE");
  h.prototype.writeBigUInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }, "writeBigUInt64LE"));
  h.prototype.writeBigUInt64BE = we(a(function(e, t = 0) {
    return Jn(this, e, t, BigInt(0), BigInt(
      "0xffffffffffffffff"
    ));
  }, "writeBigUInt64BE"));
  h.prototype.writeIntLE = a(function(e, t, n, i2) {
    if (e = +e, t = t >>> 0, !i2) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = 0, o = 1, u = 0;
    for (this[t] = e & 255; ++s < n && (o *= 256); )
      e < 0 && u === 0 && this[t + s - 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntLE");
  h.prototype.writeIntBE = a(function(e, t, n, i2) {
    if (e = +e, t = t >>> 0, !i2) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = n - 1, o = 1, u = 0;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) e < 0 && u === 0 && this[t + s + 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntBE");
  h.prototype.writeInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
  }, "writeInt8");
  h.prototype.writeInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeInt16LE");
  h.prototype.writeInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeInt16BE");
  h.prototype.writeInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      2147483647,
      -2147483648
    ), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
  }, "writeInt32LE");
  h.prototype.writeInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      2147483647,
      -2147483648
    ), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeInt32BE");
  h.prototype.writeBigInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64LE"));
  h.prototype.writeBigInt64BE = we(
    a(function(e, t = 0) {
      return Jn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }, "writeBigInt64BE")
  );
  function Xn(r, e, t, n, i2, s) {
    if (t + n > r.length) throw new RangeError("Index out of range");
    if (t < 0) throw new RangeError("Index out of range");
  }
  __name(Xn, "Xn");
  a(Xn, "checkIEEE754");
  function ei(r, e, t, n, i2) {
    return e = +e, t = t >>> 0, i2 || Xn(r, e, t, 4, 34028234663852886e22, -34028234663852886e22), Pe.write(r, e, t, n, 23, 4), t + 4;
  }
  __name(ei, "ei");
  a(
    ei,
    "writeFloat"
  );
  h.prototype.writeFloatLE = a(function(e, t, n) {
    return ei(this, e, t, true, n);
  }, "writeFloatLE");
  h.prototype.writeFloatBE = a(function(e, t, n) {
    return ei(this, e, t, false, n);
  }, "writeFloatBE");
  function ti(r, e, t, n, i2) {
    return e = +e, t = t >>> 0, i2 || Xn(r, e, t, 8, 17976931348623157e292, -17976931348623157e292), Pe.write(
      r,
      e,
      t,
      n,
      52,
      8
    ), t + 8;
  }
  __name(ti, "ti");
  a(ti, "writeDouble");
  h.prototype.writeDoubleLE = a(function(e, t, n) {
    return ti(this, e, t, true, n);
  }, "writeDoubleLE");
  h.prototype.writeDoubleBE = a(function(e, t, n) {
    return ti(this, e, t, false, n);
  }, "writeDoubleBE");
  h.prototype.copy = a(function(e, t, n, i2) {
    if (!h.isBuffer(e)) throw new TypeError("argument should be a Buffer");
    if (n || (n = 0), !i2 && i2 !== 0 && (i2 = this.length), t >= e.length && (t = e.length), t || (t = 0), i2 > 0 && i2 < n && (i2 = n), i2 === n || e.length === 0 || this.length === 0) return 0;
    if (t < 0) throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
    if (i2 < 0) throw new RangeError("sourceEnd out of bounds");
    i2 > this.length && (i2 = this.length), e.length - t < i2 - n && (i2 = e.length - t + n);
    let s = i2 - n;
    return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i2) : Uint8Array.prototype.set.call(e, this.subarray(n, i2), t), s;
  }, "copy");
  h.prototype.fill = a(function(e, t, n, i2) {
    if (typeof e == "string") {
      if (typeof t == "string" ? (i2 = t, t = 0, n = this.length) : typeof n == "string" && (i2 = n, n = this.length), i2 !== void 0 && typeof i2 != "string") throw new TypeError("encoding must be a string");
      if (typeof i2 == "string" && !h.isEncoding(i2)) throw new TypeError(
        "Unknown encoding: " + i2
      );
      if (e.length === 1) {
        let o = e.charCodeAt(0);
        (i2 === "utf8" && o < 128 || i2 === "latin1") && (e = o);
      }
    } else typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
    if (t < 0 || this.length < t || this.length < n) throw new RangeError("Out of range index");
    if (n <= t) return this;
    t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
    let s;
    if (typeof e == "number") for (s = t; s < n; ++s) this[s] = e;
    else {
      let o = h.isBuffer(e) ? e : h.from(
        e,
        i2
      ), u = o.length;
      if (u === 0) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
      for (s = 0; s < n - t; ++s) this[s + t] = o[s % u];
    }
    return this;
  }, "fill");
  var Te = {};
  function Vt(r, e, t) {
    var n;
    Te[r] = (n = class extends t {
      static {
        __name(this, "n");
      }
      constructor() {
        super(), Object.defineProperty(this, "message", { value: e.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
      }
      get code() {
        return r;
      }
      set code(s) {
        Object.defineProperty(
          this,
          "code",
          { configurable: true, enumerable: true, value: s, writable: true }
        );
      }
      toString() {
        return `${this.name} [${r}]: ${this.message}`;
      }
    }, a(n, "NodeError"), n);
  }
  __name(Vt, "Vt");
  a(Vt, "E");
  Vt("ERR_BUFFER_OUT_OF_BOUNDS", function(r) {
    return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  Vt(
    "ERR_INVALID_ARG_TYPE",
    function(r, e) {
      return `The "${r}" argument must be of type number. Received type ${typeof e}`;
    },
    TypeError
  );
  Vt("ERR_OUT_OF_RANGE", function(r, e, t) {
    let n = `The value of "${r}" is out of range.`, i2 = t;
    return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i2 = $n(String(t)) : typeof t == "bigint" && (i2 = String(
      t
    ), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i2 = $n(i2)), i2 += "n"), n += ` It must be ${e}. Received ${i2}`, n;
  }, RangeError);
  function $n(r) {
    let e = "", t = r.length, n = r[0] === "-" ? 1 : 0;
    for (; t >= n + 4; t -= 3) e = `_${r.slice(t - 3, t)}${e}`;
    return `${r.slice(0, t)}${e}`;
  }
  __name($n, "$n");
  a($n, "addNumericalSeparator");
  function Xo(r, e, t) {
    Re(e, "offset"), (r[e] === void 0 || r[e + t] === void 0) && je(e, r.length - (t + 1));
  }
  __name(Xo, "Xo");
  a(Xo, "checkBounds");
  function ri(r, e, t, n, i2, s) {
    if (r > t || r < e) {
      let o = typeof e == "bigint" ? "n" : "", u;
      throw s > 3 ? e === 0 || e === BigInt(0) ? u = `>= 0${o} and < 2${o} ** ${(s + 1) * 8}${o}` : u = `>= -(2${o} ** ${(s + 1) * 8 - 1}${o}) and < 2 ** ${(s + 1) * 8 - 1}${o}` : u = `>= ${e}${o} and <= ${t}${o}`, new Te.ERR_OUT_OF_RANGE("value", u, r);
    }
    Xo(n, i2, s);
  }
  __name(ri, "ri");
  a(ri, "checkIntBI");
  function Re(r, e) {
    if (typeof r != "number") throw new Te.ERR_INVALID_ARG_TYPE(e, "number", r);
  }
  __name(Re, "Re");
  a(Re, "validateNumber");
  function je(r, e, t) {
    throw Math.floor(r) !== r ? (Re(r, t), new Te.ERR_OUT_OF_RANGE(t || "offset", "an integer", r)) : e < 0 ? new Te.ERR_BUFFER_OUT_OF_BOUNDS() : new Te.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${e}`, r);
  }
  __name(je, "je");
  a(je, "boundsError");
  var ea = /[^+/0-9A-Za-z-_]/g;
  function ta(r) {
    if (r = r.split("=")[0], r = r.trim().replace(ea, ""), r.length < 2) return "";
    for (; r.length % 4 !== 0; ) r = r + "=";
    return r;
  }
  __name(ta, "ta");
  a(ta, "base64clean");
  function Ht(r, e) {
    e = e || 1 / 0;
    let t, n = r.length, i2 = null, s = [];
    for (let o = 0; o < n; ++o) {
      if (t = r.charCodeAt(o), t > 55295 && t < 57344) {
        if (!i2) {
          if (t > 56319) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          } else if (o + 1 === n) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          }
          i2 = t;
          continue;
        }
        if (t < 56320) {
          (e -= 3) > -1 && s.push(239, 191, 189), i2 = t;
          continue;
        }
        t = (i2 - 55296 << 10 | t - 56320) + 65536;
      } else i2 && (e -= 3) > -1 && s.push(239, 191, 189);
      if (i2 = null, t < 128) {
        if ((e -= 1) < 0) break;
        s.push(t);
      } else if (t < 2048) {
        if ((e -= 2) < 0) break;
        s.push(t >> 6 | 192, t & 63 | 128);
      } else if (t < 65536) {
        if ((e -= 3) < 0) break;
        s.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
      } else if (t < 1114112) {
        if ((e -= 4) < 0) break;
        s.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
      } else throw new Error("Invalid code point");
    }
    return s;
  }
  __name(Ht, "Ht");
  a(Ht, "utf8ToBytes");
  function ra(r) {
    let e = [];
    for (let t = 0; t < r.length; ++t) e.push(r.charCodeAt(t) & 255);
    return e;
  }
  __name(ra, "ra");
  a(
    ra,
    "asciiToBytes"
  );
  function na(r, e) {
    let t, n, i2, s = [];
    for (let o = 0; o < r.length && !((e -= 2) < 0); ++o) t = r.charCodeAt(
      o
    ), n = t >> 8, i2 = t % 256, s.push(i2), s.push(n);
    return s;
  }
  __name(na, "na");
  a(na, "utf16leToBytes");
  function ni(r) {
    return Nt.toByteArray(
      ta(r)
    );
  }
  __name(ni, "ni");
  a(ni, "base64ToBytes");
  function ht(r, e, t, n) {
    let i2;
    for (i2 = 0; i2 < n && !(i2 + t >= e.length || i2 >= r.length); ++i2)
      e[i2 + t] = r[i2];
    return i2;
  }
  __name(ht, "ht");
  a(ht, "blitBuffer");
  function ue(r, e) {
    return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
  }
  __name(ue, "ue");
  a(ue, "isInstance");
  function zt(r) {
    return r !== r;
  }
  __name(zt, "zt");
  a(zt, "numberIsNaN");
  var ia = (function() {
    let r = "0123456789abcdef", e = new Array(256);
    for (let t = 0; t < 16; ++t) {
      let n = t * 16;
      for (let i2 = 0; i2 < 16; ++i2) e[n + i2] = r[t] + r[i2];
    }
    return e;
  })();
  function we(r) {
    return typeof BigInt > "u" ? sa : r;
  }
  __name(we, "we");
  a(we, "defineBigIntMethod");
  function sa() {
    throw new Error("BigInt not supported");
  }
  __name(sa, "sa");
  a(sa, "BufferBigIntNotDefined");
});
var b;
var v;
var x;
var d;
var m;
var p = G(() => {
  "use strict";
  b = globalThis, v = globalThis.setImmediate ?? ((r) => setTimeout(r, 0)), x = globalThis.clearImmediate ?? ((r) => clearTimeout(r)), d = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : ii().Buffer, m = globalThis.process ?? {};
  m.env ?? (m.env = {});
  try {
    m.nextTick(() => {
    });
  } catch {
    let e = Promise.resolve();
    m.nextTick = e.then.bind(e);
  }
});
var ge = T((Bl, Kt) => {
  "use strict";
  p();
  var Le = typeof Reflect == "object" ? Reflect : null, si = Le && typeof Le.apply == "function" ? Le.apply : a(function(e, t, n) {
    return Function.prototype.apply.call(e, t, n);
  }, "ReflectApply"), pt;
  Le && typeof Le.ownKeys == "function" ? pt = Le.ownKeys : Object.getOwnPropertySymbols ? pt = a(function(e) {
    return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
  }, "ReflectOwnKeys") : pt = a(function(e) {
    return Object.getOwnPropertyNames(e);
  }, "ReflectOwnKeys");
  function oa(r) {
    console && console.warn && console.warn(r);
  }
  __name(oa, "oa");
  a(
    oa,
    "ProcessEmitWarning"
  );
  var ai = Number.isNaN || a(function(e) {
    return e !== e;
  }, "NumberIsNaN");
  function R() {
    R.init.call(this);
  }
  __name(R, "R");
  a(R, "EventEmitter");
  Kt.exports = R;
  Kt.exports.once = la;
  R.EventEmitter = R;
  R.prototype._events = void 0;
  R.prototype._eventsCount = 0;
  R.prototype._maxListeners = void 0;
  var oi = 10;
  function dt(r) {
    if (typeof r != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
  }
  __name(dt, "dt");
  a(dt, "checkListener");
  Object.defineProperty(R, "defaultMaxListeners", { enumerable: true, get: a(function() {
    return oi;
  }, "get"), set: a(
    function(r) {
      if (typeof r != "number" || r < 0 || ai(r)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
      oi = r;
    },
    "set"
  ) });
  R.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  };
  R.prototype.setMaxListeners = a(function(e) {
    if (typeof e != "number" || e < 0 || ai(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
    return this._maxListeners = e, this;
  }, "setMaxListeners");
  function ui(r) {
    return r._maxListeners === void 0 ? R.defaultMaxListeners : r._maxListeners;
  }
  __name(ui, "ui");
  a(ui, "_getMaxListeners");
  R.prototype.getMaxListeners = a(function() {
    return ui(this);
  }, "getMaxListeners");
  R.prototype.emit = a(function(e) {
    for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
    var i2 = e === "error", s = this._events;
    if (s !== void 0) i2 = i2 && s.error === void 0;
    else if (!i2) return false;
    if (i2) {
      var o;
      if (t.length > 0 && (o = t[0]), o instanceof Error) throw o;
      var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
      throw u.context = o, u;
    }
    var c = s[e];
    if (c === void 0) return false;
    if (typeof c == "function") si(c, this, t);
    else for (var l = c.length, f = pi(c, l), n = 0; n < l; ++n) si(f[n], this, t);
    return true;
  }, "emit");
  function ci(r, e, t, n) {
    var i2, s, o;
    if (dt(
      t
    ), s = r._events, s === void 0 ? (s = r._events = /* @__PURE__ */ Object.create(null), r._eventsCount = 0) : (s.newListener !== void 0 && (r.emit("newListener", e, t.listener ? t.listener : t), s = r._events), o = s[e]), o === void 0) o = s[e] = t, ++r._eventsCount;
    else if (typeof o == "function" ? o = s[e] = n ? [t, o] : [o, t] : n ? o.unshift(t) : o.push(t), i2 = ui(r), i2 > 0 && o.length > i2 && !o.warned) {
      o.warned = true;
      var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, oa(u);
    }
    return r;
  }
  __name(ci, "ci");
  a(ci, "_addListener");
  R.prototype.addListener = a(function(e, t) {
    return ci(this, e, t, false);
  }, "addListener");
  R.prototype.on = R.prototype.addListener;
  R.prototype.prependListener = a(function(e, t) {
    return ci(this, e, t, true);
  }, "prependListener");
  function aa() {
    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  __name(aa, "aa");
  a(aa, "onceWrapper");
  function li(r, e, t) {
    var n = {
      fired: false,
      wrapFn: void 0,
      target: r,
      type: e,
      listener: t
    }, i2 = aa.bind(n);
    return i2.listener = t, n.wrapFn = i2, i2;
  }
  __name(li, "li");
  a(li, "_onceWrap");
  R.prototype.once = a(function(e, t) {
    return dt(t), this.on(e, li(this, e, t)), this;
  }, "once");
  R.prototype.prependOnceListener = a(function(e, t) {
    return dt(t), this.prependListener(e, li(this, e, t)), this;
  }, "prependOnceListener");
  R.prototype.removeListener = a(function(e, t) {
    var n, i2, s, o, u;
    if (dt(t), i2 = this._events, i2 === void 0) return this;
    if (n = i2[e], n === void 0) return this;
    if (n === t || n.listener === t) --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete i2[e], i2.removeListener && this.emit("removeListener", e, n.listener || t));
    else if (typeof n != "function") {
      for (s = -1, o = n.length - 1; o >= 0; o--) if (n[o] === t || n[o].listener === t) {
        u = n[o].listener, s = o;
        break;
      }
      if (s < 0) return this;
      s === 0 ? n.shift() : ua(n, s), n.length === 1 && (i2[e] = n[0]), i2.removeListener !== void 0 && this.emit("removeListener", e, u || t);
    }
    return this;
  }, "removeListener");
  R.prototype.off = R.prototype.removeListener;
  R.prototype.removeAllListeners = a(function(e) {
    var t, n, i2;
    if (n = this._events, n === void 0) return this;
    if (n.removeListener === void 0) return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete n[e]), this;
    if (arguments.length === 0) {
      var s = Object.keys(n), o;
      for (i2 = 0; i2 < s.length; ++i2) o = s[i2], o !== "removeListener" && this.removeAllListeners(
        o
      );
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (t = n[e], typeof t == "function") this.removeListener(e, t);
    else if (t !== void 0) for (i2 = t.length - 1; i2 >= 0; i2--) this.removeListener(e, t[i2]);
    return this;
  }, "removeAllListeners");
  function fi(r, e, t) {
    var n = r._events;
    if (n === void 0) return [];
    var i2 = n[e];
    return i2 === void 0 ? [] : typeof i2 == "function" ? t ? [i2.listener || i2] : [i2] : t ? ca(i2) : pi(i2, i2.length);
  }
  __name(fi, "fi");
  a(fi, "_listeners");
  R.prototype.listeners = a(function(e) {
    return fi(this, e, true);
  }, "listeners");
  R.prototype.rawListeners = a(function(e) {
    return fi(this, e, false);
  }, "rawListeners");
  R.listenerCount = function(r, e) {
    return typeof r.listenerCount == "function" ? r.listenerCount(e) : hi.call(r, e);
  };
  R.prototype.listenerCount = hi;
  function hi(r) {
    var e = this._events;
    if (e !== void 0) {
      var t = e[r];
      if (typeof t == "function")
        return 1;
      if (t !== void 0) return t.length;
    }
    return 0;
  }
  __name(hi, "hi");
  a(hi, "listenerCount");
  R.prototype.eventNames = a(function() {
    return this._eventsCount > 0 ? pt(this._events) : [];
  }, "eventNames");
  function pi(r, e) {
    for (var t = new Array(e), n = 0; n < e; ++n) t[n] = r[n];
    return t;
  }
  __name(pi, "pi");
  a(pi, "arrayClone");
  function ua(r, e) {
    for (; e + 1 < r.length; e++) r[e] = r[e + 1];
    r.pop();
  }
  __name(ua, "ua");
  a(ua, "spliceOne");
  function ca(r) {
    for (var e = new Array(r.length), t = 0; t < e.length; ++t) e[t] = r[t].listener || r[t];
    return e;
  }
  __name(ca, "ca");
  a(ca, "unwrapListeners");
  function la(r, e) {
    return new Promise(function(t, n) {
      function i2(o) {
        r.removeListener(e, s), n(o);
      }
      __name(i2, "i");
      a(i2, "errorListener");
      function s() {
        typeof r.removeListener == "function" && r.removeListener("error", i2), t([].slice.call(arguments));
      }
      __name(s, "s");
      a(s, "resolver"), di(r, e, s, { once: true }), e !== "error" && fa(r, i2, { once: true });
    });
  }
  __name(la, "la");
  a(la, "once");
  function fa(r, e, t) {
    typeof r.on == "function" && di(r, "error", e, t);
  }
  __name(fa, "fa");
  a(
    fa,
    "addErrorHandlerIfEventEmitter"
  );
  function di(r, e, t, n) {
    if (typeof r.on == "function") n.once ? r.once(e, t) : r.on(e, t);
    else if (typeof r.addEventListener == "function") r.addEventListener(e, a(/* @__PURE__ */ __name(function i2(s) {
      n.once && r.removeEventListener(e, i2), t(s);
    }, "i"), "wrapListener"));
    else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
  }
  __name(di, "di");
  a(di, "eventTargetAgnosticAddListener");
});
var wi = {};
ie(wi, { Socket: /* @__PURE__ */ __name(() => ce, "Socket"), isIP: /* @__PURE__ */ __name(() => ha, "isIP") });
function ha(r) {
  return 0;
}
__name(ha, "ha");
var mi;
var yi;
var S;
var ce;
var Fe = G(() => {
  "use strict";
  p();
  mi = Se(ge(), 1);
  a(ha, "isIP");
  yi = /^[^.]+\./, S = class S2 extends mi.EventEmitter {
    static {
      __name(this, "S");
    }
    constructor() {
      super(...arguments);
      E(this, "opts", {});
      E(this, "connecting", false);
      E(this, "pending", true);
      E(
        this,
        "writable",
        true
      );
      E(this, "encrypted", false);
      E(this, "authorized", false);
      E(this, "destroyed", false);
      E(this, "ws", null);
      E(this, "writeBuffer");
      E(this, "tlsState", 0);
      E(this, "tlsRead");
      E(this, "tlsWrite");
    }
    static get poolQueryViaFetch() {
      return S2.opts.poolQueryViaFetch ?? S2.defaults.poolQueryViaFetch;
    }
    static set poolQueryViaFetch(t) {
      S2.opts.poolQueryViaFetch = t;
    }
    static get fetchEndpoint() {
      return S2.opts.fetchEndpoint ?? S2.defaults.fetchEndpoint;
    }
    static set fetchEndpoint(t) {
      S2.opts.fetchEndpoint = t;
    }
    static get fetchConnectionCache() {
      return true;
    }
    static set fetchConnectionCache(t) {
      console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
    }
    static get fetchFunction() {
      return S2.opts.fetchFunction ?? S2.defaults.fetchFunction;
    }
    static set fetchFunction(t) {
      S2.opts.fetchFunction = t;
    }
    static get webSocketConstructor() {
      return S2.opts.webSocketConstructor ?? S2.defaults.webSocketConstructor;
    }
    static set webSocketConstructor(t) {
      S2.opts.webSocketConstructor = t;
    }
    get webSocketConstructor() {
      return this.opts.webSocketConstructor ?? S2.webSocketConstructor;
    }
    set webSocketConstructor(t) {
      this.opts.webSocketConstructor = t;
    }
    static get wsProxy() {
      return S2.opts.wsProxy ?? S2.defaults.wsProxy;
    }
    static set wsProxy(t) {
      S2.opts.wsProxy = t;
    }
    get wsProxy() {
      return this.opts.wsProxy ?? S2.wsProxy;
    }
    set wsProxy(t) {
      this.opts.wsProxy = t;
    }
    static get coalesceWrites() {
      return S2.opts.coalesceWrites ?? S2.defaults.coalesceWrites;
    }
    static set coalesceWrites(t) {
      S2.opts.coalesceWrites = t;
    }
    get coalesceWrites() {
      return this.opts.coalesceWrites ?? S2.coalesceWrites;
    }
    set coalesceWrites(t) {
      this.opts.coalesceWrites = t;
    }
    static get useSecureWebSocket() {
      return S2.opts.useSecureWebSocket ?? S2.defaults.useSecureWebSocket;
    }
    static set useSecureWebSocket(t) {
      S2.opts.useSecureWebSocket = t;
    }
    get useSecureWebSocket() {
      return this.opts.useSecureWebSocket ?? S2.useSecureWebSocket;
    }
    set useSecureWebSocket(t) {
      this.opts.useSecureWebSocket = t;
    }
    static get forceDisablePgSSL() {
      return S2.opts.forceDisablePgSSL ?? S2.defaults.forceDisablePgSSL;
    }
    static set forceDisablePgSSL(t) {
      S2.opts.forceDisablePgSSL = t;
    }
    get forceDisablePgSSL() {
      return this.opts.forceDisablePgSSL ?? S2.forceDisablePgSSL;
    }
    set forceDisablePgSSL(t) {
      this.opts.forceDisablePgSSL = t;
    }
    static get disableSNI() {
      return S2.opts.disableSNI ?? S2.defaults.disableSNI;
    }
    static set disableSNI(t) {
      S2.opts.disableSNI = t;
    }
    get disableSNI() {
      return this.opts.disableSNI ?? S2.disableSNI;
    }
    set disableSNI(t) {
      this.opts.disableSNI = t;
    }
    static get disableWarningInBrowsers() {
      return S2.opts.disableWarningInBrowsers ?? S2.defaults.disableWarningInBrowsers;
    }
    static set disableWarningInBrowsers(t) {
      S2.opts.disableWarningInBrowsers = t;
    }
    get disableWarningInBrowsers() {
      return this.opts.disableWarningInBrowsers ?? S2.disableWarningInBrowsers;
    }
    set disableWarningInBrowsers(t) {
      this.opts.disableWarningInBrowsers = t;
    }
    static get pipelineConnect() {
      return S2.opts.pipelineConnect ?? S2.defaults.pipelineConnect;
    }
    static set pipelineConnect(t) {
      S2.opts.pipelineConnect = t;
    }
    get pipelineConnect() {
      return this.opts.pipelineConnect ?? S2.pipelineConnect;
    }
    set pipelineConnect(t) {
      this.opts.pipelineConnect = t;
    }
    static get subtls() {
      return S2.opts.subtls ?? S2.defaults.subtls;
    }
    static set subtls(t) {
      S2.opts.subtls = t;
    }
    get subtls() {
      return this.opts.subtls ?? S2.subtls;
    }
    set subtls(t) {
      this.opts.subtls = t;
    }
    static get pipelineTLS() {
      return S2.opts.pipelineTLS ?? S2.defaults.pipelineTLS;
    }
    static set pipelineTLS(t) {
      S2.opts.pipelineTLS = t;
    }
    get pipelineTLS() {
      return this.opts.pipelineTLS ?? S2.pipelineTLS;
    }
    set pipelineTLS(t) {
      this.opts.pipelineTLS = t;
    }
    static get rootCerts() {
      return S2.opts.rootCerts ?? S2.defaults.rootCerts;
    }
    static set rootCerts(t) {
      S2.opts.rootCerts = t;
    }
    get rootCerts() {
      return this.opts.rootCerts ?? S2.rootCerts;
    }
    set rootCerts(t) {
      this.opts.rootCerts = t;
    }
    wsProxyAddrForHost(t, n) {
      let i2 = this.wsProxy;
      if (i2 === void 0) throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
      return typeof i2 == "function" ? i2(t, n) : `${i2}?address=${t}:${n}`;
    }
    setNoDelay() {
      return this;
    }
    setKeepAlive() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    connect(t, n, i2) {
      this.connecting = true, i2 && this.once("connect", i2);
      let s = a(() => {
        this.connecting = false, this.pending = false, this.emit("connect"), this.emit("ready");
      }, "handleWebSocketOpen"), o = a((c, l = false) => {
        c.binaryType = "arraybuffer", c.addEventListener("error", (f) => {
          this.emit("error", f), this.emit("close");
        }), c.addEventListener("message", (f) => {
          if (this.tlsState === 0) {
            let y = d.from(f.data);
            this.emit("data", y);
          }
        }), c.addEventListener("close", () => {
          this.emit("close");
        }), l ? s() : c.addEventListener(
          "open",
          s
        );
      }, "configureWebSocket"), u;
      try {
        u = this.wsProxyAddrForHost(n, typeof t == "string" ? parseInt(t, 10) : t);
      } catch (c) {
        this.emit("error", c), this.emit("close");
        return;
      }
      try {
        let l = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u;
        if (this.webSocketConstructor !== void 0) this.ws = new this.webSocketConstructor(l), o(this.ws);
        else try {
          this.ws = new WebSocket(l), o(this.ws);
        } catch {
          this.ws = new __unstable_WebSocket(l), o(this.ws);
        }
      } catch (c) {
        let f = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u;
        fetch(f, { headers: { Upgrade: "websocket" } }).then(
          (y) => {
            if (this.ws = y.webSocket, this.ws == null) throw c;
            this.ws.accept(), o(this.ws, true);
          }
        ).catch((y) => {
          this.emit(
            "error",
            new Error(`All attempts to open a WebSocket to connect to the database failed. Please refer to https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined. Details: ${y}`)
          ), this.emit("close");
        });
      }
    }
    async startTls(t) {
      if (this.subtls === void 0) throw new Error(
        "For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information."
      );
      this.tlsState = 1;
      let n = await this.subtls.TrustedCert.databaseFromPEM(this.rootCerts), i2 = new this.subtls.WebSocketReadQueue(this.ws), s = i2.read.bind(i2), o = this.rawWrite.bind(this), { read: u, write: c } = await this.subtls.startTls(t, n, s, o, { useSNI: !this.disableSNI, expectPreData: this.pipelineTLS ? new Uint8Array([83]) : void 0 });
      this.tlsRead = u, this.tlsWrite = c, this.tlsState = 2, this.encrypted = true, this.authorized = true, this.emit("secureConnection", this), this.tlsReadLoop();
    }
    async tlsReadLoop() {
      for (; ; ) {
        let t = await this.tlsRead();
        if (t === void 0) break;
        {
          let n = d.from(t);
          this.emit("data", n);
        }
      }
    }
    rawWrite(t) {
      if (!this.coalesceWrites) {
        this.ws && this.ws.send(t);
        return;
      }
      if (this.writeBuffer === void 0) this.writeBuffer = t, setTimeout(() => {
        this.ws && this.ws.send(this.writeBuffer), this.writeBuffer = void 0;
      }, 0);
      else {
        let n = new Uint8Array(
          this.writeBuffer.length + t.length
        );
        n.set(this.writeBuffer), n.set(t, this.writeBuffer.length), this.writeBuffer = n;
      }
    }
    write(t, n = "utf8", i2 = (s) => {
    }) {
      return t.length === 0 ? (i2(), true) : (typeof t == "string" && (t = d.from(t, n)), this.tlsState === 0 ? (this.rawWrite(t), i2()) : this.tlsState === 1 ? this.once("secureConnection", () => {
        this.write(
          t,
          n,
          i2
        );
      }) : (this.tlsWrite(t), i2()), true);
    }
    end(t = d.alloc(0), n = "utf8", i2 = () => {
    }) {
      return this.write(t, n, () => {
        this.ws.close(), i2();
      }), this;
    }
    destroy() {
      return this.destroyed = true, this.end();
    }
  };
  a(S, "Socket"), E(S, "defaults", {
    poolQueryViaFetch: false,
    fetchEndpoint: a((t, n, i2) => {
      let s;
      return i2?.jwtAuth ? s = t.replace(yi, "apiauth.") : s = t.replace(yi, "api."), "https://" + s + "/sql";
    }, "fetchEndpoint"),
    fetchConnectionCache: true,
    fetchFunction: void 0,
    webSocketConstructor: void 0,
    wsProxy: a((t) => t + "/v2", "wsProxy"),
    useSecureWebSocket: true,
    forceDisablePgSSL: true,
    coalesceWrites: true,
    pipelineConnect: "password",
    subtls: void 0,
    rootCerts: "",
    pipelineTLS: false,
    disableSNI: false,
    disableWarningInBrowsers: false
  }), E(S, "opts", {});
  ce = S;
});
var gi = {};
ie(gi, { parse: /* @__PURE__ */ __name(() => Yt, "parse") });
function Yt(r, e = false) {
  let { protocol: t } = new URL(r), n = "http:" + r.substring(
    t.length
  ), { username: i2, password: s, host: o, hostname: u, port: c, pathname: l, search: f, searchParams: y, hash: g } = new URL(
    n
  );
  s = decodeURIComponent(s), i2 = decodeURIComponent(i2), l = decodeURIComponent(l);
  let A = i2 + ":" + s, C = e ? Object.fromEntries(y.entries()) : f;
  return {
    href: r,
    protocol: t,
    auth: A,
    username: i2,
    password: s,
    host: o,
    hostname: u,
    port: c,
    pathname: l,
    search: f,
    query: C,
    hash: g
  };
}
__name(Yt, "Yt");
var Zt = G(() => {
  "use strict";
  p();
  a(Yt, "parse");
});
var tr = T((Ai) => {
  "use strict";
  p();
  Ai.parse = function(r, e) {
    return new er(r, e).parse();
  };
  var vt = class vt2 {
    static {
      __name(this, "vt");
    }
    constructor(e, t) {
      this.source = e, this.transform = t || Ca, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var e = this.source[this.position++];
      return e === "\\" ? { value: this.source[this.position++], escaped: true } : { value: e, escaped: false };
    }
    record(e) {
      this.recorded.push(
        e
      );
    }
    newEntry(e) {
      var t;
      (this.recorded.length > 0 || e) && (t = this.recorded.join(""), t === "NULL" && !e && (t = null), t !== null && (t = this.transform(t)), this.entries.push(t), this.recorded = []);
    }
    consumeDimensions() {
      if (this.source[0] === "[") for (; !this.isEof(); ) {
        var e = this.nextCharacter();
        if (e.value === "=") break;
      }
    }
    parse(e) {
      var t, n, i2;
      for (this.consumeDimensions(); !this.isEof(); ) if (t = this.nextCharacter(), t.value === "{" && !i2) this.dimension++, this.dimension > 1 && (n = new vt2(this.source.substr(this.position - 1), this.transform), this.entries.push(n.parse(
        true
      )), this.position += n.position - 2);
      else if (t.value === "}" && !i2) {
        if (this.dimension--, !this.dimension && (this.newEntry(), e)) return this.entries;
      } else t.value === '"' && !t.escaped ? (i2 && this.newEntry(true), i2 = !i2) : t.value === "," && !i2 ? this.newEntry() : this.record(t.value);
      if (this.dimension !== 0) throw new Error("array dimension not balanced");
      return this.entries;
    }
  };
  a(vt, "ArrayParser");
  var er = vt;
  function Ca(r) {
    return r;
  }
  __name(Ca, "Ca");
  a(Ca, "identity");
});
var rr = T((Zl, Ci) => {
  p();
  var _a2 = tr();
  Ci.exports = { create: a(function(r, e) {
    return { parse: a(function() {
      return _a2.parse(r, e);
    }, "parse") };
  }, "create") };
});
var Ti = T((ef, Ii) => {
  "use strict";
  p();
  var Ia = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, Ta = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, Pa = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, Ra = /^-?infinity$/;
  Ii.exports = a(function(e) {
    if (Ra.test(e)) return Number(e.replace("i", "I"));
    var t = Ia.exec(e);
    if (!t) return Ba(
      e
    ) || null;
    var n = !!t[8], i2 = parseInt(t[1], 10);
    n && (i2 = _i(i2));
    var s = parseInt(t[2], 10) - 1, o = t[3], u = parseInt(
      t[4],
      10
    ), c = parseInt(t[5], 10), l = parseInt(t[6], 10), f = t[7];
    f = f ? 1e3 * parseFloat(f) : 0;
    var y, g = La(e);
    return g != null ? (y = new Date(Date.UTC(i2, s, o, u, c, l, f)), nr(i2) && y.setUTCFullYear(i2), g !== 0 && y.setTime(y.getTime() - g)) : (y = new Date(i2, s, o, u, c, l, f), nr(i2) && y.setFullYear(i2)), y;
  }, "parseDate");
  function Ba(r) {
    var e = Ta.exec(r);
    if (e) {
      var t = parseInt(e[1], 10), n = !!e[4];
      n && (t = _i(t));
      var i2 = parseInt(e[2], 10) - 1, s = e[3], o = new Date(t, i2, s);
      return nr(
        t
      ) && o.setFullYear(t), o;
    }
  }
  __name(Ba, "Ba");
  a(Ba, "getDate");
  function La(r) {
    if (r.endsWith("+00")) return 0;
    var e = Pa.exec(r.split(" ")[1]);
    if (e) {
      var t = e[1];
      if (t === "Z") return 0;
      var n = t === "-" ? -1 : 1, i2 = parseInt(e[2], 10) * 3600 + parseInt(
        e[3] || 0,
        10
      ) * 60 + parseInt(e[4] || 0, 10);
      return i2 * n * 1e3;
    }
  }
  __name(La, "La");
  a(La, "timeZoneOffset");
  function _i(r) {
    return -(r - 1);
  }
  __name(_i, "_i");
  a(_i, "bcYearToNegativeYear");
  function nr(r) {
    return r >= 0 && r < 100;
  }
  __name(nr, "nr");
  a(nr, "is0To99");
});
var Ri = T((nf, Pi) => {
  p();
  Pi.exports = ka;
  var Fa = Object.prototype.hasOwnProperty;
  function ka(r) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t) Fa.call(t, n) && (r[n] = t[n]);
    }
    return r;
  }
  __name(ka, "ka");
  a(ka, "extend");
});
var Fi = T((af, Li) => {
  "use strict";
  p();
  var Ma = Ri();
  Li.exports = ke;
  function ke(r) {
    if (!(this instanceof ke))
      return new ke(r);
    Ma(this, Va(r));
  }
  __name(ke, "ke");
  a(ke, "PostgresInterval");
  var Ua = [
    "seconds",
    "minutes",
    "hours",
    "days",
    "months",
    "years"
  ];
  ke.prototype.toPostgres = function() {
    var r = Ua.filter(this.hasOwnProperty, this);
    return this.milliseconds && r.indexOf("seconds") < 0 && r.push("seconds"), r.length === 0 ? "0" : r.map(function(e) {
      var t = this[e] || 0;
      return e === "seconds" && this.milliseconds && (t = (t + this.milliseconds / 1e3).toFixed(6).replace(
        /\.?0+$/,
        ""
      )), t + " " + e;
    }, this).join(" ");
  };
  var Da = { years: "Y", months: "M", days: "D", hours: "H", minutes: "M", seconds: "S" }, Oa = ["years", "months", "days"], qa = ["hours", "minutes", "seconds"];
  ke.prototype.toISOString = ke.prototype.toISO = function() {
    var r = Oa.map(t, this).join(""), e = qa.map(t, this).join("");
    return "P" + r + "T" + e;
    function t(n) {
      var i2 = this[n] || 0;
      return n === "seconds" && this.milliseconds && (i2 = (i2 + this.milliseconds / 1e3).toFixed(6).replace(
        /0+$/,
        ""
      )), i2 + Da[n];
    }
    __name(t, "t");
  };
  var ir = "([+-]?\\d+)", Qa = ir + "\\s+years?", Na = ir + "\\s+mons?", Wa = ir + "\\s+days?", ja = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", Ha = new RegExp([Qa, Na, Wa, ja].map(function(r) {
    return "(" + r + ")?";
  }).join("\\s*")), Bi = { years: 2, months: 4, days: 6, hours: 9, minutes: 10, seconds: 11, milliseconds: 12 }, $a = ["hours", "minutes", "seconds", "milliseconds"];
  function Ga(r) {
    var e = r + "000000".slice(r.length);
    return parseInt(
      e,
      10
    ) / 1e3;
  }
  __name(Ga, "Ga");
  a(Ga, "parseMilliseconds");
  function Va(r) {
    if (!r) return {};
    var e = Ha.exec(r), t = e[8] === "-";
    return Object.keys(Bi).reduce(function(n, i2) {
      var s = Bi[i2], o = e[s];
      return !o || (o = i2 === "milliseconds" ? Ga(o) : parseInt(o, 10), !o) || (t && ~$a.indexOf(i2) && (o *= -1), n[i2] = o), n;
    }, {});
  }
  __name(Va, "Va");
  a(Va, "parse");
});
var Mi = T((lf, ki) => {
  "use strict";
  p();
  ki.exports = a(function(e) {
    if (/^\\x/.test(e)) return new d(e.substr(
      2
    ), "hex");
    for (var t = "", n = 0; n < e.length; ) if (e[n] !== "\\") t += e[n], ++n;
    else if (/[0-7]{3}/.test(e.substr(n + 1, 3))) t += String.fromCharCode(parseInt(e.substr(n + 1, 3), 8)), n += 4;
    else {
      for (var i2 = 1; n + i2 < e.length && e[n + i2] === "\\"; ) i2++;
      for (var s = 0; s < Math.floor(i2 / 2); ++s) t += "\\";
      n += Math.floor(i2 / 2) * 2;
    }
    return new d(t, "binary");
  }, "parseBytea");
});
var Wi = T((pf, Ni) => {
  p();
  var Ve = tr(), ze = rr(), xt = Ti(), Di = Fi(), Oi = Mi();
  function St(r) {
    return a(function(t) {
      return t === null ? t : r(t);
    }, "nullAllowed");
  }
  __name(St, "St");
  a(St, "allowNull");
  function qi(r) {
    return r === null ? r : r === "TRUE" || r === "t" || r === "true" || r === "y" || r === "yes" || r === "on" || r === "1";
  }
  __name(qi, "qi");
  a(qi, "parseBool");
  function za(r) {
    return r ? Ve.parse(r, qi) : null;
  }
  __name(za, "za");
  a(za, "parseBoolArray");
  function Ka(r) {
    return parseInt(r, 10);
  }
  __name(Ka, "Ka");
  a(Ka, "parseBaseTenInt");
  function sr(r) {
    return r ? Ve.parse(r, St(Ka)) : null;
  }
  __name(sr, "sr");
  a(sr, "parseIntegerArray");
  function Ya(r) {
    return r ? Ve.parse(r, St(function(e) {
      return Qi(e).trim();
    })) : null;
  }
  __name(Ya, "Ya");
  a(Ya, "parseBigIntegerArray");
  var Za = a(function(r) {
    if (!r) return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = cr(t)), t;
    });
    return e.parse();
  }, "parsePointArray"), or = a(function(r) {
    if (!r) return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = parseFloat(t)), t;
    });
    return e.parse();
  }, "parseFloatArray"), re = a(function(r) {
    if (!r) return null;
    var e = ze.create(r);
    return e.parse();
  }, "parseStringArray"), ar = a(function(r) {
    if (!r) return null;
    var e = ze.create(
      r,
      function(t) {
        return t !== null && (t = xt(t)), t;
      }
    );
    return e.parse();
  }, "parseDateArray"), Ja = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = Di(t)), t;
    });
    return e.parse();
  }, "parseIntervalArray"), Xa = a(function(r) {
    return r ? Ve.parse(r, St(Oi)) : null;
  }, "parseByteAArray"), ur = a(function(r) {
    return parseInt(r, 10);
  }, "parseInteger"), Qi = a(function(r) {
    var e = String(r);
    return /^\d+$/.test(e) ? e : r;
  }, "parseBigInteger"), Ui = a(function(r) {
    return r ? Ve.parse(r, St(JSON.parse)) : null;
  }, "parseJsonArray"), cr = a(
    function(r) {
      return r[0] !== "(" ? null : (r = r.substring(1, r.length - 1).split(","), { x: parseFloat(r[0]), y: parseFloat(
        r[1]
      ) });
    },
    "parsePoint"
  ), eu = a(function(r) {
    if (r[0] !== "<" && r[1] !== "(") return null;
    for (var e = "(", t = "", n = false, i2 = 2; i2 < r.length - 1; i2++) {
      if (n || (e += r[i2]), r[i2] === ")") {
        n = true;
        continue;
      } else if (!n) continue;
      r[i2] !== "," && (t += r[i2]);
    }
    var s = cr(e);
    return s.radius = parseFloat(t), s;
  }, "parseCircle"), tu = a(function(r) {
    r(20, Qi), r(21, ur), r(23, ur), r(26, ur), r(700, parseFloat), r(701, parseFloat), r(16, qi), r(1082, xt), r(1114, xt), r(1184, xt), r(
      600,
      cr
    ), r(651, re), r(718, eu), r(1e3, za), r(1001, Xa), r(1005, sr), r(1007, sr), r(1028, sr), r(1016, Ya), r(1017, Za), r(1021, or), r(1022, or), r(1231, or), r(1014, re), r(1015, re), r(1008, re), r(1009, re), r(1040, re), r(1041, re), r(
      1115,
      ar
    ), r(1182, ar), r(1185, ar), r(1186, Di), r(1187, Ja), r(17, Oi), r(114, JSON.parse.bind(JSON)), r(3802, JSON.parse.bind(JSON)), r(199, Ui), r(3807, Ui), r(3907, re), r(2951, re), r(791, re), r(1183, re), r(1270, re);
  }, "init");
  Ni.exports = { init: tu };
});
var Hi = T((mf, ji) => {
  "use strict";
  p();
  var z = 1e6;
  function ru(r) {
    var e = r.readInt32BE(0), t = r.readUInt32BE(
      4
    ), n = "";
    e < 0 && (e = ~e + (t === 0), t = ~t + 1 >>> 0, n = "-");
    var i2 = "", s, o, u, c, l, f;
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i2;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i2 = c + u + i2;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i2;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i2 = c + u + i2;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i2;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i2 = c + u + i2;
    }
    return s = e % z, o = 4294967296 * s + t, u = "" + o % z, n + u + i2;
  }
  __name(ru, "ru");
  a(ru, "readInt8");
  ji.exports = ru;
});
var Ki = T((bf, zi) => {
  p();
  var nu = Hi(), L = a(function(r, e, t, n, i2) {
    t = t || 0, n = n || false, i2 = i2 || function(A, C, D) {
      return A * Math.pow(2, D) + C;
    };
    var s = t >> 3, o = a(function(A) {
      return n ? ~A & 255 : A;
    }, "inv"), u = 255, c = 8 - t % 8;
    e < c && (u = 255 << 8 - e & 255, c = e), t && (u = u >> t % 8);
    var l = 0;
    t % 8 + e >= 8 && (l = i2(0, o(r[s]) & u, c));
    for (var f = e + t >> 3, y = s + 1; y < f; y++) l = i2(l, o(
      r[y]
    ), 8);
    var g = (e + t) % 8;
    return g > 0 && (l = i2(l, o(r[f]) >> 8 - g, g)), l;
  }, "parseBits"), Vi = a(function(r, e, t) {
    var n = Math.pow(2, t - 1) - 1, i2 = L(r, 1), s = L(r, t, 1);
    if (s === 0) return 0;
    var o = 1, u = a(function(l, f, y) {
      l === 0 && (l = 1);
      for (var g = 1; g <= y; g++) o /= 2, (f & 1 << y - g) > 0 && (l += o);
      return l;
    }, "parsePrecisionBits"), c = L(r, e, t + 1, false, u);
    return s == Math.pow(
      2,
      t + 1
    ) - 1 ? c === 0 ? i2 === 0 ? 1 / 0 : -1 / 0 : NaN : (i2 === 0 ? 1 : -1) * Math.pow(2, s - n) * c;
  }, "parseFloatFromBits"), iu = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(r, 15, 1, true) + 1) : L(r, 15, 1);
  }, "parseInt16"), $i = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(
      r,
      31,
      1,
      true
    ) + 1) : L(r, 31, 1);
  }, "parseInt32"), su = a(function(r) {
    return Vi(r, 23, 8);
  }, "parseFloat32"), ou = a(function(r) {
    return Vi(r, 52, 11);
  }, "parseFloat64"), au = a(function(r) {
    var e = L(r, 16, 32);
    if (e == 49152) return NaN;
    for (var t = Math.pow(1e4, L(r, 16, 16)), n = 0, i2 = [], s = L(r, 16), o = 0; o < s; o++) n += L(r, 16, 64 + 16 * o) * t, t /= 1e4;
    var u = Math.pow(10, L(
      r,
      16,
      48
    ));
    return (e === 0 ? 1 : -1) * Math.round(n * u) / u;
  }, "parseNumeric"), Gi = a(function(r, e) {
    var t = L(e, 1), n = L(
      e,
      63,
      1
    ), i2 = new Date((t === 0 ? 1 : -1) * n / 1e3 + 9466848e5);
    return r || i2.setTime(i2.getTime() + i2.getTimezoneOffset() * 6e4), i2.usec = n % 1e3, i2.getMicroSeconds = function() {
      return this.usec;
    }, i2.setMicroSeconds = function(s) {
      this.usec = s;
    }, i2.getUTCMicroSeconds = function() {
      return this.usec;
    }, i2;
  }, "parseDate"), Ke = a(
    function(r) {
      for (var e = L(
        r,
        32
      ), t = L(r, 32, 32), n = L(r, 32, 64), i2 = 96, s = [], o = 0; o < e; o++) s[o] = L(r, 32, i2), i2 += 32, i2 += 32;
      var u = a(function(l) {
        var f = L(r, 32, i2);
        if (i2 += 32, f == 4294967295) return null;
        var y;
        if (l == 23 || l == 20) return y = L(r, f * 8, i2), i2 += f * 8, y;
        if (l == 25) return y = r.toString(this.encoding, i2 >> 3, (i2 += f << 3) >> 3), y;
        console.log("ERROR: ElementType not implemented: " + l);
      }, "parseElement"), c = a(function(l, f) {
        var y = [], g;
        if (l.length > 1) {
          var A = l.shift();
          for (g = 0; g < A; g++) y[g] = c(l, f);
          l.unshift(A);
        } else for (g = 0; g < l[0]; g++) y[g] = u(f);
        return y;
      }, "parse");
      return c(s, n);
    },
    "parseArray"
  ), uu = a(function(r) {
    return r.toString("utf8");
  }, "parseText"), cu = a(function(r) {
    return r === null ? null : L(r, 8) > 0;
  }, "parseBool"), lu = a(function(r) {
    r(20, nu), r(21, iu), r(23, $i), r(26, $i), r(1700, au), r(700, su), r(701, ou), r(16, cu), r(1114, Gi.bind(null, false)), r(1184, Gi.bind(null, true)), r(1e3, Ke), r(1007, Ke), r(1016, Ke), r(1008, Ke), r(1009, Ke), r(25, uu);
  }, "init");
  zi.exports = { init: lu };
});
var Zi = T((Sf, Yi) => {
  p();
  Yi.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});
var Je = T((Ze) => {
  p();
  var fu = Wi(), hu = Ki(), pu = rr(), du = Zi();
  Ze.getTypeParser = yu;
  Ze.setTypeParser = mu;
  Ze.arrayParser = pu;
  Ze.builtins = du;
  var Ye = { text: {}, binary: {} };
  function Ji(r) {
    return String(r);
  }
  __name(Ji, "Ji");
  a(Ji, "noParse");
  function yu(r, e) {
    return e = e || "text", Ye[e] && Ye[e][r] || Ji;
  }
  __name(yu, "yu");
  a(yu, "getTypeParser");
  function mu(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), Ye[e][r] = t;
  }
  __name(mu, "mu");
  a(mu, "setTypeParser");
  fu.init(function(r, e) {
    Ye.text[r] = e;
  });
  hu.init(function(r, e) {
    Ye.binary[r] = e;
  });
});
var At = T((If, Xi) => {
  "use strict";
  p();
  var wu = Je();
  function Et(r) {
    this._types = r || wu, this.text = {}, this.binary = {};
  }
  __name(Et, "Et");
  a(Et, "TypeOverrides");
  Et.prototype.getOverrides = function(r) {
    switch (r) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  Et.prototype.setTypeParser = function(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), this.getOverrides(e)[r] = t;
  };
  Et.prototype.getTypeParser = function(r, e) {
    return e = e || "text", this.getOverrides(e)[r] || this._types.getTypeParser(r, e);
  };
  Xi.exports = Et;
});
function Xe(r) {
  let e = 1779033703, t = 3144134277, n = 1013904242, i2 = 2773480762, s = 1359893119, o = 2600822924, u = 528734635, c = 1541459225, l = 0, f = 0, y = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ], g = a((I, w) => I >>> w | I << 32 - w, "rrot"), A = new Uint32Array(64), C = new Uint8Array(64), D = a(() => {
    for (let B = 0, j = 0; B < 16; B++, j += 4) A[B] = C[j] << 24 | C[j + 1] << 16 | C[j + 2] << 8 | C[j + 3];
    for (let B = 16; B < 64; B++) {
      let j = g(A[B - 15], 7) ^ g(A[B - 15], 18) ^ A[B - 15] >>> 3, le = g(
        A[B - 2],
        17
      ) ^ g(A[B - 2], 19) ^ A[B - 2] >>> 10;
      A[B] = A[B - 16] + j + A[B - 7] + le | 0;
    }
    let I = e, w = t, Z = n, W = i2, J = s, X = o, se = u, oe = c;
    for (let B = 0; B < 64; B++) {
      let j = g(J, 6) ^ g(J, 11) ^ g(J, 25), le = J & X ^ ~J & se, de = oe + j + le + y[B] + A[B] | 0, We = g(I, 2) ^ g(
        I,
        13
      ) ^ g(I, 22), fe = I & w ^ I & Z ^ w & Z, _e = We + fe | 0;
      oe = se, se = X, X = J, J = W + de | 0, W = Z, Z = w, w = I, I = de + _e | 0;
    }
    e = e + I | 0, t = t + w | 0, n = n + Z | 0, i2 = i2 + W | 0, s = s + J | 0, o = o + X | 0, u = u + se | 0, c = c + oe | 0, f = 0;
  }, "process"), Y = a((I) => {
    typeof I == "string" && (I = new TextEncoder().encode(I));
    for (let w = 0; w < I.length; w++) C[f++] = I[w], f === 64 && D();
    l += I.length;
  }, "add"), P = a(() => {
    if (C[f++] = 128, f == 64 && D(), f + 8 > 64) {
      for (; f < 64; ) C[f++] = 0;
      D();
    }
    for (; f < 58; ) C[f++] = 0;
    let I = l * 8;
    C[f++] = I / 1099511627776 & 255, C[f++] = I / 4294967296 & 255, C[f++] = I >>> 24, C[f++] = I >>> 16 & 255, C[f++] = I >>> 8 & 255, C[f++] = I & 255, D();
    let w = new Uint8Array(
      32
    );
    return w[0] = e >>> 24, w[1] = e >>> 16 & 255, w[2] = e >>> 8 & 255, w[3] = e & 255, w[4] = t >>> 24, w[5] = t >>> 16 & 255, w[6] = t >>> 8 & 255, w[7] = t & 255, w[8] = n >>> 24, w[9] = n >>> 16 & 255, w[10] = n >>> 8 & 255, w[11] = n & 255, w[12] = i2 >>> 24, w[13] = i2 >>> 16 & 255, w[14] = i2 >>> 8 & 255, w[15] = i2 & 255, w[16] = s >>> 24, w[17] = s >>> 16 & 255, w[18] = s >>> 8 & 255, w[19] = s & 255, w[20] = o >>> 24, w[21] = o >>> 16 & 255, w[22] = o >>> 8 & 255, w[23] = o & 255, w[24] = u >>> 24, w[25] = u >>> 16 & 255, w[26] = u >>> 8 & 255, w[27] = u & 255, w[28] = c >>> 24, w[29] = c >>> 16 & 255, w[30] = c >>> 8 & 255, w[31] = c & 255, w;
  }, "digest");
  return r === void 0 ? { add: Y, digest: P } : (Y(r), P());
}
__name(Xe, "Xe");
var es = G(() => {
  "use strict";
  p();
  a(Xe, "sha256");
});
var U;
var et;
var ts = G(() => {
  "use strict";
  p();
  U = class U2 {
    static {
      __name(this, "U");
    }
    constructor() {
      E(this, "_dataLength", 0);
      E(this, "_bufferLength", 0);
      E(this, "_state", new Int32Array(4));
      E(this, "_buffer", new ArrayBuffer(68));
      E(this, "_buffer8");
      E(this, "_buffer32");
      this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
    }
    static hashByteArray(e, t = false) {
      return this.onePassHasher.start().appendByteArray(
        e
      ).end(t);
    }
    static hashStr(e, t = false) {
      return this.onePassHasher.start().appendStr(e).end(t);
    }
    static hashAsciiStr(e, t = false) {
      return this.onePassHasher.start().appendAsciiStr(e).end(t);
    }
    static _hex(e) {
      let t = U2.hexChars, n = U2.hexOut, i2, s, o, u;
      for (u = 0; u < 4; u += 1) for (s = u * 8, i2 = e[u], o = 0; o < 8; o += 2) n[s + 1 + o] = t.charAt(i2 & 15), i2 >>>= 4, n[s + 0 + o] = t.charAt(
        i2 & 15
      ), i2 >>>= 4;
      return n.join("");
    }
    static _md5cycle(e, t) {
      let n = e[0], i2 = e[1], s = e[2], o = e[3];
      n += (i2 & s | ~i2 & o) + t[0] - 680876936 | 0, n = (n << 7 | n >>> 25) + i2 | 0, o += (n & i2 | ~n & s) + t[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i2) + t[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + o | 0, i2 += (s & o | ~s & n) + t[3] - 1044525330 | 0, i2 = (i2 << 22 | i2 >>> 10) + s | 0, n += (i2 & s | ~i2 & o) + t[4] - 176418897 | 0, n = (n << 7 | n >>> 25) + i2 | 0, o += (n & i2 | ~n & s) + t[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i2) + t[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + o | 0, i2 += (s & o | ~s & n) + t[7] - 45705983 | 0, i2 = (i2 << 22 | i2 >>> 10) + s | 0, n += (i2 & s | ~i2 & o) + t[8] + 1770035416 | 0, n = (n << 7 | n >>> 25) + i2 | 0, o += (n & i2 | ~n & s) + t[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i2) + t[10] - 42063 | 0, s = (s << 17 | s >>> 15) + o | 0, i2 += (s & o | ~s & n) + t[11] - 1990404162 | 0, i2 = (i2 << 22 | i2 >>> 10) + s | 0, n += (i2 & s | ~i2 & o) + t[12] + 1804603682 | 0, n = (n << 7 | n >>> 25) + i2 | 0, o += (n & i2 | ~n & s) + t[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i2) + t[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + o | 0, i2 += (s & o | ~s & n) + t[15] + 1236535329 | 0, i2 = (i2 << 22 | i2 >>> 10) + s | 0, n += (i2 & o | s & ~o) + t[1] - 165796510 | 0, n = (n << 5 | n >>> 27) + i2 | 0, o += (n & s | i2 & ~s) + t[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i2 | n & ~i2) + t[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + o | 0, i2 += (s & n | o & ~n) + t[0] - 373897302 | 0, i2 = (i2 << 20 | i2 >>> 12) + s | 0, n += (i2 & o | s & ~o) + t[5] - 701558691 | 0, n = (n << 5 | n >>> 27) + i2 | 0, o += (n & s | i2 & ~s) + t[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i2 | n & ~i2) + t[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + o | 0, i2 += (s & n | o & ~n) + t[4] - 405537848 | 0, i2 = (i2 << 20 | i2 >>> 12) + s | 0, n += (i2 & o | s & ~o) + t[9] + 568446438 | 0, n = (n << 5 | n >>> 27) + i2 | 0, o += (n & s | i2 & ~s) + t[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i2 | n & ~i2) + t[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + o | 0, i2 += (s & n | o & ~n) + t[8] + 1163531501 | 0, i2 = (i2 << 20 | i2 >>> 12) + s | 0, n += (i2 & o | s & ~o) + t[13] - 1444681467 | 0, n = (n << 5 | n >>> 27) + i2 | 0, o += (n & s | i2 & ~s) + t[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i2 | n & ~i2) + t[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + o | 0, i2 += (s & n | o & ~n) + t[12] - 1926607734 | 0, i2 = (i2 << 20 | i2 >>> 12) + s | 0, n += (i2 ^ s ^ o) + t[5] - 378558 | 0, n = (n << 4 | n >>> 28) + i2 | 0, o += (n ^ i2 ^ s) + t[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i2) + t[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + o | 0, i2 += (s ^ o ^ n) + t[14] - 35309556 | 0, i2 = (i2 << 23 | i2 >>> 9) + s | 0, n += (i2 ^ s ^ o) + t[1] - 1530992060 | 0, n = (n << 4 | n >>> 28) + i2 | 0, o += (n ^ i2 ^ s) + t[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i2) + t[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + o | 0, i2 += (s ^ o ^ n) + t[10] - 1094730640 | 0, i2 = (i2 << 23 | i2 >>> 9) + s | 0, n += (i2 ^ s ^ o) + t[13] + 681279174 | 0, n = (n << 4 | n >>> 28) + i2 | 0, o += (n ^ i2 ^ s) + t[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i2) + t[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + o | 0, i2 += (s ^ o ^ n) + t[6] + 76029189 | 0, i2 = (i2 << 23 | i2 >>> 9) + s | 0, n += (i2 ^ s ^ o) + t[9] - 640364487 | 0, n = (n << 4 | n >>> 28) + i2 | 0, o += (n ^ i2 ^ s) + t[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i2) + t[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + o | 0, i2 += (s ^ o ^ n) + t[2] - 995338651 | 0, i2 = (i2 << 23 | i2 >>> 9) + s | 0, n += (s ^ (i2 | ~o)) + t[0] - 198630844 | 0, n = (n << 6 | n >>> 26) + i2 | 0, o += (i2 ^ (n | ~s)) + t[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i2)) + t[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + o | 0, i2 += (o ^ (s | ~n)) + t[5] - 57434055 | 0, i2 = (i2 << 21 | i2 >>> 11) + s | 0, n += (s ^ (i2 | ~o)) + t[12] + 1700485571 | 0, n = (n << 6 | n >>> 26) + i2 | 0, o += (i2 ^ (n | ~s)) + t[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i2)) + t[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + o | 0, i2 += (o ^ (s | ~n)) + t[1] - 2054922799 | 0, i2 = (i2 << 21 | i2 >>> 11) + s | 0, n += (s ^ (i2 | ~o)) + t[8] + 1873313359 | 0, n = (n << 6 | n >>> 26) + i2 | 0, o += (i2 ^ (n | ~s)) + t[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i2)) + t[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + o | 0, i2 += (o ^ (s | ~n)) + t[13] + 1309151649 | 0, i2 = (i2 << 21 | i2 >>> 11) + s | 0, n += (s ^ (i2 | ~o)) + t[4] - 145523070 | 0, n = (n << 6 | n >>> 26) + i2 | 0, o += (i2 ^ (n | ~s)) + t[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i2)) + t[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + o | 0, i2 += (o ^ (s | ~n)) + t[9] - 343485551 | 0, i2 = (i2 << 21 | i2 >>> 11) + s | 0, e[0] = n + e[0] | 0, e[1] = i2 + e[1] | 0, e[2] = s + e[2] | 0, e[3] = o + e[3] | 0;
    }
    start() {
      return this._dataLength = 0, this._bufferLength = 0, this._state.set(U2.stateIdentity), this;
    }
    appendStr(e) {
      let t = this._buffer8, n = this._buffer32, i2 = this._bufferLength, s, o;
      for (o = 0; o < e.length; o += 1) {
        if (s = e.charCodeAt(o), s < 128) t[i2++] = s;
        else if (s < 2048) t[i2++] = (s >>> 6) + 192, t[i2++] = s & 63 | 128;
        else if (s < 55296 || s > 56319) t[i2++] = (s >>> 12) + 224, t[i2++] = s >>> 6 & 63 | 128, t[i2++] = s & 63 | 128;
        else {
          if (s = (s - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, s > 1114111) throw new Error(
            "Unicode standard supports code points up to U+10FFFF"
          );
          t[i2++] = (s >>> 18) + 240, t[i2++] = s >>> 12 & 63 | 128, t[i2++] = s >>> 6 & 63 | 128, t[i2++] = s & 63 | 128;
        }
        i2 >= 64 && (this._dataLength += 64, U2._md5cycle(this._state, n), i2 -= 64, n[0] = n[16]);
      }
      return this._bufferLength = i2, this;
    }
    appendAsciiStr(e) {
      let t = this._buffer8, n = this._buffer32, i2 = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i2); s--; ) t[i2++] = e.charCodeAt(o++);
        if (i2 < 64) break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i2 = 0;
      }
      return this._bufferLength = i2, this;
    }
    appendByteArray(e) {
      let t = this._buffer8, n = this._buffer32, i2 = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i2); s--; ) t[i2++] = e[o++];
        if (i2 < 64) break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i2 = 0;
      }
      return this._bufferLength = i2, this;
    }
    getState() {
      let e = this._state;
      return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [e[0], e[1], e[2], e[3]] };
    }
    setState(e) {
      let t = e.buffer, n = e.state, i2 = this._state, s;
      for (this._dataLength = e.length, this._bufferLength = e.buflen, i2[0] = n[0], i2[1] = n[1], i2[2] = n[2], i2[3] = n[3], s = 0; s < t.length; s += 1) this._buffer8[s] = t.charCodeAt(s);
    }
    end(e = false) {
      let t = this._bufferLength, n = this._buffer8, i2 = this._buffer32, s = (t >> 2) + 1;
      this._dataLength += t;
      let o = this._dataLength * 8;
      if (n[t] = 128, n[t + 1] = n[t + 2] = n[t + 3] = 0, i2.set(U2.buffer32Identity.subarray(s), s), t > 55 && (U2._md5cycle(this._state, i2), i2.set(U2.buffer32Identity)), o <= 4294967295) i2[14] = o;
      else {
        let u = o.toString(16).match(/(.*?)(.{0,8})$/);
        if (u === null) return;
        let c = parseInt(
          u[2],
          16
        ), l = parseInt(u[1], 16) || 0;
        i2[14] = c, i2[15] = l;
      }
      return U2._md5cycle(this._state, i2), e ? this._state : U2._hex(
        this._state
      );
    }
  };
  a(U, "Md5"), E(U, "stateIdentity", new Int32Array([1732584193, -271733879, -1732584194, 271733878])), E(U, "buffer32Identity", new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), E(U, "hexChars", "0123456789abcdef"), E(U, "hexOut", []), E(U, "onePassHasher", new U());
  et = U;
});
var lr = {};
ie(lr, { createHash: /* @__PURE__ */ __name(() => bu, "createHash"), createHmac: /* @__PURE__ */ __name(() => vu, "createHmac"), randomBytes: /* @__PURE__ */ __name(() => gu, "randomBytes") });
function gu(r) {
  return crypto.getRandomValues(d.alloc(r));
}
__name(gu, "gu");
function bu(r) {
  if (r === "sha256") return { update: a(function(e) {
    return { digest: a(
      function() {
        return d.from(Xe(e));
      },
      "digest"
    ) };
  }, "update") };
  if (r === "md5") return { update: a(function(e) {
    return {
      digest: a(function() {
        return typeof e == "string" ? et.hashStr(e) : et.hashByteArray(e);
      }, "digest")
    };
  }, "update") };
  throw new Error(`Hash type '${r}' not supported`);
}
__name(bu, "bu");
function vu(r, e) {
  if (r !== "sha256") throw new Error(`Only sha256 is supported (requested: '${r}')`);
  return { update: a(function(t) {
    return { digest: a(
      function() {
        typeof e == "string" && (e = new TextEncoder().encode(e)), typeof t == "string" && (t = new TextEncoder().encode(
          t
        ));
        let n = e.length;
        if (n > 64) e = Xe(e);
        else if (n < 64) {
          let c = new Uint8Array(64);
          c.set(e), e = c;
        }
        let i2 = new Uint8Array(
          64
        ), s = new Uint8Array(64);
        for (let c = 0; c < 64; c++) i2[c] = 54 ^ e[c], s[c] = 92 ^ e[c];
        let o = new Uint8Array(t.length + 64);
        o.set(i2, 0), o.set(t, 64);
        let u = new Uint8Array(96);
        return u.set(s, 0), u.set(Xe(o), 64), d.from(Xe(u));
      },
      "digest"
    ) };
  }, "update") };
}
__name(vu, "vu");
var fr = G(() => {
  "use strict";
  p();
  es();
  ts();
  a(gu, "randomBytes");
  a(bu, "createHash");
  a(vu, "createHmac");
});
var tt = T((Qf, hr) => {
  "use strict";
  p();
  hr.exports = {
    host: "localhost",
    user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
    database: void 0,
    password: null,
    connectionString: void 0,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 3e4,
    client_encoding: "",
    ssl: false,
    application_name: void 0,
    fallback_application_name: void 0,
    options: void 0,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var Me = Je(), xu = Me.getTypeParser(20, "text"), Su = Me.getTypeParser(
    1016,
    "text"
  );
  hr.exports.__defineSetter__("parseInt8", function(r) {
    Me.setTypeParser(20, "text", r ? Me.getTypeParser(
      23,
      "text"
    ) : xu), Me.setTypeParser(1016, "text", r ? Me.getTypeParser(1007, "text") : Su);
  });
});
var rt = T((Wf, ns) => {
  "use strict";
  p();
  var Eu = (fr(), O(lr)), Au = tt();
  function Cu(r) {
    var e = r.replace(
      /\\/g,
      "\\\\"
    ).replace(/"/g, '\\"');
    return '"' + e + '"';
  }
  __name(Cu, "Cu");
  a(Cu, "escapeElement");
  function rs(r) {
    for (var e = "{", t = 0; t < r.length; t++) t > 0 && (e = e + ","), r[t] === null || typeof r[t] > "u" ? e = e + "NULL" : Array.isArray(r[t]) ? e = e + rs(r[t]) : r[t] instanceof d ? e += "\\\\x" + r[t].toString("hex") : e += Cu(Ct(r[t]));
    return e = e + "}", e;
  }
  __name(rs, "rs");
  a(rs, "arrayString");
  var Ct = a(function(r, e) {
    if (r == null) return null;
    if (r instanceof d) return r;
    if (ArrayBuffer.isView(r)) {
      var t = d.from(r.buffer, r.byteOffset, r.byteLength);
      return t.length === r.byteLength ? t : t.slice(r.byteOffset, r.byteOffset + r.byteLength);
    }
    return r instanceof Date ? Au.parseInputDatesAsUTC ? Tu(r) : Iu(r) : Array.isArray(r) ? rs(r) : typeof r == "object" ? _u(r, e) : r.toString();
  }, "prepareValue");
  function _u(r, e) {
    if (r && typeof r.toPostgres == "function") {
      if (e = e || [], e.indexOf(r) !== -1) throw new Error('circular reference detected while preparing "' + r + '" for query');
      return e.push(r), Ct(r.toPostgres(Ct), e);
    }
    return JSON.stringify(r);
  }
  __name(_u, "_u");
  a(_u, "prepareObject");
  function N(r, e) {
    for (r = "" + r; r.length < e; ) r = "0" + r;
    return r;
  }
  __name(N, "N");
  a(N, "pad");
  function Iu(r) {
    var e = -r.getTimezoneOffset(), t = r.getFullYear(), n = t < 1;
    n && (t = Math.abs(t) + 1);
    var i2 = N(t, 4) + "-" + N(r.getMonth() + 1, 2) + "-" + N(r.getDate(), 2) + "T" + N(
      r.getHours(),
      2
    ) + ":" + N(r.getMinutes(), 2) + ":" + N(r.getSeconds(), 2) + "." + N(r.getMilliseconds(), 3);
    return e < 0 ? (i2 += "-", e *= -1) : i2 += "+", i2 += N(Math.floor(e / 60), 2) + ":" + N(e % 60, 2), n && (i2 += " BC"), i2;
  }
  __name(Iu, "Iu");
  a(Iu, "dateToString");
  function Tu(r) {
    var e = r.getUTCFullYear(), t = e < 1;
    t && (e = Math.abs(e) + 1);
    var n = N(e, 4) + "-" + N(r.getUTCMonth() + 1, 2) + "-" + N(r.getUTCDate(), 2) + "T" + N(r.getUTCHours(), 2) + ":" + N(r.getUTCMinutes(), 2) + ":" + N(r.getUTCSeconds(), 2) + "." + N(
      r.getUTCMilliseconds(),
      3
    );
    return n += "+00:00", t && (n += " BC"), n;
  }
  __name(Tu, "Tu");
  a(Tu, "dateToStringUTC");
  function Pu(r, e, t) {
    return r = typeof r == "string" ? { text: r } : r, e && (typeof e == "function" ? r.callback = e : r.values = e), t && (r.callback = t), r;
  }
  __name(Pu, "Pu");
  a(Pu, "normalizeQueryConfig");
  var pr = a(function(r) {
    return Eu.createHash("md5").update(r, "utf-8").digest("hex");
  }, "md5"), Ru = a(
    function(r, e, t) {
      var n = pr(e + r), i2 = pr(d.concat([d.from(n), t]));
      return "md5" + i2;
    },
    "postgresMd5PasswordHash"
  );
  ns.exports = {
    prepareValue: a(function(e) {
      return Ct(e);
    }, "prepareValueWrapper"),
    normalizeQueryConfig: Pu,
    postgresMd5PasswordHash: Ru,
    md5: pr
  };
});
var nt = {};
ie(nt, { default: /* @__PURE__ */ __name(() => ku, "default") });
var ku;
var it = G(() => {
  "use strict";
  p();
  ku = {};
});
var ds = T((th, ps) => {
  "use strict";
  p();
  var yr = (fr(), O(lr));
  function Mu(r) {
    if (r.indexOf("SCRAM-SHA-256") === -1) throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    let e = yr.randomBytes(
      18
    ).toString("base64");
    return { mechanism: "SCRAM-SHA-256", clientNonce: e, response: "n,,n=*,r=" + e, message: "SASLInitialResponse" };
  }
  __name(Mu, "Mu");
  a(Mu, "startSession");
  function Uu(r, e, t) {
    if (r.message !== "SASLInitialResponse") throw new Error(
      "SASL: Last message was not SASLInitialResponse"
    );
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
    if (typeof t != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    let n = qu(t);
    if (n.nonce.startsWith(r.clientNonce)) {
      if (n.nonce.length === r.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    var i2 = d.from(n.salt, "base64"), s = Wu(e, i2, n.iteration), o = Ue(s, "Client Key"), u = Nu(
      o
    ), c = "n=*,r=" + r.clientNonce, l = "r=" + n.nonce + ",s=" + n.salt + ",i=" + n.iteration, f = "c=biws,r=" + n.nonce, y = c + "," + l + "," + f, g = Ue(u, y), A = hs(o, g), C = A.toString("base64"), D = Ue(s, "Server Key"), Y = Ue(D, y);
    r.message = "SASLResponse", r.serverSignature = Y.toString("base64"), r.response = f + ",p=" + C;
  }
  __name(Uu, "Uu");
  a(Uu, "continueSession");
  function Du(r, e) {
    if (r.message !== "SASLResponse") throw new Error("SASL: Last message was not SASLResponse");
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    let { serverSignature: t } = Qu(
      e
    );
    if (t !== r.serverSignature) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
  }
  __name(Du, "Du");
  a(Du, "finalizeSession");
  function Ou(r) {
    if (typeof r != "string") throw new TypeError("SASL: text must be a string");
    return r.split("").map((e, t) => r.charCodeAt(t)).every((e) => e >= 33 && e <= 43 || e >= 45 && e <= 126);
  }
  __name(Ou, "Ou");
  a(Ou, "isPrintableChars");
  function ls(r) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r);
  }
  __name(ls, "ls");
  a(ls, "isBase64");
  function fs(r) {
    if (typeof r != "string") throw new TypeError("SASL: attribute pairs text must be a string");
    return new Map(r.split(",").map((e) => {
      if (!/^.=/.test(e)) throw new Error("SASL: Invalid attribute pair entry");
      let t = e[0], n = e.substring(2);
      return [t, n];
    }));
  }
  __name(fs, "fs");
  a(fs, "parseAttributePairs");
  function qu(r) {
    let e = fs(r), t = e.get("r");
    if (t) {
      if (!Ou(t)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    let n = e.get("s");
    if (n) {
      if (!ls(n)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    let i2 = e.get("i");
    if (i2) {
      if (!/^[1-9][0-9]*$/.test(i2)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    let s = parseInt(i2, 10);
    return { nonce: t, salt: n, iteration: s };
  }
  __name(qu, "qu");
  a(qu, "parseServerFirstMessage");
  function Qu(r) {
    let t = fs(r).get("v");
    if (t) {
      if (!ls(t)) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    } else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
    return { serverSignature: t };
  }
  __name(Qu, "Qu");
  a(Qu, "parseServerFinalMessage");
  function hs(r, e) {
    if (!d.isBuffer(r)) throw new TypeError("first argument must be a Buffer");
    if (!d.isBuffer(e)) throw new TypeError(
      "second argument must be a Buffer"
    );
    if (r.length !== e.length) throw new Error("Buffer lengths must match");
    if (r.length === 0) throw new Error("Buffers cannot be empty");
    return d.from(r.map((t, n) => r[n] ^ e[n]));
  }
  __name(hs, "hs");
  a(hs, "xorBuffers");
  function Nu(r) {
    return yr.createHash("sha256").update(r).digest();
  }
  __name(Nu, "Nu");
  a(Nu, "sha256");
  function Ue(r, e) {
    return yr.createHmac("sha256", r).update(e).digest();
  }
  __name(Ue, "Ue");
  a(Ue, "hmacSha256");
  function Wu(r, e, t) {
    for (var n = Ue(
      r,
      d.concat([e, d.from([0, 0, 0, 1])])
    ), i2 = n, s = 0; s < t - 1; s++) n = Ue(r, n), i2 = hs(i2, n);
    return i2;
  }
  __name(Wu, "Wu");
  a(Wu, "Hi");
  ps.exports = { startSession: Mu, continueSession: Uu, finalizeSession: Du };
});
var mr = {};
ie(mr, { join: /* @__PURE__ */ __name(() => ju, "join") });
function ju(...r) {
  return r.join("/");
}
__name(ju, "ju");
var wr = G(() => {
  "use strict";
  p();
  a(
    ju,
    "join"
  );
});
var gr = {};
ie(gr, { stat: /* @__PURE__ */ __name(() => Hu, "stat") });
function Hu(r, e) {
  e(new Error("No filesystem"));
}
__name(Hu, "Hu");
var br = G(() => {
  "use strict";
  p();
  a(Hu, "stat");
});
var vr = {};
ie(vr, { default: /* @__PURE__ */ __name(() => $u, "default") });
var $u;
var xr = G(() => {
  "use strict";
  p();
  $u = {};
});
var ys = {};
ie(ys, { StringDecoder: /* @__PURE__ */ __name(() => Sr, "StringDecoder") });
var Er;
var Sr;
var ms = G(() => {
  "use strict";
  p();
  Er = class Er {
    static {
      __name(this, "Er");
    }
    constructor(e) {
      E(this, "td");
      this.td = new TextDecoder(e);
    }
    write(e) {
      return this.td.decode(e, { stream: true });
    }
    end(e) {
      return this.td.decode(e);
    }
  };
  a(Er, "StringDecoder");
  Sr = Er;
});
var vs = T((fh, bs) => {
  "use strict";
  p();
  var { Transform: Gu } = (xr(), O(vr)), { StringDecoder: Vu } = (ms(), O(ys)), ve = /* @__PURE__ */ Symbol(
    "last"
  ), It = /* @__PURE__ */ Symbol("decoder");
  function zu(r, e, t) {
    let n;
    if (this.overflow) {
      if (n = this[It].write(r).split(
        this.matcher
      ), n.length === 1) return t();
      n.shift(), this.overflow = false;
    } else this[ve] += this[It].write(r), n = this[ve].split(this.matcher);
    this[ve] = n.pop();
    for (let i2 = 0; i2 < n.length; i2++) try {
      gs(this, this.mapper(n[i2]));
    } catch (s) {
      return t(s);
    }
    if (this.overflow = this[ve].length > this.maxLength, this.overflow && !this.skipOverflow) {
      t(new Error(
        "maximum buffer reached"
      ));
      return;
    }
    t();
  }
  __name(zu, "zu");
  a(zu, "transform");
  function Ku(r) {
    if (this[ve] += this[It].end(), this[ve])
      try {
        gs(this, this.mapper(this[ve]));
      } catch (e) {
        return r(e);
      }
    r();
  }
  __name(Ku, "Ku");
  a(Ku, "flush");
  function gs(r, e) {
    e !== void 0 && r.push(e);
  }
  __name(gs, "gs");
  a(gs, "push");
  function ws(r) {
    return r;
  }
  __name(ws, "ws");
  a(ws, "noop");
  function Yu(r, e, t) {
    switch (r = r || /\r?\n/, e = e || ws, t = t || {}, arguments.length) {
      case 1:
        typeof r == "function" ? (e = r, r = /\r?\n/) : typeof r == "object" && !(r instanceof RegExp) && !r[Symbol.split] && (t = r, r = /\r?\n/);
        break;
      case 2:
        typeof r == "function" ? (t = e, e = r, r = /\r?\n/) : typeof e == "object" && (t = e, e = ws);
    }
    t = Object.assign({}, t), t.autoDestroy = true, t.transform = zu, t.flush = Ku, t.readableObjectMode = true;
    let n = new Gu(t);
    return n[ve] = "", n[It] = new Vu("utf8"), n.matcher = r, n.mapper = e, n.maxLength = t.maxLength, n.skipOverflow = t.skipOverflow || false, n.overflow = false, n._destroy = function(i2, s) {
      this._writableState.errorEmitted = false, s(i2);
    }, n;
  }
  __name(Yu, "Yu");
  a(Yu, "split");
  bs.exports = Yu;
});
var Es = T((dh, pe) => {
  "use strict";
  p();
  var xs = (wr(), O(mr)), Zu = (xr(), O(vr)).Stream, Ju = vs(), Ss = (it(), O(nt)), Xu = 5432, Tt = m.platform === "win32", st = m.stderr, ec2 = 56, tc = 7, rc = 61440, nc = 32768;
  function ic(r) {
    return (r & rc) == nc;
  }
  __name(ic, "ic");
  a(ic, "isRegFile");
  var De = ["host", "port", "database", "user", "password"], Ar = De.length, sc = De[Ar - 1];
  function Cr() {
    var r = st instanceof Zu && st.writable === true;
    if (r) {
      var e = Array.prototype.slice.call(arguments).concat(`
`);
      st.write(Ss.format.apply(Ss, e));
    }
  }
  __name(Cr, "Cr");
  a(Cr, "warn");
  Object.defineProperty(pe.exports, "isWin", { get: a(function() {
    return Tt;
  }, "get"), set: a(function(r) {
    Tt = r;
  }, "set") });
  pe.exports.warnTo = function(r) {
    var e = st;
    return st = r, e;
  };
  pe.exports.getFileName = function(r) {
    var e = r || m.env, t = e.PGPASSFILE || (Tt ? xs.join(e.APPDATA || "./", "postgresql", "pgpass.conf") : xs.join(e.HOME || "./", ".pgpass"));
    return t;
  };
  pe.exports.usePgPass = function(r, e) {
    return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? false : Tt ? true : (e = e || "<unkn>", ic(r.mode) ? r.mode & (ec2 | tc) ? (Cr('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e), false) : true : (Cr('WARNING: password file "%s" is not a plain file', e), false));
  };
  var oc = pe.exports.match = function(r, e) {
    return De.slice(0, -1).reduce(function(t, n, i2) {
      return i2 == 1 && Number(r[n] || Xu) === Number(
        e[n]
      ) ? t && true : t && (e[n] === "*" || e[n] === r[n]);
    }, true);
  };
  pe.exports.getPassword = function(r, e, t) {
    var n, i2 = e.pipe(
      Ju()
    );
    function s(c) {
      var l = ac(c);
      l && uc(l) && oc(r, l) && (n = l[sc], i2.end());
    }
    __name(s, "s");
    a(s, "onLine");
    var o = a(function() {
      e.destroy(), t(n);
    }, "onEnd"), u = a(function(c) {
      e.destroy(), Cr("WARNING: error on reading file: %s", c), t(
        void 0
      );
    }, "onErr");
    e.on("error", u), i2.on("data", s).on("end", o).on("error", u);
  };
  var ac = pe.exports.parseLine = function(r) {
    if (r.length < 11 || r.match(/^\s+#/)) return null;
    for (var e = "", t = "", n = 0, i2 = 0, s = 0, o = {}, u = false, c = a(
      function(f, y, g) {
        var A = r.substring(y, g);
        Object.hasOwnProperty.call(m.env, "PGPASS_NO_DEESCAPE") || (A = A.replace(/\\([:\\])/g, "$1")), o[De[f]] = A;
      },
      "addToObj"
    ), l = 0; l < r.length - 1; l += 1) {
      if (e = r.charAt(l + 1), t = r.charAt(
        l
      ), u = n == Ar - 1, u) {
        c(n, i2);
        break;
      }
      l >= 0 && e == ":" && t !== "\\" && (c(n, i2, l + 1), i2 = l + 2, n += 1);
    }
    return o = Object.keys(o).length === Ar ? o : null, o;
  }, uc = pe.exports.isValidEntry = function(r) {
    for (var e = { 0: function(o) {
      return o.length > 0;
    }, 1: function(o) {
      return o === "*" ? true : (o = Number(o), isFinite(o) && o > 0 && o < 9007199254740992 && Math.floor(o) === o);
    }, 2: function(o) {
      return o.length > 0;
    }, 3: function(o) {
      return o.length > 0;
    }, 4: function(o) {
      return o.length > 0;
    } }, t = 0; t < De.length; t += 1) {
      var n = e[t], i2 = r[De[t]] || "", s = n(i2);
      if (!s) return false;
    }
    return true;
  };
});
var Cs = T((gh, _r) => {
  "use strict";
  p();
  var wh = (wr(), O(mr)), As = (br(), O(gr)), Pt = Es();
  _r.exports = function(r, e) {
    var t = Pt.getFileName();
    As.stat(t, function(n, i2) {
      if (n || !Pt.usePgPass(i2, t)) return e(void 0);
      var s = As.createReadStream(
        t
      );
      Pt.getPassword(r, s, e);
    });
  };
  _r.exports.warnTo = Pt.warnTo;
});
var _s = {};
ie(_s, { default: /* @__PURE__ */ __name(() => cc, "default") });
var cc;
var Is = G(() => {
  "use strict";
  p();
  cc = {};
});
var Ps = T((xh, Ts) => {
  "use strict";
  p();
  var lc = (Zt(), O(gi)), Ir = (br(), O(gr));
  function Tr(r) {
    if (r.charAt(0) === "/") {
      var t = r.split(" ");
      return { host: t[0], database: t[1] };
    }
    var e = lc.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r) ? encodeURI(r).replace(/\%25(\d\d)/g, "%$1") : r, true), t = e.query;
    for (var n in t) Array.isArray(t[n]) && (t[n] = t[n][t[n].length - 1]);
    var i2 = (e.auth || ":").split(":");
    if (t.user = i2[0], t.password = i2.splice(1).join(
      ":"
    ), t.port = e.port, e.protocol == "socket:") return t.host = decodeURI(e.pathname), t.database = e.query.db, t.client_encoding = e.query.encoding, t;
    t.host || (t.host = e.hostname);
    var s = e.pathname;
    if (!t.host && s && /^%2f/i.test(s)) {
      var o = s.split("/");
      t.host = decodeURIComponent(o[0]), s = o.splice(1).join("/");
    }
    switch (s && s.charAt(
      0
    ) === "/" && (s = s.slice(1) || null), t.database = s && decodeURI(s), (t.ssl === "true" || t.ssl === "1") && (t.ssl = true), t.ssl === "0" && (t.ssl = false), (t.sslcert || t.sslkey || t.sslrootcert || t.sslmode) && (t.ssl = {}), t.sslcert && (t.ssl.cert = Ir.readFileSync(t.sslcert).toString()), t.sslkey && (t.ssl.key = Ir.readFileSync(t.sslkey).toString()), t.sslrootcert && (t.ssl.ca = Ir.readFileSync(t.sslrootcert).toString()), t.sslmode) {
      case "disable": {
        t.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        break;
      case "no-verify": {
        t.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return t;
  }
  __name(Tr, "Tr");
  a(Tr, "parse");
  Ts.exports = Tr;
  Tr.parse = Tr;
});
var Rt = T((Ah, Ls) => {
  "use strict";
  p();
  var fc = (Is(), O(_s)), Bs = tt(), Rs = Ps().parse, H = a(function(r, e, t) {
    return t === void 0 ? t = m.env["PG" + r.toUpperCase()] : t === false || (t = m.env[t]), e[r] || t || Bs[r];
  }, "val"), hc = a(function() {
    switch (m.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return Bs.ssl;
  }, "readSSLConfigFromEnvironment"), Oe = a(function(r) {
    return "'" + ("" + r).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }, "quoteParamValue"), ne = a(function(r, e, t) {
    var n = e[t];
    n != null && r.push(t + "=" + Oe(n));
  }, "add"), Rr = class Rr {
    static {
      __name(this, "Rr");
    }
    constructor(e) {
      e = typeof e == "string" ? Rs(e) : e || {}, e.connectionString && (e = Object.assign({}, e, Rs(e.connectionString))), this.user = H("user", e), this.database = H("database", e), this.database === void 0 && (this.database = this.user), this.port = parseInt(H("port", e), 10), this.host = H("host", e), Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: H("password", e)
      }), this.binary = H("binary", e), this.options = H("options", e), this.ssl = typeof e.ssl > "u" ? hc() : e.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = true), this.ssl === "no-verify" && (this.ssl = { rejectUnauthorized: false }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this.client_encoding = H("client_encoding", e), this.replication = H("replication", e), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = H("application_name", e, "PGAPPNAME"), this.fallback_application_name = H("fallback_application_name", e, false), this.statement_timeout = H("statement_timeout", e, false), this.lock_timeout = H("lock_timeout", e, false), this.idle_in_transaction_session_timeout = H("idle_in_transaction_session_timeout", e, false), this.query_timeout = H("query_timeout", e, false), e.connectionTimeoutMillis === void 0 ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e.connectionTimeoutMillis / 1e3), e.keepAlive === false ? this.keepalives = 0 : e.keepAlive === true && (this.keepalives = 1), typeof e.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e.keepAliveInitialDelayMillis / 1e3));
    }
    getLibpqConnectionString(e) {
      var t = [];
      ne(t, this, "user"), ne(t, this, "password"), ne(t, this, "port"), ne(t, this, "application_name"), ne(
        t,
        this,
        "fallback_application_name"
      ), ne(t, this, "connect_timeout"), ne(t, this, "options");
      var n = typeof this.ssl == "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      if (ne(t, n, "sslmode"), ne(t, n, "sslca"), ne(t, n, "sslkey"), ne(t, n, "sslcert"), ne(t, n, "sslrootcert"), this.database && t.push("dbname=" + Oe(this.database)), this.replication && t.push("replication=" + Oe(this.replication)), this.host && t.push("host=" + Oe(this.host)), this.isDomainSocket) return e(null, t.join(" "));
      this.client_encoding && t.push("client_encoding=" + Oe(this.client_encoding)), fc.lookup(this.host, function(i2, s) {
        return i2 ? e(i2, null) : (t.push("hostaddr=" + Oe(s)), e(null, t.join(" ")));
      });
    }
  };
  a(Rr, "ConnectionParameters");
  var Pr = Rr;
  Ls.exports = Pr;
});
var Ms = T((Ih, ks) => {
  "use strict";
  p();
  var pc = Je(), Fs = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, Lr = class Lr {
    static {
      __name(this, "Lr");
    }
    constructor(e, t) {
      this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = void 0, this._types = t, this.RowCtor = null, this.rowAsArray = e === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
    }
    addCommandComplete(e) {
      var t;
      e.text ? t = Fs.exec(e.text) : t = Fs.exec(e.command), t && (this.command = t[1], t[3] ? (this.oid = parseInt(
        t[2],
        10
      ), this.rowCount = parseInt(t[3], 10)) : t[2] && (this.rowCount = parseInt(t[2], 10)));
    }
    _parseRowAsArray(e) {
      for (var t = new Array(
        e.length
      ), n = 0, i2 = e.length; n < i2; n++) {
        var s = e[n];
        s !== null ? t[n] = this._parsers[n](s) : t[n] = null;
      }
      return t;
    }
    parseRow(e) {
      for (var t = {}, n = 0, i2 = e.length; n < i2; n++) {
        var s = e[n], o = this.fields[n].name;
        s !== null ? t[o] = this._parsers[n](
          s
        ) : t[o] = null;
      }
      return t;
    }
    addRow(e) {
      this.rows.push(e);
    }
    addFields(e) {
      this.fields = e, this.fields.length && (this._parsers = new Array(e.length));
      for (var t = 0; t < e.length; t++) {
        var n = e[t];
        this._types ? this._parsers[t] = this._types.getTypeParser(n.dataTypeID, n.format || "text") : this._parsers[t] = pc.getTypeParser(n.dataTypeID, n.format || "text");
      }
    }
  };
  a(Lr, "Result");
  var Br = Lr;
  ks.exports = Br;
});
var qs = T((Rh, Os) => {
  "use strict";
  p();
  var { EventEmitter: dc } = ge(), Us = Ms(), Ds = rt(), kr = class kr extends dc {
    static {
      __name(this, "kr");
    }
    constructor(e, t, n) {
      super(), e = Ds.normalizeQueryConfig(e, t, n), this.text = e.text, this.values = e.values, this.rows = e.rows, this.types = e.types, this.name = e.name, this.binary = e.binary, this.portal = e.portal || "", this.callback = e.callback, this._rowMode = e.rowMode, m.domain && e.callback && (this.callback = m.domain.bind(e.callback)), this._result = new Us(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = false, this._canceledDueToError = false, this._promise = null;
    }
    requiresPreparation() {
      return this.name || this.rows ? true : !this.text || !this.values ? false : this.values.length > 0;
    }
    _checkForMultirow() {
      this._result.command && (Array.isArray(this._results) || (this._results = [this._result]), this._result = new Us(this._rowMode, this.types), this._results.push(this._result));
    }
    handleRowDescription(e) {
      this._checkForMultirow(), this._result.addFields(e.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(e) {
      let t;
      if (!this._canceledDueToError) {
        try {
          t = this._result.parseRow(
            e.fields
          );
        } catch (n) {
          this._canceledDueToError = n;
          return;
        }
        this.emit("row", t, this._result), this._accumulateRows && this._result.addRow(t);
      }
    }
    handleCommandComplete(e, t) {
      this._checkForMultirow(), this._result.addCommandComplete(
        e
      ), this.rows && t.sync();
    }
    handleEmptyQuery(e) {
      this.rows && e.sync();
    }
    handleError(e, t) {
      if (this._canceledDueToError && (e = this._canceledDueToError, this._canceledDueToError = false), this.callback) return this.callback(e);
      this.emit("error", e);
    }
    handleReadyForQuery(e) {
      if (this._canceledDueToError) return this.handleError(
        this._canceledDueToError,
        e
      );
      if (this.callback) try {
        this.callback(null, this._results);
      } catch (t) {
        m.nextTick(() => {
          throw t;
        });
      }
      this.emit(
        "end",
        this._results
      );
    }
    submit(e) {
      if (typeof this.text != "string" && typeof this.name != "string") return new Error(
        "A query must have either text or a name. Supplying neither is unsupported."
      );
      let t = e.parsedStatements[this.name];
      return this.text && t && this.text !== t ? new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e) : e.query(this.text), null);
    }
    hasBeenParsed(e) {
      return this.name && e.parsedStatements[this.name];
    }
    handlePortalSuspended(e) {
      this._getRows(e, this.rows);
    }
    _getRows(e, t) {
      e.execute({ portal: this.portal, rows: t }), t ? e.flush() : e.sync();
    }
    prepare(e) {
      this.isPreparedStatement = true, this.hasBeenParsed(e) || e.parse({ text: this.text, name: this.name, types: this.types });
      try {
        e.bind({ portal: this.portal, statement: this.name, values: this.values, binary: this.binary, valueMapper: Ds.prepareValue });
      } catch (t) {
        this.handleError(t, e);
        return;
      }
      e.describe({ type: "P", name: this.portal || "" }), this._getRows(e, this.rows);
    }
    handleCopyInResponse(e) {
      e.sendCopyFail("No source stream defined");
    }
    handleCopyData(e, t) {
    }
  };
  a(kr, "Query");
  var Fr = kr;
  Os.exports = Fr;
});
var ln = T((_) => {
  "use strict";
  p();
  Object.defineProperty(_, "__esModule", { value: true });
  _.NoticeMessage = _.DataRowMessage = _.CommandCompleteMessage = _.ReadyForQueryMessage = _.NotificationResponseMessage = _.BackendKeyDataMessage = _.AuthenticationMD5Password = _.ParameterStatusMessage = _.ParameterDescriptionMessage = _.RowDescriptionMessage = _.Field = _.CopyResponse = _.CopyDataMessage = _.DatabaseError = _.copyDone = _.emptyQuery = _.replicationStart = _.portalSuspended = _.noData = _.closeComplete = _.bindComplete = _.parseComplete = void 0;
  _.parseComplete = { name: "parseComplete", length: 5 };
  _.bindComplete = { name: "bindComplete", length: 5 };
  _.closeComplete = { name: "closeComplete", length: 5 };
  _.noData = { name: "noData", length: 5 };
  _.portalSuspended = { name: "portalSuspended", length: 5 };
  _.replicationStart = { name: "replicationStart", length: 4 };
  _.emptyQuery = { name: "emptyQuery", length: 4 };
  _.copyDone = { name: "copyDone", length: 4 };
  var Kr = class Kr extends Error {
    static {
      __name(this, "Kr");
    }
    constructor(e, t, n) {
      super(e), this.length = t, this.name = n;
    }
  };
  a(Kr, "DatabaseError");
  var Mr = Kr;
  _.DatabaseError = Mr;
  var Yr = class Yr {
    static {
      __name(this, "Yr");
    }
    constructor(e, t) {
      this.length = e, this.chunk = t, this.name = "copyData";
    }
  };
  a(Yr, "CopyDataMessage");
  var Ur = Yr;
  _.CopyDataMessage = Ur;
  var Zr = class Zr {
    static {
      __name(this, "Zr");
    }
    constructor(e, t, n, i2) {
      this.length = e, this.name = t, this.binary = n, this.columnTypes = new Array(i2);
    }
  };
  a(Zr, "CopyResponse");
  var Dr = Zr;
  _.CopyResponse = Dr;
  var Jr = class Jr {
    static {
      __name(this, "Jr");
    }
    constructor(e, t, n, i2, s, o, u) {
      this.name = e, this.tableID = t, this.columnID = n, this.dataTypeID = i2, this.dataTypeSize = s, this.dataTypeModifier = o, this.format = u;
    }
  };
  a(Jr, "Field");
  var Or = Jr;
  _.Field = Or;
  var Xr = class Xr {
    static {
      __name(this, "Xr");
    }
    constructor(e, t) {
      this.length = e, this.fieldCount = t, this.name = "rowDescription", this.fields = new Array(this.fieldCount);
    }
  };
  a(Xr, "RowDescriptionMessage");
  var qr = Xr;
  _.RowDescriptionMessage = qr;
  var en = class en {
    static {
      __name(this, "en");
    }
    constructor(e, t) {
      this.length = e, this.parameterCount = t, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
    }
  };
  a(en, "ParameterDescriptionMessage");
  var Qr = en;
  _.ParameterDescriptionMessage = Qr;
  var tn = class tn {
    static {
      __name(this, "tn");
    }
    constructor(e, t, n) {
      this.length = e, this.parameterName = t, this.parameterValue = n, this.name = "parameterStatus";
    }
  };
  a(tn, "ParameterStatusMessage");
  var Nr = tn;
  _.ParameterStatusMessage = Nr;
  var rn = class rn {
    static {
      __name(this, "rn");
    }
    constructor(e, t) {
      this.length = e, this.salt = t, this.name = "authenticationMD5Password";
    }
  };
  a(rn, "AuthenticationMD5Password");
  var Wr = rn;
  _.AuthenticationMD5Password = Wr;
  var nn = class nn {
    static {
      __name(this, "nn");
    }
    constructor(e, t, n) {
      this.length = e, this.processID = t, this.secretKey = n, this.name = "backendKeyData";
    }
  };
  a(nn, "BackendKeyDataMessage");
  var jr = nn;
  _.BackendKeyDataMessage = jr;
  var sn = class sn {
    static {
      __name(this, "sn");
    }
    constructor(e, t, n, i2) {
      this.length = e, this.processId = t, this.channel = n, this.payload = i2, this.name = "notification";
    }
  };
  a(sn, "NotificationResponseMessage");
  var Hr = sn;
  _.NotificationResponseMessage = Hr;
  var on = class on {
    static {
      __name(this, "on");
    }
    constructor(e, t) {
      this.length = e, this.status = t, this.name = "readyForQuery";
    }
  };
  a(on, "ReadyForQueryMessage");
  var $r = on;
  _.ReadyForQueryMessage = $r;
  var an = class an {
    static {
      __name(this, "an");
    }
    constructor(e, t) {
      this.length = e, this.text = t, this.name = "commandComplete";
    }
  };
  a(an, "CommandCompleteMessage");
  var Gr = an;
  _.CommandCompleteMessage = Gr;
  var un = class un {
    static {
      __name(this, "un");
    }
    constructor(e, t) {
      this.length = e, this.fields = t, this.name = "dataRow", this.fieldCount = t.length;
    }
  };
  a(un, "DataRowMessage");
  var Vr = un;
  _.DataRowMessage = Vr;
  var cn = class cn {
    static {
      __name(this, "cn");
    }
    constructor(e, t) {
      this.length = e, this.message = t, this.name = "notice";
    }
  };
  a(cn, "NoticeMessage");
  var zr = cn;
  _.NoticeMessage = zr;
});
var Qs = T((Bt) => {
  "use strict";
  p();
  Object.defineProperty(Bt, "__esModule", { value: true });
  Bt.Writer = void 0;
  var hn = class hn {
    static {
      __name(this, "hn");
    }
    constructor(e = 256) {
      this.size = e, this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(e);
    }
    ensure(e) {
      if (this.buffer.length - this.offset < e) {
        let n = this.buffer, i2 = n.length + (n.length >> 1) + e;
        this.buffer = d.allocUnsafe(i2), n.copy(
          this.buffer
        );
      }
    }
    addInt32(e) {
      return this.ensure(4), this.buffer[this.offset++] = e >>> 24 & 255, this.buffer[this.offset++] = e >>> 16 & 255, this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addInt16(e) {
      return this.ensure(2), this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addCString(e) {
      if (!e) this.ensure(1);
      else {
        let t = d.byteLength(e);
        this.ensure(t + 1), this.buffer.write(e, this.offset, "utf-8"), this.offset += t;
      }
      return this.buffer[this.offset++] = 0, this;
    }
    addString(e = "") {
      let t = d.byteLength(e);
      return this.ensure(t), this.buffer.write(e, this.offset), this.offset += t, this;
    }
    add(e) {
      return this.ensure(
        e.length
      ), e.copy(this.buffer, this.offset), this.offset += e.length, this;
    }
    join(e) {
      if (e) {
        this.buffer[this.headerPosition] = e;
        let t = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(t, this.headerPosition + 1);
      }
      return this.buffer.slice(e ? 0 : 5, this.offset);
    }
    flush(e) {
      let t = this.join(e);
      return this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(this.size), t;
    }
  };
  a(hn, "Writer");
  var fn = hn;
  Bt.Writer = fn;
});
var Ws = T((Ft) => {
  "use strict";
  p();
  Object.defineProperty(Ft, "__esModule", { value: true });
  Ft.serialize = void 0;
  var pn = Qs(), F = new pn.Writer(), yc = a((r) => {
    F.addInt16(3).addInt16(0);
    for (let n of Object.keys(r)) F.addCString(
      n
    ).addCString(r[n]);
    F.addCString("client_encoding").addCString("UTF8");
    let e = F.addCString("").flush(), t = e.length + 4;
    return new pn.Writer().addInt32(t).add(e).flush();
  }, "startup"), mc = a(() => {
    let r = d.allocUnsafe(
      8
    );
    return r.writeInt32BE(8, 0), r.writeInt32BE(80877103, 4), r;
  }, "requestSsl"), wc = a((r) => F.addCString(r).flush(
    112
  ), "password"), gc = a(function(r, e) {
    return F.addCString(r).addInt32(d.byteLength(e)).addString(e), F.flush(112);
  }, "sendSASLInitialResponseMessage"), bc = a(function(r) {
    return F.addString(r).flush(112);
  }, "sendSCRAMClientFinalMessage"), vc = a((r) => F.addCString(r).flush(81), "query"), Ns = [], xc = a((r) => {
    let e = r.name || "";
    e.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e, e.length), console.error("This can cause conflicts and silent errors executing queries"));
    let t = r.types || Ns, n = t.length, i2 = F.addCString(e).addCString(r.text).addInt16(n);
    for (let s = 0; s < n; s++) i2.addInt32(t[s]);
    return F.flush(80);
  }, "parse"), qe = new pn.Writer(), Sc = a(function(r, e) {
    for (let t = 0; t < r.length; t++) {
      let n = e ? e(r[t], t) : r[t];
      n == null ? (F.addInt16(0), qe.addInt32(-1)) : n instanceof d ? (F.addInt16(
        1
      ), qe.addInt32(n.length), qe.add(n)) : (F.addInt16(0), qe.addInt32(d.byteLength(n)), qe.addString(n));
    }
  }, "writeValues"), Ec = a((r = {}) => {
    let e = r.portal || "", t = r.statement || "", n = r.binary || false, i2 = r.values || Ns, s = i2.length;
    return F.addCString(e).addCString(t), F.addInt16(s), Sc(i2, r.valueMapper), F.addInt16(s), F.add(qe.flush()), F.addInt16(n ? 1 : 0), F.flush(66);
  }, "bind"), Ac = d.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]), Cc = a((r) => {
    if (!r || !r.portal && !r.rows) return Ac;
    let e = r.portal || "", t = r.rows || 0, n = d.byteLength(e), i2 = 4 + n + 1 + 4, s = d.allocUnsafe(1 + i2);
    return s[0] = 69, s.writeInt32BE(i2, 1), s.write(e, 5, "utf-8"), s[n + 5] = 0, s.writeUInt32BE(t, s.length - 4), s;
  }, "execute"), _c = a(
    (r, e) => {
      let t = d.allocUnsafe(16);
      return t.writeInt32BE(16, 0), t.writeInt16BE(1234, 4), t.writeInt16BE(
        5678,
        6
      ), t.writeInt32BE(r, 8), t.writeInt32BE(e, 12), t;
    },
    "cancel"
  ), dn = a((r, e) => {
    let n = 4 + d.byteLength(e) + 1, i2 = d.allocUnsafe(1 + n);
    return i2[0] = r, i2.writeInt32BE(n, 1), i2.write(e, 5, "utf-8"), i2[n] = 0, i2;
  }, "cstringMessage"), Ic = F.addCString("P").flush(68), Tc = F.addCString("S").flush(68), Pc = a((r) => r.name ? dn(68, `${r.type}${r.name || ""}`) : r.type === "P" ? Ic : Tc, "describe"), Rc = a((r) => {
    let e = `${r.type}${r.name || ""}`;
    return dn(67, e);
  }, "close"), Bc = a((r) => F.add(r).flush(100), "copyData"), Lc = a((r) => dn(102, r), "copyFail"), Lt = a((r) => d.from([r, 0, 0, 0, 4]), "codeOnlyBuffer"), Fc = Lt(72), kc = Lt(83), Mc = Lt(88), Uc = Lt(99), Dc = {
    startup: yc,
    password: wc,
    requestSsl: mc,
    sendSASLInitialResponseMessage: gc,
    sendSCRAMClientFinalMessage: bc,
    query: vc,
    parse: xc,
    bind: Ec,
    execute: Cc,
    describe: Pc,
    close: Rc,
    flush: a(
      () => Fc,
      "flush"
    ),
    sync: a(() => kc, "sync"),
    end: a(() => Mc, "end"),
    copyData: Bc,
    copyDone: a(() => Uc, "copyDone"),
    copyFail: Lc,
    cancel: _c
  };
  Ft.serialize = Dc;
});
var js = T((kt) => {
  "use strict";
  p();
  Object.defineProperty(kt, "__esModule", { value: true });
  kt.BufferReader = void 0;
  var Oc = d.allocUnsafe(0), mn = class mn {
    static {
      __name(this, "mn");
    }
    constructor(e = 0) {
      this.offset = e, this.buffer = Oc, this.encoding = "utf-8";
    }
    setBuffer(e, t) {
      this.offset = e, this.buffer = t;
    }
    int16() {
      let e = this.buffer.readInt16BE(this.offset);
      return this.offset += 2, e;
    }
    byte() {
      let e = this.buffer[this.offset];
      return this.offset++, e;
    }
    int32() {
      let e = this.buffer.readInt32BE(
        this.offset
      );
      return this.offset += 4, e;
    }
    uint32() {
      let e = this.buffer.readUInt32BE(this.offset);
      return this.offset += 4, e;
    }
    string(e) {
      let t = this.buffer.toString(this.encoding, this.offset, this.offset + e);
      return this.offset += e, t;
    }
    cstring() {
      let e = this.offset, t = e;
      for (; this.buffer[t++] !== 0; ) ;
      return this.offset = t, this.buffer.toString(this.encoding, e, t - 1);
    }
    bytes(e) {
      let t = this.buffer.slice(this.offset, this.offset + e);
      return this.offset += e, t;
    }
  };
  a(mn, "BufferReader");
  var yn = mn;
  kt.BufferReader = yn;
});
var Gs = T((Mt) => {
  "use strict";
  p();
  Object.defineProperty(Mt, "__esModule", { value: true });
  Mt.Parser = void 0;
  var k = ln(), qc = js(), wn = 1, Qc = 4, Hs = wn + Qc, $s = d.allocUnsafe(0), bn = class bn {
    static {
      __name(this, "bn");
    }
    constructor(e) {
      if (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new qc.BufferReader(), e?.mode === "binary") throw new Error("Binary mode not supported yet");
      this.mode = e?.mode || "text";
    }
    parse(e, t) {
      this.mergeBuffer(e);
      let n = this.bufferOffset + this.bufferLength, i2 = this.bufferOffset;
      for (; i2 + Hs <= n; ) {
        let s = this.buffer[i2], o = this.buffer.readUInt32BE(
          i2 + wn
        ), u = wn + o;
        if (u + i2 <= n) {
          let c = this.handlePacket(i2 + Hs, s, o, this.buffer);
          t(c), i2 += u;
        } else break;
      }
      i2 === n ? (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n - i2, this.bufferOffset = i2);
    }
    mergeBuffer(e) {
      if (this.bufferLength > 0) {
        let t = this.bufferLength + e.byteLength;
        if (t + this.bufferOffset > this.buffer.byteLength) {
          let i2;
          if (t <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) i2 = this.buffer;
          else {
            let s = this.buffer.byteLength * 2;
            for (; t >= s; ) s *= 2;
            i2 = d.allocUnsafe(s);
          }
          this.buffer.copy(i2, 0, this.bufferOffset, this.bufferOffset + this.bufferLength), this.buffer = i2, this.bufferOffset = 0;
        }
        e.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t;
      } else this.buffer = e, this.bufferOffset = 0, this.bufferLength = e.byteLength;
    }
    handlePacket(e, t, n, i2) {
      switch (t) {
        case 50:
          return k.bindComplete;
        case 49:
          return k.parseComplete;
        case 51:
          return k.closeComplete;
        case 110:
          return k.noData;
        case 115:
          return k.portalSuspended;
        case 99:
          return k.copyDone;
        case 87:
          return k.replicationStart;
        case 73:
          return k.emptyQuery;
        case 68:
          return this.parseDataRowMessage(e, n, i2);
        case 67:
          return this.parseCommandCompleteMessage(
            e,
            n,
            i2
          );
        case 90:
          return this.parseReadyForQueryMessage(e, n, i2);
        case 65:
          return this.parseNotificationMessage(
            e,
            n,
            i2
          );
        case 82:
          return this.parseAuthenticationResponse(e, n, i2);
        case 83:
          return this.parseParameterStatusMessage(
            e,
            n,
            i2
          );
        case 75:
          return this.parseBackendKeyData(e, n, i2);
        case 69:
          return this.parseErrorMessage(e, n, i2, "error");
        case 78:
          return this.parseErrorMessage(e, n, i2, "notice");
        case 84:
          return this.parseRowDescriptionMessage(
            e,
            n,
            i2
          );
        case 116:
          return this.parseParameterDescriptionMessage(e, n, i2);
        case 71:
          return this.parseCopyInMessage(
            e,
            n,
            i2
          );
        case 72:
          return this.parseCopyOutMessage(e, n, i2);
        case 100:
          return this.parseCopyData(e, n, i2);
        default:
          return new k.DatabaseError("received invalid response: " + t.toString(16), n, "error");
      }
    }
    parseReadyForQueryMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i2 = this.reader.string(1);
      return new k.ReadyForQueryMessage(t, i2);
    }
    parseCommandCompleteMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i2 = this.reader.cstring();
      return new k.CommandCompleteMessage(t, i2);
    }
    parseCopyData(e, t, n) {
      let i2 = n.slice(e, e + (t - 4));
      return new k.CopyDataMessage(t, i2);
    }
    parseCopyInMessage(e, t, n) {
      return this.parseCopyMessage(
        e,
        t,
        n,
        "copyInResponse"
      );
    }
    parseCopyOutMessage(e, t, n) {
      return this.parseCopyMessage(e, t, n, "copyOutResponse");
    }
    parseCopyMessage(e, t, n, i2) {
      this.reader.setBuffer(e, n);
      let s = this.reader.byte() !== 0, o = this.reader.int16(), u = new k.CopyResponse(t, i2, s, o);
      for (let c = 0; c < o; c++) u.columnTypes[c] = this.reader.int16();
      return u;
    }
    parseNotificationMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i2 = this.reader.int32(), s = this.reader.cstring(), o = this.reader.cstring();
      return new k.NotificationResponseMessage(t, i2, s, o);
    }
    parseRowDescriptionMessage(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i2 = this.reader.int16(), s = new k.RowDescriptionMessage(t, i2);
      for (let o = 0; o < i2; o++) s.fields[o] = this.parseField();
      return s;
    }
    parseField() {
      let e = this.reader.cstring(), t = this.reader.uint32(), n = this.reader.int16(), i2 = this.reader.uint32(), s = this.reader.int16(), o = this.reader.int32(), u = this.reader.int16() === 0 ? "text" : "binary";
      return new k.Field(e, t, n, i2, s, o, u);
    }
    parseParameterDescriptionMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i2 = this.reader.int16(), s = new k.ParameterDescriptionMessage(t, i2);
      for (let o = 0; o < i2; o++)
        s.dataTypeIDs[o] = this.reader.int32();
      return s;
    }
    parseDataRowMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i2 = this.reader.int16(), s = new Array(i2);
      for (let o = 0; o < i2; o++) {
        let u = this.reader.int32();
        s[o] = u === -1 ? null : this.reader.string(u);
      }
      return new k.DataRowMessage(t, s);
    }
    parseParameterStatusMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i2 = this.reader.cstring(), s = this.reader.cstring();
      return new k.ParameterStatusMessage(
        t,
        i2,
        s
      );
    }
    parseBackendKeyData(e, t, n) {
      this.reader.setBuffer(e, n);
      let i2 = this.reader.int32(), s = this.reader.int32();
      return new k.BackendKeyDataMessage(t, i2, s);
    }
    parseAuthenticationResponse(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i2 = this.reader.int32(), s = { name: "authenticationOk", length: t };
      switch (i2) {
        case 0:
          break;
        case 3:
          s.length === 8 && (s.name = "authenticationCleartextPassword");
          break;
        case 5:
          if (s.length === 12) {
            s.name = "authenticationMD5Password";
            let o = this.reader.bytes(4);
            return new k.AuthenticationMD5Password(t, o);
          }
          break;
        case 10:
          {
            s.name = "authenticationSASL", s.mechanisms = [];
            let o;
            do
              o = this.reader.cstring(), o && s.mechanisms.push(o);
            while (o);
          }
          break;
        case 11:
          s.name = "authenticationSASLContinue", s.data = this.reader.string(t - 8);
          break;
        case 12:
          s.name = "authenticationSASLFinal", s.data = this.reader.string(t - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + i2);
      }
      return s;
    }
    parseErrorMessage(e, t, n, i2) {
      this.reader.setBuffer(e, n);
      let s = {}, o = this.reader.string(1);
      for (; o !== "\0"; ) s[o] = this.reader.cstring(), o = this.reader.string(1);
      let u = s.M, c = i2 === "notice" ? new k.NoticeMessage(t, u) : new k.DatabaseError(u, t, i2);
      return c.severity = s.S, c.code = s.C, c.detail = s.D, c.hint = s.H, c.position = s.P, c.internalPosition = s.p, c.internalQuery = s.q, c.where = s.W, c.schema = s.s, c.table = s.t, c.column = s.c, c.dataType = s.d, c.constraint = s.n, c.file = s.F, c.line = s.L, c.routine = s.R, c;
    }
  };
  a(bn, "Parser");
  var gn = bn;
  Mt.Parser = gn;
});
var vn = T((xe) => {
  "use strict";
  p();
  Object.defineProperty(xe, "__esModule", { value: true });
  xe.DatabaseError = xe.serialize = xe.parse = void 0;
  var Nc = ln();
  Object.defineProperty(xe, "DatabaseError", { enumerable: true, get: a(
    function() {
      return Nc.DatabaseError;
    },
    "get"
  ) });
  var Wc = Ws();
  Object.defineProperty(xe, "serialize", {
    enumerable: true,
    get: a(function() {
      return Wc.serialize;
    }, "get")
  });
  var jc = Gs();
  function Hc(r, e) {
    let t = new jc.Parser();
    return r.on("data", (n) => t.parse(n, e)), new Promise((n) => r.on("end", () => n()));
  }
  __name(Hc, "Hc");
  a(Hc, "parse");
  xe.parse = Hc;
});
var Vs = {};
ie(Vs, { connect: /* @__PURE__ */ __name(() => $c, "connect") });
function $c({ socket: r, servername: e }) {
  return r.startTls(e), r;
}
__name($c, "$c");
var zs = G(
  () => {
    "use strict";
    p();
    a($c, "connect");
  }
);
var En = T((Xh, Zs) => {
  "use strict";
  p();
  var Ks = (Fe(), O(wi)), Gc = ge().EventEmitter, { parse: Vc, serialize: Q } = vn(), Ys = Q.flush(), zc = Q.sync(), Kc = Q.end(), Sn = class Sn extends Gc {
    static {
      __name(this, "Sn");
    }
    constructor(e) {
      super(), e = e || {}, this.stream = e.stream || new Ks.Socket(), this._keepAlive = e.keepAlive, this._keepAliveInitialDelayMillis = e.keepAliveInitialDelayMillis, this.lastBuffer = false, this.parsedStatements = {}, this.ssl = e.ssl || false, this._ending = false, this._emitMessage = false;
      var t = this;
      this.on("newListener", function(n) {
        n === "message" && (t._emitMessage = true);
      });
    }
    connect(e, t) {
      var n = this;
      this._connecting = true, this.stream.setNoDelay(true), this.stream.connect(e, t), this.stream.once("connect", function() {
        n._keepAlive && n.stream.setKeepAlive(true, n._keepAliveInitialDelayMillis), n.emit("connect");
      });
      let i2 = a(function(s) {
        n._ending && (s.code === "ECONNRESET" || s.code === "EPIPE") || n.emit("error", s);
      }, "reportStreamError");
      if (this.stream.on("error", i2), this.stream.on("close", function() {
        n.emit("end");
      }), !this.ssl) return this.attachListeners(
        this.stream
      );
      this.stream.once("data", function(s) {
        var o = s.toString("utf8");
        switch (o) {
          case "S":
            break;
          case "N":
            return n.stream.end(), n.emit("error", new Error("The server does not support SSL connections"));
          default:
            return n.stream.end(), n.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        var u = (zs(), O(Vs));
        let c = { socket: n.stream };
        n.ssl !== true && (Object.assign(c, n.ssl), "key" in n.ssl && (c.key = n.ssl.key)), Ks.isIP(t) === 0 && (c.servername = t);
        try {
          n.stream = u.connect(c);
        } catch (l) {
          return n.emit(
            "error",
            l
          );
        }
        n.attachListeners(n.stream), n.stream.on("error", i2), n.emit("sslconnect");
      });
    }
    attachListeners(e) {
      e.on(
        "end",
        () => {
          this.emit("end");
        }
      ), Vc(e, (t) => {
        var n = t.name === "error" ? "errorMessage" : t.name;
        this._emitMessage && this.emit("message", t), this.emit(n, t);
      });
    }
    requestSsl() {
      this.stream.write(Q.requestSsl());
    }
    startup(e) {
      this.stream.write(Q.startup(e));
    }
    cancel(e, t) {
      this._send(Q.cancel(e, t));
    }
    password(e) {
      this._send(Q.password(e));
    }
    sendSASLInitialResponseMessage(e, t) {
      this._send(Q.sendSASLInitialResponseMessage(e, t));
    }
    sendSCRAMClientFinalMessage(e) {
      this._send(Q.sendSCRAMClientFinalMessage(
        e
      ));
    }
    _send(e) {
      return this.stream.writable ? this.stream.write(e) : false;
    }
    query(e) {
      this._send(Q.query(e));
    }
    parse(e) {
      this._send(Q.parse(e));
    }
    bind(e) {
      this._send(Q.bind(e));
    }
    execute(e) {
      this._send(Q.execute(e));
    }
    flush() {
      this.stream.writable && this.stream.write(Ys);
    }
    sync() {
      this._ending = true, this._send(Ys), this._send(zc);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      if (this._ending = true, !this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(Kc, () => {
        this.stream.end();
      });
    }
    close(e) {
      this._send(Q.close(e));
    }
    describe(e) {
      this._send(Q.describe(e));
    }
    sendCopyFromChunk(e) {
      this._send(Q.copyData(e));
    }
    endCopyFrom() {
      this._send(Q.copyDone());
    }
    sendCopyFail(e) {
      this._send(Q.copyFail(e));
    }
  };
  a(Sn, "Connection");
  var xn = Sn;
  Zs.exports = xn;
});
var eo = T((np, Xs) => {
  "use strict";
  p();
  var Yc = ge().EventEmitter, rp = (it(), O(nt)), Zc = rt(), An = ds(), Jc = Cs(), Xc = At(), el = Rt(), Js = qs(), tl = tt(), rl = En(), Cn = class Cn extends Yc {
    static {
      __name(this, "Cn");
    }
    constructor(e) {
      super(), this.connectionParameters = new el(e), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(
        this,
        "password",
        { configurable: true, enumerable: false, writable: true, value: this.connectionParameters.password }
      ), this.replication = this.connectionParameters.replication;
      var t = e || {};
      this._Promise = t.Promise || b.Promise, this._types = new Xc(t.types), this._ending = false, this._connecting = false, this._connected = false, this._connectionError = false, this._queryable = true, this.connection = t.connection || new rl({ stream: t.stream, ssl: this.connectionParameters.ssl, keepAlive: t.keepAlive || false, keepAliveInitialDelayMillis: t.keepAliveInitialDelayMillis || 0, encoding: this.connectionParameters.client_encoding || "utf8" }), this.queryQueue = [], this.binary = t.binary || tl.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || false, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this._connectionTimeoutMillis = t.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(e) {
      let t = a((n) => {
        m.nextTick(() => {
          n.handleError(e, this.connection);
        });
      }, "enqueueError");
      this.activeQuery && (t(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t), this.queryQueue.length = 0;
    }
    _connect(e) {
      var t = this, n = this.connection;
      if (this._connectionCallback = e, this._connecting || this._connected) {
        let i2 = new Error("Client has already been connected. You cannot reuse a client.");
        m.nextTick(
          () => {
            e(i2);
          }
        );
        return;
      }
      this._connecting = true, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(() => {
        n._ending = true, n.stream.destroy(new Error("timeout expired"));
      }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
        t.ssl ? n.requestSsl() : n.startup(t.getStartupConf());
      }), n.on("sslconnect", function() {
        n.startup(t.getStartupConf());
      }), this._attachListeners(
        n
      ), n.once("end", () => {
        let i2 = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i2), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i2) : this._handleErrorEvent(i2) : this._connectionError || this._handleErrorEvent(i2)), m.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(e) {
      if (e) {
        this._connect(e);
        return;
      }
      return new this._Promise((t, n) => {
        this._connect((i2) => {
          i2 ? n(i2) : t();
        });
      });
    }
    _attachListeners(e) {
      e.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e.on("authenticationSASL", this._handleAuthSASL.bind(this)), e.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e.on("backendKeyData", this._handleBackendKeyData.bind(this)), e.on("error", this._handleErrorEvent.bind(this)), e.on("errorMessage", this._handleErrorMessage.bind(this)), e.on("readyForQuery", this._handleReadyForQuery.bind(this)), e.on("notice", this._handleNotice.bind(this)), e.on("rowDescription", this._handleRowDescription.bind(this)), e.on("dataRow", this._handleDataRow.bind(this)), e.on("portalSuspended", this._handlePortalSuspended.bind(
        this
      )), e.on("emptyQuery", this._handleEmptyQuery.bind(this)), e.on("commandComplete", this._handleCommandComplete.bind(this)), e.on("parseComplete", this._handleParseComplete.bind(this)), e.on("copyInResponse", this._handleCopyInResponse.bind(this)), e.on("copyData", this._handleCopyData.bind(this)), e.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(e) {
      let t = this.connection;
      typeof this.password == "function" ? this._Promise.resolve().then(() => this.password()).then((n) => {
        if (n !== void 0) {
          if (typeof n != "string") {
            t.emit("error", new TypeError(
              "Password must be a string"
            ));
            return;
          }
          this.connectionParameters.password = this.password = n;
        } else this.connectionParameters.password = this.password = null;
        e();
      }).catch((n) => {
        t.emit("error", n);
      }) : this.password !== null ? e() : Jc(
        this.connectionParameters,
        (n) => {
          n !== void 0 && (this.connectionParameters.password = this.password = n), e();
        }
      );
    }
    _handleAuthCleartextPassword(e) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(e) {
      this._checkPgPass(
        () => {
          let t = Zc.postgresMd5PasswordHash(this.user, this.password, e.salt);
          this.connection.password(t);
        }
      );
    }
    _handleAuthSASL(e) {
      this._checkPgPass(() => {
        this.saslSession = An.startSession(e.mechanisms), this.connection.sendSASLInitialResponseMessage(
          this.saslSession.mechanism,
          this.saslSession.response
        );
      });
    }
    _handleAuthSASLContinue(e) {
      An.continueSession(
        this.saslSession,
        this.password,
        e.data
      ), this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
    }
    _handleAuthSASLFinal(e) {
      An.finalizeSession(this.saslSession, e.data), this.saslSession = null;
    }
    _handleBackendKeyData(e) {
      this.processID = e.processID, this.secretKey = e.secretKey;
    }
    _handleReadyForQuery(e) {
      this._connecting && (this._connecting = false, this._connected = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
      let { activeQuery: t } = this;
      this.activeQuery = null, this.readyForQuery = true, t && t.handleReadyForQuery(this.connection), this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(e) {
      if (!this._connectionError) {
        if (this._connectionError = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback) return this._connectionCallback(e);
        this.emit("error", e);
      }
    }
    _handleErrorEvent(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      this._queryable = false, this._errorAllQueries(e), this.emit("error", e);
    }
    _handleErrorMessage(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      let t = this.activeQuery;
      if (!t) {
        this._handleErrorEvent(e);
        return;
      }
      this.activeQuery = null, t.handleError(
        e,
        this.connection
      );
    }
    _handleRowDescription(e) {
      this.activeQuery.handleRowDescription(e);
    }
    _handleDataRow(e) {
      this.activeQuery.handleDataRow(e);
    }
    _handlePortalSuspended(e) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(e) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(e) {
      this.activeQuery.handleCommandComplete(e, this.connection);
    }
    _handleParseComplete(e) {
      this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
    }
    _handleCopyInResponse(e) {
      this.activeQuery.handleCopyInResponse(this.connection);
    }
    _handleCopyData(e) {
      this.activeQuery.handleCopyData(
        e,
        this.connection
      );
    }
    _handleNotification(e) {
      this.emit("notification", e);
    }
    _handleNotice(e) {
      this.emit("notice", e);
    }
    getStartupConf() {
      var e = this.connectionParameters, t = { user: e.user, database: e.database }, n = e.application_name || e.fallback_application_name;
      return n && (t.application_name = n), e.replication && (t.replication = "" + e.replication), e.statement_timeout && (t.statement_timeout = String(parseInt(e.statement_timeout, 10))), e.lock_timeout && (t.lock_timeout = String(parseInt(e.lock_timeout, 10))), e.idle_in_transaction_session_timeout && (t.idle_in_transaction_session_timeout = String(parseInt(e.idle_in_transaction_session_timeout, 10))), e.options && (t.options = e.options), t;
    }
    cancel(e, t) {
      if (e.activeQuery === t) {
        var n = this.connection;
        this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
          n.cancel(
            e.processID,
            e.secretKey
          );
        });
      } else e.queryQueue.indexOf(t) !== -1 && e.queryQueue.splice(e.queryQueue.indexOf(t), 1);
    }
    setTypeParser(e, t, n) {
      return this._types.setTypeParser(e, t, n);
    }
    getTypeParser(e, t) {
      return this._types.getTypeParser(e, t);
    }
    escapeIdentifier(e) {
      return '"' + e.replace(/"/g, '""') + '"';
    }
    escapeLiteral(e) {
      for (var t = false, n = "'", i2 = 0; i2 < e.length; i2++) {
        var s = e[i2];
        s === "'" ? n += s + s : s === "\\" ? (n += s + s, t = true) : n += s;
      }
      return n += "'", t === true && (n = " E" + n), n;
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true) if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
        this.readyForQuery = false, this.hasExecuted = true;
        let e = this.activeQuery.submit(this.connection);
        e && m.nextTick(() => {
          this.activeQuery.handleError(e, this.connection), this.readyForQuery = true, this._pulseQueryQueue();
        });
      } else this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
    }
    query(e, t, n) {
      var i2, s, o, u, c;
      if (e == null) throw new TypeError(
        "Client was passed a null or undefined query"
      );
      return typeof e.submit == "function" ? (o = e.query_timeout || this.connectionParameters.query_timeout, s = i2 = e, typeof t == "function" && (i2.callback = i2.callback || t)) : (o = this.connectionParameters.query_timeout, i2 = new Js(e, t, n), i2.callback || (s = new this._Promise((l, f) => {
        i2.callback = (y, g) => y ? f(y) : l(g);
      }))), o && (c = i2.callback, u = setTimeout(() => {
        var l = new Error("Query read timeout");
        m.nextTick(
          () => {
            i2.handleError(l, this.connection);
          }
        ), c(l), i2.callback = () => {
        };
        var f = this.queryQueue.indexOf(i2);
        f > -1 && this.queryQueue.splice(f, 1), this._pulseQueryQueue();
      }, o), i2.callback = (l, f) => {
        clearTimeout(u), c(l, f);
      }), this.binary && !i2.binary && (i2.binary = true), i2._result && !i2._result._types && (i2._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(() => {
        i2.handleError(new Error("Client was closed and is not queryable"), this.connection);
      }), s) : (this.queryQueue.push(i2), this._pulseQueryQueue(), s) : (m.nextTick(() => {
        i2.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
      }), s);
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(e) {
      if (this._ending = true, !this.connection._connecting) if (e) e();
      else return this._Promise.resolve();
      if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e) this.connection.once("end", e);
      else return new this._Promise((t) => {
        this.connection.once("end", t);
      });
    }
  };
  a(Cn, "Client");
  var Ut = Cn;
  Ut.Query = Js;
  Xs.exports = Ut;
});
var io = T((op, no) => {
  "use strict";
  p();
  var nl = ge().EventEmitter, to = a(function() {
  }, "NOOP"), ro = a((r, e) => {
    let t = r.findIndex(e);
    return t === -1 ? void 0 : r.splice(t, 1)[0];
  }, "removeWhere"), Tn = class Tn {
    static {
      __name(this, "Tn");
    }
    constructor(e, t, n) {
      this.client = e, this.idleListener = t, this.timeoutId = n;
    }
  };
  a(Tn, "IdleItem");
  var _n = Tn, Pn = class Pn {
    static {
      __name(this, "Pn");
    }
    constructor(e) {
      this.callback = e;
    }
  };
  a(Pn, "PendingItem");
  var Qe = Pn;
  function il() {
    throw new Error("Release called on client which has already been released to the pool.");
  }
  __name(il, "il");
  a(il, "throwOnDoubleRelease");
  function Dt(r, e) {
    if (e)
      return { callback: e, result: void 0 };
    let t, n, i2 = a(function(o, u) {
      o ? t(o) : n(u);
    }, "cb"), s = new r(function(o, u) {
      n = o, t = u;
    }).catch((o) => {
      throw Error.captureStackTrace(o), o;
    });
    return { callback: i2, result: s };
  }
  __name(Dt, "Dt");
  a(Dt, "promisify");
  function sl(r, e) {
    return a(/* @__PURE__ */ __name(function t(n) {
      n.client = e, e.removeListener("error", t), e.on("error", () => {
        r.log(
          "additional client error after disconnection due to error",
          n
        );
      }), r._remove(e), r.emit("error", n, e);
    }, "t"), "idleListener");
  }
  __name(sl, "sl");
  a(sl, "makeIdleListener");
  var Rn = class Rn extends nl {
    static {
      __name(this, "Rn");
    }
    constructor(e, t) {
      super(), this.options = Object.assign({}, e), e != null && "password" in e && Object.defineProperty(this.options, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: e.password
      }), e != null && e.ssl && e.ssl.key && Object.defineProperty(this.options.ssl, "key", { enumerable: false }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.min = this.options.min || 0, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || false, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {
      }, this.Client = this.options.Client || t || ot().Client, this.Promise = this.options.Promise || b.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = /* @__PURE__ */ new WeakSet(), this._pendingQueue = [], this._endCallback = void 0, this.ending = false, this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _isAboveMin() {
      return this._clients.length > this.options.min;
    }
    _pulseQueue() {
      if (this.log("pulse queue"), this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log("pulse queue on ending"), this._idle.length && this._idle.slice().map((t) => {
          this._remove(t.client);
        }), this._clients.length || (this.ended = true, this._endCallback());
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull()) return;
      let e = this._pendingQueue.shift();
      if (this._idle.length) {
        let t = this._idle.pop();
        clearTimeout(
          t.timeoutId
        );
        let n = t.client;
        n.ref && n.ref();
        let i2 = t.idleListener;
        return this._acquireClient(n, e, i2, false);
      }
      if (!this._isFull()) return this.newClient(e);
      throw new Error("unexpected condition");
    }
    _remove(e) {
      let t = ro(
        this._idle,
        (n) => n.client === e
      );
      t !== void 0 && clearTimeout(t.timeoutId), this._clients = this._clients.filter(
        (n) => n !== e
      ), e.end(), this.emit("remove", e);
    }
    connect(e) {
      if (this.ending) {
        let i2 = new Error("Cannot use a pool after calling end on the pool");
        return e ? e(i2) : this.Promise.reject(i2);
      }
      let t = Dt(this.Promise, e), n = t.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length && m.nextTick(() => this._pulseQueue()), !this.options.connectionTimeoutMillis) return this._pendingQueue.push(new Qe(t.callback)), n;
        let i2 = a((u, c, l) => {
          clearTimeout(o), t.callback(u, c, l);
        }, "queueCallback"), s = new Qe(i2), o = setTimeout(() => {
          ro(
            this._pendingQueue,
            (u) => u.callback === i2
          ), s.timedOut = true, t.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        return o.unref && o.unref(), this._pendingQueue.push(s), n;
      }
      return this.newClient(new Qe(t.callback)), n;
    }
    newClient(e) {
      let t = new this.Client(this.options);
      this._clients.push(
        t
      );
      let n = sl(this, t);
      this.log("checking client timeout");
      let i2, s = false;
      this.options.connectionTimeoutMillis && (i2 = setTimeout(() => {
        this.log("ending client due to timeout"), s = true, t.connection ? t.connection.stream.destroy() : t.end();
      }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t.connect((o) => {
        if (i2 && clearTimeout(i2), t.on("error", n), o) this.log("client failed to connect", o), this._clients = this._clients.filter((u) => u !== t), s && (o = new Error("Connection terminated due to connection timeout", { cause: o })), this._pulseQueue(), e.timedOut || e.callback(o, void 0, to);
        else {
          if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
            let u = setTimeout(() => {
              this.log("ending client due to expired lifetime"), this._expired.add(t), this._idle.findIndex((l) => l.client === t) !== -1 && this._acquireClient(
                t,
                new Qe((l, f, y) => y()),
                n,
                false
              );
            }, this.options.maxLifetimeSeconds * 1e3);
            u.unref(), t.once("end", () => clearTimeout(u));
          }
          return this._acquireClient(t, e, n, true);
        }
      });
    }
    _acquireClient(e, t, n, i2) {
      i2 && this.emit("connect", e), this.emit("acquire", e), e.release = this._releaseOnce(e, n), e.removeListener("error", n), t.timedOut ? i2 && this.options.verify ? this.options.verify(e, e.release) : e.release() : i2 && this.options.verify ? this.options.verify(e, (s) => {
        if (s) return e.release(s), t.callback(s, void 0, to);
        t.callback(void 0, e, e.release);
      }) : t.callback(void 0, e, e.release);
    }
    _releaseOnce(e, t) {
      let n = false;
      return (i2) => {
        n && il(), n = true, this._release(e, t, i2);
      };
    }
    _release(e, t, n) {
      if (e.on("error", t), e._poolUseCount = (e._poolUseCount || 0) + 1, this.emit("release", n, e), n || this.ending || !e._queryable || e._ending || e._poolUseCount >= this.options.maxUses) {
        e._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e), this._pulseQueue();
        return;
      }
      if (this._expired.has(e)) {
        this.log("remove expired client"), this._expired.delete(e), this._remove(e), this._pulseQueue();
        return;
      }
      let s;
      this.options.idleTimeoutMillis && this._isAboveMin() && (s = setTimeout(() => {
        this.log("remove idle client"), this._remove(e);
      }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s.unref()), this.options.allowExitOnIdle && e.unref(), this._idle.push(new _n(
        e,
        t,
        s
      )), this._pulseQueue();
    }
    query(e, t, n) {
      if (typeof e == "function") {
        let s = Dt(this.Promise, e);
        return v(function() {
          return s.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        }), s.result;
      }
      typeof t == "function" && (n = t, t = void 0);
      let i2 = Dt(this.Promise, n);
      return n = i2.callback, this.connect((s, o) => {
        if (s) return n(s);
        let u = false, c = a((l) => {
          u || (u = true, o.release(l), n(l));
        }, "onError");
        o.once("error", c), this.log("dispatching query");
        try {
          o.query(e, t, (l, f) => {
            if (this.log("query dispatched"), o.removeListener(
              "error",
              c
            ), !u) return u = true, o.release(l), l ? n(l) : n(void 0, f);
          });
        } catch (l) {
          return o.release(l), n(l);
        }
      }), i2.result;
    }
    end(e) {
      if (this.log("ending"), this.ending) {
        let n = new Error("Called end on pool more than once");
        return e ? e(n) : this.Promise.reject(n);
      }
      this.ending = true;
      let t = Dt(this.Promise, e);
      return this._endCallback = t.callback, this._pulseQueue(), t.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((e, t) => e + (this._expired.has(t) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  };
  a(Rn, "Pool");
  var In = Rn;
  no.exports = In;
});
var so = {};
ie(so, { default: /* @__PURE__ */ __name(() => ol, "default") });
var ol;
var oo = G(() => {
  "use strict";
  p();
  ol = {};
});
var ao = T((lp, al) => {
  al.exports = { name: "pg", version: "8.8.0", description: "PostgreSQL client - pure javascript & libpq with the same API", keywords: [
    "database",
    "libpq",
    "pg",
    "postgre",
    "postgres",
    "postgresql",
    "rdbms"
  ], homepage: "https://github.com/brianc/node-postgres", repository: { type: "git", url: "git://github.com/brianc/node-postgres.git", directory: "packages/pg" }, author: "Brian Carlson <brian.m.carlson@gmail.com>", main: "./lib", dependencies: { "buffer-writer": "2.0.0", "packet-reader": "1.0.0", "pg-connection-string": "^2.5.0", "pg-pool": "^3.5.2", "pg-protocol": "^1.5.0", "pg-types": "^2.1.0", pgpass: "1.x" }, devDependencies: {
    async: "2.6.4",
    bluebird: "3.5.2",
    co: "4.6.0",
    "pg-copy-streams": "0.3.0"
  }, peerDependencies: { "pg-native": ">=3.0.1" }, peerDependenciesMeta: { "pg-native": { optional: true } }, scripts: { test: "make test-all" }, files: ["lib", "SPONSORS.md"], license: "MIT", engines: { node: ">= 8.0.0" }, gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655" };
});
var lo = T((fp, co) => {
  "use strict";
  p();
  var uo = ge().EventEmitter, ul = (it(), O(nt)), Bn = rt(), Ne = co.exports = function(r, e, t) {
    uo.call(this), r = Bn.normalizeQueryConfig(r, e, t), this.text = r.text, this.values = r.values, this.name = r.name, this.callback = r.callback, this.state = "new", this._arrayMode = r.rowMode === "array", this._emitRowEvents = false, this.on("newListener", function(n) {
      n === "row" && (this._emitRowEvents = true);
    }.bind(this));
  };
  ul.inherits(Ne, uo);
  var cl = { sqlState: "code", statementPosition: "position", messagePrimary: "message", context: "where", schemaName: "schema", tableName: "table", columnName: "column", dataTypeName: "dataType", constraintName: "constraint", sourceFile: "file", sourceLine: "line", sourceFunction: "routine" };
  Ne.prototype.handleError = function(r) {
    var e = this.native.pq.resultErrorFields();
    if (e) for (var t in e) {
      var n = cl[t] || t;
      r[n] = e[t];
    }
    this.callback ? this.callback(r) : this.emit("error", r), this.state = "error";
  };
  Ne.prototype.then = function(r, e) {
    return this._getPromise().then(
      r,
      e
    );
  };
  Ne.prototype.catch = function(r) {
    return this._getPromise().catch(r);
  };
  Ne.prototype._getPromise = function() {
    return this._promise ? this._promise : (this._promise = new Promise(function(r, e) {
      this._once("end", r), this._once("error", e);
    }.bind(this)), this._promise);
  };
  Ne.prototype.submit = function(r) {
    this.state = "running";
    var e = this;
    this.native = r.native, r.native.arrayMode = this._arrayMode;
    var t = a(function(s, o, u) {
      if (r.native.arrayMode = false, v(function() {
        e.emit("_done");
      }), s) return e.handleError(s);
      e._emitRowEvents && (u.length > 1 ? o.forEach(
        (c, l) => {
          c.forEach((f) => {
            e.emit("row", f, u[l]);
          });
        }
      ) : o.forEach(function(c) {
        e.emit("row", c, u);
      })), e.state = "end", e.emit("end", u), e.callback && e.callback(null, u);
    }, "after");
    if (m.domain && (t = m.domain.bind(t)), this.name) {
      this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", this.name, this.name.length), console.error("This can cause conflicts and silent errors executing queries"));
      var n = (this.values || []).map(Bn.prepareValue);
      if (r.namedQueries[this.name]) {
        if (this.text && r.namedQueries[this.name] !== this.text) {
          let s = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return t(s);
        }
        return r.native.execute(this.name, n, t);
      }
      return r.native.prepare(this.name, this.text, n.length, function(s) {
        return s ? t(s) : (r.namedQueries[e.name] = e.text, e.native.execute(e.name, n, t));
      });
    } else if (this.values) {
      if (!Array.isArray(
        this.values
      )) {
        let s = new Error("Query values must be an array");
        return t(s);
      }
      var i2 = this.values.map(Bn.prepareValue);
      r.native.query(this.text, i2, t);
    } else r.native.query(this.text, t);
  };
});
var yo = T((yp, po) => {
  "use strict";
  p();
  var ll = (oo(), O(so)), fl2 = At(), dp = ao(), fo = ge().EventEmitter, hl = (it(), O(nt)), pl = Rt(), ho = lo(), K = po.exports = function(r) {
    fo.call(this), r = r || {}, this._Promise = r.Promise || b.Promise, this._types = new fl2(r.types), this.native = new ll({ types: this._types }), this._queryQueue = [], this._ending = false, this._connecting = false, this._connected = false, this._queryable = true;
    var e = this.connectionParameters = new pl(r);
    this.user = e.user, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: e.password }), this.database = e.database, this.host = e.host, this.port = e.port, this.namedQueries = {};
  };
  K.Query = ho;
  hl.inherits(K, fo);
  K.prototype._errorAllQueries = function(r) {
    let e = a((t) => {
      m.nextTick(() => {
        t.native = this.native, t.handleError(r);
      });
    }, "enqueueError");
    this._hasActiveQuery() && (e(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e), this._queryQueue.length = 0;
  };
  K.prototype._connect = function(r) {
    var e = this;
    if (this._connecting) {
      m.nextTick(() => r(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true, this.connectionParameters.getLibpqConnectionString(function(t, n) {
      if (t) return r(t);
      e.native.connect(n, function(i2) {
        if (i2) return e.native.end(), r(i2);
        e._connected = true, e.native.on("error", function(s) {
          e._queryable = false, e._errorAllQueries(s), e.emit("error", s);
        }), e.native.on("notification", function(s) {
          e.emit("notification", { channel: s.relname, payload: s.extra });
        }), e.emit("connect"), e._pulseQueryQueue(true), r();
      });
    });
  };
  K.prototype.connect = function(r) {
    if (r) {
      this._connect(r);
      return;
    }
    return new this._Promise((e, t) => {
      this._connect((n) => {
        n ? t(n) : e();
      });
    });
  };
  K.prototype.query = function(r, e, t) {
    var n, i2, s, o, u;
    if (r == null) throw new TypeError("Client was passed a null or undefined query");
    if (typeof r.submit == "function") s = r.query_timeout || this.connectionParameters.query_timeout, i2 = n = r, typeof e == "function" && (r.callback = e);
    else if (s = this.connectionParameters.query_timeout, n = new ho(r, e, t), !n.callback) {
      let c, l;
      i2 = new this._Promise((f, y) => {
        c = f, l = y;
      }), n.callback = (f, y) => f ? l(f) : c(y);
    }
    return s && (u = n.callback, o = setTimeout(() => {
      var c = new Error(
        "Query read timeout"
      );
      m.nextTick(() => {
        n.handleError(c, this.connection);
      }), u(c), n.callback = () => {
      };
      var l = this._queryQueue.indexOf(n);
      l > -1 && this._queryQueue.splice(l, 1), this._pulseQueryQueue();
    }, s), n.callback = (c, l) => {
      clearTimeout(o), u(c, l);
    }), this._queryable ? this._ending ? (n.native = this.native, m.nextTick(() => {
      n.handleError(
        new Error("Client was closed and is not queryable")
      );
    }), i2) : (this._queryQueue.push(n), this._pulseQueryQueue(), i2) : (n.native = this.native, m.nextTick(() => {
      n.handleError(new Error("Client has encountered a connection error and is not queryable"));
    }), i2);
  };
  K.prototype.end = function(r) {
    var e = this;
    this._ending = true, this._connected || this.once("connect", this.end.bind(this, r));
    var t;
    return r || (t = new this._Promise(function(n, i2) {
      r = a((s) => s ? i2(s) : n(), "cb");
    })), this.native.end(function() {
      e._errorAllQueries(new Error("Connection terminated")), m.nextTick(() => {
        e.emit("end"), r && r();
      });
    }), t;
  };
  K.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  K.prototype._pulseQueryQueue = function(r) {
    if (this._connected && !this._hasActiveQuery()) {
      var e = this._queryQueue.shift();
      if (!e) {
        r || this.emit("drain");
        return;
      }
      this._activeQuery = e, e.submit(this);
      var t = this;
      e.once("_done", function() {
        t._pulseQueryQueue();
      });
    }
  };
  K.prototype.cancel = function(r) {
    this._activeQuery === r ? this.native.cancel(function() {
    }) : this._queryQueue.indexOf(r) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r), 1);
  };
  K.prototype.ref = function() {
  };
  K.prototype.unref = function() {
  };
  K.prototype.setTypeParser = function(r, e, t) {
    return this._types.setTypeParser(
      r,
      e,
      t
    );
  };
  K.prototype.getTypeParser = function(r, e) {
    return this._types.getTypeParser(r, e);
  };
});
var Ln = T((gp, mo) => {
  "use strict";
  p();
  mo.exports = yo();
});
var ot = T((vp, at) => {
  "use strict";
  p();
  var dl = eo(), yl = tt(), ml = En(), wl = io(), { DatabaseError: gl } = vn(), bl = a(
    (r) => {
      var e;
      return e = class extends wl {
        static {
          __name(this, "e");
        }
        constructor(n) {
          super(n, r);
        }
      }, a(e, "BoundPool"), e;
    },
    "poolFactory"
  ), Fn = a(
    function(r) {
      this.defaults = yl, this.Client = r, this.Query = this.Client.Query, this.Pool = bl(this.Client), this._pools = [], this.Connection = ml, this.types = Je(), this.DatabaseError = gl;
    },
    "PG"
  );
  typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? at.exports = new Fn(Ln()) : (at.exports = new Fn(dl), Object.defineProperty(at.exports, "native", {
    configurable: true,
    enumerable: false,
    get() {
      var r = null;
      try {
        r = new Fn(Ln());
      } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") throw e;
      }
      return Object.defineProperty(at.exports, "native", { value: r }), r;
    }
  }));
});
p();
p();
Fe();
Zt();
p();
var pa = Object.defineProperty;
var da = Object.defineProperties;
var ya = Object.getOwnPropertyDescriptors;
var bi = Object.getOwnPropertySymbols;
var ma = Object.prototype.hasOwnProperty;
var wa = Object.prototype.propertyIsEnumerable;
var vi = a(
  (r, e, t) => e in r ? pa(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t,
  "__defNormalProp"
);
var ga = a((r, e) => {
  for (var t in e || (e = {})) ma.call(e, t) && vi(r, t, e[t]);
  if (bi) for (var t of bi(e)) wa.call(e, t) && vi(r, t, e[t]);
  return r;
}, "__spreadValues");
var ba = a((r, e) => da(r, ya(e)), "__spreadProps");
var va = 1008e3;
var xi = new Uint8Array(
  new Uint16Array([258]).buffer
)[0] === 2;
var xa = new TextDecoder();
var Jt = new TextEncoder();
var yt = Jt.encode("0123456789abcdef");
var mt = Jt.encode("0123456789ABCDEF");
var Sa = Jt.encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
var Si = Sa.slice();
Si[62] = 45;
Si[63] = 95;
var He;
var wt;
function Ea(r, { alphabet: e, scratchArr: t } = {}) {
  if (!He) if (He = new Uint16Array(256), wt = new Uint16Array(256), xi) for (let C = 0; C < 256; C++) He[C] = yt[C & 15] << 8 | yt[C >>> 4], wt[C] = mt[C & 15] << 8 | mt[C >>> 4];
  else for (let C = 0; C < 256; C++) He[C] = yt[C & 15] | yt[C >>> 4] << 8, wt[C] = mt[C & 15] | mt[C >>> 4] << 8;
  r.byteOffset % 4 !== 0 && (r = new Uint8Array(r));
  let n = r.length, i2 = n >>> 1, s = n >>> 2, o = t || new Uint16Array(n), u = new Uint32Array(
    r.buffer,
    r.byteOffset,
    s
  ), c = new Uint32Array(o.buffer, o.byteOffset, i2), l = e === "upper" ? wt : He, f = 0, y = 0, g;
  if (xi)
    for (; f < s; ) g = u[f++], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255];
  else for (; f < s; )
    g = u[f++], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255];
  for (f <<= 2; f < n; ) o[f] = l[r[f++]];
  return xa.decode(o.subarray(0, n));
}
__name(Ea, "Ea");
a(Ea, "_toHex");
function Aa(r, e = {}) {
  let t = "", n = r.length, i2 = va >>> 1, s = Math.ceil(n / i2), o = new Uint16Array(s > 1 ? i2 : n);
  for (let u = 0; u < s; u++) {
    let c = u * i2, l = c + i2;
    t += Ea(r.subarray(c, l), ba(ga(
      {},
      e
    ), { scratchArr: o }));
  }
  return t;
}
__name(Aa, "Aa");
a(Aa, "_toHexChunked");
function Ei(r, e = {}) {
  return e.alphabet !== "upper" && typeof r.toHex == "function" ? r.toHex() : Aa(r, e);
}
__name(Ei, "Ei");
a(Ei, "toHex");
p();
var gt = class gt2 {
  static {
    __name(this, "gt");
  }
  constructor(e, t) {
    this.strings = e;
    this.values = t;
  }
  toParameterizedQuery(e = { query: "", params: [] }) {
    let { strings: t, values: n } = this;
    for (let i2 = 0, s = t.length; i2 < s; i2++) if (e.query += t[i2], i2 < n.length) {
      let o = n[i2];
      if (o instanceof Ge) e.query += o.sql;
      else if (o instanceof Ce) if (o.queryData instanceof gt2) o.queryData.toParameterizedQuery(
        e
      );
      else {
        if (o.queryData.params?.length) throw new Error("This query is not composable");
        e.query += o.queryData.query;
      }
      else {
        let { params: u } = e;
        u.push(o), e.query += "$" + u.length, (o instanceof d || ArrayBuffer.isView(o)) && (e.query += "::bytea");
      }
    }
    return e;
  }
};
a(gt, "SqlTemplate");
var $e = gt;
var Xt = class Xt2 {
  static {
    __name(this, "Xt");
  }
  constructor(e) {
    this.sql = e;
  }
};
a(Xt, "UnsafeRawSql");
var Ge = Xt;
p();
function bt() {
  typeof window < "u" && typeof document < "u" && typeof console < "u" && typeof console.warn == "function" && console.warn(`          
        ************************************************************
        *                                                          *
        *  WARNING: Running SQL directly from the browser can have *
        *  security implications. Even if your database is         *
        *  protected by Row-Level Security (RLS), use it at your   *
        *  own risk. This approach is great for fast prototyping,  *
        *  but ensure proper safeguards are in place to prevent    *
        *  misuse or execution of expensive SQL queries by your    *
        *  end users.                                              *
        *                                                          *
        *  If you've assessed the risks, suppress this message     *
        *  using the disableWarningInBrowsers configuration        *
        *  parameter.                                              *
        *                                                          *
        ************************************************************`);
}
__name(bt, "bt");
a(bt, "warnIfBrowser");
Fe();
var as = Se(At());
var us = Se(rt());
var _t = class _t2 extends Error {
  static {
    __name(this, "_t");
  }
  constructor(t) {
    super(t);
    E(this, "name", "NeonDbError");
    E(this, "severity");
    E(this, "code");
    E(this, "detail");
    E(this, "hint");
    E(this, "position");
    E(this, "internalPosition");
    E(
      this,
      "internalQuery"
    );
    E(this, "where");
    E(this, "schema");
    E(this, "table");
    E(this, "column");
    E(this, "dataType");
    E(this, "constraint");
    E(this, "file");
    E(this, "line");
    E(this, "routine");
    E(this, "sourceError");
    "captureStackTrace" in Error && typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, _t2);
  }
};
a(
  _t,
  "NeonDbError"
);
var be = _t;
var is = "transaction() expects an array of queries, or a function returning an array of queries";
var Bu = ["severity", "code", "detail", "hint", "position", "internalPosition", "internalQuery", "where", "schema", "table", "column", "dataType", "constraint", "file", "line", "routine"];
function Lu(r) {
  return r instanceof d ? "\\x" + Ei(r) : r;
}
__name(Lu, "Lu");
a(Lu, "encodeBuffersAsBytea");
function ss(r) {
  let { query: e, params: t } = r instanceof $e ? r.toParameterizedQuery() : r;
  return { query: e, params: t.map((n) => Lu((0, us.prepareValue)(n))) };
}
__name(ss, "ss");
a(ss, "prepareQuery");
function cs(r, {
  arrayMode: e,
  fullResults: t,
  fetchOptions: n,
  isolationLevel: i2,
  readOnly: s,
  deferrable: o,
  authToken: u,
  disableWarningInBrowsers: c
} = {}) {
  if (!r) throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  let l;
  try {
    l = Yt(r);
  } catch {
    throw new Error(
      "Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r)
    );
  }
  let { protocol: f, username: y, hostname: g, port: A, pathname: C } = l;
  if (f !== "postgres:" && f !== "postgresql:" || !y || !g || !C) throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
  function D(P, ...I) {
    if (!(Array.isArray(P) && Array.isArray(P.raw) && Array.isArray(I))) throw new Error('This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).');
    return new Ce(
      Y,
      new $e(P, I)
    );
  }
  __name(D, "D");
  a(D, "templateFn"), D.query = (P, I, w) => new Ce(Y, { query: P, params: I ?? [] }, w), D.unsafe = (P) => new Ge(
    P
  ), D.transaction = async (P, I) => {
    if (typeof P == "function" && (P = P(D)), !Array.isArray(P)) throw new Error(is);
    P.forEach((W) => {
      if (!(W instanceof Ce)) throw new Error(is);
    });
    let w = P.map((W) => W.queryData), Z = P.map((W) => W.opts ?? {});
    return Y(w, Z, I);
  };
  async function Y(P, I, w) {
    let { fetchEndpoint: Z, fetchFunction: W } = ce, J = Array.isArray(
      P
    ) ? { queries: P.map((ee) => ss(ee)) } : ss(P), X = n ?? {}, se = e ?? false, oe = t ?? false, B = i2, j = s, le = o;
    w !== void 0 && (w.fetchOptions !== void 0 && (X = { ...X, ...w.fetchOptions }), w.arrayMode !== void 0 && (se = w.arrayMode), w.fullResults !== void 0 && (oe = w.fullResults), w.isolationLevel !== void 0 && (B = w.isolationLevel), w.readOnly !== void 0 && (j = w.readOnly), w.deferrable !== void 0 && (le = w.deferrable)), I !== void 0 && !Array.isArray(I) && I.fetchOptions !== void 0 && (X = { ...X, ...I.fetchOptions });
    let de = u;
    !Array.isArray(I) && I?.authToken !== void 0 && (de = I.authToken);
    let We = typeof Z == "function" ? Z(g, A, { jwtAuth: de !== void 0 }) : Z, fe = { "Neon-Connection-String": r, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" }, _e = await Fu(de);
    _e && (fe.Authorization = `Bearer ${_e}`), Array.isArray(P) && (B !== void 0 && (fe["Neon-Batch-Isolation-Level"] = B), j !== void 0 && (fe["Neon-Batch-Read-Only"] = String(j)), le !== void 0 && (fe["Neon-Batch-Deferrable"] = String(le))), c || ce.disableWarningInBrowsers || bt();
    let ye;
    try {
      ye = await (W ?? fetch)(We, { method: "POST", body: JSON.stringify(J), headers: fe, ...X });
    } catch (ee) {
      let M = new be(
        `Error connecting to database: ${ee}`
      );
      throw M.sourceError = ee, M;
    }
    if (ye.ok) {
      let ee = await ye.json();
      if (Array.isArray(P)) {
        let M = ee.results;
        if (!Array.isArray(M)) throw new be("Neon internal error: unexpected result format");
        return M.map(($, me) => {
          let Ot = I[me] ?? {}, vo = Ot.arrayMode ?? se, xo = Ot.fullResults ?? oe;
          return os(
            $,
            { arrayMode: vo, fullResults: xo, types: Ot.types }
          );
        });
      } else {
        let M = I ?? {}, $ = M.arrayMode ?? se, me = M.fullResults ?? oe;
        return os(ee, { arrayMode: $, fullResults: me, types: M.types });
      }
    } else {
      let { status: ee } = ye;
      if (ee === 400) {
        let M = await ye.json(), $ = new be(M.message);
        for (let me of Bu) $[me] = M[me] ?? void 0;
        throw $;
      } else {
        let M = await ye.text();
        throw new be(
          `Server error (HTTP status ${ee}): ${M}`
        );
      }
    }
  }
  __name(Y, "Y");
  return a(Y, "execute"), D;
}
__name(cs, "cs");
a(cs, "neon");
var dr = class dr2 {
  static {
    __name(this, "dr");
  }
  constructor(e, t, n) {
    this.execute = e;
    this.queryData = t;
    this.opts = n;
  }
  then(e, t) {
    return this.execute(this.queryData, this.opts).then(e, t);
  }
  catch(e) {
    return this.execute(this.queryData, this.opts).catch(e);
  }
  finally(e) {
    return this.execute(
      this.queryData,
      this.opts
    ).finally(e);
  }
};
a(dr, "NeonQueryPromise");
var Ce = dr;
function os(r, {
  arrayMode: e,
  fullResults: t,
  types: n
}) {
  let i2 = new as.default(n), s = r.fields.map((c) => c.name), o = r.fields.map((c) => i2.getTypeParser(
    c.dataTypeID
  )), u = e === true ? r.rows.map((c) => c.map((l, f) => l === null ? null : o[f](l))) : r.rows.map((c) => Object.fromEntries(
    c.map((l, f) => [s[f], l === null ? null : o[f](l)])
  ));
  return t ? (r.viaNeonFetch = true, r.rowAsArray = e, r.rows = u, r._parsers = o, r._types = i2, r) : u;
}
__name(os, "os");
a(os, "processQueryResult");
async function Fu(r) {
  if (typeof r == "string") return r;
  if (typeof r == "function") try {
    return await Promise.resolve(r());
  } catch (e) {
    let t = new be("Error getting auth token.");
    throw e instanceof Error && (t = new be(`Error getting auth token: ${e.message}`)), t;
  }
}
__name(Fu, "Fu");
a(Fu, "getAuthToken");
p();
var go = Se(ot());
p();
var wo = Se(ot());
var kn = class kn2 extends wo.Client {
  static {
    __name(this, "kn");
  }
  constructor(t) {
    super(t);
    this.config = t;
  }
  get neonConfig() {
    return this.connection.stream;
  }
  connect(t) {
    let { neonConfig: n } = this;
    n.forceDisablePgSSL && (this.ssl = this.connection.ssl = false), this.ssl && n.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
    let i2 = typeof this.config != "string" && this.config?.host !== void 0 || typeof this.config != "string" && this.config?.connectionString !== void 0 || m.env.PGHOST !== void 0, s = m.env.USER ?? m.env.USERNAME;
    if (!i2 && this.host === "localhost" && this.user === s && this.database === s && this.password === null) throw new Error(`No database host or connection string was set, and key parameters have default values (host: localhost, user: ${s}, db: ${s}, password: null). Is an environment variable missing? Alternatively, if you intended to connect with these parameters, please set the host to 'localhost' explicitly.`);
    let o = super.connect(t), u = n.pipelineTLS && this.ssl, c = n.pipelineConnect === "password";
    if (!u && !n.pipelineConnect) return o;
    let l = this.connection;
    if (u && l.on(
      "connect",
      () => l.stream.emit("data", "S")
    ), c) {
      l.removeAllListeners("authenticationCleartextPassword"), l.removeAllListeners("readyForQuery"), l.once("readyForQuery", () => l.on("readyForQuery", this._handleReadyForQuery.bind(this)));
      let f = this.ssl ? "sslconnect" : "connect";
      l.on(f, () => {
        this.neonConfig.disableWarningInBrowsers || bt(), this._handleAuthCleartextPassword(), this._handleReadyForQuery();
      });
    }
    return o;
  }
  async _handleAuthSASLContinue(t) {
    if (typeof crypto > "u" || crypto.subtle === void 0 || crypto.subtle.importKey === void 0) throw new Error("Cannot use SASL auth when `crypto.subtle` is not defined");
    let n = crypto.subtle, i2 = this.saslSession, s = this.password, o = t.data;
    if (i2.message !== "SASLInitialResponse" || typeof s != "string" || typeof o != "string") throw new Error(
      "SASL: protocol error"
    );
    let u = Object.fromEntries(o.split(",").map((M) => {
      if (!/^.=/.test(M)) throw new Error(
        "SASL: Invalid attribute pair entry"
      );
      let $ = M[0], me = M.substring(2);
      return [$, me];
    })), c = u.r, l = u.s, f = u.i;
    if (!c || !/^[!-+--~]+$/.test(c)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
    if (!l || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(l)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64"
    );
    if (!f || !/^[1-9][0-9]*$/.test(f)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count"
    );
    if (!c.startsWith(i2.clientNonce))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    if (c.length === i2.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    let y = parseInt(f, 10), g = d.from(l, "base64"), A = new TextEncoder(), C = A.encode(s), D = await n.importKey(
      "raw",
      C,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), Y = new Uint8Array(await n.sign("HMAC", D, d.concat(
      [g, d.from([0, 0, 0, 1])]
    ))), P = Y;
    for (var I = 0; I < y - 1; I++) Y = new Uint8Array(await n.sign("HMAC", D, Y)), P = d.from(
      P.map((M, $) => P[$] ^ Y[$])
    );
    let w = P, Z = await n.importKey(
      "raw",
      w,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), W = new Uint8Array(await n.sign("HMAC", Z, A.encode("Client Key"))), J = await n.digest(
      "SHA-256",
      W
    ), X = "n=*,r=" + i2.clientNonce, se = "r=" + c + ",s=" + l + ",i=" + y, oe = "c=biws,r=" + c, B = X + "," + se + "," + oe, j = await n.importKey(
      "raw",
      J,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    var le = new Uint8Array(await n.sign(
      "HMAC",
      j,
      A.encode(B)
    )), de = d.from(W.map((M, $) => W[$] ^ le[$])), We = de.toString("base64");
    let fe = await n.importKey(
      "raw",
      w,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), _e = await n.sign("HMAC", fe, A.encode("Server Key")), ye = await n.importKey("raw", _e, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    var ee = d.from(
      await n.sign("HMAC", ye, A.encode(B))
    );
    i2.message = "SASLResponse", i2.serverSignature = ee.toString("base64"), i2.response = oe + ",p=" + We, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
  }
};
a(
  kn,
  "NeonClient"
);
var ut = kn;
Fe();
var bo = Se(Rt());
function vl(r, e) {
  if (e) return { callback: e, result: void 0 };
  let t, n, i2 = a(function(o, u) {
    o ? t(o) : n(u);
  }, "cb"), s = new r(function(o, u) {
    n = o, t = u;
  });
  return { callback: i2, result: s };
}
__name(vl, "vl");
a(vl, "promisify");
var Un = class Un2 extends go.Pool {
  static {
    __name(this, "Un");
  }
  constructor() {
    super(...arguments);
    E(this, "Client", ut);
    E(this, "hasFetchUnsupportedListeners", false);
    E(this, "addListener", this.on);
  }
  on(t, n) {
    return t !== "error" && (this.hasFetchUnsupportedListeners = true), super.on(t, n);
  }
  query(t, n, i2) {
    if (!ce.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t == "function") return super.query(
      t,
      n,
      i2
    );
    typeof n == "function" && (i2 = n, n = void 0);
    let s = vl(this.Promise, i2);
    i2 = s.callback;
    try {
      let o = new bo.default(
        this.options
      ), u = encodeURIComponent, c = encodeURI, l = `postgresql://${u(o.user)}:${u(o.password)}@${u(o.host)}/${c(o.database)}`, f = typeof t == "string" ? t : t.text, y = n ?? t.values ?? [];
      cs(l, { fullResults: true, arrayMode: t.rowMode === "array" }).query(f, y, { types: t.types ?? this.options?.types }).then((A) => i2(void 0, A)).catch((A) => i2(
        A
      ));
    } catch (o) {
      i2(o);
    }
    return s.result;
  }
};
a(Un, "NeonPool");
Fe();
var ct = Se(ot());
var export_DatabaseError = ct.DatabaseError;
var export_defaults = ct.defaults;
var export_escapeIdentifier = ct.escapeIdentifier;
var export_escapeLiteral = ct.escapeLiteral;
var export_types = ct.types;

// ../../node_modules/.bun/fflate@0.8.3/node_modules/fflate/esm/browser.js
var ch2 = {};
var wk = /* @__PURE__ */ __name((function(c, id, msg, transfer, cb) {
  var w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
    c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
  ], { type: "text/javascript" }))));
  w.onmessage = function(e) {
    var d2 = e.data, ed = d2.$e$;
    if (ed) {
      var err2 = new Error(ed[0]);
      err2["code"] = ed[1];
      err2.stack = ed[2];
      cb(err2, null);
    } else
      cb(null, d2);
  };
  w.postMessage(msg, transfer);
  return w;
}), "wk");
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = /* @__PURE__ */ __name(function(eb, start) {
  var b3 = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b3[i2] = start += 1 << eb[i2 - 1];
  }
  var r = new i32(b3[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j = b3[i2]; j < b3[i2 + 1]; ++j) {
      r[j] = j - b3[i2] << 5 | i2;
    }
  }
  return { b: b3, r };
}, "freb");
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x2 = (i & 43690) >> 1 | (i & 21845) << 1;
  x2 = (x2 & 52428) >> 2 | (x2 & 13107) << 2;
  x2 = (x2 & 61680) >> 4 | (x2 & 3855) << 4;
  rev[i] = ((x2 & 65280) >> 8 | (x2 & 255) << 8) >> 1;
}
var x2;
var i;
var hMap = /* @__PURE__ */ __name((function(cd, mb, r) {
  var s = cd.length;
  var i2 = 0;
  var l = new u16(mb);
  for (; i2 < s; ++i2) {
    if (cd[i2])
      ++l[cd[i2] - 1];
  }
  var le = new u16(mb);
  for (i2 = 1; i2 < mb; ++i2) {
    le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v2 = le[cd[i2] - 1]++ << r_1;
        for (var m2 = v2 | (1 << r_1) - 1; v2 <= m2; ++v2) {
          co[rev[v2] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
      }
    }
  }
  return co;
}), "hMap");
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = /* @__PURE__ */ __name(function(a2) {
  var m2 = a2[0];
  for (var i2 = 1; i2 < a2.length; ++i2) {
    if (a2[i2] > m2)
      m2 = a2[i2];
  }
  return m2;
}, "max");
var bits = /* @__PURE__ */ __name(function(d2, p2, m2) {
  var o = p2 / 8 | 0;
  return (d2[o] | d2[o + 1] << 8) >> (p2 & 7) & m2;
}, "bits");
var bits16 = /* @__PURE__ */ __name(function(d2, p2) {
  var o = p2 / 8 | 0;
  return (d2[o] | d2[o + 1] << 8 | d2[o + 2] << 16) >> (p2 & 7);
}, "bits16");
var shft = /* @__PURE__ */ __name(function(p2) {
  return (p2 + 7) / 8 | 0;
}, "shft");
var slc = /* @__PURE__ */ __name(function(v2, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v2.length)
    e = v2.length;
  return new u8(v2.subarray(s, e));
}, "slc");
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = /* @__PURE__ */ __name(function(ind, msg, nt2) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt2)
    throw e;
  return e;
}, "err");
var inflt = /* @__PURE__ */ __name(function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = /* @__PURE__ */ __name(function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  }, "cbuf");
  var final = st.f || 0, pos = st.p || 0, bt2 = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt2 + l);
        buf.set(dat.subarray(s, t), bt2);
        st.b = bt2 += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i2 = 0; i2 < hcLen; ++i2) {
          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0; i2 < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i2++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i2++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt2 + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt2++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b3 = fleb[i2];
          add = bits(dat, pos, (1 << b3) - 1) + fl[i2];
          pos += b3;
        }
        var d2 = dm[bits16(dat, pos) & dms], dsym = d2 >> 4;
        if (!d2)
          err(3);
        pos += d2 & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b3 = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b3) - 1, pos += b3;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt2 + 131072);
        var end = bt2 + add;
        if (bt2 < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt2 < 0)
            err(3);
          for (; bt2 < dend; ++bt2)
            buf[bt2] = dict[shift + bt2];
        }
        for (; bt2 < end; ++bt2)
          buf[bt2] = buf[bt2 - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt2, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt2 != buf.length && noBuf ? slc(buf, 0, bt2) : buf.subarray(0, bt2);
}, "inflt");
var et2 = /* @__PURE__ */ new u8(0);
var mrg = /* @__PURE__ */ __name(function(a2, b3) {
  var o = {};
  for (var k in a2)
    o[k] = a2[k];
  for (var k in b3)
    o[k] = b3[k];
  return o;
}, "mrg");
var wcln = /* @__PURE__ */ __name(function(fn, fnStr, td2) {
  var dt = fn();
  var st = fn.toString();
  var ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/\s+/g, "").split(",");
  for (var i2 = 0; i2 < dt.length; ++i2) {
    var v2 = dt[i2], k = ks[i2];
    if (typeof v2 == "function") {
      fnStr += ";" + k + "=";
      var st_1 = v2.toString();
      if (v2.prototype) {
        if (st_1.indexOf("[native code]") != -1) {
          var spInd = st_1.indexOf(" ", 8) + 1;
          fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
        } else {
          fnStr += st_1;
          for (var t in v2.prototype)
            fnStr += ";" + k + ".prototype." + t + "=" + v2.prototype[t].toString();
        }
      } else
        fnStr += st_1;
    } else
      td2[k] = v2;
  }
  return fnStr;
}, "wcln");
var ch = [];
var cbfs = /* @__PURE__ */ __name(function(v2) {
  var tl = [];
  for (var k in v2) {
    if (v2[k].buffer) {
      tl.push((v2[k] = new v2[k].constructor(v2[k])).buffer);
    }
  }
  return tl;
}, "cbfs");
var wrkr = /* @__PURE__ */ __name(function(fns, init, id, cb) {
  if (!ch[id]) {
    var fnStr = "", td_1 = {}, m2 = fns.length - 1;
    for (var i2 = 0; i2 < m2; ++i2)
      fnStr = wcln(fns[i2], fnStr, td_1);
    ch[id] = { c: wcln(fns[m2], fnStr, td_1), e: td_1 };
  }
  var td2 = mrg({}, ch[id].e);
  return wk(ch[id].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + init.toString() + "}", id, td2, cbfs(td2), cb);
}, "wrkr");
var bInflt = /* @__PURE__ */ __name(function() {
  return [u8, u16, i32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gopt];
}, "bInflt");
var pbf = /* @__PURE__ */ __name(function(msg) {
  return postMessage(msg, [msg.buffer]);
}, "pbf");
var gopt = /* @__PURE__ */ __name(function(o) {
  return o && {
    out: o.size && new u8(o.size),
    dictionary: o.dictionary
  };
}, "gopt");
var cbify = /* @__PURE__ */ __name(function(dat, opts, fns, init, id, cb) {
  var w = wrkr(fns, init, id, function(err2, dat2) {
    w.terminate();
    cb(err2, dat2);
  });
  w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
  return function() {
    w.terminate();
  };
}, "cbify");
var b2 = /* @__PURE__ */ __name(function(d2, b3) {
  return d2[b3] | d2[b3 + 1] << 8;
}, "b2");
var b4 = /* @__PURE__ */ __name(function(d2, b3) {
  return (d2[b3] | d2[b3 + 1] << 8 | d2[b3 + 2] << 16 | d2[b3 + 3] << 24) >>> 0;
}, "b4");
var b8 = /* @__PURE__ */ __name(function(d2, b3) {
  return b4(d2, b3) + b4(d2, b3 + 4) * 4294967296;
}, "b8");
function inflate(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  return cbify(data, opts, [
    bInflt
  ], function(ev) {
    return pbf(inflateSync(ev.data[0], gopt(ev.data[1])));
  }, 1, cb);
}
__name(inflate, "inflate");
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
__name(inflateSync, "inflateSync");
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et2, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = /* @__PURE__ */ __name(function(d2) {
  for (var r = "", i2 = 0; ; ) {
    var c = d2[i2++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i2 + eb > d2.length)
      return { s: r, r: slc(d2, i2 - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d2[i2++] & 63) << 12 | (d2[i2++] & 63) << 6 | d2[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d2[i2++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d2[i2++] & 63) << 6 | d2[i2++] & 63);
  }
}, "dutf8");
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i2 = 0; i2 < dat.length; i2 += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
__name(strFromU8, "strFromU8");
var slzh = /* @__PURE__ */ __name(function(d2, b3) {
  return b3 + 30 + b2(d2, b3 + 26) + b2(d2, b3 + 28);
}, "slzh");
var zh = /* @__PURE__ */ __name(function(d2, b3, z) {
  var fnl = b2(d2, b3 + 28), efl = b2(d2, b3 + 30), fn = strFromU8(d2.subarray(b3 + 46, b3 + 46 + fnl), !(b2(d2, b3 + 8) & 2048)), es2 = b3 + 46 + fnl;
  var _a2 = z64hs(d2, es2, efl, z, b4(d2, b3 + 20), b4(d2, b3 + 24), b4(d2, b3 + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d2, b3 + 10), sc, su, fn, es2 + efl + b2(d2, b3 + 32), off];
}, "zh");
var z64hs = /* @__PURE__ */ __name(function(d2, b3, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b3 + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b3 + 4 < e; b3 += 4 + b2(d2, b3 + 2)) {
      if (b2(d2, b3) == 1) {
        return [
          nsc ? b8(d2, b3 + 4 + 8 * nsu) : sc,
          nsu ? b8(d2, b3 + 4) : su,
          noff ? b8(d2, b3 + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
}, "z64hs");
var mt2 = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(fn) {
  fn();
};
function unzip(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  var term = [];
  var tAll = /* @__PURE__ */ __name(function() {
    for (var i3 = 0; i3 < term.length; ++i3)
      term[i3]();
  }, "tAll");
  var files = {};
  var cbd = /* @__PURE__ */ __name(function(a2, b3) {
    mt2(function() {
      cb(a2, b3);
    });
  }, "cbd");
  mt2(function() {
    cbd = cb;
  });
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558) {
      cbd(err(13, 0, 1), null);
      return tAll;
    }
  }
  ;
  var lft = b2(data, e + 8);
  if (lft) {
    var c = lft;
    var o = b4(data, e + 16);
    var z = b4(data, e - 20) == 117853008;
    if (z) {
      var ze = b4(data, e - 12);
      z = b4(data, ze) == 101075792;
      if (z) {
        c = lft = b4(data, ze + 32);
        o = b4(data, ze + 48);
      }
    }
    var fltr = opts && opts.filter;
    var _loop_3 = /* @__PURE__ */ __name(function(i3) {
      var _a2 = zh(data, o, z), c_1 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b3 = slzh(data, off);
      o = no;
      var cbl = /* @__PURE__ */ __name(function(e2, d2) {
        if (e2) {
          tAll();
          cbd(e2, null);
        } else {
          if (d2)
            files[fn] = d2;
          if (!--lft)
            cbd(null, files);
        }
      }, "cbl");
      if (!fltr || fltr({
        name: fn,
        size: sc,
        originalSize: su,
        compression: c_1
      })) {
        if (!c_1)
          cbl(null, slc(data, b3, b3 + sc));
        else if (c_1 == 8) {
          var infl = data.subarray(b3, b3 + sc);
          if (su < 524288 || sc > 0.8 * su) {
            try {
              cbl(null, inflateSync(infl, { out: new u8(su) }));
            } catch (e2) {
              cbl(e2, null);
            }
          } else
            term.push(inflate(infl, { size: su }, cbl));
        } else
          cbl(err(14, "unknown compression type " + c_1, 1), null);
      } else
        cbl(null, null);
    }, "_loop_3");
    for (var i2 = 0; i2 < c; ++i2) {
      _loop_3(i2);
    }
  } else
    cbd(null, {});
  return tAll;
}
__name(unzip, "unzip");
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i2 = 0; i2 < c; ++i2) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b3 = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b3, b3 + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b3, b3 + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}
__name(unzipSync, "unzipSync");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/saxen/parser.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
__name(_typeof, "_typeof");
function Parser_(options) {
  var fromCharCode = String.fromCharCode;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var ENTITY_PATTERN = /&#(\d+);|&#x([0-9a-f]+);|&(\w+);/ig;
  var ENTITY_MAPPING = {
    "amp": "&",
    "apos": "'",
    "gt": ">",
    "lt": "<",
    "quot": '"'
  };
  Object.keys(ENTITY_MAPPING).forEach(function(k) {
    ENTITY_MAPPING[k.toUpperCase()] = ENTITY_MAPPING[k];
  });
  function replaceEntities(_, d2, x3, z) {
    if (z) {
      if (hasOwnProperty.call(ENTITY_MAPPING, z)) {
        return ENTITY_MAPPING[z];
      } else {
        return "&" + z + ";";
      }
    }
    if (d2) {
      return fromCharCode(d2);
    }
    return fromCharCode(parseInt(x3, 16));
  }
  __name(replaceEntities, "replaceEntities");
  function decodeEntities(s) {
    if (s.length > 3 && s.indexOf("&") !== -1) {
      return s.replace(ENTITY_PATTERN, replaceEntities);
    }
    return s;
  }
  __name(decodeEntities, "decodeEntities");
  var NON_WHITESPACE_OUTSIDE_ROOT_NODE = "non-whitespace outside of root node";
  function error(msg) {
    return new Error(msg);
  }
  __name(error, "error");
  function missingNamespaceForPrefix(prefix) {
    return "missing namespace for prefix <" + prefix + ">";
  }
  __name(missingNamespaceForPrefix, "missingNamespaceForPrefix");
  function getter(getFn) {
    return {
      "get": getFn,
      "enumerable": true
    };
  }
  __name(getter, "getter");
  function cloneNsMatrix(nsMatrix) {
    var clone = {}, key;
    for (key in nsMatrix) {
      clone[key] = nsMatrix[key];
    }
    return clone;
  }
  __name(cloneNsMatrix, "cloneNsMatrix");
  var NAME_CACHE = /* @__PURE__ */ Symbol("nameCache");
  function uriPrefix(prefix) {
    return prefix + "$uri";
  }
  __name(uriPrefix, "uriPrefix");
  function buildNsMatrix(nsUriToPrefix) {
    var nsMatrix = {}, uri, prefix;
    for (uri in nsUriToPrefix) {
      prefix = nsUriToPrefix[uri];
      nsMatrix[prefix] = prefix;
      nsMatrix[uriPrefix(prefix)] = uri;
    }
    return nsMatrix;
  }
  __name(buildNsMatrix, "buildNsMatrix");
  function noopGetContext() {
    return {
      line: 0,
      column: 0
    };
  }
  __name(noopGetContext, "noopGetContext");
  function throwFunc(err2) {
    throw err2;
  }
  __name(throwFunc, "throwFunc");
  function Parser(options2) {
    if (!this) {
      return new Parser(options2);
    }
    var proxy = options2 && options2["proxy"];
    var onText, onOpenTag, onCloseTag, onCDATA, onError = throwFunc, onWarning, onComment, onQuestion, onAttention;
    var getContext = noopGetContext;
    var streaming = false;
    var rootTagFound = false;
    var leftoverXml = "";
    var maybeNS = false;
    var isNamespace = false;
    var returnError = null;
    var parseStop = false;
    var nsMatrixStack, nsMatrix, nodeStack;
    var nsUriToPrefix;
    function handleError(err2) {
      if (!(err2 instanceof Error)) {
        err2 = error(err2);
      }
      returnError = err2;
      onError(err2, getContext);
    }
    __name(handleError, "handleError");
    function handleWarning(err2) {
      if (!onWarning) {
        return;
      }
      if (!(err2 instanceof Error)) {
        err2 = error(err2);
      }
      onWarning(err2, getContext);
    }
    __name(handleWarning, "handleWarning");
    this["on"] = function(name, cb) {
      if (typeof cb !== "function") {
        throw error("required args <name, cb>");
      }
      switch (name) {
        case "openTag":
          onOpenTag = cb;
          break;
        case "text":
          onText = cb;
          break;
        case "closeTag":
          onCloseTag = cb;
          break;
        case "error":
          onError = cb;
          break;
        case "warn":
          onWarning = cb;
          break;
        case "cdata":
          onCDATA = cb;
          break;
        case "attention":
          onAttention = cb;
          break;
        // <!XXXXX zzzz="eeee">
        case "question":
          onQuestion = cb;
          break;
        // <? ....  ?>
        case "comment":
          onComment = cb;
          break;
        default:
          throw error("unsupported event: " + name);
      }
      return this;
    };
    this["ns"] = function(nsMap) {
      if (typeof nsMap === "undefined") {
        nsMap = {};
      }
      if (_typeof(nsMap) !== "object") {
        throw error("required args <nsMap={}>");
      }
      var _nsUriToPrefix = {}, k;
      for (k in nsMap) {
        _nsUriToPrefix[k] = nsMap[k];
      }
      isNamespace = true;
      nsUriToPrefix = _nsUriToPrefix;
      return this;
    };
    function resetState() {
      nsMatrixStack = isNamespace ? [] : null;
      nsMatrix = isNamespace ? buildNsMatrix(nsUriToPrefix) : null;
      nodeStack = [];
      getContext = noopGetContext;
      parseStop = false;
      returnError = null;
      rootTagFound = false;
      leftoverXml = "";
    }
    __name(resetState, "resetState");
    this["parse"] = function(xml) {
      if (typeof xml !== "string") {
        throw error("required args <xml=string>");
      }
      if (streaming) {
        throw error("parse during stream; call end() first");
      }
      resetState();
      parse(xml);
      getContext = noopGetContext;
      parseStop = false;
      return returnError;
    };
    this["write"] = function(xml) {
      if (typeof xml !== "string") {
        throw error("required args <xml=string>");
      }
      if (!streaming) {
        resetState();
        streaming = true;
      }
      if (!returnError) {
        leftoverXml = parse(leftoverXml + xml, true) || "";
      }
      return this;
    };
    this["end"] = function() {
      if (!streaming) {
        resetState();
      }
      streaming = false;
      if (!returnError) {
        parse(leftoverXml);
      }
      leftoverXml = "";
      getContext = noopGetContext;
      parseStop = false;
      return returnError;
    };
    this["stop"] = function() {
      parseStop = true;
    };
    function parse(xml) {
      var streaming2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
      var elNameCache = null, elNameCacheMatrix = null;
      var _nsMatrix, anonymousNsCount = 0, tagStart = false, tagEnd = false, i2 = 0, j = 0, x3, y, q, w, v2, xmlns, elementName, _elementName, elementProxy;
      var attrsString = "", attrsStart = 0, cachedAttrs;
      function normalizeAttrName(name, defaultAlias) {
        var w2 = name.indexOf(":");
        if (w2 === -1) {
          return name;
        }
        var nsName = nsMatrix[name.substring(0, w2)];
        if (!nsName) {
          handleWarning(missingNamespaceForPrefix(name.substring(0, w2)));
          return null;
        }
        return defaultAlias === nsName ? name.substr(w2 + 1) : nsName + name.substr(w2);
      }
      __name(normalizeAttrName, "normalizeAttrName");
      function getAttrs() {
        if (cachedAttrs !== null) {
          return cachedAttrs;
        }
        var nsUri, nsUriPrefix, defaultAlias = isNamespace && nsMatrix["xmlns"], attrList = isNamespace && maybeNS ? [] : null, i3 = attrsStart, s = attrsString, l = s.length, hasNewMatrix, newalias, value, alias, name, attrs = {}, seenAttrs = /* @__PURE__ */ new Set(), skipAttr, w2, j2;
        parseAttr: for (; i3 < l; i3++) {
          skipAttr = false;
          w2 = s.charCodeAt(i3);
          if (w2 === 32 || w2 < 14 && w2 > 8) {
            continue;
          }
          if (w2 < 65 || w2 > 122 || w2 > 90 && w2 < 97) {
            if (w2 !== 95 && w2 !== 58) {
              handleWarning("illegal first char attribute name");
              skipAttr = true;
            }
          }
          for (j2 = i3 + 1; j2 < l; j2++) {
            w2 = s.charCodeAt(j2);
            if (w2 > 96 && w2 < 123 || w2 > 64 && w2 < 91 || w2 > 47 && w2 < 59 || w2 === 46 || // '.'
            w2 === 45 || // '-'
            w2 === 95) {
              continue;
            }
            if (w2 === 32 || w2 < 14 && w2 > 8) {
              handleWarning("missing attribute value");
              i3 = j2;
              continue parseAttr;
            }
            if (w2 === 61) {
              break;
            }
            handleWarning("illegal attribute name char");
            skipAttr = true;
          }
          name = s.substring(i3, j2);
          if (name === "xmlns:xmlns") {
            handleWarning("illegal declaration of xmlns");
            skipAttr = true;
          }
          w2 = s.charCodeAt(j2 + 1);
          if (w2 === 34) {
            j2 = s.indexOf('"', i3 = j2 + 2);
            if (j2 === -1) {
              j2 = s.indexOf("'", i3);
              if (j2 !== -1) {
                handleWarning("attribute value quote missmatch");
                skipAttr = true;
              }
            }
          } else if (w2 === 39) {
            j2 = s.indexOf("'", i3 = j2 + 2);
            if (j2 === -1) {
              j2 = s.indexOf('"', i3);
              if (j2 !== -1) {
                handleWarning("attribute value quote missmatch");
                skipAttr = true;
              }
            }
          } else {
            handleWarning("missing attribute value quotes");
            skipAttr = true;
            for (j2 = j2 + 1; j2 < l; j2++) {
              w2 = s.charCodeAt(j2 + 1);
              if (w2 === 32 || w2 < 14 && w2 > 8) {
                break;
              }
            }
          }
          if (j2 === -1) {
            handleWarning("missing closing quotes");
            j2 = l;
            skipAttr = true;
          }
          if (!skipAttr) {
            value = s.substring(i3, j2);
          }
          i3 = j2;
          for (; j2 + 1 < l; j2++) {
            w2 = s.charCodeAt(j2 + 1);
            if (w2 === 32 || w2 < 14 && w2 > 8) {
              break;
            }
            if (i3 === j2) {
              handleWarning("illegal character after attribute end");
              skipAttr = true;
            }
          }
          i3 = j2 + 1;
          if (skipAttr) {
            continue parseAttr;
          }
          if (seenAttrs.has(name)) {
            handleWarning("attribute <" + name + "> already defined");
            continue;
          }
          seenAttrs.add(name);
          if (!isNamespace) {
            attrs[name] = value;
            continue;
          }
          if (maybeNS) {
            newalias = name === "xmlns" ? "xmlns" : name.charCodeAt(0) === 120 && name.substr(0, 6) === "xmlns:" ? name.substr(6) : null;
            if (newalias !== null) {
              nsUri = decodeEntities(value);
              nsUriPrefix = uriPrefix(newalias);
              alias = nsUriToPrefix[nsUri];
              if (!alias) {
                if (newalias === "xmlns" || nsUriPrefix in nsMatrix && nsMatrix[nsUriPrefix] !== nsUri) {
                  do {
                    alias = "ns" + anonymousNsCount++;
                  } while (typeof nsMatrix[alias] !== "undefined");
                } else {
                  alias = newalias;
                }
                nsUriToPrefix[nsUri] = alias;
              }
              if (nsMatrix[newalias] !== alias) {
                if (!hasNewMatrix) {
                  nsMatrix = cloneNsMatrix(nsMatrix);
                  hasNewMatrix = true;
                }
                nsMatrix[newalias] = alias;
                if (newalias === "xmlns") {
                  nsMatrix[uriPrefix(alias)] = nsUri;
                  defaultAlias = alias;
                }
                nsMatrix[nsUriPrefix] = nsUri;
              }
              attrs[name] = value;
              continue;
            }
            attrList.push(name, value);
            continue;
          }
          name = normalizeAttrName(name, defaultAlias);
          if (name === null) {
            continue;
          }
          attrs[name] = value;
        }
        if (maybeNS) {
          for (i3 = 0, l = attrList.length; i3 < l; i3++) {
            name = normalizeAttrName(attrList[i3++], defaultAlias);
            value = attrList[i3];
            if (name === null) {
              continue;
            }
            attrs[name] = value;
          }
        }
        return cachedAttrs = attrs;
      }
      __name(getAttrs, "getAttrs");
      function getParseContext() {
        var splitsRe = /(\r\n|\r|\n)/g;
        var line = 0;
        var column = 0;
        var startOfLine = 0;
        var endOfLine = j;
        var match;
        var data;
        while (i2 >= startOfLine) {
          match = splitsRe.exec(xml);
          if (!match) {
            break;
          }
          endOfLine = match[0].length + match.index;
          if (endOfLine > i2) {
            break;
          }
          line += 1;
          startOfLine = endOfLine;
        }
        if (i2 == -1) {
          column = endOfLine;
          data = xml.substring(j);
        } else if (j === 0) {
          data = xml.substring(j, i2);
        } else {
          column = i2 - startOfLine;
          data = j == -1 ? xml.substring(i2) : xml.substring(i2, j + 1);
        }
        return {
          "data": data,
          "line": line,
          "column": column
        };
      }
      __name(getParseContext, "getParseContext");
      getContext = getParseContext;
      if (proxy) {
        elementProxy = Object.create({}, {
          "name": getter(function() {
            return elementName;
          }),
          "originalName": getter(function() {
            return _elementName;
          }),
          "attrs": getter(getAttrs),
          "ns": getter(function() {
            return nsMatrix;
          })
        });
      }
      while (j !== -1) {
        if (xml.charCodeAt(j) === 60) {
          i2 = j;
        } else {
          i2 = xml.indexOf("<", j);
        }
        if (i2 === -1) {
          if (streaming2) {
            return xml.substring(j);
          }
          if (nodeStack.length) {
            return handleError("unexpected end of file");
          }
          if (!rootTagFound) {
            return handleError("missing start tag");
          }
          if (j < xml.length) {
            if (xml.substring(j).trim()) {
              handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
            }
          }
          return;
        }
        if (!rootTagFound) {
          rootTagFound = true;
        }
        if (j !== i2) {
          if (nodeStack.length) {
            if (onText) {
              onText(xml.substring(j, i2), decodeEntities, getContext);
              if (parseStop) {
                return;
              }
            }
          } else {
            if (xml.substring(j, i2).trim()) {
              handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
              if (parseStop) {
                return;
              }
            }
          }
        }
        w = xml.charCodeAt(i2 + 1);
        if (w === 33) {
          q = xml.charCodeAt(i2 + 2);
          if (q === 91 && xml.substr(i2 + 3, 6) === "CDATA[") {
            j = xml.indexOf("]]>", i2);
            if (j === -1) {
              if (streaming2) {
                return xml.substring(i2);
              }
              return handleError("unclosed cdata");
            }
            if (onCDATA) {
              onCDATA(xml.substring(i2 + 9, j), getContext);
              if (parseStop) {
                return;
              }
            }
            j += 3;
            continue;
          }
          if (q === 45 && xml.charCodeAt(i2 + 3) === 45) {
            j = xml.indexOf("-->", i2);
            if (j === -1) {
              if (streaming2) {
                return xml.substring(i2);
              }
              return handleError("unclosed comment");
            }
            if (onComment) {
              onComment(xml.substring(i2 + 4, j), decodeEntities, getContext);
              if (parseStop) {
                return;
              }
            }
            j += 3;
            continue;
          }
        }
        if (w === 63) {
          j = xml.indexOf("?>", i2);
          if (j === -1) {
            if (streaming2) {
              return xml.substring(i2);
            }
            return handleError("unclosed question");
          }
          if (onQuestion) {
            onQuestion(xml.substring(i2, j + 2), getContext);
            if (parseStop) {
              return;
            }
          }
          j += 2;
          continue;
        }
        for (x3 = i2 + 1; ; x3++) {
          v2 = xml.charCodeAt(x3);
          if (isNaN(v2)) {
            if (streaming2) {
              return xml.substring(i2);
            }
            j = -1;
            return handleError("unclosed tag");
          }
          if (v2 === 34) {
            q = xml.indexOf('"', x3 + 1);
            x3 = q !== -1 ? q : x3;
          } else if (v2 === 39) {
            q = xml.indexOf("'", x3 + 1);
            x3 = q !== -1 ? q : x3;
          } else if (v2 === 62) {
            j = x3;
            break;
          }
        }
        if (w === 33) {
          if (onAttention) {
            onAttention(xml.substring(i2, j + 1), decodeEntities, getContext);
            if (parseStop) {
              return;
            }
          }
          j += 1;
          continue;
        }
        cachedAttrs = {};
        if (w === 47) {
          tagStart = false;
          tagEnd = true;
          if (!nodeStack.length) {
            return handleError("missing open tag");
          }
          x3 = elementName = nodeStack.pop();
          q = i2 + 2 + x3.length;
          if (xml.substring(i2 + 2, q) !== x3) {
            return handleError("closing tag mismatch");
          }
          for (; q < j; q++) {
            w = xml.charCodeAt(q);
            if (w === 32 || w > 8 && w < 14) {
              continue;
            }
            return handleError("close tag");
          }
        } else {
          if (xml.charCodeAt(j - 1) === 47) {
            x3 = elementName = xml.substring(i2 + 1, j - 1);
            tagStart = true;
            tagEnd = true;
          } else {
            x3 = elementName = xml.substring(i2 + 1, j);
            tagStart = true;
            tagEnd = false;
          }
          if (!(w > 96 && w < 123 || w > 64 && w < 91 || w === 95 || w === 58)) {
            return handleError("illegal first char nodeName");
          }
          for (q = 1, y = x3.length; q < y; q++) {
            w = x3.charCodeAt(q);
            if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w == 46) {
              continue;
            }
            if (w === 32 || w < 14 && w > 8) {
              elementName = x3.substring(0, q);
              cachedAttrs = null;
              break;
            }
            return handleError("invalid nodeName");
          }
          if (!tagEnd) {
            nodeStack.push(elementName);
          }
        }
        if (isNamespace) {
          _nsMatrix = nsMatrix;
          if (tagStart) {
            if (!tagEnd) {
              nsMatrixStack.push(_nsMatrix);
            }
            if (cachedAttrs === null) {
              if (maybeNS = x3.indexOf("xmlns", q) !== -1) {
                attrsStart = q;
                attrsString = x3;
                getAttrs();
                maybeNS = false;
              }
            }
          }
          _elementName = elementName;
          if (elNameCacheMatrix !== nsMatrix) {
            elNameCache = nsMatrix[NAME_CACHE];
            if (elNameCache === void 0) {
              elNameCache = nsMatrix[NAME_CACHE] = {};
            }
            elNameCacheMatrix = nsMatrix;
          }
          var _cachedName = elNameCache[elementName];
          if (_cachedName !== void 0) {
            elementName = _cachedName;
          } else {
            w = elementName.indexOf(":");
            if (w !== -1) {
              xmlns = nsMatrix[elementName.substring(0, w)];
              if (!xmlns) {
                return handleError("missing namespace on <" + _elementName + ">");
              }
              elementName = elementName.substr(w + 1);
            } else {
              xmlns = nsMatrix["xmlns"];
            }
            if (xmlns) {
              elementName = xmlns + ":" + elementName;
            }
            elNameCache[_elementName] = elementName;
          }
        }
        if (tagStart) {
          attrsStart = q;
          attrsString = x3;
          if (onOpenTag) {
            if (proxy) {
              onOpenTag(elementProxy, decodeEntities, tagEnd, getContext);
            } else {
              onOpenTag(elementName, getAttrs, decodeEntities, tagEnd, getContext);
            }
            if (parseStop) {
              return;
            }
          }
        }
        if (tagEnd) {
          if (onCloseTag) {
            onCloseTag(proxy ? elementProxy : elementName, decodeEntities, tagStart, getContext);
            if (parseStop) {
              return;
            }
          }
          if (isNamespace) {
            if (!tagStart) {
              nsMatrix = nsMatrixStack.pop();
            } else {
              nsMatrix = _nsMatrix;
            }
          }
        }
        j += 1;
      }
    }
    __name(parse, "parse");
  }
  __name(Parser, "Parser");
  return new Parser(options);
}
__name(Parser_, "Parser_");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xml/parseXmlStream.saxen.js
function parseXmlStream(state, onOpenTag, onCloseTag, onText) {
  var errored = false;
  var mustNotHaveErrored = /* @__PURE__ */ __name(function mustNotHaveErrored2() {
    if (errored) {
      throw new Error("Errored");
    }
  }, "mustNotHaveErrored");
  var resolvePromise;
  var parser = new Parser_();
  var write = /* @__PURE__ */ __name(function write2(xml) {
    mustNotHaveErrored();
    parser.write(xml);
  }, "write");
  var end = /* @__PURE__ */ __name(function end2() {
    mustNotHaveErrored();
    parser.end();
    resolvePromise();
  }, "end");
  var promise = new Promise(function(resolve, reject) {
    resolvePromise = resolve;
    var onerror = /* @__PURE__ */ __name(function onerror2(error) {
      errored = true;
      throw error;
    }, "onerror");
    var ontext = /* @__PURE__ */ __name(function ontext2(text2, decodeEntities) {
      if (onText) {
        onText(decodeEntities(text2), state);
      }
    }, "ontext");
    var onopentag = /* @__PURE__ */ __name(function onopentag2(elementName, getAttributes, decodeEntities, selfClosing, getContext) {
      if (onOpenTag) {
        var attributes = getAttributes();
        for (var name in attributes) {
          attributes[trimXmlnsPrefix(name, true)] = decodeEntities(attributes[name]);
        }
        onOpenTag(trimXmlnsPrefix(elementName), attributes, state);
      }
    }, "onopentag");
    var onclosetag = /* @__PURE__ */ __name(function onclosetag2(elementName) {
      if (onCloseTag) {
        onCloseTag(trimXmlnsPrefix(elementName), state);
      }
    }, "onclosetag");
    parser.on("error", onerror);
    parser.on("text", ontext);
    parser.on("openTag", onopentag);
    parser.on("closeTag", onclosetag);
  });
  return {
    promise,
    write,
    end
  };
}
__name(parseXmlStream, "parseXmlStream");
function trimXmlnsPrefix(string, isAttributeName) {
  var i2 = 0;
  while (i2 < string.length) {
    if (string[i2] === ":") {
      if (isAttributeName && i2 === 5 && string.slice(0, 5) === "xmlns") {
      } else {
        return string.slice(i2 + 1);
      }
    }
    i2++;
  }
  return string;
}
__name(trimXmlnsPrefix, "trimXmlnsPrefix");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/InvalidSpreadsheetError.js
function _typeof2(o) {
  "@babel/helpers - typeof";
  return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof2(o);
}
__name(_typeof2, "_typeof");
function _defineProperties(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
__name(_defineProperties, "_defineProperties");
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
__name(_createClass, "_createClass");
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof2(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey, "_toPropertyKey");
function _toPrimitive(input, hint) {
  if (_typeof2(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof2(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive, "_toPrimitive");
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
__name(_classCallCheck, "_classCallCheck");
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
__name(_inherits, "_inherits");
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return /* @__PURE__ */ __name(function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  }, "_createSuperInternal");
}
__name(_createSuper, "_createSuper");
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof2(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
__name(_possibleConstructorReturn, "_possibleConstructorReturn");
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
__name(_assertThisInitialized, "_assertThisInitialized");
function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper = /* @__PURE__ */ __name(function _wrapNativeSuper6(Class2) {
    if (Class2 === null || !_isNativeFunction(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct(Class2, arguments, _getPrototypeOf(this).constructor);
    }
    __name(Wrapper, "Wrapper");
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf(Wrapper, Class2);
  }, "_wrapNativeSuper");
  return _wrapNativeSuper(Class);
}
__name(_wrapNativeSuper, "_wrapNativeSuper");
function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct.bind();
  } else {
    _construct = /* @__PURE__ */ __name(function _construct6(Parent2, args2, Class2) {
      var a2 = [null];
      a2.push.apply(a2, args2);
      var Constructor = Function.bind.apply(Parent2, a2);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf(instance, Class2.prototype);
      return instance;
    }, "_construct");
  }
  return _construct.apply(null, arguments);
}
__name(_construct, "_construct");
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
__name(_isNativeReflectConstruct, "_isNativeReflectConstruct");
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
__name(_isNativeFunction, "_isNativeFunction");
function _setPrototypeOf(o, p2) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : /* @__PURE__ */ __name(function _setPrototypeOf6(o2, p3) {
    o2.__proto__ = p3;
    return o2;
  }, "_setPrototypeOf");
  return _setPrototypeOf(o, p2);
}
__name(_setPrototypeOf, "_setPrototypeOf");
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : /* @__PURE__ */ __name(function _getPrototypeOf6(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  }, "_getPrototypeOf");
  return _getPrototypeOf(o);
}
__name(_getPrototypeOf, "_getPrototypeOf");
var InvalidSpreadsheetError = /* @__PURE__ */ (function(_Error) {
  _inherits(InvalidSpreadsheetError2, _Error);
  var _super = _createSuper(InvalidSpreadsheetError2);
  function InvalidSpreadsheetError2(message) {
    var _this;
    _classCallCheck(this, InvalidSpreadsheetError2);
    _this = _super.call(this, message);
    _this.name = "InvalidSpreadsheetError";
    return _this;
  }
  __name(InvalidSpreadsheetError2, "InvalidSpreadsheetError");
  return _createClass(InvalidSpreadsheetError2);
})(/* @__PURE__ */ _wrapNativeSuper(Error));

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xml/parseXml.js
function parseXml(xml, state, onOpenTag, onCloseTag, onText, onProgress) {
  var parser = parseXmlStream(state, onOpenTag, onCloseTag, onText);
  if (onProgress) {
    parseXmlInChunks(parser, xml, onProgress);
  } else {
    parser.write(xml);
    parser.end();
  }
  return parser.promise.then(function(result) {
    return result;
  }, function(error) {
    var spreadsheetError = new InvalidSpreadsheetError(error.message);
    spreadsheetError.stack = error.stack;
    spreadsheetError.cause = error;
    throw spreadsheetError;
  });
  function parseXmlInChunks(parser2, xml2, onProgress2, nonBlocking) {
    var MAX_CHUNK_PROCESSING_TIME = 7;
    var INITIAL_CHUNK_SIZE = 64 * 1024;
    var chunksCount = 0;
    var chunkSize = INITIAL_CHUNK_SIZE;
    var parseNextChunk = /* @__PURE__ */ __name(function parseNextChunk2() {
      chunksCount++;
      var startedAt = Date.now();
      if (xml2.length > chunkSize) {
        parser2.write(xml2.slice(0, chunkSize));
        if (onProgress2) {
          onProgress2(false);
        }
        xml2 = xml2.slice(chunkSize);
        var chunkProcessingTime = Date.now() - startedAt;
        if (chunkProcessingTime < MAX_CHUNK_PROCESSING_TIME * 0.5) {
          chunkSize *= 2;
        } else if (chunkProcessingTime > MAX_CHUNK_PROCESSING_TIME) {
          chunkSize /= 2;
        }
        return true;
      } else {
        parser2.write(xml2);
        parser2.end();
        if (onProgress2) {
          onProgress2(true);
        }
        return false;
      }
    }, "parseNextChunk");
    var loop = /* @__PURE__ */ __name(function loop2() {
      if (parseNextChunk()) {
        if (nonBlocking) {
          if (typeof setImmediate !== "undefined") {
            setImmediate(loop2);
          } else {
            setTimeout(loop2, 0);
          }
        } else {
          loop2();
        }
      } else {
      }
    }, "loop");
    loop();
  }
  __name(parseXmlInChunks, "parseXmlInChunks");
}
__name(parseXml, "parseXml");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/zip/UnzipError.js
function _typeof3(o) {
  "@babel/helpers - typeof";
  return _typeof3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof3(o);
}
__name(_typeof3, "_typeof");
function _defineProperties2(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey2(descriptor.key), descriptor);
  }
}
__name(_defineProperties2, "_defineProperties");
function _createClass2(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties2(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties2(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
__name(_createClass2, "_createClass");
function _toPropertyKey2(arg) {
  var key = _toPrimitive2(arg, "string");
  return _typeof3(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey2, "_toPropertyKey");
function _toPrimitive2(input, hint) {
  if (_typeof3(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof3(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive2, "_toPrimitive");
function _classCallCheck2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
__name(_classCallCheck2, "_classCallCheck");
function _inherits2(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf2(subClass, superClass);
}
__name(_inherits2, "_inherits");
function _createSuper2(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct2();
  return /* @__PURE__ */ __name(function _createSuperInternal() {
    var Super = _getPrototypeOf2(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf2(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn2(this, result);
  }, "_createSuperInternal");
}
__name(_createSuper2, "_createSuper");
function _possibleConstructorReturn2(self, call) {
  if (call && (_typeof3(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized2(self);
}
__name(_possibleConstructorReturn2, "_possibleConstructorReturn");
function _assertThisInitialized2(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
__name(_assertThisInitialized2, "_assertThisInitialized");
function _wrapNativeSuper2(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper2 = /* @__PURE__ */ __name(function _wrapNativeSuper6(Class2) {
    if (Class2 === null || !_isNativeFunction2(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct2(Class2, arguments, _getPrototypeOf2(this).constructor);
    }
    __name(Wrapper, "Wrapper");
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf2(Wrapper, Class2);
  }, "_wrapNativeSuper");
  return _wrapNativeSuper2(Class);
}
__name(_wrapNativeSuper2, "_wrapNativeSuper");
function _construct2(Parent, args, Class) {
  if (_isNativeReflectConstruct2()) {
    _construct2 = Reflect.construct.bind();
  } else {
    _construct2 = /* @__PURE__ */ __name(function _construct6(Parent2, args2, Class2) {
      var a2 = [null];
      a2.push.apply(a2, args2);
      var Constructor = Function.bind.apply(Parent2, a2);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf2(instance, Class2.prototype);
      return instance;
    }, "_construct");
  }
  return _construct2.apply(null, arguments);
}
__name(_construct2, "_construct");
function _isNativeReflectConstruct2() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
__name(_isNativeReflectConstruct2, "_isNativeReflectConstruct");
function _isNativeFunction2(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
__name(_isNativeFunction2, "_isNativeFunction");
function _setPrototypeOf2(o, p2) {
  _setPrototypeOf2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : /* @__PURE__ */ __name(function _setPrototypeOf6(o2, p3) {
    o2.__proto__ = p3;
    return o2;
  }, "_setPrototypeOf");
  return _setPrototypeOf2(o, p2);
}
__name(_setPrototypeOf2, "_setPrototypeOf");
function _getPrototypeOf2(o) {
  _getPrototypeOf2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : /* @__PURE__ */ __name(function _getPrototypeOf6(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  }, "_getPrototypeOf");
  return _getPrototypeOf2(o);
}
__name(_getPrototypeOf2, "_getPrototypeOf");
var UnzipError = /* @__PURE__ */ (function(_Error) {
  _inherits2(UnzipError2, _Error);
  var _super = _createSuper2(UnzipError2);
  function UnzipError2() {
    _classCallCheck2(this, UnzipError2);
    return _super.apply(this, arguments);
  }
  __name(UnzipError2, "UnzipError");
  return _createClass2(UnzipError2);
})(/* @__PURE__ */ _wrapNativeSuper2(Error));
function createUnzipError(error) {
  var unzipError = new UnzipError(error.message);
  if (error.stack) {
    unzipError.stack = error.stack;
  }
  if (Error.captureStackTrace) {
    Error.captureStackTrace(unzipError, createUnzipError);
  }
  unzipError.cause = error;
  return unzipError;
}
__name(createUnzipError, "createUnzipError");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/zip/unzipFromArrayBuffer.js
function unzipFromArrayBuffer(input, options) {
  return unzipFromArrayBufferUsingFunction(input, options, unzipAsync, true);
}
__name(unzipFromArrayBuffer, "unzipFromArrayBuffer");
function unzipFromArrayBufferUsingFunction(input) {
  var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _filter = _ref.filter;
  var unzip2 = arguments.length > 2 ? arguments[2] : void 0;
  var isAsync = arguments.length > 3 ? arguments[3] : void 0;
  return unzip2(new Uint8Array(input), {
    // Ignore certain types of files.
    filter: /* @__PURE__ */ __name(function filter(file) {
      if (_filter) {
        return _filter({
          path: file.name
        });
      }
      return true;
    }, "filter")
  }).then(function(result) {
    return result;
  }, function(error) {
    if (isFlateError(error)) {
      throw createUnzipError(error);
    } else {
      throw error;
    }
  });
}
__name(unzipFromArrayBufferUsingFunction, "unzipFromArrayBufferUsingFunction");
function unzipAsync(archive) {
  return new Promise(function(resolve, reject) {
    unzip(archive, function(error, files) {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}
__name(unzipAsync, "unzipAsync");
function isFlateError(error) {
  return typeof error.code === "number";
}
__name(isFlateError, "isFlateError");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/file/InvalidInputError.js
function _typeof4(o) {
  "@babel/helpers - typeof";
  return _typeof4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof4(o);
}
__name(_typeof4, "_typeof");
function _defineProperties3(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey3(descriptor.key), descriptor);
  }
}
__name(_defineProperties3, "_defineProperties");
function _createClass3(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties3(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties3(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
__name(_createClass3, "_createClass");
function _toPropertyKey3(arg) {
  var key = _toPrimitive3(arg, "string");
  return _typeof4(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey3, "_toPropertyKey");
function _toPrimitive3(input, hint) {
  if (_typeof4(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof4(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive3, "_toPrimitive");
function _classCallCheck3(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
__name(_classCallCheck3, "_classCallCheck");
function _inherits3(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf3(subClass, superClass);
}
__name(_inherits3, "_inherits");
function _createSuper3(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct3();
  return /* @__PURE__ */ __name(function _createSuperInternal() {
    var Super = _getPrototypeOf3(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf3(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn3(this, result);
  }, "_createSuperInternal");
}
__name(_createSuper3, "_createSuper");
function _possibleConstructorReturn3(self, call) {
  if (call && (_typeof4(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized3(self);
}
__name(_possibleConstructorReturn3, "_possibleConstructorReturn");
function _assertThisInitialized3(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
__name(_assertThisInitialized3, "_assertThisInitialized");
function _wrapNativeSuper3(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper3 = /* @__PURE__ */ __name(function _wrapNativeSuper6(Class2) {
    if (Class2 === null || !_isNativeFunction3(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct3(Class2, arguments, _getPrototypeOf3(this).constructor);
    }
    __name(Wrapper, "Wrapper");
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf3(Wrapper, Class2);
  }, "_wrapNativeSuper");
  return _wrapNativeSuper3(Class);
}
__name(_wrapNativeSuper3, "_wrapNativeSuper");
function _construct3(Parent, args, Class) {
  if (_isNativeReflectConstruct3()) {
    _construct3 = Reflect.construct.bind();
  } else {
    _construct3 = /* @__PURE__ */ __name(function _construct6(Parent2, args2, Class2) {
      var a2 = [null];
      a2.push.apply(a2, args2);
      var Constructor = Function.bind.apply(Parent2, a2);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf3(instance, Class2.prototype);
      return instance;
    }, "_construct");
  }
  return _construct3.apply(null, arguments);
}
__name(_construct3, "_construct");
function _isNativeReflectConstruct3() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
__name(_isNativeReflectConstruct3, "_isNativeReflectConstruct");
function _isNativeFunction3(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
__name(_isNativeFunction3, "_isNativeFunction");
function _setPrototypeOf3(o, p2) {
  _setPrototypeOf3 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : /* @__PURE__ */ __name(function _setPrototypeOf6(o2, p3) {
    o2.__proto__ = p3;
    return o2;
  }, "_setPrototypeOf");
  return _setPrototypeOf3(o, p2);
}
__name(_setPrototypeOf3, "_setPrototypeOf");
function _getPrototypeOf3(o) {
  _getPrototypeOf3 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : /* @__PURE__ */ __name(function _getPrototypeOf6(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  }, "_getPrototypeOf");
  return _getPrototypeOf3(o);
}
__name(_getPrototypeOf3, "_getPrototypeOf");
var MESSAGES = {
  XLS_FILE_NOT_SUPPORTED: "You passed a legacy `.xls` file. Only `.xlsx` files are supported",
  FILE_NOT_SUPPORTED: "Doesn't look like an `.xlsx` file",
  INVALID_ZIP: "Couldn't unzip `.xlsx` file contents",
  NO_DATA: "No data"
};
var InvalidInputError = /* @__PURE__ */ (function(_Error) {
  _inherits3(InvalidInputError2, _Error);
  var _super = _createSuper3(InvalidInputError2);
  function InvalidInputError2(code, cause) {
    var _this;
    _classCallCheck3(this, InvalidInputError2);
    _this = _super.call(this, MESSAGES[code] || code);
    _this.code = code;
    _this.name = "InvalidInputError";
    _this.cause = cause;
    return _this;
  }
  __name(InvalidInputError2, "InvalidInputError");
  return _createClass3(InvalidInputError2);
})(/* @__PURE__ */ _wrapNativeSuper3(Error));

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/export/filterZipArchiveEntry.js
function filterZipArchiveEntry(_ref) {
  var path = _ref.path;
  return path.endsWith(".xml") || path.endsWith(".xml.rels");
}
__name(filterZipArchiveEntry, "filterZipArchiveEntry");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/file/createFileTypeDetector.js
var ZIP_FILE_SIGNATURE = [80, 75];
var XLS_FILE_SIGNATURE = [208, 207, 17, 224];
var FILE_TYPE_SIGNATURES = [ZIP_FILE_SIGNATURE, XLS_FILE_SIGNATURE];
var XLSX_FILE_TYPE = FILE_TYPE_SIGNATURES.indexOf(ZIP_FILE_SIGNATURE);
var XLS_FILE_TYPE = FILE_TYPE_SIGNATURES.indexOf(XLS_FILE_SIGNATURE);
function createFileTypeDetector() {
  var type;
  var possibleTypes = indexesOf(FILE_TYPE_SIGNATURES);
  var i2 = 0;
  return function(_byte) {
    if (isNaN(type)) {
      var t;
      possibleTypes = possibleTypes.filter(function(typeIndex) {
        if (_byte === FILE_TYPE_SIGNATURES[typeIndex][i2]) {
          if (FILE_TYPE_SIGNATURES[typeIndex].length === i2 + 1) {
            t = typeIndex;
          }
          return true;
        }
      });
      if (possibleTypes.length === 1) {
        type = t;
      } else if (possibleTypes.length === 0) {
        type = -1;
      }
    }
    i2++;
    return type;
  };
}
__name(createFileTypeDetector, "createFileTypeDetector");
function indexesOf(array) {
  var indexes = [];
  var i2 = 0;
  while (i2 < array.length) {
    indexes.push(i2);
    i2++;
  }
  return indexes;
}
__name(indexesOf, "indexesOf");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/file/validateLeadingBytes.js
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it2 = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it2) return (it2 = it2.call(o)).next.bind(it2);
  if (Array.isArray(o) || (it2 = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it2) o = it2;
    var i2 = 0;
    return function() {
      if (i2 >= o.length) return { done: true };
      return { done: false, value: o[i2++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
__name(_createForOfIteratorHelperLoose, "_createForOfIteratorHelperLoose");
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
__name(_unsupportedIterableToArray, "_unsupportedIterableToArray");
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
  return arr2;
}
__name(_arrayLikeToArray, "_arrayLikeToArray");
function validateLeadingBytes(bytes) {
  var fileTypeDetector = createFileTypeDetector();
  for (var _iterator = _createForOfIteratorHelperLoose(bytes), _step; !(_step = _iterator()).done; ) {
    var _byte = _step.value;
    if (validateByte(_byte, fileTypeDetector)) {
      return;
    }
  }
  noFileTypeCouldBeDetermined(bytes.length);
}
__name(validateLeadingBytes, "validateLeadingBytes");
function validateByte(_byte2, fileTypeDetector) {
  var fileType = fileTypeDetector(_byte2);
  if (fileType !== void 0) {
    if (fileType === XLS_FILE_TYPE) {
      throw new InvalidInputError("XLS_FILE_NOT_SUPPORTED");
    }
    if (fileType < 0) {
      throw new InvalidInputError("FILE_NOT_SUPPORTED");
    }
    return true;
  }
}
__name(validateByte, "validateByte");
function noFileTypeCouldBeDetermined(byteCount) {
  throw new InvalidInputError(byteCount === 0 ? "NO_DATA" : "FILE_NOT_SUPPORTED");
}
__name(noFileTypeCouldBeDetermined, "noFileTypeCouldBeDetermined");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/utility/checkpoint.js
var latestCheckpointTimestamp;
function checkpoint(name) {
  var now = Date.now();
  var shouldOutputLog = typeof global !== "undefined" ? Boolean(global.READ_EXCEL_FILE_CHECKPOINTS) : typeof window !== "undefined" ? Boolean(window.READ_EXCEL_FILE_CHECKPOINTS) : false;
  if (shouldOutputLog) {
    if (latestCheckpointTimestamp) {
      console.log("  -", now - latestCheckpointTimestamp, "ms");
    }
    console.log("*", name);
  }
  latestCheckpointTimestamp = now;
}
__name(checkpoint, "checkpoint");
function resetCheckpoint() {
  latestCheckpointTimestamp = void 0;
}
__name(resetCheckpoint, "resetCheckpoint");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/export/unpackXlsxFileUniversal.js
function unpackXlsxFile(input) {
  resetCheckpoint();
  checkpoint("unpack files");
  return getArrayBuffer(input).then(function(arrayBuffer) {
    validateLeadingBytes(new Uint8Array(arrayBuffer));
    return unzipFromArrayBuffer(arrayBuffer, {
      filter: filterZipArchiveEntry
    }).then(function(result) {
      return result;
    }, function(error) {
      if (error instanceof UnzipError) {
        throw new InvalidInputError("INVALID_ZIP", error.cause);
      } else {
        throw error;
      }
    });
  });
}
__name(unpackXlsxFile, "unpackXlsxFile");
function getArrayBuffer(input) {
  if (input instanceof Blob) {
    return input.arrayBuffer();
  }
  if (input instanceof ArrayBuffer) {
    return Promise.resolve(input);
  }
  throw new InvalidInputError("INPUT_TYPE_NOT_SUPPORTED");
}
__name(getArrayBuffer, "getArrayBuffer");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseSpreadsheetInfo.js
function parseSpreadsheetInfo(content, parseXml2) {
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, null, null).then(function() {
    return getResultFromState(state);
  });
  function createInitialState() {
    return {
      workbookPr: void 0,
      sheets: []
    };
  }
  __name(createInitialState, "createInitialState");
  function getResultFromState(state2) {
    return {
      epoch1904: state2.workbookPr ? state2.workbookPr.epoch1904 : false,
      sheets: state2.sheets
    };
  }
  __name(getResultFromState, "getResultFromState");
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "workbookPr") {
      if (!state2.workbookPr) {
        state2.workbookPr = {
          epoch1904: attributes.date1904 === "1"
        };
      }
    } else if (tagName === "sheet") {
      if (attributes.name) {
        state2.sheets.push({
          // `sheetId` attribute value is an arbitrary, `1`-based unique positive integer
          // assigned to a worksheet, typically starting at `1` for the first sheet.
          //  Deleting and adding new sheets might cause the sheetId values to become non-sequential.
          // For example, `sheetId`s could be `1`, `2`, `4`, if sheet `3` was deleted.
          id: Number(attributes.sheetId),
          name: attributes.name,
          relationId: attributes.id
        });
      }
    }
  }
  __name(onOpenTag, "onOpenTag");
}
__name(parseSpreadsheetInfo, "parseSpreadsheetInfo");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseFilePaths.js
function parseFilePaths(content, parseXml2) {
  var RELATIONSHIPS_BASE_URL_TRANSITIONAL_STANDARD = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
  var RELATIONSHIPS_BASE_URL_STRICT_STANDARD = "http://purl.oclc.org/ooxml/officeDocument/relationships/";
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, null, null).then(function() {
    return getResultFromState(state);
  });
  function createInitialState() {
    return {
      sheets: {},
      sharedStrings: void 0,
      styles: void 0
    };
  }
  __name(createInitialState, "createInitialState");
  function getResultFromState(state2) {
    return state2;
  }
  __name(getResultFromState, "getResultFromState");
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "Relationship") {
      addFilePathForRelation(state2, attributes.Id, attributes.Type, attributes.Target);
    }
  }
  __name(onOpenTag, "onOpenTag");
  function addFilePathForRelation(state2, id, type, target) {
    switch (type) {
      case RELATIONSHIPS_BASE_URL_TRANSITIONAL_STANDARD + "styles":
      case RELATIONSHIPS_BASE_URL_STRICT_STANDARD + "styles":
        state2.styles = getFilePathFromRelationTarget(target);
        break;
      case RELATIONSHIPS_BASE_URL_TRANSITIONAL_STANDARD + "sharedStrings":
      case RELATIONSHIPS_BASE_URL_STRICT_STANDARD + "sharedStrings":
        state2.sharedStrings = getFilePathFromRelationTarget(target);
        break;
      case RELATIONSHIPS_BASE_URL_TRANSITIONAL_STANDARD + "worksheet":
      case RELATIONSHIPS_BASE_URL_STRICT_STANDARD + "worksheet":
        state2.sheets[id] = getFilePathFromRelationTarget(target);
        break;
    }
  }
  __name(addFilePathForRelation, "addFilePathForRelation");
  function getFilePathFromRelationTarget(path) {
    if (path[0] === "/") {
      return path.slice("/".length);
    }
    return "xl/" + path;
  }
  __name(getFilePathFromRelationTarget, "getFilePathFromRelationTarget");
}
__name(parseFilePaths, "parseFilePaths");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseStyles.js
function _typeof5(o) {
  "@babel/helpers - typeof";
  return _typeof5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof5(o);
}
__name(_typeof5, "_typeof");
var _excluded = ["xfId"];
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
__name(ownKeys, "ownKeys");
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
__name(_objectSpread, "_objectSpread");
function _defineProperty(obj, key, value) {
  key = _toPropertyKey4(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
__name(_defineProperty, "_defineProperty");
function _toPropertyKey4(arg) {
  var key = _toPrimitive4(arg, "string");
  return _typeof5(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey4, "_toPropertyKey");
function _toPrimitive4(input, hint) {
  if (_typeof5(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof5(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive4, "_toPrimitive");
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i2;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
      key = sourceSymbolKeys[i2];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
__name(_objectWithoutProperties, "_objectWithoutProperties");
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i2;
  for (i2 = 0; i2 < sourceKeys.length; i2++) {
    key = sourceKeys[i2];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
__name(_objectWithoutPropertiesLoose, "_objectWithoutPropertiesLoose");
function parseStyles(content, parseXml2) {
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, onCloseTag, null).then(function() {
    return getResultFromState(state);
  });
  function createInitialState() {
    return {
      numberFormats: [],
      baseStyles: [],
      // The first `164` elements of the `styles` array are going to be `undefined`
      // because those represent the built-in "default" styles in `.xlsx` specification.
      // These "default" styles have IDs from `0` to `163`, i.e. according to their index.
      styles: [],
      cellStyleXfs: false,
      cellXfs: false
    };
  }
  __name(createInitialState, "createInitialState");
  function getResultFromState(state2) {
    return state2.styles.map(function(style) {
      if (style.xfId) {
        var xfId = style.xfId, styleProperties = _objectWithoutProperties(style, _excluded);
        return _objectSpread(_objectSpread({}, state2.baseStyles[xfId]), styleProperties);
      } else {
        return style;
      }
    });
  }
  __name(getResultFromState, "getResultFromState");
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "numFmt") {
      var numFmtId = Number(attributes.numFmtId);
      var numberFormat = {
        id: numFmtId
      };
      if (numFmtId >= 100) {
        numberFormat.template = attributes.formatCode;
      }
      state2.numberFormats[numFmtId] = numberFormat;
    } else if (tagName === "cellStyleXfs") {
      state2.cellStyleXfs = true;
    } else if (tagName === "cellXfs") {
      state2.cellXfs = true;
    } else if (tagName === "xf") {
      if (state2.cellStyleXfs) {
        state2.baseStyles.push(parseCellStyle(attributes));
      } else if (state2.cellXfs) {
        var style = parseCellStyle(attributes, state2.numberFormats);
        if (attributes.xfId) {
          style.xfId = Number(attributes.xfId);
        }
        state2.styles.push(style);
      }
    }
  }
  __name(onOpenTag, "onOpenTag");
  function onCloseTag(tagName, state2) {
    if (tagName === "cellStyleXfs") {
      state2.cellStyleXfs = false;
    } else if (tagName === "cellXfs") {
      state2.cellXfs = false;
    }
  }
  __name(onCloseTag, "onCloseTag");
  function parseCellStyle(attributes, numberFormats) {
    var style = {};
    if (attributes.numFmtId) {
      var numFmtId = Number(attributes.numFmtId);
      if (numberFormats && numberFormats[numFmtId]) {
        style.numberFormat = numberFormats[numFmtId];
      } else {
        style.numberFormat = {
          id: numFmtId
        };
      }
    }
    return style;
  }
  __name(parseCellStyle, "parseCellStyle");
}
__name(parseStyles, "parseStyles");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseSharedStrings.js
function parseSharedStrings(content, parseXml2) {
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, onCloseTag, onText).then(function() {
    return getResultFromState(state);
  });
  function createInitialState() {
    return {
      si: void 0,
      strings: []
    };
  }
  __name(createInitialState, "createInitialState");
  function getResultFromState(state2) {
    return state2.strings;
  }
  __name(getResultFromState, "getResultFromState");
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "si") {
      state2.si = createInitialStateInSharedString();
    } else if (state2.si) {
      onOpenTagInSharedString(tagName, attributes, state2.si);
    }
  }
  __name(onOpenTag, "onOpenTag");
  function onCloseTag(tagName, state2) {
    if (tagName === "si") {
      state2.strings.push(state2.si.string);
      state2.si = void 0;
    } else if (state2.si) {
      onCloseTagInSharedString(tagName, state2.si);
    }
  }
  __name(onCloseTag, "onCloseTag");
  function onText(text2, state2) {
    if (state2.si) {
      onTextInSharedString(text2, state2.si);
    }
  }
  __name(onText, "onText");
  function createInitialStateInSharedString() {
    return {
      t: false,
      r: false,
      rPh: false,
      string: ""
    };
  }
  __name(createInitialStateInSharedString, "createInitialStateInSharedString");
  function onOpenTagInSharedString(tagName, attributes, state2) {
    if (tagName === "t") {
      state2.t = true;
    } else if (tagName === "r") {
      state2.r = true;
    } else if (tagName === "rPh") {
      state2.rPh = true;
    }
  }
  __name(onOpenTagInSharedString, "onOpenTagInSharedString");
  function onCloseTagInSharedString(tagName, state2) {
    if (tagName === "t") {
      state2.t = false;
    } else if (tagName === "r") {
      state2.r = false;
    } else if (tagName === "rPh") {
      state2.rPh = false;
    }
  }
  __name(onCloseTagInSharedString, "onCloseTagInSharedString");
  function onTextInSharedString(text2, state2) {
    if (state2.rPh) {
    } else if (state2.t) {
      if (state2.r) {
        state2.string += text2;
      } else {
        state2.string = text2;
      }
    }
  }
  __name(onTextInSharedString, "onTextInSharedString");
}
__name(parseSharedStrings, "parseSharedStrings");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseExcelTimestamp.js
function parseExcelTimestamp(excelSerialDate, epoch1904) {
  var NUMBER_OF_LEAP_YEARS_BETWEEN_1900_AND_1970 = 17;
  var JANUARY_0TH_1900_DAY = 1;
  var ERRONEOUS_FEBRUARY_29_1990_DAY = 1;
  var DAY = 24 * 60 * 60 * 1e3;
  var DAYS_IN_YEAR = 365;
  if (epoch1904) {
    excelSerialDate += (1904 - 1900) * DAYS_IN_YEAR + JANUARY_0TH_1900_DAY + ERRONEOUS_FEBRUARY_29_1990_DAY;
  }
  var daysBeforeUnixEpoch = JANUARY_0TH_1900_DAY + ERRONEOUS_FEBRUARY_29_1990_DAY + (1970 - 1900) * DAYS_IN_YEAR + NUMBER_OF_LEAP_YEARS_BETWEEN_1900_AND_1970;
  return Math.floor((excelSerialDate - daysBeforeUnixEpoch) * DAY);
}
__name(parseExcelTimestamp, "parseExcelTimestamp");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/isDateFormat.js
var DATE_FORMAT_POSTFIX_THAT_ALLOWS_ANY_ARBITRARY_TEXT_INPUT = /;@$/;
var DATE_FORMAT_TOKEN_SPLITTER_REG_EXP = /[^a-z0#\?%]+/;
function isDateFormat(formatId, template, dateFormatDetectionCache) {
  var cachedResult = dateFormatDetectionCache[formatId];
  if (cachedResult === void 0) {
    return dateFormatDetectionCache[formatId] = isDateFormatTemplate(template);
  }
  return cachedResult;
}
__name(isDateFormat, "isDateFormat");
function isDateFormatTemplate(template) {
  template = template.toLowerCase();
  template = template.replace(DATE_FORMAT_POSTFIX_THAT_ALLOWS_ANY_ARBITRARY_TEXT_INPUT, "");
  template = template.replace(/\\./g, " ");
  var templates = template.split(";");
  return templates.some(isDateFormatSubTemplate);
  function isDateFormatSubTemplate(template2) {
    template2 = template2.replace(/"[^"]*"/g, " ");
    template2 = template2.replace(/(\[?[smhd]{1,2}\]?)[\.\,]00?0?/g, "$1");
    template2 = template2.replace(/\[([smhd]{1,2})\]/g, "$1");
    template2 = template2.replace(/\[[^\]]*\]/g, "");
    var tokens = template2.split(DATE_FORMAT_TOKEN_SPLITTER_REG_EXP).filter(function(_) {
      return _;
    });
    return tokens.length === 0 ? false : tokens.every(function(token) {
      return DATE_FORMAT_TEMPLATE_TOKENS.indexOf(token) >= 0;
    });
  }
  __name(isDateFormatSubTemplate, "isDateFormatSubTemplate");
}
__name(isDateFormatTemplate, "isDateFormatTemplate");
var DATE_FORMAT_TEMPLATE_TOKENS = [
  // Seconds.
  "s",
  // Seconds (min two digits). Example: "05".
  "ss",
  // Minutes. Could also means months, depending on the context. Example: "5".
  "m",
  // Minutes (min two digits). Could also means months, depending on the context. Example: "05".
  "mm",
  // Hours. Example: "1".
  "h",
  // Hours (min two digits). Example: "01".
  "hh",
  // "am" part of "am/pm" or "AM/PM".
  "am",
  // "pm" part of "am/pm" or "AM/PM".
  "pm",
  // "a" part of "a/p" or "A/P".
  "a",
  // "p" part of "a/p" or "A/P".
  "p",
  // Day. Example: "1"
  "d",
  // Day (min two digits). Example: "01"
  "dd",
  // Short, three-letter abbreviation for the day of the week. Example: "Mon"
  "ddd",
  // Full name of the day of the week. Example: "Monday"
  "dddd",
  // Abbreviated weekday name. Example: "Mon", "Tue"
  "aaa",
  // Full weekday name. Example: "Monday", "Tuesday"
  "aaaa",
  // First letter of the weekday name. Example: "M", "T"
  "aaaaa",
  // Month (numeric). Could also mean minutes, depending on the context. Example: "1".
  "m",
  // Month (numeric, min two digits). Could also mean minutes, depending on the context. Example: "01".
  "mm",
  // Month (shortened month name). Example: "Jan".
  "mmm",
  // Month (full month name). Example: "January".
  "mmmm",
  // Month (first letter). Example: "J".
  "mmmmm",
  // Excel typically treats a single `y` the same as `yy` in custom formatting,
  // though standard practice is using `yy` or `yyyy`.
  "y",
  // Two-digit year, with a leading zero if needed. Example: "01".
  "yy",
  // Full year. Example: "2001".
  "yyyy",
  //
  // `e` or `ee` token stands for "era year" and represents an era-based year,
  // primarily supporting Japanese, Taiwanese, or Minguo/Buddhist calendar systems.
  // An example of an "era year" would be Heisei or Reiwa year numbers,
  // or Buddhist Era years which are Gregorian years plus 543.
  //
  // * `e` outputs the era year as a 4-digit (or unpadded) number.
  //   For example, `2026` or `115` depending on the active regional era.
  //   In standard Western/Gregorian locales, Excel often falls back to treating `e`
  //   similarly to a regular year layout.
  //
  // * `ee` outputs a 2-digit padded era year. For example, `26` or `15`.
  //
  // * `eeee` — While `yyyy` is the standard token for a 4-digit year,
  //   `eeee` is historically used for specialized international calendar eras
  //   (like the Japanese or Taiwanese imperial eras). However, in standard
  //   Western/Gregorian system locales, Excel treats `eeee` exactly like `yyyy`.
  "e",
  "ee",
  "eeee"
];

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/isDateFormatStyle.js
function isDateFormatStyle(style, defaultDateFormat, shouldGuessDateFormatFromNumberFormatTemplate, dateFormatDetectionCache) {
  if (!style.numberFormat) {
    return false;
  }
  if (
    // Whether it's a "number format" that's conventionally used for storing date timestamps.
    BUILT_IN_DATE_FORMAT_IDS.indexOf(style.numberFormat.id) >= 0 || // Whether it's a "number format" that uses a "formatting template"
    // that the developer is certain is a date formatting template.
    defaultDateFormat && style.numberFormat.template === defaultDateFormat || // Whether the "smart formatting template" feature is not disabled
    // and it has detected that it's a date formatting template by looking at it.
    shouldGuessDateFormatFromNumberFormatTemplate && style.numberFormat.template && isDateFormat(style.numberFormat.id, style.numberFormat.template, dateFormatDetectionCache)
  ) {
    return true;
  }
  return false;
}
__name(isDateFormatStyle, "isDateFormatStyle");
var LOCALE_INDEPENDENT_BUILT_IN_DATE_FORMAT_IDS = [
  14,
  // mm-dd-yy
  15,
  // d-mmm-yy
  16,
  // d-mmm
  17,
  // mmm-yy
  18,
  // h:mm AM/PM
  19,
  // h:mm:ss AM/PM
  20,
  // h:mm
  21,
  // h:mm:ss
  22,
  // m/d/yy h:mm
  45,
  // mm:ss
  46,
  // [h]:mm:ss
  47
  // mmss.0
];
var MAINLAND_CHINESE_OR_TAIWANESE_LOCALE_BUILT_IN_DATE_FORMAT_IDS = [
  27,
  // [$-404]e/m/d OR yyyy"年"m"月"
  28,
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
  29,
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
  30,
  // m/d/yy OR m-d-yy
  31,
  // yyyy"年"m"月"d"日" OR yyyy"年"m"月"d"日"
  32,
  // hh"時"mm"分" OR h"时"mm"分"
  33,
  // hh"時"mm"分"ss"秒" OR h"时"mm"分"ss"秒"
  34,
  // 上午/下午hh"時"mm"分" OR 上午/下午h"时"mm"分"
  35,
  // 上午/下午hh"時"mm"分"ss"秒" OR 上午/下午h"时"mm"分"ss"秒"
  36,
  // [$-404]e/m/d OR yyyy"年"m"月"
  50,
  // [$-404]e/m/d OR yyyy"年"m"月"
  51,
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
  52,
  // 上午/下午hh"時"mm"分" OR yyyy"年"m"月"
  53,
  // 上午/下午hh"時"mm"分"ss"秒" OR m"月"d"日"
  54,
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
  55,
  // 上午/下午hh"時"mm"分" OR 上午/下午h"时"mm"分"
  56,
  // 上午/下午hh"時"mm"分"ss"秒" OR 上午/下午h"时"mm"分"ss"秒"
  57,
  // [$-404]e/m/d OR yyyy"年"m"月"
  58
  // [$-404]e"年"m"月"d"日" OR m"月"d"日"
];
var JAPANESE_OR_KOREAN_LOCALE_BUILT_IN_DATE_FORMAT_IDS = [
  27,
  // [$-411]ge.m.d OR yyyy"年" mm"月" dd"日"
  28,
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
  29,
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
  30,
  // m/d/yy OR mm-dd-yy
  31,
  // yyyy"年"m"月"d"日" OR yyyy"년" mm"월" dd"일"
  32,
  // h"時"mm"分" OR h"시" mm"분"
  33,
  // h"時"mm"分"ss"秒" OR h"시" mm"분" ss"초"
  34,
  // yyyy"年"m"月" OR yyyy-mm-dd
  35,
  // m"月"d"日" OR yyyy-mm-dd
  36,
  // [$-411]ge.m.d OR yyyy"年" mm"月" dd"日"
  50,
  // [$-411]ge.m.d OR yyyy"年" mm"月" dd"日"
  51,
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
  52,
  // yyyy"年"m"月" OR yyyy-mm-dd
  53,
  // m"月"d"日" OR yyyy-mm-dd
  54,
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
  55,
  // yyyy"年"m"月" OR yyyy-mm-dd
  56,
  // m"月"d"日" OR yyyy-mm-dd
  57,
  // [$-411]ge.m.d OR yyyy"年" mm"月" dd"日"
  58
  // [$-411]ggge"年"m"月"d"日" OR mm-dd
];
var THAI_LOCALE_BUILT_IN_DATE_FORMAT_IDS = [
  71,
  // ว/ด/ปปปป
  72,
  // ว-ดดด-ปป
  73,
  // ว-ดดด
  74,
  // ดดด-ปป
  75,
  // ช:นน
  76,
  // ช:นน:ทท
  77,
  // ว/ด/ปปปป ช:นน
  78,
  // นน:ทท
  79,
  // [ช]:นน:ทท
  80,
  // นน:ทท.0
  81
  // d/m/bb
];
var BUILT_IN_DATE_FORMAT_IDS = LOCALE_INDEPENDENT_BUILT_IN_DATE_FORMAT_IDS.concat(
  // Add Mainland Chinese or Taiwanese date format IDs that haven't already been added.
  MAINLAND_CHINESE_OR_TAIWANESE_LOCALE_BUILT_IN_DATE_FORMAT_IDS
).concat(
  // Add Japanese or Korean date format IDs that haven't already been added.
  JAPANESE_OR_KOREAN_LOCALE_BUILT_IN_DATE_FORMAT_IDS.filter(function(numberFormatId) {
    return MAINLAND_CHINESE_OR_TAIWANESE_LOCALE_BUILT_IN_DATE_FORMAT_IDS.indexOf(numberFormatId) < 0;
  })
).concat(
  // Add Thai date format IDs that haven't already been added.
  THAI_LOCALE_BUILT_IN_DATE_FORMAT_IDS.filter(function(numberFormatId) {
    return MAINLAND_CHINESE_OR_TAIWANESE_LOCALE_BUILT_IN_DATE_FORMAT_IDS.indexOf(numberFormatId) < 0;
  }).filter(function(numberFormatId) {
    return JAPANESE_OR_KOREAN_LOCALE_BUILT_IN_DATE_FORMAT_IDS.indexOf(numberFormatId) < 0;
  })
);

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseCell.js
function _slicedToArray(arr, i2) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i2) || _unsupportedIterableToArray2(arr, i2) || _nonIterableRest();
}
__name(_slicedToArray, "_slicedToArray");
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
__name(_nonIterableRest, "_nonIterableRest");
function _unsupportedIterableToArray2(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray2(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray2(o, minLen);
}
__name(_unsupportedIterableToArray2, "_unsupportedIterableToArray");
function _arrayLikeToArray2(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
  return arr2;
}
__name(_arrayLikeToArray2, "_arrayLikeToArray");
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i2, u, a2 = [], f = true, o = false;
    try {
      if (i2 = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i2.call(t)).done) && (a2.push(e.value), a2.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a2;
  }
}
__name(_iterableToArrayLimit, "_iterableToArrayLimit");
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
__name(_arrayWithHoles, "_arrayWithHoles");
var EMPTY_CELL_VALUE = null;
var EMPTY_CELL = [null, EMPTY_CELL_VALUE];
function parseCell(t, s, v2, inlineString, _ref) {
  var _ref2 = _slicedToArray(_ref, 7), sharedStrings = _ref2[0], styles = _ref2[1], epoch1904 = _ref2[2], dateFormatDetectionCache = _ref2[3], defaultDateFormat = _ref2[4], dateTemplateParser = _ref2[5], parseNumberCustom = _ref2[6];
  switch (t || "n") {
    // `t="str"` means that the cell value is calculated using a formula.
    // The formula is defined as the text of a child `<f/>` element.
    //
    // It could optionally include a `<v/>` element whose text is the cached result
    // of the calculation from the last time the file was saved in a spreadsheet editor application.
    //
    // An optional `<v/>` element holds a pre-computed result of the formula defined by `<f/>`.
    //
    // Example:
    //
    // <c r="B3" t="str">
    // 	<f>CONCATENATE(C1,D1)</f>
    // 	<v>C1ValueD1Value</v>
    // </c>
    //
    // Here's a guide on formulas in XLSX files:
    // https://github.com/MiniMax-AI/skills/blob/main/skills/minimax-xlsx/references/validate.md
    //
    case "str":
      if (v2 === void 0) {
        return "VALUE_MISSING";
      }
      if (!v2) {
        return EMPTY_CELL;
      }
      return ["s", v2];
    // `t="inlineStr"` means that `<is/>` holds the string value.
    //
    // Inside a `<c t="inlineStr"/>`, the specification requires there to exist an `<is/>` element,
    // and within that `<is/>` element it requires to exist a `<t/>` element.
    //
    // Example:
    //
    // <c r="A1" s="1" t="inlineStr">
    //   <is>
    //     <t>
    //       Test 123
    //     </t>
    //   </is>
    // </c>
    //
    case "inlineStr":
      if (inlineString === void 0) {
        return "VALUE_MISSING";
      }
      return ["s", inlineString];
    // `type="s"` means that the string value is stored in the Shared Strings Table.
    // This way it attempts to compress the `.xlsx` file by reusing all string values
    // in case they repeat throughout the spreadsheet.
    //
    // This optimization can't be used when writing an `.xlsx` file in a "streaming"
    // fashion, i.e. when the entire spreadsheet data is not known in adavance
    // at the start of writing the file.
    // But it can be used in all other situations. And hence, it is used.
    // So this is the most common cell type, actually.
    //
    // Example:
    //
    // <c r="A3" t="s">
    //   <v>3</v>
    // </c>
    //
    case "s":
      if (!v2) {
        return "VALUE_MISSING";
      }
      var sharedStringIndex = Number(v2);
      if (isNaN(sharedStringIndex) || sharedStrings[sharedStringIndex] === void 0) {
        return "VALUE_INVALID";
      }
      return ["s", sharedStrings[sharedStringIndex]];
    // Boolean (TRUE/FALSE) values are stored as either "1" or "0" in cells of type "b".
    //
    // Example:
    //
    // <c r="A1" t="b">
    //   <v>1</v>
    // </c>
    //
    case "b":
      if (!v2) {
        return "VALUE_MISSING";
      }
      if (v2 === "1") {
        return ["b", true];
      }
      if (v2 === "0") {
        return ["b", false];
      }
      return "VALUE_INVALID";
    // If cell type is "e", the `<v/>` element's text is an error code string (required).
    //
    // Example:
    //
    // <c r="A1" t="e">
    //   <f>1/0</f>
    //   <v>#DIV/0!</v>
    // </c>
    //
    case "e":
      if (!v2) {
        return "VALUE_MISSING";
      }
      return ["e", v2];
    // XLSX supports date cells of type "d", though it seems like it (almost?) never
    // uses type "d" for storing dates, preferring type "n" and numeric timestamp instead.
    // The value of a "d" cell is supposedly a string in "ISO 8601" format.
    // I haven't seen an `.xlsx` file having such cells.
    //
    // Example:
    //
    // <c r="A1" s="1" t="d">
    //   <v>
    //     2021-06-10T00:47:45.700Z
    //   </v>
    // </c>
    //
    case "d":
      if (!v2) {
        return EMPTY_CELL;
      }
      var parsedDate = new Date(v2);
      if (isNaN(parsedDate.valueOf())) {
        return "VALUE_INVALID";
      }
      return ["d", parsedDate.getTime()];
    // type "n" is used for numeric cells.
    //
    // An optional `s` attribute defines how this number should be formatted — 
    // it should be a zero-based index of the style (XF record) in `styles.xml`.
    //
    // Example:
    //
    // <c r="A1" s="1" t="n">
    //   <v>123.45</v>
    // </c>
    //
    case "n":
      if (!v2) {
        return EMPTY_CELL;
      }
      if (s) {
        var styleId = Number(s);
        if (isNaN(styleId) || styles[styleId] === void 0) {
          return "FORMAT_INVALID";
        }
        if (isDateFormatStyle(styles[styleId], defaultDateFormat, dateTemplateParser, dateFormatDetectionCache)) {
          var timestamp = Number(v2);
          if (isNaN(timestamp)) {
            return "VALUE_INVALID";
          }
          return ["d", parseExcelTimestamp(timestamp, epoch1904)];
        }
      }
      if (parseNumberCustom) {
        return ["n", v2];
      }
      var number = Number(v2);
      if (isNaN(number)) {
        return "VALUE_INVALID";
      }
      return ["n", number];
    default:
      return "TYPE_INVALID";
  }
}
__name(parseCell, "parseCell");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseCellAddress.js
function parseCellAddress(cellAddress) {
  var columnNumber = 0;
  var i2 = 0;
  while (i2 < cellAddress.length) {
    var charCode = cellAddress.charCodeAt(i2);
    if (charCode >= 48 && charCode <= 57) {
      var rowNumber = Number(cellAddress.slice(i2));
      if (isNaN(rowNumber)) {
        invalidCellAddress(cellAddress);
      }
      return [
        // Row number (starting at `1`).
        rowNumber,
        // Column number (starting at `1`).
        columnNumber
      ];
    }
    columnNumber *= 26;
    columnNumber += cellAddress.charCodeAt(i2) - 64;
    i2++;
  }
  invalidCellAddress(cellAddress);
}
__name(parseCellAddress, "parseCellAddress");
function invalidCellAddress(cellAddress) {
  throw new Error('<c r="'.concat(cellAddress, '">'));
}
__name(invalidCellAddress, "invalidCellAddress");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseSheet.js
function _slicedToArray2(arr, i2) {
  return _arrayWithHoles2(arr) || _iterableToArrayLimit2(arr, i2) || _unsupportedIterableToArray3(arr, i2) || _nonIterableRest2();
}
__name(_slicedToArray2, "_slicedToArray");
function _nonIterableRest2() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
__name(_nonIterableRest2, "_nonIterableRest");
function _iterableToArrayLimit2(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i2, u, a2 = [], f = true, o = false;
    try {
      if (i2 = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i2.call(t)).done) && (a2.push(e.value), a2.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a2;
  }
}
__name(_iterableToArrayLimit2, "_iterableToArrayLimit");
function _arrayWithHoles2(arr) {
  if (Array.isArray(arr)) return arr;
}
__name(_arrayWithHoles2, "_arrayWithHoles");
function _createForOfIteratorHelperLoose2(o, allowArrayLike) {
  var it2 = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it2) return (it2 = it2.call(o)).next.bind(it2);
  if (Array.isArray(o) || (it2 = _unsupportedIterableToArray3(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it2) o = it2;
    var i2 = 0;
    return function() {
      if (i2 >= o.length) return { done: true };
      return { done: false, value: o[i2++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
__name(_createForOfIteratorHelperLoose2, "_createForOfIteratorHelperLoose");
function _unsupportedIterableToArray3(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray3(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray3(o, minLen);
}
__name(_unsupportedIterableToArray3, "_unsupportedIterableToArray");
function _arrayLikeToArray3(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
  return arr2;
}
__name(_arrayLikeToArray3, "_arrayLikeToArray");
var EMPTY_CELL_VALUE2 = null;
function parseSheet(content, parseXml2, _ref) {
  var sharedStrings = _ref.sharedStrings, styles = _ref.styles, epoch1904 = _ref.epoch1904, dateFormatDetectionCache = _ref.dateFormatDetectionCache, options = _ref.options;
  var parseCellParameters = [
    sharedStrings,
    styles,
    epoch1904,
    dateFormatDetectionCache,
    options.dateFormat,
    // defaultDateFormat
    options.smartDateParser !== false,
    // dateTemplateParser
    options.parseNumber
    // parseNumberCustom
  ];
  var rows = [];
  var errors = [];
  var state = createInitialState();
  return parseXml2(content, state, onOpenTag, onCloseTag, onText, onProgress).then(function() {
    var _state$sheetData = state.sheetData, rowCount = _state$sheetData.rowCount, columnCount = _state$sheetData.columnCount, dataRowCount = _state$sheetData.dataRowCount, dataColumnCount = _state$sheetData.dataColumnCount;
    if (dataRowCount < rowCount) {
      rows = rows.slice(0, dataRowCount);
    }
    if (dataColumnCount < columnCount) {
      var i2 = 0;
      while (i2 < rows.length) {
        if (rows[i2].length > dataColumnCount) {
          rows[i2] = rows[i2].slice(0, dataColumnCount);
        }
        i2++;
      }
    }
    var startedAt = Date.now();
    for (var _iterator = _createForOfIteratorHelperLoose2(rows), _step; !(_step = _iterator()).done; ) {
      var row = _step.value;
      while (row.length < dataColumnCount) {
        row.push(EMPTY_CELL_VALUE2);
      }
    }
    return rows;
  });
  function createInitialState() {
    return {
      dimension: void 0,
      sheetData: void 0
    };
  }
  __name(createInitialState, "createInitialState");
  function getRowsFromState(state2) {
    return state2.sheetData.rows;
  }
  __name(getRowsFromState, "getRowsFromState");
  function setRowsInState(state2, rows2) {
    state2.sheetData.rowIndexShift += state2.sheetData.rows.length - rows2.length;
    state2.sheetData.rows = rows2;
  }
  __name(setRowsInState, "setRowsInState");
  function getErrorsFromState(state2) {
    return state2.sheetData.errors;
  }
  __name(getErrorsFromState, "getErrorsFromState");
  function setErrorsInState(state2, errors2) {
    state2.sheetData.errors = errors2;
  }
  __name(setErrorsInState, "setErrorsInState");
  var THROW_ON_FIRST_CELL_ERROR = true;
  function throwInvalidCellError(_ref2) {
    var row = _ref2.row, column = _ref2.column, error = _ref2.error;
    throw new InvalidSpreadsheetError("<c/> at row ".concat(row, ", col ").concat(column, ": ").concat(error));
  }
  __name(throwInvalidCellError, "throwInvalidCellError");
  function onProgress(end) {
    var rowsRead = getRowsFromState(state);
    var errorsEncountered = getErrorsFromState(state);
    if (end) {
      rows = rows.concat(rowsRead);
      errors = errors.concat(errorsEncountered);
      if (errors.length > 0) {
        throwInvalidCellError(errors[0]);
      }
    } else {
      if (rowsRead.length > 1) {
        var finalizedRows = rowsRead.slice(0, -1);
        rows = rows.concat(finalizedRows);
        errors = errors.concat(errorsEncountered);
        setRowsInState(state, rowsRead.slice(-1));
        setErrorsInState(state, []);
      }
    }
  }
  __name(onProgress, "onProgress");
  function onOpenTag(tagName, attributes, state2) {
    if (tagName === "dimension") {
      state2.dimension = parseSheetDimensionRef(attributes.ref);
    } else if (tagName === "sheetData") {
      state2.sheetData = createInitialStateInSheetData();
    } else if (state2.sheetData) {
      onOpenTagInSheetData(tagName, attributes, state2.sheetData);
    }
  }
  __name(onOpenTag, "onOpenTag");
  function onCloseTag(tagName, state2) {
    if (state2.sheetData) {
      onCloseTagInSheetData(tagName, state2.sheetData);
    }
  }
  __name(onCloseTag, "onCloseTag");
  function onText(text2, state2) {
    if (state2.sheetData) {
      onTextInSheetData(text2, state2.sheetData);
    }
  }
  __name(onText, "onText");
  function parseSheetDimensionRef(ref) {
    var dimensions = ref.split(":").map(parseCellAddress);
    if (dimensions.length === 1) {
      dimensions = [dimensions[0], dimensions[0]];
    }
    return dimensions;
  }
  __name(parseSheetDimensionRef, "parseSheetDimensionRef");
  function createInitialStateInSheetData() {
    return {
      c: void 0,
      rows: [],
      row: void 0,
      rowNumber: void 0,
      // How many rows have been removed from the start of `state.rows`
      // as part of `onProgress()` handler calls.
      rowIndexShift: 0,
      // Current position in the sheet.
      cursor: [0, 0],
      // Total row count.
      rowCount: 0,
      // Total column count.
      columnCount: 0,
      // Non-empty row count.
      dataRowCount: 0,
      // Non-empty column count.
      dataColumnCount: 0,
      // Cell with errors.
      errors: []
    };
  }
  __name(createInitialStateInSheetData, "createInitialStateInSheetData");
  function onOpenTagInSheetData(tagName, attributes, state2) {
    if (tagName === "row") {
      if (attributes.r) {
        state2.rowNumber = Number(attributes.r);
      }
      state2.row = [];
    } else if (tagName === "c") {
      state2.c = createInitialStateInCell();
      state2.c.attributes = attributes;
    } else if (state2.c) {
      onOpenTagInCell(tagName, attributes, state2.c);
    }
  }
  __name(onOpenTagInSheetData, "onOpenTagInSheetData");
  function onCloseTagInSheetData(tagName, state2) {
    if (tagName === "row") {
      if (state2.rowNumber) {
        var previousRowNumber = state2.rowIndexShift + state2.rows.length;
        if (state2.rowNumber <= previousRowNumber) {
          throw new InvalidSpreadsheetError("Out-of-place <row/> number ".concat(state2.rowNumber, " follows <row/> number ").concat(previousRowNumber));
        }
        while (state2.rowNumber > state2.rowIndexShift + state2.rows.length + 1) {
          state2.rows.push([]);
        }
      }
      state2.rows.push(state2.row);
      if (state2.row.length > 0) {
        state2.dataRowCount = state2.rowNumber;
      }
      if (state2.rowNumber > state2.rowCount) {
        state2.rowCount = state2.rowNumber;
      }
      state2.row = void 0;
      state2.rowNumber = void 0;
    } else if (tagName === "c") {
      var cell = parseCellFromXmlData(state2.c);
      if (cell.row < state2.cursor[0] || cell.row === state2.cursor[0] && cell.column <= state2.cursor[1]) {
        throw new InvalidSpreadsheetError("Out-of-place <c/> at row ".concat(cell.row, " col ").concat(cell.column, " follows <c/> at row ").concat(state2.cursor[0], " col ").concat(state2.cursor[1]));
      }
      state2.cursor[0] = cell.row;
      state2.cursor[1] = cell.column;
      if (!state2.rowNumber) {
        state2.rowNumber = cell.row;
      }
      if (cell.error) {
        if (THROW_ON_FIRST_CELL_ERROR) {
          throwInvalidCellError(cell);
        }
        state2.errors.push(cell);
      } else if (cell.value !== EMPTY_CELL_VALUE2) {
        while (cell.column > state2.row.length + 1) {
          state2.row.push(EMPTY_CELL_VALUE2);
        }
        state2.row.push(cell.value);
        if (cell.column > state2.dataColumnCount) {
          state2.dataColumnCount = cell.column;
        }
      }
      if (cell.column > state2.columnCount) {
        state2.columnCount = cell.column;
      }
      state2.c = void 0;
    } else if (state2.c) {
      onCloseTagInCell(tagName, state2.c);
    }
  }
  __name(onCloseTagInSheetData, "onCloseTagInSheetData");
  function onTextInSheetData(text2, state2) {
    if (state2.c) {
      onTextInCell(text2, state2.c);
    }
  }
  __name(onTextInSheetData, "onTextInSheetData");
  function parseCellFromXmlData(_ref3) {
    var attributes = _ref3.attributes, inlineString = _ref3.inlineString, vText = _ref3.vText;
    var _parseCellAddress = parseCellAddress(attributes.r), _parseCellAddress2 = _slicedToArray2(_parseCellAddress, 2), row = _parseCellAddress2[0], column = _parseCellAddress2[1];
    var errorOrTypeAndValue = parseCellAndTrimValue(attributes.t, attributes.s, vText, inlineString, parseCellParameters, options.trim !== false);
    if (typeof errorOrTypeAndValue === "string") {
      return {
        row,
        column,
        error: errorOrTypeAndValue
        // // Report the "raw" unparsed value of the cell for potential debugging.
        // // Also report the cell type and the format in case of a numeric value.
        // //
        // // For "inline string" cells, the value should actually be the `inlineString` argument
        // // rather than `vText` argument, but the only case when it could throw an error
        // // when parsing an "inline string" cell is `VALUE_MISSING` which means that
        // // `inlineString` argument is `undefined`, same as `vText` argument in this case,
        // // so the resulting `value` property is correct anyway.
        // //
        // value: vText,
        // type: attributes.t,
        // formatId: attributes.s
      };
    }
    return {
      row,
      column,
      value: parseCellValue2(errorOrTypeAndValue[1], errorOrTypeAndValue[0])
    };
  }
  __name(parseCellFromXmlData, "parseCellFromXmlData");
  function parseCellAndTrimValue(t, s, v2, inlineString, parameters, trimStrings) {
    var errorOrTypeAndValue = parseCellWithRepairAbility(t, s, v2, inlineString, parameters);
    if (Array.isArray(errorOrTypeAndValue) && errorOrTypeAndValue[0] === "s") {
      if (trimStrings) {
        errorOrTypeAndValue[1] = errorOrTypeAndValue[1].trim();
      }
      if (errorOrTypeAndValue[1] === "") {
        return EMPTY_CELL;
      }
    }
    return errorOrTypeAndValue;
  }
  __name(parseCellAndTrimValue, "parseCellAndTrimValue");
  function parseCellWithRepairAbility(t, s, v2, inlineString, parameters) {
    var errorOrTypeAndValue = parseCell(t, s, v2, inlineString, parameters);
    if (errorOrTypeAndValue === "VALUE_MISSING") {
      switch (t || "n") {
        // * If the cell is defined by a formula.
        // * Or contains an inline string.
        // * Or contains a shared string.
        // * Or contains a boolean value.
        case "str":
        case "inlineStr":
        case "s":
        case "b":
          return EMPTY_CELL;
      }
    }
    if (t === "e") {
      return EMPTY_CELL;
    }
    return errorOrTypeAndValue;
  }
  __name(parseCellWithRepairAbility, "parseCellWithRepairAbility");
  function parseCellValue2(value, type) {
    if (type === "n") {
      if (options.parseNumber) {
        return options.parseNumber(value);
      }
      return value;
    } else if (type === "d") {
      return new Date(value);
    } else {
      return value;
    }
  }
  __name(parseCellValue2, "parseCellValue");
  function createInitialStateInCell() {
    return {
      v: false,
      is: false,
      t: false,
      r: false,
      rPh: false,
      vText: void 0,
      inlineString: void 0,
      attributes: void 0
    };
  }
  __name(createInitialStateInCell, "createInitialStateInCell");
  function onOpenTagInCell(tagName, attributes, state2) {
    if (tagName === "v") {
      state2.v = true;
    } else if (tagName === "is") {
      state2.is = true;
      state2.inlineString = "";
    } else if (tagName === "t") {
      state2.t = true;
    } else if (tagName === "r") {
      state2.r = true;
    } else if (tagName === "rPh") {
      state2.rPh = true;
    }
  }
  __name(onOpenTagInCell, "onOpenTagInCell");
  function onCloseTagInCell(tagName, state2) {
    if (tagName === "v") {
      state2.v = false;
      state2.vText || (state2.vText = "");
    } else if (tagName === "is") {
      state2.is = false;
    } else if (tagName === "t") {
      state2.t = false;
    } else if (tagName === "r") {
      state2.r = false;
    } else if (tagName === "rPh") {
      state2.rPh = false;
    }
  }
  __name(onCloseTagInCell, "onCloseTagInCell");
  function onTextInCell(text2, state2) {
    if (state2.v) {
      state2.vText = text2;
    } else if (state2.is) {
      if (state2.rPh) {
      } else if (state2.t) {
        if (state2.r) {
          state2.inlineString += text2;
        } else {
          state2.inlineString = text2;
        }
      }
    }
  }
  __name(onTextInCell, "onTextInCell");
  function getSheetDimensions(cells) {
    var minRow = cells.length === 0 ? 0 : 1;
    var minCol = cells.length === 0 ? 0 : 1;
    var maxRow = 0;
    var maxCol = 0;
    for (var _iterator2 = _createForOfIteratorHelperLoose2(cells), _step2; !(_step2 = _iterator2()).done; ) {
      var cell = _step2.value;
      if (maxRow < cell.row) {
        maxRow = cell.row;
      }
      if (maxCol < cell.column) {
        maxCol = cell.column;
      }
    }
    return [[minRow, minCol], [maxRow, maxCol]];
  }
  __name(getSheetDimensions, "getSheetDimensions");
}
__name(parseSheet, "parseSheet");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/utility/convertValuesFromUint8ArraysToStrings.js
function convertValuesFromUint8ArraysToStrings(entries) {
  checkpoint("convert files to strings");
  var convertedEntries = {};
  for (var _i = 0, _Object$keys = Object.keys(entries); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    convertedEntries[key] = strFromU82(entries[key]);
  }
  return convertedEntries;
}
__name(convertValuesFromUint8ArraysToStrings, "convertValuesFromUint8ArraysToStrings");
function strFromU82(data) {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(data);
  } else {
    return strFromU8(data);
  }
}
__name(strFromU82, "strFromU8");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/utility/isPromise.js
function _typeof6(o) {
  "@babel/helpers - typeof";
  return _typeof6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof6(o);
}
__name(_typeof6, "_typeof");
function isPromise(anything) {
  return _typeof6(anything) === "object" && typeof anything.then === "function";
}
__name(isPromise, "isPromise");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/SheetNotFoundError.js
function _typeof7(o) {
  "@babel/helpers - typeof";
  return _typeof7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof7(o);
}
__name(_typeof7, "_typeof");
function _defineProperties4(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey5(descriptor.key), descriptor);
  }
}
__name(_defineProperties4, "_defineProperties");
function _createClass4(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties4(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties4(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
__name(_createClass4, "_createClass");
function _toPropertyKey5(arg) {
  var key = _toPrimitive5(arg, "string");
  return _typeof7(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey5, "_toPropertyKey");
function _toPrimitive5(input, hint) {
  if (_typeof7(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof7(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive5, "_toPrimitive");
function _classCallCheck4(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
__name(_classCallCheck4, "_classCallCheck");
function _inherits4(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf4(subClass, superClass);
}
__name(_inherits4, "_inherits");
function _createSuper4(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct4();
  return /* @__PURE__ */ __name(function _createSuperInternal() {
    var Super = _getPrototypeOf4(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf4(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn4(this, result);
  }, "_createSuperInternal");
}
__name(_createSuper4, "_createSuper");
function _possibleConstructorReturn4(self, call) {
  if (call && (_typeof7(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized4(self);
}
__name(_possibleConstructorReturn4, "_possibleConstructorReturn");
function _assertThisInitialized4(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
__name(_assertThisInitialized4, "_assertThisInitialized");
function _wrapNativeSuper4(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper4 = /* @__PURE__ */ __name(function _wrapNativeSuper6(Class2) {
    if (Class2 === null || !_isNativeFunction4(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct4(Class2, arguments, _getPrototypeOf4(this).constructor);
    }
    __name(Wrapper, "Wrapper");
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf4(Wrapper, Class2);
  }, "_wrapNativeSuper");
  return _wrapNativeSuper4(Class);
}
__name(_wrapNativeSuper4, "_wrapNativeSuper");
function _construct4(Parent, args, Class) {
  if (_isNativeReflectConstruct4()) {
    _construct4 = Reflect.construct.bind();
  } else {
    _construct4 = /* @__PURE__ */ __name(function _construct6(Parent2, args2, Class2) {
      var a2 = [null];
      a2.push.apply(a2, args2);
      var Constructor = Function.bind.apply(Parent2, a2);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf4(instance, Class2.prototype);
      return instance;
    }, "_construct");
  }
  return _construct4.apply(null, arguments);
}
__name(_construct4, "_construct");
function _isNativeReflectConstruct4() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
__name(_isNativeReflectConstruct4, "_isNativeReflectConstruct");
function _isNativeFunction4(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
__name(_isNativeFunction4, "_isNativeFunction");
function _setPrototypeOf4(o, p2) {
  _setPrototypeOf4 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : /* @__PURE__ */ __name(function _setPrototypeOf6(o2, p3) {
    o2.__proto__ = p3;
    return o2;
  }, "_setPrototypeOf");
  return _setPrototypeOf4(o, p2);
}
__name(_setPrototypeOf4, "_setPrototypeOf");
function _getPrototypeOf4(o) {
  _getPrototypeOf4 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : /* @__PURE__ */ __name(function _getPrototypeOf6(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  }, "_getPrototypeOf");
  return _getPrototypeOf4(o);
}
__name(_getPrototypeOf4, "_getPrototypeOf");
var SheetNotFoundError = /* @__PURE__ */ (function(_Error) {
  _inherits4(SheetNotFoundError2, _Error);
  var _super = _createSuper4(SheetNotFoundError2);
  function SheetNotFoundError2(sheet, sheets) {
    var _this;
    _classCallCheck4(this, SheetNotFoundError2);
    _this = _super.call(this, "Sheet not found: ".concat(typeof sheet === "number" ? sheet + ". Sheet count: " + sheets.length : sheet + ". Available sheets: " + sheets.join(", ")));
    _this.name = "SheetNotFoundError";
    _this.sheet = sheet;
    _this.sheets = sheets;
    return _this;
  }
  __name(SheetNotFoundError2, "SheetNotFoundError");
  return _createClass4(SheetNotFoundError2);
})(/* @__PURE__ */ _wrapNativeSuper4(Error));

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/xlsx/parseSpreadsheetContents.js
function _typeof8(o) {
  "@babel/helpers - typeof";
  return _typeof8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof8(o);
}
__name(_typeof8, "_typeof");
function _createForOfIteratorHelperLoose3(o, allowArrayLike) {
  var it2 = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it2) return (it2 = it2.call(o)).next.bind(it2);
  if (Array.isArray(o) || (it2 = _unsupportedIterableToArray4(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it2) o = it2;
    var i2 = 0;
    return function() {
      if (i2 >= o.length) return { done: true };
      return { done: false, value: o[i2++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
__name(_createForOfIteratorHelperLoose3, "_createForOfIteratorHelperLoose");
function _unsupportedIterableToArray4(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray4(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray4(o, minLen);
}
__name(_unsupportedIterableToArray4, "_unsupportedIterableToArray");
function _arrayLikeToArray4(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
  return arr2;
}
__name(_arrayLikeToArray4, "_arrayLikeToArray");
function ownKeys2(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
__name(ownKeys2, "ownKeys");
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys2(Object(t), true).forEach(function(r2) {
      _defineProperty2(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
__name(_objectSpread2, "_objectSpread");
function _defineProperty2(obj, key, value) {
  key = _toPropertyKey6(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
__name(_defineProperty2, "_defineProperty");
function _toPropertyKey6(arg) {
  var key = _toPrimitive6(arg, "string");
  return _typeof8(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey6, "_toPropertyKey");
function _toPrimitive6(input, hint) {
  if (_typeof8(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof8(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive6, "_toPrimitive");
function parseSpreadsheetContents(parseXml2, contents_) {
  var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  var contents = convertValuesFromUint8ArraysToStrings(contents_);
  checkpoint("parse spreadsheet info and file paths");
  return readFiles(getXmlFilesAtFixedPaths(), contents, parseXml2).then(function(_ref) {
    var spreadsheetInfo = _ref.spreadsheetInfo, filePaths = _ref.filePaths;
    checkpoint('parse "shared strings" and "styles"');
    return readFiles(getXmlFilesAtNonFixedPaths(filePaths), contents, parseXml2).then(function(_ref2) {
      var sharedStrings = _ref2.sharedStrings, styles = _ref2.styles;
      var sheetRelationIdsToRead = options.sheets ? options.sheets.map(function(sheet) {
        return getSheetRelationId(sheet, spreadsheetInfo.sheets);
      }) : spreadsheetInfo.sheets.map(function(_) {
        return _.relationId;
      });
      checkpoint("parse sheet".concat(sheetRelationIdsToRead.length === 1 ? "" : "s", " data"));
      var dateFormatDetectionCache = [];
      return readFiles(getSheetDataXmlFiles(filePaths, sheetRelationIdsToRead, {
        sharedStrings,
        styles,
        epoch1904: spreadsheetInfo.epoch1904,
        dateFormatDetectionCache,
        options
      }), contents, parseXml2).then(function(sheetsData) {
        checkpoint("end");
        return sheetRelationIdsToRead.map(function(sheetRelationId) {
          return {
            sheet: getSheetNameByRelationId(sheetRelationId, spreadsheetInfo.sheets),
            data: sheetsData[sheetRelationId]
          };
        });
      });
    });
  });
}
__name(parseSpreadsheetContents, "parseSpreadsheetContents");
function parseSpreadsheetContentsInWorker(createWorkerFunction2, parseXml2, contents, options) {
  if (!(options && options.parseNumber)) {
    options = _objectSpread2(_objectSpread2({}, options), {}, {
      parseNumber: null
    });
  }
  return parseSpreadsheetContents(parseXml2, contents, options);
}
__name(parseSpreadsheetContentsInWorker, "parseSpreadsheetContentsInWorker");
function getSheetRelationId(sheet, sheets) {
  if (typeof sheet === "string") {
    for (var _iterator = _createForOfIteratorHelperLoose3(sheets), _step; !(_step = _iterator()).done; ) {
      var _sheet = _step.value;
      if (_sheet.name === sheet) {
        return _sheet.relationId;
      }
    }
  } else {
    if (sheet <= sheets.length) {
      return sheets[sheet - 1].relationId;
    }
  }
  throw new SheetNotFoundError(sheet, sheets.map(function(_) {
    return _.name;
  }));
}
__name(getSheetRelationId, "getSheetRelationId");
function getSheetNameByRelationId(sheetRelationId, sheets) {
  for (var _iterator2 = _createForOfIteratorHelperLoose3(sheets), _step2; !(_step2 = _iterator2()).done; ) {
    var sheet = _step2.value;
    if (sheet.relationId === sheetRelationId) {
      return sheet.name;
    }
  }
  throw new Error("Sheet relation ID not found: ".concat(sheetRelationId));
}
__name(getSheetNameByRelationId, "getSheetNameByRelationId");
function getXmlFilesAtFixedPaths() {
  return {
    // Read the paths to certain files inside the `.xlsx` file, which is itself just a `.zip` archive.
    // These paths aren't standardized between different spreadsheet editors.
    // https://github.com/tidyverse/readxl/issues/104
    "xl/_rels/workbook.xml.rels": {
      name: "filePaths",
      parse: parseFilePaths
    },
    // General info on the spreadsheet.
    "xl/workbook.xml": {
      name: "spreadsheetInfo",
      parse: parseSpreadsheetInfo
    }
  };
}
__name(getXmlFilesAtFixedPaths, "getXmlFilesAtFixedPaths");
function getXmlFilesAtNonFixedPaths(filePaths) {
  var _ref3;
  return _ref3 = {}, _defineProperty2(_ref3, filePaths.sharedStrings || "xl/sharedStrings.xml", {
    name: "sharedStrings",
    // `parseSharedStrings()` returns a `Promise`.
    parse: parseSharedStrings,
    // It seems that "sharedStrings.xml" is not required to exist.
    // For example, that could be the case when a spreadsheet doesn't contain any strings.
    // https://github.com/catamphetamine/read-excel-file/issues/85
    fallback: Promise.resolve([])
  }), _defineProperty2(_ref3, filePaths.styles || "xl/styles.xml", {
    name: "styles",
    parse: parseStyles,
    fallback: {}
  }), _ref3;
}
__name(getXmlFilesAtNonFixedPaths, "getXmlFilesAtNonFixedPaths");
function getSheetDataXmlFiles(filePaths, sheetRelationIdsToRead, sheetDataParserParameters) {
  return Object.keys(filePaths.sheets).filter(function(sheetRelationId) {
    return sheetRelationIdsToRead.includes(sheetRelationId);
  }).reduce(function(filesInfo, sheetRelationId) {
    return _objectSpread2(_objectSpread2({}, filesInfo), {}, _defineProperty2({}, filePaths.sheets[sheetRelationId], {
      name: sheetRelationId,
      // `parseSheet()` returns a `Promise`.
      parse: /* @__PURE__ */ __name(function parse(content, parseXml2) {
        return parseSheet(content, parseXml2, sheetDataParserParameters);
      }, "parse")
    }));
  }, {});
}
__name(getSheetDataXmlFiles, "getSheetDataXmlFiles");
function readFiles(filesInfo, contents, parseXml2) {
  var results = {};
  var _loop = /* @__PURE__ */ __name(function _loop3() {
    var filePath = _Object$keys[_i];
    var fileInfo = filesInfo[filePath];
    results[fileInfo.name] = contents[filePath] === void 0 ? fileInfo.fallback === void 0 ? (function() {
      throw new InvalidSpreadsheetError('"'.concat(filePath, '" file not found inside the `.xlsx` file'));
    })() : fileInfo.fallback : fileInfo.parse(contents[filePath], parseXml2);
  }, "_loop");
  for (var _i = 0, _Object$keys = Object.keys(filesInfo); _i < _Object$keys.length; _i++) {
    _loop();
  }
  var promises = [];
  var _loop2 = /* @__PURE__ */ __name(function _loop22() {
    var name = _Object$keys2[_i2];
    if (isPromise(results[name])) {
      promises.push(results[name].then(function(result) {
        results[name] = result;
      }));
    }
  }, "_loop2");
  for (var _i2 = 0, _Object$keys2 = Object.keys(results); _i2 < _Object$keys2.length; _i2++) {
    _loop2();
  }
  if (promises.length > 0) {
    return Promise.all(promises).then(function() {
      return results;
    });
  }
  return results;
}
__name(readFiles, "readFiles");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/parseSheetData/InvalidError.js
function _typeof9(o) {
  "@babel/helpers - typeof";
  return _typeof9 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof9(o);
}
__name(_typeof9, "_typeof");
function _defineProperties5(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey7(descriptor.key), descriptor);
  }
}
__name(_defineProperties5, "_defineProperties");
function _createClass5(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties5(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties5(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
__name(_createClass5, "_createClass");
function _toPropertyKey7(arg) {
  var key = _toPrimitive7(arg, "string");
  return _typeof9(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey7, "_toPropertyKey");
function _toPrimitive7(input, hint) {
  if (_typeof9(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof9(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive7, "_toPrimitive");
function _classCallCheck5(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
__name(_classCallCheck5, "_classCallCheck");
function _inherits5(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf5(subClass, superClass);
}
__name(_inherits5, "_inherits");
function _createSuper5(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct5();
  return /* @__PURE__ */ __name(function _createSuperInternal() {
    var Super = _getPrototypeOf5(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf5(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn5(this, result);
  }, "_createSuperInternal");
}
__name(_createSuper5, "_createSuper");
function _possibleConstructorReturn5(self, call) {
  if (call && (_typeof9(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized5(self);
}
__name(_possibleConstructorReturn5, "_possibleConstructorReturn");
function _assertThisInitialized5(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
__name(_assertThisInitialized5, "_assertThisInitialized");
function _wrapNativeSuper5(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper5 = /* @__PURE__ */ __name(function _wrapNativeSuper6(Class2) {
    if (Class2 === null || !_isNativeFunction5(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct5(Class2, arguments, _getPrototypeOf5(this).constructor);
    }
    __name(Wrapper, "Wrapper");
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf5(Wrapper, Class2);
  }, "_wrapNativeSuper");
  return _wrapNativeSuper5(Class);
}
__name(_wrapNativeSuper5, "_wrapNativeSuper");
function _construct5(Parent, args, Class) {
  if (_isNativeReflectConstruct5()) {
    _construct5 = Reflect.construct.bind();
  } else {
    _construct5 = /* @__PURE__ */ __name(function _construct6(Parent2, args2, Class2) {
      var a2 = [null];
      a2.push.apply(a2, args2);
      var Constructor = Function.bind.apply(Parent2, a2);
      var instance = new Constructor();
      if (Class2) _setPrototypeOf5(instance, Class2.prototype);
      return instance;
    }, "_construct");
  }
  return _construct5.apply(null, arguments);
}
__name(_construct5, "_construct");
function _isNativeReflectConstruct5() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
__name(_isNativeReflectConstruct5, "_isNativeReflectConstruct");
function _isNativeFunction5(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
__name(_isNativeFunction5, "_isNativeFunction");
function _setPrototypeOf5(o, p2) {
  _setPrototypeOf5 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : /* @__PURE__ */ __name(function _setPrototypeOf6(o2, p3) {
    o2.__proto__ = p3;
    return o2;
  }, "_setPrototypeOf");
  return _setPrototypeOf5(o, p2);
}
__name(_setPrototypeOf5, "_setPrototypeOf");
function _getPrototypeOf5(o) {
  _getPrototypeOf5 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : /* @__PURE__ */ __name(function _getPrototypeOf6(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  }, "_getPrototypeOf");
  return _getPrototypeOf5(o);
}
__name(_getPrototypeOf5, "_getPrototypeOf");
var InvalidError = /* @__PURE__ */ (function(_Error) {
  _inherits5(InvalidError2, _Error);
  var _super = _createSuper5(InvalidError2);
  function InvalidError2(reason) {
    var _this;
    _classCallCheck5(this, InvalidError2);
    _this = _super.call(this, "invalid");
    _this.reason = reason;
    return _this;
  }
  __name(InvalidError2, "InvalidError");
  return _createClass5(InvalidError2);
})(/* @__PURE__ */ _wrapNativeSuper5(Error));

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/parseSheetData/types/Number.js
function NumberType(value) {
  if (typeof value === "string") {
    var stringifiedValue = value;
    value = Number(value);
    if (String(value) !== stringifiedValue) {
      throw new InvalidError("not_a_number");
    }
  }
  if (typeof value !== "number") {
    throw new InvalidError("not_a_number");
  }
  if (isNaN(value)) {
    throw new InvalidError("invalid_number");
  }
  if (!isFinite(value)) {
    throw new InvalidError("out_of_bounds");
  }
  return value;
}
__name(NumberType, "NumberType");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/parseSheetData/types/String.js
function StringType(value) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    if (isNaN(value)) {
      throw new InvalidError("invalid_number");
    }
    if (!isFinite(value)) {
      throw new InvalidError("out_of_bounds");
    }
    return String(value);
  }
  throw new InvalidError("not_a_string");
}
__name(StringType, "StringType");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/parseSheetData/types/Boolean.js
function BooleanType(value) {
  if (typeof value === "boolean") {
    return value;
  }
  throw new InvalidError("not_a_boolean");
}
__name(BooleanType, "BooleanType");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/parseSheetData/types/Date.js
function DateType(value) {
  if (value instanceof Date) {
    if (isNaN(value.valueOf())) {
      throw new InvalidError("out_of_bounds");
    }
    return value;
  }
  throw new InvalidError("not_a_date");
}
__name(DateType, "DateType");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/utility/isObject.js
var objectConstructor = {}.constructor;
function isObject(object) {
  return object !== void 0 && object !== null && object.constructor === objectConstructor;
}
__name(isObject, "isObject");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/parseSheetData/parseSheetData.js
function _typeof10(o) {
  "@babel/helpers - typeof";
  return _typeof10 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof10(o);
}
__name(_typeof10, "_typeof");
function _slicedToArray3(arr, i2) {
  return _arrayWithHoles3(arr) || _iterableToArrayLimit3(arr, i2) || _unsupportedIterableToArray5(arr, i2) || _nonIterableRest3();
}
__name(_slicedToArray3, "_slicedToArray");
function _iterableToArrayLimit3(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i2, u, a2 = [], f = true, o = false;
    try {
      if (i2 = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i2.call(t)).done) && (a2.push(e.value), a2.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a2;
  }
}
__name(_iterableToArrayLimit3, "_iterableToArrayLimit");
function _toArray(arr) {
  return _arrayWithHoles3(arr) || _iterableToArray(arr) || _unsupportedIterableToArray5(arr) || _nonIterableRest3();
}
__name(_toArray, "_toArray");
function _nonIterableRest3() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
__name(_nonIterableRest3, "_nonIterableRest");
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
__name(_iterableToArray, "_iterableToArray");
function _arrayWithHoles3(arr) {
  if (Array.isArray(arr)) return arr;
}
__name(_arrayWithHoles3, "_arrayWithHoles");
function ownKeys3(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
__name(ownKeys3, "ownKeys");
function _objectSpread3(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys3(Object(t), true).forEach(function(r2) {
      _defineProperty3(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys3(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
__name(_objectSpread3, "_objectSpread");
function _defineProperty3(obj, key, value) {
  key = _toPropertyKey8(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
__name(_defineProperty3, "_defineProperty");
function _toPropertyKey8(arg) {
  var key = _toPrimitive8(arg, "string");
  return _typeof10(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey8, "_toPropertyKey");
function _toPrimitive8(input, hint) {
  if (_typeof10(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof10(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive8, "_toPrimitive");
function _createForOfIteratorHelperLoose4(o, allowArrayLike) {
  var it2 = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it2) return (it2 = it2.call(o)).next.bind(it2);
  if (Array.isArray(o) || (it2 = _unsupportedIterableToArray5(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it2) o = it2;
    var i2 = 0;
    return function() {
      if (i2 >= o.length) return { done: true };
      return { done: false, value: o[i2++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
__name(_createForOfIteratorHelperLoose4, "_createForOfIteratorHelperLoose");
function _unsupportedIterableToArray5(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray5(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray5(o, minLen);
}
__name(_unsupportedIterableToArray5, "_unsupportedIterableToArray");
function _arrayLikeToArray5(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
  return arr2;
}
__name(_arrayLikeToArray5, "_arrayLikeToArray");
var EMPTY_CELL_VALUE3 = null;
function parseSheetData(data, schema, optionsCustom) {
  checkpoint("parse sheet data using schema");
  var objects = [];
  var errors = [];
  var parsedRows = parseSheetDataWithPerRowErrors(data, schema, optionsCustom);
  var parsedRowIndex = 0;
  for (var _iterator = _createForOfIteratorHelperLoose4(parsedRows), _step; !(_step = _iterator()).done; ) {
    var _step$value = _step.value, object = _step$value.object, rowErrors = _step$value.errors;
    if (rowErrors) {
      errors = errors.concat(rowErrors.map(
        // Add row number property to each row error.
        function(rowError) {
          return _objectSpread3(_objectSpread3({}, rowError), {}, {
            row: parsedRowIndex + 1
          });
        }
      ));
    } else {
      objects.push(object);
    }
    parsedRowIndex++;
  }
  checkpoint("end");
  if (errors.length > 0) {
    return {
      errors
    };
  }
  return {
    objects
  };
}
__name(parseSheetData, "parseSheetData");
function parseSheetDataWithPerRowErrors(data, schema, optionsCustom) {
  validateSchema(schema);
  var options = applyDefaultOptions(optionsCustom);
  var _data = _toArray(data), columns = _data[0], dataRows = _data.slice(1);
  return dataRows.map(function(row) {
    return parseDataRow(row, schema, columns, options);
  });
}
__name(parseSheetDataWithPerRowErrors, "parseSheetDataWithPerRowErrors");
function parseDataRow(dataRow, schema, columns, options) {
  var schemaEntry = {
    schema
  };
  var _parseProperty = parseProperty(dataRow, schemaEntry, void 0, columns, options), value = _parseProperty.value, isEmptyValue2 = _parseProperty.isEmptyValue, errors = _parseProperty.errors, children = _parseProperty.children;
  var dummyParentObject = {
    // The "dummy" parent object has a "dummy" value.
    // This value is irrelevant because it won't be read anywhere.
    value: PARSED_OBJECT_TREE_START,
    // The "dummy" parent object is empty if the parsed row is empty.
    isEmptyValue: isEmptyValue2,
    // The "dummy" object has the same errors as the parsed row.
    errors,
    // The parsed object by default is not required to have any data
    // so the "dummy" object is not required.
    isRequired: void 0
  };
  var requiredErrors = runPendingRequiredValidations(
    schemaEntry,
    value,
    isEmptyValue2,
    errors,
    children,
    // Simulate a "dummy" parent object for the top-level object.
    dummyParentObject.isRequired,
    dummyParentObject.value,
    dummyParentObject.isEmptyValue,
    dummyParentObject.errors,
    columns
  );
  if (errors || requiredErrors) {
    return {
      errors: (errors || []).concat(requiredErrors || [])
    };
  }
  return {
    object: transformValue(value, isEmptyValue2, void 0, options)
  };
}
__name(parseDataRow, "parseDataRow");
function parseObject(row, schema, path, columns, options) {
  var object = {};
  var isEmptyObject = true;
  var errors = [];
  var children = [];
  for (var _i = 0, _Object$keys = Object.keys(schema); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    var child = parseProperty(row, schema[key], getPropertyPath(key, path), columns, options);
    if (child.errors) {
      errors = errors.concat(child.errors);
    } else {
      object[key] = transformValue(child.value, child.isEmptyValue, getPropertyPath(key, path), options);
      if (isEmptyObject && !child.isEmptyValue) {
        isEmptyObject = false;
      }
    }
    children.push(_objectSpread3(_objectSpread3({}, child), {}, {
      // `schemaEntry` will be used when running `required` validation of this property (later),
      schemaEntry: schema[key]
    }));
  }
  if (errors.length > 0) {
    return {
      // Return the errors.
      errors,
      // Return the `children` because `required` validations still have to be run (later).
      children
    };
  }
  return {
    value: object,
    isEmptyValue: isEmptyObject,
    // Return the `children` because `required` validations still have to be run (later).
    children
  };
}
__name(parseObject, "parseObject");
function parseProperty(row, schemaEntry, path, columns, options) {
  var columnIndex = schemaEntry.column ? columns.indexOf(schemaEntry.column) : void 0;
  var isMissingColumn = schemaEntry.column ? columnIndex < 0 : void 0;
  var _ref = schemaEntry.column ? isMissingColumn ? {
    value: options.propertyValueWhenColumnIsMissing,
    isEmptyValue: true
  } : parseCellValueWithPossibleErrors(row[columnIndex], schemaEntry, columnIndex, options) : parseObject(row, schemaEntry.schema, path, columns, options), value = _ref.value, isEmptyValue2 = _ref.isEmptyValue, errors = _ref.errors, children = _ref.children;
  if (errors) {
    return {
      // Return the errors.
      errors,
      // Return the `children` because `required` validations still have to be run (later).
      children
    };
  }
  return {
    value,
    isEmptyValue: isEmptyValue2,
    // Return the `children` because `required` validations still have to be run (later).
    children
  };
}
__name(parseProperty, "parseProperty");
function parseCellValueWithPossibleErrors(cellValue, schemaEntry, columnIndex, options) {
  var _parseCellValue = parseCellValue(cellValue, schemaEntry, options), value = _parseCellValue.value, isEmptyValue2 = _parseCellValue.isEmptyValue, errorMessage = _parseCellValue.error, errorReason = _parseCellValue.reason;
  if (errorMessage) {
    var error = createError({
      error: errorMessage,
      reason: errorReason,
      column: schemaEntry.column,
      columnIndex,
      valueType: schemaEntry.type,
      value: cellValue
    });
    return {
      errors: [error]
    };
  }
  return {
    value,
    isEmptyValue: isEmptyValue2
  };
}
__name(parseCellValueWithPossibleErrors, "parseCellValueWithPossibleErrors");
function parseCellValue(cellValue, schemaEntry, options) {
  if (cellValue === void 0) {
    return {
      value: options.propertyValueWhenColumnIsMissing,
      isEmptyValue: true
    };
  }
  if (cellValue === EMPTY_CELL_VALUE3) {
    return {
      value: options.propertyValueWhenCellIsEmpty,
      isEmptyValue: true
    };
  }
  if (Array.isArray(schemaEntry.type)) {
    return parseArrayValue(cellValue, schemaEntry, options);
  }
  return parseValue(cellValue, schemaEntry, options);
}
__name(parseCellValue, "parseCellValue");
function parseArrayValue(value, schemaEntry, options) {
  if (typeof value !== "string") {
    return {
      error: "not_a_string"
    };
  }
  var isEmptyArray = true;
  var errors = [];
  var reasons = [];
  var values = parseSeparatedSubstrings(value, options.separatorCharacter).map(function(substring) {
    if (errors.length > 0) {
      return;
    }
    if (!substring) {
      errors.push("invalid");
      reasons.push("syntax");
      return;
    }
    var _parseValue = parseValue(substring, schemaEntry, options), value2 = _parseValue.value, isEmptyValue2 = _parseValue.isEmptyValue, error = _parseValue.error, reason = _parseValue.reason;
    if (error) {
      errors.push(error);
      reasons.push(reason);
      return;
    }
    if (isEmptyArray && !isEmptyValue2) {
      isEmptyArray = false;
    }
    return value2;
  });
  if (errors.length > 0) {
    return {
      error: errors[0],
      reason: reasons[0]
    };
  }
  return {
    value: values,
    isEmptyValue: isEmptyArray
  };
}
__name(parseArrayValue, "parseArrayValue");
function parseValue(value, schemaEntry, options) {
  if (value === EMPTY_CELL_VALUE3) {
    return {
      value,
      isEmptyValue: true
    };
  }
  var result;
  if (schemaEntry.type) {
    result = parseValueOfType(
      value,
      // Get the type of the value.
      //
      // Handle the case if it's a comma-separated value.
      // Example `type`: String[]
      // Example Input Value: 'Barack Obama, "String, with, colons", Donald Trump'
      // Example Parsed Value: ['Barack Obama', 'String, with, colons', 'Donald Trump']
      //
      Array.isArray(schemaEntry.type) ? schemaEntry.type[0] : schemaEntry.type,
      options
    );
  } else {
    result = {
      value
    };
  }
  if (result.error) {
    return result;
  }
  if (value === EMPTY_CELL_VALUE3) {
    return {
      value,
      isEmptyValue: true
    };
  }
  if (schemaEntry.oneOf) {
    var errorAndReason = validateOneOf(result.value, schemaEntry.oneOf);
    if (errorAndReason) {
      return errorAndReason;
    }
  }
  if (schemaEntry.validate) {
    try {
      schemaEntry.validate(result.value);
    } catch (error) {
      return {
        error: error.message
      };
    }
  }
  return {
    value: result.value,
    isEmptyValue: isEmptyValue(result.value)
  };
}
__name(parseValue, "parseValue");
function validateOneOf(value, oneOf) {
  if (oneOf.indexOf(value) < 0) {
    return {
      error: "invalid",
      reason: "unknown"
    };
  }
}
__name(validateOneOf, "validateOneOf");
function parseValueOfType(value, type) {
  switch (type) {
    case String:
      return parseValueUsingTypeParser(value, StringType);
    case Number:
      return parseValueUsingTypeParser(value, NumberType);
    case Date:
      return parseValueUsingTypeParser(value, DateType);
    case Boolean:
      return parseValueUsingTypeParser(value, BooleanType);
    default:
      if (typeof type !== "function") {
        throw new Error("Unsupported schema `type`: ".concat(type && type.name || type));
      }
      return parseValueUsingTypeParser(value, type);
  }
}
__name(parseValueOfType, "parseValueOfType");
function parseValueUsingTypeParser(value, type) {
  try {
    var parsedValue = type(value);
    if (parsedValue === void 0) {
      return {
        value: EMPTY_CELL_VALUE3
      };
    }
    return {
      value: parsedValue
    };
  } catch (error) {
    var result = {
      error: error.message
    };
    if (error.reason) {
      result.reason = error.reason;
    }
    return result;
  }
}
__name(parseValueUsingTypeParser, "parseValueUsingTypeParser");
function getNextSubstring(string, separatorCharacter, startIndex) {
  var i2 = 0;
  var substring = "";
  while (startIndex + i2 < string.length) {
    var character = string[startIndex + i2];
    if (character === separatorCharacter) {
      return [substring, i2];
    } else {
      substring += character;
      i2++;
    }
  }
  return [substring, i2];
}
__name(getNextSubstring, "getNextSubstring");
function parseSeparatedSubstrings(string, separatorCharacter) {
  var elements = [];
  var index = 0;
  while (index < string.length) {
    var _getNextSubstring = getNextSubstring(string, separatorCharacter, index), _getNextSubstring2 = _slicedToArray3(_getNextSubstring, 2), substring = _getNextSubstring2[0], length = _getNextSubstring2[1];
    index += length + separatorCharacter.length;
    elements.push(substring.trim());
  }
  return elements;
}
__name(parseSeparatedSubstrings, "parseSeparatedSubstrings");
function transformValue(value, isEmptyValue2, path, options) {
  if (isEmptyValue2) {
    if (isObject(value)) {
      return options.transformEmptyObject(value, {
        path
      });
    } else if (Array.isArray(value)) {
      return options.transformEmptyArray(value, {
        path
      });
    }
  }
  return value;
}
__name(transformValue, "transformValue");
function getPropertyPath(propertyName, parentObjectPath) {
  return "".concat(parentObjectPath ? parentObjectPath + "." : "").concat(propertyName);
}
__name(getPropertyPath, "getPropertyPath");
function runPendingRequiredValidations(schemaEntry, value, isEmptyValue2, errors, children, parentObjectIsRequired, parentObjectValue, parentObjectValueIsEmpty, parentObjectErrors, columns) {
  var requiredErrors = [];
  var isRequired = isPropertyRequired(schemaEntry, parentObjectIsRequired, parentObjectValue, parentObjectValueIsEmpty, parentObjectErrors);
  if (isRequired && isEmptyValue2) {
    requiredErrors.push(createError({
      error: "required",
      column: schemaEntry.column,
      columnIndex: columns.indexOf(schemaEntry.column),
      valueType: schemaEntry.type,
      value
    }));
  }
  if (children) {
    for (var _iterator2 = _createForOfIteratorHelperLoose4(children), _step2; !(_step2 = _iterator2()).done; ) {
      var child = _step2.value;
      var requiredErrorsOfChild = runPendingRequiredValidations(
        child.schemaEntry,
        child.value,
        child.isEmptyValue,
        child.errors,
        child.children,
        // The following properties describe the parent object of the `child`,
        // i.e. the current (iterated) object.
        isRequired,
        value,
        isEmptyValue2,
        errors,
        columns
      );
      if (requiredErrorsOfChild) {
        requiredErrors = requiredErrors.concat(requiredErrorsOfChild);
      }
    }
  }
  if (requiredErrors.length > 0) {
    return requiredErrors;
  }
}
__name(runPendingRequiredValidations, "runPendingRequiredValidations");
function isPropertyRequired(schemaEntry, parentObjectIsRequired, parentObjectValue, parentObjectValueIsEmpty, parentObjectErrors) {
  if (parentObjectIsRequired === false && (parentObjectValueIsEmpty || parentObjectErrors)) {
    return false;
  }
  return schemaEntry.required && (typeof schemaEntry.required === "boolean" ? schemaEntry.required : (
    // If there were any non-`required` errors when parsing the parent object,
    // the `parentObject` will be `undefined`. In that case, "complex" `required()`
    // validations — the ones where `required` is a function — can't really be run
    // because those validations assume a fully and correctly parsed parent object
    // be passed as an argument, and the thing is that the `parentObject` is unknown.
    // As a result, only "basic" `required` validations could be run,
    // i.e. the ones where `required` is just a boolean, and "complex" `required`
    // validations, i.e. the ones where `required` is a functions, should be skipped,
    // because it's better to skip some `required` errors than to trigger falsy ones.
    parentObjectErrors ? false : schemaEntry.required(parentObjectValue)
  ));
}
__name(isPropertyRequired, "isPropertyRequired");
function createError(_ref2) {
  var column = _ref2.column, columnIndex = _ref2.columnIndex, valueType = _ref2.valueType, value = _ref2.value, errorMessage = _ref2.error, reason = _ref2.reason;
  var error = {
    error: errorMessage,
    column,
    columnIndex,
    value
  };
  if (reason) {
    error.reason = reason;
  }
  if (valueType) {
    error.type = valueType;
  }
  return error;
}
__name(createError, "createError");
function validateSchema(schema) {
  for (var _i2 = 0, _Object$keys2 = Object.keys(schema); _i2 < _Object$keys2.length; _i2++) {
    var key = _Object$keys2[_i2];
    var schemaEntry = schema[key];
    if (_typeof10(schemaEntry.type) === "object" && !Array.isArray(schemaEntry.type)) {
      throw new Error("When defining a nested schema, use a `schema` property instead of a `type` property");
    }
    if (!schemaEntry.schema) {
      if (!schemaEntry.column) {
        throw new Error('"column" not defined for schema entry "'.concat(key, '".'));
      }
    }
  }
  validateObjectSchemaRequiredProperty(schema, void 0);
}
__name(validateSchema, "validateSchema");
function validateObjectSchemaRequiredProperty(schema, required) {
  if (required !== void 0 && required !== false) {
    throw new Error("In a schema, a nested object can have a `required` property but the only allowed value is `undefined` or `false`. Otherwise, a \"required\" error for a nested object would have to include a specific `column` title and a nested object doesn't have one. You've specified the following `required`: ".concat(required));
  }
  for (var _i3 = 0, _Object$keys3 = Object.keys(schema); _i3 < _Object$keys3.length; _i3++) {
    var key = _Object$keys3[_i3];
    if (isObject(schema[key].schema)) {
      if (schema[key].column) {
        throw new Error("In a schema, `column` property is only allowed when describing a property value rather than a nested object. Key: ".concat(key, ". Schema:\n").concat(JSON.stringify(schema[key], null, 2)));
      }
      validateObjectSchemaRequiredProperty(schema[key].schema, schema[key].required);
    }
  }
}
__name(validateObjectSchemaRequiredProperty, "validateObjectSchemaRequiredProperty");
function isEmptyValue(value) {
  return value === void 0 || value === null;
}
__name(isEmptyValue, "isEmptyValue");
var DEFAULT_OPTIONS = {
  propertyValueWhenColumnIsMissing: void 0,
  propertyValueWhenCellIsEmpty: null,
  // shouldSkipRequiredValidationWhenColumnIsMissing: () => false,
  // `transformEmptyObject(object, { path })` applies to both the top-level object
  // and any of its nested objects.
  transformEmptyObject: /* @__PURE__ */ __name(function transformEmptyObject() {
    return null;
  }, "transformEmptyObject"),
  transformEmptyArray: /* @__PURE__ */ __name(function transformEmptyArray() {
    return null;
  }, "transformEmptyArray"),
  separatorCharacter: ","
};
function applyDefaultOptions(options) {
  if (options) {
    return _objectSpread3(_objectSpread3({}, DEFAULT_OPTIONS), options);
  } else {
    return DEFAULT_OPTIONS;
  }
}
__name(applyDefaultOptions, "applyDefaultOptions");
var PARSED_OBJECT_TREE_START = {};

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/export/parseSheet.js
function _typeof11(o) {
  "@babel/helpers - typeof";
  return _typeof11 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof11(o);
}
__name(_typeof11, "_typeof");
var _excluded2 = ["schema"];
function ownKeys4(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
__name(ownKeys4, "ownKeys");
function _objectSpread4(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys4(Object(t), true).forEach(function(r2) {
      _defineProperty4(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys4(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
__name(_objectSpread4, "_objectSpread");
function _defineProperty4(obj, key, value) {
  key = _toPropertyKey9(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
__name(_defineProperty4, "_defineProperty");
function _toPropertyKey9(arg) {
  var key = _toPrimitive9(arg, "string");
  return _typeof11(key) === "symbol" ? key : String(key);
}
__name(_toPropertyKey9, "_toPropertyKey");
function _toPrimitive9(input, hint) {
  if (_typeof11(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof11(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
__name(_toPrimitive9, "_toPrimitive");
function _objectWithoutProperties2(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose2(source, excluded);
  var key, i2;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
      key = sourceSymbolKeys[i2];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
__name(_objectWithoutProperties2, "_objectWithoutProperties");
function _objectWithoutPropertiesLoose2(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i2;
  for (i2 = 0; i2 < sourceKeys.length; i2++) {
    key = sourceKeys[i2];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
__name(_objectWithoutPropertiesLoose2, "_objectWithoutPropertiesLoose");
function parseSheet2(createWorkerFunction2, parseXml2, contents, sheet, optionsWithSchema) {
  var _ref = optionsWithSchema || {}, schema = _ref.schema, options = _objectWithoutProperties2(_ref, _excluded2);
  return parseSpreadsheetContentsInWorker(createWorkerFunction2, parseXml2, contents, _objectSpread4(_objectSpread4({}, options), {}, {
    sheets: [sheet === void 0 ? 1 : sheet]
  })).then(function(sheets) {
    var sheetData = sheets[0].data;
    if (schema) {
      return parseSheetData(sheetData, schema);
    }
    return sheetData;
  });
}
__name(parseSheet2, "parseSheet");

// ../../node_modules/.bun/read-excel-file@9.3.10/node_modules/read-excel-file/modules/export/readSheetUniversal.js
var createWorkerFunction = void 0;
function readSheet(input, sheet, options) {
  if (!options && sheet && typeof sheet !== "number" && typeof sheet !== "string") {
    options = sheet;
    sheet = void 0;
  }
  return unpackXlsxFile(input).then(function(contents) {
    return parseSheet2(createWorkerFunction, parseXml, contents, sheet, options);
  });
}
__name(readSheet, "readSheet");

// src/validation.ts
var EXPECTED_HEADERS = [
  "member_id",
  "full_name",
  "joined_on",
  "status",
  "phone",
  "email",
  "whatsapp"
];
var REQUIRED_HEADERS = ["member_id", "full_name", "joined_on"];
function text(value) {
  if (value == null) return "";
  return String(value).trim();
}
__name(text, "text");
function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return text(value);
}
__name(normalizeDate, "normalizeDate");
function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parts = value.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
__name(isCalendarDate, "isCalendarDate");
function isContactNumber(value) {
  return !value || /^[+0-9()\-\s]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.length <= 24;
}
__name(isContactNumber, "isContactNumber");
function validateHeaders(headers) {
  const normalized = headers.map((header) => text(header).toLowerCase());
  const duplicates = normalized.filter(
    (header, index) => header && normalized.indexOf(header) !== index
  );
  const missing = REQUIRED_HEADERS.filter((header) => !normalized.includes(header));
  const unsupported = normalized.filter(
    (header) => header && !EXPECTED_HEADERS.includes(header)
  );
  const orderErrors = [
    ...normalized[0] !== "member_id" ? ["The first column must be member_id."] : [],
    ...normalized[1] !== "full_name" ? ["The second column must be full_name."] : []
  ];
  return {
    normalized,
    errors: [
      ...orderErrors,
      ...missing.map((header) => `Missing required column: ${header}.`),
      ...new Set(duplicates.map((header) => `Column appears more than once: ${header}.`)),
      ...new Set(unsupported.map((header) => `Unsupported column: ${header}.`))
    ]
  };
}
__name(validateHeaders, "validateHeaders");
function validateMemberRow(rowNumber, source, options = {}) {
  const data = {
    member_id: text(source.member_id),
    full_name: text(source.full_name),
    joined_on: normalizeDate(source.joined_on),
    status: text(source.status).toUpperCase() || "ACTIVE",
    phone: text(source.phone),
    email: text(source.email).toLowerCase(),
    whatsapp: text(source.whatsapp)
  };
  const errors = [];
  if (!data.member_id) errors.push("Member ID is required.");
  else if (data.member_id.length > 100) errors.push("Member ID must be 100 characters or fewer.");
  if (!data.full_name) errors.push("Full name is required.");
  else if (data.full_name.length > 200) errors.push("Full name must be 200 characters or fewer.");
  if (!data.joined_on) errors.push("Joined date is required.");
  else if (!isCalendarDate(data.joined_on)) errors.push("Joined date must use YYYY-MM-DD.");
  if (data.status !== "ACTIVE" && data.status !== "ARCHIVED")
    errors.push("Status must be ACTIVE or ARCHIVED.");
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("Email address is not valid.");
  if (!isContactNumber(data.phone)) errors.push("Phone number is not valid.");
  if (!isContactNumber(data.whatsapp)) errors.push("WhatsApp number is not valid.");
  if (options.duplicateInFile) errors.push("Member ID is repeated in this spreadsheet.");
  if (options.existsInGym) errors.push("Member ID already exists in this gym.");
  if (options.containsFormula) errors.push("Formula cells are not supported.");
  return { rowNumber, data, errors };
}
__name(validateMemberRow, "validateMemberRow");
function isBlankRow(row) {
  return row.every((value) => text(value) === "");
}
__name(isBlankRow, "isBlankRow");

// src/index.ts
var MAX_ROWS = 1e4;
var INSERT_BATCH_SIZE = 250;
function jsonResponse(body, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}
__name(jsonResponse, "jsonResponse");
function csvRows(source) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (character === "\r" && source[index + 1] === "\n") index += 1;
    } else {
      cell += character;
    }
  }
  if (quoted) throw new Error("The CSV contains an unclosed quoted cell.");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
__name(csvRows, "csvRows");
function assertSafeXlsxSize(bytes) {
  let expandedSize = 0;
  for (let index = 0; index <= bytes.length - 46; index += 1) {
    if (bytes[index] === 80 && bytes[index + 1] === 75 && bytes[index + 2] === 1 && bytes[index + 3] === 2) {
      expandedSize += new DataView(bytes.buffer, bytes.byteOffset + index + 24, 4).getUint32(
        0,
        true
      );
      if (expandedSize > 50 * 1024 * 1024)
        throw new Error("The XLSX expands beyond the safe processing limit.");
    }
  }
}
__name(assertSafeXlsxSize, "assertSafeXlsxSize");
async function parseSpreadsheet(buffer, contentType) {
  const formulaRows = /* @__PURE__ */ new Set();
  if (contentType === "text/csv") {
    const rows2 = csvRows(
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(buffer).replace(/^\uFEFF/, "")
    );
    rows2.forEach((row, rowIndex) => {
      if (row.some((value, columnIndex) => {
        const header = String(rows2[0]?.[columnIndex] ?? "").trim().toLowerCase();
        const cell = String(value ?? "").trim();
        return /^[=@]/.test(cell) || !["phone", "whatsapp"].includes(header) && /^[+-]/.test(cell);
      }))
        formulaRows.add(rowIndex + 1);
    });
    return { rows: rows2, formulaRows };
  }
  const bytes = new Uint8Array(buffer);
  assertSafeXlsxSize(bytes);
  const archive = unzipSync(bytes);
  const decoder = new TextDecoder();
  for (const [name, contents] of Object.entries(archive)) {
    if (!/^xl\/worksheets\/sheet\d+\.xml$/i.test(name)) continue;
    const xml = decoder.decode(contents);
    for (const match of xml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      if (!/<f(?:\s|>)/.test(match[2] ?? "")) continue;
      const rowNumber = /\br="[A-Z]+(\d+)"/i.exec(match[1] ?? "")?.[1];
      if (rowNumber) formulaRows.add(Number(rowNumber));
    }
  }
  const rows = await readSheet(buffer, 1);
  return { rows, formulaRows };
}
__name(parseSpreadsheet, "parseSpreadsheet");
async function processImport(importId, env) {
  const sql = cs(env.DATABASE_URL);
  const claimed = await sql`
    UPDATE member_imports
    SET status = 'VALIDATING', started_at = COALESCE(started_at, NOW()),
        attempts = attempts + 1, failure_message = NULL, updated_at = NOW()
    WHERE id = ${importId}::uuid AND status = 'QUEUED'
    RETURNING id, gym_id, storage_key, content_type
  `;
  const memberImport = claimed[0];
  if (!memberImport) return;
  const object = await env.MEMBER_IMPORTS.get(memberImport.storage_key);
  if (!object) throw new Error("The uploaded spreadsheet could not be found.");
  const { rows, formulaRows } = await parseSpreadsheet(
    await object.arrayBuffer(),
    memberImport.content_type
  );
  if (!rows.length) throw new Error("The spreadsheet is empty.");
  const { normalized: headers, errors: headerErrors } = validateHeaders(rows[0]);
  if (headerErrors.length) throw new Error(headerErrors.join(" "));
  const sourceRows = rows.slice(1).map((values, index) => ({ values, rowNumber: index + 2 })).filter(({ values }) => !isBlankRow(values));
  if (!sourceRows.length) throw new Error("The spreadsheet does not contain any member rows.");
  if (sourceRows.length > MAX_ROWS)
    throw new Error("The spreadsheet contains more than 10,000 rows.");
  const records = sourceRows.map(({ values, rowNumber }) => ({
    rowNumber,
    source: Object.fromEntries(headers.map((header, index) => [header, values[index]]))
  }));
  const memberIds = records.map(({ source }) => String(source.member_id ?? "").trim()).filter(Boolean);
  const existing = await sql`
    SELECT member_number
    FROM members
    WHERE gym_id = ${memberImport.gym_id}::uuid
      AND member_number = ANY(${memberIds}::text[])
  `;
  const existingIds = new Set(existing.map((member) => member.member_number));
  const seenIds = /* @__PURE__ */ new Set();
  const validated = records.map(({ rowNumber, source }) => {
    const memberId = String(source.member_id ?? "").trim();
    const duplicateInFile = Boolean(memberId && seenIds.has(memberId));
    if (memberId) seenIds.add(memberId);
    return validateMemberRow(rowNumber, source, {
      duplicateInFile,
      existsInGym: existingIds.has(memberId),
      containsFormula: formulaRows.has(rowNumber)
    });
  });
  await sql`DELETE FROM member_import_rows WHERE import_id = ${importId}::uuid`;
  let validRows = 0;
  let excludedRows = 0;
  for (let offset = 0; offset < validated.length; offset += INSERT_BATCH_SIZE) {
    const batch = validated.slice(offset, offset + INSERT_BATCH_SIZE).map((row) => {
      const status = row.errors.length ? "EXCLUDED" : "VALID";
      if (status === "VALID") validRows += 1;
      else excludedRows += 1;
      return {
        rowNumber: row.rowNumber,
        memberId: row.data.member_id || null,
        fullName: row.data.full_name || null,
        normalizedData: row.data,
        errors: row.errors,
        status
      };
    });
    await sql`
      INSERT INTO member_import_rows
        (id, import_id, row_number, member_id, full_name, normalized_data, errors, status, created_at)
      SELECT gen_random_uuid(), ${importId}::uuid, (item->>'rowNumber')::integer,
        NULLIF(item->>'memberId', ''), NULLIF(item->>'fullName', ''),
        item->'normalizedData', item->'errors', (item->>'status')::"MemberImportRowStatus", NOW()
      FROM jsonb_array_elements(${JSON.stringify(batch)}::jsonb) AS item
    `;
    await sql`
      UPDATE member_imports
      SET total_rows = ${validated.length}, processed_rows = ${Math.min(offset + batch.length, validated.length)},
          valid_rows = ${validRows}, excluded_rows = ${excludedRows}, updated_at = NOW()
      WHERE id = ${importId}::uuid
    `;
  }
  await sql`
    UPDATE member_imports
    SET status = 'READY_FOR_REVIEW', processed_rows = total_rows,
        completed_at = NOW(), updated_at = NOW()
    WHERE id = ${importId}::uuid
  `;
}
__name(processImport, "processImport");
async function commitImport(importId, correctionImportId, env) {
  const sql = cs(env.DATABASE_URL);
  const claimed = await sql`
    UPDATE member_imports
    SET status = 'COMMITTING', failure_message = NULL, updated_at = NOW()
    WHERE id = ${importId}::uuid AND status = 'COMMITTING'
    RETURNING id, gym_id
  `;
  const memberImport = claimed[0];
  if (!memberImport) return;
  const correctionClause = correctionImportId ? sql`UNION ALL SELECT normalized_data FROM member_import_rows WHERE import_id = ${correctionImportId}::uuid AND status = 'VALID'` : sql``;
  await sql`
    WITH source AS (
      SELECT normalized_data
      FROM member_import_rows
      WHERE import_id = ${importId}::uuid AND status = 'VALID'
      ${correctionClause}
    ), inserted AS (
      INSERT INTO members (id, gym_id, member_number, full_name, joined_on, status, created_at, updated_at)
      SELECT gen_random_uuid(), ${memberImport.gym_id}::uuid,
        normalized_data->>'member_id', normalized_data->>'full_name',
        (normalized_data->>'joined_on')::date,
        (normalized_data->>'status')::"MemberRecordStatus", NOW(), NOW()
      FROM source
      ON CONFLICT (gym_id, member_number) DO NOTHING
      RETURNING id, member_number
    )
    INSERT INTO member_contacts (id, member_id, kind, value, is_primary, created_at)
    SELECT gen_random_uuid(), inserted.id, contact.kind::"ContactKind", contact.value, TRUE, NOW()
    FROM inserted
    JOIN source ON source.normalized_data->>'member_id' = inserted.member_number
    CROSS JOIN LATERAL (VALUES
      ('PHONE', NULLIF(source.normalized_data->>'phone', '')),
      ('EMAIL', NULLIF(source.normalized_data->>'email', '')),
      ('WHATSAPP', NULLIF(source.normalized_data->>'whatsapp', ''))
    ) AS contact(kind, value)
    WHERE contact.value IS NOT NULL
  `;
  const remaining = correctionImportId ? (await sql`SELECT excluded_rows FROM member_imports WHERE id = ${correctionImportId}::uuid`)[0]?.excluded_rows ?? 0 : 0;
  const importedRows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM member_import_rows
    WHERE import_id = ${importId}::uuid AND status = 'VALID'
    ${correctionImportId ? sql`UNION ALL SELECT COUNT(*)::int FROM member_import_rows WHERE import_id = ${correctionImportId}::uuid AND status = 'VALID'` : sql``}
  `).reduce((sum, row) => sum + row.count, 0);
  await sql`
    UPDATE member_imports
    SET status = ${remaining ? "COMPLETED_WITH_ERRORS" : "COMPLETED"}::"MemberImportStatus",
        imported_rows = ${importedRows}, excluded_rows = ${remaining},
        processed_rows = total_rows, completed_at = NOW(), updated_at = NOW()
    WHERE id = ${importId}::uuid
  `;
}
__name(commitImport, "commitImport");
async function recordFailure(importId, error, env, retry) {
  const sql = cs(env.DATABASE_URL);
  const message = error instanceof Error ? error.message : "Spreadsheet validation failed.";
  await sql`
    UPDATE member_imports
    SET status = ${retry ? "QUEUED" : "FAILED"}::"MemberImportStatus",
        failure_message = ${message.slice(0, 1e3)}, updated_at = NOW(),
        completed_at = ${retry ? null : /* @__PURE__ */ new Date()}::timestamptz
    WHERE id = ${importId}::uuid
  `;
}
__name(recordFailure, "recordFailure");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return jsonResponse({ ok: true });
    if (request.method !== "POST" || url.pathname !== "/enqueue")
      return jsonResponse({ error: "Not found." }, 404);
    if (request.headers.get("authorization") !== `Bearer ${env.IMPORT_WORKER_SECRET}`) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON." }, 400);
    }
    if (typeof body.importId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.importId)) {
      return jsonResponse({ error: "A valid import ID is required." }, 400);
    }
    const kind = body.kind === "commit" ? "commit" : "validate";
    const correctionImportId = typeof body.correctionImportId === "string" ? body.correctionImportId : null;
    await env.IMPORT_QUEUE.send({ kind, importId: body.importId, correctionImportId });
    return jsonResponse({ queued: true }, 202);
  },
  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        if (message.body.kind === "commit") await commitImport(message.body.importId, message.body.correctionImportId ?? null, env);
        else await processImport(message.body.importId, env);
        message.ack();
      } catch (error) {
        const retry = message.attempts < 3;
        await recordFailure(message.body.importId, error, env, retry);
        if (retry) message.retry({ delaySeconds: 10 * message.attempts });
        else message.ack();
      }
    }
  },
  async scheduled(_controller, env) {
    const sql = cs(env.DATABASE_URL);
    await sql`DELETE FROM member_imports WHERE created_at < NOW() - INTERVAL '30 days'`;
  }
};

// ../../node_modules/.bun/wrangler@4.129.0+d261cbb50c58adf8/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/.bun/wrangler@4.129.0+d261cbb50c58adf8/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-93n5DM/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/.bun/wrangler@4.129.0+d261cbb50c58adf8/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-93n5DM/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

@neondatabase/serverless/index.mjs:
  (*! Bundled license information:
  
  ieee754/index.js:
    (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  
  buffer/index.js:
    (*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     *)
  *)
*/
//# sourceMappingURL=index.js.map
