'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function () {
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }
})();
function clipText(selectors, opts) {
    var main = {
        defalutOpt: {
            animation: false,
            line: false,
            showTitle: false,
            clipText: '...',
            clipClick: function clipClick() {}
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
                var $i = $(i);
                if ($i) {
                    $i.forEach(function (j) {
                        _this.clip(j);
                    });
                }
            });
        },
        clip: function clip($el) {
            var elCss = window.getComputedStyle($el);
            var fontSize = parseInt(elCss.fontSize);
            var width = parseInt(elCss.width);
            var lineNum = parseInt(width / fontSize);
            var line = this.defalutOpt.line;
            var originText = $el.innerText;
            var newText = '';
            var nextNum = 0;
            var otherLen = originText.length * 2;

            for (var i = 0; i < line; i++) {
                var lineText = originText.slice(0, lineNum);
                var otherText = lineText.match(/[^\u4e00-\u9fa5]/g);
                if (otherText) {
                    otherLen = otherLen - otherText.length;
                    nextNum = nextNum + parseInt(otherText.length / 2);
                    newText += lineText + originText.substr(lineNum, nextNum);
                    originText = originText.slice(lineNum + nextNum);
                } else {
                    newText += lineText;
                    originText = originText.slice(lineNum);
                }
            }
            // if not overflow
            if (parseInt(otherLen / 2) <= lineNum * line) return;

            newText = this.replaceClip(newText);
            $el.innerText = newText;
            var clipNode = document.createElement('a');
            clipNode.innerText = this.defalutOpt.clipText;
            $el.appendChild(clipNode);
        },
        replaceClip: function replaceClip(str) {
            var clipText = this.defalutOpt.clipText;
            var otherText = clipText.match(/[^\u4e00-\u9fa5]/g);
            var clipLen = otherText ? Math.floor(otherText.length / 2) + (clipText.length - otherText.length) : clipText.length;
            return str.slice(0, -clipLen);
        },
        lineOneClip: function lineOneClip($el) {
            this.setStyle($el, ['overflow: hidden', 'text-overflow: ellipsis', 'white-space: nowrap']);
        },
        chromeClip: function chromeClip($el) {
            this.setStyle($el, ['overflow: hidden', 'display: -webkit-box', '-webkit-box-orient: vertical', '-webkit-line-clamp: ' + this.defalutOpt.line]);
        }
    };
    main.init(selectors, opts);
    return main;
}
// tool
function isString(str) {
    return typeof str === 'string';
}
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