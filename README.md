# angular-onetime-binding-loader (IN PROGRESS)
Webpack loader which allows definition of one time binding on component level. Right now if you want to leverage one-time cheap bindings in  Angular 1 they need to be defined for a particular binding in all templates. The loader allows you to define it once when you declare your component. 

# Before:
```javascript
//JS
export default {
    name: 'myCmp',
    bindings: { foo: '<', bar: '<?' },
    templateUrl: require('./tpl.html'),
    transclude: true,
};
```
```html
//HTML
<my-cmp foo="someValue" bar="::someOtherValue"></my-cmp>
<my-cmp foo="someValue2" bar="::someOtherValue2"></my-cmp>
<my-cmp foo="someValue3" bar="::someOtherValu3"></my-cmp>
```

# Now:
```javascript
//JS
export default {
    name: 'myCmp',
    bindings: { foo: '<', bar: '::<?' },
    templateUrl: require('./tpl.html'),
    transclude: true,
};
```
```html
//HTML
<my-cmp foo="someValue" bar="someOtherValue"></my-cmp>
<my-cmp foo="someValue2" bar="someOtherValue2"></my-cmp>
<my-cmp foo="someValue3" bar="someOtherValu3"></my-cmp>
```

Benefits:
- No need to repeat the annotation in every template where you use the component
- Enforce usage of onetime bindings 

Important note:
- You must export your component object in order for the loader to be able to parse. It doesnt necessarily have to be a default export it could also be a named declaration export.

# Binding support
At the time of this writing, the supported binding types are:
- '::='
- '::=?'
- '::<'
- '::<?'
- '::@'
- '::@?'

# Usage with webpack
Webpack config:
```javascript
{
        entry: {
            app: path.resolve('app.js'),
        },
        output: {
            path: outputPath,
            filename: '[name].bundle.js',
        },
        resolveLoader: {
            modules: ['node_modules', path.resolve('angular-onetime-binding-loader')]
        },
        module: {
            noParse: [],
            rules: [
                {
                    test: /\.js$/,
                    use: [
                        { loader: 'angular-onetime-binding-loader' }
                    ],
                },
                {
                    test: /\.html$/,
                    use: [
                        { loader: 'angular-onetime-binding-loader', options: { type: 'html' } }
                    ]
                },
            ],
        },
    };
```
Important things to note here:
- JS must be loaded through the loader before the html so that the loader can save all the bindings that he must update in the html
- For html, you must pass the type property for the loader setting type as html so that the loader can distinguish between js and html.
