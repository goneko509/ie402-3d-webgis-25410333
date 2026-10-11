import{n as e}from"./VisualVariablePassParameters-TgPNZzfS.js";import{t}from"./Float3PassUniform-YEiGS05C.js";import{n}from"./glsl-D85RBwKC.js";import{t as r}from"./Float4PassUniform-Cu2daSgY.js";import{t as i}from"./Float4sPassUniform-B1UFJ1Pq.js";import{t as a}from"./FloatsPassUniform-DfJ8EJ1F.js";import{t as o}from"./Matrix3PassUniform-B98tjNzt.js";function s(e){e.code.add(n`struct MaskedColor {
vec4 color;
bvec4 mask;
};`)}function c(e){e.include(s),e.code.add(n`
    MaskedColor createMaskedFromUInt8NaNColor(vec4 color) {
      return MaskedColor(color * ${n.float(1/254)}, equal(color, vec4(255)));
    }
  `)}function l(e){e.include(s),e.code.add(n`vec4 maskedColorSelectOrOne(MaskedColor color) {
return vec4(
color.mask.r ? 1.0 : color.color.r,
color.mask.g ? 1.0 : color.color.g,
color.mask.b ? 1.0 : color.color.b,
color.mask.a ? 1.0 : color.color.a
);
}
MaskedColor multiplyMaskedColors(MaskedColor color1, MaskedColor color2) {
vec4 masked1 = maskedColorSelectOrOne(color1);
vec4 masked2 = maskedColorSelectOrOne(color2);
return MaskedColor(masked1 * masked2, bvec4(ivec4(color1.mask) & ivec4(color2.mask)));
}`)}function u(e){e.include(s),e.code.add(n`MaskedColor createMaskedFromNaNColor(vec4 color) {
return MaskedColor(color, isnan(color));
}`)}function d(c,d){let{vertex:f,attributes:p}=c;d.hasVVInstancing&&(d.hasVVSize||d.hasVVColor)&&p.add(`instanceFeatureAttribute`,`vec4`),d.hasVVSize?(f.uniforms.add(new t(`vvSizeMinSize`,e=>e.vvSize.minSize)),f.uniforms.add(new t(`vvSizeMaxSize`,e=>e.vvSize.maxSize)),f.uniforms.add(new t(`vvSizeOffset`,e=>e.vvSize.offset)),f.uniforms.add(new t(`vvSizeFactor`,e=>e.vvSize.factor)),f.uniforms.add(new t(`vvSizeFallback`,e=>e.vvSize.fallback)),f.uniforms.add(new o(`vvSymbolRotationMatrix`,e=>e.vvSize.symbolRotationMatrix)),f.uniforms.add(new t(`vvSymbolAnchor`,e=>e.vvSize.symbolAnchor)),f.code.add(n`vec3 vvScale(vec4 _featureAttribute) {
if (isnan(_featureAttribute.x)) {
return vvSizeFallback;
}
return clamp(vvSizeOffset + _featureAttribute.x * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize);
}
vec4 vvTransformPosition(vec3 position, vec4 _featureAttribute) {
return vec4(vvSymbolRotationMatrix * ( vvScale(_featureAttribute) * (position + vvSymbolAnchor)), 1.0);
}`),f.code.add(n`
      const float eps = 1.192092896e-07;
      vec4 vvTransformNormal(vec3 _normal, vec4 _featureAttribute) {
        vec3 scale = max(vvScale(_featureAttribute), eps);
        return vec4(vvSymbolRotationMatrix * _normal / scale, 1.0);
      }

      ${d.hasVVInstancing?n`
      vec4 vvLocalNormal(vec3 _normal) {
        return vvTransformNormal(_normal, instanceFeatureAttribute);
      }

      vec4 localPosition() {
        return vvTransformPosition(${f.inputs.get(`position`)}, instanceFeatureAttribute);
      }`:``}
    `)):f.code.add(n`
      vec4 localPosition() { return vec4(${f.inputs.get(`position`)}, 1.0); }
      vec4 vvLocalNormal(vec3 _normal) { return vec4(_normal, 1.0); }
    `),c.vertex.include(s),d.hasVVColor?(f.constants.add(`vvColorNumber`,`int`,e),f.uniforms.add(new a(`vvColorValues`,e,e=>e.vvColor.values),new i(`vvColorColors`,e,e=>e.vvColor.colors),new r(`vvColorFallback`,e=>e.vvColor.fallback,{supportsNaN:!0})),d.hasVVInstancing&&(c.vertex.include(l),c.vertex.include(u)),f.code.add(n`
      vec4 interpolateVVColor(float value) {
        if (isnan(value)) {
          return vvColorFallback;
        }

        if (value <= vvColorValues[0]) {
          return vvColorColors[0];
        }

        for (int i = 1; i < vvColorNumber; ++i) {
          if (vvColorValues[i] >= value) {
            float f = (value - vvColorValues[i-1]) / (vvColorValues[i] - vvColorValues[i-1]);
            return mix(vvColorColors[i-1], vvColorColors[i], f);
          }
        }
        return vvColorColors[vvColorNumber - 1];
      }

      vec4 vvGetColor(vec4 featureAttribute) {
        return interpolateVVColor(featureAttribute.y);
      }

      ${d.hasVVInstancing?n`
            vec4 vvColor() {
              return vvGetColor(instanceFeatureAttribute);
            }

            MaskedColor applyVVColor(MaskedColor color) {
              return multiplyMaskedColors(color, createMaskedFromNaNColor(vvColor()));
            }
            `:n`
            vec4 vvColor() {
              return vec4(1.0);
            }

            MaskedColor applyVVColor(MaskedColor color) {
              return color;
            }
            `}
    `)):f.code.add(n`vec4 vvColor() {
return vec4(1.0);
}
MaskedColor applyVVColor(MaskedColor color) {
return color;
}`)}export{s as a,u as i,l as n,c as r,d as t};