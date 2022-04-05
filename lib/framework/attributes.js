'use-strict';

class Attributes {
    _isAttributes = true;

    reap(key, override, fallback)
    {
        let result = override || this[key] || fallback;
        if (key in this)
            delete this[key];
        return result;
    }
    constructor(args, start = 0)
    {
        if (!args)
            return;

        for (let i = start; i < args.length; i++)
        {
            if (typeof args[i] == "object" && args[i] != null)
                Object.keys(args[i]).forEach((key) => this[key] = args[i][key]);
        }
    }


    static #offsets = { 'centre': 0.5, 'left': 0, 'right': 1, 'top': 0, 'bottom': 1};
    
    _hasOriginated = false;
    originate(p_origin)
    {
        let origin = this.reap('origin', p_origin);
        if (!this._hasOriginated && origin)
        {
            if (typeof(origin) == 'string')
            {
                let split = origin.split(' ');
                origin = { x: split[0], y: split[1] || split[0] };
            }
            
            this.x = (this.x || 0) - this.width * Attributes.#offsets[origin.x];
            this.y = (this.y || 0) - this.height * Attributes.#offsets[origin.y];
        }
        
        return this;
    }

    _hasAligned = false;
    align(alignment, page)
    {
        alignment = this.reap('alignment', alignment);
        page = (new Attributes([this.reap('page', page, Config.page.width)])).dpi(this._current_dpi);
        
        if (!this._hasAligned && alignment) 
        {
            if (typeof(alignment) == 'string')
            {
                let split = alignment.split(' ');
                alignment = { x: split[0], y: split[1] || split[0] };
            }
            
            this.x = (this.x || 0) + Config.page.width * Attributes.#offsets[alignment.x];
            this.y = (this.y || 0) + Config.page.height * Attributes.#offsets[alignment.y];
        }

        return this;
    }

    /*
        DPI Conversioon:

    */
    _current_dpi = 300;
    dpi(target = 72)
    {
        let dpiAttributes = ['x', 'y', 'width', 'height'];
        if (this._current_dpi != target)
        {
            for (const key of dpiAttributes)
            this[key] = target * this[key] / this._current_dpi;
        
            this._current_dpi = target;
        }
        return this;
    }

    addStyle(property, value)
    {
        if (typeof(property) == 'object')
        {
            value = property.value;
            property = property.property;
        }
        else if (!value)
            return this;

        if (!this.style) 
            this.style = "";

        if (this.style.length > 0 && !this.style.endsWith(';'))
            this.style = this.style + ';'

        const cssRule = new RegExp(property + ':([^;]+);');
        const newRule = `${property}:${value};`;

        if (cssRule.test(this.style))
            this.style.replace(cssRule, newRule);
        else 
            this.style += newRule;
        
        return this;
    }
    
    set(elem)
    {
        this.valueKeys.forEach(key => {
            if (key == 'style' && this[key].length > 0)
                elem.mergeStyle(this['style']);
            else if (key == 'class' && this[key].length > 0)
                for (let _c of this.class.split(' ')) elem.classList.add(_c);
            else 
                elem.setAttribute(key, this[key]);
        });

        for (const [selector, attributes] of Object.entries(this._nodes || {}))
        {
            for (let node of elem.querySelectorAll(selector))
            {
                (new Attributes([attributes])).set(node);
            }
        }
    }

    get valueKeys()
    {
        let result = [];
        for (var key in this) {
            if (this.hasOwnProperty(key) && this[key] && typeof(this[key]) != 'function' && !key.startsWith('_') && !key.startsWith('#')) {
                result.push(key);
            }
        }
        return result;
    }

    assignBlanks(object)
    {
        Object.keys(object).forEach((key) => this[key] = this[key] || object[key]);
        return this;
    }

}