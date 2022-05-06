[![Version](https://poser.pugx.org/prgfx/neos-dynamic-placeholder/version)](//packagist.org/packages/prgfx/neos-dynamic-placeholder)

# Prgfx.Neos.DynamicPlaceholder

This package allows to use `ClientEval:` statements in inline editor placeholders (see [Feature Request](https://github.com/neos/neos-ui/issues/2837)).

```
composer require prgfx/neos-dynamic-placeholder
```

## Example
```yaml
Vendor.Package:Page:
  superTypes:
    Neos.Neos:Page: true
  properties:
    displayTitle:
      type: string
      ui:
        inlineEditable: true
        inline:
          editorOptions:
            placeholder: ClientEval:node.properties.title
```

## Eval Scope
* `node`: the node the editor belongs to
* `editorOptions`: the editorOptions, i.e. (original) placeholder, formatting etc.

---
This plugin works by decorating the original placeholder plugin in some hacky way and thus relies on that internal implementation to a certain extent. Use with care.

It has not been tested against different Neos versions.
