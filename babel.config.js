module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: "umd",
        targets: {
          node: true
        }
      }
    ]
  ],
  plugins: ["import-graphql"]
};
