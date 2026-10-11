import{r as e}from"./mat3f64-B6tTkprt.js";import{l as t}from"./vec2f64-IO40D2xB.js";import{n}from"./glsl-D85RBwKC.js";import{t as r}from"./Matrix3PassUniform-B98tjNzt.js";import{t as i}from"./Float2PassUniform-BYZ61_RB.js";import{t as a}from"./Texture2DPassUniform-CiCHIiok.js";import{r as o}from"./Emissions.glsl-BPJzLPVg.js";import{t as s}from"./Texture2DDrawUniform-D7tKvlQx.js";import{t as c}from"./Float2DrawUniform-BbCPIPVz.js";function l(e,t){return d(e,t)}function u(e,t){return d(e,t)}function d(l,u){let d=l.fragment,{hasVertexTangents:f,doubleSidedMode:p,hasNormalTexture:m,textureCoordinateType:h,bindType:g,hasNormalTextureTransform:_}=u;f?(l.attributes.add(`tangent`,`vec4`),l.varyings.add(`vTangent`,`vec4`),p===2?d.code.add(n`mat3 computeTangentSpace(vec3 normal) {
float tangentHeadedness = gl_FrontFacing ? vTangent.w : -vTangent.w;
vec3 tangent = normalize(gl_FrontFacing ? vTangent.xyz : -vTangent.xyz);
vec3 bitangent = cross(normal, tangent) * tangentHeadedness;
return mat3(tangent, bitangent, normal);
}`):d.code.add(n`mat3 computeTangentSpace(vec3 normal) {
float tangentHeadedness = vTangent.w;
vec3 tangent = normalize(vTangent.xyz);
vec3 bitangent = cross(normal, tangent) * tangentHeadedness;
return mat3(tangent, bitangent, normal);
}`)):d.code.add(n`mat3 computeTangentSpace(vec3 normal, vec3 pos, vec2 st) {
vec3 Q1 = dFdx(pos);
vec3 Q2 = dFdy(pos);
vec2 stx = dFdx(st);
vec2 sty = dFdy(st);
float det = stx.t * sty.s - sty.t * stx.s;
vec3 T = stx.t * Q2 - sty.t * Q1;
T = T - normal * dot(normal, T);
T *= inversesqrt(max(dot(T,T), 1.e-10));
vec3 B = sign(det) * cross(normal, T);
return mat3(T, B, normal);
}`),m&&h!==0&&(l.include(o,u),d.uniforms.add(g===1?new a(`normalTexture`,e=>e.textureNormal):new s(`normalTexture`,e=>e.textureNormal)),_&&(d.uniforms.add(g===1?new i(`scale`,e=>e.scale??t):new c(`scale`,e=>e.scale??t)),d.uniforms.add(new r(`normalTextureTransformMatrix`,t=>t.normalTextureTransformMatrix??e))),d.code.add(n`vec3 computeTextureNormal(mat3 tangentSpace, vec2 uv) {
vec3 rawNormal = textureLookup(normalTexture, uv).rgb * 2.0 - 1.0;`),_&&d.code.add(n`mat3 normalRotation = mat3(normalTextureTransformMatrix[0][0]/scale[0], normalTextureTransformMatrix[0][1]/scale[1], 0.0,
normalTextureTransformMatrix[1][0]/scale[0], normalTextureTransformMatrix[1][1]/scale[1], 0.0,
0.0, 0.0, 0.0 );
rawNormal.xy = (normalRotation * vec3(rawNormal.x, rawNormal.y, 1.0)).xy;`),d.code.add(n`return tangentSpace * rawNormal;
}`))}export{l as n,u as t};