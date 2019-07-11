export function ValueError(message = 'ValueError'){
    this.name    = 'ValueError';
    this.message = message;
    this.stack   = (new Error()).stack();
}

ValueError.prototype = Object.create(Error.prototype);
ValueError.prototype.constructor = ValueError;
