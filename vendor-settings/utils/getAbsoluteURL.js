export function absoluteUrl(param) {
    var path = param.path;
    return "".concat(env.NEXT_PUBLIC_APP_URL).concat(path);
}
