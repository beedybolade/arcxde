module.exports = {
  root: true,
  extends: ['@app/config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  rules: {
    // NestJS leans on decorators heavily; default exports are common for modules
    'import/no-default-export': 'off',
  },
};
