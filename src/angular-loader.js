const esprima = require('esprima');
const get = require('lodash/get');
const supportedBindings = ['::=', '::=?', '::<', '::<?', '::@', '::@?'];
function isExportSupported(mod) {
    return (mod.type === 'ExportNamedDeclaration' || mod.type === 'ExportDefaultDeclaration') && mod.declaration.type === 'ObjectExpression';
}

function getOneTimeBindings(bindings) {
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
        if (property.key.name === 'name') {
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
    }, []);

}

function toDashCase() {
    const upperChars = this.match(/([A-Z])/g);
    if (!upperChars) {
        return this;
    }

    let str = this.toString();
    for (let i = 0, n = upperChars.length; i < n; i++) {
        str = str.replace(new RegExp(upperChars[i]), '-' + upperChars[i].toLowerCase());
    }

    if (str.slice(0, 1) === '-') {
        str = str.slice(1);
    }

    return str;
};

function stripBindingAnnotation(content) {
    return supportedBindings.reduce((cont, binding) => cont.split(binding).join(binding.replace('::', '')), content)
}

module.exports = function (content) {
    if (this.query.type === 'html' && module.updateBindings) {
        module.updateBindings.forEach((component) =>
            component.bindings.forEach((binding) =>
                content = content.replace(new RegExp(`(<${toDashCase.bind(component.name)()}[^>]*${toDashCase.bind(binding)()}=.)([^'"]+)`, "g"), "$1::$2")));
    }
    else if (this.query.type !== 'html') {
        module.updateBindings = module.updateBindings || [];
        module.updateBindings.push(...parseModule(content));
        return stripBindingAnnotation(content);
    }
return content;
}   