/**
 * Returns true if at least one value is truthy
 * 
 * @param {*} values 
 */
export default function any(values){
    for(let v of values){
        if(v == true) return true
    }
    return false
}