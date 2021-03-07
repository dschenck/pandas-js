/**
 * Locate the insertion point for value in arr to maintain sorted order.
 *
 * @param {*} arr 
 * @param {*} value 
 */
const bisect = (arr, value, beg, end) => {
    if(value < arr[0]){
        return 0
    }
    if(value > arr[arr.length - 1]){
        return arr.length
    }
    if(beg === undefined){
        beg = 0
    }
    if(end === undefined){
        end = arr.length - 1
    }

    while((end - beg) > 0){
        //compute middle position
        let mid = Math.floor((beg + end) / 2)
        
        if(arr[mid] == value){
            return mid
        }
        if(arr[mid] > value){
            end = mid - 1
        }
        else{
            beg = mid + 1
        }
    }
    return end
}

export default { 
    bisect
}