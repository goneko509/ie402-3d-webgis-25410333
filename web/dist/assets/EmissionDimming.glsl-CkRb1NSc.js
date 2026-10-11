import{t as e}from"./ColorConversion.glsl-C9xFjUmo.js";import{n as t}from"./oitResolution.glsl-DBbxNNXQ.js";function n(n,r){n.include(e),n.include(t,r),n.code.add(`
    vec3 emissionDimming(in vec3 srcColor, float srcAlpha) {
      vec3 color = min(srcColor + vec3(1.0 - srcAlpha), 1.0);
      float m = max(color.r, max(color.g, color.b));
      return m > 0.0 ? color / m : vec3(1.0);
    }
  `)}export{n as t};