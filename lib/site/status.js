'use-strict';
class Status {
    static set Modal(val)
    {
        document.querySelector('body').classList.toggle('displayModal', val)
    }

    static get Elem_Status() 
    {
        return document.querySelector('#MODAL_STATUS');
    }
}

class StatusText {
    element;
    constructor(label)
    {
        this.element = document.querySelector('#templates_modal>.statusText').cloneNode(true);
        this.label = label;
        Status.Elem_Status.appendChild(this.element);
    }
    #label;
    set label(val)
    {
        this.#label = val;
        this.element.querySelector('.text p.label').innerHTML = val;
    }
    get label()
    {
        return this.#label;
    }
    End()
    {
        Status.Elem_Status.removeChild(this.element);
    }
}

class ErrorMessage {
    element;
    constructor(message, choices)
    {
        this.element = document.querySelector('#templates_modal>.statusError').cloneNode(true);
        this.message = message;
        this.selection = new Promise(resolve => {
            for (let {label, choice} of choices)
            {
                let button = document.createElement('button');
                button.classList.add('styledButton');
                button.innerHTML = label;
                button.addEventListener('click', () =>{
                    this.Dismiss();
                    resolve(choice);
                });
                this.element.appendChild(button);
            }
        });

        Status.Elem_Status.appendChild(this.element);
    }

    set message(msg) {
        this.element.querySelector('[name=msg]').innerHTML = msg;
    }

    Dismiss()
    {
        Status.Elem_Status.removeChild(this.element);
    }
}

class Progress {
        
    element;
    constructor(label, end = "?", start = 0)
    {
        this.element = document.querySelector('#templates_modal>.progressBar').cloneNode(true);
        this.label = label;
        this.end = end;
        this.current = start;
        Status.Elem_Status.appendChild(this.element);
    }

    #current;
    set current(val)
    {
        this.#current = val;
        if (this.end == '?')
            this.element.querySelector('.fill').style.width = `0%`
        else
            this.element.querySelector('.fill').style.width = `${100 * this.current / this.end}%`
        this.element.querySelector('.text p.numerical').innerHTML = `${this.current}/${this.end}`;
    }
    get current()
    {
        return this.#current;
    }

    #active;
    set active(val)
    {
        this.element.classList.toggle('active', val);
    }

    #end;
    set end(val)
    {
        this.#end = val;
        if (this.end == '?')
            this.element.querySelector('.fill').style.width = `0%`
        else
            this.element.querySelector('.fill').style.width = `${100 * this.current / this.end}%`
        this.element.querySelector('.text p.numerical').innerHTML = `${this.current}/${this.end}`;
    }
    get end()
    {
        if (this.#end == '?')
            return 0;
        return this.#end;
    }

    #label;
    set label(val)
    {
        this.#label = val;
        this.element.querySelector('.text p.label').innerHTML = val;
    }
    get label()
    {
        return this.#label;
    }

    End()
    {
        Status.Elem_Status.removeChild(this.element);
    }
}