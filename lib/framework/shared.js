'use-strict';
String.prototype.capitalizeFirstLetter = function()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
}

Node.prototype.removeAllChildNodes = function() {
    while (this.firstChild) {
        this.removeChild(this.firstChild);
    }
    return this;
}

Element.prototype.mergeStyle = function(style)
{
    if (!style)
        return;

    if (!style.endsWith(';')) style += ';';

    let resultObject = { };

    const styleRule = new RegExp('([^;]+):([^;]+);','g');

    for (const match of (this.getAttribute('style') || '').matchAll(styleRule)) {
        resultObject[match[1]] = match[2];
    } 
    for (const match of style.matchAll(styleRule)) {
        resultObject[match[1]] = match[2];
    }   

    let newStyle = ""
    for (const [key, value] of Object.entries(resultObject)) {
        newStyle += `${key}:${value};`;
    }

    this.setAttribute('style', newStyle);
    return this;
}

SVGElement.prototype.toBase64 = function()
{
    const s = new XMLSerializer().serializeToString(this);
    return `data:image/svg+xml;base64,${window.btoa(s)}`;
}

SVGElement.from = async function(url)
{
    let data = await (await fetch(url)).text();
    
    const parser = new DOMParser();
    const svg = parser.parseFromString(data, 'image/svg+xml').querySelector('svg');

    return svg;
}