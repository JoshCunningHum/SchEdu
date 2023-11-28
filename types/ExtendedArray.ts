
// TODO: Finish this later

export abstract class ExtE<T>{
    abstract equals(obj : T) : boolean;
}

export class ExtArray<T extends ExtE<T>, U> extends Array<T>{
    constructor(...objs: Array<T | Array<T>>){
        super();
        objs.forEach(v => Array.isArray(v) ? (v.length > 0 ? this.push(...v) : null) : this.push(v));
    }

    add(...objs : Array<T>) : ExtArray<T, U> {
        this.push(...objs.filter(obj => !this.has(obj)));
        return this;
    }

    create(Initializer: new(a: U) => T ,...objs : Array<U>) : ExtArray<T, U>{
        this.push(...objs.map(obj => new Initializer(obj)).filter(obj => !this.has(obj)));
        return this;
    }

    index(obj: T | ((o : T, i: number, arr: T[]) => boolean) ) : number {
        return this.findIndex(typeof obj === 'function' ? obj : (o => o.equals(obj)));
    }

    has(obj: T | ((o : T, i: number, arr: T[]) => boolean) ) : boolean {
        return this.index(obj) !== -1;
    }

    /**Does this array contains any of the elements in the passed array */
    hasAny(objs: T[]) : boolean {
        return this.some(o => objs.some(p => p.equals(o)));
    }

    remove(obj: T | ((o : T, i: number, arr: T[]) => boolean) ) : ExtArray<T, U> {
        const i = this.index(obj);
        if(i >= 0) this.splice(i, 1);
        return this;
    }

    filter(predicate:  ((o : T, i: number, arr: T[]) => boolean) ) : ExtArray<T, U> {
        const n = new ExtArray<T, U>();
        this.forEach((...[o, i, arr]) => predicate(o, i, arr) && n.push(o));
        return n;
    }

    map<S>(predicate:  ((o : T, i: number, arr: T[]) => S) ) : S[] {
        const n = new Array<S>();
        this.forEach((...[o, i]) => n.push(predicate(o, i, this)));
        return n;
    }

    // I know kinda not useful, but is used for getting the exact reference of the element to enable mutation to the elements of this array. Since 2 elements can be equal but those 2 is not necessarily on the same location in the memory
    get(obj: T) : T | undefined {
        return this.find(o => o.equals(obj));
    }
}