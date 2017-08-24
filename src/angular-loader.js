let updateBindings = [];
/**
 * Returns array of objects in module
 * @param {*} mod 
 */
function parseModule(mod) {
    return mod.match(/\{([\S\s]*)\}/).map((item) => {
        let obj;
        try {
        obj = eval('(' + item.trim() + ')');
        }
        finally {
            return obj;
        }
    });
}

/**
 * Adds list of bindings to update for components
 * @param {*} objects 
 */
function parseComponents(objects) {
    objects.forEach(function(obj) {
        //look for component signature
        if (obj && obj.bindings) {
            for (const i in obj.bindings) {
                if (obj.bindings[i].indexOf('::') > -1) {
                    updateBindings.push({name: obj.name, binding: i})
                }
            }
        }
    }, this);
}

function stripModule(mod) {
    const supportedBindings = ['::=', '::<', '::@'];
    return supportedBindings.reduce((item, binding) => item.replace(binding, binding.substr(2)), mod);
}
module.exports = function(content) {
    parseComponents(parseModule(content));
    const strippedModule = stripModule(content);
    return content;
}