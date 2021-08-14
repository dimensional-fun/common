Reflect.defineProperty(Array.prototype, "isEmpty", {
    get(this: Array<unknown>) {
        return this.length === 0;
    }
});

Array.prototype.removeFirst = function (value) {
    const idx = this.indexOf(value);
    if (idx === -1) {
        return;
    }

    return this.splice(idx, 1)[0];
};
