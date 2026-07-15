/**
 * Custom ESLint Rules for Web Apps
 *
 * This module exports custom ESLint rules specific to our Angular workspace.
 * Rules are registered under the 'org' namespace.
 */

const noInlineTemplateStyle = require('./no-inline-template-style');

module.exports = {
  rules: {
    'no-inline-template-style': noInlineTemplateStyle,
  },
};
