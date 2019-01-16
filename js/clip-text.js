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
            eclipText: '...',
            eclipClick: function(){}
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
            console.log('otherclip')
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
    if(navigator.userAgent.indexOf("MSIE") > -1){
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
