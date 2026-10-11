import{r as e}from"./Ellipsoid-Co4rBm1M.js";import{u as t}from"./vec3f64-DIOQknMY.js";import{t as n}from"./weather-CkqTQndb.js";import{t as r}from"./Uniform-FnPH-ujw.js";import{n as i}from"./glsl-D85RBwKC.js";import{t as a}from"./Float3BindUniform-BmdF9XGj.js";import{t as o}from"./FloatBindUniform-C4h6J6-v.js";import{t as s}from"./Matrix4BindUniform-DnHs9Hq_.js";import{t as c}from"./BooleanBindUniform-B2b909hF.js";import{n as l,r as u}from"./MainLighting.glsl-BzpgU6pB.js";function d(e){e.fragment.uniforms.add(new o(`cloudAbsorption`,e=>e.clouds.absorption),new o(`cloudCoverage`,e=>e.clouds.coverage)).code.add(i`vec4 lookupCloudsFromTextureArray(sampler2DArray cubeMap, vec3 rayDir) {
int faceIndex;
vec2 uv;
if(rayDir.z <= 0.0) {
float hazeFactor = smoothstep(-0.01, mix(0.0, 0.075, cloudCoverage), abs(dot(rayDir, vec3(0, 0, 1))));
float shading = clamp(1.0 - cloudAbsorption, 0.6, 1.0) * (1.0 - hazeFactor);
float totalTransmittance = hazeFactor;
return vec4(shading, totalTransmittance, shading, totalTransmittance);
}
if (abs(rayDir.x) >= abs(rayDir.y) && abs(rayDir.x) >= abs(rayDir.z)) {
if(rayDir.x > 0.0) {
faceIndex = 0;
uv = rayDir.yz / rayDir.x;
uv = vec2(-uv.x, uv.y);
} else {
faceIndex = 1;
uv = rayDir.yz / rayDir.x;
uv = vec2(-uv.x, -uv.y);
}
} else if (abs(rayDir.y) >= abs(rayDir.x) && abs(rayDir.y) >= abs(rayDir.z)) {
if(rayDir.y > 0.0) {
faceIndex = 2;
uv = rayDir.xz / rayDir.y;
} else {
faceIndex = 3;
uv = rayDir.xz / rayDir.y;
uv = vec2(uv.x, -uv.y);
}
} else {
if(rayDir.y < 0.0) {
faceIndex = 4;
uv = rayDir.xy / rayDir.z;
uv = vec2(uv.x, -uv.y);
} else {
faceIndex = 5;
uv = rayDir.xy / rayDir.z;
uv = vec2(uv.x, -uv.y);
}
}
uv = 0.5 * (uv + 1.0);
if(faceIndex != 5) {
uv.y = uv.y - 0.5;
}
uv.y = uv.y * 2.0;
vec4 s = texture(cubeMap, vec3(uv, float(faceIndex)));
return s;
}`)}var f=class extends r{constructor(e,t){super(e,`sampler2DArray`,0,(n,r)=>n.bindTexture(e,t(r)))}};function p(e){let n=e.fragment;n.constants.add(`radiusCloudsSquared`,`float`,m).code.add(i`vec3 intersectWithCloudLayer(vec3 dir, vec3 cameraPosition, vec3 spherePos) {
float B = 2.0 * dot(cameraPosition, dir);
float C = dot(cameraPosition, cameraPosition) - radiusCloudsSquared;
float det = B * B - 4.0 * C;
float pointIntDist = max(0.0, 0.5 *(-B + sqrt(det)));
return (cameraPosition + dir * pointIntDist) - spherePos;
}`),n.uniforms.add(new o(`radiusCurvatureCorrection`,({clouds:e})=>e.parallax.radiusCurvatureCorrection)).code.add(i`vec3 correctForPlanetCurvature(vec3 dir) {
dir.z = dir.z * (1.0 - radiusCurvatureCorrection) + radiusCurvatureCorrection;
return dir;
}`),n.code.add(i`vec3 rotateDirectionToAnchorPoint(mat4 rotMat, vec3 inVec) {
return (rotMat * vec4(inVec, 0.0)).xyz;
}`),u(n),l(n),n.constants.add(`RIM_COLOR`,`vec3`,t(.28,.175,.035)),n.constants.add(`sunsetTransitionFactor`,`float`,.3),n.constants.add(`rimScattering`,`float`,140),n.constants.add(`backlightFactor`,`float`,.2),n.constants.add(`backlightScattering`,`float`,10),n.constants.add(`backlightTransition`,`float`,.3),n.code.add(i`vec3 calculateCloudColor(vec3 cameraPosition, vec3 worldSpaceRay, vec4 clouds) {
float upDotLight = dot(cameraPosition, mainLightDirection);
float dirDotLight = max(dot(worldSpaceRay, mainLightDirection), 0.0);
float sunsetTransition = clamp(pow(max(upDotLight, 0.0), sunsetTransitionFactor), 0.0, 1.0);
vec3 ambientLight = calculateAmbientIrradiance(cameraPosition);
vec3 combinedLight = clamp((mainLightIntensity + ambientLight )/PI, vec3(0.0), vec3(1.0));
vec3 baseCloudColor = pow(combinedLight * pow(clouds.xyz, vec3(GAMMA)), vec3(INV_GAMMA));
float scatteringMod = max(clouds.a < 0.5 ? clouds.a / 0.5 : - clouds.a / 0.5 + 2.0, 0.0);
float rimLightIntensity = 0.5 + 0.5 * pow(max(upDotLight, 0.0), 0.35);
vec3 directSunScattering = RIM_COLOR * rimLightIntensity * (pow(dirDotLight, rimScattering)) * scatteringMod;
float additionalLight = backlightFactor * pow(dirDotLight, backlightScattering) * (1. - pow(sunsetTransition, backlightTransition)) ;
return vec3(baseCloudColor * (1.0 + additionalLight) + directSunScattering);
}`),e.include(d),n.uniforms.add(new c(`readChannelsRG`,e=>e.clouds.readChannels===0),new f(`cubeMap`,e=>e.clouds.data?.cubeMap?.colorTexture)).code.add(i`vec4 sampleCloud(vec3 rayDir, bool readOtherChannel) {
vec4 s = lookupCloudsFromTextureArray(cubeMap, rayDir);
bool readRG = readChannelsRG ^^ readOtherChannel;
s = readRG ? vec4(vec3(s.r), s.g) : vec4(vec3(s.b), s.a);
return length(s) == 0.0 ? vec4(s.rgb, 1.0) : s;
}`),n.uniforms.add(new a(`anchorPoint`,e=>e.clouds.parallax.anchorPoint),new a(`anchorPointNew`,e=>e.clouds.parallaxNew.anchorPoint),new s(`rotationClouds`,e=>e.clouds.parallax.transform),new s(`rotationCloudsNew`,e=>e.clouds.parallaxNew.transform),new o(`cloudsOpacity`,e=>e.clouds.opacity),new o(`fadeFactor`,e=>e.clouds.fadeFactor),new c(`crossFade`,e=>e.clouds.fadeState===3)).code.add(i`vec4 renderClouds(vec3 worldRay, vec3 cameraPosition) {
vec3 intersectionPoint = intersectWithCloudLayer(worldRay, cameraPosition, anchorPoint);
vec3 worldRayRotated = rotateDirectionToAnchorPoint(rotationClouds, normalize(intersectionPoint));
vec3 worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
vec4 cloudData = sampleCloud(worldRayRotatedCorrected, crossFade);
vec3 cameraPositionN = normalize(cameraPosition);
vec4 cloudColor = vec4(calculateCloudColor(cameraPositionN, worldRay, cloudData), cloudData.a);
if(crossFade) {
intersectionPoint = intersectWithCloudLayer(worldRay, cameraPosition, anchorPointNew);
worldRayRotated = rotateDirectionToAnchorPoint(rotationCloudsNew, normalize(intersectionPoint));
worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
cloudData = sampleCloud(worldRayRotatedCorrected, false);
vec4 cloudColorNew = vec4(calculateCloudColor(cameraPositionN, worldRay, cloudData), cloudData.a);
cloudColor = mix(cloudColor, cloudColorNew, fadeFactor);
}
float totalTransmittance = length(cloudColor.rgb) == 0.0 ?
1.0 :
clamp(cloudColor.a * cloudsOpacity + (1.0 - cloudsOpacity), 0.0 , 1.0);
return vec4(cloudColor.rgb, totalTransmittance);
}`)}var m=(e.radius+n)**2;export{p as t};