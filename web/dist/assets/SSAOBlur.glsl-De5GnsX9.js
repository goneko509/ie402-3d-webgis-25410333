import{n as e}from"./glsl-D85RBwKC.js";import{t}from"./FloatPassUniform-DeUP8HjM.js";import{t as n}from"./ReadDepth.glsl-Ca_0z8Pl.js";import{t as r}from"./Texture2DPassUniform-CiCHIiok.js";import{t as i}from"./ScreenSpacePass.glsl-9L-_X5OK.js";import{t as a}from"./ShaderBuilder-DxA0HNjK.js";import{t as o}from"./Texture2DDrawUniform-D7tKvlQx.js";import{t as s}from"./Float2DrawUniform-BbCPIPVz.js";var c=4;function l(){let l=new a,u=l.fragment;return l.include(i),u.include(n),u.uniforms.add(new r(`depthMap`,e=>e.depthTexture),new o(`tex`,e=>e.colorTexture),new s(`blurSize`,e=>e.blurSize),new t(`projScale`,(e,t)=>{let n=t.camera.distance;return n>5e4?Math.max(0,e.projScale-(n-5e4)):e.projScale})),u.code.add(e`
    void blurFunction(vec2 uv, float r, float center_d, float sharpness, inout float wTotal, inout float bTotal) {
      float c = texture(tex, uv).r;
      float d = linearDepthFromTexture(depthMap, uv);

      float ddiff = d - center_d;

      float w = exp(-r * r * ${e.float(.08)} - ddiff * ddiff * sharpness);
      wTotal += w;
      bTotal += w * c;
    }
  `),l.outputs.add(`fragBlur`,`float`),u.main.add(e`
    float b = 0.0;
    float w_total = 0.0;

    float center_d = linearDepthFromTexture(depthMap, uv);

    float sharpness = -0.05 * projScale / center_d;
    for (int r = -${e.int(c)}; r <= ${e.int(c)}; ++r) {
      float rf = float(r);
      vec2 uvOffset = uv + rf * blurSize;
      blurFunction(uvOffset, rf, center_d, sharpness, w_total, b);
    }
    fragBlur = b / w_total;`),l}var u=Object.freeze(Object.defineProperty({__proto__:null,build:l},Symbol.toStringTag,{value:`Module`}));export{l as n,u as t};