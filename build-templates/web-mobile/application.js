System.register("chunks:///_virtual/application.js", [], function (_export, _context) {
  "use strict";

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function createApplication(_ref) {
    var loadJsListFile = _ref.loadJsListFile,
      fetchWasm = _ref.fetchWasm;
    // NOTE: before here we shall not import any module!
    var promise = Promise.resolve();
    return promise.then(function () {
      return _defineProperty({
        start: start
      }, 'import', topLevelImport);
    });

    function start(_ref3) {
      var findCanvas = _ref3.findCanvas;
      var settings;
      var cc;
      return Promise.resolve().then(function () {
        return topLevelImport('cc');
      }).then(function (engine) {
        cc = engine;
        rewriteAsset();
        return loadSettingsJson(cc);
      }).then(function () {
        console.log(window._CCSettings);
        settings = window._CCSettings;
        return initializeGame(cc, settings, findCanvas).then(function () {
          if (settings.scriptPackages) {
            return loadModulePacks(settings.scriptPackages);
          }
        }).then(function () {
          return loadJsList(settings.jsList);
        }).then(function () {
          return loadAssetBundle(settings.hasResourcesBundle, settings.hasStartSceneBundle);
        }).then(function () {
          return cc.game.run(function () {
            return onGameStarted(cc, settings);
          });
        });
      });
    }

    function topLevelImport(url) {
      return _context["import"]("".concat(url));
    }

    function loadAssetBundle(hasResourcesBundle, hasStartSceneBundle) {
      var promise = Promise.resolve();
      var _cc$AssetManager$Buil = cc.AssetManager.BuiltinBundleName,
        MAIN = _cc$AssetManager$Buil.MAIN,
        RESOURCES = _cc$AssetManager$Buil.RESOURCES,
        START_SCENE = _cc$AssetManager$Buil.START_SCENE;
      var bundleRoot = hasResourcesBundle ? [RESOURCES, MAIN] : [MAIN];

      if (hasStartSceneBundle) {
        bundleRoot.push(START_SCENE);
      }

      return bundleRoot.reduce(function (pre, name) {
        return pre.then(function () {
          return loadBundle(name);
        });
      }, Promise.resolve());
    }

    function loadBundle(name) {
      return new Promise(function (resolve, reject) {
        console.log("cc_loader" + name);
        cc.assetManager.loadBundle(name, function (err, bundle) {
          if (err) {
            return reject(err);
          }

          resolve(bundle);
        });
      });
    }

    function loadModulePacks(packs) {
      return Promise.all(packs.map(function (pack) {
        return topLevelImport(pack);
      }));
    }

    function loadJsList(jsList) {
      var promise = Promise.resolve();
      jsList.forEach(function (jsListFile) {
        promise = promise.then(function () {
          return loadJsListFile("src/".concat(jsListFile));
        });
      });
      return promise;
    }

    function loadSettingsJson(cc) {
      var server = '';
      var settings = 'src/settings.json';
      return new Promise(function (resolve, reject) {
        resolve();
        // if (typeof fsUtils !== 'undefined' && !settings.startsWith('http')) {
        //   var result = fsUtils.readJsonSync(settings);

        //   if (result instanceof Error) {
        //     reject(result);
        //   } else {
        //     window._CCSettings = result;
        //     window._CCSettings.server = server;
        //     resolve();
        //   }
        // } else {
        //   var requestSettings = function requestSettings() {
        //     var xhr = new XMLHttpRequest();
        //     xhr.open('GET', settings);
        //     xhr.responseType = 'text';

        //     xhr.onload = function () {
        //       window._CCSettings = JSON.parse(xhr.response);
        //       window._CCSettings.server = server;
        //       resolve();
        //     };

        //     xhr.onerror = function () {
        //       if (retryCount-- > 0) {
        //         setTimeout(requestSettings, retryInterval);
        //       } else {
        //         reject(new Error('request settings failed!'));
        //       }
        //     };

        //     xhr.send(null);
        //   };

        //   var retryCount = 3;
        //   var retryInterval = 2000;
        //   requestSettings();
        // }
      });
    }
  }

  function initializeGame(cc, settings, findCanvas) {
    if (settings.macros) {
      for (var key in settings.macros) {
        cc.macro[key] = settings.macros[key];
      }
    }

    var gameOptions = getGameOptions(settings, findCanvas);
    return Promise.resolve(cc.game.init(gameOptions));
  }

  function onGameStarted(cc, settings) {
    console.log("game start",settings);
    window._CCSettings = undefined;
    cc.view.enableRetina(true);
    cc.view.resizeWithBrowserSize(true);

    if (cc.sys.isMobile) {
      if (settings.orientation === 'landscape') {
        cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
      } else if (settings.orientation === 'portrait') {
        cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
      }

      cc.view.enableAutoFullScreen(false);
    }

    var launchScene = settings.launchScene; // load scene

    cc.director.loadScene(launchScene, null, function () {
      cc.view.setDesignResolutionSize(720, 1280, 4);
      console.log("Success to load scene: ".concat(launchScene));
    });
  }

  function getGameOptions(settings, findCanvas) {
    // asset library options
    var assetOptions = {
      bundleVers: settings.bundleVers,
      remoteBundles: settings.remoteBundles,
      server: settings.server,
      subpackages: settings.subpackages
    };
    var options = {
      debugMode: settings.debug ? 1 : 3,
      // cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
      showFPS: !false && settings.debug,
      frameRate: 60,
      groupList: settings.groupList,
      collisionMatrix: settings.collisionMatrix,
      renderPipeline: settings.renderPipeline,
      adapter: findCanvas('GameCanvas'),
      assetOptions: assetOptions,
      customJointTextureLayouts: settings.customJointTextureLayouts || [],
      physics: settings.physics
    };
    return options;
  }

  function rewriteAsset() {
    if (window.document) {
      // Bundle
      var loadBundle = function (nameOrUrl, options, onComplete) {
        console.log("name or url:", nameOrUrl);
        var str = window.resMap[nameOrUrl + '/config.json'];
        console.log(resMap);
        console.log("str"+str);
        var data = JSON.parse(str);
        data.base = nameOrUrl + "/";
        console.log(data);
        console.log(`name:${nameOrUrl} data:` + data);
        console.log("bundle data is"+data);
        onComplete(null, data);
        System.import(`virtual:///prerequisite-imports/${nameOrUrl}`);
      };

      // Json
      var loadJson = function (nameOrUrl, options, onComplete) {
        var data = JSON.parse(window.resMap[nameOrUrl]);
        onComplete(null, data);
      }

      // Image
      function loadDomImage(url, options, onComplete) {
        var index = url.lastIndexOf(".");
        var strtype = url.substr(index + 1, 4);
        strtype = strtype.toLowerCase();
        var data = window.resMap[url];

        var img = new Image();

        if (window.location.protocol !== 'file:') {
          img.crossOrigin = 'anonymous';
        }

        function loadCallback() {
          img.removeEventListener('load', loadCallback);
          img.removeEventListener('error', errorCallback);
          onComplete && onComplete(null, img);
        }

        function errorCallback() {
          img.removeEventListener('load', loadCallback);
          img.removeEventListener('error', errorCallback);
          onComplete && onComplete(new Error(cc.debug.getError(4930, url)));
        }

        img.addEventListener('load', loadCallback);
        img.addEventListener('error', errorCallback);
        img.src = data;
        return img;
      }

      var loadImage = function (nameOrUrl, options, onComplete) {
        loadDomImage(nameOrUrl, options, onComplete);
      }

      // Audio
      var __audioSupport = cc.sys.__audioSupport;
      var formatSupport = __audioSupport.format;
      var context = __audioSupport.context;

      function base64toBlob(base64, type) {
        var bstr = atob(base64, type),
          n = bstr.length,
          u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], {
          type: type,
        })
      }

      function base64toArray(base64) {
        var bstr = atob(base64),
          n = bstr.length,
          u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }

        return u8arr;
      }

      function loadDomAudio(url, onComplete) {

        var dom = document.createElement('audio');

        dom.muted = true;
        dom.muted = false;

        var data = window.resMap[url.split("?")[0]];
        data = base64toBlob(data, "audio/mpeg");

        if (window.URL) {
          dom.src = window.URL.createObjectURL(data);
        } else {
          dom.src = data;
        }

        var clearEvent = function () {
          clearTimeout(timer);
          dom.removeEventListener("canplaythrough", success, false);
          dom.removeEventListener("error", failure, false);
          if (__audioSupport.USE_LOADER_EVENT)
            dom.removeEventListener(__audioSupport.USE_LOADER_EVENT, success, false);
        };

        var timer = setTimeout(function () {
          if (dom.readyState === 0)
            failure();
          else
            success();
        }, 8000);

        var success = function () {
          clearEvent();
          onComplete && onComplete(null, dom);
        };

        var failure = function () {
          clearEvent();
          var message = 'load audio failure - ' + url;
          cc.log(message);
          onComplete && onComplete(new Error(message));
        };

        dom.addEventListener("canplaythrough", success, false);
        dom.addEventListener("error", failure, false);
        if (__audioSupport.USE_LOADER_EVENT)
          dom.addEventListener(__audioSupport.USE_LOADER_EVENT, success, false);
        return dom;
      }

      function loadWebAudio(url, onComplete) {
        if (!context) callback(new Error('Audio Downloader: no web audio context.'));

        var data = window.resMap[url];
        data = base64toArray(data);

        if (data) {
          context["decodeAudioData"](data.buffer, function (buffer) {
            onComplete(null, buffer);
          }, function () {
            onComplete('decode error - ' + url, null);
          });
        } else {
          onComplete('request error - ' + url, null);
        }
      }
      
      function loadBin(url,options, onComplete) {
        console.log(context);
        var data = window.resMap[url];
        console.log("data is", data);
        data = base64toArray(data);
        console.log("data is", data);
        onComplete(null, data);
      }

      var loadAudio = (url, options, onComplete) => {
        if (formatSupport.length === 0) {
          return new Error('Audio Downloader: audio not supported on this browser!');
        }

        // If WebAudio is not supported, load using DOM mode
        if (!__audioSupport.WEB_AUDIO) {
          loadDomAudio(url, onComplete);
        }
        else {
          loadWebAudio(url, onComplete);
        }
      }

      // Font
      var loadFont = (url, options, onComplete) => {
        var ttfIndex = url.lastIndexOf(".ttf");

        var slashPos = url.lastIndexOf("/");
        var fontFamilyName;
        if (slashPos === -1) {
          fontFamilyName = url.substring(0, ttfIndex) + "_LABEL";
        } else {
          fontFamilyName = url.substring(slashPos + 1, ttfIndex) + "_LABEL";
        }
        if (fontFamilyName.indexOf(' ') !== -1) {
          fontFamilyName = '"' + fontFamilyName + '"';
        }

        // Setup font face style
        let fontStyle = document.createElement("style");
        fontStyle.type = "text/css";
        let fontStr = "";
        if (isNaN(fontFamilyName - 0))
          fontStr += "@font-face { font-family:" + fontFamilyName + "; src:";
        else
          fontStr += "@font-face { font-family:'" + fontFamilyName + "'; src:";

        var data = "url(data:application/x-font-woff;charset=utf-8;base64,PASTE-BASE64-HERE) format(\"woff\");";
        data = data.replace("PASTE-BASE64-HERE", window.resMap[url]);

        fontStr += data;
        fontStyle.textContent = fontStr + "}";
        document.body.appendChild(fontStyle);

        // Preload font with div
        let preloadDiv = document.createElement("div");
        let divStyle = preloadDiv.style;
        divStyle.fontFamily = fontFamilyName;
        preloadDiv.innerHTML = ".";
        divStyle.position = "absolute";
        divStyle.left = "-100px";
        divStyle.top = "-100px";
        document.body.appendChild(preloadDiv);
        onComplete(null, fontFamilyName);
      }

      cc.assetManager.downloader.register('bundle', loadBundle);
      cc.assetManager.downloader.register('.json', loadJson);
      cc.assetManager.downloader.register('.png', loadImage);
      cc.assetManager.downloader.register('.jpg', loadImage);
      cc.assetManager.downloader.register('.jpeg', loadImage);
      cc.assetManager.downloader.register('.mp3', loadAudio);
      cc.assetManager.downloader.register('.ogg', loadAudio);
      cc.assetManager.downloader.register('.wav', loadAudio);
      cc.assetManager.downloader.register('.m4a', loadAudio);
      cc.assetManager.downloader.register('.ttf', loadFont);
      cc.assetManager.downloader.register('.bin', loadBin);
    }
  }

  _export("createApplication", createApplication);

  return {
    setters: [],
    execute: function () { }
  };
});