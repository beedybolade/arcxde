module.exports = {
  root: true,
  extends: ['@app/config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
};
