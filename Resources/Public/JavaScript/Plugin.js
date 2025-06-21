(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@neos-project/neos-ui-extensibility/dist/readFromConsumerApi.js
  function readFromConsumerApi(key) {
    return (...args) => {
      if (window["@Neos:HostPluginAPI"] && window["@Neos:HostPluginAPI"][`@${key}`]) {
        return window["@Neos:HostPluginAPI"][`@${key}`](...args);
      }
      throw new Error("You are trying to read from a consumer api that hasn't been initialized yet!");
    };
  }
  var init_readFromConsumerApi = __esm({
    "node_modules/@neos-project/neos-ui-extensibility/dist/readFromConsumerApi.js"() {
    }
  });

  // node_modules/@neos-project/neos-ui-extensibility/dist/shims/neosProjectPackages/neos-ui-redux-store/index.js
  var require_neos_ui_redux_store = __commonJS({
    "node_modules/@neos-project/neos-ui-extensibility/dist/shims/neosProjectPackages/neos-ui-redux-store/index.js"(exports, module) {
      init_readFromConsumerApi();
      module.exports = readFromConsumerApi("NeosProjectPackages")().NeosUiReduxStore;
    }
  });

  // node_modules/@neos-project/neos-ui-extensibility/dist/index.js
  init_readFromConsumerApi();
  var dist_default = readFromConsumerApi("manifest");

  // src/manifest.js
  var import_neos_ui_redux_store = __toESM(require_neos_ui_redux_store());
  var stripTags = (value) => value.replace(/<\/?[^>]+(>|$)/g, "");
  var clientEval = (input, node, editorOptions) => {
    const evaluateFn = new Function("node,editorOptions", "return " + input);
    return evaluateFn(node, editorOptions);
  };
  dist_default("Prgfx.Neos.DynamicPlaceholder", {}, (globalRegistry, { store }) => {
    const ckeRegistry = globalRegistry.get("ckEditor5");
    const ckeConfig = ckeRegistry.get("config");
    const existingConfig = ckeConfig.get("baseConfiguration");
    if (!existingConfig) return;
    const getNodeByContextPath = (path) => import_neos_ui_redux_store.selectors.CR.Nodes.makeGetNodeByContextPathSelector(path)(store.getState());
    const decoratedConfig = (ckEditorConfiguration, options) => {
      const { editorOptions, propertyDomNode } = options;
      const baseConfig = existingConfig(ckEditorConfiguration, options);
      const contextPath = propertyDomNode?.getAttribute("data-__neos-node-contextpath");
      const i18nRegistry = globalRegistry.get("i18n");
      const originalPlaceholder = baseConfig.placeholder;
      if (originalPlaceholder.startsWith("ClientEval:")) {
        if (contextPath) {
          try {
            const node = getNodeByContextPath(contextPath);
            if (node) {
              console.log("evaluate placeholder", { originalPlaceholder, node, editorOptions });
              let evaluatedPlaceholder = clientEval(originalPlaceholder.substring(11), node, editorOptions).toString();
              evaluatedPlaceholder = stripTags(i18nRegistry.translate(evaluatedPlaceholder));
              if (evaluatedPlaceholder) {
                return {
                  ...baseConfig,
                  placeholder: evaluatedPlaceholder
                };
              }
            }
          } catch (e) {
            console.warn("Could not evaluate ClientEval placeholder", originalPlaceholder, e);
          }
        } else {
          console.warn("Could not find contextPath for ClientEval placeholder", originalPlaceholder);
        }
      }
      return baseConfig;
    };
    ckeConfig.set("baseConfiguration", decoratedConfig);
  });
})();
