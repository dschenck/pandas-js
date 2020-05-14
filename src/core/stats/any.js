export function any(values){
    return values.reduce((prev, curr) => curr ? (prev || true) : (prev || false), false)
}