import"./NoParameters-XZJ-8n06.js";import{t as e}from"./Float3PassUniform-YEiGS05C.js";import{n as t,t as n}from"./glsl-D85RBwKC.js";import{t as r}from"./Float3DrawUniform-C2uWcyOr.js";import{t as i}from"./FloatBindUniform-C4h6J6-v.js";import{t as a}from"./Texture2DPassUniform-CiCHIiok.js";import{r as o}from"./Emissions.glsl-BPJzLPVg.js";import{t as s}from"./Texture2DDrawUniform-D7tKvlQx.js";import"./pbrUtils-FIDIL8_6.js";function c(i,c){let l=c.pbrMode,u=i.fragment;if(l!==2&&l!==0&&l!==1)return void u.code.add(t`void applyPBRFactors() {}`);if(l===0)return void u.code.add(t`void applyPBRFactors() {}
float getBakedOcclusion() { return 1.0; }`);if(l===2)return void u.code.add(t`vec3 mrr = vec3(0.0, 0.6, 0.2);
float occlusion = 1.0;
void applyPBRFactors() {}
float getBakedOcclusion() { return 1.0; }`);let{hasMetallicRoughnessTexture:d,hasMetallicRoughnessTextureTransform:f,hasOcclusionTexture:p,hasOcclusionTextureTransform:m,bindType:h}=c;(d||p)&&i.include(o,c),u.code.add(t`vec3 mrr;
float occlusion;`),d&&u.uniforms.add(h===1?new a(`texMetallicRoughness`,e=>e.textureMetallicRoughness):new s(`texMetallicRoughness`,e=>e.textureMetallicRoughness)),p&&u.uniforms.add(h===1?new a(`texOcclusion`,e=>e.textureOcclusion):new s(`texOcclusion`,e=>e.textureOcclusion)),u.uniforms.add(h===1?new e(`mrrFactors`,e=>e.mrrFactors):new r(`mrrFactors`,e=>e.mrrFactors)),u.code.add(t`
    ${n(d,t`void applyMetallicRoughness(vec2 uv) {
            vec3 metallicRoughness = textureLookup(texMetallicRoughness, uv).rgb;
            mrr[0] *= metallicRoughness.b;
            mrr[1] *= metallicRoughness.g;
          }`)}

    ${n(p,`void applyOcclusion(vec2 uv) { occlusion *= textureLookup(texOcclusion, uv).r; }`)}

    float getBakedOcclusion() {
      return ${p?`occlusion`:`1.0`};
    }

    void applyPBRFactors() {
      mrr = mrrFactors;
      occlusion = 1.0;

      ${n(d,`applyMetallicRoughness(${f?`metallicRoughnessUV`:`vuv0`});`)}
      ${n(p,`applyOcclusion(${m?`occlusionUV`:`vuv0`});`)}
    }
  `)}function l(e,n){n.snowCover&&(e.uniforms.add(new i(`snowCover`,e=>e.snowCover)).code.add(t`float getSnow(vec3 normal, vec3 groundNormal) {
return smoothstep(0.5, 0.55, dot(normal, groundNormal)) * snowCover;
}
float getRealisticTreeSnow(vec3 faceNormal, vec3 shadingNormal, vec3 groundNormal) {
float snow = min(1.0, smoothstep(0.5, 0.55, dot(faceNormal, groundNormal)) +
smoothstep(0.5, 0.55, dot(-faceNormal, groundNormal)) +
smoothstep(0.0, 0.1, dot(shadingNormal, groundNormal)));
return snow * snowCover;
}`),e.code.add(t`vec3 applySnowToMRR(vec3 mrr, float snow) {
return mix(mrr, vec3(0.0, 1.0, 0.04), snow);
}`))}export{c as n,l as t};