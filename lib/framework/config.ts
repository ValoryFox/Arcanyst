'use-strict';
declare var Config : _config;
class _config extends ValidatedListenedEntity
{;
    static OnSettingChange = { 
        // Any triggers on any setting change, and happens BEFORE any specific ones.
        Any: [async (config : _config, {property, from, to}) => {
            // Update the Settings UI to new values.
            var elem = config.UIElem[property];
            if (!elem) return;

            if ((to === true || to === false) && elem.checked != to)
                elem.checked = to; // is a checkbox
            else if (elem.value != to)
                elem.value = to; // is a text field OR selection box

        }],
        Heraldry: [async (config : _config, {property, from, to}) => {
            if (!_config.#Heraldry_Cache[to]) 
                _config.#Heraldry_Cache[to] = await to.getBase64FromImageUrl().then(encoded => _config.#Heraldry_Cache[to] = encoded);
            (document.getElementById('HeraldryPreview') as HTMLImageElement).src = to;
            AwardContext.purgeGroup('heraldry');
        },
            async (config : _config, {property, from, to}) => {
                if (!Award.Preview) return;
                for (let listener of Award.onPreviewChanges)
                    listener(Award.Preview, [{from : null, to: null, property: "Config.Heraldry"}]);
            }],
        ShowDeadParks: [async (config : _config, {property, from, to}) => {
            (document.getElementById('Style-HideDeadParks') as any).disabled = to;
        }],
        Animations: [_config.writeCookie, 
            async (config : _config, {property, from, to}) => {
                for (let anim of document.querySelectorAll('animate')) (to ? anim.beginElement() : anim.endElement()); 
            }
        ],
        UseThe: [_config.writeCookie],
        UseOf: [_config.writeCookie],
        Kingdom: [_config.writeCookie],
        Park: [_config.writeCookie],
        KingdomData: [_config.writeCookie],
        ParkData: [_config.writeCookie],
        IssuerTitle: [],
        IssuerName: [],
    }   

    v_Kingdom : number | string; 
    get Kingdom() :  number | string { return this.v_Kingdom; }
    set Kingdom(value :  number | string)
    {
        this.setListenedProperty('Kingdom', value);
    }
    v_Park : number | string; 
    get Park() : number | string { return this.v_Park; }
    set Park(value :  number | string)
    {
        this.setListenedProperty('Park', value);
    }

    v_Heraldry : string; 
    get Heraldry() : string { return _config.#Heraldry_Cache[this.v_Heraldry] || this.v_Heraldry; }
    set Heraldry(value : string)
    {
        this.setListenedProperty('Heraldry', value);
    }

    static #Heraldry_Cache : object = {};

    // Text Wording Properties
    v_UseThe : boolean;
    get UseThe() : boolean { return this.v_UseThe; }
    set UseThe(value :  boolean)
    {
        this.setListenedProperty('UseThe', value);
    }
    v_UseOf : boolean; 
    get UseOf() { return this.v_UseOf; }
    set UseOf(value :  boolean)
    {
        this.setListenedProperty('UseOf', value);
    }

    // Site Use Properties
    v_Animations : boolean; 
    get Animations() : boolean { return this.v_Animations; }
    set Animations(value :  boolean)
    {
        this.setListenedProperty('Animations', value);
    }
    v_ShowDeadParks : boolean; 
    get ShowDeadParks() : boolean { return this.v_ShowDeadParks; }
    set ShowDeadParks(value :  boolean)
    {
        this.setListenedProperty('ShowDeadParks', value);
    }
    v_Date : string; 
    get Date() : string { return this.v_Date; }
    set Date(value :  string)
    {
        this.setListenedProperty('Date', value);
    }
    v_GivenBy : string; 
    get GivenBy() : string { return this.v_GivenBy; }
    set GivenBy(value :  string)
    {
        this.setListenedProperty('GivenBy', value);
    }
    v_IssuerName : string; 
    get IssuerName() : string { return this.v_IssuerName; }
    set IssuerName(value :  string)
    {
        this.setListenedProperty('IssuerName', value);
    }
    v_IssuerTitle : string; 
    get IssuerTitle() : string { return this.v_IssuerTitle; }
    set IssuerTitle(value :  string)
    {
        this.setListenedProperty('IssuerTitle', value);
    }
    v_KingdomData : OrkKingdom; 
    get KingdomData() : OrkKingdom { return this.v_KingdomData; }
    set KingdomData(value :  OrkKingdom)
    {
        let stripped : OrkKingdom = { KingdomName: value.KingdomName, KingdomId : value.KingdomId } as OrkKingdom;
        this.setListenedProperty('KingdomData', stripped);
    }
    v_ParkData : OrkPark; 
    get ParkData() : OrkPark { return this.v_ParkData; }
    set ParkData(value :  OrkPark)
    {
        let stripped : OrkPark = { Name: value.Name, Title: value.Title, ParkId : value.ParkId, ParkTitleId : value.ParkTitleId } as OrkPark;
        this.setListenedProperty('ParkData', stripped);
    }
    
    v_Page : Position = new Position(0, 0, 2550, 3300);
    get Page() : Position { return this.v_Page; }
    set Page(value : Position)
    {
        this.setListenedProperty('Page', value);
    }
    v_JPEG_Quality : number = 0.85;
    get JPEG_Quality() : number { return this.v_JPEG_Quality; }
    set JPEG_Quality(value :  number)
    {
        this.setListenedProperty('JPEG_Quality', value);
    }

    static set cookie(cfg : _config)
    {
        const params = { Park: cfg.Park, Kingdom: cfg.Kingdom, UseThe: cfg.UseThe, UseOf: cfg.UseOf, Animations: cfg.Animations, GivenBy: cfg.GivenBy };
        if (cfg.v_IssuerName) params['IssuerName'] = cfg.v_IssuerName;
        if (cfg.v_IssuerTitle) params['IssuerTitle'] = cfg.v_IssuerTitle; 
        if (cfg.KingdomData) params['KingdomData'] = cfg.KingdomData;
        if (cfg.ParkData) params['ParkData'] = cfg.ParkData; 
        document.cookie =  `cfg=${encodeURI(btoa(JSON.stringify(params)))};SameSite=Strict`
    }
    static writeCookie(cfg : _config) {_config.cookie = cfg; }; 
    

    UIElem : any = {};

    async validate(property : string, from : any, to: any ) : Promise<void>
    {
        if (property == 'Kingdom') 
        {
            let _k = Ork.Kingdoms[to]
            if (_k) // Kingdom has been loaded
            {
                this.KingdomData = _k; // Overwrite kingdom data cache
                const { IssuerName, IssuerTitle, UseThe, UseOf } = Ork.ProcessKingdomName(_k) as any;
                await Ork.LoadParks(to) // Wait for parks to load
                await this.setListenedProperty('IssuerName', IssuerName);
                await this.setListenedProperty('IssuerTitle', IssuerTitle);
                await this.setListenedProperty('UseThe', UseThe);
                await this.setListenedProperty('UseOf', UseOf);
                await this.setListenedProperty('Park', 'None');
                this.v_ParkData = null; // Clear park data cache
            }
        }
        if (property == 'Park' && Ork.Parks[this.Park])
        {
            let _p = Ork.Parks[to]
            if (_p) // Park has been loaded
            {
                this.ParkData = _p; // Overwrite park data cache
                await this.setListenedProperty('IssuerName', _p.Name);
                await this.setListenedProperty('IssuerTitle', _p.Title);
                await this.setListenedProperty('UseThe', true);
                await this.setListenedProperty('UseOf', true);
            }
        }

        if (property == 'Park' || property == 'Kingdom')
        {
            let id = to;
            if (id == 'None') id = this.Kingdom;
            if (id === undefined || id == 'Custom')
                this.Heraldry = null;
            else if (this.HeraldryOverrides[id])
                this.Heraldry = `heraldries/${id}.png`;
            else
                this.Heraldry = `https://us-central1-ash-amtgard-awards.cloudfunctions.net/heraldry?type=${Number(this.Park) ? 'park' : 'kingdom'}&id=${id}`;
        }

        switch (property)
        {
            case 'Kingdom':
        }
    }

    constructor()
    {
        super(['Kingdom', 'Park', 'Heraldry', 'UseThe', 'UseOf', 'Animations', 'ShowDeadParks', 'Date', 'GivenBy', 'IssuerName',
         'IssuerTitle', 'KingdomData', 'ParkData', 'Page', 'JPEG_Quality'], _config.OnSettingChange);
        for (let p of this._validatedProperties)
        {
            const setting_Elem = document.getElementById('Setting-' + p);
            if (setting_Elem) this.UIElem[p] = setting_Elem;
        }

        for (const elem of Object.values(this.UIElem))
            (elem as HTMLInputElement).addEventListener('input', this.UIUpdateElement)
    }

    static async from(params : object = { }) : Promise<_config>
    {
        let cfg = new _config()
        for (let p of cfg._validatedProperties)
        {
            if (p in params)
            {
                await cfg.setListenedProperty(p, params[p]);
            }
        }
        return cfg;
    }
    static async fromCookie() : Promise<_config>
    {
        let cfg = new _config();
        cfg.v_Animations = false;
        let _c = document.cookie.match(/cfg=([^;]+)/);
        if (_c)
        {
            try {
                let _p = JSON.parse(atob(decodeURI(_c[1])));
                if (_p.Park) 
                {
                    cfg.v_Kingdom = _p.Kingdom;
                    cfg.v_KingdomData = _p.KingdomData;
                    cfg.v_ParkData = _p.ParkData;
                    cfg.UIElem['Kingdom'].value = _p.Kingdom;
                    await Ork.LoadParks(_p.Kingdom);
                    cfg.UIElem['Park'].value = _p.Park;
                    await cfg.setListenedProperty('Park', _p.Park);
                    delete _p.Kingdom; delete _p.KingdomData; delete _p.Park; delete _p.ParkData;
                }
                else if (_p.Kingdom)
                {
                    cfg.v_KingdomData = _p.KingdomData;
                    await cfg.setListenedProperty('Kingdom', _p.Kingdom);
                    delete _p.Kingdom; delete _p.KingdomData;
                }
                for (const [p, val] of Object.entries(_p))
                {
                    await cfg.setListenedProperty(p, val);
                }
            } catch (error) {
                console.error("Mangled cookie info.");
                console.error(error);
            }
        }
        return cfg;
    }
    
    get UIUpdateElement() {
        let config = this;
        return (event : Event) : void =>
        {
            let elem = (event.target as HTMLInputElement);
            let property = elem.id.replace('Setting-','');
            config[property] = (elem.getAttribute('type') == 'checkbox') ? elem.checked : elem.value;
        }
    }

    Fonts = {
        'BlackChancery' : {
            'italic' : {  400: "resources/fonts/BlackChancery.ttf",
                          700: "resources/fonts/BlackChancery.ttf" },
            'normal' : {  400: "resources/fonts/BlackChancery.ttf",
                        700: "resources/fonts/BlackChancery.ttf" }},
        'Averia Serif Libre' : {
            'italic' : {  400: "resources/fonts/AveriaSerifLibre-Italic.ttf",
                            700: "resources/fonts/AveriaSerifLibre-BoldItalic.ttf" },
            'normal' : {  400: "resources/fonts/AveriaSerifLibre-Regular.ttf",
                        700: "resources/fonts/AveriaSerifLibre-Bold.ttf" }},
    }

    HeraldryOverrides = { "17" : true, "435" : true, "187" : true ,"295" : true ,"309" : true , "519" : true ,"638" : true ,"700" : true ,"845" : true ,"917" : true };
    
}