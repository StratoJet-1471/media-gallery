import React from "react";

import { limits as LIMITS,
    internalAPI_filesOperationStatusCodes as FO_STATUS,
    internalAPI_commandCodes as DO, 
    internalAPI_operationResultCodes as RESULT} from "../ControlsAndAPI.js";

import makeStringMinimised from "../MakeStringMinimised.js";

import MyDraggable from "./MyDraggable.jsx";

import "../css/styles_all.css";

export default class OperationsReport extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
           
            fileExistsIndsArrIteratingActive: false, //Показывает, идёт ли переборка массива fileExistsIndsArr.
            fileExistsIndsArrIterator: 0, //"Переборщик" массива, содержащий индекс текущего эл-та.
            fileExistsIndsArr: undefined, //Здесь будет ссылка на пришедший с сервера массив индексов файлов
            //в массиве this.props.infoObject.processedFilesArr (в Главном Компоненте это массив state.filesToUploadArr),
            //которые уже есть в Галерее.
            filesToOverwriteIndexesArr: [], //Массив с индексами элементов из массива this.props.infoObject.processedFilesArr.
            //Эти элементы - объекты File, которые нужно будет перезаписать - т.е., снова отправить на сервер.
            
            shouldShowFileExistsPopup: false
        }

        this.closeThisPopup = this.closeThisPopup.bind(this);
        
        //РЕФЫ:
        this.okButtonRef = React.createRef();
        this.skipButtonRef = React.createRef();
        this.overwriteButtonRef = React.createRef();
    }
   
    closeThisPopup(event) {
        let reportOutcome = {flag: null, info: null};
//???
        //Спрашивается - зачем нужен этот reportOutcome, если там всё null? Ответ - просто ф-я this.props.uniTool()
        //в Главном Компоненте при значении её первого аргумента DO.closeOpersReport должна принимать второй
        //аргумент вот такого формата. ВПРОЧЕМ, это можно как-нибудь усовершенствовать - например, передавать
        //пустой объект, или вообще не передавать второго аргумента.

        this.props.uniTool(DO.closeOpersReport, reportOutcome);
    }
    

    confirmOverwritingAndIterate(event) {
        let sameForAllCheckBox = document.querySelector(".popup-oprp-rewriting__checkbox");
        if(!sameForAllCheckBox.checked) {
        
            if(this.state.fileExistsIndsArrIterator < this.state.fileExistsIndsArr.length) {
                let index = this.state.fileExistsIndsArr[this.state.fileExistsIndsArrIterator];
                this.state.filesToOverwriteIndexesArr.push(index);
               
                this.state.fileExistsIndsArrIterator++;
            }
            if(this.state.fileExistsIndsArrIterator < this.state.fileExistsIndsArr.length) {
                this.forceUpdate();
            }
            else {
                this.state.fileExistsIndsArrIteratingActive = false;
                this.state.fileExistsIndsArrIterator = 0;   
                
                //Вот здесь нужно вывести сообщение об ошибке, если она возникла, и только при нажатии ОК в нём
                //вызывать this.props.uniTool(DO.closeOpersReport, reportOutcome).
                //ОДНАКО правильно ли поймёт юзер? Он ведь подумает, что ошибка относится к чему-то, что он сделал
                //только что, уже с этими перезаписываемыми файлами, а не к тому, что было до них.
                //!!!ВСЁ-ТАКИ сообщение об ошибке должно выводиться ДО.
                this.state.shouldShowFileExistsPopup = false;
                let reportOutcome = {flag: FO_STATUS.uplFilesAlreadyExist, info: this.state.filesToOverwriteIndexesArr};
                this.props.uniTool(DO.closeOpersReport, reportOutcome);
            }
        }
        else {
            while(this.state.fileExistsIndsArrIterator < this.state.fileExistsIndsArr.length) {
                let index = this.state.fileExistsIndsArr[this.state.fileExistsIndsArrIterator];
                this.state.filesToOverwriteIndexesArr.push(index);
               
                this.state.fileExistsIndsArrIterator++;
            }
            
            this.state.fileExistsIndsArrIteratingActive = false;
            this.state.fileExistsIndsArrIterator = 0;
            
            //Вот здесь нужно вывести сообщение об ошибке, если она возникла, и только при нажатии ОК в нём
            //вызывать this.props.uniTool(DO.closeOpersReport, reportOutcome).
            this.state.shouldShowFileExistsPopup = false;
            let reportOutcome = {flag: FO_STATUS.uplFilesAlreadyExist, info: this.state.filesToOverwriteIndexesArr};
            this.props.uniTool(DO.closeOpersReport, reportOutcome);
        }
    }
    
    skipOverwritingAndIterate(event) {
        let sameForAllCheckBox = document.querySelector(".popup-oprp-rewriting__checkbox");
        if(!sameForAllCheckBox.checked) {
            //ВОТ ЭТО ДЕБИЛЬНОЕ МЕСТО УБРАТЬ!
            if(this.state.fileExistsIndsArrIterator < this.state.fileExistsIndsArr.length) {
                this.state.fileExistsIndsArrIterator++;
            }
            if(this.state.fileExistsIndsArrIterator < this.state.fileExistsIndsArr.length) {
                this.forceUpdate();
            }
            else {
                this.state.fileExistsIndsArrIteratingActive = false;
                this.state.fileExistsIndsArrIterator = 0;          
                
                //Вот здесь нужно вывести сообщение об ошибке, если она возникла, и только при нажатии ОК в нём
                //вызывать this.props.uniTool(DO.closeOpersReport, reportOutcome).
                this.state.shouldShowFileExistsPopup = false;
                let reportOutcome = {flag: FO_STATUS.uplFilesAlreadyExist, info: this.state.filesToOverwriteIndexesArr};
                this.props.uniTool(DO.closeOpersReport, reportOutcome);
            }
        }
        else {
            this.state.fileExistsIndsArrIteratingActive = false;
            this.state.fileExistsIndsArrIterator = 0;          
            
            //Вот здесь нужно вывести сообщение об ошибке, если она возникла, и только при нажатии ОК в нём
            //вызывать this.props.uniTool(DO.closeOpersReport, reportOutcome).
            this.state.shouldShowFileExistsPopup = false;
            let reportOutcome = {flag: FO_STATUS.uplFilesAlreadyExist, info: this.state.filesToOverwriteIndexesArr};
            this.props.uniTool(DO.closeOpersReport, reportOutcome); 
        }

    }

    makeFileExistsPopupContent() {
        let content = <React.Fragment></React.Fragment>;
        let infoObject = this.props.infoObject;
        
        if(this.state.fileExistsIndsArrIterator==0 && !this.state.fileExistsIndsArrIteratingActive) {
            this.state.fileExistsIndsArrIteratingActive = true;
            this.state.fileExistsIndsArr = infoObject.reportObject.faultyUploads_fileExists;
            //Очищаем массив.
            this.state.filesToOverwriteIndexesArr.splice(0, this.state.filesToOverwriteIndexesArr.length);
        }          
     
        if(this.state.fileExistsIndsArrIteratingActive) {
            let index = this.state.fileExistsIndsArr[this.state.fileExistsIndsArrIterator];
            let fName = infoObject.processedFilesArr[index].name;

            let allowableFName = makeStringMinimised(fName, LIMITS.inPopup_fNameMaxLength);
 
            content = (
                    <div className="popup-oprp-rewriting">
                        <div><span className="popup-oprp-universal-text">Этот файл уже есть в Галерее:</span></div>
                        <div><span className="popup-oprp-universal-text" title={fName}>{allowableFName}</span></div>
                        <div className="popup-oprp-rewriting__checkbox-container">
                            <input type="checkbox" className="popup-oprp-rewriting__checkbox" />
                            <span className="popup-oprp-rewriting__checkbox-text"> - то же для следующих случаев</span>
                        </div>
                        <div className="popup-universal-centering-container">
                            <button ref={this.skipButtonRef} className="popup-oprp-rewriting__button" onClick={this.skipOverwritingAndIterate.bind(this)}>
                                Пропустить
                            </button>
                            <button ref={this.overwriteButtonRef} className="popup-oprp-rewriting__button" onClick={this.confirmOverwritingAndIterate.bind(this)}>
                                Перезаписать
                            </button>
                        </div>
                    </div>);
        }
        return content;
    }

    showFileExistsPopup(event) {
        this.state.shouldShowFileExistsPopup = true;
        this.forceUpdate();
    }

    componentDidMount() {
        if(this.okButtonRef.current) this.okButtonRef.current.focus();
        else if(this.skipButtonRef.current) this.skipButtonRef.current.focus();
    }
    
    componentDidUpdate() {
        if(this.okButtonRef.current) this.okButtonRef.current.focus();
        else if(this.skipButtonRef.current) this.skipButtonRef.current.focus();
    }

    render() {
        let content = false;//<React.Fragment></React.Fragment>;
        
        if(this.props.active) {
            let infoObject = this.props.infoObject;
            
            if(infoObject) {
                let operationResult = infoObject.operationResult;

                if(operationResult==RESULT.filesRemoved) { 
                    let reportObject = infoObject.reportObject;
                    
                    //Нужно обработать случаи:
                    // - все файлы удалились без ошибок, директория прочиталась;
                    // - все файлы удалились без ошибок, директория НЕ прочиталась;
                    // - часть удалилась, часть - НЕТ, директория прочиталась;
                    // - часть удалилась, часть - НЕТ, директория НЕ прочиталась;
                    // - ни один НЕ удалился, директория НЕ прочиталась.

                    //Сообщение об ошибке чтения директории нужно встраивать в тот же попап.
                    
                    if(reportObject.succRemovedFNames.length>0 && reportObject.failedRmvFNames.length==0) { //Все файлы удалились успешно.
                        let readDirErrReactEl = <React.Fragment></React.Fragment>;
                        let text = "Файл удалён успешно!";
                        if(reportObject.succRemovedFNames.length > 1) text = "Файлы удалены успешно!";

                        let popupAllOkStyle = {
                            backgroundColor: "rgb(78, 194, 103)",
                            width: "320px",
                            height: "100px"
                        };
                        
                        let titleAllOkStyle = {
                            fontSize: "19px",
                            color: "white"                            
                        };
                        
                        let currentPopupStyle = popupAllOkStyle;
                        let currentTitleStyle = titleAllOkStyle;
                        
                        if(reportObject.readDirErr) { //Прочитать директорию с файлами Галереи не удалось.
                            let popupWithReadDirErrStyle = {
                                backgroundColor: "rgb(255, 174, 0)",
                                border: "2px solid yellow",
                                width: "470px",
                                height: "150px"
                            };
                            
                            let titleWithReadDirErrStyle = {
                                fontSize: "19px",
                                color: "rgb(41, 28, 2)"                            
                            };                            
                        
                            let readDirErrBlockStyle = {
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "rgb(255, 0, 0)",
                                border: "2px solid white",
                                borderRadius: "10px"
                            };
                            
                            let readDirErrTitleStyle = {
                                color: "gold",
                                fontSize: "19px",
                                marginLeft: "5px",
                                marginRight: "5px"
                            };
                            
                            currentPopupStyle = popupWithReadDirErrStyle;
                            currentTitleStyle = titleWithReadDirErrStyle;
                            
                            readDirErrReactEl = (
                                <div style={readDirErrBlockStyle}>
                                    <span style={readDirErrTitleStyle}>Возникла ошибка отображения результатов!</span>
                                    
                                    <div>
                                        <ul style={{color: "white"}}>
                                            <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Обновите страницу Галереи.</span></li>
                                        </ul>
                                    </div>
                                </div>
                            );
                        }
                        
                        content = (
                            <div style={currentPopupStyle} className="popup-oprp-allok">
                                <div><span style={currentTitleStyle} className="popup-oprp-allok__text">{text}</span></div>

                                {readDirErrReactEl}

                                <div>
                                    <button ref={this.okButtonRef} className="popup-oprp-allok__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                </div>
                            </div>);
                    }
                    else {//При удалении, по крайней мере, части файлов возникла ошибка.
                        let successContentPart = <React.Fragment></React.Fragment>;
                        let errorsContentPart = <React.Fragment></React.Fragment>;

                        let succLength = reportObject.succRemovedFNames.length;
                        if(succLength > 0) {//Некоторые файлы всё же удалились успешно.

                            let fNamesLengthArr = [];
                            let symbolWidth = 9;

                            if(succLength <= LIMITS.inPopup_liElsMaxCount) { //Можно обойтись обычным маркированным списком.
                                let successLiArray = [];
                                
                                for(let i=0; i<succLength; i++) {
                                    let liText = makeStringMinimised(reportObject.succRemovedFNames[i], LIMITS.inPopup_fNameMaxLength);
                                    let liElement = <li title={reportObject.succRemovedFNames[i]}>{liText}</li>;
                                    
                                    fNamesLengthArr.push(liText.length);
                                    
                                    successLiArray.push(liElement);
                                }
                                successContentPart = (
                                <span>
                                    Следующие файлы успешно удалены: <br/>
                                    <ul>{successLiArray}</ul>
                                </span>);
                            }
                            else { //Нужен список успешно удалённых файлов с прокруткой.
                                let successOptionsArray = [];
                                for(let i=0; i<succLength; i++) {
                                    let fName = makeStringMinimised(reportObject.succRemovedFNames[i], LIMITS.inPopup_fNameMaxLength);
                                    successOptionsArray.push(<option title={reportObject.succRemovedFNames[i]}>{fName}</option>);
                                    fNamesLengthArr.push(fName.length);
                                }    
                                successContentPart = (
                                    <span>
                                        Следующие файлы успешно удалены: <br/>
                                        <select size={LIMITS.inPopup_liElsMaxCount+1} className="popup-oprp-rmv-partialfail__success-select">{successOptionsArray}</select>
                                    </span>);
                            }
                            
                            let failedLength = reportObject.failedRmvFNames.length;
                            if(failedLength <= LIMITS.inPopup_liElsMaxCount) { //Можно обойтись обычным маркированным списком.
                                let errorsLiArray = [];
                                for(let i=0; i<failedLength; i++) {
                                    let liText = makeStringMinimised(reportObject.failedRmvFNames[i], LIMITS.inPopup_fNameMaxLength);
                                    let liElement = <li title={reportObject.failedRmvFNames[i]}>{liText}</li>;
                                    
                                    fNamesLengthArr.push(liText.length);
                                    
                                    errorsLiArray.push(liElement);
                                }


                                errorsContentPart = (
                                <span>
                                    Ошибка при удалении этих файлов: <br/>
                                    <ul>{errorsLiArray}</ul>
                                </span>);
                            }
                            else { //Нужен список ошибочных файлов с прокруткой.
                                let errorOptionsArray = [];
                                for(let i=0; i<failedLength; i++) {
                                    let fName = makeStringMinimised(reportObject.failedRmvFNames[i], LIMITS.inPopup_fNameMaxLength);
                                    errorOptionsArray.push(<option title={reportObject.failedRmvFNames[i]}>{fName}</option>);
                                    fNamesLengthArr.push(fName.length);
                                }    
                                errorsContentPart = (
                                    <span>
                                        Ошибка при удалении этих файлов: <br/>
                                        <select size={LIMITS.inPopup_liElsMaxCount+1} className="popup-oprp-rmv-partialfail__fail-select">{errorOptionsArray}</select>
                                    </span>);
                            }
                            
                            //Находим наибольший эл-т в массиве.
                            //Источник с инфой об этой ф-и: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/max
                            let maxFNameWidth = Math.max.apply(null, fNamesLengthArr);
                            let hypothPopupWidth = maxFNameWidth*symbolWidth + 65; //hypoth... - от слова hypothetical.
                            let minPopupWidth = 308;
                            let popupWidth = Math.max(hypothPopupWidth, minPopupWidth);
                            let failedRmvFNamesFieldWidth = popupWidth-15;

                            popupWidth += "px";
                            failedRmvFNamesFieldWidth += "px";

                            let popupStyle = {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: popupWidth
                            };

                            if(!reportObject.readDirErr) {//Директория с файлами Галереи прочиталась успешно.
                                content = (
                                    <div style={popupStyle} className="popup-oprp-rmv-partialfail">
                                        <div>{successContentPart}</div>
                                        <div style={{width: failedRmvFNamesFieldWidth}} className="popup-oprp-rmv-partialfail__fail">
                                            {errorsContentPart}
                                            <div className="popup-universal-centering-container">
                                                <button ref={this.okButtonRef} className="popup-oprp-rmv-partialfail__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                            </div>
                                        </div>
                                    </div>);
                            }
                            else {//Прочитать директорию с файлами Галереи не удалось.
                                let readDirErrBlockStyle = {
                                    display: "flex",
                                    flexDirection: "column",
                                    backgroundColor: "rgb(255, 0, 0)",
                                    border: "2px solid white",
                                    borderRadius: "10px",
                                    width: failedRmvFNamesFieldWidth
                                };
                            
                                let readDirErrTitleStyle = {
                                    color: "white",
                                    fontSize: "19px",
                                };                                
                                
                                content = (
                                    <div style={popupStyle} className="popup-oprp-rmv-partialfail">
                                        <div>{successContentPart}</div>
                                        <div style={{width: failedRmvFNamesFieldWidth, marginBottom: "3px"}} className="popup-oprp-rmv-partialfail__fail">
                                            {errorsContentPart}
                                        </div>
                                        <div style={readDirErrBlockStyle} className="popup-oprp-rmv-partialfail__fail">
                                            <div className="popup-universal-centering-container">
                                                <span style={readDirErrTitleStyle}>Ошибка отображения результатов!</span>
                                            </div>
                                            
                                            <div>
                                                <ul style={{color: "white"}}>
                                                    <li><span style={{fontSize: "18px"}} className="popup-oprp-universal-text">Обновите страницу Галереи.</span></li>
                                                </ul>
                                            </div>                                        
                                        
                                            <div className="popup-universal-centering-container">
                                                <button ref={this.okButtonRef} className="popup-oprp-rmv-partialfail__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                            </div>
                                        </div>
                                    </div>);
                            }
                        }
                        else { //Ни один файл успешно не удалился.
                            let readDirErrPart = <React.Fragment></React.Fragment>;
                            let text = "Ошибка при удалении файла";
                            if(reportObject.failedRmvFNames.length > 1) text = "Ошибка при удалении файлов";
                        
                            if(reportObject.readDirErr) //Прочитать директорию с файлами Галереи не удалось.
                                readDirErrPart = (
                                    <li>
                                        <span style={{fontSize: "18px"}} className="popup-oprp-universal-text">
                                            Ошибка отображения результатов.<br/>Обновите страницу Галереи.
                                        </span>
                                    </li>);

                            content = (
                                <div style={{justifyContent: "space-between"}} className="popup-oprp-fail">
                                    <span style={{color: "yellow", fontSize: "20px", marginTop: "10px"}}>Возникли ошибки!</span>
                                    <div>
                                        <ul style={{color: "white"}}>
                                            <li><span style={{fontSize: "18px"}} className="popup-oprp-universal-text">{text}</span></li>
                                            {readDirErrPart}
                                        </ul>
                                    </div>
                                    <div style={{marginBottom: "5px"}}>
                                        <button ref={this.okButtonRef} className="popup-oprp-fail__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                    </div>
                                </div>);
                        }
                        
                    }
                }


                
                else if(operationResult==RESULT.filesUploaded) {
                    //Нужно обработать случаи:
                    // - все файлы загрузились без ошибок, директория прочиталась;
                    // - все файлы загрузились без ошибок, директория НЕ прочиталась;
                    // - некоторые файлы не загрузились, т.к. были недопустимого типа, директория прочиталась;
                    // - аналогично, но директория НЕ прочиталась;
                    // - ни один файл не загрузился, директория прочиталась;
                    // - ни один файл не загрузился, директория НЕ прочиталась.
                    //Отдельный случай - когда встаёт вопрос о перезаписи файлов.
                    
                    //Сообщение об ошибке чтения директории нужно встраивать в тот же попап.

                    let reportObject = infoObject.reportObject;

//????
                    //А нужно ли тут вообще условие reportObject.succUploads.length>0? Как при прочих равных
                    //здесь может получиться reportObject.succUploads.length=0?
                    //При обработке ошибок удаления файлов мы тоже проверяем размер масива успешно удалённых.
                    //Так что пока оставим.
                    //Вроде при какой-то ошибке может получиться, что и reportObject.faultyUploads_mimeType.length = 0,
                    //и всё остальное, и при отсутствии условия с reportObject.succUploads.length ошибка не обработается.

                    if(reportObject.faultyUploads_fileExists.length==0 && 
                    reportObject.faultyUploads_mimeType.length==0 && 
                    reportObject.succUploads.length>0 &&
                    !reportObject.uploadingErr) { //Все файлы загрузились без ошибок, одноимённых файлов не найдено.
                        let readDirErrReactEl = <React.Fragment></React.Fragment>;
                        let text = "Файл загружен успешно!";
                        if(reportObject.succUploads.length > 1) text = "Файлы загружены успешно!";

                        let popupAllOkStyle = {
                            backgroundColor: "rgb(78, 194, 103)",
                            width: "320px",
                            height: "100px"
                        };
                        
                        let titleAllOkStyle = {
                            fontSize: "19px",
                            color: "white"                            
                        };
                        
                        let currentPopupStyle = popupAllOkStyle;
                        let currentTitleStyle = titleAllOkStyle;
                        
                        if(reportObject.readDirErr) { //Прочитать директорию с файлами Галереи не удалось.
                            let popupWithReadDirErrStyle = {
                                backgroundColor: "rgb(255, 174, 0)",
                                border: "2px solid yellow",
                                width: "470px",
                                height: "150px"
                            };
                            
                            let titleWithReadDirErrStyle = {
                                fontSize: "19px",
                                color: "rgb(41, 28, 2)"                            
                            };                            
                        
                            let readDirErrBlockStyle = {
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "rgb(255, 0, 0)",
                                border: "2px solid white",
                                borderRadius: "10px"
                            };
                            
                            let readDirErrTitleStyle = {
                                color: "gold",
                                fontSize: "19px",
                                marginLeft: "5px",
                                marginRight: "5px"
                            };
                            
                            currentPopupStyle = popupWithReadDirErrStyle;
                            currentTitleStyle = titleWithReadDirErrStyle;
                            
                            readDirErrReactEl = (
                                <div style={readDirErrBlockStyle}>
                                    <span style={readDirErrTitleStyle}>Возникла ошибка отображения результатов!</span>
                                    <div>
                                        <ul style={{color: "white"}}>
                                            <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Обновите страницу Галереи.</span></li>
                                        </ul>
                                    </div>
                                </div>
                            );                        
                        }
                        
                        content = (
                            <div style={currentPopupStyle} className="popup-oprp-allok">
                                <div><span style={currentTitleStyle} className="popup-oprp-allok__text">{text}</span></div>

                                {readDirErrReactEl}

                                <div>
                                    <button ref={this.okButtonRef} className="popup-oprp-allok__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                </div>
                            </div>);
                    }
                    
                    if((reportObject.faultyUploads_fileExists.length>0 && 
                    reportObject.faultyUploads_mimeType.length==0 && 
                    !reportObject.uploadingErr) || 
                    this.state.shouldShowFileExistsPopup) {//Либо все файлы загрузились без ошибок, 
                    //но найдены одноимённые, либо прямо указывается через shouldShowFileExistsPopup, что 
                    //нужно показывать попап FileExists (это происходит, если файлы загрузились с ошибками,
                    //и нужно сначала показать юзеру попапы с сообщениями об этих ошибках, а потом уже - попап
                    //FileExists).
                        //alert(this.props.infoObject.processedFilesArr.length);
                        content = this.makeFileExistsPopupContent();
                    }

                    
                    if((reportObject.uploadingErr || reportObject.faultyUploads_mimeType.length > 0) && !this.state.shouldShowFileExistsPopup) {
                        //При текущем концепте ошибка uploadingErr может произойти в одном случае: если какой-то
                        //мультер сгенерировал ошибку "Слишком большой файл". Однако нужно предусмотреть попап и
                        //на случай других вариантов этой ошибки.

                        let uploadingErrMsgBlock = <React.Fragment></React.Fragment>;
                        let mimeTypeErrMsgBlock = <React.Fragment></React.Fragment>;
                        let popupWidth = "400px";

                        let popupOKFunction = this.closeThisPopup;
                        if(reportObject.faultyUploads_fileExists.length > 0)
                            popupOKFunction = this.showFileExistsPopup.bind(this);
                        
                        if(reportObject.uploadingErr) {
                            let errObject = JSON.parse(reportObject.uploadingErr);
                            
                            uploadingErrMsgBlock =  (
                                <div className="popup-universal-centering-container">
                                    <span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Server Error</span>
                                </div>);  
                                
                            if(errObject.hasOwnProperty("code")) {
                                if(errObject.code=="LIMIT_FILE_SIZE") {
                                    let topText = "Файл слишком велик!"; 
                                    let lowerText = "Допустимый размер " + LIMITS.maxFileSize + " байт.";
                                    
                                    if(infoObject.processedFilesArr.length>1) {
                                        topText = "Один или несколько файлов слишком велики!";
                                        popupWidth = "430px";
                                    }
                                        
                                    uploadingErrMsgBlock = (
                                        <React.Fragment>
                                            <div className="popup-universal-centering-container">
                                                <span style={{fontSize: "19px", marginBottom: "0px"}} className="popup-oprp-universal-text">{topText}</span>
                                            </div>
                                            <div className="popup-universal-centering-container">
                                                <span style={{fontSize: "19px", marginTop: "0px"}} className="popup-oprp-universal-text">{lowerText}</span>
                                            </div>
                                        </React.Fragment>);

                                }
                            }
                        }

                        if(reportObject.faultyUploads_mimeType.length > 0) {
                            //В данном блоке нет нужды делать его ширину зависимой от самого длинного имени
                            //файла: надписи в заглавии всё равно длиннее.
                                
                            let fNamesSelectWidth = "350px"; //Ширина списка с прокруткой, если понадобится он.
                            let faultyLength = reportObject.faultyUploads_mimeType.length;
                            
                            //В reportObject.faultyUploads_mimeType содержатся индексы. Нам же требуется 
                            //показать юзеру список имён файлов, отсортированных по алфавиту.
                            let faultyFNamesArr = [];
                            for(let i=0; i<faultyLength; i++) {
                                let fName = infoObject.processedFilesArr[reportObject.faultyUploads_mimeType[i]].name;
                                faultyFNamesArr.push(fName);
                            }
                                
                            faultyFNamesArr.sort();   
                            
                            if(faultyLength <= LIMITS.inPopup_liElsMaxCount) {//Можно обойтись обычным маркированным списком.
                                let faultyLiArray = [];
                                    
                                for(let i=0; i<faultyLength; i++) {
                                    let fName = faultyFNamesArr[i];
                                    let liText = makeStringMinimised(fName, LIMITS.inPopup_fNameMaxLength);
                                    let liElement = <li title={fName}>{liText}</li>;
                                    faultyLiArray.push(liElement);
                                }
                                    
                                mimeTypeErrMsgBlock = <div><ul style={{fontSize: "19px", color: "white"}}>{faultyLiArray}</ul></div>;
                            }
                            else {//Нужен список с прокруткой.
                                let fNamesSelectStyle = {
                                    width: fNamesSelectWidth,
                                    backgroundColor: "rgb(243, 196, 182)",
                                    color: "rgb(30, 30, 30)",
                                    fontSize: "19px"
                                };
                                let faultyOptionsArray = [];
                                for(let i=0; i<faultyLength; i++) {
                                    let fName = faultyFNamesArr[i];
                                    let allowableFName = makeStringMinimised(fName, LIMITS.inPopup_fNameMaxLength);
                                    faultyOptionsArray.push(<option title={fName}>{allowableFName}</option>);
                                }  
                                    
                                mimeTypeErrMsgBlock = (
                                    <div className="popup-universal-centering-container">
                                        <select style={fNamesSelectStyle} size={LIMITS.inPopup_liElsMaxCount+1}>{faultyOptionsArray}</select>
                                    </div>);
                            }                            
                        }


                        let readDirErrBlockStyle, readDirErrTitleStyle;
                        if(reportObject.readDirErr) {
                            readDirErrBlockStyle = {
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "rgb(255, 20, 0)",
                                border: "2px solid rgb(255, 190, 190)",
                                borderRadius: "10px"
                            };
                                    
                            readDirErrTitleStyle = {
                                color: "gold",
                                fontSize: "19px",
                                marginLeft: "5px",
                                marginRight: "5px"
                            };
                        }

                        if(reportObject.uploadingErr && reportObject.faultyUploads_mimeType.length==0) {
                            if(reportObject.readDirErr) {
                                popupWidth = "430px";

                                let readDirErrText = "Обновите страницу Галереи.";
                                if(reportObject.faultyUploads_fileExists.length > 0) {
                                    popupWidth = "500px";
                                    readDirErrText = "По окончании операции обновите страницу Галереи.";
                                }
                                    
                                content = (
                                    <div style={{width: popupWidth}} className="popup-oprp-uploading-fail">
                                        <div className="popup-universal-centering-container">
                                            <span style={{fontSize: "21px", color: "yellow"}}>При загрузке возникли ошибки.</span>
                                        </div>
                            
                                        {uploadingErrMsgBlock}
                                        
                                        <div style={{marginTop: "4px", marginBottom: "2px"}} className="popup-universal-centering-container">
                                            <div style={readDirErrBlockStyle}>
                                                <div className="popup-universal-centering-container">
                                                    <span style={readDirErrTitleStyle}>Возникла ошибка отображения результатов!</span>
                                                </div>
                                                <div>
                                                    <ul style={{color: "white"}}>
                                                        <li><span style={{fontSize: "19px", marginRight: "5px"}} className="popup-oprp-universal-text">{readDirErrText}</span></li>
                                                    </ul>
                                                </div>
                                                    
                                                <div className="popup-universal-centering-container">
                                                    <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={popupOKFunction} onClick={popupOKFunction}>OK</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>);
                            }
                            else {
                                content = (
                                    <div style={{width: popupWidth}} className="popup-oprp-uploading-fail">
                                        <div className="popup-universal-centering-container">
                                            <span style={{fontSize: "21px", color: "yellow"}}>При загрузке возникли ошибки.</span>
                                        </div>
                                        {uploadingErrMsgBlock}
                                        <div className="popup-universal-centering-container">
                                            <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={popupOKFunction} onClick={popupOKFunction}>OK</button>
                                        </div>
                                    </div>);
                            }
                        }
                        else if(reportObject.faultyUploads_mimeType.length > 0 && !reportObject.uploadingErr) {
                            if(reportObject.readDirErr) {
                                popupWidth = "430px";

                                let readDirErrText = "Обновите страницу Галереи.";
                                if(reportObject.faultyUploads_fileExists.length > 0) {
                                    popupWidth = "500px";
                                    readDirErrText = "По окончании операции обновите страницу Галереи.";
                                }
                                    
                                    
                                content = (
                                    <div style={{width: popupWidth}} className="popup-oprp-uploading-fail">
                                        <div className="popup-universal-centering-container">
                                            <span style={{fontSize: "21px", color: "yellow"}}>При загрузке возникли ошибки.</span>
                                        </div>
                                        <div className="popup-universal-centering-container">
                                            <span style={{fontSize: "19px", color: "white"}}>У данных файлов недопустимый MIME-тип:</span>
                                        </div>                            
                                        {mimeTypeErrMsgBlock}
                                        
                                        <div style={{marginTop: "4px", marginBottom: "2px"}} className="popup-universal-centering-container">
                                            <div style={readDirErrBlockStyle}>
                                                <div className="popup-universal-centering-container">
                                                    <span style={readDirErrTitleStyle}>Возникла ошибка отображения результатов!</span>
                                                </div>
                                                <div>
                                                    <ul style={{color: "white"}}>
                                                        <li><span style={{fontSize: "19px", marginRight: "5px"}} className="popup-oprp-universal-text">{readDirErrText}</span></li>
                                                    </ul>
                                                </div>
                                                    
                                                <div className="popup-universal-centering-container">
                                                    <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={popupOKFunction} onClick={popupOKFunction}>OK</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>);
                            }
                            else {
                                content = (
                                    <div style={{width: popupWidth}} className="popup-oprp-uploading-fail">
                                        <div className="popup-universal-centering-container">
                                            <span style={{fontSize: "21px", color: "yellow"}}>При загрузке возникли ошибки.</span>
                                        </div>
                                        <div className="popup-universal-centering-container">
                                            <span style={{fontSize: "19px", color: "white"}}>У данных файлов недопустимый MIME-тип:</span>
                                        </div>
                                        {mimeTypeErrMsgBlock}
                                        <div className="popup-universal-centering-container">
                                            <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={popupOKFunction} onClick={popupOKFunction}>OK</button>
                                        </div>
                                    </div>);
                            }
                        }
                        else if(reportObject.uploadingErr && reportObject.faultyUploads_mimeType.length>0) {
                            if(reportObject.readDirErr) {

                                popupWidth = "430px";

                                let readDirErrText = "Обновите страницу Галереи.";
                                if(reportObject.faultyUploads_fileExists.length > 0) {
                                    popupWidth = "500px";
                                    readDirErrText = "По окончании операции обновите страницу Галереи.";
                                }
                                    
                                    
                                content = (
                                    <div style={{width: popupWidth}} className="popup-oprp-uploading-fail">
                                        <div style={{marginBottom: "5px"}} className="popup-universal-centering-container">
                                            <span style={{fontSize: "21px", color: "yellow"}}>При загрузке возникли ошибки.</span>
                                        </div>
                                        
                                        {uploadingErrMsgBlock}

                                        <div style={{marginTop: "7px"}} className="popup-universal-centering-container">
                                            <span style={{fontSize: "19px", color: "white"}}>У данных файлов недопустимый MIME-тип:</span>
                                        </div>                            
                                        {mimeTypeErrMsgBlock}

                                        <div style={{marginTop: "4px", marginBottom: "2px"}} className="popup-universal-centering-container">
                                            <div style={readDirErrBlockStyle}>
                                                <div className="popup-universal-centering-container">
                                                    <span style={readDirErrTitleStyle}>Возникла ошибка отображения результатов!</span>
                                                </div>
                                                <div>
                                                    <ul style={{color: "white"}}>
                                                        <li><span style={{fontSize: "19px", marginRight: "5px"}} className="popup-oprp-universal-text">{readDirErrText}</span></li>
                                                    </ul>
                                                </div>
                                                    
                                                <div className="popup-universal-centering-container">
                                                    <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={popupOKFunction} onClick={popupOKFunction}>OK</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>);
                            }
                            else {
                                content = (
                                    <div style={{width: popupWidth}} className="popup-oprp-uploading-fail">
                                        <div style={{marginBottom: "5px"}} className="popup-universal-centering-container">
                                            <span style={{fontSize: "21px", color: "yellow"}}>При загрузке возникли ошибки.</span>
                                        </div>
                                        
                                        {uploadingErrMsgBlock}

                                        <div style={{marginTop: "5px"}} className="popup-universal-centering-container">
                                            <span style={{fontSize: "19px", color: "white"}}>У данных файлов недопустимый MIME-тип:</span>
                                        </div>
                                        {mimeTypeErrMsgBlock}
                                        
                                        <div className="popup-universal-centering-container">
                                            <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={popupOKFunction} onClick={popupOKFunction}>OK</button>
                                        </div>
                                    </div>);
                            }
                        }
                    }
                }
                
                
                else if(operationResult==RESULT.fileRenamed) {
                    
                    if(!infoObject.reportObject.renamingErr) {
                        let prevFName = infoObject.reportObject.prevFName;
                        let prevFNameTrimmed = makeStringMinimised(prevFName, LIMITS.inPopup_fNameMaxLength);
                        let newFName = infoObject.reportObject.newFName;
                        let newFNameTrimmed = makeStringMinimised(newFName, LIMITS.inPopup_fNameMaxLength);

                        let popupStyle = {
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgb(51, 148, 72)",
                            border: "2px solid white",
                            borderRadius: "10px",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                            paddingTop: "5px",
                            cursor: "move"
                        };

                        content = (
                            <div style={popupStyle}>
                                <div>
                                    <span style={{fontSize: "24px", color: "gold"}}>Переименование успешно!</span>
                                </div>
                                <div>
                                    <span style={{fontSize: "20px"}} className="popup-oprp-allok__text">Старое имя:&nbsp; <font color="Khaki" title={prevFName}>{prevFNameTrimmed}</font></span>
                                </div>
                                <div>
                                    <span style={{fontSize: "20px"}} className="popup-oprp-allok__text">Новое имя:&nbsp; <font color="Khaki" title={newFName}>{newFNameTrimmed}</font></span>
                                </div>
                                <div><button ref={this.okButtonRef} className="popup-oprp-allok__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button></div>
                            </div>);
                    }
                    
                    else if(infoObject.reportObject.renamingErr && !infoObject.reportObject.readDirErr) {
                        //Возникла ошибка переименования, но считать список файлов Галереи удалось без проблем.
                        
                        let popupHeight = "100px";
                        let popupWidth = "400px";
                        let errObject = JSON.parse(infoObject.reportObject.renamingErr);
                        let errMsgBlock =  (
                            <div className="popup-universal-centering-container">
                                <span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Server Error</span>
                            </div>);

                        if(errObject.hasOwnProperty("errno")) {
                            if(errObject.errno==-2) {
                                let prevFName = infoObject.reportObject.prevFName;
                                let prevFNameTrimmed = makeStringMinimised(prevFName, LIMITS.inPopup_fNameMaxLength);    
                                errMsgBlock = (
                                    <div className="popup-universal-centering-container">
                                        <span style={{fontSize: "19px"}} className="popup-oprp-universal-text" title={prevFName}><font color="yellow">{prevFNameTrimmed}</font> &nbsp;не найден!</span>
                                    </div>);
                                popupHeight = "100px";
                            }
                            else if(errObject.errno==-17) {
                                let newFName = infoObject.reportObject.newFName;
                                let newFNameTrimmed = makeStringMinimised(newFName, LIMITS.inPopup_fNameMaxLength);
                                errMsgBlock = (
                                    <React.Fragment>
                                        <div className="popup-universal-centering-container">
                                            <span style={{fontSize: "19px"}} className="popup-oprp-universal-text" title={newFName}>Файл&nbsp; <font color="yellow">{newFNameTrimmed}</font></span>
                                        </div>
                                        <div className="popup-universal-centering-container">
                                            <span style={{fontSize: "19px"}} className="popup-oprp-universal-text">уже есть в Галерее!</span>
                                        </div>
                                    </React.Fragment>);
                                popupHeight = "120px";
                            }
                        }    


                        content = (
                            <div style={{width: popupWidth, height: popupHeight}} className="popup-oprp-uploading-fail">
                                <div className="popup-universal-centering-container">
                                    <span style={{fontSize: "21px", color: "yellow"}}>Не удалось переименовать файл.</span>
                                </div>
                            
                                {errMsgBlock}

                                <div className="popup-universal-centering-container">
                                    <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                </div>
                            </div>);
                    }
                    
                    else if(infoObject.reportObject.renamingErr && infoObject.reportObject.readDirErr) {
                        //Не удалось ни файл переименовать, ни список файлов считать.


                        content = (
                            <div className="popup-oprp-uploading-fail">
                                <div className="popup-universal-centering-container">
                                    <span style={{fontSize: "21px", color: "yellow"}}>Server Error!</span>
                                </div>
                            
                                <div>
                                    <ul style={{color: "white"}}>
                                        <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Обновите страницу Галереи.</span></li>
                                        <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Проверьте переименуемый файл.</span></li>
                                    </ul>
                                </div>

                                <div className="popup-universal-centering-container">
                                    <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                </div>
                            </div>);
                    }

                }
                
                
                else if(operationResult==RESULT.fetchError) {
                    content = (
                        <div className="popup-oprp-uploading-fail">
                            <div className="popup-universal-centering-container">
                                <span style={{fontSize: "21px", color: "yellow"}}>Fetch Error!</span>
                            </div>
                            
                            <div className="popup-universal-centering-container">
                                <span style={{marginLeft: "5px", marginRight: "5px", fontSize: "19px"}} className="popup-oprp-universal-text">{infoObject.error}</span>
                            </div>
                            
                            <div>
                                <ul style={{color: "white"}}>
                                    <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Проверьте соединение с Интернетом.</span></li>
                                    <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Обновите страницу Галереи.</span></li>
                                </ul>
                            </div>

                            <div className="popup-universal-centering-container">
                                <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                            </div>
                        </div>);
                }
                
                else if(operationResult==RESULT.failedFilesDownloading) {
                    if(infoObject.error.problemFilesArr) {
                        let problemFsArr = infoObject.error.problemFilesArr;
                        let problemFsArrLength = problemFsArr.length;
                        let fNamesLengthArr = [];
                        let symbolWidth = 9;

                        let errorsContentPart = <React.Fragment></React.Fragment>;

                        if(problemFsArrLength <= LIMITS.inPopup_liElsMaxCount) { //Можно обойтись обычным маркированным списком.
                            let errorsLiArray = [];
                            for(let i=0; i<problemFsArrLength; i++) {
                                let liText = makeStringMinimised(problemFsArr[i], LIMITS.inPopup_fNameMaxLength);
                                let liElement = <li title={problemFsArr[i]}>{liText}</li>;
                                    
                                fNamesLengthArr.push(liText.length);
                                    
                                errorsLiArray.push(liElement);
                            }


                            errorsContentPart = (
                            <span>
                                Эти файлы не удалось скачать: <br/>
                                <ul>{errorsLiArray}</ul>
                            </span>);
                        }
                        else { //Нужен список файлов с прокруткой.
                            let errorOptionsArray = [];
                            for(let i=0; i<problemFsArrLength; i++) {
                                let fName = makeStringMinimised(problemFsArr[i], LIMITS.inPopup_fNameMaxLength);
                                errorOptionsArray.push(<option title={problemFsArr[i]}>{fName}</option>);
                                fNamesLengthArr.push(fName.length);
                            }    
                            errorsContentPart = (
                                <span>
                                    Эти файлы не удалось скачать: <br/>
                                    <select size={LIMITS.inPopup_liElsMaxCount+1} className="popup-oprp-rmv-partialfail__fail-select">{errorOptionsArray}</select>
                                </span>);
                        }

                        //Находим наибольший эл-т в массиве.
                        //Источник с инфой об этой ф-и: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/max
                        let maxFNameWidth = Math.max.apply(null, fNamesLengthArr);
                        let hypothPopupWidth = maxFNameWidth*symbolWidth + 65; //hypoth... - от слова hypothetical.
                        let minPopupWidth = 308;
                        let popupWidth = Math.max(hypothPopupWidth, minPopupWidth);
                        let fNamesFieldWidth = popupWidth-15;

                        popupWidth += "px";
                        fNamesFieldWidth += "px";

                        let popupStyle = {
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: popupWidth
                        };


                        content = (
                            <div style={popupStyle} className="popup-oprp-rmv-partialfail">
                                <div style={{width: fNamesFieldWidth}} className="popup-oprp-rmv-partialfail__fail">
                                    {errorsContentPart}
                                </div>
                                
                                <div style={{width: fNamesFieldWidth}} className="popup-oprp-rmv-partialfail__fail">
                                    <span>
                                        <span style={{fontSize: "21px"}} className="popup-oprp-universal-text">Рекомендации:</span>
                                        <ul style={{color: "white"}}>
                                            <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Обновите страницу Галереи.</span></li>
                                            <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Убедитесь в наличии файла(ов).</span></li>
                                        </ul> 
                                    </span>
                                    <div className="popup-universal-centering-container">
                                        <button ref={this.okButtonRef} className="popup-oprp-rmv-partialfail__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                    </div>
                                </div>
                            </div>);
                    }
                    else if(infoObject.error.error) {
                        content = (
                            <div className="popup-oprp-uploading-fail">
                                <div className="popup-universal-centering-container">
                                    <span style={{fontSize: "21px", color: "yellow"}}>Downloading error!</span>
                                </div>
                            
                                <div className="popup-universal-centering-container">
                                    <span style={{marginLeft: "5px", marginRight: "5px", fontSize: "19px"}} className="popup-oprp-universal-text">{infoObject.error.error}</span>
                                </div>
                            
                                <div>
                                    <ul style={{color: "white"}}>
                                        <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Обновите страницу Галереи.</span></li>
                                        <li><span style={{fontSize: "19px"}} className="popup-oprp-universal-text">Убедитесь в наличии файла(ов).</span></li>
                                    </ul>
                                </div>

                                <div className="popup-universal-centering-container">
                                    <button ref={this.okButtonRef} className="popup-oprp-uploading-fail__button" onTouchEnd={this.closeThisPopup} onClick={this.closeThisPopup}>OK</button>
                                </div>
                            </div>);
                    }
                }
            }
        }

        //axis="both" - указывает координатные оси, по которым допустимо перетаскивание. "both" - значит, по обеим.
        //grid={[10, 10]} - на такое число единиц (пикселей?) происходит минимальное перемещение.                    
        //bounds="parent" - значит, перемещение ограничено родительским элементом.
        //handle="div" - css-селектор, за который "хватаемся" при перетаскивании.
        if(content) 
            return (
                <div className="popup-universal-bg" style={{zIndex: Number(this.props.zindex)}}>
                    <MyDraggable cancel="select">{content}</MyDraggable>
                </div>                
            );
        else return <React.Fragment></React.Fragment>;
    }
}