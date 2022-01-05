/**
 * Удаляет все свойства объекта.
 * @param {object} object 
 */
function deleteObjectProps(object) {
    let keysArr = Object.keys(object);
    let keysArrLength = keysArr.length;
    for(let i=0; i<keysArrLength; i++) {
        let key = keysArr[i];
        delete object[key];
    } 
}
    
module.exports = deleteObjectProps;