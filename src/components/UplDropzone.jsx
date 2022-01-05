import React, {Component} from 'react';
import Dropzone from 'react-dropzone';

import {limits as LIMITS,
    namesAndPaths as NAMES_PATHS,
    internalAPI_commandCodes as DO} from "../ControlsAndAPI.js";

import "../css/styles_all.css";

/*
Принимаемые пропсы:
uniTool: <object Function>, //Функция для передачи команд родительскому элементу.
disabled: <boolean>,
infoObject: {
    files: <ссылка на массив объектов File> //Это ссылка на здешний же массив this.state.files, сохраняемая в родительском элементе. Она нужна для
    //восстановления содержимого дропзоны при уходе со страницы, где находится дропзона, и возвращении обратно.
}
*/
export default class UplDropzone extends Component {
    constructor() {
        super();
        this.state = {
            disabled: false,
            files: [], 
            previousFilesArrLength: 0, //Сюда заносится длина files после каждого изменения этого массива.
            //Параметр этот нам нужен для одной операции - в shouldComponentUpdate() мы в том числе и с его
            //помощью решаем, давать ли добро на перерисовку.
        };

        this.dropzoneStyle = {
            border: '1px solid #eaeaea'
        }
        
        this.previewsContainerStyle = {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 16
        };

        this.previewElementStyle = {
            display: 'inline-flex',
            "flex-direction": 'column',
            borderRadius: 2,
            border: '1px solid #eaeaea',
            marginBottom: 8,
            marginRight: 8,
            width: 100,
            height: 120,
            padding: 4,
            boxSizing: 'border-box'
        };

        this.previewImgWrapperStyle = {
            display: 'flex',
            minWidth: 0,
            overflow: 'hidden'
        };

        this.previewImgStyle = {
            display: 'block',
            height: '100%',
            width: 'auto'
        };

    }

    onDrop(filesToDropArr) {
        let fNamesMatchArr = []; //Сюда заносятся имена файлов, которые, как оказалось, уже есть в списке.
        let fNamesBadFileSizeArr = []; //Сюда заносятся имена файлов, превысивших допустимый размер.
        let filesToUploadCount = this.state.files.length;
        let filesToUplMaxNumberExceeded = false; //Становится true, если пытаются превысить допустимое число файлов в дропзоне.

        /*
        Наша задача - перебрать массив filesToDropArr и:
         - проверить, нет ли совпадений с уже добавленными в список на загрузку файлами this.state.files. 
        Сравниваются имена файлов. Совпадающие файлы просто пропускаются, не добавляясь в список; 
         - проверить, не превышает ли размер каждого добавляемого файла допустимый максимум;
         - не допустить превышения предельного числа загружаемых файлов. Файлы из filesToDropArr будут добавляться 
        в список по мере перебора массива лишь до достижения допустимого числа, затем перебор останавливается.
        Перебор производится циклом forEach. К сожалению, этот цикл нельзя прервать методом break, как for или while.
        Поэтому для прерывания используем try... catch (при возникновении условия для прерывания цикла 
        генерируем исключение - throw err (что за err - неважно)).
        */
        try {
            filesToDropArr.forEach(function(item, index, arr) {
                let itemFileName = item.name;
                
                const filenameFinder = function(element, i, filesArr) {
                    return element.name==itemFileName;
                };

                //Метод find() ищет в массиве элемент(ы), совпадающие с неким образцом, используя
                //callback-ф-ю для производства сравнения (эта ф-я вызывается для каждого эл-та массива).
                //При первом же совпадении перебор останавливается, и find() возвращает найденный совпавший
                //с образцом элемент. Если совпадений не нашлось, вернётся undefined (не false!).
                let match = this.state.files.find(filenameFinder);
                if(match) {//В this.state.files найден файл, совпадающий по критериям ф-и filenameFinder 
                //с текущим перебираемым - item - из filesToDropArr.
                    fNamesMatchArr.push(match.name);
                    return;
                }
                
                if(item.size > LIMITS.maxFileSize) {
                    fNamesBadFileSizeArr.push(item.name);
                    return;
                }
                

                filesToUploadCount++;
                if(filesToUploadCount > LIMITS.maxUplFilesCount) {
                    throw new Error();
                }
                else {
                    /*
                    Каждый элемент массива filesToDropArr (здесь фигурирует как item) представляет 
                    собой объект класса File. В нём есть свойства name, lastModified и др. Мы присоединяем 
                    к этому объекту св-во preview, в котором содержится картинка-миниатюра.
                    Метод Object.assign(file, {preview: URL.createObjectURL(file)}) выполняет 
                    слияние объектов item и {preview: URL.createObjectURL(item)}.
                    Метод URL.createObjectURL(file) создаёт ссылку на объект-аргумент (этот аргумент
                    должен быть объектом класса Blob или File). Эту ссылку можно использовать для вывода
                    картинок, в качестве src - что мы дальше и делаем при создании миниатюр-превьюшек.
                    Когда ссылка на объект становится не нужна (мы удалили файл из дропзоны или вообще очистили
                    дропзону), её необходимо уничтожить с помощью URL.revokeObjectURL(ссылка_на_объект) - тогда
                    объект, если на него нет других ссылок, станет доступен сборщику мусора.
                    */
                    this.state.files.push(Object.assign(item, {preview: URL.createObjectURL(item)}));
                }
            }.bind(this));
        }
        catch(err) {filesToUplMaxNumberExceeded = true;}

       
        const makeBadFNamesListDOMEl = function(namesArr) {
            let liArray = [];
            for(let i=0; i<namesArr.length; i++) {
                liArray.push(<li>{namesArr[i]}</li>);
            }
            return <ul>{liArray}</ul>;
        }

        let errorMessageOfMatches, errorMessageOfBadSize, errorMessageOfFilesCount;

        if(fNamesMatchArr.length > 0) errorMessageOfMatches = <React.Fragment><span className="popup-uplfslist-err__text">Вы уже включили эти файлы в список загрузки: {makeBadFNamesListDOMEl(fNamesMatchArr)}</span><br/></React.Fragment>;
        if(fNamesBadFileSizeArr.length > 0) errorMessageOfBadSize = <React.Fragment><span className="popup-uplfslist-err__text">У данных файлов слишком большой размер: {makeBadFNamesListDOMEl(fNamesBadFileSizeArr)}</span><br/></React.Fragment>;
        if(filesToUplMaxNumberExceeded) errorMessageOfFilesCount = <React.Fragment><span className="popup-uplfslist-err__text">Превышено разрешённое количество файлов.<br/> Избыточные файлы не добавлены.</span><br/></React.Fragment>;

        const makeErrMsgPopup = function(funcForClosingPopup, buttonRef) {
            return (
            <div className="popup-universal-bg" style={{zIndex: "inherit"}}>
                <div className="popup-uplfslist-err">
                    {errorMessageOfMatches}
                    {errorMessageOfBadSize}
                    {errorMessageOfFilesCount}
                    <button ref={buttonRef} className="popup-uplfslist-err__button" onClick={funcForClosingPopup}>OK</button>
                </div>
            </div>);
        }
    
        let resultObject;
        if(errorMessageOfMatches || errorMessageOfBadSize || errorMessageOfFilesCount) 
            resultObject = {
                makeErrPopupFunction: makeErrMsgPopup,
                files: this.state.files
            };
        else 
            resultObject = {
                makeErrPopupFunction: false,
                files: this.state.files
            };

        this.state.previousFilesArrLength = this.state.files.length;

        this.props.uniTool(DO.makeFilesToUploadList, resultObject);
        this.forceUpdate();

    }
  

    removeFileFromDropzone(event) {
        event.stopPropagation(); //Прекращение всплытия события. Картинка-превью файла расположена прямо 
        //в дропзоне, поэтому нам нужно, чтобы клик по ссылке "Удалить" обрабатывался только здесь, в превью, а сама 
        //дропзона на него не реагировала бы.
//???
        let deletingIndex = Number(event.target.id); //С name почему-то возникли проблемы - он упорно считал 
        //его undefined. Пришлось сделать id.
        URL.revokeObjectURL(this.state.files[deletingIndex].preview);
        this.state.files.splice(deletingIndex, 1); //Удаляем элемент.
        this.state.previousFilesArrLength--;
        let resultObject = {
                makeErrorMsgFunction: false,
                files: this.state.files
            };
        this.props.uniTool(DO.makeFilesToUploadList, resultObject);
        this.forceUpdate();
    }
    
    clearDropzone() {
        this.state.files.forEach(file => URL.revokeObjectURL(file.preview));
        this.state.files.splice(0, this.state.files.length);
        this.state.previousFilesArrLength = 0;
        
        let resultObject = {
                makeErrorMsgFunction: false,
                files: this.state.files
            }
        this.props.uniTool(DO.makeFilesToUploadList, resultObject);
        this.forceUpdate();        
    }
    
    //Очистка дропзоны по клику на крестообразную иконку, которая появляется в дропзоне при добавлении файлов.
    clearDropzoneViaIconClick(event) {
        event.stopPropagation();
        this.clearDropzone();
    }
    
    lockClicksOnPreviews(event) { //Ф-я специально для остановки высплытия события onClick из превью в дропзону, 
    //чтобы дропзона не реагировала на клики по превью, расположенным внутри неё.
        event.stopPropagation();
    }


    componentDidMount() {
        let shouldForceUpdate = false;
        if(this.props.infoObject.files && this.props.infoObject.files.length>0) {           
            //Необходимость проверки this.props.infoObject.files вызвана тем, что изначально, при срабатывании 
            //конструктора Галереи, этот параметр равен null.
            this.state.files = this.props.infoObject.files; //Это нужно, чтобы если добавить файлы в дропзону,
            //а затем переключить Галерею в режим ImageFullView, то по возвращении добавленные файлы снова отобразились бы в дропзоне.
//???
            //Нужно сделать, чтобы отображение файлов в дропзоне восстанавливалось бы при возвращении не только из ImageFullView,
            //но и с любой другой страницы сайта.
            this.state.previousFilesArrLength = this.state.files.length;
            shouldForceUpdate = true; //Чтобы превьюшки отрисовались в дропзоне
        }
        if(this.state.disabled!=this.props.disabled) {
            //Когда мы переключаем Галерею в режим ImageFullView, а потом обратно, элемент <UplDropzone> создаётся заново, и снова вызывается
            //componentDidMount(). При этом нам нужно привести "новую" дропзону в энаблированное/дисаблированное состояние, соответствующее пропсам.
            this.state.disabled = this.props.disabled;
            shouldForceUpdate = true; //Чтобы отобразить энаблированность/дисаблированность дропзоны.
        }

        if(shouldForceUpdate) this.forceUpdate();
    }


    shouldComponentUpdate(newProps) {
        let shouldUpdate = false;
        /*
        Напомним, shouldComponentUpdate() не вызывается при обновлении через forceUpdate(), вызванном из этого же кода. Поэтому при очистке
        дропзоны с помощью иконки-крестика мы сюда не попадаем.
        */

        if(this.state.files.length==0 && this.state.previousFilesArrLength>0) {
            /*
            Этот блок исполняется, когда после загрузки файлов нужно очистить дропзону. Параметр this.state.previousFilesArrLength
            нужен, чтобы поймать именно момент после загрузки файлов, когда массив his.state.files очистился, но только что был
            с файлами.
            */
            this.state.previousFilesArrLength = 0;
            shouldUpdate = true;
        }
        
        if(this.state.disabled!=newProps.disabled) {
            this.state.disabled = newProps.disabled;
            shouldUpdate = true;
        }

        return shouldUpdate;
    }

    onUpload(event) {
        event.stopPropagation();
        this.props.uniTool(DO.uploadFiles, this.state.files);
    }
    
    clickCapture(event) {
        event.stopPropagation();
    }

    makeItemRemovingAncor(indexInUplFilesArr, onAncorClickFunc, disabled){
        if(disabled) return <span>Удалить</span>;
        else return <span id={indexInUplFilesArr} title={this.state.files[indexInUplFilesArr].name} className="fileloader__preview-manager-ruleout" onClick={onAncorClickFunc}>Удалить</span>;
    }

    render() {
        const previewsList = this.state.files.map(function(file, index) {
            return (
                <div className="fileloader__preview-container" key={file.name} onClick={this.lockClicksOnPreviews.bind(this)}>
                    <div className="fileloader__preview-img-wrapper">
                        <img className="fileloader__preview-img" src={file.preview} title={file.name}/>
                    </div>
                    <div className="fileloader__preview-manager">
                        {this.makeItemRemovingAncor(index, this.removeFileFromDropzone.bind(this), this.props.disabled)}
                    </div>
                </div>
            );
        }.bind(this));
        
        
        
        let iconsElement = <React.Fragment></React.Fragment>;
        let dropzoneBlocker = <React.Fragment></React.Fragment>;
        let uploadIconBlock = (<div className="fileloader__upload-icon-closewrapper">
                                <img style={{zIndex: 1}} className="fileloader__upload-icon" src={NAMES_PATHS.designElementsUrlPath + "Icon-upload-lighted.png"} title="Upload files"/>
                                <img style={{zIndex: 2}} className="fileloader__upload-icon" src={NAMES_PATHS.designElementsUrlPath + "Icon-upload.png"} title="Upload files" onClick={this.onUpload.bind(this)}/>
                            </div>);
        let clearDzIconBlock = (<div className="fileloader__clear-dz-icon-closewrapper">
                                <img style={{zIndex: 1}} className="fileloader__clear-dz-icon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-clear-dz-lighted.png"} title="Clear Dropzone"/>
                                <img style={{zIndex: 2}} className="fileloader__clear-dz-icon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-clear-dz.png"} title="Clear Dropzone" onClick={this.clearDropzoneViaIconClick.bind(this)}/>
                            </div>);
        
        
        if(this.state.disabled) {
            uploadIconBlock = (<div className="fileloader__upload-icon-closewrapper">
                                <img className="fileloader__icon-disabled" src={NAMES_PATHS.designElementsUrlPath + "Icon-upload.png"}/>
                            </div>);
            clearDzIconBlock = (<div className="fileloader__clear-dz-icon-closewrapper">
                                <img className="fileloader__icon-disabled" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-clear-dz.png"}/>
                            </div>);
            dropzoneBlocker = <div className="fileloader__dropzone-blocker" onClick={this.clickCapture.bind(this)}></div>;
        }
        
        
        if(this.state.files.length>0) iconsElement = (
                        <div className="fileloader__icons-container">
                            {uploadIconBlock}
                            {clearDzIconBlock}
                        </div>);

        return (
            <div className="fileloader">
                <Dropzone onDrop={this.onDrop.bind(this)} accept={String(LIMITS.acceptedFileTypes)}>
                {function({getRootProps, getInputProps}) { return (
                    <div className="fileloader__dropzone" style={{backgroundImage: "url(" + NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.dropzoneBgImg  + ")"}} {...getRootProps({className: 'fileloader__dropzone', tabIndex: "-1"})}>
                        <div className="fileloader__dropzone-hoverindicator"></div>
                        <input {...getInputProps()}/>
                        <div className="fileloader__dropzone-expl-container">
                            <font className="fileloader__dropzone-expl-text">
                                Drag 'n' drop files here, or click to select files 
                            </font>
                            &nbsp;
                            <font className="fileloader__dropzone-expl-text-coloured">
                                ({LIMITS.maxUplFilesCount} files maximum, file size limit 5Mb).
                            </font>
                        </div>
                    
                        <div className="fileloader__previews-and-icons">
                            {iconsElement}
                        
                            <div className="fileloader__previews">
                                {previewsList}
                            </div>
                        </div>
                        {dropzoneBlocker}
                    </div>
                );}}
                </Dropzone>
            </div>);
    }
}