/**
 * @fileoverview Clock Picker Component
 * @version 0.1.0
 * @author Juan David Andrade
 */

/*global
document: false,
navigator: false,
console: false
*/

(function (jda) {
	"use strict";

	/**
	 * @class Common utilities
	 */
	jda.Utils = {
		/**
		 * Format a number with two digits: 05
		 */
		formatDigit: function (value) {
			return (value < 10 ? '0' : '') + value;
		},
		/**
		 * Checks if the browser is Internet Explorer
		 */
		isIE: function () {
			var re = /MSIE (\d+\.\d+);/;
			return re.test(navigator.userAgent);
		}
	};

	/**
	 * @class
	 * Attachs css3 prefixes for the current browser
	 * @return {Object} _cssProperties Object with css3 properties (key, value)
	 */
	jda.CSSPrefixer = (function () {

		/**
		 * List of available CSS3 Properties
		 * @type {Object}
		 */
		var _cssProperties = {
				textShadow: "textShadow",
				borderRadius: "borderRadius",
				transform: "transform",
				transitionDuration: "transitionDuration",
				boxShadow: "boxShadow",
				transition: "transition"
			},
		/**
		 * List of target browsers
		 * @type {Array}
		 */
			_vendorsArray = ['','webkit','Webkit','moz', 'Moz', 'o', 'ms', 'Ms'];

		/**
		 * Replace match
		 * @param  {[type]} m     [description]
		 * @param  {[type]} key   [description]
		 * @param  {[type]} value [description]
		 * @return {[type]}       [description]
		 */
		function replacePrefix (m, key, value) {
			return key.toString().toUpperCase() + value;
		}

		/**
		 * @constructor
		 */
		(function () {

			var i,
				tempProp,
				vendorsLength = _vendorsArray.length;

			//	looping into css properties object	
			for (var prop in _cssProperties) {
				//	looping into vendor types
				for (i = 0; i <= vendorsLength; ++i) {
					_cssProperties[prop] = null;
					tempProp = prop;
					//	capitalize CSS property
					if (_vendorsArray[i] !== '') {
						tempProp = prop.replace(/(^[a-z]{0,1})([\w])/g, replacePrefix);
					}
					//	property found
					if (typeof document.documentElement.style[_vendorsArray[i] + tempProp] !== 'undefined') {
						_cssProperties[prop] = _vendorsArray[i] + tempProp;
						break;
					}
				}
			}

		}());

		return _cssProperties;
	}());

}( (window.jda = window.jda || {}) ));