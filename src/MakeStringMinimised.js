/**
 * Используется для создания минимизированного вида строки str с целью помещения её в ограниченный по размерам элемент страницы, например,
 * в попап. Строка-аргумент при этом не изменяется.
 * @param {string} str 
 * @param {number} allowableLength 
 * @returns {string} - новая строка, представляющая собой строку-аргумент, обрезанную до длины allowableLength, и с добавленными
 *  в конце тремя точками.
 */
let makeStringMinimised = function(str, allowableLength) {
    let newStr = str;
    if(newStr.length > allowableLength) newStr = newStr.slice(0, allowableLength-1) + "...";
    return newStr;
};

module.exports = makeStringMinimised;