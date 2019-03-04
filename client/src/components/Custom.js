const AFRAME = window.AFRAME;
//const THREE = require("aframe/src/lib/three");

AFRAME.registerComponent("wireframe", {
  dependencies: ["material"],
  init: function() {
    this.el.components.material.material.wireframe = true;
  }
});

/*
AFRAME.registerComponent("wish", {
  schema: {
    width: { type: "number", default: 1 },
    height: { type: "number", default: 1 },
    depth: { type: "number", default: 1 },
    color: { type: "color", default: "#AAA" }
  }
});
*/