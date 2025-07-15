import manifest from '@neos-project/neos-ui-extensibility';
import { selectors } from '@neos-project/neos-ui-redux-store';

/**
 * from @neos-project/utils-helpers
 * @param {string} value
 * @return {string}
 */
const stripTags = (value) => value.replace(/<\/?[^>]+(>|$)/g, '');

/**
 * Evaluates a ClientEval: expression with node and editorOptions in scope
 * @param {string} input The ClientEval expression
 * @param {object} node The node data
 * @param {object} editorOptions The editor options
 * @returns {any}
 */
const clientEval = (input, node, editorOptions) => {
    const evaluateFn = new Function('node,editorOptions', 'return ' + input);
    return evaluateFn(node, editorOptions);
}

manifest('Prgfx.Neos.DynamicPlaceholder', {}, (globalRegistry, {store}) => {
    const ckeRegistry = globalRegistry.get('ckEditor5');
    const ckeConfig = ckeRegistry.get('config');
    const existingConfig = ckeConfig.get('baseConfiguration');
    if (!existingConfig) return;

    const getNodeByContextPath = path => selectors.CR.Nodes.makeGetNodeByContextPathSelector(path)(store.getState());

    const decoratedConfig = (ckEditorConfiguration, options) => {
        const {editorOptions, propertyDomNode} = options;
        const baseConfig = existingConfig(ckEditorConfiguration, options);
        const contextPath = propertyDomNode?.getAttribute('data-__neos-editable-node-contextpath')
            ?? propertyDomNode?.getAttribute('data-__neos-node-contextpath');
        const originalPlaceholder = baseConfig.placeholder ?? editorOptions.placeholder;

        if (originalPlaceholder && originalPlaceholder.startsWith('ClientEval:')) {
            if (contextPath) {
                const i18nRegistry = globalRegistry.get('i18n');
                try {
                    const node = getNodeByContextPath(contextPath);
                    if (node) {
                        let evaluatedPlaceholder = clientEval(originalPlaceholder.substring(11), node, editorOptions).toString();
                        evaluatedPlaceholder = stripTags(i18nRegistry.translate(evaluatedPlaceholder));

                        if (evaluatedPlaceholder) {
                            return {
                                ...baseConfig,
                                placeholder: evaluatedPlaceholder,
                            };
                        }
                    }
                } catch (e) {
                    console.warn('[Prgfx.Neos.DynamicPlaceholder] Could not evaluate ClientEval placeholder', originalPlaceholder, e);
                }
            } else {
                console.warn('[Prgfx.Neos.DynamicPlaceholder] Could not find contextPath for ClientEval placeholder', originalPlaceholder);
            }
        }

        return baseConfig;
    };

    ckeConfig.set('baseConfiguration', decoratedConfig);
});
