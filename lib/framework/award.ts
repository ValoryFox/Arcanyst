declare var PDFDocument: any;
declare var BlobStream: any;
declare var fs: any;

class Award extends ValidatedListenedEntity {
    static Components;
    static Orders = { };
    static get List() {
        return Object.keys(Award.Orders);
    }

    static onPreviewChanges = [];
    static onPreviewSelection = [];

    async _pushChanges() : Promise<void> {
        super._pushChanges();
        if (Award.Preview == this) 
            for (let listener of Award.onPreviewChanges)
                await listener(this, this._changes);
    };
    async validate(property : string, from : any, to: any ) : Promise<void>
    {
        // Rank is bounded to the max and min set by the template
        if (this.rank < this.template.ranks.from) await this.setListenedProperty('rank', this.template.ranks.from);
        else if (this.rank > this.template.ranks.to) await this.setListenedProperty('rank', this.template.ranks.to);
        
        if (!this.template.variants)
            await this.setListenedProperty('variant', null);
        else if (!this.template.variants.includes(this.variant))
            await this.setListenedProperty('variant', this.template.variants[0]);
        
    }

    static _preview;
    static get Preview()
    {
        return Award._preview;
    }
    static set Preview(value)
    {
        let changes = []
        for (const prop of value._validatedProperties)
        {
            if (value[prop] != Award._preview?.[prop])
                changes.push({ property: prop, from: this._preview?.[prop], to: value[prop]});
        }
        Award._preview = value;

        for (let listener of this.onPreviewSelection)
            listener(value);
        for (let listener of Award.onPreviewChanges)
            listener(value, changes);
    }

    constructor(params : object = { })
    {
        super(['order', 'rank', 'variant', 'reason', 'flavour', 'player', 'pronoun', 'month', 'givenBy', 'date', 'issuer', 'issuerTitle']);
        for (let [key, value] of Object.entries(params))
        {
            this[`v_${key}`] = value; 
        }

        let award = this;
        Config.addEventListener('Date', (config, { to }) => { award.date = to; })
        Config.addEventListener('GivenBy', (config, { to }) => { award.givenBy = to; })
        Config.addEventListener('IssuerName', (config, { to }) => { award.issuer = to; })
        Config.addEventListener('IssuerTitle', (config, { to }) => { award.issuerTitle = to; })

        if (Award.Orders[this.order].variants && !this.variant) this.variant = Award.Orders[this.order].variants[0];
    }

    get fields()
    {
        const _rText = ['<img class="Underline Keep" style="width:4em;" src="resources/elements/text/writing-line.svg" />','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];
        let result = {
            AwardText_Order: this.template.title,
            AwardText_Rank: _rText[this.rank],
            AwardText_Pronoun: this.pronoun || 'their',
            AwardText_Reason: this.reason || '<br/><br/>',
            AwardText_Name: this.player || '<img class="Underline" src="resources/elements/writing-line.png" />',
            AwardText_Flavour: this.flavour || this.template.flavour[this.rank],
            AwardText_Issuer: Config.IssuerName,
            AwardText_IssuerTitle: Config.IssuerTitle,
            AwardText_GivenBy: Config.GivenBy,
            AwardText_Date: Config.Date
        }

        if (this.order == 'zodiac')
            result['AwardText_Flavour'] = result['AwardText_Flavour'].replace('<<MONTH>>', ` during the month of ${this.month}`)
            
        return result;
    }

    get template()
    {
        return Award.Orders[this.order];
    }

    v_order : string = 'griffon';
    get order() { return this.v_order; }
    set order(value : string) 
    { 
        this.setListenedProperty('order', value);
    }
    
    v_rank : number = 1;
    get rank() { return this.v_rank; }
    set rank(value : number) 
    { 
        this.setListenedProperty('rank', Number(value));
    }

    v_variant : string; get variant() { return this.v_variant; }
    set variant(value : string) 
    { 
        this.setListenedProperty('variant', value);
    }

    v_reason : string = ''; get reason() { return this.v_reason; }
    set reason(value : string) 
    { 
        this.setListenedProperty('reason', value);
    }

    v_flavour : string; get flavour() { return this.v_flavour; }
    set flavour(value : string) 
    { 
        this.setListenedProperty('flavour', value);
    }

    v_player : string = ''; get player() { return this.v_player; }
    set player(value : string) 
    { 
        this.setListenedProperty('player', value);
    }

    v_pronoun : string = 'their';
    get pronoun() { return this.v_pronoun; }
    set pronoun(value : string) 
    { 
        this.setListenedProperty('pronoun', value);
    }

    v_month : string; get month() { return this.v_month; }
    set month(value : string) 
    { 
        this.setListenedProperty('month', value);
    }

    v_givenBy : string; get givenBy() { return this.v_givenBy; }
    set givenBy(value :  string)
    {
        this.setListenedProperty('givenBy', value);
    }

    v_date : string; get date() { return this.v_date; }
    set date(value :  string)
    {
        this.setListenedProperty('date', value);
    }

    v_issuer : string; get issuer() { return this.v_issuer; }
    set issuer(value :  string)
    {
        this.setListenedProperty('issuer', value);
    }

    v_issuerTitle : string; get issuerTitle() { return this.v_issuerTitle; }
    set issuerTitle(value :  string)
    {
        this.setListenedProperty('issuerTitle', value);
    }

    static draw = {
        html : function(award, node)
        {
            if (!award) return;
            let fragment = new DocumentFragment();
            return Award.Orders[award.order].LoadAward(new AwardContext_SVG(fragment), award).then(async (ctx) => {
                await ctx.End();
                node.removeAllChildNodes().appendChild(fragment);
            });
        },
        /*
        pdf : function(award, doc, promise, suppressStatus)
        {
            if (!award) return;
            return Award.Orders[award.order].LoadAward(new AwardContext_PDF(promise, suppressStatus), award);   
        }*/
    };

    get fileName() : string
    {
        const _rText = ['generic','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];
        let rankText = _rText[this.rank].capitalizeFirstLetter();
        let result = `${this.order.capitalizeFirstLetter()} - ${rankText}`;
        if (this.player)
            result = `${result} ${this.player}`
        else if (this.variant)
            result = `${result} ${this.variant}`

        return `${result}.pdf`;
    }

    static NewPDF(promise)
    {
        let size = (new Attributes([{ width: Config.Page.width, height: Config.Page.height}])).dpi();
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
