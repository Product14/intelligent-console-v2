export var addOperation = function addOperation(a, b) {
    var decimalPlacesCount = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
    a = a || 0;
    b = b || 0;
    var num = Math.pow(10, decimalPlacesCount);
    a = Math.floor(a * num);
    b = Math.floor(b * num);
    return (a + b) / num;
};
export var subtractOperation = function subtractOperation(a, b) {
    var decimalPlacesCount = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
    a = a || 0;
    b = b || 0;
    var num = Math.pow(10, decimalPlacesCount);
    a = Math.floor(a * num);
    b = Math.floor(b * num);
    return (a - b) / num;
};
export var multiplicationOperation = function multiplicationOperation(a, b) {
    var decimalPlacesCount = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
    a = a || 0;
    b = b || 0;
    var num = Math.pow(10, decimalPlacesCount);
    a = Math.floor(a * num);
    b = Math.floor(b * num);
    var result = a * b / (num * num);
    return Math.floor(result * 100) / 100;
};
export var divisionOperation = function divisionOperation(a, b) {
    var decimalPlacesCount = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
    a = a || 0;
    b = b || 1;
    var num = Math.pow(10, decimalPlacesCount);
    a = Math.floor(a * num);
    b = Math.floor(b * num);
    // To avoid division by zero
    if (b === 0) {
        throw new Error('Division by zero is not allowed');
    }
    var result = a / b;
    return Math.floor(result * 100) / 100;
};
