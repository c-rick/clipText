'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/** option
 * @param line 截取行数 number | boolean
 * @param showTitle 是否显示title boolean
 * @param clipText 自定义截取文字 string
 * @param clipClick 截取文字点击事件 function
 * @param animation 字体动画 number | boolean ? 60 : 0;
 */
(function (globel) {
	// pollify
	if (window.NodeList && !NodeList.prototype.forEach) NodeList.prototype.forEach = Array.prototype.forEach;
	if (!Date.now) Date.now = function () {
		return new Date().getTime();
	};
	(function () {
		'use strict';

		var vendors = ['webkit', 'moz'];
		for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
			var vp = vendors[i];
			window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
		}
		if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
		|| !window.requestAnimationFrame || !window.cancelAnimationFrame) {
			var lastTime = 0;
			window.requestAnimationFrame = function (callback) {
				var now = Date.now();
				var nextTime = Math.max(lastTime + 16, now);
				return setTimeout(function () {
					callback(lastTime = nextTime);
				}, nextTime - now);
			};
			window.cancelAnimationFrame = clearTimeout;
		}
	})();
	var regExpClip = /[^\u4e00-\u9fa5\uff00-\uffffA-Z]/g;
	function clipText(selectors, opts) {
		var main = {
			defalutOpt: {
				animation: false,
				line: false,
				showTitle: false,
				clipText: '...',
				clipClick: null
			},
			init: function init(selectors, opts) {
				var _this2 = this;

				if (!selectors) {
					throw new Error('arg select is required');
				}
				if (!(opts && opts.line >= 2)) {
					this.clip = this.lineOneClip;
				} else if (navigator.userAgent.indexOf("Chrome") > -1 && !opts.clipText) {
					this.clip = this.chromeClip;
				}
				var selectEl = isArray(selectors) ? selectors : [selectors];
				var cacheEl = [];
				this.defalutOpt = _extends(this.defalutOpt, opts);
				this.setStyle = setStyle();
				selectEl.forEach(function (i) {
					var $i = i instanceof HTMLElement ? i : $(i);
					var animation = _this2.defalutOpt.animation;
					animation = animation ? typeof animation === 'number' ? animation : 60 : animation;
					if ($i && $i.forEach) {
						$i.forEach(function (j) {
							cacheEl.push({ el: j, orText: j.innerText });
							_this2.clip(j);
							animation && _this2.setAnimation(j, animation);
						});
					} else {
						cacheEl.push({ el: $i, orText: $i.innerText });
						_this2.clip($i);
						animation && _this2.setAnimation($i, animation);
					}
				});
				// init resize
				var resizeCB = function resizeCB() {
					cacheEl.forEach(function (i) {
						_this2.clip(i.el, _this2.defalutOpt, i.orText);
					});
				};
				if (!window.onresize) {
					window.onresize = resizeCB;
				} else {
					var _prevCB = window.onresize;
					window.onresize = function () {
						_prevCB.call(window);
						resizeCB.call(_this2);
					};
				}
				window.attachEvent && window.attachEvent('onresize', function () {
					prevCB.call(window);
					resizeCB.call(_this);
				});
			},
			clip: function clip($el, opt, orText) {
				// for resize
				this.defalutOpt = opt || this.defalutOpt;
				var originText = orText || $el.innerText;

				var elCss = window.getComputedStyle($el);
				var _defalutOpt = this.defalutOpt,
				    line = _defalutOpt.line,
				    clipText = _defalutOpt.clipText,
				    clipClick = _defalutOpt.clipClick,
				    showTitle = _defalutOpt.showTitle,
				    animation = _defalutOpt.animation;

				var lineNum = Math.round(parseFloat(elCss.width) / parseFloat(elCss.fontSize) - 0.65);
				var nextText = originText;
				var finalLineNum = 0;
				// compute finalText
				for (var i = 0; i < line; i++) {
					var nextNum = this.countExamine(nextText, lineNum);
					var checkText = originText.slice(finalLineNum, finalLineNum + nextNum);
					var overNum = this.getOverLen(checkText, lineNum);
					if (overNum) {
						nextNum = nextNum - overNum;
					}
					nextText = originText.slice(nextNum, originText.length);
					finalLineNum += nextNum;
				}
				var finalText = originText.slice(0, finalLineNum);
				// if not overflow
				if (finalText.length === originText.length) {
					$el.title = null;
					return $el.innerText = originText;
				};
				if (showTitle) {
					$el.title = originText;
				}

				var _countClip = this.countClip(finalText),
				    _countClip2 = _slicedToArray(_countClip, 2),
				    finalClipLen = _countClip2[0],
				    clipLineNum = _countClip2[1];

				var clipLen = finalText.length - finalClipLen;
				var overClipLen = this.getOverLen(finalText.slice(clipLen, finalText.length), clipLineNum);

				$el.innerText = finalText.slice(0, finalText.length - finalClipLen + overClipLen);
				// add customize more text
				var clipNode = document.createElement('a');
				// add clip event
				if (clipClick) {
					clipNode.onclick = function (e) {
						clipClick.call(clipNode, e);
					};
					clipNode.style = "cursor:pointer";
				}
				clipNode.innerText = clipText;
				$el.appendChild(clipNode);
			},
			countClip: function countClip(str) {
				var clipText = this.defalutOpt.clipText;
				var otherText = clipText.match(regExpClip);
				var clipLen = clipText.length;
				var finalLen = otherText ? Math.ceil(otherText.length / 2) + (clipLen - otherText.length) : clipLen;
				var reBackStr = str.split('').reverse().join("");
				return [this.countExamine(reBackStr, finalLen), finalLen];
			},
			getOverLen: function getOverLen(checkText, lineNum) {
				var otherText = checkText.match(regExpClip);
				if (!otherText) return 0;
				return checkText.length - otherText.length + Math.ceil(otherText.length / 2) - lineNum;
			},
			countExamine: function countExamine(str, clipLen) {
				var ol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

				var finalLen = clipLen;
				var clipText = str.slice(0, clipLen);
				var otherText = clipText.match(regExpClip);
				if (otherText) {
					var newStr = str.slice(clipLen, str.length);
					var otherLen = Math.ceil(otherText.length / 2);
					if (ol === otherLen) {
						return finalLen;
					}
					return finalLen + this.countExamine(newStr, otherLen, otherLen);
				}
				return finalLen;
			},
			lineOneClip: function lineOneClip($el, opt) {
				this.defalutOpt = opt || this.defalutOpt;
				if (this.defalutOpt.showTitle) {
					$el.title = $el.innerText;
				}
				this.setStyle($el, ['overflow: hidden', 'text-overflow: ellipsis', 'white-space: nowrap']);
			},
			chromeClip: function chromeClip($el, opt) {
				this.defalutOpt = opt || this.defalutOpt;
				if (this.defalutOpt.showTitle) {
					$el.title = $el.innerText;
				}
				this.setStyle($el, ['overflow: hidden', 'display: -webkit-box', '-webkit-box-orient: vertical', '-webkit-line-clamp: ' + this.defalutOpt.line]);
			},
			setAnimation: function setAnimation($el) {
				var _this3 = this;

				var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 60;

				var childrenText = null;
				if ($el.children.length) {
					var child = $el.children[0];
					$el.removeChild(child);
					childrenText = function childrenText() {
						$el.appendChild(child);
						_this3.setAnimation(child, time);
					};
				}
				var originText = $el.innerText;
				$el.innerText = '';
				var textFn = function textFn() {
					setTimeout(function () {
						$el.innerText = $el.innerText + originText.substr(0, 1);
						originText = originText.substr(1, originText.length);
						if (originText.length) {
							window.requestAnimationFrame(textFn);
						} else {
							childrenText && childrenText();
						}
					}, time);
				};
				window.requestAnimationFrame(textFn);
			}
		};
		main.init(selectors, opts);
		return main;
	}
	globel.clipText = clipText;
	// tool
	function isArray(arr) {
		return arr instanceof Array;
	}
	function $(select) {
		return document.querySelectorAll(select);
	}
	function setStyle() {
		if (navigator.userAgent.indexOf('Trident') > -1 || navigator.userAgent.indexOf('MSIE') > -1) {
			return function ($el, arr) {
				arr.forEach(function (i) {
					var _i$split = i.split(':'),
					    _i$split2 = _slicedToArray(_i$split, 2),
					    key = _i$split2[0],
					    val = _i$split2[1];

					key = key && key.split('-').reduce(function (pkey, nkey, i) {
						return i > 0 ? pkey + nkey.slice(0, 1).toUpperCase() + nkey.slice(1) : pkey + nkey;
					}, '');
					$el.style[key.trim()] = val.trim();
				});
			};
		} else {
			return function ($el, arr) {
				if ($el) {
					$el.style = arr.join(';');
				}
			};
		}
	}
})(typeof window !== "undefined" && window);