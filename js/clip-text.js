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
	if (!Date.now) Date.now = function() { return new Date().getTime(); };
	(function() {
			'use strict';
			
			var vendors = ['webkit', 'moz'];
			for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
					var vp = vendors[i];
					window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
					window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
																		|| window[vp+'CancelRequestAnimationFrame']);
			}
			if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
					|| !window.requestAnimationFrame || !window.cancelAnimationFrame) {
					var lastTime = 0;
					window.requestAnimationFrame = function(callback) {
							var now = Date.now();
							var nextTime = Math.max(lastTime + 16, now);
							return setTimeout(function() { callback(lastTime = nextTime); },
																nextTime - now);
					};
					window.cancelAnimationFrame = clearTimeout;
			}
	}());
	const regExpClip = /[^\u4e00-\u9fa5\uff00-\uffffA-Z]/g
	function clipText(selectors, opts) {
		const main = {
			defalutOpt: {
				animation: false,
				line: false,
				showTitle: false,
				clipText: '...',
				clipClick: null
			},
			init(selectors, opts) {
				if (!selectors) {
					throw new Error('arg select is required')
				}
				if (!(opts && opts.line >= 2)) {
					this.clip = this.lineOneClip;
				} else if (navigator.userAgent.indexOf("Chrome") > -1 && !opts.clipText) {
					this.clip = this.chromeClip;
				}
				const selectEl = isArray(selectors) ? selectors : [selectors];
				const cacheEl = []
				this.defalutOpt = Object.assign(this.defalutOpt, opts)
				this.setStyle = setStyle();
				selectEl.forEach(i => {
					const $i = i instanceof HTMLElement ? i : $(i);
					let animation = this.defalutOpt.animation;
					animation = animation ? typeof animation === 'number' ? animation : 60 : animation
					if ($i && $i.forEach) {
						$i.forEach(j => {
							cacheEl.push({el: j, orText: j.innerText})
							this.clip(j);
							animation && this.setAnimation(j, animation);
						})
					} else {
						cacheEl.push({el: $i, orText: $i.innerText})
						this.clip($i);
						animation && this.setAnimation($i, animation);
					}
				})
				// init resize
				const resizeCB = () => {
					cacheEl.forEach(i => {
						this.clip(i.el, this.defalutOpt, i.orText);
					})
				}
				if (!window.onresize) {
					window.onresize = resizeCB;
				} else {
					const prevCB = window.onresize;
					window.onresize = () => {
						prevCB.call(window);
						resizeCB.call(this);
					}
				}
				window.attachEvent && window.attachEvent('onresize', function() {
					prevCB.call(window);
					resizeCB.call(_this);
				})
			},
			clip($el, opt, orText) {
				// for resize
				this.defalutOpt = opt || this.defalutOpt;
				const originText = orText || $el.innerText;

				const elCss = window.getComputedStyle($el);
				const { line, clipText, clipClick, showTitle, animation } = this.defalutOpt;
				let lineNum = Math.round(parseFloat(elCss.width) / parseFloat(elCss.fontSize) - 0.65);
				let nextText = originText;
				let finalLineNum = 0;
				// compute finalText
				for (let i = 0; i < line; i++) {
					let nextNum = this.countExamine(nextText, lineNum);
					const checkText = originText.slice(finalLineNum, finalLineNum + nextNum);
					const overNum = this.getOverLen(checkText, lineNum);
					if (overNum) {
						nextNum = nextNum - overNum;
					}
					nextText = originText.slice(nextNum, originText.length);
					finalLineNum += nextNum;
				}
				let finalText = originText.slice(0, finalLineNum);
				// if not overflow
				if (finalText.length === originText.length) {
					$el.title = null;
					return $el.innerText = originText;
				};
				if (showTitle) {
					$el.title = originText;
				}
				const [finalClipLen, clipLineNum] = this.countClip(finalText);
				let clipLen = finalText.length - finalClipLen;
				let overClipLen = this.getOverLen(finalText.slice(clipLen, finalText.length), clipLineNum);

				$el.innerText = finalText.slice(0, finalText.length - finalClipLen + overClipLen);
				// add customize more text
				const clipNode = document.createElement('a');
				// add clip event
				if (clipClick) {
					clipNode.onclick = function (e) {
						clipClick.call(clipNode, e);
					}
					clipNode.style = "cursor:pointer";
				}
				clipNode.innerText = clipText;
				$el.appendChild(clipNode);
			},
			countClip(str) {
				const clipText = this.defalutOpt.clipText;
				const otherText = clipText.match(regExpClip);
				const clipLen = clipText.length;
				const finalLen = otherText ? Math.ceil(otherText.length / 2) + (clipLen - otherText.length) : clipLen;
				const reBackStr = str.split('').reverse().join("");
				return [this.countExamine(reBackStr, finalLen), finalLen];
			},
			getOverLen(checkText, lineNum) {
				const otherText = checkText.match(regExpClip);
				if (!otherText) return 0;
				return checkText.length - otherText.length + Math.ceil(otherText.length / 2) - lineNum;
			},
			countExamine(str, clipLen, ol = 0) {
				let finalLen = clipLen;
				const clipText = str.slice(0, clipLen);
				let otherText = clipText.match(regExpClip);
				if (otherText) {
					const newStr = str.slice(clipLen, str.length);
					const otherLen = Math.ceil(otherText.length / 2);
					if (ol === otherLen) {
						return finalLen
					}
					return finalLen + this.countExamine(newStr, otherLen, otherLen)
				}
				return finalLen;
			},
			lineOneClip($el, opt) {
				this.defalutOpt = opt || this.defalutOpt;
				if (this.defalutOpt.showTitle) {
					$el.title = $el.innerText;
				}
				this.setStyle($el, [
					'overflow: hidden',
					'text-overflow: ellipsis',
					'white-space: nowrap'
				])
			},
			chromeClip($el, opt) {
				this.defalutOpt = opt || this.defalutOpt;
				if (this.defalutOpt.showTitle) {
					$el.title = $el.innerText;
				}
				this.setStyle($el, [
					'overflow: hidden',
					'display: -webkit-box',
					'-webkit-box-orient: vertical',
					`-webkit-line-clamp: ${this.defalutOpt.line}`
				])
			},
			setAnimation($el, time = 60) {
				let childrenText = null;
				if ($el.children.length) {
					const child = $el.children[0]
					$el.removeChild(child)
					childrenText = () => {
						$el.appendChild(child);
						this.setAnimation(child, time);
					}
				}
				let originText = $el.innerText;
				$el.innerText = '';
				const textFn = () => {
					setTimeout(() => {
						$el.innerText = $el.innerText + originText.substr(0,1);
						originText = originText.substr(1, originText.length);
						if (originText.length) {
							window.requestAnimationFrame(textFn)
						} else {
							childrenText && childrenText();
						}
					}, time)
				}
				window.requestAnimationFrame(textFn)
			}
		}
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
			return ($el, arr) => {
				arr.forEach(i => {
					let [key, val] = i.split(':');
					key = key && key.split('-').reduce((pkey, nkey, i) => {
						return i > 0 ? pkey + nkey.slice(0, 1).toUpperCase() + nkey.slice(1) : pkey + nkey
					}, '');
					$el.style[key.trim()] = val.trim();
				})
			}
		} else {
			return ($el, arr) => {
				if ($el) {
					$el.style = arr.join(';')
				}
			}
		}
	}
}(typeof window !== "undefined" && window))