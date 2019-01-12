import * as Three from "three";

export default class DomEvents {
    private _camera:     Three.Camera;
    private _domElement: HTMLCanvasElement;
    private _raycaster:  Three.Raycaster;
    private _selected:   any;
    private _boundObjs:  {[key: string]: any};

    private _$onClick:       any;
    private _$onDblClick:    any;
    private _$onMouseMove:   any;
    private _$onMouseDown:   any;
    private _$onMouseUp:     any;
    private _$onTouchMove:   any;
    private _$onTouchStart:  any;
    private _$onTouchEnd:    any;
    private _$onContextmenu: any;

    private eventNames = [
        "click",
        "dblclick",
        "mouseover",
        "mouseout",
        "mousemove",
        "mousedown",
        "mouseup",
        "contextmenu",
        "touchstart",
        "touchend",
    ];

    public get camera(): Three.Camera {
        return this._camera;
    }

    public set camera(camera: Three.Camera) {
        this._camera = camera;
    }

    constructor(domElement: HTMLCanvasElement, camera?: Three.Camera) {
        this._camera	 = camera || null;
        this._domElement = domElement;
        this._raycaster  = new Three.Raycaster();
        this._selected	 = null;
        this._boundObjs	 = {};
        // Bind dom event for mouse and touch
        const _this	= this;

        this._$onClick		 = function() { _this._onClick.apply(_this,       arguments as any); };
        this._$onDblClick	 = function() { _this._onDblClick.apply(_this,    arguments as any); };
        this._$onMouseMove	 = function() { _this._onMouseMove.apply(_this,   arguments as any); };
        this._$onMouseDown	 = function() { _this._onMouseDown.apply(_this,   arguments as any); };
        this._$onMouseUp	 = function() { _this._onMouseUp.apply(_this,     arguments as any); };
        this._$onTouchMove	 = function() { _this._onTouchMove.apply(_this,   arguments as any); };
        this._$onTouchStart	 = function() { _this._onTouchStart.apply(_this,  arguments as any); };
        this._$onTouchEnd	 = function() { _this._onTouchEnd.apply(_this,    arguments as any); };
        this._$onContextmenu = function() { _this._onContextmenu.apply(_this, arguments as any); };
        this._domElement.addEventListener("click",       this._$onClick,       false);
        this._domElement.addEventListener("dblclick",    this._$onDblClick,    false);
        this._domElement.addEventListener("mousemove",   this._$onMouseMove,   false);
        this._domElement.addEventListener("mousedown",   this._$onMouseDown,   false);
        this._domElement.addEventListener("mouseup",     this._$onMouseUp,     false);
        this._domElement.addEventListener("touchmove",   this._$onTouchMove,   false);
        this._domElement.addEventListener("touchstart",  this._$onTouchStart,  false);
        this._domElement.addEventListener("touchend",    this._$onTouchEnd,    false);
        this._domElement.addEventListener("contextmenu", this._$onContextmenu, false);
    }

    public destroy() {
        this._domElement.removeEventListener("click",       this._$onClick,       false);
        this._domElement.removeEventListener("dblclick",    this._$onDblClick,    false);
        this._domElement.removeEventListener("mousemove",   this._$onMouseMove,   false);
        this._domElement.removeEventListener("mousedown",   this._$onMouseDown,   false);
        this._domElement.removeEventListener("mouseup",     this._$onMouseUp,     false);
        this._domElement.removeEventListener("touchmove",   this._$onTouchMove,   false);
        this._domElement.removeEventListener("touchstart",  this._$onTouchStart,  false);
        this._domElement.removeEventListener("touchend",    this._$onTouchEnd,    false);
        this._domElement.removeEventListener("contextmenu", this._$onContextmenu, false);
    }

    public addEventListener(object3d: any, eventName: string, _callback: any, _useCapture: boolean) {
        console.assert( this.eventNames.indexOf(eventName) !== -1, "not available events:" + eventName );

        if (!this._objectCtxIsInit(object3d)) {
            this._objectCtxInit(object3d);
        }
        const objectCtx	= this._objectCtxGet(object3d);
        if (!objectCtx[eventName + "Handlers"]) {
            objectCtx[eventName + "Handlers"] = [];
        }

        objectCtx[eventName + "Handlers"].push({
            callback   : _callback,
            useCapture : _useCapture,
        });

        // add this object in this._boundObjs
        if (typeof this._boundObjs[eventName] === "undefined") {
            this._boundObjs[eventName] = [];
        }
        this._boundObjs[eventName].push(object3d);
    }

    public removeEventListener(object3d: any, eventName: string, callback: any, useCapture: boolean) {
        console.assert( this.eventNames.indexOf(eventName) !== -1, "not available events:" + eventName );

        if (!this._objectCtxIsInit(object3d)) {
            this._objectCtxInit(object3d);
        }

        const objectCtx	= this._objectCtxGet(object3d);
        if (!objectCtx[eventName + "Handlers"]) {
            objectCtx[eventName + "Handlers"] = [];
        }

        const handlers = objectCtx[eventName + "Handlers"];
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            if (callback !== handler.callback) {
                continue;
            }
            if (useCapture !== handler.useCapture) {
                continue;
            }
            handlers.splice(i, 1);
            break;
        }
        const index	= this._boundObjs[eventName].indexOf(object3d);
        console.assert( index !== -1 );
        this._boundObjs[eventName].splice(index, 1);
    }

    private _getRelativeMouseXY(domEvent: any) {
        let element: any = domEvent.target || domEvent.srcElement;
        if (element.nodeType === 3) {
            element = element.parentNode;
        }

        const elPosition = { x : 0 , y : 0};
        let   tmpElement = element;

        let style = getComputedStyle(tmpElement, null);
        elPosition.y += parseInt(style.getPropertyValue("padding-top"), 10);
        elPosition.x += parseInt(style.getPropertyValue("padding-left"), 10);

        do {
            elPosition.x += tmpElement.offsetLeft;
            elPosition.y += tmpElement.offsetTop;
            style = getComputedStyle(tmpElement, null);

            elPosition.x	+= parseInt(style.getPropertyValue("border-left-width"), 10);
            elPosition.y	+= parseInt(style.getPropertyValue("border-top-width"), 10);
        } while (tmpElement = tmpElement.offsetParent);

        const elDimension = {
            width	: (element === window) ? window.innerWidth	: element.offsetWidth,
            height	: (element === window) ? window.innerHeight	: element.offsetHeight,
        };

        return {
            x : +((domEvent.pageX - elPosition.x) / elDimension.width ) * 2 - 1,
            y : -((domEvent.pageY - elPosition.y) / elDimension.height) * 2 + 1,
        };
    }

    private _objectCtxInit(object3d: any) {
        object3d._3xDomEvent = {};
    }

    private _objectCtxDeinit(object3d: any) {
        delete object3d._3xDomEvent;
    }

    private _objectCtxIsInit(object3d: any) {
        return object3d._3xDomEvent ? true : false;
    }

    private _objectCtxGet(object3d: any) {
        return object3d._3xDomEvent;
    }

    private _bound(eventName: string, object3d: any) {
        const objectCtx	= this._objectCtxGet(object3d);
        if (!objectCtx) {
            return false;
        }
        return objectCtx[eventName + "Handlers"] ? true : false;
    }

    private _onMove(eventName: string, mouseX: number, mouseY: number, origDomEvent: any) {
        const boundObjs	= this._boundObjs[eventName];
        if (boundObjs === undefined || boundObjs.length === 0) {
            return;
        }
        const vector = new Three.Vector2();

        vector.set( mouseX, mouseY );
        this._raycaster.setFromCamera(vector, this._camera);

        const intersects  = this._raycaster.intersectObjects(boundObjs);
        const oldSelected = this._selected;

        let notifyOver;
        let notifyOut;
        let notifyMove;
        let intersect;
        let newSelected;
        if (intersects.length > 0) {
            intersect	   = intersects[0];
            newSelected    = intersect.object;
            this._selected = newSelected;
            // if newSelected bound mousemove, notify it
            notifyMove = this._bound("mousemove", newSelected);

            if (oldSelected !== newSelected) {
                notifyOver = this._bound("mouseover", newSelected);
                notifyOut  = oldSelected && this._bound("mouseout", oldSelected);
            }
        } else {
            notifyOut       = oldSelected && this._bound("mouseout", oldSelected);
            this._selected	= null;
        }

        if (notifyMove) {
            this._notify("mousemove", newSelected, origDomEvent, intersect);
        }
        if (notifyOver) {
            this._notify("mouseover", newSelected, origDomEvent, intersect);
        }
        if (notifyOut) {
            this._notify("mouseout" , oldSelected, origDomEvent, intersect);
        }
    }

    private _onEvent(eventName: string, mouseX: number, mouseY: number, origDomEvent: any) {
        const boundObjs	= this._boundObjs[eventName];
        if (boundObjs === undefined || boundObjs.length === 0) {
            return;
        }
        const vector = new Three.Vector2();

        vector.set( mouseX, mouseY );
        this._raycaster.setFromCamera( vector, this._camera );

        const intersects = this._raycaster.intersectObjects( boundObjs, true);
        if (intersects.length === 0) {
            return;
        }

        const intersect	 = intersects[0];
        const object3d	 = intersect.object;
        let objectCtx	 = this._objectCtxGet(object3d);
        let objectParent = object3d.parent;

        while (typeof(objectCtx) === "undefined" && objectParent) {
            objectCtx    = this._objectCtxGet(objectParent);
            objectParent = objectParent.parent;
        }
        if (!objectCtx) {
            return;
        }

        this._notify(eventName, object3d, origDomEvent, intersect);
    }

    private _notify(eventName: string, object3d: any, _origDomEvent: any, _intersect: any) {
        const objectCtx	= this._objectCtxGet(object3d);
        let   handlers  = objectCtx ? objectCtx[eventName + "Handlers"] : null;

        console.assert(arguments.length === 4);

        if (!objectCtx || !handlers || handlers.length === 0) {
            if (object3d.parent) {
                this._notify(eventName, object3d.parent, _origDomEvent, _intersect);
            }
            return;
        }
        // notify all handlers
        handlers = objectCtx[eventName + "Handlers"];
        for (const handler of handlers) {
            let toPropagate = true;
            handler.callback({
                type		 : eventName,
                target		 : object3d,
                origDomEvent : _origDomEvent,
                intersect	 : _intersect,
                stopPropagation	: () => {
                    toPropagate	= false;
                },
            });
            if (!toPropagate) {
                continue;
            }
            if (handler.useCapture === false && object3d.parent) {
                this._notify(eventName, object3d.parent, _origDomEvent, _intersect);
            }
        }
    }

    private _onMouseDown(event: any) {
        return this._onMouseEvent("mousedown", event);
    }

    private _onMouseUp(event: any) {
        return this._onMouseEvent("mouseup", event);
    }

    private _onMouseEvent(eventName: string, domEvent: any) {
        const mouseCoords = this._getRelativeMouseXY(domEvent);
        this._onEvent(eventName, mouseCoords.x, mouseCoords.y, domEvent);
    }

    private _onMouseMove(domEvent: any) {
        const mouseCoords = this._getRelativeMouseXY(domEvent);
        this._onMove("mousemove", mouseCoords.x, mouseCoords.y, domEvent);
        this._onMove("mouseover", mouseCoords.x, mouseCoords.y, domEvent);
        this._onMove("mouseout" , mouseCoords.x, mouseCoords.y, domEvent);
    }

    private _onClick(domEvent: any) {
        this._onMouseEvent("click" , domEvent);
    }

    private _onDblClick(domEvent: any) {
        this._onMouseEvent("dblclick" , domEvent);
    }

    private _onContextmenu(domEvent: any) {
        this._onMouseEvent("contextmenu" , domEvent);
    }

    private _onTouchStart(domEvent: any) {
        this._onTouchEvent("touchstart" , domEvent);
    }

    private _onTouchEnd(domEvent: any) {
        this._onTouchEvent("touchend" , domEvent);
    }

    private _onTouchMove(domEvent: any) {
        if (domEvent.touches.length !== 1) {
            return;
        }

        domEvent.preventDefault();

        const mouseX = +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
        const mouseY = -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
        this._onMove("mousemove", mouseX, mouseY, domEvent);
        this._onMove("mouseover", mouseX, mouseY, domEvent);
        this._onMove("mouseout" , mouseX, mouseY, domEvent);
    }

    private _onTouchEvent(eventName: string, domEvent: any) {
        if (domEvent.touches.length !== 1) {
            return;
        }

        domEvent.preventDefault();

        const mouseX = +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
        const mouseY = -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
        this._onEvent(eventName, mouseX, mouseY, domEvent);
    }
}
