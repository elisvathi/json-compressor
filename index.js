function isPrimitive(payload) {
    return !payload || (payload.constructor !== Array && payload.constructor !== Object);
}
class KeySet {
    constructor() {
        this._map = {};
        this._size = 0;
    }
    add(item) {
        if (item in this._map) {
            return this._map[item];
        }
        this._map[item] = this._size;
        this._size++;
        return this._size - 1;
    }
    toArray() {
        return Object.entries(this._map).reduce((result, [key, value]) => {
            result[value] = key;
            return result;
        }, []);
    }
}

function compress(data) {
    const keys = new KeySet();

    function inner(data) {
        if (isPrimitive(data)) {
            return data;
        }
        let newData;
        if (data.constructor === Array) {
            newData = data.map(x => {
                return inner(x);
            });
        } else {
            newData = Object.entries(data).reduce((accum, [key, value]) => {
                const keyIndex = keys.add(key);
                accum[keyIndex] = inner(value);
                return accum;
            }, {});
        }
        return newData;
    }
    return {
        data: inner(data),
        keys: keys.toArray(),
    };
}

function decompress(data, keys) {
    if (isPrimitive(data)) {
        return data;
    }
    if(data.constructor === Array){
        return data.map(x=>{
            return decompress(x, keys);
        });
    }
    Object.keys(data).forEach(key => {
        data[keys[key]] = decompress(data[key], keys);
        delete data[key];
    });
    return data;
}

module.exports = {compress, decompress};
