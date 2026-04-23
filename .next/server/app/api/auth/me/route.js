"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/me/route";
exports.ids = ["app/api/auth/me/route"];
exports.modules = {

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.js&appDir=C%3A%5CUsers%5CSREYA%20DATTA%20GUPTA%5CDesktop%5Cclaude%5Cfairsight%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CSREYA%20DATTA%20GUPTA%5CDesktop%5Cclaude%5Cfairsight&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.js&appDir=C%3A%5CUsers%5CSREYA%20DATTA%20GUPTA%5CDesktop%5Cclaude%5Cfairsight%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CSREYA%20DATTA%20GUPTA%5CDesktop%5Cclaude%5Cfairsight&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_SREYA_DATTA_GUPTA_Desktop_claude_fairsight_app_api_auth_me_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/me/route.js */ \"(rsc)/./app/api/auth/me/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/me/route\",\n        pathname: \"/api/auth/me\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/me/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\SREYA DATTA GUPTA\\\\Desktop\\\\claude\\\\fairsight\\\\app\\\\api\\\\auth\\\\me\\\\route.js\",\n    nextConfigOutput,\n    userland: C_Users_SREYA_DATTA_GUPTA_Desktop_claude_fairsight_app_api_auth_me_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/me/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGbWUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkZtZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkZtZSUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNTUkVZQSUyMERBVFRBJTIwR1VQVEElNUNEZXNrdG9wJTVDY2xhdWRlJTVDZmFpcnNpZ2h0JTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNTUkVZQSUyMERBVFRBJTIwR1VQVEElNUNEZXNrdG9wJTVDY2xhdWRlJTVDZmFpcnNpZ2h0JmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNzQztBQUNuSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2ZhaXJzaWdodC8/YjdiOCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxTUkVZQSBEQVRUQSBHVVBUQVxcXFxEZXNrdG9wXFxcXGNsYXVkZVxcXFxmYWlyc2lnaHRcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXG1lXFxcXHJvdXRlLmpzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL21lL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9tZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9tZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXFNSRVlBIERBVFRBIEdVUFRBXFxcXERlc2t0b3BcXFxcY2xhdWRlXFxcXGZhaXJzaWdodFxcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcbWVcXFxccm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvbWUvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.js&appDir=C%3A%5CUsers%5CSREYA%20DATTA%20GUPTA%5CDesktop%5Cclaude%5Cfairsight%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CSREYA%20DATTA%20GUPTA%5CDesktop%5Cclaude%5Cfairsight&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/me/route.js":
/*!**********************************!*\
  !*** ./app/api/auth/me/route.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.js\");\n/* harmony import */ var _lib_mongoose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/mongoose */ \"(rsc)/./lib/mongoose.js\");\n/* harmony import */ var _lib_models_User__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/models/User */ \"(rsc)/./lib/models/User.js\");\n\n\n\n\nasync function GET() {\n    try {\n        const tokenData = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__.getCurrentUser)();\n        if (!tokenData?.userId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                user: null\n            }, {\n                status: 401\n            });\n        }\n        await (0,_lib_mongoose__WEBPACK_IMPORTED_MODULE_2__.connectDB)();\n        const user = await _lib_models_User__WEBPACK_IMPORTED_MODULE_3__[\"default\"].findById(tokenData.userId);\n        if (!user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                user: null\n            }, {\n                status: 401\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            user: user.toSafeObject()\n        });\n    } catch (err) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            user: null\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvbWUvcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBMkM7QUFDQztBQUNEO0FBQ047QUFFOUIsZUFBZUk7SUFDcEIsSUFBSTtRQUNGLE1BQU1DLFlBQVksTUFBTUoseURBQWNBO1FBQ3RDLElBQUksQ0FBQ0ksV0FBV0MsUUFBUTtZQUN0QixPQUFPTixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO2dCQUFFQyxNQUFNO1lBQUssR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3pEO1FBRUEsTUFBTVAsd0RBQVNBO1FBQ2YsTUFBTU0sT0FBTyxNQUFNTCx3REFBSUEsQ0FBQ08sUUFBUSxDQUFDTCxVQUFVQyxNQUFNO1FBQ2pELElBQUksQ0FBQ0UsTUFBTTtZQUNULE9BQU9SLHFEQUFZQSxDQUFDTyxJQUFJLENBQUM7Z0JBQUVDLE1BQU07WUFBSyxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDekQ7UUFFQSxPQUFPVCxxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1lBQUVDLE1BQU1BLEtBQUtHLFlBQVk7UUFBRztJQUN2RCxFQUFFLE9BQU9DLEtBQUs7UUFDWixPQUFPWixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1lBQUVDLE1BQU07UUFBSyxHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUN6RDtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmFpcnNpZ2h0Ly4vYXBwL2FwaS9hdXRoL21lL3JvdXRlLmpzPzdlNjkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5pbXBvcnQgeyBnZXRDdXJyZW50VXNlciB9IGZyb20gXCJAL2xpYi9hdXRoXCI7XG5pbXBvcnQgeyBjb25uZWN0REIgfSBmcm9tIFwiQC9saWIvbW9uZ29vc2VcIjtcbmltcG9ydCBVc2VyIGZyb20gXCJAL2xpYi9tb2RlbHMvVXNlclwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHRva2VuRGF0YSA9IGF3YWl0IGdldEN1cnJlbnRVc2VyKCk7XG4gICAgaWYgKCF0b2tlbkRhdGE/LnVzZXJJZCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdXNlcjogbnVsbCB9LCB7IHN0YXR1czogNDAxIH0pO1xuICAgIH1cblxuICAgIGF3YWl0IGNvbm5lY3REQigpO1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKHRva2VuRGF0YS51c2VySWQpO1xuICAgIGlmICghdXNlcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdXNlcjogbnVsbCB9LCB7IHN0YXR1czogNDAxIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHVzZXI6IHVzZXIudG9TYWZlT2JqZWN0KCkgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHVzZXI6IG51bGwgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldEN1cnJlbnRVc2VyIiwiY29ubmVjdERCIiwiVXNlciIsIkdFVCIsInRva2VuRGF0YSIsInVzZXJJZCIsImpzb24iLCJ1c2VyIiwic3RhdHVzIiwiZmluZEJ5SWQiLCJ0b1NhZmVPYmplY3QiLCJlcnIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/me/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/auth.js":
/*!*********************!*\
  !*** ./lib/auth.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   clearAuthCookie: () => (/* binding */ clearAuthCookie),\n/* harmony export */   getCurrentUser: () => (/* binding */ getCurrentUser),\n/* harmony export */   setAuthCookie: () => (/* binding */ setAuthCookie),\n/* harmony export */   signToken: () => (/* binding */ signToken),\n/* harmony export */   verifyToken: () => (/* binding */ verifyToken)\n/* harmony export */ });\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\nconst JWT_SECRET = process.env.JWT_SECRET || \"fairsight-dev-secret-change-in-production\";\nconst COOKIE_NAME = \"fairsight_token\";\nfunction signToken(payload) {\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().sign(payload, JWT_SECRET, {\n        expiresIn: \"7d\"\n    });\n}\nfunction verifyToken(token) {\n    try {\n        return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().verify(token, JWT_SECRET);\n    } catch  {\n        return null;\n    }\n}\nfunction setAuthCookie(response, token) {\n    response.cookies.set(COOKIE_NAME, token, {\n        httpOnly: true,\n        secure: \"development\" === \"production\",\n        sameSite: \"lax\",\n        maxAge: 60 * 60 * 24 * 7,\n        path: \"/\"\n    });\n}\nfunction clearAuthCookie(response) {\n    response.cookies.set(COOKIE_NAME, \"\", {\n        maxAge: 0,\n        path: \"/\"\n    });\n}\nasync function getCurrentUser() {\n    try {\n        const cookieStore = await (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)();\n        const token = cookieStore.get(COOKIE_NAME)?.value;\n        if (!token) return null;\n        return verifyToken(token);\n    } catch  {\n        return null;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUErQjtBQUNRO0FBRXZDLE1BQU1FLGFBQWFDLFFBQVFDLEdBQUcsQ0FBQ0YsVUFBVSxJQUFJO0FBQzdDLE1BQU1HLGNBQWM7QUFFYixTQUFTQyxVQUFVQyxPQUFPO0lBQy9CLE9BQU9QLHdEQUFRLENBQUNPLFNBQVNMLFlBQVk7UUFBRU8sV0FBVztJQUFLO0FBQ3pEO0FBRU8sU0FBU0MsWUFBWUMsS0FBSztJQUMvQixJQUFJO1FBQ0YsT0FBT1gsMERBQVUsQ0FBQ1csT0FBT1Q7SUFDM0IsRUFBRSxPQUFNO1FBQ04sT0FBTztJQUNUO0FBQ0Y7QUFFTyxTQUFTVyxjQUFjQyxRQUFRLEVBQUVILEtBQUs7SUFDM0NHLFNBQVNiLE9BQU8sQ0FBQ2MsR0FBRyxDQUFDVixhQUFhTSxPQUFPO1FBQ3ZDSyxVQUFVO1FBQ1ZDLFFBQVFkLGtCQUF5QjtRQUNqQ2UsVUFBVTtRQUNWQyxRQUFRLEtBQUssS0FBSyxLQUFLO1FBQ3ZCQyxNQUFNO0lBQ1I7QUFDRjtBQUVPLFNBQVNDLGdCQUFnQlAsUUFBUTtJQUN0Q0EsU0FBU2IsT0FBTyxDQUFDYyxHQUFHLENBQUNWLGFBQWEsSUFBSTtRQUFFYyxRQUFRO1FBQUdDLE1BQU07SUFBSTtBQUMvRDtBQUVPLGVBQWVFO0lBQ3BCLElBQUk7UUFDRixNQUFNQyxjQUFjLE1BQU10QixxREFBT0E7UUFDakMsTUFBTVUsUUFBUVksWUFBWUMsR0FBRyxDQUFDbkIsY0FBY29CO1FBQzVDLElBQUksQ0FBQ2QsT0FBTyxPQUFPO1FBQ25CLE9BQU9ELFlBQVlDO0lBQ3JCLEVBQUUsT0FBTTtRQUNOLE9BQU87SUFDVDtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmFpcnNpZ2h0Ly4vbGliL2F1dGguanM/Mjg3YiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgand0IGZyb20gXCJqc29ud2VidG9rZW5cIjtcbmltcG9ydCB7IGNvb2tpZXMgfSBmcm9tIFwibmV4dC9oZWFkZXJzXCI7XG5cbmNvbnN0IEpXVF9TRUNSRVQgPSBwcm9jZXNzLmVudi5KV1RfU0VDUkVUIHx8IFwiZmFpcnNpZ2h0LWRldi1zZWNyZXQtY2hhbmdlLWluLXByb2R1Y3Rpb25cIjtcbmNvbnN0IENPT0tJRV9OQU1FID0gXCJmYWlyc2lnaHRfdG9rZW5cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNpZ25Ub2tlbihwYXlsb2FkKSB7XG4gIHJldHVybiBqd3Quc2lnbihwYXlsb2FkLCBKV1RfU0VDUkVULCB7IGV4cGlyZXNJbjogXCI3ZFwiIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5VG9rZW4odG9rZW4pIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gand0LnZlcmlmeSh0b2tlbiwgSldUX1NFQ1JFVCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBdXRoQ29va2llKHJlc3BvbnNlLCB0b2tlbikge1xuICByZXNwb25zZS5jb29raWVzLnNldChDT09LSUVfTkFNRSwgdG9rZW4sIHtcbiAgICBodHRwT25seTogdHJ1ZSxcbiAgICBzZWN1cmU6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIixcbiAgICBzYW1lU2l0ZTogXCJsYXhcIixcbiAgICBtYXhBZ2U6IDYwICogNjAgKiAyNCAqIDcsIC8vIDcgZGF5c1xuICAgIHBhdGg6IFwiL1wiLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyQXV0aENvb2tpZShyZXNwb25zZSkge1xuICByZXNwb25zZS5jb29raWVzLnNldChDT09LSUVfTkFNRSwgXCJcIiwgeyBtYXhBZ2U6IDAsIHBhdGg6IFwiL1wiIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudFVzZXIoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY29va2llU3RvcmUgPSBhd2FpdCBjb29raWVzKCk7XG4gICAgY29uc3QgdG9rZW4gPSBjb29raWVTdG9yZS5nZXQoQ09PS0lFX05BTUUpPy52YWx1ZTtcbiAgICBpZiAoIXRva2VuKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gdmVyaWZ5VG9rZW4odG9rZW4pO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImp3dCIsImNvb2tpZXMiLCJKV1RfU0VDUkVUIiwicHJvY2VzcyIsImVudiIsIkNPT0tJRV9OQU1FIiwic2lnblRva2VuIiwicGF5bG9hZCIsInNpZ24iLCJleHBpcmVzSW4iLCJ2ZXJpZnlUb2tlbiIsInRva2VuIiwidmVyaWZ5Iiwic2V0QXV0aENvb2tpZSIsInJlc3BvbnNlIiwic2V0IiwiaHR0cE9ubHkiLCJzZWN1cmUiLCJzYW1lU2l0ZSIsIm1heEFnZSIsInBhdGgiLCJjbGVhckF1dGhDb29raWUiLCJnZXRDdXJyZW50VXNlciIsImNvb2tpZVN0b3JlIiwiZ2V0IiwidmFsdWUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.js\n");

/***/ }),

/***/ "(rsc)/./lib/models/User.js":
/*!****************************!*\
  !*** ./lib/models/User.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n\n\nconst UserSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    name: {\n        type: String,\n        required: true,\n        trim: true,\n        maxlength: 80\n    },\n    email: {\n        type: String,\n        required: true,\n        unique: true,\n        lowercase: true,\n        trim: true\n    },\n    password: {\n        type: String,\n        required: true,\n        minlength: 6\n    },\n    avatar: {\n        type: String,\n        default: \"\"\n    },\n    role: {\n        type: String,\n        enum: [\n            \"user\",\n            \"admin\"\n        ],\n        default: \"user\"\n    },\n    totalAnalyses: {\n        type: Number,\n        default: 0\n    },\n    lastActiveAt: {\n        type: Date,\n        default: Date.now\n    }\n}, {\n    timestamps: true\n});\n// Hash password before save\nUserSchema.pre(\"save\", async function(next) {\n    if (!this.isModified(\"password\")) return next();\n    this.password = await bcryptjs__WEBPACK_IMPORTED_MODULE_1__[\"default\"].hash(this.password, 12);\n    next();\n});\nUserSchema.methods.comparePassword = async function(plain) {\n    return bcryptjs__WEBPACK_IMPORTED_MODULE_1__[\"default\"].compare(plain, this.password);\n};\n// Never return password\nUserSchema.methods.toSafeObject = function() {\n    const obj = this.toObject();\n    delete obj.password;\n    return obj;\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).User || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"User\", UserSchema));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvbW9kZWxzL1VzZXIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFnQztBQUNGO0FBRTlCLE1BQU1FLGFBQWEsSUFBSUYsd0RBQWUsQ0FDcEM7SUFDRUksTUFBTTtRQUFFQyxNQUFNQztRQUFRQyxVQUFVO1FBQU1DLE1BQU07UUFBTUMsV0FBVztJQUFHO0lBQ2hFQyxPQUFPO1FBQUVMLE1BQU1DO1FBQVFDLFVBQVU7UUFBTUksUUFBUTtRQUFNQyxXQUFXO1FBQU1KLE1BQU07SUFBSztJQUNqRkssVUFBVTtRQUFFUixNQUFNQztRQUFRQyxVQUFVO1FBQU1PLFdBQVc7SUFBRTtJQUN2REMsUUFBUTtRQUFFVixNQUFNQztRQUFRVSxTQUFTO0lBQUc7SUFDcENDLE1BQU07UUFBRVosTUFBTUM7UUFBUVksTUFBTTtZQUFDO1lBQVE7U0FBUTtRQUFFRixTQUFTO0lBQU87SUFDL0RHLGVBQWU7UUFBRWQsTUFBTWU7UUFBUUosU0FBUztJQUFFO0lBQzFDSyxjQUFjO1FBQUVoQixNQUFNaUI7UUFBTU4sU0FBU00sS0FBS0MsR0FBRztJQUFDO0FBQ2hELEdBQ0E7SUFBRUMsWUFBWTtBQUFLO0FBR3JCLDRCQUE0QjtBQUM1QnRCLFdBQVd1QixHQUFHLENBQUMsUUFBUSxlQUFnQkMsSUFBSTtJQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDQyxVQUFVLENBQUMsYUFBYSxPQUFPRDtJQUN6QyxJQUFJLENBQUNiLFFBQVEsR0FBRyxNQUFNWixxREFBVyxDQUFDLElBQUksQ0FBQ1ksUUFBUSxFQUFFO0lBQ2pEYTtBQUNGO0FBRUF4QixXQUFXMkIsT0FBTyxDQUFDQyxlQUFlLEdBQUcsZUFBZ0JDLEtBQUs7SUFDeEQsT0FBTzlCLHdEQUFjLENBQUM4QixPQUFPLElBQUksQ0FBQ2xCLFFBQVE7QUFDNUM7QUFFQSx3QkFBd0I7QUFDeEJYLFdBQVcyQixPQUFPLENBQUNJLFlBQVksR0FBRztJQUNoQyxNQUFNQyxNQUFNLElBQUksQ0FBQ0MsUUFBUTtJQUN6QixPQUFPRCxJQUFJckIsUUFBUTtJQUNuQixPQUFPcUI7QUFDVDtBQUVBLGlFQUFlbEMsd0RBQWUsQ0FBQ3FDLElBQUksSUFBSXJDLHFEQUFjLENBQUMsUUFBUUUsV0FBV0EsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2ZhaXJzaWdodC8uL2xpYi9tb2RlbHMvVXNlci5qcz8zYzc0Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tIFwibW9uZ29vc2VcIjtcbmltcG9ydCBiY3J5cHQgZnJvbSBcImJjcnlwdGpzXCI7XG5cbmNvbnN0IFVzZXJTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxuICB7XG4gICAgbmFtZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlLCB0cmltOiB0cnVlLCBtYXhsZW5ndGg6IDgwIH0sXG4gICAgZW1haWw6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSwgdW5pcXVlOiB0cnVlLCBsb3dlcmNhc2U6IHRydWUsIHRyaW06IHRydWUgfSxcbiAgICBwYXNzd29yZDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlLCBtaW5sZW5ndGg6IDYgfSxcbiAgICBhdmF0YXI6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBcIlwiIH0sXG4gICAgcm9sZTogeyB0eXBlOiBTdHJpbmcsIGVudW06IFtcInVzZXJcIiwgXCJhZG1pblwiXSwgZGVmYXVsdDogXCJ1c2VyXCIgfSxcbiAgICB0b3RhbEFuYWx5c2VzOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMCB9LFxuICAgIGxhc3RBY3RpdmVBdDogeyB0eXBlOiBEYXRlLCBkZWZhdWx0OiBEYXRlLm5vdyB9LFxuICB9LFxuICB7IHRpbWVzdGFtcHM6IHRydWUgfVxuKTtcblxuLy8gSGFzaCBwYXNzd29yZCBiZWZvcmUgc2F2ZVxuVXNlclNjaGVtYS5wcmUoXCJzYXZlXCIsIGFzeW5jIGZ1bmN0aW9uIChuZXh0KSB7XG4gIGlmICghdGhpcy5pc01vZGlmaWVkKFwicGFzc3dvcmRcIikpIHJldHVybiBuZXh0KCk7XG4gIHRoaXMucGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaCh0aGlzLnBhc3N3b3JkLCAxMik7XG4gIG5leHQoKTtcbn0pO1xuXG5Vc2VyU2NoZW1hLm1ldGhvZHMuY29tcGFyZVBhc3N3b3JkID0gYXN5bmMgZnVuY3Rpb24gKHBsYWluKSB7XG4gIHJldHVybiBiY3J5cHQuY29tcGFyZShwbGFpbiwgdGhpcy5wYXNzd29yZCk7XG59O1xuXG4vLyBOZXZlciByZXR1cm4gcGFzc3dvcmRcblVzZXJTY2hlbWEubWV0aG9kcy50b1NhZmVPYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IG9iaiA9IHRoaXMudG9PYmplY3QoKTtcbiAgZGVsZXRlIG9iai5wYXNzd29yZDtcbiAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1vbmdvb3NlLm1vZGVscy5Vc2VyIHx8IG1vbmdvb3NlLm1vZGVsKFwiVXNlclwiLCBVc2VyU2NoZW1hKTtcbiJdLCJuYW1lcyI6WyJtb25nb29zZSIsImJjcnlwdCIsIlVzZXJTY2hlbWEiLCJTY2hlbWEiLCJuYW1lIiwidHlwZSIsIlN0cmluZyIsInJlcXVpcmVkIiwidHJpbSIsIm1heGxlbmd0aCIsImVtYWlsIiwidW5pcXVlIiwibG93ZXJjYXNlIiwicGFzc3dvcmQiLCJtaW5sZW5ndGgiLCJhdmF0YXIiLCJkZWZhdWx0Iiwicm9sZSIsImVudW0iLCJ0b3RhbEFuYWx5c2VzIiwiTnVtYmVyIiwibGFzdEFjdGl2ZUF0IiwiRGF0ZSIsIm5vdyIsInRpbWVzdGFtcHMiLCJwcmUiLCJuZXh0IiwiaXNNb2RpZmllZCIsImhhc2giLCJtZXRob2RzIiwiY29tcGFyZVBhc3N3b3JkIiwicGxhaW4iLCJjb21wYXJlIiwidG9TYWZlT2JqZWN0Iiwib2JqIiwidG9PYmplY3QiLCJtb2RlbHMiLCJVc2VyIiwibW9kZWwiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/models/User.js\n");

/***/ }),

/***/ "(rsc)/./lib/mongoose.js":
/*!*************************!*\
  !*** ./lib/mongoose.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   connectDB: () => (/* binding */ connectDB)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nlet cached = global._mongooseCache;\nif (!cached) {\n    cached = global._mongooseCache = {\n        conn: null,\n        promise: null\n    };\n}\nasync function connectDB() {\n    if (cached.conn) return cached.conn;\n    const uri = process.env.MONGODB_URI;\n    if (!uri) throw new Error(\"MONGODB_URI environment variable is not set.\");\n    if (!cached.promise) {\n        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(uri, {\n            bufferCommands: false\n        });\n    }\n    cached.conn = await cached.promise;\n    return cached.conn;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvbW9uZ29vc2UuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWdDO0FBRWhDLElBQUlDLFNBQVNDLE9BQU9DLGNBQWM7QUFDbEMsSUFBSSxDQUFDRixRQUFRO0lBQ1hBLFNBQVNDLE9BQU9DLGNBQWMsR0FBRztRQUFFQyxNQUFNO1FBQU1DLFNBQVM7SUFBSztBQUMvRDtBQUVPLGVBQWVDO0lBQ3BCLElBQUlMLE9BQU9HLElBQUksRUFBRSxPQUFPSCxPQUFPRyxJQUFJO0lBRW5DLE1BQU1HLE1BQU1DLFFBQVFDLEdBQUcsQ0FBQ0MsV0FBVztJQUNuQyxJQUFJLENBQUNILEtBQUssTUFBTSxJQUFJSSxNQUFNO0lBRTFCLElBQUksQ0FBQ1YsT0FBT0ksT0FBTyxFQUFFO1FBQ25CSixPQUFPSSxPQUFPLEdBQUdMLHVEQUFnQixDQUFDTyxLQUFLO1lBQUVNLGdCQUFnQjtRQUFNO0lBQ2pFO0lBRUFaLE9BQU9HLElBQUksR0FBRyxNQUFNSCxPQUFPSSxPQUFPO0lBQ2xDLE9BQU9KLE9BQU9HLElBQUk7QUFDcEIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mYWlyc2lnaHQvLi9saWIvbW9uZ29vc2UuanM/MTYzZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9uZ29vc2UgZnJvbSBcIm1vbmdvb3NlXCI7XG5cbmxldCBjYWNoZWQgPSBnbG9iYWwuX21vbmdvb3NlQ2FjaGU7XG5pZiAoIWNhY2hlZCkge1xuICBjYWNoZWQgPSBnbG9iYWwuX21vbmdvb3NlQ2FjaGUgPSB7IGNvbm46IG51bGwsIHByb21pc2U6IG51bGwgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbm5lY3REQigpIHtcbiAgaWYgKGNhY2hlZC5jb25uKSByZXR1cm4gY2FjaGVkLmNvbm47XG5cbiAgY29uc3QgdXJpID0gcHJvY2Vzcy5lbnYuTU9OR09EQl9VUkk7XG4gIGlmICghdXJpKSB0aHJvdyBuZXcgRXJyb3IoXCJNT05HT0RCX1VSSSBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBub3Qgc2V0LlwiKTtcblxuICBpZiAoIWNhY2hlZC5wcm9taXNlKSB7XG4gICAgY2FjaGVkLnByb21pc2UgPSBtb25nb29zZS5jb25uZWN0KHVyaSwgeyBidWZmZXJDb21tYW5kczogZmFsc2UgfSk7XG4gIH1cblxuICBjYWNoZWQuY29ubiA9IGF3YWl0IGNhY2hlZC5wcm9taXNlO1xuICByZXR1cm4gY2FjaGVkLmNvbm47XG59XG4iXSwibmFtZXMiOlsibW9uZ29vc2UiLCJjYWNoZWQiLCJnbG9iYWwiLCJfbW9uZ29vc2VDYWNoZSIsImNvbm4iLCJwcm9taXNlIiwiY29ubmVjdERCIiwidXJpIiwicHJvY2VzcyIsImVudiIsIk1PTkdPREJfVVJJIiwiRXJyb3IiLCJjb25uZWN0IiwiYnVmZmVyQ29tbWFuZHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/mongoose.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/bcryptjs","vendor-chunks/jsonwebtoken","vendor-chunks/lodash.includes","vendor-chunks/jws","vendor-chunks/lodash.once","vendor-chunks/jwa","vendor-chunks/lodash.isinteger","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/lodash.isplainobject","vendor-chunks/ms","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isboolean","vendor-chunks/safe-buffer","vendor-chunks/buffer-equal-constant-time"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fme%2Froute&page=%2Fapi%2Fauth%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fme%2Froute.js&appDir=C%3A%5CUsers%5CSREYA%20DATTA%20GUPTA%5CDesktop%5Cclaude%5Cfairsight%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CSREYA%20DATTA%20GUPTA%5CDesktop%5Cclaude%5Cfairsight&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();