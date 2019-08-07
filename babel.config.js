module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'umd',
        targets: {
          node: true,
        },
      },
    ],
  ],
  plugins: [
    'import-graphql',
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};
