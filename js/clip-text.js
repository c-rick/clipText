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
				this.setStyle = setStyle()
				const selectEl = isArray(selectors) ? selectors : [selectors];
				this.defalutOpt = Object.assign(this.defalutOpt, opts)
				selectEl.forEach(i => {
					const $i = i instanceof HTMLElement ? i : $(i);
					if ($i && $i.forEach) {
						$i.forEach(j => {
							this.clip(j);
							this.addTitle(j);
						})
					} else {
						this.clip($i);
						this.addTitle($i);
					}
				})
			},
			clip($el) {
				const elCss = window.getComputedStyle($el);
				const { line, clipText, clipClick } = this.defalutOpt;
				let lineNum = Math.round(parseFloat(elCss.width) / parseFloat(elCss.fontSize) - 0.5);
				let originText = $el.innerText;
				let nextText = originText;
                let finalLineNum = 0;
				for (let i = 0; i < line; i++) {
					let nextNum = this.countExamine(nextText, lineNum);
                    const checkText = originText.slice(finalLineNum, finalLineNum + nextNum);
                    console.log(checkText)
					const overNum = this.getOverLen(checkText, lineNum);
					if (overNum) {
						nextNum = nextNum - overNum;
					}
					nextText = originText.slice(nextNum, originText.length);
					finalLineNum += nextNum;
				}
				let finalText = originText.slice(0, finalLineNum);
				// if not overflow
				if (finalText.length === originText.length) return;
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
				$el.appendChild(clipNode)
			},
			countClip(str) {
				const clipText = this.defalutOpt.clipText;
				const otherText = clipText.match(regExpClip);
				const clipLen = clipText.length;
				const finalLen = otherText ? Math.floor(otherText.length / 2) + (clipLen - otherText.length) : clipLen;
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
			lineOneClip($el) {
				this.setStyle($el, [
					'overflow: hidden',
					'text-overflow: ellipsis',
					'white-space: nowrap'
				])
			},
			chromeClip($el) {
				this.setStyle($el, [
					'overflow: hidden',
					'display: -webkit-box',
					'-webkit-box-orient: vertical',
					`-webkit-line-clamp: ${this.defalutOpt.line}`
				])
			},
			addTitle($el) {
				const { showTitle } = this.defalutOpt;
				if (showTitle) {
					$el.title = $el.innerText;
				}
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