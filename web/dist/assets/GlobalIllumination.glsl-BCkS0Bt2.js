import{n as e}from"./enums-C3NXllrX.js";import{t}from"./NoParameters-XZJ-8n06.js";import{n,t as r}from"./glsl-D85RBwKC.js";import{t as i}from"./Matrix4BindUniform-DnHs9Hq_.js";import{t as a}from"./FloatPassUniform-DeUP8HjM.js";import{t as o}from"./Texture2DBindUniform-4_yYNByJ.js";import{t as s}from"./Float2BindUniform-C6b2PHzh.js";import{n as c,t as l}from"./ReadDepth.glsl-Ca_0z8Pl.js";import{t as u}from"./Texture2DPassUniform-CiCHIiok.js";import{t as d}from"./ScreenSpacePass.glsl-9L-_X5OK.js";import{t as f}from"./ShaderBuilder-DxA0HNjK.js";import{t as p}from"./Gamma.glsl-BiRghhbe.js";import{t as m}from"./CameraSpace.glsl-DcIGS7L_.js";import{r as h}from"./MainLighting.glsl-BzpgU6pB.js";import{t as g}from"./ScreenSpaceRayMarching.glsl-CHeCgPTI.js";import{t as _}from"./GlobalIlluminationColorQuantization.glsl-DASwhWnI.js";function v(e){e.include(l),e.uniforms.add(new s(`zProjectionMapLastFrame`,e=>c(e.reprojection.lastFrameCamera))),e.code.add(n`float linearDepthFromTextureLastFrame(sampler2D depthTexture, vec2 uv) {
return linearizeDepth(depthFromTexture(depthTexture, uv), zProjectionMapLastFrame);
}`)}var y=.01,b=.008,x=.002,S=.5,C=.02,w=.1,T=.008,E=.012,D=.008,O=40,k=.095,A=.008,j=60,M=2,N=.0039,P=.25,F=.15,I=25,L=.15,R=.5,z=1,B=1,V=16,H=class extends t{constructor(){super(...arguments),this.projScale=1,this.scaleGlobalIllumination=1,this.accumulatedFrames=0,this.temporalSampleFrame=0,this.rayMarchMinReach=L,this.rayMarchMaxReach=R,this.rayMarchWorldReach=25,this.rayMarchMinReachEmissionWeight=1,this.rayMarchMaxReachEmissionWeight=1,this.rayMarchMaxSteps=16,this.colorBleedWeight=F}};function U(t){let s=new f,c=s.fragment;return s.include(d),s.include(m),h(c),c.include(v),c.include(p),c.include(_),s.include(g,t),c.uniforms.add(new u(`normalMap`,e=>e.normalTexture),new u(`depthMap`,e=>e.depthTexture),new o(`lastFrameColorTexture`,e=>e.reprojection.lastFrameColor?.getTexture()),new o(`lastFrameDepthTexture`,e=>e.reprojection.lastFrameDepth?.attachment),new o(`lastFrameGlobalIlluminationTexture`,e=>e.globalIllumination?.getTexture()),new o(`lastFrameGlobalIlluminationWeightTexture`,t=>t.globalIllumination?.getTexture(e)),new i(`reprojectionViewMatrix`,e=>e.reprojection.viewMatrix),new i(`view`,e=>e.camera.viewMatrix),new a(`accumulatedFrames`,e=>e.accumulatedFrames),new a(`temporalSampleFrame`,e=>e.temporalSampleFrame),new a(`scaleGlobalIllumination`,e=>e.scaleGlobalIllumination)),c.uniforms.add(new a(`rayMarchMinReach`,e=>e.rayMarchMinReach),new a(`rayMarchMaxReach`,e=>e.rayMarchMaxReach),new a(`rayMarchWorldReach`,e=>e.rayMarchWorldReach),new a(`rayMarchMinReachEmissionWeight`,e=>e.rayMarchMinReachEmissionWeight),new a(`rayMarchMaxReachEmissionWeight`,e=>e.rayMarchMaxReachEmissionWeight),new a(`rayMarchMaxSteps`,e=>e.rayMarchMaxSteps),new a(`colorBleedWeight`,e=>e.colorBleedWeight)),t.hasEmission&&c.uniforms.add(new o(`lastFrameEmissionTexture`,e=>e.reprojection.lastFrameEmission?.attachment)),c.code.add(n`
    float computeIdleColorBlendWeight(float accumulatedFrames) {
      float idleColorBlendProgress = clamp(
        accumulatedFrames / ${n.float(O)},
        0.0,
        1.0
      );
      return mix(
        ${n.float(E)},
        ${n.float(D)},
        idleColorBlendProgress
      );
    }

    float computeIdleOcclusionBlendWeight(float accumulatedFrames) {
      float idleOcclusionBlendProgress = clamp(
        accumulatedFrames / ${n.float(j)},
        0.0,
        1.0
      );
      return mix(
        ${n.float(k)},
        ${n.float(A)},
        pow(idleOcclusionBlendProgress, ${n.float(M)})
      );
    }

    bool isEdgeDepth(float centerDepth, vec2 sampleUv) {
      vec2 texelSize = 1.0 / vec2(textureSize(depthMap, 0));
      float depthLeft = linearizeDepth(depthFromTexture(depthMap, sampleUv + vec2(-texelSize.x, 0.0)));
      float depthRight = linearizeDepth(depthFromTexture(depthMap, sampleUv + vec2(texelSize.x, 0.0)));
      float depthUp = linearizeDepth(depthFromTexture(depthMap, sampleUv + vec2(0.0, texelSize.y)));
      float depthDown = linearizeDepth(depthFromTexture(depthMap, sampleUv + vec2(0.0, -texelSize.y)));

      float maxDifference = max(max(abs(centerDepth - depthLeft), abs(centerDepth - depthRight)), max(abs(centerDepth - depthUp), abs(centerDepth - depthDown)));

      return abs(maxDifference / centerDepth) > 0.01;
    }

    vec3 sampleCosineHemisphere(vec2 u) {
      float phi = 6.28318530718 * u.x;
      float radius = sqrt(u.y);
      float x = radius * cos(phi);
      float y = radius * sin(phi);
      float z = sqrt(max(0.0, 1.0 - u.y));

      return vec3(x, y, z);
    }

    mat3 basisFromNormal(vec3 n) {
      vec3 up = abs(n.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
      vec3 tangent = normalize(cross(up, n));
      vec3 bitangent = cross(n, tangent);

      return mat3(tangent, bitangent, n);
    }

    float blueNoiseDitherValue(vec2 pixel, float frame, vec2 axis, float phase) {
      float scroll = 5.588238 * mod(frame, 512.0);
      vec2 p = pixel + vec2(scroll);
      vec2 rotated = vec2(
        axis.x * p.x + axis.y * p.y,
        -axis.y * p.x + axis.x * p.y
      );

      return fract(52.9829189 * fract(0.06711056 * rotated.x + 0.00583715 * rotated.y + phase));
    }

    vec4 blueNoiseDither(vec2 pixel, float frame) {
      vec4 value = vec4(
        blueNoiseDitherValue(pixel, frame, vec2(0.9659258, 0.25881904), 0.0),
        blueNoiseDitherValue(pixel, frame, vec2(0.70710677, 0.70710677), 0.17),
        blueNoiseDitherValue(pixel, frame, vec2(0.25881904, 0.9659258), 0.37),
        blueNoiseDitherValue(pixel, frame, vec2(1.0, 0.0), 0.61)
      );

      return value * 2.0 - 1.0;
    }
  `),s.outputs.add(`fragGlobalIllumination`,`vec4`,0),s.outputs.add(`fragWeight`,`float`,1),c.main.add(n`
    float depth = depthFromTexture(depthMap, uv);

    // Early out if depth is out of range, such as in the sky
    if (depth >= 1.0 || depth <= 0.0) {
      fragGlobalIllumination = vec4(0.0, 0.0, 0.0, 1.0);
      fragWeight = 0.0;
      return;
    }

    // Get the normal of current fragment
    ivec2 iuv = ivec2(uv * vec2(textureSize(normalMap, 0)));
    vec4 normal4 = texelFetch(normalMap, iuv, 0);
    if (normal4.a != 1.0) {
      fragGlobalIllumination = vec4(0.0, 0.0, 0.0, 1.0);
      fragWeight = 0.0;
      return;
    }
    vec3 normal = normalize(normal4.xyz * 2.0 - 1.0);

    // Reconstruct view space position of current fragment
    float currentPixelDepth = linearizeDepth(depth);
    vec3 currentPixelPos = reconstructPosition(uv * vec2(textureSize(normalMap, 0)), currentPixelDepth);
    vec4 viewPos = vec4(currentPixelPos, 1.0);

    // Reproject current view position to last frame
    vec4 reprojectedViewPos = reprojectionViewMatrix * viewPos;
    vec4 reprojectedCoordinate = applyProjectionMat(proj, reprojectedViewPos.xyz);

    // Read last frame reprojected depth and GI history
    float lastFrameDepthViewPos = -linearDepthFromTextureLastFrame(lastFrameDepthTexture, reprojectedCoordinate.xy);
    vec4 lastFrameGlobalIllumination = texture(lastFrameGlobalIlluminationTexture, reprojectedCoordinate.xy);
    float historyOcclusionBlendWeight = texture(lastFrameGlobalIlluminationWeightTexture, reprojectedCoordinate.xy).r;

    int steps;
    float occlusionBlendWeight = 1.0;
    float colorBlendWeight = 1.0;
    float idleColorBlendWeight = computeIdleColorBlendWeight(accumulatedFrames);
    float idleOcclusionBlendWeight = computeIdleOcclusionBlendWeight(accumulatedFrames);
    float reprojectionDepthMismatch = abs((lastFrameDepthViewPos + reprojectedViewPos.z) / max(lastFrameDepthViewPos, reprojectedViewPos.z));
    bool hasReprojectionMismatch = reprojectionDepthMismatch > ${n.float(y)};
    bool isScaledGlobalIllumination = scaleGlobalIllumination < 1.0;
    bool isLowQualityEdgePixel = isScaledGlobalIllumination && isEdgeDepth(currentPixelDepth, uv);
    bool resetColorHistory = false;

    // Heuristic to determine blending weights and number of steps for occlusion and color
    if (hasReprojectionMismatch) {
      if (isLowQualityEdgePixel) {
        steps = 1;
        occlusionBlendWeight = ${n.float(b)};
        resetColorHistory = true;
      } else {
        steps = 6;
        occlusionBlendWeight = 1.0;
        resetColorHistory = true;
      }
    } else {
      steps = 1;
      if (historyOcclusionBlendWeight > ${n.float(S)}) {
        occlusionBlendWeight = ${n.float(w)};
        colorBlendWeight = ${n.float(T)};
      } else if (historyOcclusionBlendWeight > ${n.float(C)}) {
        occlusionBlendWeight = historyOcclusionBlendWeight - 0.05;
        colorBlendWeight = ${n.float(T)};
      } else {
        occlusionBlendWeight = isScaledGlobalIllumination ? ${n.float(b)} : idleOcclusionBlendWeight;
        colorBlendWeight = isScaledGlobalIllumination ? ${n.float(x)} : idleColorBlendWeight;
      }
    }

    vec4 randomDirectionSample;
    mat3 normalBasis = basisFromNormal(normal);
    int temporalSampleStride = min(64 / steps, 6);
    float temporalFrameOffset = mod(temporalSampleFrame, float(64 / steps));

    // For each ray determine if it hits geometry and accumulate occlusion or color
    float stepSize = 1.0 / float(steps);
    for (int i = 0; i < steps; ++i) {
      float sampleIndex = float(i * temporalSampleStride + int(temporalFrameOffset));
      randomDirectionSample = blueNoiseDither(floor(gl_FragCoord.xy), sampleIndex);
      vec2 hemisphereSample = randomDirectionSample.rg * 0.5 + 0.5;
      float offsetSample = randomDirectionSample.a * 0.5 + 0.5;
      vec3 rayDirection = normalBasis * sampleCosineHemisphere(hemisphereSample);
      float rayMarchScreenReach = rayMarchScreenReachFromWorldReach(viewPos.xyz, rayDirection, rayMarchWorldReach);
      rayMarchScreenReach = clamp(rayMarchScreenReach, rayMarchMinReach, rayMarchMaxReach);
      vec3 hit = screenSpaceIntersectionWithLimits(
        rayDirection,
        viewPos.xyz,
        normalize(viewPos.xyz),
        normal,
        offsetSample,
        rayMarchScreenReach,
        rayMarchMaxSteps
      );

      if (hit.z > 0.0) {
        ${r(t.hasColor,n`
          // Emission and color bleed - Reproject the current receiver and sampled hit to estimate bounced color
          vec3 receiverColor = texture(lastFrameColorTexture, reprojectedCoordinate.xy).rgb;

          vec2 hitReprojectedCoordinate = reprojectionCoordinate(hit);
          vec3 sourceColor = texture(lastFrameColorTexture, hitReprojectedCoordinate).rgb;
          vec3 sourceColorLinear = linearizeGamma(sourceColor);
          vec3 sourceEmission = ${r(t.hasEmission,`texture(lastFrameEmissionTexture, hitReprojectedCoordinate).xyz`,`vec3(0.0)`)};

          float emissionWeight = mix(
            rayMarchMinReachEmissionWeight,
            rayMarchMaxReachEmissionWeight,
            (rayMarchScreenReach - rayMarchMinReach) / max(rayMarchMaxReach - rayMarchMinReach, 0.00001)
          );
          fragGlobalIllumination.rgb += ((sourceColorLinear * colorBleedWeight) + sourceEmission * emissionWeight) * stepSize;
          `)}
      } else {
        // Occlusion - heuristic modulating sky intensity based on angle to main light
        vec4 viewMainLightDirection = view * vec4(mainLightDirection, 0.0);
        float skyModulation = pow(max(dot(rayDirection, viewMainLightDirection.xyz), 0.0), 3.0) * 5.5;
        float skyFacingWeight = clamp(3.5 * dot(viewMainLightDirection.xyz, normal), 0.0, 1.0);
        skyModulation = mix(1.0, skyModulation * 0.2 + 0.8, skyFacingWeight);
        fragGlobalIllumination.a += skyModulation * stepSize;
      }
    }

    // Rendering trick add noise to reduce accumulation artifacts
    float accumulationDither = occlusionBlendWeight < 1.0
      ? randomDirectionSample.b * ${n.float(N)}
      : 0.0;

    ${r(t.hasColor,n`
      // Accumulate color
      vec3 lastFrameColor = lastFrameGlobalIllumination.rgb;
      float colorDitherScale = isScaledGlobalIllumination ? ${n.float(P)} : 1.0;
      fragGlobalIllumination.rgb = resetColorHistory
        ? vec3(0.0)
        : mix(lastFrameColor + accumulationDither * colorDitherScale, fragGlobalIllumination.rgb, colorBlendWeight);
      `,n`
      fragGlobalIllumination.rgb = vec3(0.0);
      `)}
    fragGlobalIllumination.rgb = quantizeGlobalIlluminationColor(fragGlobalIllumination.rgb);

    // Accumulate occlusion
    fragGlobalIllumination.a = mix(lastFrameGlobalIllumination.a + accumulationDither, fragGlobalIllumination.a, occlusionBlendWeight);

    fragWeight = occlusionBlendWeight;
  `),s}var W=Object.freeze(Object.defineProperty({__proto__:null,GlobalIlluminationPassParameters:H,build:U,defaultColorBleedWeight:F,defaultRayMarchMaxReach:R,defaultRayMarchMaxReachEmissionWeight:1,defaultRayMarchMaxSteps:16,defaultRayMarchMinReach:L,defaultRayMarchMinReachEmissionWeight:1,defaultRayMarchWorldReach:25},Symbol.toStringTag,{value:`Module`}));export{H as a,W as c,V as i,U as l,z as n,L as o,I as r,R as s,B as t,F as u};