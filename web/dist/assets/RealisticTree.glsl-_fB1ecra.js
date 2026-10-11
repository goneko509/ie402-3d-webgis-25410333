import{n as e}from"./MaterialUtil-D2ESw9-Q.js";import{f as t}from"./ShaderOutput-BpkC-wrv.js";import{t as n}from"./Float3PassUniform-YEiGS05C.js";import{n as r,t as i}from"./glsl-D85RBwKC.js";import{n as a,t as o}from"./View.glsl-DjwuylqK.js";import{t as s}from"./Float4PassUniform-Cu2daSgY.js";import{r as c}from"./VerticalOffset.glsl-sOuGraVh.js";import{t as l}from"./FloatPassUniform-DeUP8HjM.js";import{i as u}from"./Slice.glsl-DNk_1_Sk.js";import{a as d,i as f,t as p}from"./VisualVariables.glsl-C-_1q24O.js";import{t as m}from"./Texture2DPassUniform-CiCHIiok.js";import{t as h}from"./ShaderBuilder-DxA0HNjK.js";import{t as g}from"./alphaCutoff.glsl-BK3hw-re.js";import{i as _}from"./Emissions.glsl-BPJzLPVg.js";import{t as v}from"./OutputColorHighlightOLID.glsl-BPsfn2UR.js";import{t as y}from"./NormalAttribute.glsl-C7jpaUvF.js";import{t as b}from"./DiscardOrAdjustAlpha.glsl-BmyZeaqn.js";import{t as x}from"./Offset.glsl-DlxeJxhu.js";import{t as S}from"./Transform.glsl-ByRGlEcg.js";import{c as C,l as w,o as T,r as E,s as D,t as O}from"./TextureTransformUV.glsl-by2kHHnZ.js";import{t as k}from"./VertexColor.glsl-DrV8C2l2.js";import{t as A}from"./PhysicallyBasedRendering.glsl-BFHZucno.js";import{a as j,n as M,r as N,t as P}from"./EvaluateSceneLighting.glsl-B1DpaE-z.js";import{n as F,r as ee}from"./MainLighting.glsl-BzpgU6pB.js";import{n as I,t as L}from"./SnowCover.glsl-DWxgN5NZ.js";import{n as R,t as z}from"./ReadShadowMap.glsl-oFMVskK0.js";import{t as B}from"./MixExternalColor.glsl-cTOJOQI5.js";function V(V){let H=new h,{attributes:U,vertex:W,fragment:G,varyings:K}=H,{output:q,offsetBackfaces:J,pbrMode:Y,snowCover:X,spherical:Z}=V,Q=Y===1||Y===2;if(a(W,V),U.add(`position`,`vec3`),W.inputs.add(`position`,()=>`position`),K.add(`vpos`,`vec3`,{invariant:!0}),H.include(p,V),H.include(C,V),H.include(c,V),H.include(O,V),!t(q))return H.include(T,V),H;H.include(E,V),o(H.vertex,V),H.include(y,V),H.include(S),J&&H.include(x),K.add(`vNormalWorld`,`vec3`),K.add(`localvpos`,`vec3`,{invariant:!0}),H.include(_,V),H.include(D,V),H.include(w,V),H.include(k,V),W.include(d),W.include(f),W.uniforms.add(new s(`externalColor`,e=>e.externalColor,{supportsNaN:!0})),K.add(`vcolorExt`,`vec4`),H.include(V.instancedDoublePrecision?z:R,V),W.include(g),W.main.add(r`
    forwardVertexColor();

    MaskedColor maskedColorExt =
      applySymbolColor(applyVVColor(applyInstanceColor(createMaskedFromNaNColor(externalColor))));

    vcolorExt = maskedColorExt.color;
    forwardColorMixMode(maskedColorExt.mask);

    bool alphaCut = opacityMixMode != ${r.int(e.ignore)} && vcolorExt.a < alphaCutoff;
    vpos = getVertexInLocalOriginSpace();

    localvpos = vpos - view[3].xyz;
    vpos = subtractOrigin(vpos);
    vNormalWorld = dpNormal(vvLocalNormal(normalModel()));
    vpos = addVerticalOffset(vpos, localOrigin);
    vec4 basePosition = transformPosition(proj, view, vpos);

    forwardTextureCoordinates();
    forwardColorUV();
    forwardEmissiveUV();
    forwardLinearDepthToReadShadowMap();
    gl_Position = alphaCut ? vec4(1e38, 1e38, 1e38, 1.0) :
    ${i(J,`offsetBackfacingClipPosition(basePosition, vpos, vNormalWorld, cameraPosition);`,`basePosition;`)}
  `);let{hasColorTexture:$,hasColorTextureTransform:te}=V;return G.include(N,V),G.include(j,V),H.include(b,V),G.include(u,V),H.include(v,V),o(G,V),ee(G),M(G),P(G),G.uniforms.add(W.uniforms.get(`localOrigin`),W.uniforms.get(`view`),new n(`ambient`,e=>e.ambient),new n(`diffuse`,e=>e.diffuse),new l(`opacity`,e=>e.opacity),new l(`layerOpacity`,e=>e.layerOpacity)),$&&G.uniforms.add(new m(`tex`,e=>e.texture)),H.include(I,V),G.include(A,V),G.include(B),G.include(L,V),F(G),G.main.add(r`
      discardBySlice(vpos);
      vec4 texColor = ${$?`texture(tex, ${te?`colorUV`:`vuv0`})`:` vec4(1.0)`};
      ${i($,`${i(V.textureAlphaPremultiplied,`texColor.rgb /= texColor.a;`)}\n        discardOrAdjustAlpha(texColor);`)}
      vec3 viewDirection = normalize(vpos - cameraPosition);
      applyPBRFactors();
      float ssao = evaluateAmbientOcclusionInverse();
      ssao *= getBakedOcclusion();

      float additionalAmbientScale = additionalDirectedAmbientLight(vpos + localOrigin);
      vec3 additionalLight = ssao * mainLightIntensity * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor;
      float shadow = readShadow(additionalAmbientScale, vpos);
      vec3 matColor = max(ambient, diffuse);
      ${V.hasVertexColors?r`vec3 albedo = mixExternalColor(vColor.rgb * matColor, texColor.rgb, vcolorExt.rgb, colorMixMode);
             float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, opacityMixMode);`:r`vec3 albedo = mixExternalColor(matColor, texColor.rgb, vcolorExt.rgb, colorMixMode);
             float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, opacityMixMode);`}

      vec3 shadingNormal = normalize(vNormalWorld);
      vec3 groundNormal = ${Z?`normalize(vpos + localOrigin)`:`vec3(0.0, 0.0, 1.0)`};

      ${i(X,`vec3 faceNormal = screenDerivativeNormal(vpos);
         float snow = getRealisticTreeSnow(faceNormal, shadingNormal, groundNormal);
         albedo = mix(albedo, vec3(1), snow);`)}

      ${r`albedo *= 1.2;
             vec3 viewForward = vec3(view[0][2], view[1][2], view[2][2]);
             float alignmentLightView = clamp(dot(viewForward, -mainLightDirection), 0.0, 1.0);
             float transmittance = 1.0 - clamp(dot(viewForward, shadingNormal), 0.0, 1.0);
             float treeRadialFalloff = vColor.r;
             float backLightFactor = 0.5 * treeRadialFalloff * alignmentLightView * transmittance * (1.0 - shadow);
             additionalLight += backLightFactor * mainLightIntensity;`}

      ${Q?r`float additionalAmbientIrradiance = additionalAmbientIrradianceFactor * mainLightIntensity[2];
            ${i(X,`mrr = applySnowToMRR(mrr, snow);`)}
            vec3 shadedColor = evaluateSceneLightingPBR(shadingNormal, albedo, shadow, 1.0 - ssao, additionalLight, viewDirection, groundNormal, mrr, additionalAmbientIrradiance);`:r`vec3 shadedColor = evaluateSceneLighting(shadingNormal, albedo, shadow, 1.0 - ssao, additionalLight);`}
      vec4 finalColor = vec4(shadedColor, opacity_);
      outputColorHighlightOLID(applySlice(finalColor, vpos), albedo ${i(X,`, 1.0`)});`),H}var H=Object.freeze(Object.defineProperty({__proto__:null,build:V},Symbol.toStringTag,{value:`Module`}));export{H as n,V as t};