/**
 * Returns true if all values are truthy
 * 
 * @param {*} values 
 */
export default function all(values){
    for(let v of values){
        if(v == false) return false
    }
    return true
}