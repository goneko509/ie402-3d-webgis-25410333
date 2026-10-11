import{n as e,t}from"./glsl-D85RBwKC.js";function n(e){e.varyings.add(`linearDepth`,`float`,{invariant:!0})}function r(r,i){i&&n(r),r.vertex.code.add(e`
    void forwardLinearDepth(float _linearDepth) { ${t(i,`linearDepth = _linearDepth;`)} }
  `)}export{r as n,n as t};