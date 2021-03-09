/**
 * Locate the index of the greatest value equal or less 
 * than the passed argument.
 * 
 * @param {*} arr 
 * @param {*} value 
 */
const asof = (arr, value, beg, end) => {
    if(arr.length == 0){
        throw new Error(`array is empty`)
    }
    if(value < arr[0]){
        throw new Error(`value ${value} is less than the smallest value of the array`)
    }
    if(beg === undefined){
        beg = 0
    }
    if(end === undefined){
        end = arr.length
    }

    while(beg < end){
        const mid = Math.floor((end + beg) / 2)

        if(arr[mid] < value){
            beg = mid + 1
        }
        else{
            end = mid
        }
    }

    return arr[beg] == value ? arr[beg] : arr[beg - 1]
}

export default { 
    asof
}