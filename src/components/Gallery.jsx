import React from "react";
import ReactDOM from "react-dom";

import MyDraggable from "./MyDraggable.jsx";
import UplDropzone from "./UplDropzone.jsx";
import ShowGallery from "./ShowGallery.jsx";
import LinksToPagesBlock from "./LinksToPagesBlock.jsx";
import ImageFullView from "./ImageFullView.jsx";

import "../css/styles_all.css";

import ILPopups from "./ItemsListsPopups.jsx";
import ItemsManagerButtonsBlock from "./ItemsManagerButtonsBlock.jsx";
import PopupsUniMethods from "./PopupsUniMethods.jsx";

import deleteObjectProps from "./DeleteObjectProps.js";
import makeStringMinimised from "../MakeStringMinimised.js";

import {limits as LIMITS,
    defaults as DEFAULTS,
    namesAndPaths as NAMES_PATHS,
    internalAPI_filesOperationStatusCodes as FO_STATUS,
    internalAPI_fetchUrls as F_URL, 
    internalAPI_commandCodes as DO,
    internalAPI_errorCodes as ERR_ID,
    internalAPI_flags as FLAG, 
    internalAPI_specialUserIDValues as SPECIAL_UID} from "../ControlsAndAPI.js";

export default class Gallery extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            previousUserID: this.props.infoObject.userInfoObject.userID,
            userInfoObject: {
                userID: this.props.infoObject.userInfoObject.userID, //SPECIAL_UID.unauthorised, 
                imgFoldersArr: ["Main"],
            },
            
            /**
             * Имя текущей папки с изображениями.
             *  @type: {string}
            */
            currentImgFolder: DEFAULTS.defaultGlrImgFolder,
            
            /** 
             * Сигнализирует функции render(), что список имён файлов, которые нужно использовать при отрисовке,
             * получен (тогда имеет значение true). Если список ещё не получен (значение false), render() вернёт
             * контент с объявлением, что Галерея загружается.
             * Меняет значение false на true при первом вызове ф-и, получающей список файлов (если эта ф-я отработала
             * без ошибок). Потом уже нигде не принимает значение false. Т.е., фактически нужен только при заходе
             * юзера в Галерею (потому и содержит слово initial).
             * @type: {boolean}
            */
            gotInitialFNamesList: false,

            /**
             * Ссылка на массив файлов (объектов File), добавленных в дропзону для загрузки.
             * @type: {Array.<File>}
            */
            filesToUploadArr: null, 
            
            /**
             * Этот параметр содержит спец. значение, характеризующее текущую работу с файлами (загрузка, 
             * переименование и т.п.). Если никакой работы сейчас не выполняется, он принимает значение 
             * FO_STATUS.noAction. Если какая-то операция в процессе выполнения, этому соответствует значение 
             * FO_STATUS.waitingForResults (независимо от того, какая именно операция; напомним, 2+ операции 
             * одновременно выполняться не могут). Сразу по окончании операции fsOperationStatus принимает 
             * значение, характеризующее её результат - FO_SATUS.uploadedSuccessfully, FO_SATUS.uploadingFailed
             * и другие. После того, как все элементы, которым это нужно, "узнали" об окончании операции и её 
             * результатах, fsOperationStatus следует снова присвоить FO_STATUS.noAction.
             * @type: {number}
            */
            fsOperationStatus: FO_STATUS.noAction,
            
            /**
             * Ссылка на массив имён файлов, выбранных для удаления (но ещё не удалённых).
             * @type: {Array.<string>}
            */
            fNamesToRemoveArr: null, 
            
            /**
             * Объект с инфой обо всех итемах текущей папки. Каждое св-во соответствует одному итему и имеет вид
             * "имяФайла": {"selected": boolean, "disabled": boolean}
             * @type: {Object.<string, boolean>}
            */
            itemsObject: {}, 
            
            /**
             * Ссылка на массив имён всех файлов текущей папки.
             * @type: {Array.<string>}
            */
            fNamesArr: null,
            
            /**
             * Объект с инфой обо всех выделенных итемах текущей папки. Каждое св-во соответствует одному итему и 
             * имеет вид "имяФайла": true (значение неважно, если св-во есть в объекте, значит, итем выделен.
             * Когда итем выделяют, одноимённое его файлу св-во добавляется в объект, когда выделение снимают,
             * оно удаляется из объекта.
             *  @type: {Object.<string, boolean>}
            */
            selectedItemsObject: {}, 

            /**
             * Показывает, нужно ли при следующей перерисовке Галереи скрыть часть блока IMBB (items manager buttons
             * block) с кнопками, которые предназначены для действий с выделенными итемами (скачать, 
             * удалить, показать список выделенных итемов и проч). 
             * Если true, то да, нужно скрыть эти кнопки.
             * Сразу присваиваем true, т.к. при первой отрисовке блока IMBB эти кнопки в нём присутствуют,
             * и поскольку ни один итем ещё не может быть выделен, нам нужно скрыть их как можно скорее (так они 
             * скроются при первом же апдейте после получения с сервера списка файлов Галереи).
             * @type: {boolean}
            */
            shouldIMBBSelItemsButtonsHide: true,
            
            /**
             * Показывает, нужно ли при следующей перерисовке Галереи использовать режим ФуллИью (Image Full 
             * View).
             * @type: {boolean}
            */
            imgFVActive: false,
            
            /**
             * Номер итема, который будет показан в режиме ФуллВью при его, режима, включении.
             * По умолчанию заносим сюда 1, т.к. номера итемов в папке начинаются с 1.
             * Расшифровка названия: image full view current item number.
             * @type: {number}
             */
            imgFVCurrItemNumber: 1,

            /**
             * id ошибки, произошедшей при получении с сервера списка файлов Галереи.
             * Умолчальное значение (означающее, что никакой ошибки не произошло) - null.
             * @type: {number}
            */
            errOfGettingOfFNames: null,

            /**
             * Кол-во итемов, отображаемых на странице Галереи. Оно зависит от разрешения экрана. Подстройкой
             * дизайна под разрешение экрана управляет родительский элемент Галереи - Главный Компонент, поэтому
             * мы и получаем число итемов из него, через пропсы.
             * @type: {number}
            */
            itemsOnPage: +this.props.infoObject.adaptParams['itemsOnPage'],
            
            /**
             * Интервал (кол-во пикселей), на который прокручивается лента итемов в режиме ФуллВью при скроллинге
             * на одну позицию. Зависит от разрешения экрана. Подстройкой дизайна под разрешение экрана управляет 
             * родительский элемент Галереи - Главный Компонент, поэтому мы и получаем этот параметр из него, 
             * через пропсы.
             * Расшифровка названия: image full view scrolling interval.
             * @type: {number}
            */
            imgFVScrollInterval: +this.props.infoObject.adaptParams.gallery_imgFullViewInfoObject['imgFullViewScrollInterval'],
            
            
            /**
             * Указывает, нужно ли отправлять в Главный Компонент команду на очистку содержащихся в нём 
             * временных объектов, используемых Галереей.
             * Расшифровка названия: clear external temporary objects before rendering.
             * @type: {boolean}
            */
            clearExtTempObjsBeforeRendering: true,
            
            currentPage: DEFAULTS.defaultGlrCurrentPage,
            itemsCount: 0,
            selectedItemsCount: 0,
            dropzoneDisabled: false, //true,

            elsInLinksToPagesBlock: 5,
        };

        if(this.state.userInfoObject.userID===null || this.state.userInfoObject.userID===undefined)
            this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;


        /**
         * 
         * @type: {ILPopups}
        */
        this.itemsListPopupsManager = null;

        //Привязка функций к контексту:
        this.uniTool = this.universalTool.bind(this);
        this.goToPageViaPopupButton = this.goToPageViaPopupButton.bind(this);
        this.closeGoToPagePopup = this.closeGoToPagePopup.bind(this);
        this.renameViaButton = this.renameViaButton.bind(this);
        this.closeFRenamePopup = this.closeFRenamePopup.bind(this);

        //ДОМ-элементы:
        this.linkCopyInputDOMEl = null;

        //Вспомогательный объект, задающий правила, по которым метод встроенного класса Intl (от International) Intl.compare()
        //будет сравнивать строки (это далее используется в методе Array.prototype.sort()). Эти правила позволят сортировать
        //массив с названиями файлов в привычном человеку виде, строго по алфавиту.
        this.stringComparsionRulesCollator = new Intl.Collator(["en-GB", "ru"], {numeric: true});

        //РЕФЫ:
        this.popupsContRef = React.createRef(); //ВОЗМОЖНО, не нужен.
        
        //Для контейнера, куда будет добавляться инпут, с помощью которого копируются в буфер ссылки на итемы.
        //this.linkCopyContainerRef = React.createRef(); //ДУМАЮ, НЕ НУЖНО.
        //Для инпута, с помощью которого копируются в буфер ссылки на итемы.
        //this.linkCopyInputRef = React.createRef(); //НЕ НУЖНО!
        
        //Для попапов - списков итемов (полный список и список выделенных):
        this.FILPopupContainerRef = React.createRef(); //От Full items list.
        this.SILPopupContainerRef = React.createRef(); //От Selected items list.

        //Для попапа, предлагающего подождать окончания текущей операции с файлами (FO - file operation):
        this.waitFOFinishPopupRef = React.createRef();
        this.waitFOFinishWrapperRef = React.createRef();
        this.waitFOFinishContainerRef = React.createRef();
        
        //Для попапа переименования файлов:
        this.fRenamePopupRef = React.createRef();
        this.fRenamePopupDescriptionTextRef = React.createRef();
        this.fRenamePopupHiddenInputRef = React.createRef();
        this.fRenamePopupTextInputRef = React.createRef();
        this.fRenamePopupContainerRef = React.createRef();
        
        //Для попапа перемещений на страницу с номером:
        this.goToPagePopupRef = React.createRef();
        this.goToPagePopupTextInputRef = React.createRef();
        this.goToPagePopupContainerRef = React.createRef();
        
        //Для попапа с сообщением об ошибке при получении файлов Галереи:
        this.getItemsErrReportRef = React.createRef();
        this.getItemsErrReportWrapperRef = React.createRef();
        this.getItemsErrReportContainerRef = React.createRef();

        //Для попапа, запрашивающего подтверждения удаления файла(ов):
        this.confirmRemovingPopupRef = React.createRef();       
        this.confirmRemovingWrapperRef = React.createRef();
        this.confirmRemovingContainerRef = React.createRef();

        //Для попапа с сообщением об ошибке при добавлении файлов в дропзону:
        this.uplFsListErrReportRef = React.createRef();
        this.uplFsListErrWrapperRef = React.createRef();
        this.uplFsListErrContainerRef = React.createRef();

        //Для кнопки в попапе с сообщением об ошибке при добавлении файлов в дропзону:
        this.dropZoneErrPopupBtnRef = React.createRef();

        this.iMBBRef = React.createRef(); //iMBB - "Items Manager Buttons Block"
        this.dropzoneRef = React.createRef();
        
        this.imgFullViewRef = React.createRef();
        
        this.bgImgRef = React.createRef();
    }


    /*
    Эта ф-я из жизненного цикла компонента вызывается и при монтировании, и при обновлении компонента - во 
    втором случае перед shouldComponentUpdate(). 
    Наша задача - сделать так, чтобы если юзер заходит в Галерею, и при этом не ведётся никаких файловых операций,
    все связанные с файловыми операциями временные объекты из Главного Компонента зачищались (т.е., удалялись все
    их св-ва и обнулялись ссылки на сами объекты). Зачем это нужно? Допустим, мы дали команду скачать с сервера 
    несколько файлов. Соответствующие им итемы Галереи дисаблировались, и этот факт зарегистрировался во временном 
    объекте Главного Компонента state.galleryInfoObject.disabledItemsTempObject. Если теперь юзер выйдет из Галереи,
    а затем вернётся до окончания операции скачивания, он вновь увидит эти итемы дисаблированными. Если он дождётся
    финала операции, не выходя из Галереи, то здешняя ф-я shouldComponentUpdate() благополучно энаблирует
    итемы, получая инфу о них из упомянутого disabledItemsTempObject (он передаётся из Главного Компонента через
    пропсы), а затем передаст в Главный Компонент команду очистить disabledItemsTempObject. И всё будет ОК.
    ОДНАКО если юзер уйдёт из Галереи и в момент окончания операции будет где-то ВНЕ, ф-я Галереи 
    shouldComponentUpdate(), естественно, не сработает, и disabledItemsTempObject останется неочищенным. И когда
    юзер снова зайдёт в Галерею, он увидит итемы, перечисленные в disabledItemsTempObject, дисаблированными, хотя
    это, разумеется, уже не нужно.
    Можно было бы очищать временные объекты прямо из кода Главного Компонента, как только файловая операция 
    заканчивается. Но это усложняет код и делает его нестройным, т.к. после окончания операции Галерея ещё 
    нуждается в тех временных объектах, и коду Главного Компонента приходится изворачиваться, чтобы не очистить
    их раньше времени (так, например, приходилось делать очистку не в момент конца операции, а при закрытии 
    попапа с отчётом о ней, когда (скорее всего!) Галерея уже успеет использовать полученные через пропсы временные
    объекты. Уродство, одним словом!). Поэтому мы приняли политику, что команду на очистку временных объектов даёт
    тот, кто их использует (кроме случая, когда при попытке выполнить файловую операцию слетела авторизация - 
    тогда временные объекты зачищаются в коде самого Главного Компонента при новом залогинивании).
    Таким образом, команду на очистку временных объектов, используемых в Галерее, должна всегда отдавать Галерея.
    Если она была открыта в момент завершения операции и "узнала" об этом завершении по изменению пропсов - 
    команда на очистку отдаётся из shouldComponentUpdate(). Если же в Галерею вошли уже после окончания операции,
    и shouldComponentUpdate() не вызовется, нужно дать команду об очистке из какой-то другой ф-и, которая сработает
    ещё ДО рендеринга. Этой ф-ей является getDerivedStateFromProps().
    Поскольку она вызывается и при монтировании, и при обновлении, а нам нужно с её помощью чистить временные 
    объекты только при монтировании, мы используем ограничивающий параметр state.clearExtTempObjsBeforeRendering.
    */
    static getDerivedStateFromProps(props, state) {
    //Вообще эта ф-я служит для приведения объекта this.state (внутри ф-и - state, т.к. она статическая, и this
    //в неё использовать нельзя) в соответствие пропсам. Ф-я возвращает либо обновлённый объект state, либо null,
    //если обновлять ничего не нужно.
        if(state.clearExtTempObjsBeforeRendering) {
            if(props.infoObject.fsOperationStatus!=FO_STATUS.waitingForResults) {
                props.uniTool(DO.clearDisabledItemsTempObject);
                props.uniTool(DO.clearFNamesTempObject);
            }

            return {...state, ...{clearExtTempObjsBeforeRendering: false}}
        }
        return null;
    }

    componentDidMount() {

        //Отрисовка, после которой срабатывает componentDidMount(), выводит лишь извещение типа "Галерея
        //загружается..." Никакой контент, связанный со страницами Галереи, ещё не выводится (ешё и список
        //файлов-то не получен). Поэтому мы можем смело вычислять число страниц здесь.
        
        //Если юзер авторизован.
        if(this.state.userInfoObject.userID!=SPECIAL_UID.unauthorised && this.state.userInfoObject.userID!=SPECIAL_UID.signingIn) {
            let srch_params = new URLSearchParams(this.props.location.search);
            let currentPage = srch_params.get("page");

            //isNaN(Параметр) проверяет, является ли Параметр числом (вернее, не-числом). Если число - 
            //возвращает false.
            if(!currentPage || isNaN(currentPage) || currentPage<1) //currentPage<1, а не <=0 - тогда если юзер
            //ввёл дробное число между 0 и 1, это тоже окажется учтено.
                currentPage = DEFAULTS.defaultGlrCurrentPage;
            else currentPage = Math.floor(currentPage); //Округляем в меньшую сторону, на случай, если юзер ввёл 
            //дробное число.

            this.state.currentPage = currentPage; //Случай, когда this.state.currentPage получилась больше, чем
            //имеется страниц, обрабатывается в другом месте.

            if(this.props.infoObject.fsOperationStatus) this.state.fsOperationStatus = Number(this.props.infoObject.fsOperationStatus);
//???
            //ОБРАБОТАТЬ случай, когда это не так?

            this.getFNamesList();
        }
        else if(this.state.userInfoObject.userID==SPECIAL_UID.unauthorised) {
//???
            //Здесь нужно отправить в Главный Компонент сигнал, чтоб он вывел попап-форму авторизации.

            //this.props.uniTool(DO.openSignInPopup, FLAG.sInPopup_initialView);
        }

    }

    selectItemViaPopup(fileName, selected) {
        this.universalTool(DO.selectGlrItem, {"fileName": fileName, "selected": selected});
    }

    /**
     * Вызывается при закрытии попапов со списками итемов (полный список итемов и список выделенных итемов).
     * Не возвращает каких-либо значений.
    */
    onCloseILPopups() {
        this.state.shouldIMBBSelItemsButtonsHide = true;
        this.forceUpdate();
    }

    goToPageViaItemsListPopup(itemNumber) {
        let targetPage = Math.trunc((itemNumber-1)/this.state.itemsOnPage) + 1; //Именно такая замысловатая
        //конструкция нужна, чтобы страница определялась правильно.
        this.props.history.push("gallery?page=" + targetPage);
    }

    openSelectedItemsListPopup(event) {
        this.itemsListPopupsManager.openSILPopupInGallery();
    }

    openFullItemsListPopup(event) {
        this.itemsListPopupsManager.openFILPopupInGallery();
    }
    
    experimentsFunc(event) {
        
    }

//================================================================================
//Для попапа Go to Page

    createGoToPagePopupHTML() {
        return (
        <div ref={this.goToPagePopupRef} className="popup-universal-bg">
            <MyDraggable cancel=".popup-universal-textinput">
                <div className="popup-imgfview-scrollto">
                    <div className="popup-imgfview-scrollto-content">
                        <span className="popup-imgfview-scrollto-d-text">Enter page to go to:</span>
                        <div>
                            <input 
                            ref={this.goToPagePopupTextInputRef} 
                            type="text" 
                            className="popup-universal-textinput" 
                            onChange={this.checkPageNumberInPopup.bind(this)} 
                            onKeyDown={this.goToPageViaEnter.bind(this)}/>
                            <button className="popup-universal-button-2" onTouchEnd={this.goToPageViaPopupButton} onClick={this.goToPageViaPopupButton}>Go</button>
                        </div>
                    </div>
                    <div className="popup-closeicon-container">
                        <img className="popup-closeicon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-lighted.png"} onTouchEnd={this.closeGoToPagePopup} onClick={this.closeGoToPagePopup}/>          
                    </div>
                </div>
            </MyDraggable>
        </div>);
    }

    openGoToPagePopup(event) {
        if(this.goToPagePopupRef.current) {
            this.goToPagePopupTextInputRef.current.value = "";
            this.goToPagePopupContainerRef.current.appendChild(this.goToPagePopupRef.current); 
            this.goToPagePopupTextInputRef.current.focus();
        }
        else {
            ReactDOM.render(this.createGoToPagePopupHTML(), this.goToPagePopupContainerRef.current, function(){
                this.goToPagePopupTextInputRef.current.focus();
            }.bind(this));
        }
    }
    
    closeGoToPagePopup(event) {
        this.goToPagePopupContainerRef.current.removeChild(this.goToPagePopupRef.current);
    }
    
    //Проверка вводимого в поле для go to page номера страницы.
    checkPageNumberInPopup(event) {
        if(event.target.value.match(/[^0-9]/g)) event.target.value = event.target.value.replace(/[^0-9]/g, ''); 
        let pageNumber = Number(event.target.value);
        if(pageNumber==0) pageNumber = 1;
    }

    performGoToPageOperation() {
        let galleryPagesN = Math.ceil(this.state.itemsCount/this.state.itemsOnPage);
        let textInputValue = Number(this.goToPagePopupTextInputRef.current.value);
            
        if(textInputValue < 1) textInputValue = 1;
        if(textInputValue > galleryPagesN) textInputValue = galleryPagesN;
        this.props.history.push("gallery?page=" + textInputValue);        
    }

    goToPageViaPopupButton(event) {
        if(this.goToPagePopupTextInputRef.current.value!="") 
            this.performGoToPageOperation();
    }

    goToPageViaEnter(event) {
        if(event.keyCode==13 && event.target.value!="") 
            this.performGoToPageOperation();
    }
//================================================================================
//Для попапа переименования файлов (FRenamePopup)

    createFRenamePopupHTML(currentFileName) {
        //Инпут hidden будет содержать изначальное имя переименуемого файла.
        return (
        <div ref={this.fRenamePopupRef} className="popup-universal-bg">
            <MyDraggable cancel=".popup-universal-textinput">
                <div className="popup-frename">
                    <div className="popup-frename-content">
                        <span ref={this.fRenamePopupDescriptionTextRef} className="popup-frename-d-text" title={currentFileName}>Rename "{makeStringMinimised(currentFileName, LIMITS.inPopup_fNameMaxLength)}" to:</span>
                        <div>
                            <input type="hidden" ref={this.fRenamePopupHiddenInputRef} className="popup-frename-hidden-currentfname" value={currentFileName}/>
                            <input 
                            type="text" 
                            ref={this.fRenamePopupTextInputRef} 
                            className="popup-universal-textinput" 
                            maxLength={LIMITS.inPopup_fRenaming_maxNewFNameLength} 
                            style={{width: '180px'}} 
                            onChange={this.checkNewFName.bind(this)} 
                            onKeyDown={this.renameViaEnter.bind(this)}/>
                            <button className="popup-universal-button-2" onTouchEnd={this.renameViaButton} onClick={this.renameViaButton}>Rename</button>
                        </div>
                    </div>
                    <div className="popup-closeicon-container">
                        <img className="popup-closeicon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-lighted.png"} onTouchEnd={this.closeFRenamePopup} onClick={this.closeFRenamePopup}/>          
                    </div>
                </div>
            </MyDraggable>
        </div>);
    }

    openFRenamingPopup(currentFileName) {
        if(this.fRenamePopupRef.current) {
            this.fRenamePopupTextInputRef.current.value = "";

            this.modifyFRenamePopup(currentFileName);

            this.fRenamePopupContainerRef.current.appendChild(this.fRenamePopupRef.current);            
        }
        else {
            let fNameWithoutExt = currentFileName.substr(0, currentFileName.indexOf("."));

            
            ReactDOM.render(this.createFRenamePopupHTML(currentFileName), this.fRenamePopupContainerRef.current, function() {
                this.fRenamePopupTextInputRef.current.value = fNameWithoutExt;
            }.bind(this));
        }
    }

    /**
     * Модифицирует контент попапа FRenamePopup, вставляя в нужные места имя файла, который нужно переименовать.
     * Не возвращает каких-либо значений.
    */
    modifyFRenamePopup(currentFileName) {
        let fNameWithoutExt = currentFileName.substr(0, currentFileName.indexOf("."));
        
        this.fRenamePopupDescriptionTextRef.current.setAttribute("title", currentFileName);
        this.fRenamePopupHiddenInputRef.current.setAttribute("value", currentFileName);
        this.fRenamePopupDescriptionTextRef.current.innerText = 'Rename "' + makeStringMinimised(currentFileName, LIMITS.inPopup_fNameMaxLength) + '" to:';
        
        this.fRenamePopupTextInputRef.current.value = fNameWithoutExt;
    }
    
    checkNewFName(event) {
        let validationRegExp = /[^ёЁA-Za-zА-Яа-я0-9_=&%@№ '`#!~;,\-\+\(\)\{\}\[\]\$]/g;
        ////^ означает "НЕ эти символы", т.е., любой, кроме них.
        //Символ "." НЕ НУЖНО РАЗРЕШАТЬ: юзер должен мочь только переименовывать файл, но не менять его расширение!
        
        if(event.target.value.match(validationRegExp)) event.target.value = event.target.value.replace(validationRegExp, '');
        
        if(event.target.value.length > LIMITS.inPopup_fRenaming_maxNewFNameLength) event.target.value = event.target.value.slice(0, LIMITS.inPopup_fRenaming_maxNewFNameLength);
        
    }

    makeDataObjForFRenamingRequest(currentFileName, newFNameWithoutExtension) {
        //Нужно выделить расширение исходного файла из его названия и прицепить к newFileName:
        let fileExt = currentFileName.substr(currentFileName.indexOf(".")); //В расширение файла включится и 
        //точка.
        let fullNewFName = newFNameWithoutExtension + fileExt;

        if(fullNewFName==currentFileName) return false;
        else return {
                currentFName: currentFileName,
                newFName: fullNewFName,
                selected: this.state.itemsObject[currentFileName].selected,
                imgFolder: this.state.currentImgFolder
            };
    }

    /**
     * Отправляет объект с данными для переименования в Главный Компонент, чтобы тот отправил запрос о переименовании
     * на сервер.
     * Не возвращает каких-либо значений.
    */
    sendFRenamingRequest(currentFName, newFNameWithoutExt) {
        let reqDataObj = this.makeDataObjForFRenamingRequest(currentFName, newFNameWithoutExt);

        if(reqDataObj) {
            this.props.uniTool(DO.renameFile, reqDataObj);
            this.closeFRenamePopup();
                
            this.state.itemsObject[currentFName].disabled = true;
            this.state.fsOperationStatus = FO_STATUS.waitingForResults;
            
            //Дисаблируем переименуемый итем в ФуллВью, если этот режим включён.
            //А где этот итем опять энаблируется? - В коде <ImageFullView>, когда операция закончится.
//???
            /*
            ТАК СЕБЕ РЕШЕНИЕ - получается, мы знаем, что будет происходить в другом модуле, нарушается инкапсуляция.
            Да и вообще, такие команды, отдаваемые через рефы дочерним компонентам - скорее, зло. Нужно действовать
            путём апдейтов, а не так.
            ВОЗМОЖНО, стоит дисаблировать итемы уже в момент вывода попапов с вопросом, производить ли операцию,
            а не в момент отдачи команды о старте её. 
            */
            if(this.state.imgFVActive && this.imgFullViewRef.current) this.imgFullViewRef.current.setDisabledViewsInVList();            
            
            this.forceUpdate();

        }        
    }

    renameViaButton(event) {
        let newFileNameWithoutExt = this.fRenamePopupTextInputRef.current.value.trim();

        if(newFileNameWithoutExt!="") {
            let currentFileName = this.fRenamePopupHiddenInputRef.current.value;
            
            this.sendFRenamingRequest(currentFileName, newFileNameWithoutExt);
        }
    }

    renameViaEnter(event) {
        if(event.keyCode==13) {
            let newFileNameWithoutExt = event.target.value.trim();
            //Для справки: если ввести имя из одних пробелов, trim() просто превратит его в "".
            if(newFileNameWithoutExt!="") {
                let currentFileName = this.fRenamePopupHiddenInputRef.current.value;
                
                this.sendFRenamingRequest(currentFileName, newFileNameWithoutExt);
            }
        }        
    } 

    closeFRenamePopup(event) {
        this.fRenamePopupContainerRef.current.removeChild(this.fRenamePopupRef.current);
    }

//================================================================================

    updateItemsObject(newFNamesObj) {
        let itemsObject = this.state.itemsObject;
        let realNewFNamesArr = []; //Массив для имён, которых раньше не было в itemsObject.
        let phantomFNamesArr = []; //Массив для имён из itemsObject, которых фактически нет в Галерее
        //(т.е., их нет в newFNamesObject).

        for (let fName in itemsObject) {
            if(!newFNamesObj.hasOwnProperty(fName)) phantomFNamesArr.push(fName);
        }
                    
        for (let fName in newFNamesObj) {
            if(!itemsObject.hasOwnProperty(fName)) realNewFNamesArr.push(fName);
        }
                    
        let phantomFNamesArrLength = phantomFNamesArr.length;
        for(let i=0; i<phantomFNamesArrLength; i++) {
            let fName = phantomFNamesArr[i];
            delete itemsObject[fName];
                        
            if(this.state.selectedItemsObject.hasOwnProperty(fName)) {
                delete this.state.selectedItemsObject[fName];
                this.state.selectedItemsCount--;
            }
        }
                    
        if(this.state.selectedItemsCount==0)
            this.state.shouldIMBBSelItemsButtonsHide = true;

        let realNewFNamesArrLength = realNewFNamesArr.length;
        for(let i=0; i<realNewFNamesArrLength; i++) {
            let fName = realNewFNamesArr[i];
            itemsObject[fName] = {"selected": false, "disabled": false}
        }
        
        this.state.fNamesArr = Object.keys(this.state.itemsObject).sort(this.stringComparsionRulesCollator.compare);
        this.state.itemsCount = this.state.fNamesArr.length;
    } 

    prepareDropzoneToCleanup() {
        /*
        Чтобы очистить дропзону, нужно удалить все элементы из массива помещённых в неё файлов и перерисовать саму
        дропзону (в ней при рендеринге учитывается этот массив). Массив мы чистим через имеющуюся у нас ссылку на
        него - this.state.filesToUploadArr. Теперь остаётся дождаться перерисовки Галереи, при которой 
        вызовется ф-я shouldComponentUpdate() и у дропзоны (UplDropzone). Алгоритм этой ф-и таков, что при 
        обнулении массива файлов даётся добро на перерисовку.
        Заметим, мы здесь не вызываем forceUpdate() после очистки this.state.filesToUploadArr, т.е., не 
        инициируем перерисовку Галереи, а только готовим всё к тому, чтобы при любой следующей перерисовке
        Галереи, чем бы она ни была вызвана, дропзона очистилась. Потому данная ф-я и называется 
        prepareDropzoneToCleanup.
        */
        if(this.state.filesToUploadArr) this.state.filesToUploadArr.splice(0, this.state.filesToUploadArr.length);
    }


    shouldComponentUpdate(newProps) {
        /**
         * Определяет, нужно ли обновлять список имён файлов.
         * @type: {boolean}
        */
        let shouldUpdateGalleryItems = false;
        
        /**
         * Определяет, нужно ли делать перерисовку Галереи. Если shouldUpdateGalleryItems==false, то 
         * shouldComponentUpdate() просто возвращает shouldUpdate.
         * @type: {boolean}
        */
        let shouldUpdate = false;
        
        
        let srch_params = new URLSearchParams(newProps.location.search);
        let currentPage = srch_params.get("page");

        //isNaN(Параметр) проверяет, является ли Параметр числом (вернее, не-числом). Если число - возвращает false.
        if(!currentPage || isNaN(currentPage) || currentPage<1) //currentPage<1, а не <=0 - тогда если в адресной
        //строке стоит дробное число между 0 и 1, это тоже окажется учтено.
            currentPage = DEFAULTS.defaultGlrCurrentPage;
        else currentPage = Math.floor(currentPage); //Округляем в меньшую сторону, на случай, если в адресной 
        //строке дробное число. 

        if(currentPage!=this.state.currentPage) {
            this.state.currentPage = currentPage;
            shouldUpdate = true;
    
            /*
            Чаще всего здесь currentPage!=this.state.currentPage, если shouldComponentUpdate вызвана из-за
            сознательного перехода юзером на новую страницу Галереи. Тогда производимые в этом блоке if 
            операции (точнее, я говорю о shouldUpdate = true;) не вступают в конфликт с операциями из других блоков
            if в теле shouldComponentUpdate, т.к. те блоки просто не исполняются. 
            Но есть одно исключение. Если юзер от руки задаст в адресной строке бОльший номер страницы, чем есть
            страниц, то параметру this.state.currentPage будет просто присвоен номер последней страницы. Однако
            в адресной строке всё останется, как было. Если при какой-то следующей операции слетит авторизация,
            и юзер зайдёт в аккаунт по-новой, currentPage, получаемая, напомню, из srch_params.get("page"), 
            окажется НЕ РАВНА this.state.currentPage. Соответственно, данный блок if сработает - и в то же время
            сработает другой if, обрабатывающий авторизацию. Это может привести к конфликту, если в одном блоке
            зададут shouldUpdate=true, а в другом =false.
            Поэтому мы размещаем данный блок if выше всех, чтобы остальные, если им понадобится, смогли 
            "опровергнуть" выставленное здесь значение shouldUpdate, заменив его своим.
            */
        }

        /*
            Когда при попытке файловой операции слетает авторизация, из Главного Компонента приходят 2 
            изменившихся параметра:
            - newProps.infoObject.fsOperationStatus = FO_STATUS.noAction;
            - newProps.infoObject.userInfoObject.userID = SPECIAL_UID.unauthorised.
            При самом слёте авторизации перерисовывать Галерею не нужно. Нужно только вывести авторизационный 
            попап, а также выставить this.state.fsOperationStatus в FO_STATUS.noAction, чтобы операция, при которой
            слетела авторизация, могла считаться законченной.
            Когда юзер начнёт авторизовываться, из Главного Компонента сначала придёт параметр
            newProps.infoObject.userInfoObject.userID = SPECIAL_UID.signingIn. Перерисовывать Галерею при этом не 
            нужно. Затем придёт ID самого акка, в который вошли. Вот теперь нужно перерисовать Галерею - чтобы
            снять дисаблирования итемов, если они есть, и/или энаблировать дропзону, если она была 
            дисаблирована. Причём, если авторизуется другой юзер (userID!=this.state.previousUserID), то нужно
            ещё и удалить все выделения, очистить дропзону и вызвать getFNamesList().
        */

        //============================================================================================
        //Обработка залогинивания и разлогинивания/слёта авторизации.
        
        if(newProps.infoObject.userInfoObject.userID!=this.state.userInfoObject.userID) {
            shouldUpdate = true;

            if(newProps.infoObject.userInfoObject.userID==SPECIAL_UID.unauthorised) {
                this.state.userInfoObject.userID = newProps.infoObject.userInfoObject.userID;
                shouldUpdate = false;
            }
            else if(newProps.infoObject.userInfoObject.userID==SPECIAL_UID.signingIn &&
            this.state.userInfoObject.userID==SPECIAL_UID.unauthorised) {
                //Были неавторизованы и отдали команду на авторизацию.
                this.state.userInfoObject.userID = newProps.infoObject.userInfoObject.userID;
                shouldUpdate = false;                
            }
            else if(newProps.infoObject.userInfoObject.userID!=SPECIAL_UID.unauthorised &&
            newProps.infoObject.userInfoObject.userID!=SPECIAL_UID.signingIn) {

                if(newProps.infoObject.userInfoObject.userID==this.state.previousUserID) {
                    //Авторизовался предыдущий юзер.
                    //В этом случае мы снимаем дисаблирование итемов, если оно имелось, но сохраняем  
                    //выделение итемов и не чистим дропзону. Зачем заставлять юзера, у которого слетела авторизация,
                    //по-новой всё выделять и/или искать файлы для загрузки?
                    //А вот при смене юзера нужно и дропзону чистить, и выделения итемов снимать!

                    //Снимаем дисаблирование итемов, если оно имелось.
                    if(newProps.infoObject.disabledItemsTempObject) {
                        let disabledItemsObject = newProps.infoObject.disabledItemsTempObject;
                        for (let fName in disabledItemsObject) {
                            try { //Делаю этот try в предположении гипотетической ситуации, что в 
                                //itemsObject не нашлось св-ва fName - хотя, пока у нас допустимо 
                                //единовременное выполнение лишь одной файловой операции, непонятно, как такое
                                //может быть. 
                                this.state.itemsObject[fName].disabled = false;
                            }
                            catch(err) {
//???
                                //Стоит ли как-то обрабатывать эту ошибку? Если оставить catch пустым, алгоритм
                                //просто продолжит работу, будто никакой ошибки не было. Возможно, стоит выдать
                                //сообщение об ошибке, чтобы юзеры потом могли жаловаться на этот баг?
                            }
                        }
                    }

                    this.props.uniTool(DO.clearDisabledItemsTempObject);

                    //Если фуллвью открыто, нужно снять и дисаблирование вьюшек.
                    if(this.state.imgFVActive && this.imgFullViewRef.current) this.imgFullViewRef.current.setDisabledViewsInVList();

                    //Энаблируем дропзону (на случай, если авторизация слетела при попытке загрузить файлы, 
                    //когда дропзона уже дисаблировалась).
                    this.state.dropzoneDisabled = false;

                    this.state.userInfoObject.userID = newProps.infoObject.userInfoObject.userID;
                    
                    //shouldUpdate = false;
                    shouldUpdate = true; //Иначе не отобразится, что дропзона и дисаблированные итемы энаблировались.
                }

                else {
                    /*
                    Авторизуется новый юзер. Поскольку в этом случае мы зачищаем всё, что осталось от 
                    предыдущего, нужно закрыть блок кнопок для просмотра и удаления выделенных итемов. Для этого
                    мы ниже задаём this.state.shouldIMBBSelItemsButtonsHide = true. Само удаление блока 
                    произойдёт при перерисовке, которая будет вызвана внутри ф-и getFNamesList() по завершении 
                    её работы. Сама же ф-я getFNamesList() вызывается в самом конце shouldComponentUpdate(), 
                    если shouldUpdateGalleryItems==true.
                    */
                
                    //Очищаем всё, что осталось от предыдущего юзера:
                    deleteObjectProps(this.state.itemsObject);
                    deleteObjectProps(this.state.selectedItemsObject);
                    this.state.selectedItemsCount = 0;
                    this.state.itemsCount = 0;
                    this.state.fNamesArr = null;
  

                    //Снимаем дисаблирование итемов, если оно имелось.
                    if(newProps.infoObject.disabledItemsTempObject) {
                        let disabledItemsObject = newProps.infoObject.disabledItemsTempObject;
                        for (let fName in disabledItemsObject) {
                            //А мы ведь уже удалили все св-ва из itemsObject!
                            if(this.state.itemsObject.hasOwnProperty(fName)) //К чему этот if? На всякий случай.
                                this.state.itemsObject[fName].disabled = false;
                        }
                    }
                
                    //Поскольку при смене юзера фуллвью автоматически закрывается, нет смысла отсюда снимать 
                    //дисаблирование его вьюшек командой this.imgFullViewRef.current.setDisabledViewsInVList(),
                    //как мы это делали при авторизации прежнего юзера.
                
                    //При смене юзера надо чистить и энаблировать дропзону (на случай, если авторизация слетела
                    //при попытке загрузить файлы, когда дропзона уже дисаблировалась).
                    this.prepareDropzoneToCleanup();
                    this.state.dropzoneDisabled = false;
                    
                    this.state.userInfoObject.userID = newProps.infoObject.userInfoObject.userID;
                    this.state.previousUserID = newProps.infoObject.userInfoObject.userID;

                    this.state.shouldIMBBSelItemsButtonsHide = true;

//???                
                    //При смене юзера закрываем фуллвью. В перспективе можно будет сделать, чтобы фуллвью 
                    //оставалось, и там просто всё перерисовывалось бы с загрузкой умолчальной папки (Main)
                    //нового юзера и установкой текущего номера итема в 1 или в тот, что был (а если итемов
                    //окажется меньше, то в 1 или, наоборот, в самый большой).
                    this.state.imgFVActive = false;
                
                    shouldUpdateGalleryItems = true;
                }
            }

        }
        //============================================================================================

        //============================================================================================
        //Обработка файловых операций.
        
        /*
        Файловые операции и операции залогинивания/разлогинивания/слёт авторизации не могут пересекаться, т.к.
        проверка авторизации (и её слёт, если что) производится перед началом файловых операций, а залогинивание
        и разлогинивание по ходу файловых операций запрещены (это контролируется через fsOperationStatus).
        */

        let newProps_fsOperationStatus = Number(newProps.infoObject.fsOperationStatus);

        if(this.state.fsOperationStatus!=newProps_fsOperationStatus) {
            if(newProps_fsOperationStatus==FO_STATUS.uploadedSuccessfully ||
            newProps_fsOperationStatus==FO_STATUS.uploadingFailed ||
            newProps_fsOperationStatus==FO_STATUS.uplFilesAlreadyExist ||
            newProps_fsOperationStatus==FO_STATUS.uplFExistAllSkipped) {

                //Здесь нужно обновить this.state.itemsObject - добавить новые св-ва - имена файлов.
                let newFNamesObject = newProps.infoObject.fileNamesTempObject;
                for (let fName in newFNamesObject) {
                    if(!this.state.itemsObject.hasOwnProperty(fName))
                        this.state.itemsObject[fName] = {"selected": false, "disabled": false};                    
                }
                this.state.fNamesArr = Object.keys(this.state.itemsObject).sort(this.stringComparsionRulesCollator.compare);
                this.state.itemsCount = this.state.fNamesArr.length;

                this.props.uniTool(DO.clearFNamesTempObject);
                
                //Чистим дропзону, если загрузка файлов окончилась успешно или юзер вообще от неё отказался, т.к.
                //все эти файлы уже были в Галерее (FO_STATUS.uplFExistAllSkipped). Если произошла ошибка,  
                //дропзона не чистится - пусть юзер, если хочет, ещё раз попробует. Конечно, она не чистится
                //и если загрузка находится в стадии предложения перезаписать обнаруженные одноимённые файлы
                //(FO_STATUS.uplFilesAlreadyExist).
                if(newProps_fsOperationStatus==FO_STATUS.uploadedSuccessfully || 
                newProps_fsOperationStatus==FO_STATUS.uplFExistAllSkipped)
                    this.prepareDropzoneToCleanup();
                
                
                //Почему бы, раз файловая операция закончена, сразу не присваивать 
                //this.state.fsOperationStatus=FO_STATUS.noAction?
                //Потому что нам нужно, чтобы во время последующей перерисовки полученное из Главного Компонента 
                //значение this.state.fsOperationStatus ещё сохранялось, т.к. его нужно передать через пропсы в 
                //ФуллВью (если этот режим включён).
                //Можно было бы отдельно рассматривать случаи, когда ФуллВью включён и выключен, и во втором 
                //случае выставлять this.state.fsOperationStatus в FO_STATUS.noAction прямо здесь - но это, 
                //по-моему, только усложнит код, не принеся притом особой выгоды.
                this.state.fsOperationStatus = newProps_fsOperationStatus;
                
        
                if(newProps_fsOperationStatus==FO_STATUS.uplFilesAlreadyExist) shouldUpdate = false;
                else {
                    this.state.dropzoneDisabled = false;
                    
                    shouldUpdate = true;                    
                }
        
            }

            else if(newProps_fsOperationStatus==FO_STATUS.removedSuccessfully) {
                //Здесь нужно обновить this.state.itemsObject, удалив св-ва-имена файлов, которые были успешно удалены.
                let itemsObject = this.state.itemsObject;
                let newFNamesObject = newProps.infoObject.fileNamesTempObject;
                for (let fName in itemsObject) {
                    if(!newFNamesObject.hasOwnProperty(fName)) 
                        delete itemsObject[fName];
                }
                this.state.fNamesArr = Object.keys(this.state.itemsObject).sort(this.stringComparsionRulesCollator.compare);
                this.state.itemsCount = this.state.fNamesArr.length;
                
                //Также нужно удалить имена стёртых файлов из this.state.selectedItemsObject.
                let selItemsObject = this.state.selectedItemsObject;
                for (let fName in selItemsObject) {
                    if(!newFNamesObject.hasOwnProperty(fName)) {
                        delete selItemsObject[fName];
                        this.state.selectedItemsCount--;
                    }
                }

                this.props.uniTool(DO.clearFNamesTempObject);
                
                //Все итемы успешно удалились, но временный объект newProps.infoObject.disabledItemsTempObject
                //никуда не делся, так что его следует очистить.
                this.props.uniTool(DO.clearDisabledItemsTempObject);

            
                if(this.state.selectedItemsCount==0)
                    this.state.shouldIMBBSelItemsButtonsHide = true;

                this.state.fsOperationStatus = newProps_fsOperationStatus;

                shouldUpdate = true;
            }
            else if(newProps_fsOperationStatus==FO_STATUS.removingFailed) {
                //Сюда мы попадаем либо если не удалось удалить все или часть файлов, либо если
                //не удалось считать директорию с файлами Галереи, либо и то, и то.

                let newFNamesObject = newProps.infoObject.fileNamesTempObject;
                if(newFNamesObject) { //Список файлов Галереи был считан успешно.
                    //Обновляем наш state.itemsObject (и state.selectedItemsObject).
                    this.updateItemsObject(newFNamesObject);
                    
                    this.props.uniTool(DO.clearFNamesTempObject);
                    
                    //Нужно снять все дисаблирования. Итемам, которые успешно удалились, это, конечно, ни к чему, 
                    //но остальным - нужно.
                    let disabledItemsObject = newProps.infoObject.disabledItemsTempObject;
                    for (let fName in disabledItemsObject) {
                        if(this.state.itemsObject.hasOwnProperty(fName)) //К чему этот if? К тому, что хз, что
                        //там за ошибка была при удалении - вдруг файл уже был удалён, или сменил имя, и теперь,
                        //в обновлённом state.itemsObject, его уже нет?
                            this.state.itemsObject[fName].disabled = false;
                    }
                    
                    this.props.uniTool(DO.clearDisabledItemsTempObject);
                }
                else { //Список файлов Галереи считать не удалось.
                    //В этом случае не будем обновлять state.itemsObject (и state.selectedItemsObject), а просто 
                    //снимем дисаблирования. Юзеру, когда возникает такая ошибка, Главный Компонент выдаёт попап
                    //с предложением обновить страницу Галереи вручную.
                    let disabledItemsObject = newProps.infoObject.disabledItemsTempObject;
                    for (let fName in disabledItemsObject) {
                     
                        try { //Делаю этот try в предположении гипотетической ситуации, что в 
                            //itemsObject не нашлось св-ва fName - хотя, пока у нас допустимо 
                            //единовременное выполнение лишь одной файловой операции, непонятно, как такое
                            //может быть. 
                            this.state.itemsObject[fName].disabled = false;
                        }
                        catch(err) {
//???
                            //Стоит ли как-то обрабатывать эту ошибку? Если оставить catch пустым, алгоритм
                            //просто продолжит работу, будто никакой ошибки не было. Возможно, стоит выдать
                            //сообщение об ошибке, чтобы юзеры потом могли жаловаться на этот баг?
                        }
                    }
                    
                    this.props.uniTool(DO.clearDisabledItemsTempObject);
                }
                
                this.state.fsOperationStatus = newProps_fsOperationStatus;

                shouldUpdate = true;
            }
            
            else if(newProps_fsOperationStatus==FO_STATUS.downloadedSuccessfully ||
                    newProps_fsOperationStatus==FO_STATUS.downloadingFailed) {
                    let disabledItemsObject = newProps.infoObject.disabledItemsTempObject;
                    for (let fName in disabledItemsObject) {
                        this.state.itemsObject[fName].disabled = false;
                    }    
                    
                    this.state.fsOperationStatus = newProps_fsOperationStatus; 

                    this.props.uniTool(DO.clearDisabledItemsTempObject);
                    

                    shouldUpdate = true;
            }


            else if(newProps_fsOperationStatus==FO_STATUS.renamedSuccessfully) {

                let previousFName = newProps.infoObject.itemRenamingInfoTempObject.currentFName;
                let newFName = newProps.infoObject.itemRenamingInfoTempObject.newFName;
                let selected = newProps.infoObject.itemRenamingInfoTempObject.selected;
                
                delete this.state.itemsObject[previousFName];
                this.state.itemsObject[newFName] = {"selected": selected, "disabled": false};
                this.state.fNamesArr = Object.keys(this.state.itemsObject).sort(this.stringComparsionRulesCollator.compare);
                //Здесь не надо - число файлов ведь не изменилось.
                //this.state.itemsCount = this.state.fNamesArr.length;

                if(selected) {
                    delete this.state.selectedItemsObject[previousFName];
                    this.state.selectedItemsObject[newFName] = true;
                }
                
                this.state.fsOperationStatus = newProps_fsOperationStatus;

                this.props.uniTool(DO.clearDisabledItemsTempObject);
                this.props.uniTool(DO.clearFRenamingTempObject);

                shouldUpdate = true;
            }
            else if(newProps_fsOperationStatus==FO_STATUS.renamingFailed) {
                //В случае возникновения ошибки при переименовании с сервера считывается текущий список файлов
                //Галереи. На основе него мы здесь должны обновить наш state.itemsObject - если, конечно,
                //считывание прошло успешно.

                let newFNamesObject = newProps.infoObject.fileNamesTempObject;
                if(newFNamesObject) {
                    //Список файлов Галереи был считан успешно. Обновляем наш state.itemsObject
                    //(и state.selectedItemsObject).

                    this.updateItemsObject(newFNamesObject);
                    
                    //При отдаче команды на переименование итем дисаблируется, так что в данной ситуации
                    //newProps.infoObject.disabledItemsTempObject не может не иметь содержимого.
                    let disabledItemsObject = newProps.infoObject.disabledItemsTempObject;
                    for (let fName in disabledItemsObject) {
                        if(this.state.itemsObject.hasOwnProperty(fName)) //К чему этот if? К тому, что хз, что там за ошибка - 
                        //вдруг на самом деле файл переименовался?
                            this.state.itemsObject[fName].disabled = false;
                    }

                    this.props.uniTool(DO.clearFNamesTempObject);
                    this.props.uniTool(DO.clearDisabledItemsTempObject);
                    this.props.uniTool(DO.clearFRenamingTempObject);

                }
                else {
                    //Если не удалось даже считать список файлов, не будем делать ничего.
                    //Только снимем дисаблирование итема, который пытались переименовать.

                    let disabledItemsObject = newProps.infoObject.disabledItemsTempObject;
                    for (let fName in disabledItemsObject) {
                        if(this.state.itemsObject.hasOwnProperty(fName)) //К чему этот if? К тому, что хз, что там за ошибка - 
                        //вдруг на самом деле файл переименовался?
                            this.state.itemsObject[fName].disabled = false;
                    }
                    this.state.fNamesArr = Object.keys(this.state.itemsObject).sort(this.stringComparsionRulesCollator.compare);
                    this.state.itemsCount = this.state.fNamesArr.length;
                    
                    this.props.uniTool(DO.clearDisabledItemsTempObject);
                    this.props.uniTool(DO.clearFRenamingTempObject);
                }
                
                this.state.fsOperationStatus = newProps_fsOperationStatus;

                shouldUpdate = true;
                //Даже в этом случае, когда вроде файловый состав не изменился, следует провести апдейт, чтобы
                //обновить fsOperationStatus в <ImageFullView>
            }
            else if(newProps_fsOperationStatus==FO_STATUS.waitingForResults) {
                /*
                Мы присваиваем this.state.fsOperationStatus=FO_STATUS.waitingForResults сразу при отдаче команды 
                на начало любой файловой операции. Соответственно, когда newProps_fsOperationStatus окажется 
                равным FO_STATUS.waitingForResults, наш this.state.fsOperationStatus уже будет равен FO_STATUS.waitingForResults,
                и мы не попадём в этот блок if.
//Как используется FO_STATUS.uplFilesAlreadyExist
                Единственное исключение - если при загрузке файлов на сервер там обнаружились одноимённые файлы.
                В этом случае вернётся newProps_fsOperationStatus = FO_STATUS.uplFilesAlreadyExist, которое, в отличие
                от остальных значений, не вызывает перерисовку Галереи. Отсутствие перерисовки приводит к тому,
                что не вызывается componentDidUpdate(), в которой this.state.fsOperationStatus выставляется в 
                FO_STATUS.noAction - в результате здешняя fsOperationStatus остаётся равной FO_STATUS.waitingForResults.
                Тем временем, юзеру показывается попап с вопросом, поочерёдно, для каждого файла, следует ли 
                перезаписать его. Когда юзер в последний раз жмёт "Перезаписать" (если он вообще захочет перезаписывать
                что-либо), выбранные для перезаписи файлы вновь отправляются на сервер, а сюда, в Галерею, 
                передаётся значение newProps_fsOperationStatus = FO_STATUS.waitingForResults. И поскольку оно не 
                равно значению здешней fsOperationStatus, этот блок if срабатывает.
                */
                
                shouldUpdate = false;
            }
            else if(newProps_fsOperationStatus==FO_STATUS.noAction) {
                /*
                Мы сюда попадаем, если по ходу исполнения файловой операции выясняется, что сессия кончилась, 
                и нужно авторизоваться. При этом, т.к. мы здесь делаем this.state.fsOperationStatus = 
                newProps_fsOperationStatus, в процессе самой авторизации мы сюда уже не попадаем.
                В других ситуациях, если вся архитектура сделана правильно, этот if() вообще никогда не исполнится:
                мы ведь вернули наш fsOperationStatus в FO_STATUS.noAction сразу после обработки результатов
                файловой операции (FO_STATUS.renamedSuccessfully или др.) в componentDidUpdate(), соответственно,
                когда newProps_fsOperationStatus окажется FO_STATUS.noAction, наш fsOperationStatus уже будет равен
                FO_STATUS.noAction, и мы сюда не попадём.
                */
                
                this.state.fsOperationStatus = newProps_fsOperationStatus;
                
                shouldUpdate = false;
            }
            else shouldUpdate = true; //А какие, собственно, остались else?
        }
        //============================================================================================

        //============================================================================================
        //Обработка адаптации к размерам окна.
        /*
        Эта обработка имеет самый высокий приоритет, поэтому её мы размещаем ниже всех в теле shouldComponentUpdate:
        за ней последнее слово в определении значения shouldUpdate.
        */
        if(this.state.itemsOnPage != Number(newProps.infoObject.adaptParams['itemsOnPage'])) {
            this.state.itemsOnPage = Number(newProps.infoObject.adaptParams['itemsOnPage']); 
            shouldUpdate = true;
        }
        
        if(this.state.imgFVScrollInterval != Number(newProps.infoObject.adaptParams.gallery_imgFullViewInfoObject['imgFullViewScrollInterval'])) {
            this.state.imgFVScrollInterval = Number(newProps.infoObject.adaptParams.gallery_imgFullViewInfoObject['imgFullViewScrollInterval']);
            shouldUpdate = true;
        }
        //============================================================================================


        if(shouldUpdateGalleryItems) {
            this.getFNamesList();
            return false;
            //Внутри getFNamesList() есть свой вызов this.forceUpdate(). Т.е., хотя мы велим ф-и shouldComponentUpdate
            //вернуть false и тем самым как бы запрещаем перерисовку, на самом деле мы её производим внутри 
            //getFNamesList(). Без этого приёма нам пришлось бы здесь возвращать true, делать ненужную перерисовку,
            //а потом вызывать getFNamesList() из componentDidUpdate(). Т.е., мы экономим одну перерисовку. 
        }
        else {
            return shouldUpdate;
        }
    }    

 
    componentDidUpdate() {
        if(this.FILPopupContainerRef.current && this.SILPopupContainerRef.current && !this.itemsListPopupsManager) {
            let itemListsInfoObj = {
                FILPopupContainerRef: this.FILPopupContainerRef,
                SILPopupContainerRef: this.SILPopupContainerRef,
                itemsObject: this.state.itemsObject,
                moveToItemViaPopupFunc: this.goToPageViaItemsListPopup.bind(this),
                selectItemFunc: this.selectItemViaPopup.bind(this),
                onClosePopupFunc: this.onCloseILPopups.bind(this),
            };
            
            /*
            Почему инициируем this.itemsListPopupsManager именно здесь, в componentDidUpdate(), а не в 
            componentDidMount()? Потому что ему нужен контейнер для попапов, а в первой отрисовке Gallery ещё
            нет никакого контейнера: список файлов текущей папки ещё не получен, и весь контент представляет 
            собой просто извещение, что Галерея загружается. Контейнер появится только при повторном рендеринге, 
            вызванном срабатыванием ф-и getFNamesList() и forceUpdate() в ней.
            */
            
            this.itemsListPopupsManager = new ILPopups(itemListsInfoObj);
        }

        //Обработка ошибок при получении списка имён файлов в текущей папке.
        if(this.getItemsErrReportContainerRef.current && this.state.errOfGettingOfFNames) {
            let infoObject;
            if(this.state.errOfGettingOfFNames==ERR_ID.glrFolderUnaccessable) {
                infoObject = {
                    buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.getItemsErrReportWrapperRef, this.getItemsErrReportContainerRef)}.bind(this),
                    buttonText: "OK",
                    bgColor: "red",
                    borderColor: "white",
                    titleText: "Ошибка!",
                    titleBgColor: "rgb(255, 100, 30)",
                    titleTextColor: "yellow",
                    contentStrsArr: ["Папка с файлами Галереи недоступна!", 
                    "Попробуйте обновить страницу.", 
                    "Если ошибка не исчезает, напишите нам",
                    "на " + NAMES_PATHS.siteEmail + ",",
                    "указав ваш логин и username."]
                };
            }
            else if(this.state.errOfGettingOfFNames==ERR_ID.glrFolderNotReadable) {
                infoObject = {
                    buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.getItemsErrReportWrapperRef, this.getItemsErrReportContainerRef)}.bind(this),
                    buttonText: "OK",
                    bgColor: "red",
                    borderColor: "white",
                    titleText: "Ошибка!",
                    titleBgColor: "rgb(255, 100, 30)",
                    titleTextColor: "yellow",
                    contentStrsArr: ["Не удалось получить файлы Галереи!", 
                    "Попробуйте обновить страницу.", 
                    "Если ошибка не исчезает, напишите нам",
                    "на " + NAMES_PATHS.siteEmail + ",",
                    "указав ваш логин и username."]
                };                
            }
            else if(this.state.errOfGettingOfFNames==ERR_ID.glrUnknownErr) {
                infoObject = {
                    buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.getItemsErrReportWrapperRef, this.getItemsErrReportContainerRef)}.bind(this),
                    buttonText: "OK",
                    bgColor: "red",
                    borderColor: "white",
                    titleText: "Ошибка!",
                    titleBgColor: "rgb(255, 100, 30)",
                    titleTextColor: "yellow",
                    contentStrsArr: ["Неизвестная ошибка.", 
                    "Попробуйте обновить страницу.", 
                    "Если ошибка не исчезает, напишите нам",
                    "на " + NAMES_PATHS.siteEmail + ",",
                    "указав ваш логин и username."]
                };  
            }
            
            if(infoObject)
                PopupsUniMethods.openUniPopupOneButton(this.getItemsErrReportRef, this.getItemsErrReportWrapperRef, this.getItemsErrReportContainerRef, infoObject);

            
            this.state.errOfGettingOfFNames = null;
        }

        //shouldIMBBSelItemsButtonsHide может оказаться true, когда на самом деле не надо закрывать этот блок.
        //Например, он ставится в true в ф-и закрытия ФуллВью. Если блок закрывать не нужно, это будет выявлено
        //уже внутри этого if'а, при проверке this.state.selectedItemsCount - и тогда же shouldIMBBSelItemsButtonsHide
        //будет переведён в false.
        //Необходимость включения в if() условия this.iMBBRef.current вызвана тем, что не всегда
        //этот элемент (items manager buttons block, iMBB) существует на момент вызова componentDidUpdate().
        if(this.state.shouldIMBBSelItemsButtonsHide && this.iMBBRef.current) {
            if(this.state.selectedItemsCount==0) 
                this.iMBBRef.current.hideSelItemsManagerButtons();
            else 
                this.iMBBRef.current.showSelItemsManagerButtons();
  
            this.state.shouldIMBBSelItemsButtonsHide = false;
        }

        //Почему здесь не упомянуто FO_STATUS.uplFilesAlreadyExist? - Потому что когда из Gallery приходит
        //в пропсах это значение fsOperationStatus, shouldComponentUpdate() не даёт добра на перерисовку.
        //См подробнее по запросу "Как используется FO_STATUS.uplFilesAlreadyExist".
        if(this.state.fsOperationStatus==FO_STATUS.renamedSuccessfully ||
        this.state.fsOperationStatus==FO_STATUS.renamingFailed ||
        this.state.fsOperationStatus==FO_STATUS.uploadedSuccessfully || 
        this.state.fsOperationStatus==FO_STATUS.uploadingFailed ||
        this.state.fsOperationStatus==FO_STATUS.uplFExistAllSkipped ||
        this.state.fsOperationStatus==FO_STATUS.removedSuccessfully || 
        this.state.fsOperationStatus==FO_STATUS.removingFailed ||
        this.state.fsOperationStatus==FO_STATUS.downloadedSuccessfully ||
        this.state.fsOperationStatus==FO_STATUS.downloadingFailed) {
            this.state.fsOperationStatus = FO_STATUS.noAction;             
        }
   
    }


/*
В getFNamesList() отправлять на сервер userID в теле запроса, или в обработчике на сервере расшифровывать 
токен и доставать данные оттуда?
 - В ТЕЛЕ! Не будем злоупотреблять дешифровкой токенов. Да и вообще, это делает модуль Gallery автономнее, он 
 не будет зависеть от всяких куки и токенов, сделанных в Главном Компоненте.
*/
    getFNamesList() {
        
        const fetch_url = F_URL.readGallery; 

        const fetch_options = {
            method: 'POST',
            body: JSON.stringify({uID: this.state.userInfoObject.userID, imgFolder: this.state.currentImgFolder})
        };
       
        fetch(fetch_url, fetch_options)
        .then(function(response){
            if(response.ok) return response.json();
            else return Promise.reject(); 
        })
        .then(function(response_json){
            /*
                Объект, высылаемый с сервера в ответе, выглядит так:
                let resultObject = {
                    dirAccessErr: JSON.stringify(error) или undefined, //Не удалось найти папку или получить к ней доступ.
                    readDirErr: JSON.stringify(err) или undefined, //Не удалось считать названия файлов из папки.
                    files: JSON.stringify(Массив имён файлов) или undefined
                };
            */

            if(response_json.dirAccessErr) {
                this.state.errOfGettingOfFNames = ERR_ID.glrFolderUnaccessable;
            }
            else if(response_json.readDirErr) {
                this.state.errOfGettingOfFNames = ERR_ID.glrFolderNotReadable;
            }
            else if(response_json.files) {
                let fnamesArrLength = response_json.files.length;
                for(let i=0; i<fnamesArrLength; i++) {
                    this.state.itemsObject[response_json.files[i]] = {"selected": false, "disabled": false};
                }
                this.state.fNamesArr = Object.keys(this.state.itemsObject).sort(this.stringComparsionRulesCollator.compare);
                this.state.itemsCount = this.state.fNamesArr.length;
                
                //Это нужно, если ф-я была вызвана вследствие смены юзера, и при этом был режим Фуллвью.
                this.state.imgFVCurrItemNumber = 1;

                /*
                Этот блок нужен для обработки ситуации, когдя юзер дал команду удалить файл(ы) или переименовать файл,
                сам же, не дожидаясь окончания, ушёл из Галереи (не разлогиниваясь) - например, на входную
                страницу - а потом вернулся. Галерея полностью перезапустится, сработает её конструктор,
                вызовется componentDidMount(), а с ним - и данная ф-я, getFNamesList(), - но, если работа с 
                файлами ещё не закончена, юзер должен снова увидеть все дисаблированные итемы, и если они были
                выделены, то должны остаться выделенными.
                */
                //Здесь disabledItemsTempObject - объект со св-вами вида "имяФайла": {"selected": true/false}
                if(this.props.infoObject.disabledItemsTempObject) {
                    let disabledFNamesArr = Object.keys(this.props.infoObject.disabledItemsTempObject);
                    let disabledFNamesArrLength = disabledFNamesArr.length;
                    for(let i=0; i<disabledFNamesArrLength; i++) {
                        let fName = disabledFNamesArr[i];
                        let selected = this.props.infoObject.disabledItemsTempObject[fName].selected;
                        if(this.state.itemsObject.hasOwnProperty(fName)) {
                            this.state.itemsObject[fName].selected = selected;
                            this.state.itemsObject[fName].disabled = true;
                        
                            if(selected && !this.state.selectedItemsObject.hasOwnProperty(fName)) {
                                this.state.selectedItemsObject[fName] = true;
                                this.state.selectedItemsCount++;
                                //console.log("Count " + this.state.selectedItemsCount);
                            }
                        }
                    }
                }
                if(!this.state.gotInitialFNamesList) this.state.gotInitialFNamesList = true;
                this.state.errOfGettingOfFNames = null;
            }
            else {
                //Невообразимая ситуация, когда в ответе пришёл объект с одними null - но, думаю, будет правильно
                //обработать и её.
                this.state.errOfGettingOfFNames = ERR_ID.glrUnknownErr;
                
            }
            
            this.forceUpdate();            
        }.bind(this))
        .catch(function(err){
            //Сюда попадаем, если не удалось отправить запрос, или какая-то синтаксическая ошибка в одном из then.
            //Или если сработал Promise.reject().
            
            this.state.errOfGettingOfFNames = ERR_ID.glrUnknownErr;
            
            this.forceUpdate();            
        }.bind(this)); 
    }

    //Закрывает попап, показанный при каких-то нарушениях при добавлении файлов в дропзону (превышено допустимое
    //число, слишком большой размер и проч.).    
    closeUplFsListErrReport() {
        //this.uplFsListErrContainerRef.current.removeChild(this.uplFsListErrWrapperRef.current); //Так будет
        //ошибка. Реакту не нравится, что элемент, который был создан в диве-контейнере путём React.render(),
        //пытаются убрать из этого контейнера ДОМ-методом removeChild(). Реакт требует применить
        //ReactDOM.unmountComponentAtNode().
        ReactDOM.unmountComponentAtNode(this.uplFsListErrContainerRef.current);
    }
    
    universalTool(command, infoArgument) {
        if(command==DO.makeFilesToUploadList) {
/*            
            Здесь infoArgument - объект вида {
                makeErrPopupFunction: функция, возвращающая html-код попапа, который остаётся отрендерить,
                                    и принимающая аргументом здешнюю ф-ю для закрытия этого попапа;
                files: массив объектов класса File
            };
*/
 
//???            
            this.state.filesToUploadArr = infoArgument.files; //А его вообще нужно ли каждый раз переназначать? Ведь в UplDropzone это всё время один и тот же массив!
            //Может ли возникнуть ситуация, когда оба массива не равны null, и при этом они разные?
            //ЭТОТ МАССИВ ВООБЩЕ НИГДЕ НЕ СТАНОВИТСЯ null - только в ситуации, когда меняется юзер. Я проверил в Main.jsx. ВООБЩЕ ГОВОРЯ,
            //нужно как-то лишить программиста возможности случайно обнулить его.
            //ОДНАКО ситуация, когда они оба разные, наверное, возникнуть может, т.к. после перерисовки Галереи с созданием 
            //нового объекта дропзоны это уже будет другой массив.
            //Наверное, каждый раз переназначать всё-таки надёжнее - так мы не будем зависеть от того, создался другой объект дропзоны, или нет.


            if(infoArgument.makeErrPopupFunction) {
                ReactDOM.render(infoArgument.makeErrPopupFunction(this.closeUplFsListErrReport.bind(this), this.dropZoneErrPopupBtnRef), this.uplFsListErrContainerRef.current, function(){
                    this.dropZoneErrPopupBtnRef.current.focus();
                }.bind(this));
            }
        }
        else if(command==DO.uploadFiles) {
            //Здесь infoArgument - массив объектов класса File. 
            if(this.state.fsOperationStatus==FO_STATUS.noAction) {
                let uploadFormElement = document.querySelector("form.fileloader-form");
                let infoObject = {
                    uploadFormElement: uploadFormElement,
                    files: infoArgument,
                    imgFolder: this.state.currentImgFolder
                };
                
                this.state.fsOperationStatus = FO_STATUS.waitingForResults;
                this.props.uniTool(DO.uploadFiles, infoObject);
                
                this.state.dropzoneDisabled = true;                
                this.forceUpdate(); //Чтоб дропзона дисаблировалась
            }
            else this.openWaitFilesOpersFinishPopup();
        }
        else if(command==DO.downloadFiles) {
            if(this.state.fsOperationStatus==FO_STATUS.noAction) {
                let itemsToDownloadObj = {};
                
                //Дисаблируем скачиваемые итемы.
                for(let i=0; i<infoArgument.length; i++) {
                    let fName = infoArgument[i];
                    this.state.itemsObject[fName].disabled = true;
                    itemsToDownloadObj[fName] = {"selected": true}; //Просто ставим в true, т.к. скачивать 
                    //можно только выделенные итемы.
                }

                if(this.state.imgFVActive && this.imgFullViewRef.current) this.imgFullViewRef.current.setDisabledViewsInVList();

                this.state.fsOperationStatus = FO_STATUS.waitingForResults;
                
                let fullReqObject = {
                    imgFolder: this.state.currentImgFolder,
                    itemsToDownloadObject: itemsToDownloadObj
                }
                
                this.props.uniTool(DO.downloadFiles, fullReqObject);
                
                this.forceUpdate(); //Обновляемся, чтобы в ShowGallery отобразилось дисаблирование удаляемых итемов.

            }
            else {
                this.openWaitFilesOpersFinishPopup();
            }
        }
        else if(command==DO.selectGlrItem) {
            //Здесь infoArgument - объект {fileName: значение, selected: true/false}
            this.state.itemsObject[infoArgument.fileName].selected = infoArgument.selected;
            if(infoArgument.selected==true) {
                this.state.selectedItemsObject[infoArgument.fileName] = true; //Значение не важно, на самом
                //деле - оно всё равно не будет использоваться.
                this.state.selectedItemsCount++;
                if(this.state.selectedItemsCount==1 && !this.state.imgFVActive) {
                   this.iMBBRef.current.showSelItemsManagerButtons();
                } 
            }
            else {
                delete this.state.selectedItemsObject[infoArgument.fileName]; //Удаляем св-во из объекта.
                this.state.selectedItemsCount--;
                if(this.state.selectedItemsCount==0 && !this.state.imgFVActive) 
                {
                    this.iMBBRef.current.hideSelItemsManagerButtons();
                } 
            }
        }
        else if(command==DO.enterImgFullView) {
            //Здесь infoArgument - объект {"itemNumber": itemNumber, "fileName": fname}.
            this.enterImgFullView(infoArgument);
        }
        
        else if(command==DO.exitImgFullView) {
            //Здесь infoArgument вообще не используется.
            this.exitImgFullView();
        }
        else if(command==DO.confirmFilesRemoving) {
            //Открывает попап с запросом на подтверждение удаления.
            //Здесь infoArgument - массив имён файлов Галереи, которые нужно удалить.

            let SINStr = String(infoArgument.length); //SIN - selected items number. Делаем имена переменных 
            //покороче, чтоб в if() занимали поменьше места.
            let lindex = SINStr.length-1; //От слова last index
            let failovWord = "файлов";
            if(SINStr[lindex]=="1") {
                failovWord = "файл";
                if(lindex > 0 && SINStr[lindex-1]=="1") failovWord = "файлов";
            }
            else if(SINStr[lindex]=="2" || SINStr[lindex]=="3" || SINStr[lindex]=="4") {
                failovWord = "файла"; 
                if(lindex > 0 && SINStr[lindex-1]=="1") failovWord = "файлов";
            }
        
            this.state.fNamesToRemoveArr = infoArgument;

            let popupInfoObject = {
                button1_ClickHandler: this.confirmFlsRemovingByPopup.bind(this),
                button2_ClickHandler: function() {PopupsUniMethods.closeUniPopup(this.confirmRemovingWrapperRef, this.confirmRemovingContainerRef)}.bind(this),
                button1Text: "Yes",
                button2Text: "No",
                bgColor: "rgb(124, 155, 255)",
                borderColor: "rgb(124, 255, 255)",
                contentStrsArr: ["Удалить " + SINStr + " " + failovWord + "?"]
            };
            PopupsUniMethods.openUniPopupTwoButtons(this.confirmRemovingPopupRef, this.confirmRemovingWrapperRef, this.confirmRemovingContainerRef, popupInfoObject);

        }
        else if(command==DO.openFRenamingPopup) {
            //Здесь infoArgument - текущее имя переименуемого файла.
            if(this.state.fsOperationStatus==FO_STATUS.noAction)             
                this.openFRenamingPopup(infoArgument);
            else this.openWaitFilesOpersFinishPopup();
        }
    }

    openWaitFilesOpersFinishPopup() {
        let infoObject = {
            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.waitFOFinishWrapperRef, this.waitFOFinishContainerRef)}.bind(this),
            buttonText: "OK",
            bgColor: "rgb(34, 139, 34)",
            borderColor: "white",
            titleText: "Отказано!",
            titleBgColor: "rgb(50, 170, 50)",
            titleTextColor: "rgb(255, 215, 0)",
            contentStrsArr: ["Дождитесь окончания", "текущей операции с файлами..."]
        };
        PopupsUniMethods.openUniPopupOneButton(this.waitFOFinishPopupRef, this.waitFOFinishWrapperRef, this.waitFOFinishContainerRef, infoObject);
    }

    //Показать попап с запросом подтверждения на удаление выделенных итемов.
    openConfRemovingOfSelItemsPopup() {
        this.universalTool(DO.confirmFilesRemoving, Object.keys(this.state.selectedItemsObject));
    }
    
    //Скачать файлы, соответствующие выделенным итемам.
    downloadSelItems() {
        this.universalTool(DO.downloadFiles, Object.keys(this.state.selectedItemsObject));
    }
    
    confirmFlsRemovingByPopup() {
        //Итак, у нас есть массив this.state.fNamesToRemoveArr с именами файлов к удалению.
        //М.б. ситуация, когда мы удаляем один файл кнопкой Remove в ShowGallery. Он м.б. выделен или невыделен.
        //Если выделен, нужно удалить его из объекта this.state.selectedItemsObject и уменьшить на единицу параметр 
        //this.state.selectedItemsCount.
        //М.б. ситуация, когда мы удаляем все выделенные итемы. Тогда нужно полностью очистить this.state.selectedItemsObject
        //и обнулить this.state.selectedItemsCount.
        if(this.state.fsOperationStatus==FO_STATUS.noAction) {
            let removingInfoObject = {};
            let itemsToRemoveObject = {};
            let rmvFNamesArrLength = this.state.fNamesToRemoveArr.length;
        
            //Дисаблируем удаляемые итемы.
            if(rmvFNamesArrLength==1) {
                //В этом случае нужно проверить, выделен удаляемый итем, или нет. В противном случае
                //итемы не могут быть не выделены.
                let fName = this.state.fNamesToRemoveArr[0];
                let selected = this.state.itemsObject[fName].selected;
                this.state.itemsObject[fName].disabled = true;
                itemsToRemoveObject[fName] = {"selected": selected};
            }
            else {
                for(let i=0; i<rmvFNamesArrLength; i++) {
                    let fName = this.state.fNamesToRemoveArr[i];
                    this.state.itemsObject[fName].disabled = true;
                    itemsToRemoveObject[fName] = {"selected": true};
                }
            }
            
            removingInfoObject = {
                imgFolder: this.state.currentImgFolder,
                itemsToRemoveObject: itemsToRemoveObject
            };
            
            if(this.state.imgFVActive && this.imgFullViewRef.current) this.imgFullViewRef.current.setDisabledViewsInVList();
        
            PopupsUniMethods.closeUniPopup(this.confirmRemovingWrapperRef, this.confirmRemovingContainerRef);
            
            this.state.fsOperationStatus = FO_STATUS.waitingForResults;
            this.props.uniTool(DO.removeFiles, removingInfoObject);


            this.state.fNamesToRemoveArr = null; //Поскольку мы создали объект itemsToRemoveObject со св-вами-
            //именами удаляемых файлов, массив this.state.fNamesToRemoveArr нам больше не нужен. В принципе, 
            //обнулять эту ссылку на него не обязательно - при следующем удалении в неё запишется адрес нового
            //массива, затерев старый, и все эл-ты старого потеряются - но обнуление, думаю, логичнее и безопаснее. 

            this.forceUpdate(); //Обновляемся, чтобы в ShowGallery отобразилось дисаблирование удаляемых итемов.
        }
        else this.openWaitFilesOpersFinishPopup();
    }

    enterImgFullView(currentItemInfoObject) {
        this.state.imgFVCurrItemNumber = currentItemInfoObject.itemNumber;
        this.state.imgFVActive = true;
        this.forceUpdate();
    }
    
    exitImgFullView() {
        this.state.imgFVActive = false;
        this.state.shouldIMBBSelItemsButtonsHide = true;
        this.forceUpdate();
    }
    
    //Разлогиниться с выходом на главную страницу.
    signOut(event) {
        this.props.uniTool(DO.signOutToMainPage);
    }
    
    showUserProfile(event) {
        this.props.uniTool(DO.openUserProfile);
    }
    
    render() {
        let bodyStyle = {
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            background: NAMES_PATHS.backgroundColor,

            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            
            overflowX: "hidden"
        }

        let bgImageStyle = {
            zIndex: 0,
                
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            minHeight: "1100px"
        }

        let contentStyle = {
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column"
        }
        
        //Зачем этим дивам-контейнерам имена? - Чтобы в средствах разработки браузера их можно было различать - 
        //у них же нет классов.
        let popupsContainer = (
                <div ref={this.popupsContRef} style={{zIndex: 3}} className="gallery-popups-container">
                    <div name="confRemovingContainer" style={{zIndex: 1}} ref={this.confirmRemovingContainerRef}></div>
                    <div name="fRenamePopupContainer" style={{zIndex: 2}} ref={this.fRenamePopupContainerRef}></div>
                    <div name="goToPagePopupContainer" style={{zIndex: 3}} ref={this.goToPagePopupContainerRef}></div>
                    <div name="FILPopupContainer" style={{zIndex: 4}} ref={this.FILPopupContainerRef}></div>
                    <div name="SILPopupContainer" style={{zIndex: 5}} ref={this.SILPopupContainerRef}></div>
                    <div name="waitFOFinishContainer" style={{zIndex: 6}} ref={this.waitFOFinishContainerRef}></div>
                    <div name="uplFsListErrContainer" style={{zIndex: 7}} ref={this.uplFsListErrContainerRef}></div>
                    <div name="getItemsErrContainer" style={{zIndex: 8}} ref={this.getItemsErrReportContainerRef}></div>
                </div>);
                
        let userMenu = (
                <div className="user-menu">
                    <span className="user-menu__ancor" onClick={()=>{this.props.history.push("/")}}>
                        Главная
                    </span>
                    <span className="user-menu__ancors-separator">|</span>
                    <span className="user-menu__ancor" onClick={this.showUserProfile.bind(this)}>
                        Профиль
                    </span>
                    <span className="user-menu__ancors-separator">|</span>
                    <span className="user-menu__ancor" onClick={this.signOut.bind(this)}>
                        <font color="yellow">Выход</font>
                    </span>
                </div>);

        //Произошла ошибка при получении списка файлов текущей папки.
        if(this.state.errOfGettingOfFNames) 
            return (
                <div style={bodyStyle}>
                    <img ref={this.bgImgRef} style={bgImageStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.backgroundImg}/>

                    <div style={contentStyle}>
                        {popupsContainer}
                    
                        <div style={{zIndex: 3}} className="user-menu-container">
                            <div className="user-menu">
                                <span className="user-menu__ancor" onClick={()=>{this.props.history.push("/")}}>
                                    Главная
                                </span>
                            </div>
                        </div>            
                        <div style={{zIndex: 1}} className="showglr-container">
                            <img style={{width: "280px", height: "auto"}} src={NAMES_PATHS.designElementsUrlPath + "Gallery-error.png"}/>
                        </div>
                    </div>
                </div>); 

        //Юзер открыл Галерею, не авторизовавшись.
        if(this.state.userInfoObject.userID==SPECIAL_UID.unauthorised)
            return (
                <div style={bodyStyle}>
                    <img ref={this.bgImgRef} style={bgImageStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.backgroundImg}/>

                    <div style={contentStyle}>
                        {popupsContainer}

                        <div style={{zIndex: 1, marginTop: "40px"}} className="showglr-container">
                            <img style={{width: "415px", height: "auto"}} src={NAMES_PATHS.designElementsUrlPath + "Gallery-not-logged-in.png"}/>
                        </div>
                    </div>
                </div>); 

        if(this.state.userInfoObject.userID==SPECIAL_UID.signingIn) 
            return <div>Попытка авторизации...</div>; 
        
        
        //Список файлов ещё не был получен.
        if(!this.state.gotInitialFNamesList) return <div>Галерея загружается...</div>;

        //Всё нижеследующее совершается, если список файлов из текущей папки Галереи уже получен, 

        let galleryPagesN = Math.ceil(this.state.itemsCount/this.state.itemsOnPage);
        if(this.state.currentPage > galleryPagesN) this.state.currentPage = galleryPagesN;
        if(galleryPagesN==0) this.state.currentPage = 1;
        //Я не хотел вводить здесь эти расчёты, т.к. они делались бы при каждом рендеринге Gallery. Но, с другой
        //стороны, перенос их в другое место усложнит код, а сами по себе они не такие уж "тяжёлые". Пусть будут
        //здесь.
//???
        //Всё же нужно их убрать, возможно, вынеся вообще в отдельную ф-ю.

        if(!this.state.imgFVActive) {
            //По умолчанию считаем, что Галерея пуста (у только что зарегистрировавшегося юзера так и будет),
            //и соответствующим образом готовим showGalleryElement.
            let showGalleryElement = (
                <div style={{height: "350px", display: "flex", flexDirection: "column", justifyContent: "center"}}>
                    <img style={{width: "415px", height: "auto"}} src={NAMES_PATHS.designElementsUrlPath + "Gallery-empty.png"}/>
                </div>);
            let iMBBElement = <div></div>;
            let linksToPagesBlock = <div></div>;
            
            if(this.state.itemsCount > 0) {
                let firstFNameOnPageIndex = this.state.itemsOnPage*(this.state.currentPage-1);
                let lastFNameOnPageIndex = this.state.itemsOnPage*this.state.currentPage; 
                let visibleFNamesArr = this.state.fNamesArr.slice(firstFNameOnPageIndex, lastFNameOnPageIndex);
                let showGalleryInfoObject = {
                    userID: this.state.userInfoObject.userID,
                    folder: this.state.currentImgFolder,
                    allItemsObject: this.state.itemsObject,
                    visibleItemsFNamesArr: visibleFNamesArr, 
                    startItemNumber: Number(firstFNameOnPageIndex+1),
                };

                //Атрибут key нужен потому, что этот реакт-элемент будет включён в массив, а элементы, находящиеся в 
                //массивах, должны иметь уникальные ключи.
                let scrollToButtonReactElement = <button key="1" tabIndex="-1" style={{background: "radial-gradient(80% 80%, rgb(130, 144, 255), rgb(130, 94, 190))", color: "white"}} className="im__button" onClick={this.openGoToPagePopup.bind(this)}>Go to Page...</button>;
                let buttonsArr = [scrollToButtonReactElement]; 

                let iMBBInfoObject = {
                    openFullItemsListPopupFunc: this.openFullItemsListPopup.bind(this),
                    openSelItemsListPopupFunc: this.openSelectedItemsListPopup.bind(this),
                    removeSelItemsFunc: this.openConfRemovingOfSelItemsPopup.bind(this),
                    downloadSelItemsFunc: this.downloadSelItems.bind(this),
                    optionalButtonsReactElsArr: buttonsArr
                };

                let linksToPagesBlockInfo = {
                    currentPage: this.state.currentPage,
                    allPagesNumber: galleryPagesN,
                    linksInBlock: this.state.elsInLinksToPagesBlock, //Думал отменить этот параметр, но всё же логичнее оставить блок ссылок настраиваемым и в этом.
                    urlPreform: "gallery?page=",
                    history: this.props.history
                };

                showGalleryElement = <ShowGallery uniTool={this.uniTool} infoObject={showGalleryInfoObject} />;

                iMBBElement = (
                    <div style={{marginBottom: "4px"}} className="itemslist-manager-closewrapper">
                        <ItemsManagerButtonsBlock ref={this.iMBBRef} infoObject={iMBBInfoObject}/>
                    </div>);
/*
                linksToPagesBlock = (
                    <div className="pageslist">
                        <LinksToPagesBlock currentPage={this.state.currentPage} allPagesCount={galleryPagesN} urlPreform="gallery?page=" history={this.props.history} />
                    </div>);
*/
                linksToPagesBlock = (
                    <div className="pageslist">
                        <LinksToPagesBlock info={linksToPagesBlockInfo}/>
                    </div>);
            }

            
            let dropzoneInfoObject = {
              files: this.state.filesToUploadArr,  
            };
            
            bgImageStyle.minHeight = "1100px";

            return (
            <div style={bodyStyle}>
                <img ref={this.bgImgRef} style={bgImageStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.backgroundImg}/>

                <div style={contentStyle}>
                    {popupsContainer}

                    <div style={{zIndex: 3}} className="user-menu-container">
                        {userMenu}
                    </div>            
            
                    <div style={{zIndex: 1}} className="showglr-container">
                        {showGalleryElement}
                
                        {iMBBElement}
                
                        {linksToPagesBlock}
                    </div>
            
                    <div style={{zIndex: 1}} className="fileloader-container">
                        <form className="fileloader-form" method="post" encType="multipart/form-data">
                            <UplDropzone ref={this.dropzoneRef} infoObject={dropzoneInfoObject} uniTool={this.uniTool} disabled={this.state.dropzoneDisabled}/>
                        </form>                
                    </div>
                </div>
            </div>);
        }
        else {
            let imgFullViewInfoObject = {
                userID: this.state.userInfoObject.userID,
                folder: this.state.currentImgFolder,
                currentItemInfo: {itemNumber: this.state.imgFVCurrItemNumber},
                allItemsObject: this.state.itemsObject,
                selectedItemsObject: this.state.selectedItemsObject,
                adaptParams: this.props.infoObject.adaptParams.gallery_imgFullViewInfoObject,
                fsOperationStatus: this.state.fsOperationStatus,
            };

            let imgFullViewElement = <ImageFullView ref={this.imgFullViewRef} zindex={2} infoObject={imgFullViewInfoObject} uniTool={this.uniTool}/>;


            bgImageStyle.minHeight = "1000px";

            return (
            <div style={bodyStyle}>
                <img ref={this.bgImgRef} style={bgImageStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.backgroundImg}/>

                <div style={contentStyle}>
                    {popupsContainer}

                    <div style={{zIndex: 3}} className="user-menu-container">
                        {userMenu}
                    </div> 
                
                    {imgFullViewElement}
                </div>
            </div>);

        }
    }
}