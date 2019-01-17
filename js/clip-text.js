(function(){
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }
}())
function clipText(selectors, opts) {
    const main = {
        defalutOpt: {
            animation: false,
            line: false,
            showTitle: false,
            clipText: '...',
            clipClick: function(){}
        },
        init(selectors, opts) {
            if(!selectors) {
                throw new Error('arg select is required')
            }
            if(!(opts && opts.line >= 2)) {
                this.clip = this.lineOneClip;
            } else if(navigator.userAgent.indexOf("Chrome") > -1) {
                this.clip = this.chromeClip;
            }
            this.setStyle = setStyle()
            const selectEl = isArray(selectors) ? selectors : [selectors];
            this.defalutOpt = Object.assign(this.defalutOpt, opts)
            selectEl.forEach(i => {
                const $i = $(i);
                if($i) {
                    $i.forEach(j => {
                        this.clip(j)
                    })
                }
            })
        },
        clip($el){
            const elCss = window.getComputedStyle($el);
            const fontSize = parseInt(elCss.fontSize);
            const width = parseInt(elCss.width);
            const lineNum = parseInt(width/fontSize);
            let originText = $el.innerText;
            let newText = '';
            let nextNum = 0;
            for( let i = 0; i<this.defalutOpt.line;i++) {
                let lineText = originText.slice(0, lineNum);
                let otherText = lineText.match(/[^\u4e00-\u9fa5]/g);
                if (otherText) {
                    nextNum = nextNum + parseInt(otherText.length/2);
                    newText += lineText + originText.substr(lineNum, nextNum);
                    originText = originText.slice(lineNum + nextNum);
                } else {
                    newText += lineText;
                    originText = originText.slice(lineNum);
                }
            }
            newText = this.replaceClip(newText)
            $el.innerText = newText;
            console.log(fontSize, width, lineNum, originText)
        },
        replaceClip(str) {
            const clipText = this.defalutOpt.clipText;
            const otherText = clipText.match(/[^\u4e00-\u9fa5]/g);
            const clipLen = otherText ? Math.floor(otherText.length/2) + (clipText.length - otherText.length) : clipText.length;
            console.log(clipLen)
            
            $el.innerHTML += this.defalutOpt.clipText
            return str.slice(0, -clipLen);
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
        }
    }
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
    if(navigator.userAgent.indexOf('Trident') > -1 || navigator.userAgent.indexOf('MSIE') > -1 ){
        return ($el, arr) => {
            arr.forEach(i => {
                let [key, val] = i.split(':');
                key = key && key.split('-').reduce((pkey, nkey, i) => {
                    return i > 0 ? pkey + nkey.slice(0,1).toUpperCase() + nkey.slice(1) : pkey + nkey
                }, '');
                $el.style[key.trim()] = val.trim();
            })
        }
    } else {
        return ($el, arr) => {
            if($el) {
                $el.style = arr.join(';')
            }
        }
    }
}
