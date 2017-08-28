const esprima = require('esprima');
const get = require('lodash/get');

function isExportSupported(mod) {
    return (mod.type === 'ExportNamedDeclaration' || mod.type === 'ExportDefaultDeclaration') && mod.declaration.type === 'ObjectExpression';
}

function getOneTimeBindings(bindings) {
    const supportedBindings = ['::=', '::=?', '::<', '::<?', '::@', '::@?'];
    return bindings.reduce((oneTimeBindings, binding) => {
        if (supportedBindings.includes(binding.value.value)) {
            oneTimeBindings.push(binding.key.name);
            return oneTimeBindings;
        }
        return oneTimeBindings;
    }, []);
}

function getComponentToUpdate(properties) {
    return properties.reduce((props, property) => {
        if (property.key.name === 'name'){
            props.name = property.value.value;
        } 
        else if (property.key.name === 'bindings') {
            props.bindings = getOneTimeBindings(property.value.properties);
            
        };
        return props;
    }, {});

}

/**
 * Returns array of objects in module
 * @param {*} mod 
 */
function parseModule(mod) {
    const parsedMod = esprima.parseModule(mod, { tolerant: true });
    return parsedMod.body.reduce((componentList, modItem) => {
        if (isExportSupported(modItem)) {
            const component = getComponentToUpdate(modItem.declaration.properties);
            if (component && component.name && component.bindings && component.bindings.length > 0) {
                componentList.push(component);
            }
        }
        return componentList;
    },[]);
    
}

module.exports = function(content) {
    module.updateBindings = module.updateBindings || [];
    module.updateBindings.push(...parseModule(content));
    return content;
}