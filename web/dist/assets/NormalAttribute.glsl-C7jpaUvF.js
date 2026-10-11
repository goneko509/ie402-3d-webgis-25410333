import{n as e}from"./glsl-D85RBwKC.js";function t(t,n){switch(t.fragment.code.add(e`vec3 screenDerivativeNormal(vec3 positionView) {
return normalize(cross(dFdx(positionView), dFdy(positionView)));
}`),n.normalType){case 1:t.attributes.add(`normalCompressed`,`vec2`),t.vertex.code.add(e`vec3 decompressNormal(vec2 normal) {
float z = 1.0 - abs(normal.x) - abs(normal.y);
return vec3(normal + sign(normal) * min(z, 0.0), z);
}
vec3 normalModel() {
return decompressNormal(normalCompressed);
}`);break;case 0:t.attributes.add(`normal`,`vec3`),t.vertex.code.add(e`vec3 normalModel() {
return normal;
}`);break;default:n.normalType;case 2:case 3:}}export{t};