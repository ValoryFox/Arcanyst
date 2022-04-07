'use-strict';

Award.Components = class
{
    static async Border(context : AwardContext, theme : { primary: string, secondary: string }, params = {}) : Promise<void>
    {
        await context.AddImage("resources/elements/border-primary.svg", { mode: "multiply", _svg: { style: `fill:${theme.primary};` } }, params); 
        await context.AddImage("resources/elements/border-secondary.svg", { mode: "multiply", _svg: { style: `fill:${theme.secondary};`} }, params); 
    }
    static async Heraldry(context : AwardContext, position : Position = new Position(0, 50, 420, 420), origin : Origin = Origin.CentreTop, params = {}) : Promise<void>
    {
        if (Config.Heraldry)
            await context.AddImage(Config.Heraldry, { mode: "multiply" }, origin, position, params); 
    }
    static async Parchment(context : AwardContext, params = {}) : Promise<void> {
        await context.AddImage("resources/textures/parchment.jpg", { style: 'pointer-events:none;' }, params);
    };
    static async HeraldryParchment(context : AwardContext, position : Position = new Position(0, 50, 420, 420), origin : Origin = Origin.CentreTop, params = {}) : Promise<void>
    {
        await context.Group(async function(context) {
            await Award.Components.Parchment(context);
            await Award.Components.Heraldry(context, position, origin, params);
        }, "heraldry_parchment", []);
    }
    static async Text(context : AwardContext, award : Award, style : object = { }, params = {}) : Promise<void>
    {
        let _f = award.fields;
        let dyn = [
            { selector: '[name=AwardText_Issuer]', min: '1em', base: '1em', scale: '0.22em', numerator: '14', fallback : 10},
            { selector: 'p.AwardeeName', min: '1.36em', base: '2.55em', scale: '-0.374em', denominator: '8', fallback : 10}
        ]
        await context.AddText("resources/elements/text.elem", { _dyn : dyn }, { fields: award.fields, _svg: { style: style, class: award.order.capitalizeFirstLetter() }, }, params);
    }


    static async SVGFrom(url : string) : Promise<SVGElement>
    {
        let data = await (await fetch(url)).text();
        
        const parser = new DOMParser();
        const svg = parser.parseFromString(data, 'image/svg+xml').querySelector('svg');

        return svg;
    }
}

class AwardContext {
    _step : Function;
    constructor(step : Function = () => {}) {
        this._step = step;
    }

    /**
    * Adds an image to the award. Can add any number of objects to pass as attributes after the parameters.
    * @url   A link to the image (or data URL)
    */
    async AddImage(url : string, ...args : object[]) : Promise<void> { }

    /**
    * Adds an image to the award. Can add any number of objects to pass as attributes after the parameters.
    * @url   A link to the text svg
    */
    async AddText(url : string, ...args : object[]) : Promise<void> { }

    /**
    * Forms a group.
    * @actions    {Function} A callback function that the group is added within. Passes along a new context.
    */
    async Group(actions : Function, _id : string, ...args : object[]) : Promise<void> { }

    
    static purgeCache(id : string) : void
    {
        delete AwardContext_Canvas.cache[id];
        //delete AwardContext_PDF.cache[id];
    }

    static purgeGroup(group : string) : void
    {
        group = group.toLowerCase();
        Object.keys(AwardContext_Canvas.cache).forEach(key => {
            if (key.toLowerCase().includes(group + "_"))
            {
                delete AwardContext_Canvas.cache[key];
            }
        });
        /*Object.keys(AwardContext_PDF.cache).forEach(key => {
            if (key.toLowerCase().includes(group + "_"))
            {
                delete AwardContext_PDF.cache[key];
            }
        });*/
    }

    static purgeAll()
    {
        AwardContext_Canvas.cache = { };
        //AwardContext_PDF.cache = { };
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
            //case 'pdf':
            case 'canvas': return 'canvas'; 
            default: return this.type;
        }
    }
    get #cache() {
        switch (this.type.toLowerCase())
        {
            //case 'pdf': return AwardContext_PDF.cache;
            case 'canvas': return AwardContext_Canvas.cache;
            default: return {};
        }
    }
    async Group(actions : Function, _id : string, ...args : object[])
    {
        if (!this.#cache[_id]) await actions(new AwardContext_Skim(this.#nestType, this._step));
        this._step();
    }

    async AddImage(url : string, ...args : object[]) { this._step(); }
    async AddText(url : string, ...args : object[]) { this._step(); }
}

class AwardContext_Canvas extends AwardContext {
    #canvas;
    static cache = { }; get cache() { return AwardContext_Canvas.cache; }
    constructor(canvas : CanvasRenderingContext2D, step?)
    {
        super(step);
        this.#canvas = canvas;
    }

    async End() { return this.#canvas; }

    async Group(actions : Function, _id : string, ...args : object[])
    {
        const attributes = new Attributes(args);
        attributes.align();

        var g_canvas;
        if (_id && this.cache[_id])
            g_canvas = await this.cache[_id];
        else
        {
            let done : Function = () => { };
            if (_id)
            {
                console.info(`Instantiating Group [${_id}] -- Canvas Context`)
                this.cache[_id] = new Promise((response : Function) => 
                    { done = response });
                this.cache[_id].then(()=>{console.info(`Finished Caching Group [${_id}] -- Canvas Context`)});
            }
            g_canvas = document.createElement('canvas');
            g_canvas.setAttribute('width', attributes.reap('width', null, Config.Page.width));
            g_canvas.setAttribute('height', attributes.reap('height', null, Config.Page.height));
            const g_context = g_canvas.getContext('2d');

            await actions(new AwardContext_Canvas(g_context, this._step));

            done(g_canvas);
        }
        this._step();
        this.#canvas.drawImage(g_canvas, attributes.reap('x', null, 0), attributes.reap('y', null, 0));
    }
    
    draw_type = 'png';
    async AddImage(url : string, ...args : object[])
    {
        const attributes = new Attributes(args);
        attributes.assignBlanks(Config.Page);

        if (url.endsWith('.jpg'))
            this.draw_type = 'jpeg';

        attributes.align();

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
        }).then((img : HTMLImageElement) => 
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
    }
}
/*
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


    constructor(promise? : Promise<any>, step? : Function)
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

    async AddImage(url : string, ...args : object[])
    {
        const attributes = new Attributes(args);

        if (url.endsWith('svg'))
            return await this.Group(async(context) => { await context.AddImage(url, attributes); });

        fs.cache(url);
        
        attributes.align().dpi();
        this.#RenderQueueLength++;
        this.#RenderQueue = this.#RenderQueue.then(async function(doc) {
            await fs._pending[url];
            doc.image(url, attributes.x, attributes.y, attributes.width, attributes.height);
            return doc;
        }).then(AwardContext_PDF.#Rendered(this));
    }

    async AddText(url : string, ...args : object[])
    {
        const attributes = new Attributes(args);;
        let fields = attributes.reap('fields');

        let elem = await Award.Components.SVGFrom(url);
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


    async Group(actions : Function, _id : string, ...args : object[])
    {
        const attributes = new Attributes(args);
        let render;
        attributes.assignBlanks(Config.Page);
        attributes.align();
                
        let draw_type = attributes.reap('draw_type', null, 'png');
        if (_id && AwardContext_PDF.cache[_id])
            render = await AwardContext_PDF.cache[_id]; 
        else 
        {
            render = new Promise(async function(response) 
            {
                const g_canvas = document.createElement('canvas');
                g_canvas.setAttribute('width', String(attributes.width));
                g_canvas.setAttribute('height', String(attributes.height));
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
    
}*/

class AwardContext_SVG extends AwardContext
{
    #elem : Node;
    async End() { return this.#elem; }

    constructor(elem : Node, step?: Function)
    {
        super(step);
        this.#elem = elem;
    }

    async #CreateImage(url : string, attributes : Attributes) : Promise<SVGImageElement> {

        if (url.endsWith('.svg'))
        {
            let svg = await Award.Components.SVGFrom(url);
            if (attributes._svg)
                (new Attributes([attributes._svg])).set(svg);
            url = svg.toBase64()
        }
        if (attributes._canvas)
        {
            let canvas = document.createElementNS("http://www.w3.org/1999/xhtml","canvas") as HTMLCanvasElement;
            canvas.setAttribute('width', String(attributes.width));
            canvas.setAttribute('height', String(attributes.height));
            let a_context = new AwardContext_Canvas(canvas.getContext('2d'));
            await a_context.AddImage(url, attributes.reap('_canvas'), { width: attributes.width, height: attributes.height });
            await a_context.End();

            url = canvas.toDataURL('image/png');
        }
        return await (new Promise(respond => {
            let img = document.createElementNS("http://www.w3.org/2000/svg", "image") as SVGImageElement;
            img.onload = () => respond(img);
            img.setAttribute('href', url);
        }));
    }

    async AddImage(url : string, ...args : object[])
    {
        const attributes = new Attributes(args);
        attributes.assignBlanks(Config.Page);
        attributes.align();
        attributes.style = attributes.reap('mode', null, null, CSSStr('mix-blend-mode'));
        attributes.style = attributes.reap('opacity', null, null, CSSStr('opacity'));

        const img = await this.#CreateImage(url, attributes);
        attributes.style = attributes.reap('filter', null, null, CSSStr('filter'));
        attributes.set(img);

        this.#elem.appendChild(img);
        this._step();
    }

    async AddText(url : string, ...args : object[])
    {
        const attributes = new Attributes(args);
        let fields = attributes.reap('fields');

        let elem = await Award.Components.SVGFrom(url);
        (new Attributes([Config.Page])).set(elem);        

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

    
        for (const { selector, min, base, scale, numerator, denominator, fallback } of attributes.reap('_dyn', null, []))
        {
            for (const dyn_text of elem.querySelectorAll(selector))
            {
                let size = (len) => `font-size:max(${min}, calc(${base} + ${scale} * (${numerator ? `${numerator} / ` : ''}(${len || Number(fallback)} / ${denominator || '1'}))))`
                dyn_text.setAttribute('style', Attributes._mergeStyle(dyn_text.getAttribute('style'), size((dyn_text.querySelector('span')) ? dyn_text.querySelector('span').innerText.length : dyn_text.innerText.length)));
                const observer = new MutationObserver(function(mutationsList, observer) {
                    
                    dyn_text.setAttribute('style', Attributes._mergeStyle(dyn_text.getAttribute('style'), size((dyn_text.querySelector('span')) ? dyn_text.querySelector('span').innerText.length : dyn_text.innerText.length)));
                });
                observer.observe(dyn_text, { childList: true, characterData: true, subtree: true });
            }
        }

        this.#elem.appendChild(elem);
        for (const img of elem.querySelectorAll('img'))
        {
            await (new Promise((respond : Function) => {
                img.onload = () => respond();
                img.crossOrigin = 'anonymous';
                img.setAttribute('href', url);
                if (img.complete)
                    respond();
            }));
        }
    
        if (attributes._svg)
            (new Attributes([attributes._svg])).set(elem);

        this._step();
    }

    async Group(actions : Function, _id : string, ...args : object[])
    {
        const attributes = new Attributes(args);
        attributes.assignBlanks(Config.Page);
        attributes.align();

        const g_elem = document.createElementNS("http://www.w3.org/2000/svg", "g");
        attributes.set(g_elem);
        
        await actions(new AwardContext_SVG(g_elem, this._step()));

        this.#elem.appendChild(g_elem);
        this._step();
    }

}