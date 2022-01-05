import React from "react";

import { limits as LIMITS,
    namesAndPaths as NAMES_PATHS,
    internalAPI_commandCodes as DO, 
    internalAPI_specialUserIDValues as SPECIAL_UID} from "../ControlsAndAPI.js";

import createCopyingImgUrlReportManager from "./CreateCopyingImgUrlReportManager.jsx";

import "../css/styles_all.css";

/**
 * Используемая терминология:
 *  - "итем" (item) - виртуальная информационная единица, представляющая собой совокупность имени файла-картинки и информации о том, что сейчас 
 * делают с этим файлом через интерфейс управления. Понятия "удаление итема", "переименование итема" эквивалентны удалению и переименованию 
 * соответствующего файла. Но кроме этого, итем может быть выделен (selected) или переведён в недоступное для изменений состояние (diasbled). В
 * последнем случае никакие операции с файлом через интерфейс управления становятся невозможны.
 * Вообще термины "итем" и "картинка, файл" у нас часто подменяют друг друга. Так, когда удобно, мы можем писать "список итемов", а не 
 * "список имён файлов", "итемы текущей папки", а не "файлы из текущей папки". Широко используется понятие "номер итема" - хотя на самом деле
 * это номер имени файла-картинки в упорядоченном списке файлов текущей папки.
 * В ТО ЖЕ ВРЕМЯ под итемом может подразумеваться ДОМ-элемент на странице, содержащий картинку и набор элементов для действий с ней (удаление, 
 * переименование, получение ссылки на ней и т.д.), а также для отображения инфы о ней (название её файла, её порядковый номер в упорядоченном
 * списке картинок из текущей папки и т.д.). 
 */
export default class ShowGallery extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            userID: null, //В этом модуле userID не может принимать значения SPECIAL_UID.unauthorised и другие спец.
            //значения - только реальные ID юзеров.
            itemsOnPage: null,
            itemsAreBeingModified: false, //Если true, значит, в данный момент происходит обновление итемов, и их
            //кнопки должны быть блокированы (не дисаблированы, а просто не производить никаких действий
            //при нажатии).
            //Чекбокс выделения итема, заметим, не нуждается в данном параметре, т.к. он вообще дисаблируется на
            //время модифицирования итема прямо в коде modifyItem().
            
            folder: this.props.infoObject.folder
        };

        /*
        Элемент массива this.itemInfoObjectsArr:
        { 
            itemRef: <ref>,
            backLightRef: <ref>,
            imageRef: <ref>,
            itemNameContainerRef: <ref>,
            itemNameRef: <ref>,
            removingBtnRef: <ref>,
            renamingBtnRef: <ref>,
            copyUrlBtnRef: <ref>,
            itemNumberRef: <ref>,
            checkBoxRef: <ref>,
            copyingUrlReportContRef: <ref>,

            copyingUrlReportManager: <объект copyingUrlReportManager>
        }

        Высвобождение элементов идёт от конца массива к началу. Аналогично, если нужно добавить итем(ы) на страницу, берётся текущее число итемов
        на странице минус один, откладывается от начала массива, и один за другим используются эл-ты массива с индексами больше этого отложенного
         числа.
        */
        this.itemInfoObjectsArr = [];

        this.state.itemsOnPage = this.props.infoObject.visibleItemsFNamesArr.length;
        

        this.selItem = this.selectItem.bind(this);
        this.removingPopup = this.showConfRmvPopupBySingleItem.bind(this);
        this.fRenamePopup = this.showFRenamePopup.bind(this);
        this.getImgLink = this.getImgLinkFunc.bind(this);
        this.enterIFV = this.enterImgFullView.bind(this);

        //ДОМ-элементы:
        this.inputForExecCommandDOMEl = null;

        //РЕФЫ:
        this.itemsListContRef = React.createRef();
        this.inputForExecCommandContainerRef = React.createRef();
    
        this.copyingUrlReportStyles = {
            reportBodyStyle: {
                height: "25px",
                backgroundColor: "green",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: "2px",
                paddingRight: "2px",                
            },
            reportTextStyle: {
                color: "white",
                fontFamily: "Geneva, Arial, Helvetica, sans-serif",
                fontSize: "16px"                
            },
        };    

        if(this.props.infoObject.userID!=SPECIAL_UID.unauthorised && this.props.infoObject.userID!=SPECIAL_UID.signingIn)
            this.state.userID = this.props.infoObject.userID;
    }
    
    /*
    Принимаемый аргумент:
    info = {
        itemNumber: <number>,
        fNamesOnPageArr: <array>,
        indexInItemInfoObjectsArr: <number>,
        selected: <boolean>,
        disabled: <boolean>
    }
    */
    modifyItem(info) {
        const index = info.indexInItemInfoObjectsArr;
        let checkBox = this.itemInfoObjectsArr[index].checkBoxRef.current;

        //Пока итем модифицируется, юзер должен быть лишён возможности воздействовать на чекбокс.
        checkBox.setAttribute("disabled", true);

        const fileUrl = NAMES_PATHS.glrImagesUrlPath + this.state.userID + "/" + encodeURIComponent(this.state.folder) + "/" + encodeURIComponent(info.fNamesOnPageArr[index]);
        
        const imgBackLightElement = this.itemInfoObjectsArr[index].backLightRef.current;
        const image = this.itemInfoObjectsArr[index].imageRef.current;
        const itemNameContainer = this.itemInfoObjectsArr[index].itemNameContainerRef.current;
        const itemNameDOMEl = this.itemInfoObjectsArr[index].itemNameRef.current;
        const removingButton = this.itemInfoObjectsArr[index].removingBtnRef.current;
        const renamingButton = this.itemInfoObjectsArr[index].renamingBtnRef.current;
        const copyUrlButton = this.itemInfoObjectsArr[index].copyUrlBtnRef.current;
        const itemNumberElement = this.itemInfoObjectsArr[index].itemNumberRef.current;        

        imgBackLightElement.setAttribute("itemnumber", info.itemNumber);
        imgBackLightElement.setAttribute("imgname", info.fNamesOnPageArr[index]); 
        image.setAttribute("src", fileUrl);
        image.setAttribute("title", info.fNamesOnPageArr[index]); 
        itemNameContainer.setAttribute("title", info.fNamesOnPageArr[index]); 
        itemNameDOMEl.innerText = info.fNamesOnPageArr[index];
        
        removingButton.setAttribute("name", index); 
        if(info.disabled) removingButton.setAttribute("disabled", true);
        else removingButton.removeAttribute("disabled");
        
        renamingButton.setAttribute("name", index); 
        if(info.disabled) renamingButton.setAttribute("disabled", true); 
        else renamingButton.removeAttribute("disabled");
        
        copyUrlButton.setAttribute("data-url", fileUrl); 
        if(info.disabled) copyUrlButton.setAttribute("disabled", true); 
        else copyUrlButton.removeAttribute("disabled");
        
        itemNumberElement.innerText = info.itemNumber;

        const checked = checkBox.checked;
        if((info.selected && !checked) || (!info.selected && checked)) { 
            //Программная установка/снятие галочки чекбокса. Перед этим его нужно энаблировать.
            checkBox.removeAttribute("disabled");
            checkBox.click();
            if(info.disabled) checkBox.setAttribute("disabled", true);
        }
        else {
            if(!info.disabled) checkBox.removeAttribute("disabled");
        }
        
        checkBox.setAttribute("name", index); 
    }
 
    componentDidMount() {
        const itemsListContainer = this.itemsListContRef.current; 

        for(let i=0; i<LIMITS.maxGlrItemsOnPage; i++) {
            this.itemInfoObjectsArr[i].copyingUrlReportManager.hideCopyReport();
        }    

        for(let i=LIMITS.maxGlrItemsOnPage; i>this.state.itemsOnPage; i--) {
            itemsListContainer.removeChild(this.itemInfoObjectsArr[i-1].itemRef.current);
        }

        this.state.itemsAreBeingModified = true;

        const allItemsObject = this.props.infoObject.allItemsObject;
        const fnamesArr = this.props.infoObject.visibleItemsFNamesArr;
        let itemNumber = this.props.infoObject.startItemNumber;
        for(let i=0; i<this.state.itemsOnPage; i++) {
            const fname = fnamesArr[i];
            const itemSelected = allItemsObject[fname].selected;
            const itemDisabled = allItemsObject[fname].disabled;   
            
            const modifyItemInfo = {
                itemNumber: itemNumber,
                fNamesOnPageArr: fnamesArr,
                indexInItemInfoObjectsArr: i,
                selected: itemSelected,
                disabled: itemDisabled
            };
            this.modifyItem(modifyItemInfo);

            itemNumber++;
        }

        this.state.itemsAreBeingModified = false;
    }
    

    shouldComponentUpdate(newProps) {
        if(newProps.infoObject.userID!=SPECIAL_UID.unauthorised && newProps.infoObject.userID!=SPECIAL_UID.signingIn)
            this.state.userID = newProps.infoObject.userID;

        this.state.itemsAreBeingModified = true;

        const itemsListContainer = this.itemsListContRef.current;
        const newItemsOnPage = newProps.infoObject.visibleItemsFNamesArr.length;

        if(newItemsOnPage < this.state.itemsOnPage) {
            for(let i=this.state.itemsOnPage-1; i>=newItemsOnPage; i--) {
                itemsListContainer.removeChild(this.itemInfoObjectsArr[i].itemRef.current);
            }
        }
        else if(newItemsOnPage > this.state.itemsOnPage) {
            for(let i=this.state.itemsOnPage; i<=newItemsOnPage-1; i++) {
                itemsListContainer.appendChild(this.itemInfoObjectsArr[i].itemRef.current);
            }
        }

        const allItemsObject = newProps.infoObject.allItemsObject;
        const fnamesArr = newProps.infoObject.visibleItemsFNamesArr;
        let itemNumber = newProps.infoObject.startItemNumber;        
        for(let i=0; i<newItemsOnPage; i++) {
            const fname = fnamesArr[i];
            const itemSelected = allItemsObject[fname].selected;
            const itemDisabled = allItemsObject[fname].disabled;   
            
            const modifyItemInfo = {
                itemNumber: itemNumber,
                fNamesOnPageArr: fnamesArr,
                indexInItemInfoObjectsArr: i,
                selected: itemSelected,
                disabled: itemDisabled
            };
            this.modifyItem(modifyItemInfo);

            itemNumber++;            
        }

        this.state.itemsOnPage = newItemsOnPage;
        this.state.itemsAreBeingModified = false;
        
        return false; //Перерисовка ShowGallery не происходит ни при каких обстоятельствах - только видоизменяются
        //итемы и их кол-во.
    }

    showConfRmvPopupBySingleItem(event) {
        if(!this.state.itemsAreBeingModified) {
            const removingItemIndex = Number(event.target['name']);
            const removingFileName = this.props.infoObject.visibleItemsFNamesArr[removingItemIndex];
            const removingItemsArr = [removingFileName]; //Принимающей ф-и this.props.uniTool() нужен массив, даже если файл один. 
            this.props.uniTool(DO.confirmFilesRemoving, removingItemsArr);
        }
    }
    
    showFRenamePopup(event) {
        if(!this.state.itemsAreBeingModified) {
            const renamingItemIndex = Number(event.target['name']);
            const renamingFileName = this.props.infoObject.visibleItemsFNamesArr[renamingItemIndex];
            this.props.uniTool(DO.openFRenamingPopup, renamingFileName);
        }
    }

    getImgLinkFunc(event) {
        //Здесь нужно проверить, не открыт ли уже репорт о копировании ссылки, и если да, то закрыть его.
        //А после операции копирования опять открыть.
        //Поскольку репорт обладает своей функциональностью и свойствами (если мы хотим сделать для него
        //возможность автоматом закрываться через определённое время), то всё-таки желательно сделать для него 
        //какой-то собственный класс... или просто объект с методами? Чего огород городить?
        
        //Используем именно event.currentTarget, а не event.target! Дело в том, что на кнопке изображена 
        //картинка, занимающая всю её площадь, и клик происходит по ней. И event.target указывает на ДОМ-объект
        //картинки, а не кнопки. А вот event.currentTarget - это текущий элемент, поймавший всплывающее
        //событие. См. https://learn.javascript.ru/event-bubbling#tselevoy-element-event-target
        if(!event.currentTarget.disabled && !this.state.itemsAreBeingModified) {
            const copiedUrl = NAMES_PATHS.siteDomain + event.currentTarget.getAttribute("data-url");
            const copyLinkReportObjIndex = Number(event.currentTarget.name);
            if (navigator.clipboard) {
                // поддержка имеется, включить соответствующую функцию проекта.
                navigator.clipboard.writeText(copiedUrl)
                .then(function() {
                    this.itemInfoObjectsArr[copyLinkReportObjIndex].copyingUrlReportManager.showCopyReport();
                }.bind(this)) 
                .catch(function(err){alert(err)}.bind(this));
            } else {
                if(!this.inputForExecCommandDOMEl) this.inputForExecCommandDOMEl = document.createElement('input');
                this.inputForExecCommandContainerRef.current.appendChild(this.inputForExecCommandDOMEl);
                this.inputForExecCommandDOMEl.value = copiedUrl;
                this.inputForExecCommandDOMEl.select();
                document.execCommand('copy');
                this.inputForExecCommandContainerRef.current.removeChild(this.inputForExecCommandDOMEl);
                this.itemInfoObjectsArr[copyLinkReportObjIndex].copyingUrlReportManager.showCopyReport();
            }
        }
    }

    enterImgFullView(event) {
        const itemNumber = Number(event.target.getAttribute("itemnumber"));
        const fname = event.target.getAttribute("imgname");
        this.props.uniTool(DO.enterImgFullView, {"itemNumber": itemNumber, "fileName": fname});
    }



    selectItem(event) {
        event.stopPropagation(); //На всякий случай, прерываем всплытие события. Мало ли, что там, наверху.
        if(!this.state.itemsAreBeingModified) {
            const fnamesArr = this.props.infoObject.visibleItemsFNamesArr;
            const selectedIndex = event.target['name'];
            const selectedFName = fnamesArr[selectedIndex];
            const selected = event.target.checked ? true : false;

            this.props.uniTool(DO.selectGlrItem, {"fileName": selectedFName, "selected": selected});
        }
    }

    render() {
        let itemsArr = [];
        const fnamesArr = this.props.infoObject.visibleItemsFNamesArr;
        let itemNumber = this.props.infoObject.startItemNumber;


        const copyingUrlReportContStyle = {
            position: "absolute",
            top: "-25px",
            width: "100%",

            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start"
        };

        for(let i=0; i<LIMITS.maxGlrItemsOnPage; i++) {
            //let fileUrl = NAMES_PATHS.glrImagesUrlPath + this.props.infoObject.userID + "/" + fnamesArr[i];

            //Ф-я render() вызывается только один раз - при создании ShowGallery. В дальнейшем все изменения в
            //итемах производятся через shouldComponentUpdate(). При первом рендеринге нам не нужно учитывать,
            //какие итемы выделены или disabled - это всё выставляется после рендеринга, в componentDidMount(). 
            //let removeItemBtn = <button name={i} className="showglr__item-manager-btn" onClick={this.removingPopup}>Remove</button>;
            //let renameItemBtn = <button name={i} className="showglr__item-manager-btn" onClick={this.fRenamePopup}>Rename</button>;
            //let selectItemElement = <input name={i} type="checkbox" className="showglr__select-checkbox" onClick={this.selItem}/>;

            //КОНЦЕПЦИЯ:
            //Сначала отрисовывается максимальное кол-во итемов (используем для них одно и то же имя файла) - 
            //просто чтобы сразу получить все ДОМ-объекты итемов. Их всё равно немного, и проще создать их сразу, 
            //даже если они не все немедленно понадобятся, чем писать сложный код и досоздавать их потом.
            //Затем в ф-и удаляем все их из контейнера ".showglr__itemslist-cont" с помощью removeChild(), а 
            //потом добавляем снова по одному нужное кол-во, предварительно модифицируя под нужные данные ф-ей 
            //modifyItem().
            
            const iRef = React.createRef();
            const backLightRef = React.createRef();
            const imageRef = React.createRef();
            const itemNameContainerRef = React.createRef();
            const itemNameRef = React.createRef();
            const removingBtnRef = React.createRef();
            const renamingBtnRef = React.createRef();
            const copyUrlBtnRef = React.createRef();
            const itemNumberRef = React.createRef();
            const checkBoxRef = React.createRef();

            const copyingUrlReportContRef = React.createRef();
            const copyingUrlReportManager = createCopyingImgUrlReportManager(copyingUrlReportContRef, this.copyingUrlReportStyles);

            const itemInfoObject = {
                itemRef: iRef,
                backLightRef: backLightRef,
                imageRef: imageRef,
                itemNameContainerRef: itemNameContainerRef,
                itemNameRef: itemNameRef,
                removingBtnRef: removingBtnRef,
                renamingBtnRef: renamingBtnRef,
                copyUrlBtnRef: copyUrlBtnRef,
                itemNumberRef: itemNumberRef,
                checkBoxRef: checkBoxRef,
                copyingUrlReportContRef: copyingUrlReportContRef,

                copyingUrlReportManager: copyingUrlReportManager
            };
            
            this.itemInfoObjectsArr.push(itemInfoObject);

            itemsArr.push(
            <div key={i} ref={iRef} className="showglr__item-cont">
                <div className="showglr__item-wrapper">                    
                
                    <div ref={backLightRef} className="showglr__item_backlight" itemnumber={itemNumber} imgname={fnamesArr[0]} onClick={this.enterIFV}>
                        <img ref={imageRef} className="showglr__item-img" src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.showGalleryItemDefaultImg} title={"Картинка по умолчанию"}/>
                    </div>
                        
                    <div ref={itemNameContainerRef} className="showglr__itemname-cont" title={"Картинка по умолчанию"}>
                        <span ref={itemNameRef} className="showglr__itemname-text">Картинка по умолчанию</span>
                    </div>
                        
                    <div className="showglr__item-manager">
                        <div ref={copyingUrlReportContRef} style={copyingUrlReportContStyle}>
                            {copyingUrlReportManager.createReportElement()}
                        </div>                        
                        
                        <div className="showglr__removing-btn-cont">
                            <button ref={removingBtnRef} name={i} tabIndex="-1" className="showglr__item-manager-btn" onClick={this.removingPopup} title="Удалить файл">Remove</button>
                        </div>
                            
                        <div className="showglr__renaming-btn-cont">
                            <button ref={renamingBtnRef} name={i} tabIndex="-1" className="showglr__item-manager-btn" onClick={this.fRenamePopup} title="Переименовать файл">Rename</button>
                        </div>
                        
                        <div className="showglr__getlink-btn-cont">
                            <button ref={copyUrlBtnRef} name={i} tabIndex="-1" className="showglr__item-manager-btn" data-url={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.showGalleryItemDefaultImg} onClick={this.getImgLink} title="Копировать URL исходной картинки">
                                <img src={NAMES_PATHS.designElementsUrlPath + "Icon-link-on-btn.png"}/>
                            </button>
                        </div>
                        
                            
                        <div className="showglr__itemnumber-cont">
                            <span ref={itemNumberRef} className="showglr__itemnumber-text">{itemNumber}</span>
                        </div>

                        <div className="showglr__select-checkbox-cont">
                            <input ref={checkBoxRef} name={i} tabIndex="-1" type="checkbox" className="showglr__select-checkbox" onClick={this.selItem}/>
                        </div>
                    </div>                        
                </div>
            </div>);
            
            itemNumber++;
        }

        return (
            <div className="showglr">
                <div ref={this.inputForExecCommandContainerRef}></div>
                <div ref={this.itemsListContRef} className="showglr__itemslist-cont">
                    {itemsArr}
                </div>
            </div>);                
    }
}