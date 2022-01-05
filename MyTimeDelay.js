/**
 * 
 * @param {number} milliseconds 
 */
function myTimeDelay(milliseconds) {
    //Источник - https://mnogoblog.ru/funkciya-zaderzhki-pauzy-v-javascript-delay-sleep-pause-wait
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);   
}

module.exports = myTimeDelay;