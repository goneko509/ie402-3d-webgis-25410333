import{n as e}from"./MaterialUtil-D2ESw9-Q.js";import{f as t}from"./ShaderOutput-BpkC-wrv.js";import{t as n}from"./Float3PassUniform-YEiGS05C.js";import{n as r,t as i}from"./glsl-D85RBwKC.js";import{n as a,t as o}from"./View.glsl-DjwuylqK.js";import{t as s}from"./Float4PassUniform-Cu2daSgY.js";import{r as c}from"./VerticalOffset.glsl-sOuGraVh.js";import{t as l}from"./FloatPassUniform-DeUP8HjM.js";import{i as u}from"./Slice.glsl-DNk_1_Sk.js";import{a as d,i as f,t as ee}from"./VisualVariables.glsl-C-_1q24O.js";import{t as te}from"./Texture2DPassUniform-CiCHIiok.js";import{t as ne}from"./ShaderBuilder-DxA0HNjK.js";import{t as re}from"./AlphaCutoff-Diw6w_WO.js";import{i as ie}from"./Emissions.glsl-BPJzLPVg.js";import{t as ae}from"./OutputColorHighlightOLID.glsl-BPsfn2UR.js";import{t as oe}from"./NormalAttribute.glsl-C7jpaUvF.js";import{a as se,t as p}from"./DiscardOrAdjustAlpha.glsl-BmyZeaqn.js";import{t as m}from"./Offset.glsl-DlxeJxhu.js";import{t as h}from"./Transform.glsl-ByRGlEcg.js";import{a as g,c as _,i as v,l as y,n as b,o as x,r as S,s as C,t as w}from"./TextureTransformUV.glsl-by2kHHnZ.js";import{t as T}from"./VertexColor.glsl-DrV8C2l2.js";import{n as E}from"./ComputeNormalTexture.glsl-CnhZcGxG.js";import{t as D}from"./PhysicallyBasedRendering.glsl-BFHZucno.js";import{a as O,n as k,r as A,t as j}from"./EvaluateSceneLighting.glsl-B1DpaE-z.js";import{n as M}from"./MainLighting.glsl-BzpgU6pB.js";import{t as N}from"./Normals.glsl-D2dK_E0k.js";import{n as P,t as F}from"./SnowCover.glsl-DWxgN5NZ.js";import{n as ce,t as I}from"./ReadShadowMap.glsl-oFMVskK0.js";import{t as L}from"./MixExternalColor.glsl-cTOJOQI5.js";function R(R){let z=new ne,{attributes:B,vertex:V,fragment:H,varyings:U}=z,{output:W,normalType:G,offsetBackfaces:K,spherical:le,snowCover:q,pbrMode:J,textureAlphaPremultiplied:ue,instancedDoublePrecision:Y,hasVertexColors:X,hasVertexTangents:Z,hasColorTexture:Q,hasNormalTexture:de,hasNormalTextureTransform:fe,hasColorTextureTransform:pe}=R;if(a(V,R),B.add(`position`,`vec3`),V.inputs.add(`position`,()=>`position`),U.add(`vpos`,`vec3`,{invariant:!0}),z.include(ee,R),z.include(_,R),z.include(c,R),z.include(w,R),!t(W))return z.include(x,R),z;z.include(v,R),z.include(S,R),z.include(b,R),z.include(g,R),o(V,R),z.include(oe,R),z.include(h);let $=G===0||G===1;return $&&K&&z.include(m),z.include(E,R),z.include(se,R),z.include(y,R),U.add(`vPositionLocal`,`vec3`),z.include(ie,R),z.include(C,R),z.include(T,R),V.uniforms.add(new s(`externalColor`,e=>e.externalColor,{supportsNaN:!0})),U.add(`vcolorExt`,`vec4`),V.include(d),V.include(f),z.include(Y?I:ce,R),V.main.add(r`
    forwardVertexColor();

    MaskedColor maskedColor =
      applySymbolColor(applyVVColor(applyInstanceColor(createMaskedFromNaNColor(externalColor))));

    vcolorExt = maskedColor.color;
    forwardColorMixMode(maskedColor.mask);

    vpos = getVertexInLocalOriginSpace();
    vPositionLocal = vpos - view[3].xyz;
    vpos = subtractOrigin(vpos);
    ${i($,`vNormalWorld = dpNormal(vvLocalNormal(normalModel()));`)}
    vpos = addVerticalOffset(vpos, localOrigin);
    ${i(Z,`vTangent = dpTransformVertexTangent(tangent);`)}
    gl_Position = transformPosition(proj, view, vpos);
    ${i($&&K,`gl_Position = offsetBackfacingClipPosition(gl_Position, vpos, vNormalWorld, cameraPosition);`)}

    forwardTextureCoordinates();
    forwardColorUV();
    forwardNormalUV();
    forwardEmissiveUV();
    forwardOcclusionUV();
    forwardMetallicRoughnessUV();

    if (opacityMixMode != ${r.int(e.ignore)} && vcolorExt.a < ${r.float(re)}) {
      gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
    }
    forwardLinearDepthToReadShadowMap();
  `),H.include(A,R),H.include(O,R),z.include(p,R),H.include(u,R),z.include(ae,R),o(H,R),H.uniforms.add(V.uniforms.get(`localOrigin`),new n(`ambient`,e=>e.ambient),new n(`diffuse`,e=>e.diffuse),new l(`opacity`,e=>e.opacity),new l(`layerOpacity`,e=>e.layerOpacity)),Q&&H.uniforms.add(new te(`tex`,e=>e.texture)),z.include(P,R),H.include(D,R),H.include(L),z.include(N,R),H.include(F,R),k(H),j(H),M(H),H.main.add(r`
    discardBySlice(vpos);
    ${Q?r`
            vec4 texColor = texture(tex, ${pe?`colorUV`:`vuv0`});
            ${i(ue,`texColor.rgb /= texColor.a;`)}
            discardOrAdjustAlpha(texColor);`:r`vec4 texColor = vec4(1.0);`}
    shadingParams.viewDirection = normalize(vpos - cameraPosition);
    ${G===2?r`vec3 normal = screenDerivativeNormal(vPositionLocal);`:r`shadingParams.normalView = vNormalWorld;
                vec3 normal = shadingNormal(shadingParams);`}
    applyPBRFactors();
    float ssao = evaluateAmbientOcclusionInverse() * getBakedOcclusion();

    vec3 posWorld = vpos + localOrigin;

    float additionalAmbientScale = additionalDirectedAmbientLight(posWorld);
    float shadow = readShadow(additionalAmbientScale, vpos);

    vec3 matColor = max(ambient, diffuse);
    vec3 albedo = mixExternalColor(${i(X,`vColor.rgb *`)} matColor, texColor.rgb, vcolorExt.rgb, colorMixMode);
    float opacity_ = layerOpacity * mixExternalOpacity(${i(X,`vColor.a * `)} opacity, texColor.a, vcolorExt.a, opacityMixMode);

    ${de?`mat3 tangentSpace = computeTangentSpace(${Z?`normal`:`normal, vpos, vuv0`});\n           vec3 shadingNormal = computeTextureNormal(tangentSpace, ${fe?`normalUV`:`vuv0`});`:`vec3 shadingNormal = normal;`}
    vec3 normalGround = ${le?`normalize(posWorld);`:`vec3(0.0, 0.0, 1.0);`}

    ${i(q,r`
          float snow = getSnow(normal, normalGround);
          albedo = mix(albedo, vec3(1), snow);
          shadingNormal = mix(shadingNormal, normal, snow);
          ssao = mix(ssao, 1.0, snow);`)}

    vec3 additionalLight = ssao * mainLightIntensity * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor;

    ${J===1||J===2?r`
            float additionalAmbientIrradiance = additionalAmbientIrradianceFactor * mainLightIntensity[2];
            ${i(q,`mrr = applySnowToMRR(mrr, snow);`)}
            vec3 shadedColor = evaluateSceneLightingPBR(shadingNormal, albedo, shadow, 1.0 - ssao, additionalLight, shadingParams.viewDirection, normalGround, mrr, additionalAmbientIrradiance);`:r`vec3 shadedColor = evaluateSceneLighting(shadingNormal, albedo, shadow, 1.0 - ssao, additionalLight);`}
    vec4 finalColor = vec4(shadedColor, opacity_);
    outputColorHighlightOLID(applySlice(finalColor, vpos), albedo ${i(q,`, snow`)});
  `),z}var z=Object.freeze(Object.defineProperty({__proto__:null,build:R},Symbol.toStringTag,{value:`Module`}));export{R as n,z as t};