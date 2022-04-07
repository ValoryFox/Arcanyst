'use-strict';
class Origin {
    static #offsets = { centre: 0.5, left: 0, right: 1, top: 0, bottom: 1};
    constructor(x: string, y?: string)
    {
        this._originX = Origin.#offsets[x];
        this._originY = y === undefined ? Origin.#offsets[x] : Origin.#offsets[y];
    }
    _originX : number;
    _originY : number;

    static CentreTop =    new Origin('centre', 'top');
    static CentreBottom = new Origin('centre', 'bottom');
    static CentreLeft =   new Origin('left', 'centre');
    static CentreRight =  new Origin('right', 'centre');
    static Centre =       new Origin('centre', 'centre');
    
    static TopLeft =    new Origin('left', 'top');
    static TopRight =    new Origin('right', 'top');
    static BottomLeft =    new Origin('left', 'bottom');
    static BottomRight =    new Origin('right', 'bottom');
}

class Position {
    constructor(x : number, y : number, width : number, height : number)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    x : number;
    y : number;
    width : number;
    height : number;
}


class Attributes {
    _isAttributes : boolean = true;
    _canvas : object;
    width : number;
    height : number;
    x : number;
    y : number;
    _originX : number;
    _originY : number;
    
    class: string;
    _svg: object[];

    constructor(args : object[], start = 0)
    {
        if (!args)
            return;

        for (let i = start; i < args.length; i++)
        {
            if (typeof args[i] == "object" && args[i] != null)
                Object.keys(args[i]).forEach((key) => this[key] = args[i][key]);
        }
    }

    _rootStyle = ''
    _nodeStyle = { };
    set style(style : object | string)
    {
        if (!style) return;
        else if (typeof (style) == 'string')
        {
            this._rootStyle = Attributes._mergeStyle(this._rootStyle, style);
        }
        else 
        {
            for (const [selector, n_style] of Object.entries(style))
            {
                this._nodeStyle[selector] = Attributes._mergeStyle(this._nodeStyle[selector], style[selector]);
            }
        }
    }
    static _mergeStyle(style1 : string, style2 : string) : string
    {
        if (!style1 && !style2) return null;
        else if (!style2) return style1;
        else if (!style1) return style2;
        if (!style1.endsWith(';')) style1 += ';';
        if (!style2.endsWith(';')) style2 += ';';
    
        let output_object = { };
    
        const styleRule : RegExp = new RegExp('([^;]+):([^;]+);','g');
    
        for (const match of style1.matchAll(styleRule)) {
            output_object[match[1]] = match[2];
        } 
        for (const match of style2.matchAll(styleRule)) {
            output_object[match[1]] = match[2];
        }   
    
        let output : string = ""
        for (const [key, value] of Object.entries(output_object)) {
            output += `${key}:${value};`;
        }
        return output;
    }

    reap(key : string, override? : any, fallback? : any, process : Function = Identity) : any
    {
        let result = override || this[key] || fallback;
        if (key in this)
            delete this[key];
        return process(result);
    }
    
    _hasAligned : boolean = false;
    align() : Attributes
    {
        if (!this._hasAligned)
        {
            this.x = (this.x || 0) + (this._originX || 0) * (Config.Page.width - this.width);
            this.y = (this.y || 0) + (this._originY || 0) * (Config.Page.height - this.height);
        }
        
        return this;
    }

    _current_dpi : number = 300;
    dpi(target_dpi : number = 72) : Attributes
    {
        let dpiAttributes = ['x', 'y', 'width', 'height'];
        if (this._current_dpi != target_dpi)
        {
            for (const key of dpiAttributes)
                this[key] = target_dpi * this[key] / this._current_dpi;
        
            this._current_dpi = target_dpi;
        }
        return this;
    }
    
    set(elem : Element) : void
    {
        for (const [key, value] of Object.entries(this))
        {
            if (value === undefined) continue;
            if (key.startsWith('_')) continue;

            if (key == 'class' && this[key] && this[key].length > 0)
                for (let _c of this.class.split(' ')) elem.classList.add(_c);
            else 
                elem.setAttribute(key, value);
        }

        elem.setAttribute('style', Attributes._mergeStyle(elem.getAttribute('style'), this._rootStyle));
        for (const [selector, inline] of Object.entries(this._nodeStyle))
        {
            for (const sub_elem of elem.querySelectorAll(selector))
                sub_elem.setAttribute('style', Attributes._mergeStyle(sub_elem.getAttribute('style'), inline as string));
        }
        
    }

    assignBlanks(object : object) : Attributes
    {
        for (let [key, value] of Object.entries(object))
        {
            if (!this[key])
                this[key] = value;
        }
        return this;
    }

}