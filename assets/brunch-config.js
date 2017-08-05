exports.config = {
  // See http://brunch.io/#documentation for docs.
  files: {
    javascripts: {
      joinTo: {
        "js/app.js": [
          "node_modules/phoenix_html/priv/static/phoenix_html.js",
          "node_modules/leaflet/dist/leaflet-src.js",
          "node_modules/phoenix/priv/static/phoenix.js",
          /^js\/discovery/,
          "js/app.js",
        ],
        "js/games/poetry.js": ["js/games/poetry.js"]
      },
    },
    stylesheets: {
      joinTo: "css/app.css"
    },
    templates: {
      joinTo: "js/app.js"
    }
  },

  conventions: {
    // This option sets where we should place non-css and non-js assets in.
    // By default, we set this to "/assets/static". Files in this directory
    // will be copied to `paths.public`, which is "priv/static" by default.
    assets: /^(static)/
  },

  // Phoenix paths configuration
  paths: {
    // Dependencies and current project directories to watch
    watched: ["static", "css", "js", "vendor"],
    // Where to compile files to
    public: "../priv/static"
  },

  // Configure your plugins
  plugins: {
    babel: {
      // Do not use ES6 compiler in vendor code
      ignore: [/vendor/]
    },
    sass: {
      debug: "comments",
      mode: "native",
      allowCache: true,
      options: {
        includePaths: [
          "node_modules/leaflet/dist",
          "node_modules/bootstrap-sass",
          "node_modules"
        ]
      }
    },
    assetsmanager: {
      copyTo: {
        fonts: ["node_modules/bootstrap-sass/assets/fonts/bootstrap*"],
        "css/images": ["node_modules/leaflet/dist/images/*"]
      }
    }
  },

  modules: {
    autoRequire: {
      "js/app.js": ["js/app"],
      "js/games/poetry.js": ["js/games/poetry"],
    }
  },

  npm: {
    enabled: true
  }
};
