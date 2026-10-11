function e(e){e.code.add(`
  vec4 blendColorsPremultiplied(vec4 source, vec4 dest) {
    float oneMinusSourceAlpha = 1.0 - source.a;
    return source + dest * oneMinusSourceAlpha;
  }
  `)}function t(e,t){return e[0]=t[0]*t[3],e[1]=t[1]*t[3],e[2]=t[2]*t[3],e[3]=t[3],e}export{t as n,e as t};