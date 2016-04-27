"use strict";

let jibo = require('jibo');
let path = require('path');
let dofs = jibo.animate.dofs;

module.exports = function() {
    let root = path.join(__dirname, '..');
    let keysPath = path.join(root, 'animations/greeting.keys');
    jibo.animate.createAnimationBuilderFromKeysPath(keysPath, root, (builder) => {
        //In this case, this only animates the body.
        builder.setDOFs(dofs.BODY);
        builder.setNumLoops(1);
        builder.play();
    })
};
