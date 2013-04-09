/**
 * @fileoverview Clock Picker Component
 * @version 0.1.0
 * @author Juan David Andrade
 */

/*global
console: false
*/

(function (jda, document) {
	"use strict";

	/**
	 * @class Point object
	 *
	 */
	var Point = function (x, y) {
		this.x = x;
		this.y = y;

		this.substract = function (newPoint) {
			return new Point(this.x - newPoint.x, this.y - newPoint.y);
		};

		this.toString = function () {
			return "x: " + this.x + ", y: " + this.y;
		};
	};

	/**
	 * @class Handles all interactions related to an analog clock component
	 * Lets you configure the clock handles (hours and minutes)
	 */
	var AnalogClock = (function () {
		//	Constants
		var	NUM_STEPS = 12,
			HANDLES = {
				hours: ".handle_hours",
				minutes: ".handle_minutes",
				seconds: ".handle_seconds"
			},
		//	variables
			handleHours = document.querySelector(HANDLES.hours),
			handleMinutes = document.querySelector(HANDLES.minutes),
			handleSeconds = document.querySelector(HANDLES.seconds),
			angle = 0,
			center = new Point(0, 0),
			stepsSize,
			currentHandle,
			hoursPoint,
			minutesPoint;

		/**
		 * Simulate clock tick
		 */
		function rotateHandle() {
			handleSeconds.style.WebkitTransform = 'rotate(' + angle + 'deg)';
			angle += stepsSize;
			setTimeout(rotateHandle, 1000);
		}

		/**
		 * Gets the current angle given by the mouse coordinates
		 * @param {Number} newX The X position relative to the document
		 * @param {Number} newY The Y position relative to the document
		 */
		function getAngle(newX, newY) {
			var newPoint = new Point(newX, newY),
				u = (currentHandle === handleHours) ? hoursPoint.substract(center) : minutesPoint.substract(center),
				v = newPoint.substract(center),
				u2 = Math.pow(u.x, 2) + Math.pow(u.y, 2),
				v2 = Math.pow(v.x, 2) + Math.pow(v.y, 2),
				value = (u.x * v.x + u.y * v.y) / (Math.sqrt(u2) * Math.sqrt(v2)),
				newAngle = Math.acos(value) * 180 / Math.PI;

			//	left side
			if (newPoint.x < center.x) {
				newAngle = 360 - newAngle;
			}

			newAngle = Math.round(newAngle / stepsSize) * stepsSize;

			return newAngle;
		}

		/**
		 * Sets a new angle for the selected handle
		 * @param {Number} value The new angle
		 */
		function setAngle(value) {
			//	apply rotation in IE9
			if (jda.Utils.isIE()) {
				currentHandle.style.cssText = '-ms-transform: rotate(' + value + 'deg)';
			} else {
				//	chrome, safari, firefox
				currentHandle.style[jda.CSSPrefixer.transform] = 'rotate(' + value + 'deg)';
			}

			angle = value;
		}

		/**
		 * Updates the selected handle
		 * @param {String} value The handle selector
		 */
		function setCurrentHandle(value) {
			//	set current handle
			if (value === HANDLES.hours) {
				currentHandle = handleHours;
			} else {
				currentHandle = handleMinutes;
			}
		}

		/**
		 * Updates the selected handle with a new time
		 * @param {Number} value The new time value
		 */
		function updateTime(value) {
			var newAngle;
			//	set hours
			if (currentHandle === handleHours) {
				newAngle = value * stepsSize;
			//	set minutes
			} else {
				newAngle = (value / 60) * NUM_STEPS * stepsSize;
			}
			setAngle(newAngle);
		}

		/**
		 * Dispatch clockChange event when the clock UI has changed
		 */
		function triggerChange() {
			//	create event
			var time,
				customEvent = document.createEvent('Event');

			customEvent.initEvent('clockChange', true, true);

			//	hours updated
			if (currentHandle === handleHours) {
				customEvent.handle = HANDLES.hours;
				time = angle / stepsSize;
				if (time === 0) {
					time = 12;
				}
			//	minutes updated
			} else {
				customEvent.handle = HANDLES.minutes;
				time = angle * 60 / (NUM_STEPS * stepsSize);
				if (time === 60) {
					time = 0;
				}
			}
			customEvent.value = jda.Utils.formatDigit(time);
			//	trigger event
			document.dispatchEvent(customEvent);
		}

		/**
		 * Drag handle
		 */
		function document_mousemoveHandler(e) {
			var newAngle = getAngle(e.clientX, e.clientY);
			setAngle(newAngle);
			triggerChange();
		}

		/**
		 * Drop handle
		 */
		function document_mouseupHandler(e) {
			document.onmousemove = null;
			document.onmouseup = null;
		}

		/**
		 * Hours handle selected
		 */
		function handleHours_mousedownHandler(e) {
			e.preventDefault();
			currentHandle = handleHours;
			document.onmousemove = document_mousemoveHandler;
			document.onmouseup = document_mouseupHandler;
		}

		/**
		 * Minutes handle selected
		 */
		function handleMinutes_mousedownHandler(e) {
			e.preventDefault();
			currentHandle = handleMinutes;
			document.onmousemove = document_mousemoveHandler;
			document.onmouseup = document_mouseupHandler;
		}

		/**
		 * @constructor
		 * Initialize component
		 */
		(function () {
			//	Get position for the current handles
			hoursPoint = new Point(handleHours.offsetLeft, handleHours.offsetTop);
			minutesPoint = new Point(handleMinutes.offsetLeft, handleMinutes.offsetTop);
			//	set delta
			stepsSize = 360 / NUM_STEPS;
			//	get clock's center point
			center.x = handleHours.offsetLeft;
			center.y = handleHours.offsetTop + handleHours.offsetHeight * 0.5;
			//	add event listeners
			handleHours.onmousedown = handleHours_mousedownHandler;
			handleMinutes.onmousedown = handleMinutes_mousedownHandler;
		}());

		//	-------------------------------------------
		//	public methods exposed
		return {
			setCurrentHandle: setCurrentHandle,
			updateTime: updateTime,
			HANDLES: HANDLES
		};
	});

	/**
	 * @class Handles all interactions related to an analog clock component
	 * Lets you configure the clock handles (hours and minutes)
	 */
	var TimeInput = (function (selector, options) {
		//	Constants
		var HANDLES = {
				hours: "hours",
				minutes: "minutes",
				meridian: "meridian"
			},
		//	variables
			form,
			handleHours,
			handleMinutes,
			meridianButton;

		/**
		 * @event
		 * Hours input focused
		 */
		function handleHours_focusHandler(e) {
			e.currentTarget.focus();
			e.currentTarget.select();
			jda.AnalogClock.setCurrentHandle(jda.AnalogClock.HANDLES.hours);
		}

		/**
		 * @event
		 * Minutes input focused
		 */
		function handleMinutes_focusHandler(e) {
			e.currentTarget.focus();
			e.currentTarget.select();
			jda.AnalogClock.setCurrentHandle(jda.AnalogClock.HANDLES.minutes);
		}

		function updateTime(handle, value) {
			handle.value = value;
			//handle.value =  value;
			//	send data to AnalogClock
			jda.AnalogClock.updateTime(value);
		}

		/**
		 * @event
		 * Input text changed
		 */
		function handle_changeHandler(e) {
			var scope = e.currentTarget,
				time = scope.value.replace(/[^0-9]+$/g, "");

			if (scope.name === "hours") {
				if (time > 12) {
					time = 12;
				}
			} else {
				if (time > 59) {
					time = jda.Utils.formatDigit(0);
				}
			}
			updateTime(scope, time);
		}

		/**
		 * @event
		 * Hours/minutes changed from AnalogClock
		 */
		function clockChangeHandler(e) {
			if (e.handle === jda.AnalogClock.HANDLES.hours) {
				handleHours.value = e.value;
			} else {
				handleMinutes.value = e.value;
			}
		}

		/**
		 * Initialize component
		 */
		function init() {
			var currentTime = new Date(),
				currentHours,
				currentMinutes;

			handleHours = form.elements[HANDLES.hours];
			handleMinutes = form.elements[HANDLES.minutes];
			meridianButton = form.elements[HANDLES.meridian];

			//	add event handlers
			handleHours.onfocus = handleHours_focusHandler;
			handleHours.onkeyup = handle_changeHandler;
			handleMinutes.onfocus = handleMinutes_focusHandler;
			handleMinutes.onkeyup = handle_changeHandler;

			//	set current hour
			if (currentTime.getHours() < 12) {
				currentHours = currentTime.getHours();
				meridianButton.checked = false;
			} else {
				currentHours = currentTime.getHours() - 12;
				meridianButton.checked = true;
			}
			currentHours = jda.Utils.formatDigit(currentHours);
			jda.AnalogClock.setCurrentHandle(jda.AnalogClock.HANDLES.hours);
			updateTime(handleHours, currentHours);

			//	set current minutes
			currentMinutes = currentTime.getMinutes();
			jda.AnalogClock.setCurrentHandle(jda.AnalogClock.HANDLES.minute);
			currentMinutes = jda.Utils.formatDigit(currentMinutes);
			updateTime(handleMinutes, currentMinutes);

			//	bind for AnalogClock.change event
			document.addEventListener('clockChange', clockChangeHandler, false);
		}

		/**
		 * @constructor
		 */
		(function () {
			form = document.querySelector(selector);
			if (form && form.length) {
				init();
			}
		}());

	});

	var ClockPicker = function (selector, options) {

		/**
		 * Clock picker DOM container
		 * @type {HTMLElement}
		 * @private
		 */
		var _element,

		/**
		 * Time input fields
		 * @type {TimeInput}
		 */
			_timeInput,

		/**
		 * Analog clock component
		 * @type {AnalogClock}
		 */
			_analogClock,

		/**
		 * Module default Settings
		 * @type {Object}
		 */
			SETTINGS = {

			};

		/**
		 * @constructor
		 */
		(function () {
			_timeInput = new TimeInput();
			_analogClock = new AnalogClock();
		}());


		return {

		};
	};

}((window.jda = window.jda || {}), (document || {})));