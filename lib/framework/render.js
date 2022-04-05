'use-strict';

Award.Components = class
{
    static async Border(context, theme, params = {})
    {
        await context.AddImage("resources/elements/border-primary.svg", { mode: "multiply", _svg: { style: `fill:${theme.primary};` } }, params); 
        await context.AddImage("resources/elements/border-secondary.svg", { mode: "multiply", _svg: { style: `fill:${theme.secondary};`} }, params); 
    }
    static async Heraldry(context, position = { y: 50, width: 420, height: 420 }, origin = { x: 'centre', y: 'top'}, alignment = { x: 'centre', y: 'top'}, params = {})
    {
        if (Config.Heraldry)
            await context.AddImage(Config.Heraldry, { mode: "multiply" }, position, { origin: origin, alignment: alignment }, params); 
    }
    static async Parchment(context, params = {}) {
        await context.AddImage("resources/textures/parchment.jpg", { style: 'pointer-events:none;'}, params);
    };
    static async HeraldryParchment(context, position = { y: 50, width: 420, height: 420 }, origin = { x: 'centre', y: 'top'}, alignment = { x: 'centre', y: 'top'}, params = {})
    {
        await context.Group(async function(context) {
            await Award.Components.Parchment(context);
            await Award.Components.Heraldry(context, position, origin, alignment, params);
        }, "heraldry_parchment");
    }
    static async Text(context, award, flavour, rank, fields = {}, _svg = { _nodes: {}}, params = {})
    {
        let ranks = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
        let _f = Object.assign({ AwardText_Flavour: flavour, AwardText_Pronoun: "their", AwardText_Order: award }, Config.TextFields, fields);
        if (rank) fields.AwardText_Rank = ranks[rank];

        _svg._nodes['[name=AwardText_Issuer]'] = { style: `font-size:max(1em, calc(1em + 0.22em * 14 / ${_f.AwardText_Issuer?.length || 10}));`}
        _svg._nodes['.AwardeeName'] = { style: `font-size:max(1.36em, calc(2.55em - 0.374em * ${_f.AwardText_Name?.length || 10}/8));`}
        await context.AddText("resources/elements/text.elem", { fields: _f, _svg: _svg, class: award.capitalizeFirstLetter() }, params);
    }
}

class AwardContext {
    _step;
    constructor(step = () => {}) {
        this._step = step;
    }

    /**
    * Adds an image to the award. Can add any number of objects to pass as attributes after the parameters.
    * @url   A link to the image (or data URL)
    */
    async AddImage(url) { }

    /**
    * Forms a group.
    * @actions    {Function} A callback function that the group is added within. Passes along a new context.
    */
    async Group(actions) { }


    get _defaultLocation() {
        return {x: 0, y: 0, width: Config.page.width, height: Config.page.height, page: Config.page, opacity: 1 }
    }
    
    
    static purgeCache(id)
    {
        delete AwardContext_Canvas.cache[id];
        delete AwardContext_PDF.cache[id];
    }

    static purgeGroup(group)
    {
        group = group.toLowerCase();
        Object.keys(AwardContext_Canvas.cache).forEach(key => {
            if (key.toLowerCase().includes(group + "_"))
            {
                delete AwardContext_Canvas.cache[key];
            }
        });
        Object.keys(AwardContext_PDF.cache).forEach(key => {
            if (key.toLowerCase().includes(group + "_"))
            {
                delete AwardContext_PDF.cache[key];
            }
        });
    }

    static purgeAll()
    {
        AwardContext_Canvas.cache = { };
        AwardContext_PDF.cache = { };
    }
}

class AwardContext_Skim extends AwardContext {
    steps = 0;
    type;
    constructor(type = '', step)
    {
        super(step ? step : () => this.steps++);
        this.type = type;
    }

    get #nestType() {
        switch (this.type.toLowerCase())
        {
            case 'pdf':
            case 'canvas': return 'canvas'; 
            default: return this.type;
        }
    }
    get #cache() {
        switch (this.type.toLowerCase())
        {
            case 'pdf': return AwardContext_PDF.cache;
            case 'canvas': return AwardContext_Canvas.cache;
            default: return {};
        }
    }
    async Group(actions, _id)
    {
        if (!this.#cache[_id]) await actions(new AwardContext_Skim(this.#nestType, this._step));
        this._step();
    }

    async AddImage() { this._step(); }
    async AddText() { this._step(); }
}

class AwardContext_Canvas extends AwardContext {
    #canvas;
    static cache = { }; get cache() { return AwardContext_Canvas.cache; }
    constructor(canvas, step)
    {
        super(step);
        this.#canvas = canvas;
    }

    async End() { return this.#canvas; }

    async Group(actions, _id, attributes)
    {
        attributes = (attributes?._isAttributes) ? attributes : new Attributes(arguments, 1);

        var g_canvas;
        if (_id && this.cache[_id])
            g_canvas = await this.cache[_id];
        else
        {
            let done = () => { };
            if (_id)
            {
                console.info(`Instantiating Group [${_id}] -- Canvas Context`)
                this.cache[_id] = new Promise(response => 
                    { done = response });
                this.cache[_id].then(()=>{console.info(`Finished Caching Group [${_id}] -- Canvas Context`)});
            }
            g_canvas = document.createElement('canvas');
            g_canvas.setAttribute('width', attributes.reap('width', null, Config.page.width));
            g_canvas.setAttribute('height', attributes.reap('height', null, Config.page.height));
            const g_context = g_canvas.getContext('2d');

            await actions(new AwardContext_Canvas(g_context, this._step));

            done(g_canvas);
        }
        this._step();
        this.#canvas.drawImage(g_canvas, 0, 0);
    }
    
    draw_type = 'png';
    async AddImage(url, attributes)
    {
        attributes = (attributes?._isAttributes) ? attributes : new Attributes(arguments, 1);
        attributes.assignBlanks(this._defaultLocation);

        if (url.endsWith('.jpg'))
            this.draw_type = 'jpeg';

        
        attributes.align().originate();

        let constrain = attributes.reap('_constrain');
        this.#canvas.globalCompositeOperation = attributes.reap('mode', null, 'source-over');
        this.#canvas.globalAlpha = attributes.reap('opacity', null, 1);
        this.#canvas.filter = attributes.reap('filter', null, 'none');

        let { x, y, width, height } = attributes;

        return await new Promise(respond => { 
            let img = new Image();
            img.crossOrigin = 'anonymous'
            attributes.set(img);
            img.onload = () => respond(img);
            img.src = url;
        }).then(img => 
        {
            if (constrain)
            {
                let ratio = Math.min(height / img.naturalHeight, width / img.naturalWidth);
                width = img.naturalWidth * ratio;
                height = img.naturalHeight * ratio;
                x += (attributes.width - img.naturalWidth * ratio) / 2;
                y += (attributes.height - img.naturalHeight * ratio) / 2;
            }
            this.#canvas.drawImage(img, x, y, width, height)
        });

        
        return;
    }

    async #CreateImage(url, attributes) {

        if (url.endsWith('.svg'))
        {
            let svg = await SVGElement.from(url);
            if (attributes._svg)
                (new Attributes([attributes._svg])).set(svg);
            url = svg.toBase64()
        }
        return await (new Promise(respond => {
            let img = new Image();
            img.crossOrigin = 'anonymous'
            attributes.set(img);
            img.onload = () => respond(img);
            img.src = url;
        }));
    }
}

class AwardContext_PDF extends AwardContext
{
    static cache = { }

    #RenderQueue;
    #RenderQueueLength = 0;
    #RenderProgress;
    static #Rendered(ctx)
    {
        let _c = ctx;
        return function(doc)
        {
            if (_c.#RenderProgress)
                _c.#RenderProgress.current++;
            return doc;
        }
    } 
    progress;


    constructor(promise, step)
    {
        super(step);

        if (!suppressStatus)
            this.progress = new Progress('Preparing Award');

        let queueResolve = new Promise(resolve => 
        {
            this.End = async function(doc) {
                if (!suppressStatus)
                    this.#RenderProgress = new Progress('Rendering Award', this.#RenderQueueLength);
                
                resolve(doc);
                this.#RenderQueue = this.#RenderQueue.then(() => {
                    this.progress?.End(); this.#RenderProgress?.End();
                })
                return await this.#RenderQueue;
            } 
        });

        if (promise)
            this.#RenderQueue = promise.then(async(doc) => { await queueResolve; return doc; });
        else
            this.#RenderQueue = queueResolve;

    }

    async AddImage(url, attributes)
    {
        attributes = (attributes?._isAttributes) ? attributes : new Attributes(arguments, 1);

        if (url.endsWith('svg'))
            return await this.Group(async(context) => { await context.AddImage(url, attributes); });

        fs.cache(url);
        
        attributes.align().originate().dpi();
        this.#RenderQueueLength++;
        this.#RenderQueue = this.#RenderQueue.then(async function(doc) {
            await fs._pending[url];
            doc.image(url, attributes.x, attributes.y, attributes.width, attributes.height);
            return doc;
        }).then(AwardContext_PDF.#Rendered(this));
    }

    async AddText(url, attributes)
    {
        attributes = (attributes?._isAttributes) ? attributes : new Attributes(arguments, 1);
        let fields = attributes.reap('fields');

        var elem = await SVGElement.from(url);
        const pxToNum = px => (72 * Number(String(px).replace('px','')) / 300)
        elem.setAttribute('width', 2550 );
        elem.getAttribute('height', 3300 );
        if (attributes._svg)
            (new Attributes([attributes._svg])).set(elem);
        
        var syntheticContainer = document.getElementById("SyntheticContainer");
        
        for (const [field, text] of Object.entries(fields)) {
            if (!text)
                continue;

            let text_elem = elem.querySelector(`[name=${field}]`);
            if (!text_elem)
            {
                console.warn(`Text field ${field} is missing in ${url}`);
                continue;
            }
            text_elem.innerHTML = text;
        }
        
        syntheticContainer.appendChild(elem);



        var spans = elem.querySelectorAll("span");
        for (let span of spans)
        {
            if (span.children.length > 0)
                continue;

            let _s = window.getComputedStyle(span);
            let _rect = span.getBoundingClientRect();
            if (_rect.width == 0 || _rect.height == 0)
                continue;

            let color = _s.getPropertyValue('color');
            let fontSize = pxToNum(_s.getPropertyValue('font-size'));
            let _ff = _s.getPropertyValue('font-family').replaceAll('"','');
            let _fs = _s.getPropertyValue('font-style');
            let _fw = Number(_s.getPropertyValue('font-weight'));
            let fontFamily = Config.Fonts[_ff][_fs][_fw];

            let multiline = span.classList.contains('Multiline');

            let x = pxToNum(_rect.x + window.scrollX);
            let y = pxToNum(_rect.y + window.scrollY);

            let params = { align: _s.getPropertyValue('text-align') }
            params.width = pxToNum(_rect.width) + 10;
            params.lineGap = pxToNum(_s.getPropertyValue('line-height')) - fontSize * 1.15;

            let _fc = _s.getPropertyValue('--award-font-color')
            if (params.align == 'center')
                x -= 5;
            else if (params.align == 'right')
                x -= 10;

            let content = span.innerHTML;

            fs.cache(fontFamily);
            
            this.#RenderQueueLength++;
            this.#RenderQueue = this.#RenderQueue.then(async function(doc) {
                await fs._pending[fontFamily];
                doc.fontSize(fontSize);
                doc.font(fontFamily);
                doc.fillColor(_fc).text(content, x, y, params);
                return doc;
            }).then(AwardContext_PDF.#Rendered(this));

            
            
        }

        var images = elem.querySelectorAll("img");
        var queue = [];
        for (let img of images)
        {
            await new Promise((response) => {
                if (img.complete)
                    response();
                img.onload = () => response();
            });

            let _rect = img.getBoundingClientRect();
            if (_rect.width == 0 || _rect.height == 0)
                continue;

            if (img.classList.contains('Cull'))
            {
                let p_rect = img.parentNode.getBoundingClientRect();
                if (img.offsetTop > p_rect.height)
                    continue;
            }

            let color = window.getComputedStyle(img.parentNode).getPropertyValue('--award-font-color');
            let attr = { };
            if (img.src.endsWith('.svg'))
                attr._svg = { style: `fill:${color} !important;` };
            let url = img.src;
            let pos = {x: _rect.x + window.scrollX, y: _rect.y + window.scrollY, width: _rect.width, height: _rect.height };
            queue.push(this.AddImage(url, pos, attr));
        }
        syntheticContainer.removeChild(elem);
        images = null;
        elem = null;
        await Promise.all(queue);        
    }


    async Group(actions, _id, attributes)
    {
        attributes = (attributes?._isAttributes) ? attributes : new Attributes(arguments, 2);
        let render;
        attributes.assignBlanks(this._defaultLocation);
        attributes.align().originate();
                
        let draw_type = attributes.reap('draw_type', null, 'png');
        if (_id && AwardContext_PDF.cache[_id])
            render = await AwardContext_PDF.cache[_id]; 
        else 
        {
            render = new Promise(async function(response) 
            {
                const g_canvas = document.createElement('canvas');
                g_canvas.setAttribute('width', attributes.width);
                g_canvas.setAttribute('height', attributes.height);
                const g_context = new AwardContext_Canvas(g_canvas.getContext('2d'));
                
                await actions(g_context);
                
                let imgUri = g_canvas.toDataURL(`image/${draw_type}`, draw_type == 'jpeg' ? Config.JPEG_quality : null);
                response(imgUri);
            });

            if (_id)
            {
                console.info(`Instantiating Group [${_id}] -- PDF Context`)
                AwardContext_PDF.cache[_id] = render;
            }

            await render;
        }
 
        attributes.dpi();
      
        this.#RenderQueueLength++;
        this.#RenderQueue = this.#RenderQueue.then(async function(doc) {
            let uri = await render;
            doc.image(uri, attributes.x, attributes.y, { width: attributes.width, height: attributes.height});
            return doc;
        }).then(AwardContext_PDF.#Rendered(this));
       
    }
    
}

class AwardContext_SVG extends AwardContext
{
    #elem;
    async End() { return this.#elem; }

    constructor(elem, step)
    {
        super(step);
        this.#elem = elem;
    }

    async #CreateImage(url, attributes) {

        if (url.endsWith('.svg'))
        {
            let svg = await SVGElement.from(url);
            if (attributes._svg)
                (new Attributes([attributes._svg])).set(svg);
            url = svg.toBase64()
        }
        if (attributes._canvas)
        {
            let size = { width: attributes.width, height: attributes.height };
            let canvas = document.createElementNS("http://www.w3.org/1999/xhtml","canvas"); canvas.setAttribute('width', size.width); canvas.setAttribute('height', size.height);
            let a_context = new AwardContext_Canvas(canvas.getContext('2d'));
            await a_context.AddImage(url, attributes.reap('_canvas'), { width: size.width, height: size.height });
            await a_context.End();
            url = canvas.toDataURL('image/png');
        }
        return await (new Promise(respond => {
            let img = document.createElementNS("http://www.w3.org/2000/svg", "image");
            img.crossOrigin = 'anonymous'
            img.onload = () => respond(img);
            img.setAttribute('href', url);
        }));
    }
    
    async #Append(n_elem)
    {
        if (this.#elem.appendChild)
            this.#elem.appendChild(n_elem);
        else if (elem.append)
            this.#elem.append(n_elem);
    }

    async AddImage(url, attributes)
    {
        attributes = (attributes?._isAttributes) ? attributes : new Attributes(arguments, 1);
        attributes.assignBlanks(this._defaultLocation);
        attributes.align().originate();
        attributes.addStyle('mix-blend-mode', attributes.reap('mode'));
        attributes.addStyle('opacity', attributes.reap('opacity'));

        const img = await this.#CreateImage(url, attributes);
        attributes.addStyle('filter', attributes.reap('invert') === true ? 'invert()' : null);
        attributes.set(img);

        this.#Append(img);
        this._step();
    }

    async AddText(url, attributes) {
        attributes = (attributes?._isAttributes) ? attributes : new Attributes(arguments, 1);
        let fields = attributes.reap('fields');

        let elem = await SVGElement.from(url);
        (new Attributes([this._defaultLocation])).set(elem);        

        for (const [field, text] of Object.entries(fields)) {
            if (!text)
                continue;

            let text_elem = elem.querySelector(`[name=${field}]`);
            if (!text_elem)
            {
                console.warn(`Text field ${field} is missing in ${url}`);
                continue;
            }
                
            text_elem.innerHTML = text;
        }

        if (attributes._svg)
            (new Attributes([attributes._svg])).set(elem);
        this.#Append(elem);

        for (const img of elem.querySelectorAll('img'))
        {
            await (new Promise(respond => {
                img.onload = () => respond();
                img.crossOrigin = 'anonymous';
                img.setAttribute('href', url);
                if (img.complete)
                    respond();
            }));
        }
        
        this._step();
    }

    async Group(actions, _id, attributes)
    {
        attributes = (attributes?._isAttributes) ? attributes : new Attributes(arguments, 1);
        attributes.align().originate();

        const g_elem = document.createElementNS("http://www.w3.org/2000/svg", "g");
        attributes.valueKeys.forEach(key => g_elem.setAttribute(key,attributes[key]));

        await actions(new AwardContext_SVG(g_elem, this._step()));

        this.#Append(g_elem);
        this._step();
    }

}