var startRender = function() {
	"use strict";
	startRender = function () {};
/*eslint strict:0*/
if (!Function.prototype.bind) {
    Function.prototype.bind = function (object) { //eslint-disable-line no-extend-native
        var self = this,
            slice = Array.prototype.slice,
            args = slice.call(arguments, 1);
        return function () {
            return self.apply(object, args.concat(slice.call(arguments)));
        };
    };
}

function joinURL() {
    var url = arguments[0];
    for (var i = 1; i < arguments.length; ++i) {
        url = url.replace(/\/$/, '') + '/' + arguments[i].replace(/^\//, '');
    }
    return url;
}

var queryUtil = (function () {

    /**
     * Get value of URL parameter by its name
     * @param {string} name
     * @param {string} query
     * @returns {string}
     */
    function getParameterFromQuery(query, name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(query);
        return results && results[1] ? decodeURIComponent(results[1]).replace(/\+/g, ' ') : '';
    }

    /**
     * Get state of boolean URL parameter by its name
     * @param {string} name
     * @param {string} query
     * @returns {boolean}
     */
    function isParameterTrueInQuery(query, name) {
        return getParameterFromQuery(query, name) === 'true';
    }

    return {
        getParameterFromQuery: getParameterFromQuery,
        isParameterTrueInQuery: isParameterTrueInQuery,
        getParameterByName: getParameterFromQuery.bind(null, window.location.search),
        isParameterTrue: isParameterTrueInQuery.bind(null, window.location.search)
    };
}());


window.queryUtil = queryUtil;

function PackagesUtil(packagesStructure, query) {
    'use strict';

    /**
     * @param {string} str
     * @param {string} separator
     * @param {string} equalizer
     * @return {Object.<String, String>}
     */
    function reduceStringToObject(str, separator, equalizer) {
        return (str || '').split(separator).reduce(function (o, pairString) {
            var pair = pairString.split(equalizer);
            o[pair[0]] = pair[1];
            return o;
        }, {});
    }

    var queryParamsObject = reduceStringToObject(query.replace(/^\?/, ''), '&', '=');

    /**
     * returns a new reactVersions according to the packages query
     * @param {Object} versionsObject
     * @returns {Object}
     */
    this.getVersionsByQuery = function(versionsObject) {
        if (!versionsObject || !queryParamsObject) {
            return versionsObject;
        }
        var applied = {};

        function getVersionString(value) {
            if (/^\d+$/.test(value)) {
                return 'http://localhost:' + value;
            }
            if (/^[\d\.]+$/.test(value)) {
                return value;
            }
        }

        function applyVersion(version, key) {
            if (version && versionsObject[key]) {
                applied[key] = version;
            }
        }

        Object.keys(versionsObject).forEach(function(key) {
            applied[key] = versionsObject[key];
        });

        var packages = reduceStringToObject(queryParamsObject.packages, ',', ':');
        if (packages.all) {
            Object.keys(versionsObject).forEach(applyVersion.bind(null, getVersionString(packages.all)));
        }
        Object.keys(packages).forEach(function (key) {
            applyVersion(getVersionString(packages[key]), key);
        });
        return applied;
    };

    /**
     * changes the confiIg to load packages correctly, accounting the query
     * @param {Object} config
     * @returns {Object}
     */
    this.buildConfig = function(config) {

        var debug = (queryParamsObject.debug || '').split(',').filter(Boolean);
        if (debug.indexOf('all') !== -1) {
            var debuggableExternals = Object.keys(config.paths).filter(function (path) {
                return config.paths[path].source;
            });
            debug = packagesStructure.concat(debuggableExternals);
        }

        function isInDebug(i) {
            return debug.indexOf(i) !== -1
        }

        //config.paths:
        Object.keys(config.paths).forEach(function (k) {
            if (typeof config.paths[k] === 'object' && !(config.paths[k] instanceof Array)) {
                config.paths[k] = config.paths[k][isInDebug(k) ? 'source' : 'min'];
            }
        });

        //config.bundles:
        config.bundles = config.bundles || {};
        packagesStructure.filter(function(pkg){return !isInDebug(pkg); }).forEach(function(pkg) {
           config.bundles[pkg] = pkg;
            config.paths[pkg] = 'packages-bin/' + pkg + '/' + pkg + '.min';
        });

        //config.packages:
        config.packages = packagesStructure.filter(isInDebug).map(function (name) {
            return {
                name: name,
                location: 'packages/' + name + '/src/main',
                main: name
            };
        });

        return config;
    };
}


////////////////////////////////////////////////////////////////////////
// This file is generated by grunt-packages DO NOT modify
////////////////////////////////////////////////////////////////////////
var packagesUtil = new PackagesUtil(["animations","cloud","components","componentsPreviewLayer","core","documentServices","editingRendererPlugins","fonts","layout","previewExtensionsCore","qaAutomation","render","server","skins","testUtils","tpa","tpaIntegration","tweenEngine","utils","widgets","wixCode","wixCodeIntegration","wixSites","wixappsBuilder","wixappsClassics","wixappsCore"], window.location.search);

////////////////////////////////////////////////////////////////////////


var persistent = (function () {

    function isAvailable(st) {
        var unique = 'testStorage' + Date.now();
        try {
            st.setItem(unique, unique);
            var value = st.getItem(unique);
            st.removeItem(unique);
            if (value !== unique) {
                throw 'not equal'; //eslint-disable-line no-throw-literal
            }
        } catch (e) {
            return false;
        }
        return true;
    }

    var storage;
    if (isAvailable(window.localStorage)) {
        storage = window.localStorage;
    } else if (isAvailable(window.sessionStorage)) {
        storage = window.sessionStorage;
    } else {
        storage = {
            setItem: function () {},
            getItem: function () {},
            removeItem: function () {}
        };
    }

    return {
        save: function (key, value) {
            storage.setItem(key, value);
        },
        load: function (key) {
            return storage.getItem(key);
        },
        remove: function (key) {
            storage.removeItem(key);
        }
    };
}());
var semverRegex = /(\d)+\.(\d)+\.(\d)+/;
var onlySemver = /^(\d)+\.(\d)+\.(\d)+$/;

function replaceUrlVersion(url, version) {
    return url && onlySemver.test(version) ? url.replace(semverRegex, version) : url;
}

function overrideScriptsLocationMapFromQuery(scriptsLocationMap, overrideParam) {
    overrideParam.split(',').filter(Boolean).forEach(function (keyValueString) {
        var pair = keyValueString.split(':');
        var urlOverride = replaceUrlVersion(scriptsLocationMap[pair[0]], pair[1]);
        if (urlOverride && scriptsLocationMap[pair[0]] !== urlOverride) {
            scriptsLocationMap[pair[0]] = urlOverride;
        }
    });
    return scriptsLocationMap;
}

var delayedErrors = [];
function sendErrorOrQueue() {
    var wixBiSession = window.wixBiSession;
    if (wixBiSession && wixBiSession.sendError) {
        wixBiSession.sendError.apply(wixBiSession, arguments);
    } else {
        delayedErrors.push(Array.prototype.slice.call(arguments));
    }
}

var performance = window.performance || {};

function instrument(serviceTopology, wixBiSession, queryUtil, siteModel) {
    wixBiSession.initialTimestamp = wixBiSession.initialTimestamp || wixBiSession.mainLoaded;

    var rendererModel = siteModel.rendererModel || window.rendererModel;
    var premiumFeatures = rendererModel.premiumFeatures;
    var isPremium = !!premiumFeatures && premiumFeatures.indexOf('HasDomain') !== -1;
    var base = (serviceTopology.biServerUrl || 'http://frog.wix.com').replace(/\/$/, '');

    var isBot = (function () {
        var re = [/bot/i, /Google Web Preview/i, /^Mozilla\/4\.0$/];
        var ua = window.navigator.userAgent;
        for (var i = 0; i < re.length; ++i) {
            if (re[i].test(ua)) {
                return true;
            }
        }
        return false;
    }());

    function isDisabled() {
        return isBot || rendererModel.previewMode || queryUtil.isParameterTrue('suppressbi');
    }

    function recordEt(et) {
        wixBiSession.et = et;
        if (performance.mark) {
            performance.mark('beat ' + et);
        }
    }

    function prepareMessage(evid, src, options) {
        options = options || {};

        function param(name) {
            return '&' + (options.map && options.map[name] || name) + '=';
        }

        var omit = options.omit || {};

        var msg = param('evid') + evid + param('src') + src;

        if (!omit.pn) {
            msg += param('pn') + '1';
        }
        if (!omit.isp) {
            msg += param('isp') + (isPremium ? 1 : 0);
        }
        if (!omit.url) {
            var url = location.href.replace(/^[^:]+:\/\/(www\.)?/i, '');
            msg += param('url') + encodeURIComponent(url.substring(0, 256));
        }

        if (!omit.v) {
            msg += param('v') + (window.clientSideRender ? '3.0' : '4.0');
        }
        if (!omit.majorVer) {
            msg += param('majorVer') + (window.clientSideRender ? '3' : '4');
        }
        if (!omit.ver && window.santaBase) {
            var sourceMatches = window.santaBase.match(/([\d\.]+)\/?$/);
            msg += param('ver') + ((sourceMatches && sourceMatches[1]) || '');
        }

        if (!omit.dc && serviceTopology) {
            var server = serviceTopology.serverName;
            if (server) {
                server = server.split('.')[0];
                if (server) {
                    msg += param('dc') + server;
                }
            }
        }

        if (rendererModel) {
            if (rendererModel.siteInfo && rendererModel.siteInfo.siteId) {
                msg += param('sid') + rendererModel.siteInfo.siteId;
            }
            if (rendererModel.metaSiteId) {
                msg += '&msid=' + rendererModel.metaSiteId;
            }
        }

        var siteHeader = siteModel.siteHeader || window.siteHeader;
        if (!omit.uuid && siteHeader && siteHeader.userId) {
            msg += param('uuid') + siteHeader.userId;
        }
        var publicModel = siteModel.publicModel;
        if (!omit.tsp && publicModel && publicModel.timeSincePublish) {
            msg += param('tsp') + publicModel.timeSincePublish;
        }
        if (wixBiSession.viewerSessionId) {
            msg += param('vsi') + wixBiSession.viewerSessionId;
        }

        if (!omit.ts && wixBiSession.initialTimestamp) {
            msg += param('ts') + (Date.now() - wixBiSession.initialTimestamp);
        }

        return msg;
    }

    function sendBI(endpoint, evid, code, options) {
        var src = base + '/' + endpoint + '?c=' + Date.now();
        src += prepareMessage(evid, code, options);
        if (options && options.extra) {
            src += options.extra;
        }
        (new Image()).src = src;
    }

    wixBiSession.sendBI = function (endpoint, evid, code, extra) {
        sendBI(endpoint, evid, code, {
            omit: {
                pn: true,
                isp: true,
                ts: true,
                url: true,
                v: true,
                ver: true
            },
            map: {
                sid: 'did',
                dc: 'server',
                uuid: 'uid'
            },
            extra: extra
        });
    };

    var sendError = function (name, code, severity) {
        sendError = function () {}; // only report one error per session

        var extra = '&errn=' + encodeURIComponent(name) + '&errc=' + code + '&sev=' + severity +
            '&errscp=core&cat=2&iss=1&et=' + wixBiSession.et;

        var total = 0;
        var params = Array.prototype.slice.call(arguments, 3).map(function (arg, index) {
            if (total + arg.length > 1024) {
                arg = arg.substring(0, Math.max(1024 - total, 32));
            }
            var result = 'p' + (index + 1) + '=' + encodeURIComponent(arg);
            total += result.length;
            return result;
        }).join('&');
        extra += '&' + params;

        sendBI('trg', 10, 44, {
            omit: {
                pn: true,
                isp: true,
                tsp: true,
                v: true,
                url: true,
                uuid: true
            },
            map: {
                sid: 'did',
                dc: 'server',
                ts: 'response_time'
            },
            extra: extra
        });
    };
    wixBiSession.beat = function (et) {
        recordEt(et);
        sendBI('bt', 3, 29, {
            omit: {
                majorVer: true,
                tsp: true,
                ver: true
            },
            extra: '&et=' + et
        });
    };
    wixBiSession.sendError = function (err) {
        sendError.apply(null, [err.errorName, err.errorCode, err.severity].concat(Array.prototype.slice.call(arguments, 1)));
    };

    delayedErrors.forEach(function (errArgs) {
        wixBiSession.sendError.apply(null, errArgs);
    });
    delayedErrors = null;

    var isDebug = queryUtil.getParameterByName('debug');
    if (performance.setResourceTimingBufferSize) {
        if ('onresourcetimingbufferfull' in performance) {
            performance.onresourcetimingbufferfull = (function () {
                var maxSize = 150;
                return function () {
                    maxSize *= 2;
                    performance.setResourceTimingBufferSize(maxSize);
                };
            }());
        } else {
            performance.setResourceTimingBufferSize(isDebug ? 1000 : 300);
        }
    }

    var newrelic = window.newrelic;
    if (newrelic && newrelic.setCustomAttribute) {
        if (newrelic.setPageViewName){
            newrelic.setPageViewName(location.href.replace(/^[^/]*\/\//, ''));
        }
        if (rendererModel) {
            if (rendererModel.siteInfo && rendererModel.siteInfo.siteId) {
                newrelic.setCustomAttribute('sid', rendererModel.siteInfo.siteId);
            }
            if (rendererModel.metaSiteId) {
                newrelic.setCustomAttribute('msid', rendererModel.metaSiteId);
            }
            var runningExperiments = rendererModel.runningExperiments;
            if (runningExperiments) {
                runningExperiments = Object.keys(runningExperiments).filter(function (key) {
                    return this[key] === 'new';
                }, runningExperiments).join('][');
                if (runningExperiments) {
                    newrelic.setCustomAttribute('experiments', '[' + runningExperiments + ']');
                }
            }
            newrelic.setCustomAttribute('preview', rendererModel.previewMode ? 1 : 0);
        }
        newrelic.setCustomAttribute('isPremium', isPremium);
        var siteHeader = siteModel.siteHeader || window.siteHeader;
        if (siteHeader && siteHeader.userId) {
            newrelic.setCustomAttribute('uuid', siteHeader.userId);
        }
        var publicModel = siteModel.publicModel;
        if (publicModel && publicModel.timeSincePublish) {
            newrelic.setCustomAttribute('timeSincePublish', publicModel.timeSincePublish);
        }
        if (wixBiSession.viewerSessionId) {
            newrelic.setCustomAttribute('vsi', wixBiSession.viewerSessionId);
        }
        newrelic.setCustomAttribute('debug', isDebug ? 1 : 0);
    }

    if (isDisabled()) {
        wixBiSession.beat = recordEt;
        return;
    }


    (function performanceBI() {
        var extra = '';

        var timing = performance.timing;
        if (timing) {
            var dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
            if (dnsTime >= 0) {
                extra += '&dns_time=' + dnsTime;
            }
            var connectTime = timing.requestStart - timing.connectStart;
            if (connectTime >= 0) {
                extra += '&connect_time=' + connectTime;
            }
            var ttfbTime = timing.responseStart - timing.requestStart;
            if (ttfbTime >= 0) {
                extra += '&ttfb_time=' + ttfbTime;
            }
            var responseTime = timing.responseEnd - timing.responseStart;
            if (responseTime >= 0) {
                extra += '&response_time=' + responseTime;
            }
            var loadTime = timing.navigationStart || timing.fetchStart || timing.domainLookupStart || timing.connectStart;
            loadTime = wixBiSession.initialTimestamp - loadTime;
            if (loadTime >= 0) {
                extra += '&load_time=' + loadTime;
            }
        }

        extra += '&is_premium=' + (isPremium ? 1 : 0);
        var isWixSite = rendererModel.siteInfo.documentType === 'WixSite';
        extra += '&is_wixsite=' + (isWixSite ? 1 : 0);

        wixBiSession.sendBI('ugc-viewer', 351, 42, extra);
    }());

    if (isDebug && !queryUtil.isParameterTrue('bi')) {
        return;
    }

    var ignoreURLs = [
        /^chrome(\-extension)?\:/, /^file\:/, /^resource\:/, /\.net\//, /\.info\//, /\.ru\//, /google/, /facebook/,
        /dropbox/, /ad\-score/, /drivemac/, /shopping/, /datafast/, /shopcomp/, /vimeo/, /olark/
    ];
    function ignoreError(where) {
        where = where.trim();
        if (!where) {
            return true;
        }
        for (var i = 0; i < ignoreURLs.length; ++i) {
            if (ignoreURLs[i].test(where)) {
                return true;
            }
        }
        return false;
    }

    var origOnError = window.onerror || function () {};
    window.onerror = function (errorMsg, url, line, column, err) {
        var where = err && typeof err.stack === 'string' ? err.stack : url;
        if (!ignoreError(where)) {
            sendError('JAVASCRIPT_ERROR', 111022, 40, errorMsg, where, line, column); // JAVASCRIPT_ERROR from packages/core/src/main/bi/errors.js
        }
        return origOnError.apply(this, arguments);
    };

    if (window.console) {
        var origError = console.error;
        if (origError) {
            console.error = function () {
                sendError.bind(null, 'CONSOLE_ERROR', 111023, 30).apply(null, arguments); // CONSOLE_ERROR from packages/core/src/main/bi/errors.js
                return origError.apply(this, arguments);
            };
        }
    }

    requirejs.onError = function (err) {
        var modules = (err.requireModules || []).join(';');
        var where = err.stack ? '' + err.stack : '';
        var errn = err.errn || 'REQUIREJS_ERROR';
        var errc = err.errc || 111024;
        var severity = err.severity || 40;
        sendError(errn, errc, severity, err.message, modules, where); // REQUIREJS_ERROR from packages/core/src/main/bi/errors.js
    };
}

function prefetchPages(siteModel, publicModel) {
    var contentCache = {};
    var isHttps = location.protocol === "https:";
    if (isHttps) {
        return contentCache;
    }
    if (window.pagesData && window.pagesData.masterPage) {
        return contentCache; // don't pre fetch when pages data was part of server side rendered response
    }

    function prefetch(url, accept, callback) {
        if (url) {
            var r = new XMLHttpRequest();
            r.onload = function () {
                callback(r.response);
            };
            r.open('GET', url, true);
            if (accept) {
                r.setRequestHeader('Accept', accept);
            }
            r.send();
        }
    }

    function prefetchJSON(url) {
        prefetch(url, 'application/json', function (response) {
            if (!(url in contentCache)) {
                try {
                    var json = JSON.parse(response);
                    contentCache[url] = json;
                    prefetchLangs(json.data.document_data.SITE_STRUCTURE.characterSets);
                } catch (e) {
                    // empty
                }
            }
        });
    }

    function prefetchLangs(langs) {
        if (langs) {
            var baseUrl = /localhost|127.0.0.\d/.test(siteModel.santaBase) ?
                siteModel.serviceTopology.scriptsLocationMap.santa :
                siteModel.santaBase;
            langs.forEach(function (lang) {
                var link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', joinURL(baseUrl, 'static/css/user-site-fonts', lang + '.css'));
                link.setAttribute('media', 'only x'); // load into cache, but don't use (not blocking)
                document.head.appendChild(link);
            });
        }
    }

    try {
        Array.prototype.slice.call(arguments, 2).forEach(prefetchJSON);
        var pageList = publicModel.pageList;
        if (pageList.masterPage) {
            prefetchJSON(pageList.masterPage[0]);
        }
        var hash = location.hash.split('/');
        var pageId = hash[1] || pageList.mainPageId;
        var pages = pageList.pages;
        pages.filter(function (page) {
            return page.pageId === pageId;
        }).forEach(function (page) {
            prefetchJSON(page.urls[0]);
        });
    } catch (e) {
        // empty
    }
    return contentCache;
}

/* global sendErrorOrQueue:false */

function convertRendererModel(rendererModel, publicModel) {
    return rendererModel && rendererModel.siteInfo ? rendererModel : {
        metaSiteId: rendererModel.metaSiteId,
        siteInfo: {
            applicationType: rendererModel.applicationType,
            documentType: rendererModel.documentType,
            siteId: rendererModel.siteId,
            siteTitleSEO: rendererModel.siteTitleSEO
        },
        clientSpecMap: rendererModel.clientSpecMap,
        cloudVersions: rendererModel.cloudVersions,
        premiumFeatures: rendererModel.premiumFeatures,
        geo: rendererModel.geo,
        languageCode: rendererModel.languageCode,
        previewMode: rendererModel.previewMode,
        userId: rendererModel.userId,
        siteMetaData: rendererModel.siteMetaData ? {
            contactInfo: rendererModel.siteMetaData.contactInfo,
            adaptiveMobileOn: publicModel && publicModel.adaptiveMobileOn,
            preloader: rendererModel.siteMetaData.preloader,
            quickActions: rendererModel.siteMetaData.quickActions
        } : undefined,
        runningExperiments: rendererModel.runningExperiments
    };
}

function convertToObject(array) {
    return (array || []).reduce(function (res, value) {
        res[value] = true;
        return res;
    }, {});
}

function convertUrlFormatModel(rendererModel) {
    var model = rendererModel.urlFormatModel || {};

    if (rendererModel.runningExperiments.urlFormat === 'new') {
        model.format = 'slash';
    } else {
        model.format = model.format || 'hashBang';
    }

    model.forbiddenPageUriSEOs = convertToObject(model.forbiddenPageUriSEOs);
    model.pageIdToResolvedUriSEO = model.pageIdToResolvedUriSEO || {};

    return model;
}

function getDefaultWixappsModel() {
    return {appbuilder: {metadata: {appbuilder_metadata: {requestedPartNames: []}}}};
}

function convertSiteModel(rendererModel, publicModel) {
    function getPagesDataFromSiteAsJson(siteJson){
        var initialPagesData = {
            masterPage: siteJson.masterPage
        };

        return siteJson.pages.reduce(function(accum, val){
            accum[val.structure.id] = val;
            return accum;
        }, initialPagesData);
    }
    var siteModel = {
        publicModel: publicModel,
        urlFormatModel: convertUrlFormatModel(rendererModel),
        serviceTopology: window.serviceTopology,
        santaBase: window.santaBase,
        configUrls: window.configUrls,
        rendererModel: rendererModel,
        componentGlobals: window.componentGlobals,
        serverAndClientRender: window.serverAndClientRender,
        adData: window.adData,
        mobileAdData: window.mobileAdData,
        googleAnalytics: window.googleAnalytics,
        googleRemarketing: window.googleRemarketing,
        facebookRemarketing: window.facebookRemarketing,
        yandexMetrika: window.yandexMetrika,
        wixData: window.wixData,
        wixapps: window.wixapps || getDefaultWixappsModel(),
        wixBiSession: window.wixBiSession,
        pagesData: window.pagesData,
        mapFromPageUriSeoToPageId: getMapFromPageUriSeoToPageId(publicModel),
        svgShapes: window.svgShapes
    };
    siteModel.siteHeader = {id: siteModel.rendererModel.siteId, userId: siteModel.rendererModel.userId}; // required
    siteModel.siteId = siteModel.rendererModel.siteId; // required
    siteModel.viewMode = siteModel.rendererModel.previewMode ? 'preview' : 'site'; // required
    if (window.siteAsJson) {
        movePageDataToMaster(window.siteAsJson);
        siteModel.pagesData = getPagesDataFromSiteAsJson(window.siteAsJson);
    }
    if (window.documentServicesModel) {
        siteModel.documentServicesModel = window.documentServicesModel;
    }
    return siteModel;
}

function getMapFromPageUriSeoToPageIdForOldSites(documentData) {
    var map = {};
    var key;
    for (key in documentData) {
        if (documentData[key].pageUriSEO) {
            map[documentData[key].pageUriSEO] = key;
        }
    }

    return map;
}

function getMapFromPageUriSeoToPageId(publicModel) {
    if (publicModel) {
        if (publicModel.pageList) {
            return publicModel.pageList.pages.reduce(function (res, page) {
                res[page.pageUriSEO] = page.pageId;
                return res;
            }, {});
        }

        if (window.wixData && window.wixData.document_data) {
            return getMapFromPageUriSeoToPageIdForOldSites(window.wixData.document_data);
        }
    }

    return null;
}

function movePageDataToMaster(siteAsJson) {
    var masterData = siteAsJson.masterPage.data.document_data;

    function move(ref, to, from) {
        if (!get(from, ref)) {
            return;
        }

        if (!get(to, ref)) {
            set(to, ref, get(from, ref));
        }
        remove(from, ref);
    }

    function get(parentData, ref){
        return ref && parentData[ref.replace('#', '')];
    }

    function set(parentData, ref, dataToSet){
        if (ref){
            parentData[ref.replace('#', '')] = dataToSet;
        }
    }

    function remove(parentData, ref){
        if (ref){
            delete parentData[ref.replace('#', '')];
        }
    }

    function moveMediaRef(masterPageDocumentData, pageData, mediaRef){
        // Image or WixVideo
        var media = get(pageData, mediaRef);
        move(mediaRef, masterPageDocumentData, pageData);
        // Image
        move(media.posterImageRef, masterPageDocumentData, pageData);
    }

    siteAsJson.pages.forEach(function(page) {
        if (!page.structure){
            return;
        }

        var pageData = page.data.document_data;
        var pageId = page.structure.id;
        var desktopBg, mobileBg;

        // Pages or AppPages
        var pageItem = get(pageData, pageId);
        move(pageId, masterData, pageData);

        if (pageItem && pageItem.pageBackgrounds && pageItem.pageBackgrounds.desktop.ref) {
            // BackgroundImage or BackgroundMedia
            desktopBg = get(pageData, pageItem.pageBackgrounds.desktop.ref);
            mobileBg = get(pageData, pageItem.pageBackgrounds.mobile.ref);
            move(pageItem.pageBackgrounds.desktop.ref, masterData, pageData);
            move(pageItem.pageBackgrounds.mobile.ref, masterData, pageData);

            var wixBiSession = window.wixBiSession || {};

            //BackgroundMedia
            if (desktopBg) {
                if (desktopBg.mediaRef) {
                    moveMediaRef(masterData, pageData, desktopBg.mediaRef);
                }
                //Image
                move(desktopBg.imageOverlay, masterData, pageData);
            } else {
                sendErrorOrQueue({errorName: 'MISSING_DESKTOP_BACKGROUND_ITEM', errorCode: 112001, severity: 30}, pageItem.id);
            }

            if (mobileBg) {
                if (mobileBg.mediaRef) {
                    moveMediaRef(masterData, pageData, mobileBg.mediaRef);
                }
                //Image
                move(mobileBg.imageOverlay, masterData, pageData);
            } else {
                sendErrorOrQueue({errorName: 'MISSING_MOBILE_BACKGROUND_ITEM', errorCode: 112002, severity: 30}, pageItem.id);
            }
        }
    });
}

/*fix for ios8 bug - CLNT-2459 - will be removed when apple fix the bug
 * https://bugs.webkit.org/show_bug.cgi?id=136904
 *
 * sagi: modified to handle all mobile devices (especially fixes android's firefox and IE on win phones)
 *
 */
function fixViewport(siteModel) {
    function isMobileDevice() {
        var userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
        var patternByDevice = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
        var patternByModel = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
        return patternByDevice.test(userAgent) || patternByModel.test(userAgent.substr(0, 4));
    }

    function isOptimizedForMobileSite() {
        return siteModel.rendererModel.siteMetaData.adaptiveMobileOn;
    }

    if (isMobileDevice() && isOptimizedForMobileSite()) {
        var viewport = document.getElementById('wixMobileViewport');
        if (viewport) {
            if (/user-scalable=no/.test(viewport.content)) {
                return;
            }
            document.head.removeChild(viewport);
        }
        document.write('<meta id="wixMobileViewport" name="viewport" content="width=321, user-scalable=no, maximum-scale=2.2">');
    }
}
/* global joinURL */
function getViewerRjsConfig (serviceTopology) {
    /* eslint strict:0 */

    //TODO: cancel fallback to staticServerUrl when server is stable
    var scriptsLocation = serviceTopology.scriptsDomainUrl || serviceTopology.staticServerUrl;
    var serviceURL = joinURL.bind(null, scriptsLocation, 'services', 'third-party');
    return {
        //By default load any module IDs from js/lib
        baseUrl: '/',
        //except, if the module ID starts with "app",
        //load it from the js/app directory. paths
        //config is relative to the baseUrl, and
        //never includes a ".js" extension since
        //the paths config could be for a directory.
        paths: {
            experiment: 'js/plugins/experiment/experiment',
            RemoteModelInterface: 'static/wixcode/static/RemoteModelInterface',
            modernizr: serviceURL('modernizer/2.6.2/modernizr-2.6.2.min'),
            lodash: serviceURL('lodash/3.10.1/lodash.min'),
            react: {min: serviceURL('react/0.14.3/react-with-addons.min'), source: '//cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react-with-addons'},
            reactDOM: {min: serviceURL('react/0.14.3/react-dom.min'), source: '//cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react-dom'},
            reactDOMServer: {min: serviceURL('react/0.14.3/react-dom-server.min'), source: '//cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react-dom-server'},
            zepto: serviceURL('zepto/1.1.3/zepto.min'),
            speakingurl: serviceURL('speakingurl/speakingurl.min'),
            immutable: {min: serviceURL('immutable/3.6.2/immutable.min'), source: serviceURL('immutable/3.6.2/immutable')},
            mousetrap: serviceURL('mousetrap/1.4.6/mousetrap.min'),
            swfobject: serviceURL('swfobject/2.3.20130521/swfobject.min'),
            TweenMax: {min: serviceURL('tweenmax/1.18.2/minified/TweenMax.min'), source: serviceURL('tweenmax/1.18.2/uncompressed/TweenMax')},
            TimelineMax: {min: serviceURL('tweenmax/1.18.2/minified/TweenMax.min'), source: serviceURL('tweenmax/1.18.2/uncompressed/TweenMax')},
            ScrollToPlugin: {min: serviceURL('tweenmax/1.18.2/minified/plugins/ScrollToPlugin.min'), source: serviceURL('tweenmax/1.18.2/uncompressed/plugins/ScrollToPlugin')},
            DrawSVGPlugin: {min: serviceURL('tweenmax/1.18.2/minified/plugins/DrawSVGPlugin.min'), source: serviceURL('tweenmax/1.18.2/uncompressed/plugins/DrawSVGPlugin')},
            color: 'js/vendor/color/color.min',
            jasmine: 'js/vendor/jasmine/jasmine2',
            'jasmine-html': 'js/vendor/jasmine/jasmine-html',
            'jasmine-boot': 'js/vendor/jasmine/jasmine-boot',
            bluebird: {min: 'js/vendor/bluebird.min', source: 'js/vendor/bluebird'},
            SoundManager: 'js/vendor/soundmanager2/soundmanager2-nodebug-jsmin',
            ajv: 'js/vendor/ajv/ajv.min',
            ReactProxy: 'js/vendor/ReactProxy',
            Squire: 'js/vendor/squire/Squire',
            io: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.0/socket.io.min',
            hot: './node_modules/santa-utils/common/hot/listener',
            patcher: './node_modules/santa-utils/common/hot/patcher',
            fake: 'js/plugins/fake/src/main/fake',
            definition: 'js/plugins/definition/src/main/definition'

        },
        // generated
        packages: null,
        bundles: null,
        shim: {
            zepto: {exports: '$'},
            color: {exports: 'Color'},
            'jasmine-html': {
                deps: ['jasmine']
            },
            'jasmine-boot': {
                deps: ['jasmine', 'jasmine-html']
            },
            bluebird: {exports: 'bluebird'},
            SoundManager: {exports: 'soundManager'},
            ReactProxy: {
                deps: ['react'],
                exports: 'ReactProxy'
            }
        },
        waitSeconds: 0
    };
}

/* global joinURL:false */
function getFullRjsConfig(rjsConfigFunc, packagesUtil, artifactData, serviceTopology) {

    //Call with serviceTopology and all arguments after
    var config = rjsConfigFunc.apply(null, Array.prototype.slice.call(arguments, 3));

    config = packagesUtil.buildConfig(config);
    var isAddress = RegExp.prototype.test.bind(/^https?:\/\//);

    var artifactPath = joinURL(serviceTopology.scriptsDomainUrl, 'services', artifactData.artifactName);
    if (artifactData.baseVersionOverride) {
        config.baseUrl = isAddress(artifactData.baseVersionOverride) ?
          artifactData.baseVersionOverride :
            joinURL(artifactPath, artifactData.baseVersionOverride);
    } else {
        config.baseUrl = serviceTopology.scriptsLocationMap[artifactData.artifactName];
    }
    return config;
}

function getSubdomain(domain) {
    if (!domain) {
        return '';
    }
    var subDomain = domain.split('.');
    if (subDomain.length <= 2) {
        subDomain = domain;
    } else {
        var beforeLastPart = subDomain[subDomain.length - 2];
        var topLevelDomains = {com: true, org: true, net: true, edu: true, gov: true, mil: true, info: true, co: true, ac: true};
        if (topLevelDomains[beforeLastPart]) {
            subDomain = subDomain[subDomain.length - 3] + '.' + subDomain[subDomain.length - 2] + '.' + subDomain[subDomain.length - 1];
        } else {
            subDomain = subDomain[subDomain.length - 2] + '.' + subDomain[subDomain.length - 1];
        }
    }
    return subDomain;
}
/* globals  persistent:true, config:true */
function render(isServerSide, isPreview, contentCache, queryUtil, siteModel, wixBiSession) {

    siteModel.renderFlags = {};

    var performanceNow = performance.now ?
        performance.now.bind(performance) :
        Date.now.bind(Date);

    function addConditionalDependencies(pkgs) {
        function shouldLoadPackageFor(applicationType) {
            var map = (siteModel.rendererModel || window.rendererModel).clientSpecMap;

            return Object.keys(map).some(function (applicationId) {
                return map[applicationId].type === applicationType;
            });
        }

        var isQaAutomation = queryUtil.isParameterTrue.bind(queryUtil, 'isqa');
        var isTpaIntegration = queryUtil.isParameterTrue.bind(queryUtil, 'isTpaIntegration');
        var isWixCodeIntegration = queryUtil.isParameterTrue.bind(queryUtil, 'isWixCodeIntegration');

        function isWixDomain() {
            return location.hostname === 'www.wix.com';
        }

        function isWixSites() {
            return isWixDomain() || queryUtil.isParameterTrue('iswixsite');
        }

        function isWixCloud() {
            return shouldLoadPackageFor('siteextension');
        }

        if (isPreview) {
            pkgs.push('immutable');
        }
        if (isQaAutomation()) {
            pkgs.push('qaAutomation');
        }
        if (isWixSites()) {
            pkgs.push('wixSites');
        }
        if (isTpaIntegration()) {
            pkgs.push('tpaIntegration', 'jasmine', 'jasmine-html', 'bluebird');
        }
        if (isWixCodeIntegration()) {
            pkgs.push('wixCodeIntegration', 'jasmine', 'jasmine-html', 'bluebird');
        }
        if (isWixCloud()) {
            pkgs.push('cloud');
        }
        if (isWixCloud() || isPreview) {
            pkgs.push('wixCode');
        }
        if (isPreview || shouldLoadPackageFor('wixapps') || shouldLoadPackageFor('ecommerce')) {
            pkgs.push('wixappsCore', 'wixappsClassics');
        }
        if (isPreview || shouldLoadPackageFor('appbuilder')) {
            pkgs.push('wixappsCore', 'wixappsBuilder');
        }
    }

    function load(pkgs, callback) {
        /*
         * Require all needed packages (static + conditional)
         * Then do initial site render (or re-layout if it was rendered by the server)
         */
        function getAjaxHandler($) {
            var isXhrWithCredentials = (function () {
                try {
                    var xhr = new XMLHttpRequest();
                    return "withCredentials" in xhr;
                } catch (e) {
                    return false;
                }
            }());

            function setCallbacks(xhr, options) {
                xhr.onerror = function (e) {
                    if (options.error) {
                        options.error(e);
                    }
                };
                xhr.onload = function () {
                    if (options.success) {
                        var response = null;
                        try {
                            response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            response = xhr.responseText;
                        }
                        options.success(response);
                    }
                };
            }

            var async = window.Promise && window.Promise.resolve ?
                (function () {
                    var resolved = window.Promise.resolve();
                    return function (cb) {
                        resolved.then(cb);
                    };
                }()) :
                function (cb) {
                    setTimeout(cb, 0);
                };

            function simResponse(content, options) {
                var success = options.success.bind(options.context || window, content);
                if (options.syncCache || options.async === false) {
                    success();
                } else {
                    async(success);
                }
            }

            function canUseCache(options) {
                return options.dataType === 'json' && (!options.type || options.type.toUpperCase() === 'GET');
            }

            function error(msg) {
                try {
                    console.error(msg);
                } catch (e) {
                    // empty
                }
            }

            return function ajax(options) {
                var cachedContent;
                if (options.cache !== false && (cachedContent = contentCache[options.url]) && canUseCache(options)) {
                    simResponse(cachedContent, options);
                } else if (isXhrWithCredentials) {
                    contentCache[options.url] = false;
                    $.ajax.apply($, arguments);
                } else if (typeof XDomainRequest !== 'undefined') {
                    /*globals XDomainRequest:true*/
                    var xhr = new XDomainRequest();
                    var httpMethod = options.type || 'GET';
                    xhr.open(httpMethod, options.url);
                    setCallbacks(xhr, options);
                    xhr.setRequestHeader = function () {
                    }; // ignores request headers in IE (not supported)
                    xhr.send();
                } else {
                    error('XHR cors not supported, and neither is XDR');
                }
            };
        }

        addConditionalDependencies(pkgs);
        requirejs(pkgs, function () {
            wixBiSession.packagesLoaded = Date.now();

            function buildFunctionParametersObject(_pkgs, args) {
                return _pkgs.reduce(function (result, pkg, index) {
                    result[pkg] = args[index];
                    return result;
                }, {});
            }

            function initConditionalDependencies(_pkgs) {
                if (_pkgs.qaAutomation) {
                    _pkgs.qaAutomation.init(window, siteModel);
                }
                if (_pkgs.tpaIntegration) {
                    _pkgs.tpaIntegration.init(window);
                }

                if (_pkgs.wixCodeIntegration) {
                    _pkgs.wixCodeIntegration.init(window);
                }
            }

            var p = buildFunctionParametersObject(pkgs, arguments);
            initConditionalDependencies(p);

            var ajaxHandler = getAjaxHandler(p.zepto);
            p.utils.ajaxLibrary.register(ajaxHandler);
            p.utils.ajaxLibrary.enableJsonpHack();

            // Wait for DOM to be ready before accessing it, e.g. getElementById
            p.zepto(function () {
                if (siteModel.wixData) {
                    var siteStructureNode = document.getElementById('SITE_STRUCTURE');
                    siteModel.wixHtmlRaw = siteStructureNode.outerHTML;
                    siteModel.wixAnchors = window.anchors || {};
                    siteStructureNode.parentNode.removeChild(siteStructureNode);
                }

                siteModel.requestModel = {
                    userAgent: window.navigator.userAgent,
                    cookie: document.cookie,
                    storage: p.utils.storage(window)
                };
                siteModel.currentUrl = p.utils.urlUtils.parseUrl(location.href);
                siteModel.forceMobileView = window.forceMobileView;

                callback(p, ajaxHandler);
            });
        }, function (err) {
            if (!config.urlArgs) {
                if (err.requireModules) {
                    err.requireModules.forEach(function (module) {
                        requirejs.undef(module);
                    });
                }
                config.urlArgs = 'c=' + Date.now();
                requirejs.config(config);
                var errClone = Object.keys(err).reduce(function (r, k) {
                    r[k] = err[k];
                    return r;
                }, {});
                errClone.message = err.message;
                errClone.stack = err.stack ? '' + err.stack : '';
                requirejs(pkgs, function () {
                    errClone.errn = 'REQUIREJS_RETRY_ERROR';
                    errClone.errc = 111025;
                    errClone.severity = 10;
                    requirejs.onError(errClone);
                }, requirejs.onError);
            }
        });
    }


    function renderClientSide() {
        // because ajv loads js-beautify synchronously even when does not use it
        define('js-beautify', {}); // eslint-disable-line santa/module-definition
        var clientSidePackages = ['skins', 'components', 'utils', 'core', 'react', 'lodash',
            'TimelineMax', 'layout', 'tpa', 'zepto', 'fonts', 'color', 'animations',
            'swfobject', 'mousetrap', 'tweenEngine', 'DrawSVGPlugin', 'reactDOM', 'ScrollToPlugin',
            'widgets', 'experiment', 'js-beautify', 'render'];
        if (queryUtil.isParameterTrue('ds') || isPreview) {
            clientSidePackages.push('documentServices', 'componentsPreviewLayer');
        }
        load(clientSidePackages,
            function (loadedPackages, ajaxHandler) {
                loadedPackages.render.clientSide(loadedPackages, ajaxHandler, siteModel/*, onReady*/);
            });
    }

    function renderServerSide() {
        load(['layout', 'utils', 'zepto', 'lodash', 'fonts', 'color'],
            function (p, ajaxHandler) {
                var getDomNode = function () {
                    var domId = p.lodash.toArray(arguments).join('');
                    return document.getElementById(domId);
                };
                var siteData = new p.utils.SiteData(siteModel, ajaxHandler);
                siteData.currentPageInfo = p.utils.wixUrlParser.parseUrl(siteData, siteData.currentUrl.full);
                var currentPage = siteData.currentPageInfo.pageId;
                var requests = p.utils.pageRequests(siteData, siteData.currentPageInfo);
                siteData.store.loadBatch(requests, function () {
                    var structuresDesc = {
                        inner: {
                            structure: siteData.pagesData[currentPage].structure,
                            pageId: currentPage,
                            getDomNodeFunc: getDomNode
                        },
                        outer: {
                            structure: siteData.pagesData.masterPage.structure,
                            getDomNodeFunc: getDomNode
                        }
                    };
                    p.layout.reLayout(structuresDesc, siteData); //todo Shimi_Liderman 11/11/2015 16:15 this does not work anymore - relayout now uses siteAPI
                    getDomNode('SITE_STRUCTURE').style.visibility = '';
                    getDomNode(siteData.currentPageInfo.pageId).style.visibility = '';
                    window.sssr.serverSideRender = {
                        sinceInitialTimestamp: (Date.now() - window.wixBiSession.initialTimestamp),
                        performanceNow: performanceNow()
                    };
                    wixBiSession.beat(12);
                    renderClientSide();
                });
            });
    }

    // Server side render state
    window.sssr = {};

    function callRender() {
        if (isServerSide) {
            renderServerSide();
        } else {
            renderClientSide();
        }
    }

    if (queryUtil.getParameterByName('ReactSource') === 'http://localhost') {
        requirejs(['hot', 'zepto'], function (hot, $) {
            hot.init($);
            callRender();
        });
    } else {
        callRender();
    }
}

function addExperimentsFromQuery(runningExperiments, queryUtil) {
  function overrideFromParam(experiments, param, value) {
    return queryUtil.getParameterByName(param).split(',').filter(Boolean).reduce(function (accum, exp) {
      accum[exp] = value;
      return accum;
    }, experiments);
  }

  var experiments = Object.keys(runningExperiments).reduce(function(accum, exp) {
    accum[exp] = runningExperiments[exp];
    return accum;
  }, {});

  experiments = overrideFromParam(experiments, 'experiments', 'new');
  experiments = overrideFromParam(experiments, 'experimentsoff', 'old');

  return experiments;
}

////////////////////////////////////////////////////////////////////////
// requirejs main-r will be generated from this file
////////////////////////////////////////////////////////////////////////
/*eslint santa/enforce-package-access:0*/
/*global packagesUtil, instrument, queryUtil, overrideScriptsLocationMapFromQuery, prefetchPages, convertSiteModel, fixViewport, getFullRjsConfig, getViewerRjsConfig, getSubdomain, render, convertRendererModel, joinURL, addExperimentsFromQuery*/

    var wixBiSession = window.wixBiSession || {};
    window.wixBiSession = wixBiSession;
    wixBiSession.mainLoaded = Date.now();
    wixBiSession.et = 1;

    var siteModel = window.siteModel || {};
    var publicModel = window.publicModel || siteModel.publicModel;
    var serviceTopology = siteModel.serviceTopology || window.serviceTopology || {};
    serviceTopology.scriptsLocationMap = overrideScriptsLocationMapFromQuery(serviceTopology.scriptsLocationMap, queryUtil.getParameterByName('scriptsLocations'));
    window.rendererModel.runningExperiments = addExperimentsFromQuery(window.rendererModel.runningExperiments, queryUtil);

    if (!siteModel.publicModel) {
        var rendererModel = convertRendererModel(window.rendererModel, publicModel);
        siteModel = convertSiteModel(rendererModel, publicModel);
        window.siteModel = siteModel;
    }

    instrument(serviceTopology, wixBiSession, queryUtil, siteModel, publicModel);
    wixBiSession.beat(4);

    var contentCache = {};
    if (publicModel) {
        var dynamicModel = publicModel.externalBaseUrl || (location.protocol + '//' + location.host + location.pathname);
        dynamicModel = joinURL(dynamicModel, '/_api/dynamicmodel');
        contentCache = prefetchPages(siteModel, publicModel, dynamicModel);
    }

    if (window.karmaIntegration){
        siteModel.documentServicesModel = siteModel.documentServicesModel || window.karmaIntegration.documentServicesModel;
        siteModel.wixapps = siteModel.wixapps || {};
        siteModel.wixapps.appbuilder = siteModel.wixapps.appbuilder || {};
        siteModel.wixapps.appbuilder.descriptor = siteModel.wixapps.appbuilder.descriptor || {};
        siteModel.wixapps.appbuilder.descriptor.applicationInstanceVersion = siteModel.wixapps.appbuilder.descriptor.applicationInstanceVersion || {};
    }

    fixViewport(siteModel);
    var config = getFullRjsConfig(getViewerRjsConfig,
                                  packagesUtil,
                                  {
                                      baseVersionOverride: queryUtil.getParameterByName('ReactSource'),
                                      artifactName: 'santa'
                                  },
                                  serviceTopology);

    siteModel.santaBase = config.baseUrl;
    serviceTopology.staticServerFallbackUrl = serviceTopology.staticServerFallbackUrl || 'https://fallback.wix.com/';
    var semverMatches = siteModel.santaBase.match(/\/(\d+\.\d+\.\d+)\/?$/);
    siteModel.baseVersion = semverMatches && semverMatches[1];
    siteModel.santaBaseFallbackUrl = siteModel.baseVersion ? joinURL(serviceTopology.staticServerFallbackUrl, siteModel.baseVersion) : null;

    requirejs.config(config);

    try {
        document.domain = getSubdomain(document.domain);
    } catch (e) {
        // empty
    }

    window.isPreview = queryUtil.isParameterTrue.bind(packagesUtil, 'isEdited');
    var isPreview = queryUtil.isParameterTrue('isEdited');
    var isServerSide = !(window.clientSideRender || window.location.hash || isPreview);
    render(isServerSide, isPreview, contentCache, queryUtil, siteModel, wixBiSession);
}; startRender();