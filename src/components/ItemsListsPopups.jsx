import React from "react";
import ReactDOM from "react-dom";

import MyDraggable from "./MyDraggable.jsx";

import { limits as LIMITS,
    namesAndPaths as NAMES_PATHS} from "../ControlsAndAPI.js";

import makeStringMinimised from "../MakeStringMinimised.js";

import "../css/styles_all.css";

/**
 * Кратко о модуле:
 * класс ILPopups не является компонентом React. Он создан для облегчения управлениями FIL- и SIL-попапами, с учётом того, что контенты этих
 * попапов взаимозависимы. Объект класса ILPopups создаётся в Gallery или ImageFullView; извне ему передаются рефы контейнеров, в которых нужно
 * отрендерить попапы, объект с итемами, функции-обработчики событий элементов попапа (для выделения итемов через попап, для перемещения посредством
 * кнопок попапа по страницам Галереи или для скроллинга между итемами в ImageFullView), а также ф-я, которая должна выполниться после закрытия попапа.
 * Отрендерив попапы в переданных контейнерах, ILPopups далее занимается добавлением, удалением и модифицированием строк списков итемов в этих попапах.
 * 
 * Используемая терминология:
 *  - "итем" (item) - виртуальная информационная единица, представляющая собой совокупность имени файла-картинки и информации о том, что сейчас 
 * делают с этим файлом через интерфейс управления. Понятия "удаление итема", "переименование итема" эквивалентны удалению и переименованию 
 * соответствующего файла. Но кроме этого, итем может быть выделен (selected) или переведён в недоступное для изменений состояние (diasbled). В
 * последнем случае никакие операции с файлом через интерфейс управления становятся невозможны.
 * 
 * Принятые сокращения:
 * FIL - от Full Items List;
 * SIL - от Selected Items List;
 * IL - от Items List;
 * ...El - от Element (например, operativeRowsDOMElsArr - от operativeRowsDOMElementsArr).
 */



export default class ILPopups {
    constructor(infoObject) {
        /*
        infoObject = {
            FILPopupContainerRef: <ref>, //Реф контейнера, в котором нужно отрендерить, и впоследствии удалять из него или добавлять в него FIL-попап.
            SILPopupContainerRef: <ref>, //Аналогично для SIL-попапа.
            itemsObject: <object>, //Объект с итемами.
            moveToItemViaPopupFunc: <object Function>, //Функция для перемещения на страницу указанного в строке итема в Галерее или скроллинга к нему в ImageFullView.
            selectItemFunc: <object Function>, //Функция для выделения итемов через попап.
            onClosePopupFunc: <object Function>, //Функция, которая вызовется после закрытия попапа.
        }
        */
        this.FILPopupContainerRef = infoObject.FILPopupContainerRef;
        this.SILPopupContainerRef = infoObject.SILPopupContainerRef;

        this.itemsObject = infoObject.itemsObject;
        this.moveToItemViaPopupFunc = infoObject.moveToItemViaPopupFunc;
        this.selectItemFunc = infoObject.selectItemFunc;
        this.onClosePopupFunc = infoObject.onClosePopupFunc;


        this.fNamesArr = null;
        
        this.popupIsBeingModified = false; //Если true, значит, в настоящий момент происходит программное обновление
        //текущего попапа. Параметр используется, в частности, для того, чтобы обрабатывать программные клики по чекбоксам,  
        //устраняя ненужные реакции на это в обработчике кликов.

        this.itemNumberContainerWidth = 30;
        this.itemNumberTextMarginLeft = 5;
        this.checkBoxContainerWidth = 25;
        this.fileNameContainerWidth = 150;
        this.fileNameTextMarginLeft = 2;
        this.fileNameTextMarginRight = 5;
        this.ILRowButtonWidth = 90;
        this.ILRowButtonMarginRight = 5;
        this.ILPopupListWidth = this.itemNumberContainerWidth + this.checkBoxContainerWidth + this.fileNameContainerWidth + this.ILRowButtonWidth + this.ILRowButtonMarginRight + 10; //+10 - запас ширины на всякий случай.
        
        this.minFileNameContainerWidth = 150;
        
        this.itemNumberContainerStyles = {
            width: this.itemNumberContainerWidth + "px",
        }
        this.itemNumberTextStyles = {
            marginLeft: this.itemNumberTextMarginLeft + "px"
        }
        this.checkBoxContainerStyles = {
            width: this.checkBoxContainerWidth + "px"
        }
        this.fileNameContainerStyles = {
            width: this.fileNameContainerWidth + "px"
        }
        this.fileNameTextStyles = {
            marginLeft: this.fileNameTextMarginLeft + "px",
            marginRight: this.fileNameTextMarginLeft + "px"
        }
        this.ILRowButtonStyles = {
            width: this.ILRowButtonWidth + "px",
            marginRight: this.ILRowButtonMarginRight + "px" //Чтобы кнопки не прижимались прямо к правому краю.
        }

        /**
         * Стили для "корпуса" попапа Full Items List.
         */        
        this.FILPopupBodyStyles = {
            backgroundColor: "rgb(90, 94, 190)",
            borderColor: "rgb(0, 114, 200)",
        };
        
        /**
         * Стили для самого списка итемов в попапе Full Items List.
         */
        this.FILPopupListStyles = {
            backgroundColor: "rgb(90, 144, 255)",
            maxHeight: "400px",
            width: this.ILPopupListWidth + "px"
        };        

        /**
         * Стили для "корпуса" попапа Selected Items List.
         */
        this.SILPopupBodyStyles = {
            backgroundColor: "rgb(139, 0, 0)",
            borderColor: "rgb(248, 187, 117)"
        };
        
        /**
         * Стили для самого списка итемов в попапе Selected Items List.
         */
        this.SILPopupListStyles = {
            backgroundColor: "rgb(233, 7, 7)",
            maxHeight: "400px",
            width: this.ILPopupListWidth + "px" 
        };   

        this.moveTo = this.movingFunc.bind(this);
        this.selItem = this.selectItem.bind(this);
        this.touchChB = this.touchCheckBox.bind(this);
        this.selectAllInFILPopup = this.selectAllInFILPopup.bind(this);
        this.selectAllInSILPopup = this.selectAllInSILPopup.bind(this);
        this.clearAllInFILPopup = this.clearAllInFILPopup.bind(this);
        this.clearAllInSILPopup = this.clearAllInSILPopup.bind(this);
        this.closeFILPopup = this.closeFILPopup.bind(this);
        this.closeSILPopup = this.closeSILPopup.bind(this);
        
        //РЕФЫ:
        this.FILPopupRef = React.createRef(); 
        this.SILPopupRef = React.createRef(); 
        this.FILPopupItemsListRef = React.createRef();
        this.SILPopupItemsListRef = React.createRef();

        //Вспомогательный объект, задающий правила, по которым метод встроенного класса Intl (от International) Intl.compare()
        //будет сравнивать строки (это далее используется в методе Array.prototype.sort()). Эти правила позволят сортировать
        //массив с названиями файлов в привычном человеку виде, строго по алфавиту.
        this.stringComparsionRulesCollator = new Intl.Collator(["en-GB", "ru"], {numeric: true});
        
        ReactDOM.render(this.createILPopupBodyHTML(this.FLAG_POPUP_IS_FIL), this.FILPopupContainerRef.current, function(){
            this.FILPopupContainerRef.current.removeChild(this.FILPopupRef.current);
        }.bind(this));
        ReactDOM.render(this.createILPopupBodyHTML(this.FLAG_POPUP_IS_SIL), this.SILPopupContainerRef.current, function(){
            this.SILPopupContainerRef.current.removeChild(this.SILPopupRef.current);
        }.bind(this));
    }

    /**
     * Константы - значения параметров flag в методах класса.
     * @type: {number}
     */
    get FLAG_POPUP_IS_FIL() { //Значение, показывающее, что работать следует с попапом FIL.
        return 2;
    }
    get FLAG_POPUP_IS_SIL() { //Значение, показывающее, что работать следует с попапом SIL.
        return 3;
    }
    get FLAG_SELECT() { //Значение, показывающее, что нужно выделять итемы.
        return 4;
    }
    get FLAG_DESELECT() { //Значение, показывающее, что нужно снимать выделение с итемов.
        return 5;
    }
    get FLAG_BTN_IS_SROLLTO() { //Значение, показывающее, что в строке попапа нужно создать 
    //кнопку, которая будет вызывать скроллинг к итему, указанному в этой строке.
        return 6;
    }
    get FLAG_BTN_IS_GOTOPAGE() { //Значение, показывающее, что в строке попапа нужно создать 
        //кнопку, которая будет вызывать переход на страницу Галареи, на которой находится указанный в строке итем.
        return 7;
    }

    
    //Этот метод создаёт HTML-код "пустых", без элементов-строк, FIL- и SIL-попапов.    
    createILPopupBodyHTML(flag) {
        let isTouchDevice = !!('ontouchstart' in window);

        if(flag==this.FLAG_POPUP_IS_FIL) {
            let titleEl;
            if(isTouchDevice) {
                titleEl = (
                <div style={{marginTop: "10px", marginBottom: "5px"}}>
                    <span style={{color: "yellow", backgroundColor: "rgb(0,0,128)", marginRight: "10px"}} className="popup-itemslist-draghook">DRAG</span>
                    <span className="popup-itemslist-d-text">Full list of files:</span>
                </div>);
            }
            else {
                titleEl = <span className="popup-itemslist-d-text">Full list of files:</span>;
            }

            return (
            <div ref={this.FILPopupRef} className="popup-universal-bg">
                <MyDraggable cancel=".popup-itemslist-list">
                    <div style={this.FILPopupBodyStyles} className="popup-itemslist">
                        <div className="popup-itemslist-content">
                            {titleEl}
                            <div ref={this.FILPopupItemsListRef} style={this.FILPopupListStyles} className="popup-itemslist-list">

                            </div>
                            <div className="popup-universal-centering-container">
                                <button tabIndex="-1" className="popup-universal-button" onTouchEnd={this.selectAllInFILPopup} onClick={this.selectAllInFILPopup}>Select all</button>
                                <button tabIndex="-1" className="popup-universal-button" onTouchEnd={this.clearAllInFILPopup} onClick={this.clearAllInFILPopup}>Clear all</button>
                            </div>
                        </div>
                        <div className="popup-closeicon-container">
                            <img className="popup-closeicon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-lighted.png"} onTouchEnd={this.closeFILPopup} onClick={this.closeFILPopup}/>
                        </div>
                    </div>
                </MyDraggable>
            </div>); 
        }
        else if(flag==this.FLAG_POPUP_IS_SIL) {
            let titleEl;
            if(isTouchDevice) {
                titleEl = (
                <div style={{marginTop: "10px", marginBottom: "5px"}}>
                    <span style={{color: "yellow", backgroundColor: "rgb(0,0,128)", marginRight: "10px"}} className="popup-itemslist-draghook">DRAG</span>
                    <span className="popup-itemslist-d-text">Full list of files:</span>
                </div>);
            }
            else {
                titleEl = <span className="popup-itemslist-d-text">Full list of files:</span>;
            }

            return (
            <div ref={this.SILPopupRef} className="popup-universal-bg">
                <MyDraggable cancel=".popup-itemslist-list">
                    <div style={this.SILPopupBodyStyles} className="popup-itemslist">
                        <div className="popup-itemslist-content">
                            {titleEl}
                            <div ref={this.SILPopupItemsListRef} style={this.SILPopupListStyles} className="popup-itemslist-list">
                            
                            </div>
                            <div className="popup-universal-centering-container">
                                <button className="popup-universal-button" onTouchEnd={this.selectAllInSILPopup} onClick={this.selectAllInSILPopup}>Select all</button>
                                <button className="popup-universal-button" onTouchEnd={this.clearAllInSILPopup} onClick={this.clearAllInSILPopup}>Clear all</button>
                            </div>
                        </div>
                        <div className="popup-closeicon-container">
                            <img className="popup-closeicon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-lighted.png"} onTouchEnd={this.closeSILPopup} onClick={this.closeSILPopup}/>
                        </div>
                    </div>
                </MyDraggable>
            </div>); 
        }
        else return null;
    }
    

    //Создаёт HTML-код строки в списке попапа. Аргумент indexInFNamesArr - индекс в this.fNamesArr.
    createItemsListRowHTML(flag, indexInFNamesArr) {
        if(indexInFNamesArr===undefined) indexInFNamesArr = 0;
        
        let buttonClickHandler = this.moveTo;
        let buttonText;
        if(flag==this.FLAG_BTN_IS_SROLLTO) buttonText = "Scroll to";
        else if(flag==this.FLAG_BTN_IS_GOTOPAGE) buttonText = "Go to page";
        else return;

        let buttonElement = <button name={indexInFNamesArr} tabIndex="-1" style={this.ILRowButtonStyles} className="popup-itemslist-button" onTouchEnd={buttonClickHandler} onClick={buttonClickHandler}>{buttonText}</button>;
            
        
        let fileName = this.fNamesArr[indexInFNamesArr];
        let allowableFileName = makeStringMinimised(fileName, LIMITS.inPopup_fNameMaxLength);

        return (
        <React.Fragment>
            <div style={this.itemNumberContainerStyles} className="popup-itemslist-itemnumber-container">
                <span style={this.itemNumberTextStyles} className="popup-itemslist-element-text" title={indexInFNamesArr+1}>{indexInFNamesArr+1}</span>
            </div>
            <div style={this.checkBoxContainerStyles}>
                <input name={indexInFNamesArr} type="checkbox" tabIndex="-1" className="popup-itemslist-checkbox" onClick={this.selItem} onTouchEnd={this.touchChB}/>
            </div>
            <div style={this.fileNameContainerStyles} className="popup-itemslist-filename-container">
                <span style={this.fileNameTextStyles} className="popup-itemslist-element-text" title={fileName}>{allowableFileName}</span>
            </div>
            <div>
                {buttonElement}
            </div>
        </React.Fragment>);
    }

    //Подгоняет ширину попапа и его элементов под имена итемов и их номера.
    adaptPopupElementsWidth(flag) {
        let operativePopupList, operativeRowsDOMElsArr;
        let symbolWidth = 10;
        let maxFNameStringLength = 0;
        let maxItemNumberStringLength = 0;
        
        if(flag==this.FLAG_POPUP_IS_FIL) operativePopupList = this.FILPopupItemsListRef.current;
        else if(flag==this.FLAG_POPUP_IS_SIL) operativePopupList = this.SILPopupItemsListRef.current;
        else return;
            
        operativeRowsDOMElsArr = operativePopupList.querySelectorAll(".popup-itemslist-list-element");
        let rowsArrLength = operativeRowsDOMElsArr.length;

        for(let i=0; i<rowsArrLength; i++) {
            let currentItemNumberStr = operativeRowsDOMElsArr[i].querySelector(".popup-itemslist-itemnumber-container .popup-itemslist-element-text").innerText;
            let currentFNameStr = operativeRowsDOMElsArr[i].querySelector(".popup-itemslist-filename-container .popup-itemslist-element-text").innerText;
            if(currentItemNumberStr.length > maxItemNumberStringLength) maxItemNumberStringLength = currentItemNumberStr.length;
            if(currentFNameStr.length > maxFNameStringLength) maxFNameStringLength = currentFNameStr.length;
        }
        
        let itemNumberContainerWidth = maxItemNumberStringLength*symbolWidth + this.itemNumberTextMarginLeft;
        let fileNameContainerWidth = maxFNameStringLength*symbolWidth + this.fileNameTextMarginLeft + this.fileNameTextMarginRight;

        if(fileNameContainerWidth < this.minFileNameContainerWidth) fileNameContainerWidth = this.minFileNameContainerWidth;

        let ILPopupListWidth = itemNumberContainerWidth + this.checkBoxContainerWidth + fileNameContainerWidth + this.ILRowButtonWidth + this.ILRowButtonMarginRight;
        
        operativePopupList.style.width = ILPopupListWidth + "px";
        
        for(let i=0; i<rowsArrLength; i++) {
            let currentItemNContainer = operativeRowsDOMElsArr[i].querySelector(".popup-itemslist-itemnumber-container");
            let currentFNameContainer = operativeRowsDOMElsArr[i].querySelector(".popup-itemslist-filename-container");
            
            currentItemNContainer.style.width = itemNumberContainerWidth + "px";
            currentFNameContainer.style.width = fileNameContainerWidth + "px";
        }
        
    }

    openFILPopupInGallery() {
        this.openILPopup(this.FLAG_POPUP_IS_FIL, this.FLAG_BTN_IS_GOTOPAGE);
    }
    
    openSILPopupInGallery() {
        this.openILPopup(this.FLAG_POPUP_IS_SIL, this.FLAG_BTN_IS_GOTOPAGE);
    }
    
    openFILPopupInImageFullView() {
        this.openILPopup(this.FLAG_POPUP_IS_FIL, this.FLAG_BTN_IS_SROLLTO);
    }
    
    openSILPopupInImageFullView() {
        this.openILPopup(this.FLAG_POPUP_IS_SIL, this.FLAG_BTN_IS_SROLLTO);
    }


    async renderILRow(rowHTML, row) {
        let ret = new Promise(function(resolve, reject) {
            ReactDOM.render(rowHTML, row, function(){resolve();});
        });

        return ret;
    }
    
    openILPopup(flag_FIL_or_SIL, flag_btnsTitles) {
        //flag_FIL_or_SIL определяет, какой попап показывается - FIL или SIL. 
        //flag_btnsTitles определяет, будет на кнопках в строках списка написано "Scroll to" или "Go to Page".
        
        //mainPopup и mainPopupList относятся к тому попапу, который сейчас выведен. SecondaryPopupList - объект
        //из второго попапа, который сейчас закрыт (всего их, напомню, 2 - this.FILPopupRef.current (полный список итемов)
        //и this.SILPopupRef.current (список выделенных итемов)).
        //При вызове ф-и определяется, сколько строк нужно выведенному попапу, и сколько он уже содержит (только что
        //созданный - разумеется, 0). Если он содержит меньше, чем нужно, то сначала будет произведён поиск во втором
        //попапе - имеющиеся в нём строки будут по одной удаляться из него и добавляться в выведенный попап до тех пор,
        //пока не кончатся, или пока в выведенном попапе не окажется, сколько нужно. Если строк из второго попапа 
        //не хватит, то оставшиеся будут созданы и добавлены в выведенный попап (сначала ф-ей document.createElement("div")
        //создаётся контейнер, потом в нём ф-ей this.renderILRow() рендерится строка, потом контейнер добавляется
        //в попап.
        //Если же в выведенном попапе строк больше, чем нужно, лишние по одной будут удалены из него и добавлены
        //во второй попап.
        //Таким образом, строки всё время хранятся в объектах попапов (точнее, в их подобъектах ..PopupList) и 
        //просто перемещаются по мере надобности из одного в другой. 
        //После того, как выведенный попап заполнен необходимым числом строк, все они модифицируются, чтобы
        //в них оказались нужные данные (ф-я this.modifyILRow()).
        let mainPopup, mainPopupList, secondaryPopupList;
        let needRowsN;
        let currentRowsN;

        this.fNamesArr = Object.keys(this.itemsObject).sort(this.stringComparsionRulesCollator.compare);
        
        //Находим выделенные итемы.
        let fNamesArrLength = this.fNamesArr.length;
        let selectedFNamesIndexesArr = [];
        for(let i=0; i<fNamesArrLength; i++) {
            let fname = this.fNamesArr[i];
            if(this.itemsObject[fname].selected) selectedFNamesIndexesArr.push(i);
        }
        
        if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_FIL) {
            mainPopup = this.FILPopupRef.current;
            mainPopupList = this.FILPopupItemsListRef.current;
            secondaryPopupList = this.SILPopupItemsListRef.current;
            
            needRowsN = this.fNamesArr.length;
        }
        else if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_SIL) {
            mainPopup = this.SILPopupRef.current;
            mainPopupList = this.SILPopupItemsListRef.current;
            secondaryPopupList = this.FILPopupItemsListRef.current;
            
            needRowsN = selectedFNamesIndexesArr.length;
        }
        
        currentRowsN = mainPopupList.querySelectorAll(".popup-itemslist-list-element").length;
        
        this.popupIsBeingModified = true;
        
        if(needRowsN > currentRowsN) {
            let availableExistingRowsN = 0;
            if(secondaryPopupList) availableExistingRowsN = secondaryPopupList.querySelectorAll(".popup-itemslist-list-element").length;
            
            while(availableExistingRowsN > 0) {
                let row = secondaryPopupList.querySelector(".popup-itemslist-list-element");
                secondaryPopupList.removeChild(row);
                mainPopupList.appendChild(row);
                
                availableExistingRowsN--;
                currentRowsN++;
                if(currentRowsN==needRowsN) break;
            }

            //Нужно сделать так, чтобы контейнеры, в которых рендерятся строки, были добавлены в
            //список только по окончании рендеринга всех строк. Поэтому мы создаём массив промисов rowRenderingPromisesArr,
            //заполняем его промисами рендеринга строк (для создания таких промисов нам пришлось сделать отдельную
            //асинхронную ф-ю renderILRow, внутри которой вызывается ReactDOM.render()) и затем используем
            //Promise.all(rowRenderingPromisesArr).then(function(){ ЗДЕСЬ - ДОБАВЛЕНИЕ ВСЕХ КОНТЕЙНЕРОВ С ОТРЕНДЕРЕННЫМИ
            //СТРОКАМИ В СПИСОК и всё остальное}). Массив контейнеров newRowsContainersArr нужен нам именно для 
            //того, чтобы добавить контейнеры, прогнав его через цикл.
            let newRowsContainersArr = [];
            let rowRenderingPromisesArr = [];
            
            while(currentRowsN < needRowsN) {
                let row = document.createElement("div");

                row.setAttribute("name", String(currentRowsN));
                row.setAttribute("class", "popup-itemslist-list-element");
                
                newRowsContainersArr.push(row);
                rowRenderingPromisesArr.push(this.renderILRow(this.createItemsListRowHTML(flag_btnsTitles), row));
                
                currentRowsN++;
            }
            
            Promise.all(rowRenderingPromisesArr).
            then(function(){

                let rowsContainersN = newRowsContainersArr.length;
                for(let i=0; i<rowsContainersN; i++) {
                    mainPopupList.appendChild(newRowsContainersArr[i]);
                }

                //Мы специально занимаемся модифицированием строк ещё до вывода попапа на экран (т.е., до добавления его в ДОМ-дерево).
                //В это случае программные клики по чекбоксам в строках (внутри ф-и this.modifyILRow()) будут ставить/снимать
                //галочки, но не будут вызывать обработчик клика - а он нам здесь и не нужен.
                let rowsArr = mainPopupList.querySelectorAll(".popup-itemslist-list-element");
                let rowsN = rowsArr.length;
                for(let i=0; i<rowsN; i++) {
                    if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_FIL) this.modifyILRow(rowsArr[i], i);
                    else if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_SIL) {
                        let index = selectedFNamesIndexesArr[i];
                        this.modifyILRow(rowsArr[i], index);
                    }
                }
                this.popupIsBeingModified = false;

                //Вывод попапа на экран
                if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_FIL) this.FILPopupContainerRef.current.appendChild(mainPopup);
                else if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_SIL) this.SILPopupContainerRef.current.appendChild(mainPopup);

                this.adaptPopupElementsWidth(flag_FIL_or_SIL);
                
            }.bind(this));
        }
        else if(needRowsN <= currentRowsN) {
            while(needRowsN < currentRowsN) {
                let row = mainPopupList.querySelector(".popup-itemslist-list-element");
                mainPopupList.removeChild(row);
                secondaryPopupList.appendChild(row);
                currentRowsN--;
            }

            //Мы специально занимаемся модифицированием строк ещё до вывода попапа на экран (т.е., до добавления его в ДОМ-дерево).
            //В это случае программные клики по чекбоксам в строках (внутри ф-и modifyILRow()) будут ставить/снимать
            //галочки, но не будут вызывать обработчик клика - а он нам здесь и не нужен.
            let rowsArr = mainPopupList.querySelectorAll(".popup-itemslist-list-element");
            let rowsN = rowsArr.length;
            for(let i=0; i<rowsN; i++) {
                if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_FIL) this.modifyILRow(rowsArr[i], i);
                else if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_SIL) {
                    let index = selectedFNamesIndexesArr[i];
                    this.modifyILRow(rowsArr[i], index);
                }
            }
            this.popupIsBeingModified = false;

            //Вывод попапа на экран
            if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_FIL) this.FILPopupContainerRef.current.appendChild(mainPopup);
            else if(flag_FIL_or_SIL==this.FLAG_POPUP_IS_SIL) this.SILPopupContainerRef.current.appendChild(mainPopup);

            this.adaptPopupElementsWidth(flag_FIL_or_SIL);
        }
    }

    //Приводим содержимое элемента rowDOMEl в соответствие с данными итема, соответствующего файлу this.fNamesArr[indexInFNamesArr].
    modifyILRow(rowDOMEl, indexInFNamesArr) {
        let fileName = this.fNamesArr[indexInFNamesArr];
        let allowableFileName = makeStringMinimised(fileName, LIMITS.inPopup_fNameMaxLength);
        
        let itemNumberDOMEl = rowDOMEl.querySelector(".popup-itemslist-itemnumber-container .popup-itemslist-element-text");
        let checkBoxDOMEl = rowDOMEl.querySelector(".popup-itemslist-checkbox");
        let fnameDOMEl = rowDOMEl.querySelector(".popup-itemslist-filename-container .popup-itemslist-element-text");
        let buttonDOMEl = rowDOMEl.querySelector(".popup-itemslist-button");
        
        let itemNumber = indexInFNamesArr+1;
        itemNumberDOMEl.setAttribute("title", itemNumber);
        itemNumberDOMEl.innerText = itemNumber;
        
        checkBoxDOMEl.setAttribute("name", indexInFNamesArr);
       
        fnameDOMEl.setAttribute("title", fileName);
        fnameDOMEl.innerText = allowableFileName;
        
        buttonDOMEl.setAttribute("name", itemNumber);
        rowDOMEl.setAttribute("name", indexInFNamesArr);

        if(this.itemsObject[fileName].selected) {                        
            if(checkBoxDOMEl.checked==false) {
                if(checkBoxDOMEl.getAttribute("disabled")) 
                    checkBoxDOMEl.removeAttribute("disabled"); //Иначе не удастся поставить галочку.
                checkBoxDOMEl.click(); //Ставим галочку, если её нет.
                //Программный клик по чек-боксу не вызовет ф-ю-обработчик, если попап в этот момент находится
                //вне ДОМ-дерева (куда его ещё надо включить ф-ей appendChild()). Обработчик нам здесь и не нужен.
                //Мы упоминаем об этой ситуации в комментах в коде openILPopup().
            }
        }
        else {
            if(checkBoxDOMEl.checked==true) {
                if(checkBoxDOMEl.getAttribute("disabled")) 
                    checkBoxDOMEl.removeAttribute("disabled"); ////Иначе не удастся снять галочку.
                checkBoxDOMEl.click(); //Снимаем галочку, если она стоит.
            }
        }        

        if(this.itemsObject[fileName].disabled) {
            checkBoxDOMEl.setAttribute("disabled", true);
            buttonDOMEl.setAttribute("disabled", true);
        }
        else {
            checkBoxDOMEl.removeAttribute("disabled");
            buttonDOMEl.removeAttribute("disabled");
        }

    }

    selectOrClearAllItemsInPopup(itemsListDOMEl, flag) {
        let elementsArr = itemsListDOMEl.querySelectorAll(".popup-itemslist-list-element");
        for(let i=0; i<elementsArr.length; i++) {
            let checkBoxDOMEl = elementsArr[i].querySelector(".popup-itemslist-checkbox");
            let disabled = checkBoxDOMEl.getAttribute("disabled");
            if(!disabled) {
                let selected = checkBoxDOMEl.checked;
                if(flag==this.FLAG_SELECT) {
                    if(!selected) checkBoxDOMEl.click();
                }
                else if(flag==this.FLAG_DESELECT) { 
                    if(selected) checkBoxDOMEl.click();
                }
            }
        }
    }
    
    movingFunc(event) {
        let itemNumber = Number(event.target['name']);
        this.moveToItemViaPopupFunc(itemNumber);
    }
    
    selectItem(event)
    {        
        let itemNumber = Number(event.target['name']) + 1;
        let fname = this.fNamesArr[itemNumber-1];
        let selected = event.target.checked ? true : false;
        if(!this.popupIsBeingModified) this.selectItemFunc(fname, selected, itemNumber);
    }

    touchCheckBox(event) {
        event.stopPropagation();
        event.preventDefault();
        event.target.click();
    }

    selectAllInFILPopup(event) {
       this.selectOrClearAllItemsInPopup(this.FILPopupItemsListRef.current, this.FLAG_SELECT);
    }
    
    clearAllInFILPopup(event) {
       this.selectOrClearAllItemsInPopup(this.FILPopupItemsListRef.current, this.FLAG_DESELECT);
    }
    
    selectAllInSILPopup(event) {
       this.selectOrClearAllItemsInPopup(this.SILPopupItemsListRef.current, this.FLAG_SELECT);
    }
    
    clearAllInSILPopup(event) {
       this.selectOrClearAllItemsInPopup(this.SILPopupItemsListRef.current, this.FLAG_DESELECT);
    }


    universalClosePopup(flag) {
        if(flag==this.FLAG_POPUP_IS_FIL) this.FILPopupContainerRef.current.removeChild(this.FILPopupRef.current);
        else if(flag==this.FLAG_POPUP_IS_SIL) this.SILPopupContainerRef.current.removeChild(this.SILPopupRef.current);
        if(this.onClosePopupFunc) this.onClosePopupFunc();
    }
    
    closeSILPopup(event) {
        this.universalClosePopup(this.FLAG_POPUP_IS_SIL);
    }
    
    closeFILPopup(event) {
        this.universalClosePopup(this.FLAG_POPUP_IS_FIL);
    }  

}