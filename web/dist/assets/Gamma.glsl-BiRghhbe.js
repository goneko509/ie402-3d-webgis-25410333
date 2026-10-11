import{f as e,n as t}from"./colorUtils-DZZ966ow.js";import{n}from"./glsl-D85RBwKC.js";function r(r){r.constants.add(`GAMMA`,`float`,e).constants.add(`INV_GAMMA`,`float`,t).code.add(n`vec3 delinearizeGamma(vec3 color) {
return pow(color, vec3(INV_GAMMA));
}
vec4 delinearizeGamma(vec4 color) {
return vec4(delinearizeGamma(color.rgb), color.a);
}
vec3 linearizeGamma(vec3 color) {
return pow(color, vec3(GAMMA));
}`)}export{r as t};