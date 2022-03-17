module.exports = {
  transpileDependencies: ["vuetify"],
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import '@/styles/variables.scss'`,
      },
      scss: {
        prependData: `@import '@/styles/variables.scss'`,
      },
    },
  },
};
