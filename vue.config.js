const prefixer = require('postcss-prefix-selector');
const ExtensionReloader  = require('webpack-extension-reloader');

module.exports = {
  pages: {
    options: {
      template: 'public/browser-extension.html',
      entry: './src/options/main.js',
      title: 'Options'
    }
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.js'
            ]
          }
        }
      }
    }
  },
  css: {
    extract: false
  },
  //for prefixing Vuetify classes so they don't pollute the global namespace
  chainWebpack: (config) => {

    ////this part needs to be commented when building the extension for production
    config.plugin('extension-reloader').tap( args => [{
      port: 9091, // Which port use to create the server
      reloadPage: true, // Force the reload of the page also
      entries: { // The entries used for the content/background scripts or extension pages
        background: 'background',
        contentScript: [
          'content-script'
        ]
      }
    }])
    //

    const sassRule = config.module.rule('sass');
    const sassNormalRule = sassRule.oneOfs.get('normal');
    // creating a new rule
    const vuetifyRule = sassRule.oneOf('vuetify').test(/[\\/]vuetify[\\/]src[\\/]/);
    // taking all uses from the normal rule and adding them to the new rule
    Object.keys(sassNormalRule.uses.entries()).forEach((key) => {
        vuetifyRule.uses.set(key, sassNormalRule.uses.get(key));
    });
    // moving rule "vuetify" before "normal"
    sassRule.oneOfs.delete('normal');
    sassRule.oneOfs.set('normal', sassNormalRule);
    // adding prefixer to the "vuetify" rule
    vuetifyRule.use('vuetify').loader(require.resolve('postcss-loader')).tap((options = {}) => {
        options.sourceMap = process.env.NODE_ENV !== 'production';
        options.plugins = [
            prefixer({
                prefix: '[data-vuetify-trustnet]',
                transform(prefix, selector, prefixedSelector) {
                    let result = prefixedSelector;
                    if (selector.startsWith('html') || selector.startsWith('body')) {
                        result = prefix + selector.substring(4);
                    }
                    return result;
                },
            }),
        ];
        return options;
    });
    // moving sass-loader to the end
    vuetifyRule.uses.delete('sass-loader');
    vuetifyRule.uses.set('sass-loader', sassNormalRule.uses.get('sass-loader'));
  },

  // configureWebpack: config => {
  //   if (process.env.NODE_ENV === 'development') {
  //     config.plugins[0].port = 9091;
  //   } else {
  //     // mutate for development...
  //   }
  // },

  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    port: 9091
  }
}
