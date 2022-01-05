/**
 * @param {Date} date 
 * @param {boolean} forDateParsing - определяет, в каком формате будет возвращаемая строка с датой (если true, то 
 * YYYY-MM-DDTHH:mm:ss - её потом можно распарсить ф-ей Date.parse(); если не true, то YYYY.MM.DD HH:mm:ss).
 * @returns {string} - строка с датой по времени UTC+0.
 */
function createUTCDateStr(date, forDateParsing) { 
    let dateYear = String(date.getUTCFullYear());
    let dateMonth = String(date.getUTCMonth()+1);
    let dateDay = String(date.getUTCDate());
    let dateHours = String(date.getUTCHours());
    let dateMinutes = String(date.getUTCMinutes());
    let dateSeconds = String(date.getUTCSeconds());

    //Числа обязательно д.б. не менее, чем двухзначные.
    if(dateMonth.length==1) dateMonth = "0"+dateMonth;
    if(dateDay.length==1) dateDay = "0"+dateDay;
    if(dateHours.length==1) dateHours = "0"+dateHours;
    if(dateMinutes.length==1) dateMinutes = "0"+dateMinutes;
    if(dateSeconds.length==1) dateSeconds = "0"+dateSeconds;
        
    if(forDateParsing===true)
        return (dateYear + "-" + dateMonth + "-" + dateDay + "T" + dateHours + ":" + dateMinutes + ":" + dateSeconds);
    else
        return (dateYear + "." + dateMonth + "." + dateDay + " " + dateHours + ":" + dateMinutes + ":" + dateSeconds);
}

module.exports = createUTCDateStr;