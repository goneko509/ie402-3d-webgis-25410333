import{n as e}from"./glsl-D85RBwKC.js";import{t}from"./FloatBindUniform-C4h6J6-v.js";function n(n){n.uniforms.add(new t(`dpDummy`,()=>1)).code.add(e`vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {
vec3 hiD = hiA + hiB;
vec3 loD = loA + loB;
return  dpDummy * hiD + loD;
}`)}export{n as t};