module.exports = {
  '*.{ts,tsx,js,jsx,html,css,scss,json,md,yaml,yml}': ['prettier --write'],
  '*.{ts,tsx,js,jsx}': ['eslint --fix'],
};
