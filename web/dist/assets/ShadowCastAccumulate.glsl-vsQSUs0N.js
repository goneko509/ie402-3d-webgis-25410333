import{n as e}from"./glsl-D85RBwKC.js";import{t}from"./Texture2DBindUniform-4_yYNByJ.js";import{t as n}from"./ScreenSpacePass.glsl-9L-_X5OK.js";import{t as r}from"./ShaderBuilder-DxA0HNjK.js";import{r as i}from"./ReadShadowMap.glsl-oFMVskK0.js";import{t as a}from"./calculateUVZShadowFromDepth.glsl-CBdO4HM-.js";var o=255,s=1/255;function c(o){let c=new r,{fragment:l}=c;c.include(n),c.include(a),l.include(i,!1),l.constants.add(`sampleValue`,`float`,s);let u=o.index===1?`vec2`:`float`;return c.outputs.add(`sampleCount`,u),l.uniforms.add(new t(`depthMap`,e=>e.depth?.attachment)).main.add(e`
    sampleCount = ${u}(0.0);

    vec3 uvzShadow = calculateUVZShadowFromDepth(uv, textureSize(shadowMap,0), depthMap);
    // The shadow map sampler returns a value between 0 and 1, we take the midpoint as we count discrete samples
    bool shadow = readShadowMaps(uvzShadow) > 0.5;
    if (shadow) {
      sampleCount = ${u}(sampleValue); // Add 1 to the sample count
    }
  `),c}var l=Object.freeze(Object.defineProperty({__proto__:null,ShadowCastMaxSamples:255,build:c},Symbol.toStringTag,{value:`Module`}));export{c as n,o as r,l as t};