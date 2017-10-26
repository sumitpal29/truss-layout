import TrussLayout from './manager.js';
let layout = (function () {
    let attachEvent = document.attachEvent,
        isIE = navigator.userAgent.match(/Trident/),
        requestFrame = (function () {
            let raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                function (fn) {
                    return window.setTimeout(fn, 20);
                };
            return function (fn) {
                return raf(fn);
            };
        })();

    let cancelFrame = (function () {
        let cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
            window.clearTimeout;
        return function (id) {
            return cancel(id);
        };
    })();

    function resizeListener(e) {
        let win = e.target || e.srcElement;
        if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
        win.__resizeRAF__ = requestFrame(function () {
            let trigger = win.__resizeTrigger__;
            trigger.__resizeListeners__.forEach(function (fn) {
                fn.call(trigger, e);
            });
        });
    }

    function objectLoad() {
        this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
        this.contentDocument.defaultView.addEventListener('resize', resizeListener);
    }

    let addResizeListener = function (element, fn) {
        if (!element.__resizeListeners__) {
            element.__resizeListeners__ = [];
            if (attachEvent) {
                element.__resizeTrigger__ = element;
                element.attachEvent('onresize', resizeListener);
            } else {
                if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
                let obj = element.__resizeTrigger__ = document.createElement('object');
                obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
                obj.__resizeElement__ = element;
                obj.onload = objectLoad;
                obj.type = 'text/html';
                if (isIE) element.appendChild(obj);
                obj.data = 'about:blank';
                if (!isIE) element.appendChild(obj);
            }
        }
        element.__resizeListeners__.push(fn);
    };

    let removeResizeListener = function (element, fn) {
        element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
        if (!element.__resizeListeners__.length) {
            if (attachEvent) element.detachEvent('onresize', resizeListener);
            else {
                element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
                element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
            }
        }
    };

    return {
        addEvent: addResizeListener,
        removeEvent: removeResizeListener
    };
})();
// export  TrussLayout;
function _init(_parent) {
    !_parent && (_parent = document.getElementsByTagName('body')[0]);
    let elem = document.createElement('div'),
        instance,
        conf = {};

    elem.style.height = '100%';
    elem.style.width = '100.00%';
    elem.id = 'trussLayoutContainer';

    layout.addEvent(elem, function (e) {
        let newHeight = e.target.innerHeight,
            newWidth = e.target.innerWidth,
            ch = (conf.height - newHeight),
            cw = (conf.width - newWidth);

        instance.resizeLayout(ch ? (-1 * ch) : 0, cw ? (-1 * cw) : 0);
        conf.height = newHeight;
        conf.width = newWidth;
    });

    _parent.appendChild(elem);
    instance = new TrussLayout(elem);

    conf.height = elem.offsetHeight;
    conf.width = elem.offsetWidth;

    return instance;
}

export {
    _init as init
};