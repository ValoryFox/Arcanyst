'use-strict';
function Identity(i : any) : any { return i; }
function CSSStr(property : string) : any { return (value : any) : string => 
    {
        if (value || value === 0) return `${property}:${String(value)};`;
        return null;
    }
}

interface Element {
    mergeStyle(style : string) : Element;
    removeAllChildNodes(selector? : string) : Element;
}
Element.prototype.removeAllChildNodes = function(selector? : string) {
    if (selector)
    {
        while (this.querySelector(selector))
        {
            this.removeChild(this.querySelector(selector));
        }
    }
    else 
    {
        while (this.firstChild ) {
            this.removeChild(this.firstChild);
        }
    }
    return this;
}

interface SVGElement {
    toBase64() : string;
}
SVGElement.prototype.toBase64 = function()
{
    const s = new XMLSerializer().serializeToString(this);
    return `data:image/svg+xml;base64,${window.btoa(s)}`;
}

interface String {
    capitalizeFirstLetter() : string;
    getBase64FromImageUrl() : Promise<string>;
}
String.prototype.capitalizeFirstLetter = function()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.getBase64FromImageUrl = function() : Promise<string> {
    let url : string = this;
    return new Promise(resolve => {
        var img = new Image();
    
        img.setAttribute('crossOrigin', 'anonymous');
    
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
    
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
    
            var dataURL = canvas.toDataURL("image/png");
    
            resolve(dataURL);
        };

        img.onerror = function () {
            resolve("");
        }
    
        img.src = url;
    });
}
