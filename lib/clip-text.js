'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/** option
 * @param line 截取行数
 * @param showTitle 是否显示title
 * @param clipText 自定义截取文字
 * @param clipClick 截取文字点击事件
 */
(function (globel) {
	if (window.NodeList && !NodeList.prototype.forEach) {
		NodeList.prototype.forEach = Array.prototype.forEach;
	}
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
				var _this = this;

				if (!selectors) {
					throw new Error('arg select is required');
				}
				if (!(opts && opts.line >= 2)) {
					this.clip = this.lineOneClip;
				} else if (navigator.userAgent.indexOf("Chrome") > -1 && !opts.clipText) {
					this.clip = this.chromeClip;
				}
				this.setStyle = setStyle();
				var selectEl = isArray(selectors) ? selectors : [selectors];
				this.defalutOpt = _extends(this.defalutOpt, opts);
				selectEl.forEach(function (i) {
					var $i = i instanceof HTMLElement ? i : $(i);
					if ($i && $i.forEach) {
						$i.forEach(function (j) {
							_this.clip(j);
							_this.addTitle(j);
						});
					} else {
						_this.clip($i);
						_this.addTitle($i);
					}
				});
			},
			clip: function clip($el) {
				var elCss = window.getComputedStyle($el);
				var fontSize = Math.round(parseFloat(elCss.fontSize));
				var width = Math.round(parseFloat(elCss.width));
				var lineNum = Math.ceil(width / fontSize - 0.5);
				var _defalutOpt = this.defalutOpt,
				    line = _defalutOpt.line,
				    clipText = _defalutOpt.clipText,
				    clipClick = _defalutOpt.clipClick;

				var originText = $el.innerText;
				var nextText = originText;
				var finalLineNum = 0;
				var otherLen = originText.length;
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
				if (finalText.length === originText.length) return;

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
				var finalLen = otherText ? Math.floor(otherText.length / 2) + (clipLen - otherText.length) : clipLen;
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
			lineOneClip: function lineOneClip($el) {
				this.setStyle($el, ['overflow: hidden', 'text-overflow: ellipsis', 'white-space: nowrap']);
			},
			chromeClip: function chromeClip($el) {
				this.setStyle($el, ['overflow: hidden', 'display: -webkit-box', '-webkit-box-orient: vertical', '-webkit-line-clamp: ' + this.defalutOpt.line]);
			},
			addTitle: function addTitle($el) {
				var showTitle = this.defalutOpt.showTitle;

				if (showTitle) {
					$el.title = $el.innerText;
				}
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