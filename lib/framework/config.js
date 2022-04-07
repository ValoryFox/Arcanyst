'use-strict';
class _config extends ValidatedListenedEntity {
    ;
    static OnSettingChange = {
        // Any triggers on any setting change, and happens BEFORE any specific ones.
        Any: [async (config, { property, from, to }) => {
                // Update the Settings UI to new values.
                var elem = config.UIElem[property];
                if (!elem)
                    return;
                if ((to === true || to === false) && elem.checked != to)
                    elem.checked = to; // is a checkbox
                else if (elem.value != to)
                    elem.value = to; // is a text field OR selection box
            }],
        Heraldry: [async (config, { property, from, to }) => {
                if (!_config.#Heraldry_Cache[to])
                    _config.#Heraldry_Cache[to] = await to.getBase64FromImageUrl().then(encoded => _config.#Heraldry_Cache[to] = encoded);
                document.getElementById('HeraldryPreview').src = to;
                AwardContext.purgeGroup('heraldry');
            },
            async (config, { property, from, to }) => {
                if (!Award.Preview)
                    return;
                for (let listener of Award.onPreviewChanges)
                    listener(Award.Preview, [{ from: null, to: null, property: "Config.Heraldry" }]);
            }],
        ShowDeadParks: [async (config, { property, from, to }) => {
                document.getElementById('Style-HideDeadParks').disabled = to;
            }],
        Animations: [_config.writeCookie,
            async (config, { property, from, to }) => {
                for (let anim of document.querySelectorAll('animate'))
                    (to ? anim.beginElement() : anim.endElement());
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
    };
    v_Kingdom;
    get Kingdom() { return this.v_Kingdom; }
    set Kingdom(value) {
        this.setListenedProperty('Kingdom', value);
    }
    v_Park;
    get Park() { return this.v_Park; }
    set Park(value) {
        this.setListenedProperty('Park', value);
    }
    v_Heraldry;
    get Heraldry() { return _config.#Heraldry_Cache[this.v_Heraldry] || this.v_Heraldry; }
    set Heraldry(value) {
        this.setListenedProperty('Heraldry', value);
    }
    static #Heraldry_Cache = {};
    // Text Wording Properties
    v_UseThe;
    get UseThe() { return this.v_UseThe; }
    set UseThe(value) {
        this.setListenedProperty('UseThe', value);
    }
    v_UseOf;
    get UseOf() { return this.v_UseOf; }
    set UseOf(value) {
        this.setListenedProperty('UseOf', value);
    }
    // Site Use Properties
    v_Animations;
    get Animations() { return this.v_Animations; }
    set Animations(value) {
        this.setListenedProperty('Animations', value);
    }
    v_ShowDeadParks;
    get ShowDeadParks() { return this.v_ShowDeadParks; }
    set ShowDeadParks(value) {
        this.setListenedProperty('ShowDeadParks', value);
    }
    v_Date;
    get Date() { return this.v_Date; }
    set Date(value) {
        this.setListenedProperty('Date', value);
    }
    v_GivenBy;
    get GivenBy() { return this.v_GivenBy; }
    set GivenBy(value) {
        this.setListenedProperty('GivenBy', value);
    }
    v_IssuerName;
    get IssuerName() { return this.v_IssuerName; }
    set IssuerName(value) {
        this.setListenedProperty('IssuerName', value);
    }
    v_IssuerTitle;
    get IssuerTitle() { return this.v_IssuerTitle; }
    set IssuerTitle(value) {
        this.setListenedProperty('IssuerTitle', value);
    }
    v_KingdomData;
    get KingdomData() { return this.v_KingdomData; }
    set KingdomData(value) {
        let stripped = { KingdomName: value.KingdomName, KingdomId: value.KingdomId };
        this.setListenedProperty('KingdomData', stripped);
    }
    v_ParkData;
    get ParkData() { return this.v_ParkData; }
    set ParkData(value) {
        let stripped = { Name: value.Name, Title: value.Title, ParkId: value.ParkId, ParkTitleId: value.ParkTitleId };
        this.setListenedProperty('ParkData', stripped);
    }
    v_Page = new Position(0, 0, 2550, 3300);
    get Page() { return this.v_Page; }
    set Page(value) {
        this.setListenedProperty('Page', value);
    }
    v_JPEG_Quality = 0.85;
    get JPEG_Quality() { return this.v_JPEG_Quality; }
    set JPEG_Quality(value) {
        this.setListenedProperty('JPEG_Quality', value);
    }
    static set cookie(cfg) {
        const params = { Park: cfg.Park, Kingdom: cfg.Kingdom, UseThe: cfg.UseThe, UseOf: cfg.UseOf, Animations: cfg.Animations, GivenBy: cfg.GivenBy };
        if (cfg.v_IssuerName)
            params['IssuerName'] = cfg.v_IssuerName;
        if (cfg.v_IssuerTitle)
            params['IssuerTitle'] = cfg.v_IssuerTitle;
        if (cfg.KingdomData)
            params['KingdomData'] = cfg.KingdomData;
        if (cfg.ParkData)
            params['ParkData'] = cfg.ParkData;
        document.cookie = `cfg=${encodeURI(btoa(JSON.stringify(params)))};SameSite=Strict`;
    }
    static writeCookie(cfg) { _config.cookie = cfg; }
    ;
    UIElem = {};
    async validate(property, from, to) {
        if (property == 'Kingdom') {
            let _k = Ork.Kingdoms[to];
            if (_k) // Kingdom has been loaded
             {
                this.KingdomData = _k; // Overwrite kingdom data cache
                const { IssuerName, IssuerTitle, UseThe, UseOf } = Ork.ProcessKingdomName(_k);
                await Ork.LoadParks(to); // Wait for parks to load
                await this.setListenedProperty('IssuerName', IssuerName);
                await this.setListenedProperty('IssuerTitle', IssuerTitle);
                await this.setListenedProperty('UseThe', UseThe);
                await this.setListenedProperty('UseOf', UseOf);
                await this.setListenedProperty('Park', 'None');
                this.v_ParkData = null; // Clear park data cache
            }
        }
        if (property == 'Park' && Ork.Parks[this.Park]) {
            let _p = Ork.Parks[to];
            if (_p) // Park has been loaded
             {
                this.ParkData = _p; // Overwrite park data cache
                await this.setListenedProperty('IssuerName', _p.Name);
                await this.setListenedProperty('IssuerTitle', _p.Title);
                await this.setListenedProperty('UseThe', true);
                await this.setListenedProperty('UseOf', true);
            }
        }
        if (property == 'Park' || property == 'Kingdom') {
            let id = to;
            if (id == 'None')
                id = this.Kingdom;
            if (id === undefined || id == 'Custom')
                this.Heraldry = null;
            else if (this.HeraldryOverrides[id])
                this.Heraldry = `heraldries/${id}.png`;
            else
                this.Heraldry = `https://us-central1-ash-amtgard-awards.cloudfunctions.net/heraldry?type=${Number(this.Park) ? 'park' : 'kingdom'}&id=${id}`;
        }
        switch (property) {
            case 'Kingdom':
        }
    }
    constructor() {
        super(['Kingdom', 'Park', 'Heraldry', 'UseThe', 'UseOf', 'Animations', 'ShowDeadParks', 'Date', 'GivenBy', 'IssuerName',
            'IssuerTitle', 'KingdomData', 'ParkData', 'Page', 'JPEG_Quality'], _config.OnSettingChange);
        for (let p of this._validatedProperties) {
            const setting_Elem = document.getElementById('Setting-' + p);
            if (setting_Elem)
                this.UIElem[p] = setting_Elem;
        }
        for (const elem of Object.values(this.UIElem))
            elem.addEventListener('input', this.UIUpdateElement);
    }
    static async from(params = {}) {
        let cfg = new _config();
        for (let p of cfg._validatedProperties) {
            if (p in params) {
                await cfg.setListenedProperty(p, params[p]);
            }
        }
        return cfg;
    }
    static async fromCookie() {
        let cfg = new _config();
        cfg.v_Animations = false;
        let _c = document.cookie.match(/cfg=([^;]+)/);
        if (_c) {
            try {
                let _p = JSON.parse(atob(decodeURI(_c[1])));
                if (_p.Park) {
                    cfg.v_Kingdom = _p.Kingdom;
                    cfg.v_KingdomData = _p.KingdomData;
                    cfg.v_ParkData = _p.ParkData;
                    cfg.UIElem['Kingdom'].value = _p.Kingdom;
                    await Ork.LoadParks(_p.Kingdom);
                    cfg.UIElem['Park'].value = _p.Park;
                    await cfg.setListenedProperty('Park', _p.Park);
                    delete _p.Kingdom;
                    delete _p.KingdomData;
                    delete _p.Park;
                    delete _p.ParkData;
                }
                else if (_p.Kingdom) {
                    cfg.v_KingdomData = _p.KingdomData;
                    await cfg.setListenedProperty('Kingdom', _p.Kingdom);
                    delete _p.Kingdom;
                    delete _p.KingdomData;
                }
                for (const [p, val] of Object.entries(_p)) {
                    await cfg.setListenedProperty(p, val);
                }
            }
            catch (error) {
                console.error("Mangled cookie info.");
                console.error(error);
            }
        }
        return cfg;
    }
    get UIUpdateElement() {
        let config = this;
        return (event) => {
            let elem = event.target;
            let property = elem.id.replace('Setting-', '');
            config[property] = (elem.getAttribute('type') == 'checkbox') ? elem.checked : elem.value;
        };
    }
    Fonts = {
        'BlackChancery': {
            'italic': { 400: "resources/fonts/BlackChancery.ttf",
                700: "resources/fonts/BlackChancery.ttf" },
            'normal': { 400: "resources/fonts/BlackChancery.ttf",
                700: "resources/fonts/BlackChancery.ttf" }
        },
        'Averia Serif Libre': {
            'italic': { 400: "resources/fonts/AveriaSerifLibre-Italic.ttf",
                700: "resources/fonts/AveriaSerifLibre-BoldItalic.ttf" },
            'normal': { 400: "resources/fonts/AveriaSerifLibre-Regular.ttf",
                700: "resources/fonts/AveriaSerifLibre-Bold.ttf" }
        },
    };
    HeraldryOverrides = { "17": true, "435": true, "187": true, "295": true, "309": true, "519": true, "638": true, "700": true, "845": true, "917": true };
}
//# sourceMappingURL=config.js.map