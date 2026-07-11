module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'shell',
        'umdzidzisi-website',
        'umdzidzisi-admin',
        'umdzidzisi-client',
        'umtengesi-website',
        'umtengesi-admin',
        'umtengesi-client',
        'ui-common',
        'data-access-auth',
        'util-event-bus',
        'util-theming',
        'models',
        'deps',
        'ci',
        'workspace',
      ],
    ],
  },
};
