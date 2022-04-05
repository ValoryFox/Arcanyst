class Award {
    static Orders = { };
    static get List() {
        return Object.keys(Award.Orders);
    }

    onChange = [];
    disableCallback = false;
    _onChange(change) {
        const { property, from, to } = change;
        if (from == to) return; // Skip update if values are the same;

        this[`_${property}`] = to;

        switch (property)
        {
            case 'order':
                this.variant = ('variants' in Award.Orders[to]) ? Award.Orders[to].variants : null;
            case 'rank':
                if (this.rank < Award.Orders[this.order].ranks.from) this.rank = Award.Orders[to].ranks.from;
                else if (this.rank > Award.Orders[this.order].ranks.to) this.rank = Award.Orders[to].ranks.to;
                break;
        }

        for (let listener of this.onChange)
        {
            listener(this, change);
        }
        if (this == Award.Preview)
            Award._onPreviewUpdate(this, change);
    };

    static _preview;
    static onPreviewChange = [];
    static onPreviewUpdate = [];
    static _onPreviewUpdate(award, change)
    {
        for (let listener of Award.onPreviewUpdate)
        {
            listener(award, change);
        }
    }
    static get Preview()
    {
        return Award._preview;
    }
    static set Preview(value)
    {
        let changes = [];
        for (const prop of Award._props)
        {
            if (value[prop] != Award._preview?.[prop])
                changes.push({ property: prop, from: this._preview?.[prop], to: value[prop]});
        }
        Award._preview = value;
        for (let listener of this.onPreviewChange)
        {
            listener(value, 'all');
        }
        this._onPreviewUpdate(value, changes);
    }

    static _rText = ['<img class="Underline Keep" style="width:4em;" src="resources/elements/text/writing-line.svg" />','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];
    get fields()
    {
        let result = {
            AwardText_Order: Award.Orders[this.order].title,
            AwardText_Rank: Award._rText[this.rank],
            AwardText_Pronoun: this.pronoun,
            AwardText_Reason: this.reason || '',
            AwardText_Name: this.player || '<img class="Underline" src="resources/elements/writing-line.png" />',
            AwardText_Month: this.month || ''
        }
            
        return result;
    }

    get variants()
    {
        return Award.Orders[this.order].variants;
    }

    _rank; _variant; _order; _player; _reason; _pronoun; _month;
    
    static _props = ['order', 'rank', 'variant', 'player', 'reason', 'pronoun', 'month'];
    constructor(params = { })
    {
        params = Object.assign({ rank: 0, pronoun: 'their' }, params)
        for (let p of Award._props)
        {
            let p_private = `_${p}`;
            this[p_private] = null;
            Object.defineProperty(this, p, {
                get: () => this[p_private],
                set: (val) => {
                    this._onChange({ property: p, from: this[p_private], to: val });
                }
            });
            
            this[p_private] = (p in params) ? params[p] : null;
        }

        if (Award.Orders[this.order].variants && !this.variant) this.variant = Award.Orders[this.order].variants[0];
    }

    static draw = {
        html : function(award, node)
        {
            if (!award) return;
            let fragment = new DocumentFragment();
            return Award.Orders[award.order].LoadAward(new AwardContext_SVG(fragment), award.rank, award.variant, award.fields).then(async (ctx) => {
                await ctx.End();
                node.removeAllChildNodes().appendChild(fragment);
            });
        },

        pdf : function(award, doc, promise, suppressStatus)
        {
            if (!award) return;
            return Award.Orders[award.order].LoadAward(new AwardContext_PDF(promise, suppressStatus), award.rank, award.variant, award.fields);   
        }
    };

    get fileName()
    {
        let rankText = this.rank == 0 ? "Generic" : Award._rText[this.rank].capitalizeFirstLetter();
        let result = `${this.order.capitalizeFirstLetter()} - ${rankText}`;
        if (this.player)
            result = `${result} ${this.player}`
        else if (this.variant)
            result = `${result} ${this.variant}`

        return `${result}.pdf`;
    }

    static NewPDF(promise)
    {
        let size = (new Attributes([{ width: Config.page.width, height: Config.page.height}])).dpi();
        let doc = new PDFDocument({ size: [ size.width, size.height] });
        doc.on('pageAdded', () => console.warn("new page added???"));
        let stream = doc.pipe(BlobStream());
        let func = async(response) => {
            let requiredFonts = ["resources/fonts/BlackChancery.ttf", "resources/fonts/AveriaSerifLibre-Italic.ttf",
            "resources/fonts/AveriaSerifLibre-BoldItalic.ttf", "resources/fonts/AveriaSerifLibre-Regular.ttf", "resources/fonts/AveriaSerifLibre-Bold.ttf"]
            for (let _f of requiredFonts)
            {
                fs.cache(_f);
                await fs._pending[_f];
                doc.font(_f);

                let allGlyphs = ""
                for (let i = 0; i < 65565; i++)
                {
                    if (doc._fontFamilies[_f].font.hasGlyphForCodePoint(i))
                        allGlyphs += String.fromCodePoint(i);
                }
                doc.fontSize(0).fillColor('_00ffffff').text(allGlyphs, 0, 0);
            }
            if (response)
                response(doc);
            return doc;
        }

        

        return { doc: doc, stream: stream, promise: promise ? promise.then(func) : new Promise(func)};
    }

}
