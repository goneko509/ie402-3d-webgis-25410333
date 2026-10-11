import{o as e}from"./vec2f64-IO40D2xB.js";import{t}from"./NoParameters-XZJ-8n06.js";import{n}from"./glsl-D85RBwKC.js";import{t as r}from"./FloatPassUniform-DeUP8HjM.js";import{t as i}from"./BooleanBindUniform-B2b909hF.js";import{t as a}from"./ReadDepth.glsl-Ca_0z8Pl.js";import{t as o}from"./Texture2DPassUniform-CiCHIiok.js";import{t as s}from"./ScreenSpacePass.glsl-9L-_X5OK.js";import{t as c}from"./ShaderBuilder-DxA0HNjK.js";import{t as l}from"./Texture2DDrawUniform-D7tKvlQx.js";import{t as u}from"./oitResolution.glsl-DBbxNNXQ.js";import{t as d}from"./ditherNoise.glsl-UOpZ2vbN.js";import{t as f}from"./Float2DrawUniform-BbCPIPVz.js";import{t as p}from"./CameraSpace.glsl-DcIGS7L_.js";import{t as m}from"./GlobalIlluminationColorQuantization.glsl-DASwhWnI.js";import{t as h}from"./GlobalIlluminationWeights.glsl-Bk-lJUwL.js";var g=4,_=class extends t{constructor(){super(...arguments),this.blurSize=e()}};function v(){let e=new c,t=e.fragment;e.include(s),e.include(p),e.include(h),t.include(a),t.include(d,y),t.include(m);let u=5e4;t.uniforms.add(new i(`hasEmission`,e=>e.hasEmission),new o(`depthMap`,e=>e.depthTexture),new o(`normalMap`,e=>e.normalTexture),new l(`globalIlluminationTexture`,e=>e.texture),new l(`globalIlluminationWeightTexture`,e=>e.weightTexture),new f(`blurSize`,e=>e.blurSize),new r(`scaleGlobalIllumination`,e=>e.scaleGlobalIllumination),new r(`projScale`,(e,t)=>{let n=t.camera.distance;return n>u?Math.max(0,e.projScale-(n-u)):e.projScale}));let _=.03;return t.code.add(n`
    void accumulateBlurSample(
      vec2 sampleUv,
      float sampleOffset,
      float centerDepth,
      vec3 centerNormal,
      float depthSharpness,
      bool skipOcclusionBlur,
      inout float emissionWeightSum,
      inout vec3 emissionSum,
      inout float occlusionWeightSum,
      inout float occlusionSum,
      float centerOcclusionBlendWeight
    ) {
      vec4 sampleGlobalIllumination = texture(globalIlluminationTexture, sampleUv);
      vec3 sampleNormal = texture(normalMap, sampleUv).rgb;
      float sampleDepth = linearDepthFromTexture(depthMap, sampleUv);

      float depthDelta = sampleDepth - centerDepth;
      bool isScaledGlobalIllumination = scaleGlobalIllumination < 1.0;
      float normalSimilarityWeight = globalIlluminationNormalSimilarityWeight(sampleNormal, centerNormal);
      float depthNormalCorrection = globalIlluminationDepthNormalCorrection(sampleNormal);
      vec3 emission = sampleGlobalIllumination.rgb;
      float emissionSpatialWeightMultiplier = isScaledGlobalIllumination ? ${n.float(400)} : 1.0;

      float emissionWeight = exp(
        -sampleOffset * sampleOffset * ${n.float(.04081632653061224)} * ${n.float(.1)} * emissionSpatialWeightMultiplier
        - depthDelta * depthDelta * depthSharpness * depthNormalCorrection
      );
      emissionWeight *= normalSimilarityWeight;
      emissionWeightSum += emissionWeight;
      emissionSum += emissionWeight * emission;

      if (skipOcclusionBlur) {
        return;
      }

      float occlusionSpatialKernelScale = centerOcclusionBlendWeight > ${n.float(_)}
        ? ${n.float(.08)}
        : ${n.float(1.5)};
      float occlusionWeight = exp(-sampleOffset * sampleOffset * occlusionSpatialKernelScale - depthDelta * depthDelta * depthSharpness);
      occlusionWeight *= normalSimilarityWeight;
      occlusionWeightSum += occlusionWeight;
      occlusionSum += occlusionWeight * sampleGlobalIllumination.a;
    }
  `),t.main.add(n`
    vec3 emissionSum = vec3(0.0);
    float emissionWeightSum = 0.0;

    vec4 centerGlobalIllumination = texture(globalIlluminationTexture, uv);
    float centerOcclusionBlendWeight = texture(globalIlluminationWeightTexture, uv).r;
    bool isScaledGlobalIllumination = scaleGlobalIllumination < 1.0;
    bool shouldReuseCenterOcclusion = isScaledGlobalIllumination && centerOcclusionBlendWeight <= ${n.float(_)};
    bool shouldSkipLowQualityBlur = !hasEmission && shouldReuseCenterOcclusion;
    if (shouldSkipLowQualityBlur) {
      fragColor = vec4(
        quantizeGlobalIlluminationColor(centerGlobalIllumination.rgb),
        centerGlobalIllumination.a
      );
      return;
    }

    float centerDepth = linearDepthFromTexture(depthMap, uv);
    vec3 centerNormal = texture(normalMap, uv).rgb;
    float occlusionSum = 0.0;
    float occlusionWeightSum = 0.0;

    float depthSharpness = globalIlluminationDepthSharpness(projScale, centerDepth);
    for (int sampleOffset = -${n.int(g)}; sampleOffset <= ${n.int(g)}; ++sampleOffset) {
      float sampleOffsetFloat = float(sampleOffset);
      vec2 sampleUv = uv + sampleOffsetFloat * blurSize;
      accumulateBlurSample(
        sampleUv,
        sampleOffsetFloat,
        centerDepth,
        centerNormal,
        depthSharpness,
        shouldReuseCenterOcclusion,
        emissionWeightSum,
        emissionSum,
        occlusionWeightSum,
        occlusionSum,
        centerOcclusionBlendWeight
      );
    }

    float occlusion = shouldReuseCenterOcclusion ? centerGlobalIllumination.a : occlusionSum / occlusionWeightSum;
    vec3 blurredEmission = (emissionSum / emissionWeightSum).rgb;

    // heuristic dithering of the colors to remove banding, color shifts and wrong color accumulation
    float dither = ditherNoise(vec4(blurredEmission, occlusion)) - 1./32768.0;
    blurredEmission += isScaledGlobalIllumination ? 0.85 * dither : dither;

    fragColor = vec4(quantizeGlobalIlluminationColor(blurredEmission), occlusion);
  `),e}var y=new u;y.useFloatBlend=!1;var b=Object.freeze(Object.defineProperty({__proto__:null,GlobalIlluminationBlurDrawParameters:_,build:v},Symbol.toStringTag,{value:`Module`}));export{_ as n,b as r,v as t};