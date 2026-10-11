import{t as e}from"./NoParameters-XZJ-8n06.js";import{n as t,t as n}from"./glsl-D85RBwKC.js";import{t as r}from"./FloatPassUniform-DeUP8HjM.js";import{t as i}from"./Float2BindUniform-C6b2PHzh.js";import{t as a}from"./ReadDepth.glsl-Ca_0z8Pl.js";import{t as o}from"./Texture2DPassUniform-CiCHIiok.js";import{t as s}from"./ScreenSpacePass.glsl-9L-_X5OK.js";import{t as c}from"./ShaderBuilder-DxA0HNjK.js";function l(e){e.code.add(t`const float MAX_RGBA_FLOAT =
255.0 / 256.0 +
255.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 / 256.0;
const vec4 FIXED_POINT_FACTORS = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
vec4 floatToRgba(const float value) {
float valueInValidDomain = clamp(value, 0.0, MAX_RGBA_FLOAT);
vec4 fixedPointU8 = floor(fract(valueInValidDomain * FIXED_POINT_FACTORS) * 256.0);
const float toU8AsFloat = 1.0 / 255.0;
return fixedPointU8 * toU8AsFloat;
}`),e.code.add(t`const vec4 RGBA_TO_FLOAT_FACTORS = vec4(
255.0 / (256.0),
255.0 / (256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0 * 256.0)
);
float rgbaToFloat(vec4 rgba) {
return dot(rgba, RGBA_TO_FLOAT_FACTORS);
}`)}var u=class extends e{constructor(){super(...arguments),this.opacity=1,this.mipmapLevel=0}};function d(e){let u=new c,{blendEmissive:d,mode:f}=e;u.include(s),u.fragment.uniforms.add(new o(`tex`,({texture:e})=>e));let p=f===3;return p?(u.fragment.include(a),u.fragment.include(l),u.fragment.uniforms.add(new i(`nearFar`,e=>e.camera.nearFar))):u.fragment.uniforms.add(new r(`opacity`,e=>e.opacity),new r(`level`,({mipmapLevel:e})=>e)),d&&(u.outputs.add(`fragColor`,`vec4`,0),u.outputs.add(`fragEmission`,`vec4`,1)),u.fragment.main.add(t`
    ${p?t`
          float normalizedLinearDepth = (-linearDepthFromTexture(tex, uv) - nearFar[0]) / (nearFar[1] - nearFar[0]);
          fragColor = floatToRgba(normalizedLinearDepth);`:t`fragColor = textureLod(tex, uv, level) * opacity;`}
    ${n(d,`fragEmission = vec4(0.0, 0.0, 0.0, fragColor.a);`)}`),u}var f=Object.freeze(Object.defineProperty({__proto__:null,CompositingPassParameters:u,build:d},Symbol.toStringTag,{value:`Module`}));export{d as n,u as r,f as t};