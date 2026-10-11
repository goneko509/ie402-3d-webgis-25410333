import{f as e,o as t,r as n}from"./ShaderOutput-BpkC-wrv.js";import{n as r,t as i}from"./glsl-D85RBwKC.js";import{t as a}from"./OutputHighlight.glsl-CfLvc4dK.js";import{t as o}from"./ColorConversion.glsl-C9xFjUmo.js";import{t as s}from"./alphaCutoff.glsl-BK3hw-re.js";import{t as c}from"./Emissions.glsl-BPJzLPVg.js";import{n as l}from"./oitResolution.glsl-DBbxNNXQ.js";import{t as u}from"./EmissionDimming.glsl-CkRb1NSc.js";import{t as d}from"./ditherNoise.glsl-UOpZ2vbN.js";function f(f,p){f.include(a,p),f.include(c,p);let{fragment:m,outputs:h}=f,{output:g,hasEmission:_,discardInvisibleFragments:v,oitPremultipliedAlpha:y,snowCover:b,useFloatBlend:x,emissionDimmingPass:S}=p,C=g===11,w=n(g),T=t(g),E=e(g)&&!w,D=0;(E||w)&&h.add(`fragColor`,`vec4`,D++),w&&h.add(`fragAlpha`,`float`,D++),_&&h.add(`fragEmission`,`vec4`,D++),m.include(o),m.include(s),m.include(l,p),m.include(d,p),S&&m.include(u,p),m.code.add(r`
    void outputColorHighlightOLID(vec4 finalColor, vec3 emissiveSymbolColor ${i(b,`, float snow`)}) {
      ${i(C,`finalColor.a = 1.0;`)}
      ${i(v,`if (finalColor.a < alphaCutoff) { discard; }`)}

      ${i(w,`float noise = ditherNoise(finalColor);\n         fragColor = ${i(y,`finalColor`,`premultiplyAlpha(finalColor)`)};\n         fragColor = vec4(fragColor.rgb * floatBlendOutputScale + noise, fragColor.a);\n         float scaledAlpha = finalColor.a * floatBlendOutputScale;\n         fragAlpha = scaledAlpha + noise;\n         ${i(!x,`fragAlpha = fragAlpha < alphaCutoff ? scaledAlpha : fragAlpha;`)}`)}
      ${i(T&&y&&v,`finalColor.rgb /= finalColor.a;`)}
      ${i(E,`fragColor = finalColor;`)}
      ${i(_,S?`fragEmission = vec4(emissionDimming(premultiplyAlpha(finalColor).rgb, finalColor.a), 0.0);`:`fragEmission = ${i(b,`mix(finalColor.a * getEmissions(emissiveSymbolColor), vec4(0.0), snow);`,`finalColor.a * getEmissions(emissiveSymbolColor);`)}\n            float emissionNoise = ditherNoise(fragEmission);\n            fragEmission.rgb = fragEmission.rgb * floatBlendOutputScale + emissionNoise;\n            fragEmission.a = finalColor.a;\n            fragEmission = premultiplyAlpha(fragEmission);\n            `)}
      calculateOcclusionAndOutputHighlight();
      ${i(C,`outputObjectAndLayerIdColor();`)}
    }
  `)}export{f as t};