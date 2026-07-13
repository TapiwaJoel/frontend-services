/**
 * @fileoverview Rule to disallow inline templates and styles in Angular components
 * @author Tapiwa Joel
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow inline templates and styles in Angular components',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noInlineTemplate:
        'Inline templates are not allowed. Use templateUrl with a separate .html file instead.',
      noInlineStyles:
        'Inline styles are not allowed. Use styleUrl or styleUrls with separate .scss/.css files instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowInlineTemplateMaxLength: {
            type: 'number',
            default: 0,
            description:
              'Maximum allowed length for inline templates (0 = no inline templates allowed)',
          },
          allowInlineStyles: {
            type: 'boolean',
            default: false,
            description: 'Whether to allow inline styles',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const allowInlineTemplateMaxLength =
      options.allowInlineTemplateMaxLength ?? 0;
    const allowInlineStyles = options.allowInlineStyles ?? false;

    /**
     * Check if a node is an Angular @Component decorator
     */
    function isComponentDecorator(node) {
      return (
        node.type === 'Decorator' &&
        node.expression.type === 'CallExpression' &&
        node.expression.callee.type === 'Identifier' &&
        node.expression.callee.name === 'Component'
      );
    }

    /**
     * Check if a property is the 'template' property
     */
    function isTemplateProperty(property) {
      return (
        property.type === 'Property' &&
        property.key.type === 'Identifier' &&
        property.key.name === 'template'
      );
    }

    /**
     * Check if a property is the 'styles' property
     */
    function isStylesProperty(property) {
      return (
        property.type === 'Property' &&
        property.key.type === 'Identifier' &&
        property.key.name === 'styles'
      );
    }

    /**
     * Get the string length of a template literal or string
     */
    function getTemplateLength(node) {
      if (node.type === 'TemplateLiteral') {
        // Calculate approximate length from quasis
        return node.quasis.reduce(
          (total, quasi) => total + quasi.value.raw.length,
          0,
        );
      } else if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value.length;
      }
      return 0;
    }

    return {
      Decorator(node) {
        if (!isComponentDecorator(node)) {
          return;
        }

        // Check if the decorator has arguments and the first argument is an object
        const decoratorArgs = node.expression.arguments;
        if (
          decoratorArgs.length === 0 ||
          decoratorArgs[0].type !== 'ObjectExpression'
        ) {
          return;
        }

        const configObject = decoratorArgs[0];

        // Check each property in the component configuration
        configObject.properties.forEach((property) => {
          // Check for inline template
          if (isTemplateProperty(property)) {
            const templateLength = getTemplateLength(property.value);

            if (
              allowInlineTemplateMaxLength === 0 ||
              templateLength > allowInlineTemplateMaxLength
            ) {
              context.report({
                node: property,
                messageId: 'noInlineTemplate',
              });
            }
          }

          // Check for inline styles
          if (isStylesProperty(property) && !allowInlineStyles) {
            context.report({
              node: property,
              messageId: 'noInlineStyles',
            });
          }
        });
      },
    };
  },
};
