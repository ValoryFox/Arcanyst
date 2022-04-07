class ValidatedListenedEntity {
    _validatedProperties = [];
    #listeners = {};
    constructor(_validatedProperties, listeners = {}) {
        this._validatedProperties = _validatedProperties;
        for (let p of _validatedProperties) {
            this.#listeners[p] = (listeners[p] ? listeners[p] : []);
        }
        this.#listeners['_any'] = (listeners['_any'] ? listeners['_any'] : []);
    }
    _changes;
    async _pushChanges() {
        for (const change of this._changes) {
            for (let listener of this.#listeners[change.property])
                await listener(this, change);
            for (let listener of this.#listeners['_any'])
                await listener(this, change);
        }
    }
    ;
    addEventListener(property, callback) {
        this.#listeners[property].push(callback);
    }
    async setListenedProperty(property, to) {
        const inner = `v_${property}`;
        const from = this[inner];
        if (from == to)
            return;
        this[inner] = to;
        const change = { property: property, from: from, to: to };
        if (!this._changes) {
            this._changes = [change];
            await this.validate(property, from, to);
            await this._pushChanges();
            this._changes = null;
        }
        else {
            this._changes.push(change);
        }
    }
    async validate(property, from, to) { }
}
//# sourceMappingURL=ValidatedListenedEntity.js.map