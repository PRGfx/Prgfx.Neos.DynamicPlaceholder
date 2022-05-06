import manifest from '@neos-project/neos-ui-extensibility';
import { selectors } from '@neos-project/neos-ui-redux-store';

/**
 * Evaluates a ClientEval: expression with node and editorOptions in scope
 * @param {string} input The ClientEval expression
 * @param {object} node The node data
 * @param {object} editorOptions The editor options
 * @returns {any}
 */
const clientEval = (input, node, editorOptions) => {
    return eval(input);
}

/**
 * Augments the NeosPlaceholder plugin
 * @param {Function} plugin The original plugin
 * @param {(contextPath: string) => object} findNode A helper to find the node data for evaluation
 * @param {object} editorOptions The inline editorOptions
 * @returns {Function} A decorated version of the plugin
 */
const decoratePlaceholderPlugin = (plugin, findNode, editorOptions) => {
    const originalGetPlaceholder = plugin.prototype.getPlaceholder;
    plugin.prototype.getPlaceholder = function () {
        const originalPlaceholder = originalGetPlaceholder.apply(this);
        if (originalPlaceholder.startsWith('ClientEval:')) {
            if (this.editor && this.editor.neos && this.editor.neos.contextPath) {
                try {
                    const node = findNode(this.editor.neos.contextPath);
                    if (node) {
                        return clientEval(originalPlaceholder.substring(11), node, editorOptions).toString();
                    }
                } catch (e) {
                }
            }
        }
        return originalPlaceholder;
    };

    // for some reason editor.neos is not yet available when initializing the plugin
    const originalInit = plugin.prototype.init;
    plugin.prototype.init = function() {
        const init = originalInit.bind(this);
        if (!this.editor || !this.editor.neos) {
            setTimeout(() => init(), 100);
        } else {
            init();
        }
    };

    return plugin;
}

manifest('Prgfx.Neos.DynamicPlaceholder', {}, (globalRegistry, { store }) => {
    const ckeRegistry = globalRegistry.get('ckEditor5');
    const ckeConfig = ckeRegistry.get('config');
    const addExistingPlugin = ckeConfig.get('neosPlaceholder');
    if (!addExistingPlugin) return;

    const getNodeByContextPath = path => selectors.CR.Nodes.makeGetNodeByContextPathSelector(path)(store.getState());

    const decorateAddedPlugin = (ckEditorConfiguration, options) => {
        const r = addExistingPlugin(ckEditorConfiguration, options);
        const index = r.plugins.findIndex(p => p.pluginName === 'NeosPlaceholder');
        if (index >= 0) {
            r.plugins[index] = decoratePlaceholderPlugin(r.plugins[index], getNodeByContextPath, options.editorOptions);
        }
        return r;
    };
    ckeConfig.set('neosPlaceholder', decorateAddedPlugin);
});
