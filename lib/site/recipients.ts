var UI_RecipientTemplate;
var UI_RecipientList;
var UI_CurrentRecipient;

declare function Print_SingleAward(award : Award) : void;
class Recipients {
    static Active;
    static List = [];

    static AddAward(_Award) {
        let _n = Recipients.#MakeRecipientNode(_Award);
        _Award.UIElem = _n;
        UI_RecipientList.appendChild(_n);
        Recipients.List.push(_Award);
    }

    static DeleteAward(_Award) {
        let index = Recipients.List.indexOf(_Award);

        if (Recipients.List.length == 1)
        {
            Recipients.Active.rank = 0;
            Recipients.Active.player = '';
            Recipients.Active.reason = '';
            return;
        }
        UI_RecipientList.removeChild(_Award.UIElem);
        Recipients.List = Recipients.List.slice(0,index).concat(Recipients.List.slice(index + 1));
        if (_Award == Recipients.Active)
            Award.Preview = Recipients.List[index == Recipients.List.length ? index - 1 : index];
    }

    static SetActive(_Award) {       
        if (!Recipients.Active)
        {
            Recipients.AddAward(_Award);
        }
        else
        {
            Recipients.Active.UIElem.classList.toggle('active', false);
            document.getElementById("CurrentRecipient").removeChild(document.getElementById("CurrentRecipient").firstChild);
        }
        UI_CurrentRecipient = Recipients.#MakeRecipientNode(_Award);
        document.getElementById("CurrentRecipient").appendChild(UI_CurrentRecipient); 
        _Award.UIElem.classList.toggle('active', true);
        Recipients.Active = _Award;
    }

    static Initialize()
    {
        UI_RecipientTemplate = document.getElementById('templates_recipient').querySelector('.RecipientItem');
        UI_RecipientList = document.getElementById('RecipientList');
    
        let ri_awd = UI_RecipientTemplate.querySelector('[name=RecipientInput_Order]');
        for (let awd of Award.List)
        {
            let _o = document.createElement('option');
            _o.value = awd;
            _o.innerHTML = awd.capitalizeFirstLetter();
            ri_awd.appendChild(_o);
        }
    
        document.getElementById('RecipientButton_NewAward').addEventListener('click', () => {
            let _newAward = new Award({ order: Award.Preview.order, variant: Award.Preview.variant });
            Recipients.AddAward(_newAward);
            Award.Preview = _newAward;
        });
    
        Award.onPreviewSelection.push(Recipients.SetActive);
    }

    static async ImportSheet(url : string)
    {
        const id = url.match(/1[a-zA-Z0-9_-]{42}[AEIMQUYcgkosw048]/); 
        const to_clear = Recipients.List.length;
        if (!id) return console.warn("Invalid Google Sheets URL - No ID found.");
    
        const request = `https://us-central1-ash-amtgard-awards.cloudfunctions.net/sheets?id=${id[0]}`;
        const raw = await fetch(request).then(response => response.text());
    
        interface SheetRowDefinition {
            search? : RegExp;
            match? : RegExp;
            necessary?: string | false;
            process? : Function;
        }

        const columns = {
            player: { search: /(player( name)?|name)/i, necessary: 'prompt' } as SheetRowDefinition,
            order: { search: /(award|order|type)/i, necessary: 'require', match: new RegExp(`(${Award.List.join('|')})`,'i'), process: str => str.toLowerCase()} as SheetRowDefinition,
            reason: { search: /(reason|for)/i, necessary: 'prompt' } as SheetRowDefinition,
            rank: { search: /(rank|level)/i, necessary: 'prompt', match: /(10|[0-9])(st|nd|rd|th)?/i, process: str => Number(str) } as SheetRowDefinition,
            pronoun: { search: /(pronoun)/i, necessary: false, process: str => str.toLowerCase() } as SheetRowDefinition,
            month: { search: /(month)/i, necessary: false, process: str => str.toLowerCase() } as SheetRowDefinition
            //, count: { search: /(\# of blanks|blanks)/i, necessary: false }
        }
        
        const table = raw.split('\n').map(row => row.split('\t'));
        columnSearch: for (const [property, column] of Object.entries(columns))
        {
            for (let i = 0; i < table[0].length; i++)
                if (column.search.test(table[0][i])) { column['index'] = i; continue columnSearch; }
            
            // If column has not been found
            if (column.necessary) return console.error(`Necessary column ${property} has not been found.`);
            else console.warn(`Column ${property} has not been found, while not required, it should be included.`);
        }
    
        awardSearch: for (let i = 1; i < table.length; i++)
        {
            let params = {};
            for (const [property, column] of Object.entries(columns))
            {
                if (!('index' in column)) continue;
                let value = table[i][column['index']];
                if (column['match'] && column['match'].test(value))
                    value = value.match(column['match'])[1];
    
                if (!value)
                {
                    if (column.necessary == 'require')
                    {
                        console.warn(`Discarding award row #${i}, missing ${property}.\n${table[i]}`);
                        continue awardSearch;
                    }
                    else continue;
                }
    
                if (column.process) value = column.process(value);
                params[property] = value;
            }
    
            if (params['order'] == 'warrior' && !params['rank'])
                console.warn(`Discarding award row #${i}, missing rank.\n${table[i]}`);
            Recipients.AddAward(new Award(params));
        }
    
        for (let i = 0; i < to_clear; i++) Recipients.DeleteAward(Recipients.List[0]);
    
    }


    static #MakeRecipientNode(_Award)
    {
        let result = UI_RecipientTemplate.cloneNode(true);
        Object.defineProperty(result, 'Award', {
            set: function (award : Award) 
            {
                this._Award = award;
    
                if (award.template.variants)
                {
                    let variantSelect = this.querySelector('[name=RecipientInput_Variant]');
                    for (let variant of award.template.variants)
                    {
                        let _o = document.createElement('option');
                        _o.value = variant;
                        _o.innerHTML = variant.capitalizeFirstLetter();
                        variantSelect.appendChild(_o);
                    }
                }
    
                for (let field of this.querySelectorAll('[name^=RecipientInput_]'))
                {
                    let _n = field.getAttribute('name');
                    let prop = _n.split('_')[1].toLowerCase();
    
                    field.value = award[prop];
                    field.addEventListener('change', () => {
                        award[prop] = field.value;
                    });
                    award.addEventListener(prop, (award : Award, { property, to }) => {
                        if (property == prop && field.value != to)
                            field.value = to; 
                    });
                }
    
                this.querySelector('[name=RecipientInput_Month]').classList.toggle('hide', award.order != "zodiac");
                this.querySelector('[name=RecipientInput_Variant]').classList.toggle('hide', !award.template.variants);
    
                award.addEventListener('order', (award : Award, { to }) => {
                    this.querySelector('[name=RecipientInput_Month]').classList.toggle('hide', to != "zodiac");
                });
                award.addEventListener('variant', (award : Award, { to }) => {
                    this.querySelector('[name=RecipientInput_Variant]').classList.toggle('hide', !award.template.variants);
                });
    
            },
            get: function()
            {
                return this._Award;
            }
        });
        result.querySelector('[name=RecipientButton_Delete]').addEventListener('click', () => { Recipients.DeleteAward(result.Award); });
        result.querySelector('[name=RecipientButton_Preview]').addEventListener('click', () => { Award.Preview = result.Award; });
        result.querySelector('[name=RecipientButton_Print]').addEventListener('click', () => { Print_SingleAward(result.Award); });
    
        result.Award = _Award;
        return result;
    }
};

    