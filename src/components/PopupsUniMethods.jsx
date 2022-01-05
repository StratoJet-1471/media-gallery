import React from "react";
import ReactDOM from "react-dom";

import UniPopupTwoButtons from "./UniPopupTwoButtons.jsx";
import UniPopupOneButton from "./UniPopupOneButton.jsx";

/**
 * Класс, поставляющий статические методы для открытия/закрытия универсальных попапов
 */
export default class PopupsUniMethods {
   
    //Открывает универсальный попап с двумя кнопками.
    /*
        Принимаемый аргумент:
        infoObject = {
            button1_ClickHandler: <object Function>, 
            button2_ClickHandler: <object Function>, 
            button1Text: <string>,
            button2Text: <string>,
            bgColor: <string>,
            borderColor: <string>,
            titleText: <string>,
            titleBgColor: <string>,
            titleTextColor: <string>,
            contentStrsArr: [массив строк]
        };
    */
    static openUniPopupTwoButtons(popupRef, popupOwnWrapperRef, popupOwnContainerRef, infoObject) {
        if(!popupRef.current) {
            ReactDOM.render(<div ref={popupOwnWrapperRef}><UniPopupTwoButtons ref={popupRef} infoObject={infoObject}/></div>, popupOwnContainerRef.current);  
        }
        else {
            popupOwnContainerRef.current.appendChild(popupOwnWrapperRef.current);

            popupRef.current.modify(infoObject);
        }        
    }
    
    //Открывает универсальный попап с одной кнопкой.
    /*
        Принимаемый аргумент:
        infoObject = {
            buttonClickHandler: <object Function>, 
            buttonText: <string>,
            bgColor: <string>,
            borderColor: <string>,
            titleText: <string>,
            titleBgColor: <string>,
            titleTextColor: <string>,
            contentStrsArr: [массив строк]
        };
    */    
    static openUniPopupOneButton(popupRef, popupOwnWrapperRef, popupOwnContainerRef, infoObject) {
        if(!popupRef.current) {
            ReactDOM.render(<div ref={popupOwnWrapperRef}><UniPopupOneButton ref={popupRef} infoObject={infoObject}/></div>, popupOwnContainerRef.current);  
        }
        else {
            popupOwnContainerRef.current.appendChild(popupOwnWrapperRef.current);
            popupRef.current.modify(infoObject);
        }        
    }

    static closeUniPopup(popupOwnWrapperRef, popupOwnContainerRef) {
        popupOwnContainerRef.current.removeChild(popupOwnWrapperRef.current);
    }
}