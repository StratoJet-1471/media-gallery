//Главный Компонент.
import React from "react";
import ReactDOM from "react-dom";

import { CookiesProvider, Cookies } from 'react-cookie';

import Url from "url-parse";


import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";

import { Buffer } from 'buffer';

import MyDraggable from "./components/MyDraggable.jsx";

import SignInPopup from "./components/SignInPopup.jsx";
import EntrancePage from "./components/EntrancePage.jsx";
import Gallery from "./components/Gallery.jsx";
import RegistrationPage from "./components/RegistrationPage.jsx";
import OperationsReport from "./components/OperationsReport.jsx";
import ForgottenPasswordPopup from "./components/ForgottenPasswordPopup.jsx";
import UserProfilePopup from "./components/UserProfilePopup.jsx";
import AboutProjectPopup from "./components/AboutProjectPopup.jsx";

import PopupsUniMethods from "./components/PopupsUniMethods.jsx";

import { limits as LIMITS,
    defaults as DEFAULTS,
    namesAndPaths as NAMES_PATHS,
    jwTokenParams as JWTOKEN,
    internalAPI_filesOperationStatusCodes as FO_STATUS,
    internalAPI_fetchUrls as F_URL, //Использовать просто URL нельзя, т.к. в JS уже есть такой встроенный класс.
    internalAPI_commandCodes as DO, 
    internalAPI_operationResultCodes as RESULT,
    internalAPI_flags as FLAG, 
    internalAPI_cookieNames as COOKIE_NAMES, 
    internalAPI_httpResponseCodes as RESP_CODE, 
    internalAPI_specialUserIDValues as SPECIAL_UID} from "./ControlsAndAPI.js";

import "./css/styles_all.css";

const history = createBrowserHistory();

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            previousUserID: null,
            
            //Объект с инфой об авторизованном юзере.
            userInfoObject: {
                userID: SPECIAL_UID.unauthorised, //По умолчанию считаем, что мы не авторизованы.
                //userID, кроме, собственно, ID юзера, может принимать 2 спец. значения - SPECIAL_UID.unauthorised
                //(индикатор того, что никто не залогинен) и SPECIAL_UID.signingIn (в настоящий момент производится
                //операция залогинивания). 
                //Раз мы по умолчанию не авторизованы, все личные данные юзера ставим null.
                login: null,
                email: null,
                name: null,
                userRegDate: null,
            },
            
            //Отметка о стартовой проверке авторизации, производимой в componentDidMount(). Пока эта проверка не
            //сделана, сайт не должен отображаться.
            initialAuthChecked: false,


            //Какие попапы открыты:
            uProfilePopupIsOpen: false, //uProfile - от "user profile"
            signInPopupIsOpen: false,
            forgPswPopupIsOpen: false, //forgPsw - от "forgotten password"
            aboutPopupIsOpen: false,
            
            //Какие серверные операции сейчас производятся:
            uploadProcessIsActive: false,
            filesRemovingProcessIsActive: false,
            fileRenamingProcessIsActive: false,
            registrationProcessIsActive: false,
            pswChangeProcessIsActive: false,
            downloadingProcessIsActive: false,


            filesToUploadArr: null, //Здесь будет ссылка на массив загружаемых файлов (объектов класса File).
            operationsReportActive: false, //Этот параметр отмечает, показывается ли сейчас универсальный попап
            //<OperationsReport/>, содержащий отчёты о результатах файловых операций (загрузки, удаления, 
            //переименования файлов).

            operationsInfoObject: null, //Здесь будет объект с инфой о произведённой файловой операции. 
            //Этот объект передаётся как пропс в <OperationsReport/>.

            fsOperationStatus: FO_STATUS.noAction, //Этот параметр содержит спец. значение, характеризующее текущую 
            //работу с файлами (загрузка, переименование и т.п.). Если никакой работы сейчас не выполняется, 
            //он принимает значение FO_STATUS.noAction. Если какая-то операция в процессе выполнения, этому  
            //соответствует значение FO_STATUS.waitingForResults (независимо от того, какая именно операция;
            //напомним, 2+ операции одновременно выполняться не могут). Сразу по окончании операции fsOperationStatus
            //принимает значение, характеризующее её результат - FO_SATUS.uploadedSuccessfully, FO_SATUS.uploadingFailed
            //и другие. После того, как все элементы, которым это нужно, "узнали" об окончании операции и её результатах,
            //fsOperationStatus следует снова присвоить FO_STATUS.noAction.
        
        
/*          
Механизм работы с fsOperationStatus:
Параметр fsOperationStatus извещает о ходе и результатах файловых операций и Главный Компонент, и те его дочерние компоненты,
которым эта инфа нужна.
Когда, например, из Галереи приходит команда на загрузку файлов, fsOperationStatus выставляется в FO_STATUS.waitingForResults.
После этого производится перерисовка Главного Компонента, чтобы это новое значение fsOperationStatus передалось в
Галерею (т.е., в компонент <Gallery>) через пропсы. Галерея должна "знать", что в настоящий момент производится
какая-то файловая операция, т.к. во время таких операций некоторые действия юзера в Галерее запрещены. 
Когда загрузка файлов завершена, fsOperationStatus выставляется, в зависимости от результата, в FO_STATUS.uploadedSuccessfully
или FO_STATUS.uploadingFailed (есть ещё два спец. значения FO_STATUS.uplFilesAlreadyExist и FO_STATUS.uplFExistAllSkipped,
на которых здесь останавливаться не будем). После этого снова перерисовывается Главный Компонент - чтобы передать
значение fsOperationStatus в Галерею, а также вывести попап <OperationsReport/> с отчётом о результатах. Когда 
юзер закрывает <OperationsReport/>, fsOperationStatus выставляется в умолчальное FO_STATUS.noAction, после чего
производится новая перерисовка Главного Компонента, в результате которой Галерея получает через пропсы и это 
значение fsOperationStatus.
*/          

            //Объект с инфой, которой нужно обмениваться с Галереей (<Gallery>).
            galleryInfoObject: {
                adaptParams: null, //Здесь будет объект с параметрами Галереи, которые зависят от разрешения 
                //экрана. Он будет инициирован дальше в конструкторе. Внутри adaptParams будут несколько вложенных 
                //объектов, каждый - для определённого разрешения.
                fsOperationStatus: null,
                fileNamesTempObject: null, //Ссылка на временный объект с именами файлов, формируемый из 
                //пришедшего с сервера массива имён файлов Галереи. Этот массив приходит при каждой операции с
                //файлами - загрузке новых, удалении, переименовании; он показывает список файлов по завершении
                //этой операции. Конечно, в Галерее есть своя ф-я получения файлов, и можно было бы по завершении
                //операции обновлять Галерею с помощью неё, но зачем? Ведь для этого придётся заново обращаться
                //к серверу - а так мы уже к нему обратились.
                //Конечно, можно было бы присылать с сервера прямо объект, а не массив имён файлов, из которых 
                //объект делается уже здесь - но я считаю, что важнее сократить объём траффика, а лишние операции 
                //на стороне юзера - не такая уж проблема при современном быстродействии.
                //Св-ва временного объекта имеют вид "имяФайла": true (значение неважно - нам нужно только имя файла).
                //После передачи объекта в <Gallery> через пропсы - а непосредственно передача произойдёт, когда
                //внутри <Gallery> сработает shouldComponentUpdate() - объект становится не нужен. 
                //Стирание объекта (точнее, обнуление ссылки fileNamesTempObject) производится с помощью метода 
                //clearTempObjects() или universalTool() с первым параметром, равным DO.clearFNamesTempObject.
                
                disabledItemsTempObject: null, //Ссылка на временный объект с инфой о дисаблированных итемах.
                //Итемы (т.е., элементы сайта, представляющие файлы) дисаблируются на время удаления, скачивания или 
                //переименования файлов, чтобы нельзя было в это время сделать с файлами что-то другое. Объект, на 
                //который ссылкается disabledItemsTempObject, приходит из Gallery вместе с командой на файловую 
                //операцию, в виде аргумента ф-и universalTool(). Он нужен лишь на время операции - после её окончания
                //итемы нужно энаблировать, а сам объект подлежит уничтожению.
                //ЗАЧЕМ ВООБЩЕ НУЖЕНО хранить ссылку на него? - Может статься, что, пока идёт работа над файлами,
                //юзер покинет Галерею, а потом вернётся в неё. Если он возвращается, по внутренней ссылке или по 
                //кнопке браузера "Назад", то Галерея (<Gallery>) создаётся заново - срабатывает её конструктор, 
                //считываются файлы с сервера, сбрасываются все выделения. Тем не менее, поскольку работа над 
                //файлами ещё не завершена, юзер должен вновь увидеть все оперируемые итемы дисаблированными. 
                //Т.е., нужно хранить инфу о них где-то вне Галереи и по возвращении в Галерею всё восстановить.  
                //Тут и пригождается disabledItemsTempObject.
                //Внутренняя структура объекта такова: 
                //{ "имяФайла1": {"selected": true/false}, "имяФайла2": {"selected": true/false}, ...}.
                //Стирание объекта производится с помощью метода clearTempObjects() или universalTool() с первым 
                //параметром, равным DO.clearDisabledItemsTempObject.


                itemRenamingInfoTempObject: null, //Ссылка на временный объект с инфой о переименуемом файле.
                //Объект имеет вид {currentFName: "имя", newFName: "имя", selected: true/false}. Он нужен для того,
                //чтобы, во-первых, сформировать отчёт об операции переименования (<OperationsReport>), в 
                //котором понадобится старое имя файла, а во-вторых, чтобы по завершении переименования быть 
                //переданным с пропсами в <Gallery> - там нужно сменить старое имя на новое, сохранив при этом
                //выделение итема, если оно было. После этого временный объект отдаётся сборщику мусора с 
                //помощью ф-и clearTempObjects() или universalTool() с первым параметром, равным 
                //DO.clearFRenamingTempObject.
                
                userInfoObject: null, //Ссылка на объект с инфой об авторизованном юзере. Эта инфа будет 
                //нужна внутри Галереи.
                
                currentFolder: DEFAULTS.defaultGlrImgFolder,
                operFolder: null
            },
            
/*
ОБ ОЧИСТКЕ ВРЕМЕННЫХ ОБЪЕКТОВ: временные объекты используются внутри Галереи, поэтому принимаем за правило, что 
команду на их очистку (т.е., обнуление ссылки на объект) должен отдавать код Галереи, через вызов universalTool()
со специальным значением аргумента command (DO.clearFNamesTempObject, DO.clearDisabledItemsTempObject...). Это 
гарантирует, что объекты не будут очищены тогда, когда они ещё нужны.
Исключение - если при попытке совершить операцию слетела авторизация. Тогда при залогинивании другим юзером 
команда на очистку временных объектов даётся здесь, в коде Главного Компонента (в ф-и setStateAuthorised()).
*/
            
            //Объект с инфой, которой нужно обмениваться с входной страницей (она же главная) - <EntrancePage>.
            entrancePageInfoObject: {
                adaptParams: null,
                userInfoObject: null, 
            },
            
            //Объект с инфой, которой нужно обмениваться со страницей регистрации - <RegistrationPage>.
            registrationPageInfoObject: {
                adaptParams: null,
                userInfoObject: null, 
            },

            adaptMQueriesMatches: {}
        };
        
        this.state.entrancePageInfoObject.userInfoObject = this.state.userInfoObject;
        this.state.registrationPageInfoObject.userInfoObject = this.state.userInfoObject;
        this.state.galleryInfoObject.userInfoObject = this.state.userInfoObject;

        this.state.galleryInfoObject.fsOperationStatus = this.state.fsOperationStatus;


        this.entrancePageParamsLarge = {
            logoBlockWidth: 330,
            logoBlockHeight: 80,                    
            logoBlockMarginTop: 15,
            logoBlockMarginBottom: 30,
            logoBlockMarginRight: 10,

            logoImgHeight: 75,
            
            logoNameImgWidth: 214,
            logoNameImgHeight: 45,

            logoAboutAncorFontSize: 19,

            sInBlockWidth: 600, 
            sInBlockHeight: 80,
            sInBlockMarginTop: 15,
            sInBlockMarginBottom: 30,
            sInBlockMarginLeft: 10,

            sInBlockTextInputsWidth: 177,
            sInBlockTextInputsHeight: 21,
            sInBlockTextInputsMarginLeft: 1,
            sInBlockTextInputsMarginRight: 1,

            sInBlockAncorMarginLeft: 4,
            sInBlockAncorMarginRight: 4,
            sInBlockAncorFontSize: 17,

            epCentralImgWrapperWidth: 958,
            epCentralImgWrapperHeight: 639,

            epCentralImgWidth: 954,
            epCentralImgHeight: 635,
        };

        this.entrancePageParamsMiddle = {
            logoBlockWidth: 310,
            logoBlockHeight: 80,                    
            logoBlockMarginTop: 15,
            logoBlockMarginBottom: 30,
            logoBlockMarginRight: 10,

            logoImgHeight: 75,
            
            logoAboutAncorFontSize: 19,
            
            logoNameImgWidth: 214,
            logoNameImgHeight: 45,

            sInBlockWidth: 450,
            sInBlockHeight: 80,
            sInBlockMarginTop: 15,
            sInBlockMarginBottom: 30,
            sInBlockMarginLeft: 10,

            sInBlockTextInputsWidth: 157,
            sInBlockTextInputsHeight: 21,
            sInBlockTextInputsMarginLeft: 1,
            sInBlockTextInputsMarginRight: 1,

            sInBlockAncorMarginLeft: 4,
            sInBlockAncorMarginRight: 4,
            sInBlockAncorFontSize: 17,

            epCentralImgWrapperWidth: 780,
            epCentralImgWrapperHeight: 521,

            epCentralImgWidth: 776,
            epCentralImgHeight: 517,
        };
        
        this.entrancePageParamsSmall = {
            logoBlockWidth: 260,
            logoBlockHeight: 70,                    
            logoBlockMarginTop: 15,
            logoBlockMarginBottom: 18,
            logoBlockMarginRight: 5,

            logoImgHeight: 65,
            
            logoAboutAncorFontSize: 17,
            
            logoNameImgWidth: 185,
            logoNameImgHeight: 39,

            sInBlockWidth: 310,
            sInBlockHeight: 70,
            sInBlockMarginTop: 15,
            sInBlockMarginBottom: 18,
            sInBlockMarginLeft: 5,

            sInBlockTextInputsWidth: 90,
            sInBlockTextInputsHeight: 21,
            sInBlockTextInputsMarginLeft: 1,
            sInBlockTextInputsMarginRight: 1,

            sInBlockAncorMarginLeft: 3,
            sInBlockAncorMarginRight: 3,
            sInBlockAncorFontSize: 15,

            epCentralImgWrapperWidth: 580,
            epCentralImgWrapperHeight: 386,

            epCentralImgWidth: 574,
            epCentralImgHeight: 382,
        };

        this.smallPageSizeFlag = 1;
        this.middlePageSizeFlag = 2;
        this.largePageSizeFlag = 3;

        this.adaptParams = {
            smallest: {//<680
                galleryParams: {
                    itemsOnPage: 1,
                
                    gallery_imgFullViewInfoObject: {
                        imgFullViewScrollInterval: 420,
                    
                        imgFullViewViewportWidth: 400,
                        imgFullViewViewportHeight: 802,
                    
                        imgFullViewViewsListHeight: 800, //width задаётся внутри Gallery
                    
                        imgFullViewViewContainerWidth: 400,
                        imgFullViewViewContainerHeight: 800,
                    
                        imgFullViewViewMinWidth: 200,
                        imgFullViewViewMaxWidth: 390,
                        imgFullViewViewMinHeight: 100,
                        imgFullViewViewMaxHeight: 800,                    
                    }
                },
                
                entrancePageParams: this.entrancePageParamsSmall,
                registrationPageParams: this.makeRegPageParamsObject(this.smallPageSizeFlag)

            },

            '680': {
                galleryParams: {
                    itemsOnPage: 2,
                
                    gallery_imgFullViewInfoObject: {
                        imgFullViewScrollInterval: 520,
                    
                        imgFullViewViewportWidth: 500,
                        imgFullViewViewportHeight: 802,
                    
                        imgFullViewViewsListHeight: 800, //width задаётся внутри Gallery
                    
                        imgFullViewViewContainerWidth: 500,
                        imgFullViewViewContainerHeight: 800,
                    
                        imgFullViewViewMinWidth: 200,
                        imgFullViewViewMaxWidth: 490,
                        imgFullViewViewMinHeight: 100,
                        imgFullViewViewMaxHeight: 800,
                    }
                },
                
                entrancePageParams: this.entrancePageParamsSmall,
                registrationPageParams: this.makeRegPageParamsObject(this.smallPageSizeFlag)
            },
            
            '880': {
                galleryParams: {
                    itemsOnPage: 2,

                    gallery_imgFullViewInfoObject: {
                        imgFullViewScrollInterval: 650,
                    
                        imgFullViewViewportWidth: 630,
                        imgFullViewViewportHeight: 802,
                    
                        imgFullViewViewsListHeight: 800, //width задаётся внутри Gallery
                    
                        imgFullViewViewContainerWidth: 630,
                        imgFullViewViewContainerHeight: 800,
                    
                        imgFullViewViewMinWidth: 200,
                        imgFullViewViewMaxWidth: 620,
                        imgFullViewViewMinHeight: 100,
                        imgFullViewViewMaxHeight: 800,
                    }
                },
                
                entrancePageParams: this.entrancePageParamsMiddle,
                registrationPageParams: this.makeRegPageParamsObject(this.middlePageSizeFlag)
            },
            
            '980': {
                galleryParams: {
                    itemsOnPage: 3,
                
                    gallery_imgFullViewInfoObject: {
                        imgFullViewScrollInterval: 800,
                    
                        imgFullViewViewportWidth: 780,
                        imgFullViewViewportHeight: 802,
                    
                        imgFullViewViewsListHeight: 800, //width задаётся внутри Gallery
                    
                        imgFullViewViewContainerWidth: 780,
                        imgFullViewViewContainerHeight: 800,
                    
                        imgFullViewViewMinWidth: 200,
                        imgFullViewViewMaxWidth: 770,
                        imgFullViewViewMinHeight: 100,
                        imgFullViewViewMaxHeight: 800,
                    }
                },
                
                entrancePageParams: this.entrancePageParamsLarge,
                registrationPageParams: this.makeRegPageParamsObject(this.largePageSizeFlag)
            },
            
            '1180': {
                galleryParams: {
                    itemsOnPage: 3,
                
                    gallery_imgFullViewInfoObject: {
                        imgFullViewScrollInterval: 800,
                    
                        imgFullViewViewportWidth: 780,
                        imgFullViewViewportHeight: 802,
                    
                        imgFullViewViewsListHeight: 800, //width задаётся внутри Gallery
                    
                        imgFullViewViewContainerWidth: 780,
                        imgFullViewViewContainerHeight: 800,
                    
                        imgFullViewViewMinWidth: 200,
                        imgFullViewViewMaxWidth: 770,
                        imgFullViewViewMinHeight: 100,
                        imgFullViewViewMaxHeight: 800,
                    }
                },
                
                entrancePageParams: this.entrancePageParamsLarge,
                registrationPageParams: this.makeRegPageParamsObject(this.largePageSizeFlag)
            },
            
            '1292': {
                galleryParams: {
                    itemsOnPage: 4,
                    fileLoaderWidth: 1020,
                    fileLoaderMinHeight: 320,
                    pct_fileLoaderHeight: '100%',
                
                    gallery_imgFullViewInfoObject: {
                        imgFullViewScrollInterval: 1020,
                    
                        imgFullViewViewportWidth: 1000,
                        imgFullViewViewportHeight: 802,
                    
                        imgFullViewViewsListHeight: 800, //width задаётся внутри Gallery
                    
                        imgFullViewViewContainerWidth: 1000,
                        imgFullViewViewContainerHeight: 800,
                    
                        imgFullViewViewMinWidth: 200,
                        imgFullViewViewMaxWidth: 990,
                        imgFullViewViewMinHeight: 100,
                        imgFullViewViewMaxHeight: 800,
                    }
                },
                
                entrancePageParams: this.entrancePageParamsLarge,
                registrationPageParams: this.makeRegPageParamsObject(this.largePageSizeFlag)
            }
        };

        this.cookies = new Cookies();

        this.uniTool = this.universalTool.bind(this);
        
        this.adaptiveMediaQueries = {
/*
            xs: '(max-width: 320px)', //query for xs devices
            sm: '(max-width: 720px)',
            md: '(max-width: 2000px)'            
*/

/*
            bp320: '(max-width: 320px)', //Iphone 5
            bp480: '(max-width: 480px)', //Portrait phones and smaller
            bp767: '(max-width: 767px)', //Landscape phones and portrait tablets
            bp768_991: '(min-width: 768px) and (max-width: 991px)', //Portrait tablets and small desktops
            bp992_1199: '(min-width: 992px) and (max-width: 1199px)', //Landscape tablets and medium desktops
            bp1200plus: '(min-width: 1200px)' //Large desktops and laptops
*/

            //Принимаем за правило, что название св-ва совпадает с числовым значением "его" width.
            //'0': '(min-width: 0px)', //Вообще 0 лишний, пожалуй. Нам же следует избегать лишних Слушателей.
            '680': '(min-width: 680px)',
            '880': '(min-width: 880px)',
            '980': '(min-width: 980px)',
            '1180': '(min-width: 1180px)', //для imgFullView
            '1292': '(min-width: 1292px)'
        };


        this.adaptMQueryLists = {};
        

        this.adaptMQueriesKeys = Object.keys(this.adaptiveMediaQueries); //Массив св-в объекта adaptiveMediaQueries.
        //Проблема в том, что св-ва эти обходятся и добавляются в массив в неизвестном порядке, который зависит, в
        //т.ч., от браузера. Нам же необходимо, чтобы они добавлялись по возрастанию. Поэтому мы именуем их как
        //числа, и затем сортируем массив ф-ей sort, используя ф-ю compareNumeric() для сравнения элементов
        //(они - строки, а нам нужно, чтобы они сравнивались, как числа).
        //Сортировка массива по возрастанию нужна для работы getCurrentMQueryMatch() - чтобы узнавать текущий match.

        function compareNumeric(a, b) {
            if (Number(a) > Number(b)) return 1; // если первое значение больше второго
            if (Number(a) == Number(b)) return 0; // если равны
            if (Number(a) < Number(b)) return -1; // если первое значение меньше второго
            //Источник - https://learn.javascript.ru/array-methods
        }
        
        this.adaptMQueriesKeys.sort(compareNumeric);

        this.adaptMQueriesKeys.forEach(function(media) {
            if(typeof this.adaptiveMediaQueries[media] === 'string') {
                this.adaptMQueryLists[media] = window.matchMedia(this.adaptiveMediaQueries[media]);
                this.state.adaptMQueriesMatches[media] = this.adaptMQueryLists[media].matches;
            }
        }, this);
        
        this.makeAdaptedParams();

        //Объект с РЕФАМИ попапов-индикаторов серверных операций (SO):
        this.SOIndicatorsRefsObj = {};
        
        //Флаги для управления попапами-индикаторами серверных операций.
        this.fileUplIndicatorID = "upl"; //1;
        this.fileRemIndicatorID = "rem"; //2;
        this.fRenameIndicatorID = "renam"; //3;
        this.registrIndicatorID = "reg"; //4;
        this.signInIndicatorID = "sIn"; //5;
        this.pswChangeIndicatorID = "chPsw"; //6;
        this.downloadIndicatorID = "downl";

        let ids = [this.fileUplIndicatorID, this.fileRemIndicatorID, this.fRenameIndicatorID, 
                    this.registrIndicatorID, this.signInIndicatorID, this.pswChangeIndicatorID,
                    this.downloadIndicatorID];

        ids.forEach(function(indicatorID){
            this.SOIndicatorsRefsObj[indicatorID] = React.createRef();
        }, this);

    
//Остальные РЕФЫ:
        this.popupsContainerRef = React.createRef();
        this.popupsContainerPrimaryRef = React.createRef();
        
        this.signInPopupRef = React.createRef();
        this.signInPopupWrapperRef = React.createRef();
        this.signInPopupContainerRef = React.createRef();

        this.sInReportRef = React.createRef();
        this.sInReportWrapperRef = React.createRef();
        this.sInReportContainerRef = React.createRef();
        
        this.regReportRef = React.createRef();
        this.regReportWrapperRef = React.createRef();
        this.regReportContainerRef = React.createRef();

        this.newPswReportRef = React.createRef();
        this.newPswReportWrapperRef = React.createRef();
        this.newPswReportContainerRef = React.createRef();
        
        this.noLogOutPopupRef = React.createRef();
        this.noLogOutPopupWrapperRef = React.createRef();
        this.noLogOutPopupContainerRef = React.createRef();
        
        this.forgottenPswPopupRef = React.createRef();
        this.forgPswPopupWrapperRef = React.createRef();
        this.forgPswPopupContainerRef = React.createRef();
        
        this.aboutPopupRef = React.createRef();
        this.aboutPopupWrapperRef = React.createRef();
        this.aboutPopupContainerRef = React.createRef();

        this.uProfilePopupRef = React.createRef();
        this.uProfilePopupWrapperRef = React.createRef();
        this.uProfilePopupContainerRef = React.createRef();

        this.sInPopup = <React.Fragment></React.Fragment>;

        /**
         * Используется в атрибуте bounds тега <MyDraggable> для ограничения области перетаскивания попапов-индикаторов.
         */
        this.mainWrapperClassName = "main_wrapper";
    }

    makeRegPageParamsObject(sizeFlag) {
        let resultObject = {};
        if(sizeFlag==this.smallPageSizeFlag) {
            Object.assign(resultObject, this.entrancePageParamsSmall);
            
        }
        else if(sizeFlag==this.middlePageSizeFlag) {
            Object.assign(resultObject, this.entrancePageParamsMiddle);
        }
        else if(sizeFlag==this.largePageSizeFlag) {
            Object.assign(resultObject, this.entrancePageParamsLarge);
        }
        
        return resultObject;
    }

    getCurrentMQueryMatch() {
        let currentMQueryMatchKey;
        for(let i=0; i<this.adaptMQueriesKeys.length; i++) {
            let key = this.adaptMQueriesKeys[i];
            if(this.state.adaptMQueriesMatches[key]==false) {
                if(i==0) currentMQueryMatchKey = -1; //Это значит, что все элементы оказались false - т.е., задействован самый малый размер окна.
                //В сущности, тут можно вместо -1 возвращать что угодно, что не сможет случайно совпасть с каким-нибудь ключом в 
                //adaptMQueriesKeys.
                else currentMQueryMatchKey = this.adaptMQueriesKeys[i-1]; 
                break;
            }
        }
        if(!currentMQueryMatchKey) //Это значит, что все элементы оказались true - т.е., задействован самый большой размер окна.
            currentMQueryMatchKey = this.adaptMQueriesKeys[this.adaptMQueriesKeys.length-1];
        return currentMQueryMatchKey;
    }

    makeAdaptedParams() {
        let currentMatch = Number(this.getCurrentMQueryMatch());
        if(currentMatch==1292) { 
            this.state.galleryInfoObject.adaptParams = this.adaptParams['1292'].galleryParams;
            this.state.entrancePageInfoObject.adaptParams = this.adaptParams['1292'].entrancePageParams;
            this.state.registrationPageInfoObject.adaptParams = this.adaptParams['1292'].registrationPageParams;
        }
        else if(currentMatch==1180) {
            this.state.galleryInfoObject.adaptParams = this.adaptParams['1180'].galleryParams;
            this.state.entrancePageInfoObject.adaptParams = this.adaptParams['1180'].entrancePageParams;
            this.state.registrationPageInfoObject.adaptParams = this.adaptParams['1180'].registrationPageParams;
        }
        else if(currentMatch==980) {
            this.state.galleryInfoObject.adaptParams = this.adaptParams['980'].galleryParams;
            this.state.entrancePageInfoObject.adaptParams = this.adaptParams['980'].entrancePageParams;
            this.state.registrationPageInfoObject.adaptParams = this.adaptParams['980'].registrationPageParams;
        }
        else if(currentMatch==880) {
            this.state.galleryInfoObject.adaptParams = this.adaptParams['880'].galleryParams;
            this.state.entrancePageInfoObject.adaptParams = this.adaptParams['880'].entrancePageParams;
            this.state.registrationPageInfoObject.adaptParams = this.adaptParams['880'].registrationPageParams;
        }
        else if(currentMatch==680) {
            this.state.galleryInfoObject.adaptParams = this.adaptParams['680'].galleryParams;
            this.state.entrancePageInfoObject.adaptParams = this.adaptParams['680'].entrancePageParams;
            this.state.registrationPageInfoObject.adaptParams = this.adaptParams['680'].registrationPageParams;
        }
        else {
            this.state.galleryInfoObject.adaptParams = this.adaptParams.smallest.galleryParams;
            this.state.entrancePageInfoObject.adaptParams = this.adaptParams.smallest.entrancePageParams;
            this.state.registrationPageInfoObject.adaptParams = this.adaptParams.smallest.registrationPageParams;
        }
    }

    adaptMQueryHandler() {
        const updatedMatches = this.adaptMQueriesKeys.reduce(function(acc, media) {
            acc[media] = !!(this.adaptMQueryLists[media] && this.adaptMQueryLists[media].matches);
            return acc;
        }.bind(this), {}); 
        
        this.state.adaptMQueriesMatches = updatedMatches;
        
        this.makeAdaptedParams();

        this.forceUpdate();
    }

//===================
//SO (SERVER OPERATIONS) INDICATORS
//Для попапов - индикаторов серверных операций.
//Пока мы можем единовремено выполнять лишь одну операцию с файлами, но в будущем я надеюсь это изменить. Поэтому
//для каждого вида операций - загрузки, удаления, переименования (может, и чтения списка файлов) - делаем свой попап-индикатор.

//Источники кода для спиннера:
//https://freefrontend.com/css-spinners/
//https://codepen.io/alphardex/pen/zYxXObq

//Создание/обслуживание попапов - индикаторов серверных операций (SO - server operations).
    createSOIndicatorContent(indicatorID) {
        let fUplIndStyle = {
            backgroundColor: "rgb(89, 66, 241)",
            border: "2px solid rgb(192, 172, 240)",
        };
        let fUplIndSpinnerStyle = {
            background: "yellow"
        };
        let fUplIndTitleStyle = {
            color: "rgb(230, 215, 19)"
        };
        let fUplIndTitle = "Файлы загружаются...";

        
        let fRemIndStyle = {
            backgroundColor: "rgb(241, 200, 62)",
            border: "2px solid rgb(184, 45, 45)",
        };
        let fRemIndSpinnerStyle = {
            background: "rgb(111, 2, 189)"
        };
        let fRemIndTitleStyle = {
            color: "rgb(75, 0, 130)"
        };
        let fRemIndTitle = "Удаление файлов...";


        let fRenameIndStyle = {
            backgroundColor: "rgb(70, 117, 9)",
            border: "2px solid rgb(126, 187, 45)",
        };
        let fRenameIndSpinnerStyle = {
            background: "rgb(255, 255, 255)"
        };
        let fRenameIndTitleStyle = {
            color: "rgb(230, 215, 19)"
        };
        let fRenameIndTitle = "Переименование...";

        
        let registrIndStyle = {
            backgroundColor: "rgb(14, 82, 170)",
            border: "2px solid rgb(45, 130, 187)",
        };
        let registrIndSpinnerStyle = {
            background: "rgb(255, 255, 255)"
        };
        let registrIndTitleStyle = {
            color: "rgb(230, 215, 19)"
        };
        let registrIndTitle = "Регистрация...";


        let signInIndStyle = {
            backgroundColor: "rgb(16, 112, 237)",
            border: "2px solid rgb(60, 170, 243)",
        };
        let signInIndSpinnerStyle = {
            background: "rgb(255, 255, 255)"
        };
        let signInIndTitleStyle = {
            color: "rgb(255, 255, 0)"
        };
        let signInIndTitle = "Вход в аккаунт...";
        

        let pswChangeIndStyle = {
            backgroundColor: "rgb(14, 82, 170)",
            border: "2px solid rgb(45, 130, 187)",
        };
        let pswChangeIndSpinnerStyle = {
            background: "rgb(255, 255, 255)"
        };
        let pswChangeIndTitleStyle = {
            color: "rgb(230, 215, 19)"
        };
        let pswChangeIndTitle = "Обновление пароля...";


        let downloadIndStyle = {
            backgroundColor: "rgb(89, 66, 241)",
            border: "2px solid rgb(192, 172, 240)",
        };
        let downloadIndSpinnerStyle = {
            background: "yellow"
        };
        let downloadIndTitleStyle = {
            color: "rgb(230, 215, 19)"
        };
        let downloadIndTitle = "Идёт скачивание...";
        

        let indicatorStyle, spinnerStyle, titleStyle, indicatorTitle, indicatorRef;
        if(indicatorID==this.signInIndicatorID) {
            indicatorStyle = signInIndStyle;
            spinnerStyle = signInIndSpinnerStyle;
            indicatorTitle = signInIndTitle;
            titleStyle = signInIndTitleStyle;
            indicatorRef = this.SOIndicatorsRefsObj[this.signInIndicatorID];
        }
        else if(indicatorID==this.registrIndicatorID) {
            indicatorStyle = registrIndStyle;
            spinnerStyle = registrIndSpinnerStyle;
            indicatorTitle = registrIndTitle;
            titleStyle = registrIndTitleStyle;
            indicatorRef = this.SOIndicatorsRefsObj[this.registrIndicatorID];
        }
        else if(indicatorID==this.fileUplIndicatorID) {
            indicatorStyle = fUplIndStyle;
            spinnerStyle = fUplIndSpinnerStyle;
            indicatorTitle = fUplIndTitle;
            titleStyle = fUplIndTitleStyle;
            indicatorRef = this.SOIndicatorsRefsObj[this.fileUplIndicatorID];
        }
        else if(indicatorID==this.fileRemIndicatorID) {
            indicatorStyle = fRemIndStyle;
            spinnerStyle = fRemIndSpinnerStyle;
            indicatorTitle = fRemIndTitle;
            titleStyle = fRemIndTitleStyle;
            indicatorRef = this.SOIndicatorsRefsObj[this.fileRemIndicatorID];
        }
        else if(indicatorID==this.fRenameIndicatorID) {
            indicatorStyle = fRenameIndStyle;
            spinnerStyle = fRenameIndSpinnerStyle;
            indicatorTitle = fRenameIndTitle;
            titleStyle = fRenameIndTitleStyle;
            indicatorRef = this.SOIndicatorsRefsObj[this.fRenameIndicatorID];
        }
        else if(indicatorID==this.pswChangeIndicatorID) {
            indicatorStyle = pswChangeIndStyle;
            spinnerStyle = pswChangeIndSpinnerStyle;
            indicatorTitle = pswChangeIndTitle;
            titleStyle = pswChangeIndTitleStyle;
            indicatorRef = this.SOIndicatorsRefsObj[this.pswChangeIndicatorID];
        }
        else if(indicatorID==this.downloadIndicatorID) {
            indicatorStyle = downloadIndStyle;
            spinnerStyle = downloadIndSpinnerStyle;
            indicatorTitle = downloadIndTitle;
            titleStyle = downloadIndTitleStyle;
            indicatorRef = this.SOIndicatorsRefsObj[this.downloadIndicatorID];      
        }

        let spinnerElsArr = [];
        for(let i=0; i<60; i++) {
            spinnerElsArr.push(<div style={spinnerStyle} className="popup-serveropers__spinner-circle"></div>);
        }

        return (
            <MyDraggable bounds={"."+this.mainWrapperClassName}>
                <div ref={indicatorRef} style={indicatorStyle} id={indicatorID} className="popup-serveropers">
                    <div style={titleStyle} className="popup-serveropers__title">{indicatorTitle}</div>
                    <div className="popup-serveropers__spinner">
                        {spinnerElsArr}
                    </div>
                </div>
            </MyDraggable>
        );


    }

    showSOIndicator(indicatorID) {
        let indicatorRef = this.SOIndicatorsRefsObj[indicatorID];

        if(!indicatorRef.current) {
            let divForReactRendering = document.createElement("div");

            ReactDOM.render(this.createSOIndicatorContent(indicatorID), divForReactRendering); 
        }

        if(indicatorID==this.fileUplIndicatorID || indicatorID==this.fileRemIndicatorID 
        || indicatorID==this.fRenameIndicatorID || indicatorID==this.downloadIndicatorID)
            this.popupsContainerRef.current.appendChild(indicatorRef.current);
        else if(indicatorID==this.registrIndicatorID || indicatorID==this.signInIndicatorID 
        || indicatorID==this.pswChangeIndicatorID)
            this.popupsContainerPrimaryRef.current.appendChild(indicatorRef.current);
    }

    closeSOIndicator(indicatorID) {
        let indicatorRef = this.SOIndicatorsRefsObj[indicatorID];

        if(indicatorID==this.fileUplIndicatorID || indicatorID==this.fileRemIndicatorID 
        || indicatorID==this.fRenameIndicatorID || indicatorID==this.downloadIndicatorID) {
            if(indicatorRef.current.parentNode==this.popupsContainerRef.current) 
                this.popupsContainerRef.current.removeChild(indicatorRef.current);
        }
        else if(indicatorID==this.registrIndicatorID || indicatorID==this.signInIndicatorID 
        || indicatorID==this.pswChangeIndicatorID) {
            if(indicatorRef.current.parentNode==this.popupsContainerPrimaryRef.current) 
                this.popupsContainerPrimaryRef.current.removeChild(indicatorRef.current);
        }        
    }

//=====================================

    setStateAuthorised(flag, userInfoObject) {//Устанавливает Главный Компонент (а значит, и все дочерние, для кого
    //это важно) в состояние Авторизован/Не авторизован и выполняет все сопутствующие действия.
    //Аргумент userInfoObject передаётся в случае, если нужно поставить "Авторизован" - в нём содержится инфа 
    //о юзере.

        if(flag===FLAG.authorised) {
            this.state.userInfoObject.userID = userInfoObject["userID"];
            this.state.userInfoObject.login = userInfoObject["Login"];
            this.state.userInfoObject.email = userInfoObject["Email"];
            this.state.userInfoObject.name = userInfoObject["Name"];
            this.state.userInfoObject.userRegDate = userInfoObject["Date"];
            
            if(this.state.userInfoObject.userID!=this.state.previousUserID) {
                //В ситуации, когда один юзер меняется на другого, нужно очистить временные объекты, оставшиеся
                //от предыдущего юзера.
                //ЗАМЕТИМ, это нужно делать именно при авторизации новго юзера, а не при разлогинивании старого,
                //т.к. старый может затем снова залогиниться, и ему эти объекты понадобятся нетронутыми. Это, например,
                //происходит, когда юзер выделил какие-то итемы и попытался их удалить - но у него кончился срок авторизации,
                //и вылез авторизационный попап. Он опять залогинится (через этот попап, никуда не уходя из Галереи)
                //- и должен увидеть итемы по-прежнему выделенными (но все дисаблирования должны исчезнуть, конечно).
                this.clearTempObjects();
                this.state.filesToUploadArr = null;
                this.state.previousUserID = this.state.userInfoObject.userID;
            }
            //А ГДЕ ЖЕ снимается дисаблирование, если мы входим в тот же аккаунт? - Оно снимается в Gallery,
            //в shouldComponentUpdate() (См. там коммент "Авторизуется предыдущий юзер."). Здесь уничтожать
            //объект disabledItemsTempObject рано, т.к. он нужен в Gallery.
            this.forceUpdate();

        }
        else if(flag===FLAG.unauthorised) 
            this.clearAuthorization();
    }
    
    clearAuthorization() {
        this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;        
        this.state.userInfoObject.login = null;
        this.state.userInfoObject.email = null;
        this.state.userInfoObject.name = null;
        this.state.userInfoObject.userRegDate = null;  

        if(this.state.uProfilePopupIsOpen) this.closeUProfilePopup();

        this.forceUpdate();
    }

    closeOperationsReport() {
        this.state.operationsReportActive = false;

        this.forceUpdate();
    }


    //Часто нужен попап с таким текстом, но для разных ситуаций и рефов. Поэтому сделал ф-ю.
    //Используется в PopupsUniMethods.openUniPopupOneButton(...).
    createUnknownErrInfoObject(btnClickHandler) {
        return {
            buttonClickHandler: btnClickHandler,
            buttonText: "OK",
            bgColor: "red",
            borderColor: "white",
            titleText: "Ошибка!",
            titleBgColor: "rgb(255, 100, 30)",
            titleTextColor: "yellow",
            contentStrsArr: ["Неизвестная ошибка. Проверьте соединение", 
            "и отправьте данные ещё раз.", 
            "Если ошибка не исчезает, напишите нам", 
            "на " + NAMES_PATHS.siteEmail + ",", 
            "указав ваш логин и username."]
        };
    }

    addFolderNameToCookies(folderCookieName, folderName, path) {
        let folderNameAlreadyInCookies = this.cookies.get(folderCookieName);
        if(folderNameAlreadyInCookies != folderName) {
            if(path)
                this.cookies.set(folderCookieName, folderName, {"path": path});
            else this.cookies.set(folderCookieName, folderName);
            /*
                this.cookies.set(folderCookieName, folderName, {"path": path, sameSite: "Strict", secure: true});
            else this.cookies.set(folderCookieName, folderName, {sameSite: "Strict", secure: true});
            */
            /*
                !!От идеи устанавивать для куки атрибуты sameSite и secure пришлось отказаться, т.к.
                Google Chrome почему-то не хочет устанавливать у себя куку с этими атрибутами - независимо от того,
                создана ли она на сервере и прислана с ответом, или мы создаём её здесь, через this.cookies.set().
                Firefox всё устанавливает нормально.
                ПРИ ЭТОМ, куки, устанавливаемые в Google Chrome, похоже, уже имеют sameSite = "Strict": если 
                просмотреть их содержимое, мы увидим запись "Отправка" - "Только соединение с тем же сайтом".
                
                Установка атрибута куки sameSite="Strict" позволит этому куки прицепляться к запросам только к
                домену, для которого он предназначен.
                Атрибут secure=true позволит этому куки прицепляться только к запросам по HTTPS.
                Источники:
                - https://expressjs.com/en/4x/api.html#res.cookie
                - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
            */         
        }
    }


    //Ф-я, с помощью которой можно получать сигналы от дочерних элементов. Она передаётся в дочерний элемент в
    //пропсах, и в коде элемента её можно вызвать, передав какие-то параметры.
    universalTool(command, infoArgument) {
        if(command==DO.setStateAuthorised)
            this.setStateAuthorised(FLAG.authorised, infoArgument);
        else if(command===DO.setStateUnauthorised)
            this.setStateAuthorised(FLAG.unauthorised, infoArgument);

/*
//ПОКА НЕ НУЖНО, т.к. ни один дочерний эл-т сейчас не может прислать такую команду: проверка авторизационного
//токена производится только в запросах на сервер, отправляемых Главным Компонентом.
        else if(command===DO.openSignInPopup) {
            //Из дочернего эл-та пришла команда показать авторизационный попап (<SignInPopup>).
            //Здесь infoArgument указывает, какого типа <SignInPopup> вывести - нужный при первом запуске сайта
            //(infoArgument=FLAG.sInPopup_initialView) или если кончилась авторизационная сессия юзера
            //(тогда infoArgument=FLAG.sInPopup_sessionEndedView)
            this.openSignInPopup(infoArgument);  

        }   
*/
        else if(command===DO.closeSignInPopup) {
            //Команда на закрытие авторизационного попапа.
            this.closeSignInPopup();
        }
        else if(command==DO.goToRegPageFromSInPopup) {
            //Команда на переход на страницу регистрации по ссылке из авторизационного попапа.
            //При таком переходе авторизационный попап закрывается: он не нужен, т.к. на странице регистрации
            //есть своя форма дла залогинивания.
            if(this.state.signInPopupIsOpen) {
                this.enableSignInPopup();
                this.closeSignInPopup();
            }
            history.push("/registration");
        }
        else if(command==DO.openAboutProject) {
            //Открыть попап "О проекте".
            this.showAboutPopup();
        }
        else if(command==DO.closeAboutProject) {
            //Закрыть попап "О проекте".
            this.closeAboutPopup();
        }
        else if(command==DO.openForgottenPswPopup) {
            //Открыть попап "Забыли пароль?"
            this.showForgottenPswPopup();
        }
        else if(command==DO.closeForgottenPswPopup) {
            //Закрыть попап "Забыли пароль?"
            this.closeForgottenPswPopup();
        }
        else if(command==DO.openUserProfile) {
            //Открыть попап с профилем юзера. Т.к. в перспективе это не обязательно будет попап, в имени CI_...
            //нет слова Popup.
            this.showUProfilePopup();
        }        
        else if(command==DO.closeUserProfile) {
            //Закрыть попап с профилем юзера.
            this.closeUProfilePopup();
        }
        else if(command==DO.changePassword) {
            //Отправить на сервер запрос на целенаправленную смену старого пароля новым.
            //Здесь infoArgument - объект класса FormData, содержащий введённые юзером старый пароль, новый
            //пароль и повторение нового пароля. 
            
            //Проверку, не находитесь ли вы в процессе авторизации, как мы это делаем в обработке CI_changeForgottenPassword,
            //здесь делать не нужно - ведь целенаправленно сменить пароль (а не воспользоваться "Забыли пароль?")
            //может лишь уже авторизованный юзер.
            if(!this.state.pswChangeProcessIsActive)
            {
                let fetch_url = F_URL.changePsw;
                const fetch_options = {
                    method: 'POST',
                    credentials: 'same-origin', //Вообще эта опция стоит по умолчанию, но лучше пропишем явно.
                    //Она автоматически цепляет к fetch-запросу куки.
                    body: infoArgument
                };
            
                this.state.pswChangeProcessIsActive = true;
                this.showSOIndicator(this.pswChangeIndicatorID);

                fetch(fetch_url, fetch_options)
                .then(function(response){ 
                    if(response.ok) return response.json();
                    else if(response.status==RESP_CODE.unauthorised) 
                        return Promise.resolve({unauthorized: true});
                    else return Promise.reject();
                    
                })
                .then(function(response_json) {
                /*
                    Объект, высылаемый с сервера в ответе, выглядит так:
                    resultObject = {
                        formParseError: <boolean>, //Не удалось распарсить пришедшую форму с данными юзера.
                        incorrectOldPsw: <boolean>, //Недопустимый старый пароль.
                        incorrectNewPsw: <boolean>,
                        repeatNewPswError: <boolean>, //Неправильно повторили новый пароль.
                        oldPasswordNotFound: <boolean>,
                        readDBTableError: <boolean>,
                        updateDBTableError: <boolean>, //Ошибка при записи в БД нового пароля.
                    };
                */
                
                    if(response_json.unauthorized) {
                        this.state.pswChangeProcessIsActive = false;
                        this.closeSOIndicator(this.pswChangeIndicatorID);
                        this.clearAuthorization();
                        this.openSignInPopup(FLAG.sInPopup_sessionEndedView);                        
                    }
                    else {
                        if(response_json.formParseError ||
                        response_json.readDBTableError ||
                        response_json.updateDBTableError) {
                            let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef);}.bind(this));
                            PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);

                        }
                        else if(response_json.incorrectOldPsw) {
                            let infoObject = {
                                buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                                buttonText: "OK",
                                bgColor: "red",
                                borderColor: "white",
                                titleText: "Ошибка!",
                                titleBgColor: "rgb(255, 100, 30)",
                                titleTextColor: "yellow",
                                contentStrsArr: ["Старый пароль некорректен", 
                                "(недопустимые символы или длина)!"]
                            };
                            PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);
                            
                        }
                        else if(response_json.incorrectNewPsw) {
                            let infoObject = {
                                buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                                buttonText: "OK",
                                bgColor: "red",
                                borderColor: "white",
                                titleText: "Ошибка!",
                                titleBgColor: "rgb(255, 100, 30)",
                                titleTextColor: "yellow",
                                contentStrsArr: ["Новый пароль некорректен", 
                                "(недопустимые символы или длина)!"]
                            };
                            PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);

                        }
                        else if(response_json.repeatNewPswError) {
                            let infoObject = {
                                buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                                buttonText: "OK",
                                bgColor: "red",
                                borderColor: "white",
                                titleText: "Ошибка!",
                                titleBgColor: "rgb(255, 100, 30)",
                                titleTextColor: "yellow",
                                contentStrsArr: ["Новый пароль повторён неверно!"]
                            };
                            PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);

                        }
                        else if(response_json.oldPasswordNotFound) {
                            let infoObject = {
                                buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                                buttonText: "OK",
                                bgColor: "red",
                                borderColor: "white",
                                titleText: "Ошибка!",
                                titleBgColor: "rgb(255, 100, 30)",
                                titleTextColor: "yellow",
                                contentStrsArr: ["Введённый старый пароль не найден!"]
                            };
                            PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);

                        }
                        else {//Смена пароля прошла успешно.
                            let infoObject = {
                                buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                                buttonText: "OK",
                                bgColor: "rgb(34, 139, 34)",
                                borderColor: "white",
                                titleText: "Успешно!",
                                titleBgColor: "rgb(50, 170, 50)",
                                titleTextColor: "rgb(255, 215, 0)",
                                contentStrsArr: ["Можете использовать ваш новый пароль."]
                            };
                            PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);


                        }
            
                        this.state.pswChangeProcessIsActive = false;
                        this.closeSOIndicator(this.pswChangeIndicatorID);
                    }
                }.bind(this))
                .catch(function(err){

                    let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef);}.bind(this));
                    PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);
                    
                    this.state.pswChangeProcessIsActive = false;
                    this.closeSOIndicator(this.pswChangeIndicatorID);
                }.bind(this));
            }
            else { //Мы попытались отправить запрос о смене пароля, когда такая операция уже проводится.
//???
                //Здесь можно вывести универсальный попап с требованием дождаться окончания операции.
                //А можно и ничего не делать.
                //alert("Вы уже меняете пароль! Дождитесь окончания операции.");                    
            }
        }        
        else if(command==DO.changeForgottenPassword) {
            //Отправить на сервер запрос на формирование нового пароля взамен забытого.
            
            //Здесь infoArgument - объект класса FormData, содержащий введённые юзером логин и userName. 
            //Мы требуем их оба для пущей безопасности.

            //Нельзя получить новый пароль, если уже производится операция смены пароля, или если юзер в настоящий
            //момент залогинивается.
            if(!this.state.pswChangeProcessIsActive && this.state.userInfoObject.userID!=SPECIAL_UID.signingIn) {
                let fetch_url = F_URL.changeForgottenPsw;
                const fetch_options = {
                    method: 'POST',
                    body: infoArgument
                }; 
            
                this.state.pswChangeProcessIsActive = true;
                this.closeForgottenPswPopup();
                this.showSOIndicator(this.pswChangeIndicatorID);
            
                fetch(fetch_url, fetch_options)
                .then(function(response){ 
                    if(response.ok) return response.json();
                    else return Promise.reject(response.status);
                })
                .then(function(response_json) {
                /*
                    Объект, высылаемый с сервера в ответе, выглядит так:
                    resultObject = {
                        formParseError: <boolean>, //Не удалось распарсить пришедшую форму с данными юзера.
                        incorrectLogin: <boolean>, //Недопустимый логин.
                        incorrectUName: <boolean>,
                        loginOrUNameNotFound: <boolean>,
                        readDBTableError: <boolean>, 
                        updateDBTableError: <boolean>, //Ошибка при записи в БД нового пароля.
                        mailSendingError: <boolean>, //Ошибка при отправке письма с паролем.
                    };
                */
            
                    if(response_json.formParseError ||
                    response_json.readDBTableError ||
                    response_json.updateDBTableError ||
                    response_json.mailSendingError) {
                        let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef);}.bind(this));
                        PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);
                    }
                    else if(response_json.incorrectLogin) {
                        let infoObject = {
                            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                            buttonText: "OK",
                            bgColor: "red",
                            borderColor: "white",
                            titleText: "Ошибка!",
                            titleBgColor: "rgb(255, 100, 30)",
                            titleTextColor: "yellow",
                            contentStrsArr: ["Некорректный логин", "(недопустимые символы или длина)!"]
                        };
                        PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);
                    }
                    else if(response_json.incorrectUName) {
                        let infoObject = {
                            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                            buttonText: "OK",
                            bgColor: "red",
                            borderColor: "white",
                            titleText: "Ошибка!",
                            titleBgColor: "rgb(255, 100, 30)",
                            titleTextColor: "yellow",
                            contentStrsArr: ["Некорректное имя пользователя", "(недопустимые символы или длина)!"]
                        };
                        PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);
                    }
                    else if(response_json.loginOrUNameNotFound) {
                        let infoObject = {
                            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                            buttonText: "OK",
                            bgColor: "red",
                            borderColor: "white",
                            titleText: "Ошибка!",
                            titleBgColor: "rgb(255, 100, 30)",
                            titleTextColor: "yellow",
                            contentStrsArr: ["Логин или имя пользователя", "не найдены!"]
                        };
                        PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);
                    }
                    else { //Всё успешно
                        let infoObject = {
                            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef)}.bind(this),
                            buttonText: "OK",
                            bgColor: "rgb(34, 139, 34)",
                            borderColor: "white",
                            titleText: "Успешно!",
                            titleBgColor: "rgb(50, 170, 50)",
                            titleTextColor: "rgb(255, 215, 0)",
                            contentStrsArr: ["Новый пароль выслан на e-mail,", "соответствующий введённым", "логину и имени пользователя."]
                        };
                        PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);
                    }
            
                    this.state.pswChangeProcessIsActive = false;
                    this.closeSOIndicator(this.pswChangeIndicatorID);
                }.bind(this))
                .catch(function(err) {
                    this.state.pswChangeProcessIsActive = false;
                    this.closeSOIndicator(this.pswChangeIndicatorID);

                    let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.newPswReportWrapperRef, this.newPswReportContainerRef);}.bind(this));
                    PopupsUniMethods.openUniPopupOneButton(this.newPswReportRef, this.newPswReportWrapperRef, this.newPswReportContainerRef, infoObject);
                }.bind(this));
            }
            else {
                if(this.state.pswChangeProcessIsActive) {//Мы попытались отправить запрос о получении нового
                //пароля, когда смена пароля уже проводится.
//???
                    //Здесь можно вывести универсальный попап с требованием дождаться окончания операции.
                    //А можно и ничего не делать.
                    //alert("Вы уже меняете пароль! Дождитесь окончания операции.");                    
                }
                else if(this.state.userInfoObject.userID==SPECIAL_UID.signingIn) {
//???
                    //Заменить на нормальный попап?
                    alert("Вы в процессе авторизации. Подождите окончания...");
                }

            }
        }
        else if(command==DO.signOut || command==DO.signOutToMainPage) {
            //DO.signOut - команда просто разлогиниться.
            //DO.signOutToMainPage - команда разлогиниться и перейти на главную страницу.
            
            if(!this.state.uploadProcessIsActive && 
            !this.state.filesRemovingProcessIsActive &&
            !this.state.fileRenamingProcessIsActive &&
            !this.state.downloadingProcessIsActive) { //Нельзя разлогиниваться, если идут файловые операции
                this.cookies.remove(JWTOKEN.jwTokenName); //Уничтожаем куки с токеном.
                this.clearAuthorization();

                if(command==DO.signOutToMainPage) history.push("/");
            }
            else {
                let infoObject = {
                    buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.noLogOutPopupWrapperRef, this.noLogOutPopupContainerRef)}.bind(this),
                    buttonText: "OK",
                    bgColor: "rgb(34, 139, 34)",
                    borderColor: "white",
                    titleText: "Отказано!",
                    titleBgColor: "rgb(50, 170, 50)",
                    titleTextColor: "rgb(255, 215, 0)",
                    contentStrsArr: ["Нельзя выходить из аккаунта,", "пока не закончены серверные операции..."]
                };
                PopupsUniMethods.openUniPopupOneButton(this.noLogOutPopupRef, this.noLogOutPopupWrapperRef, this.noLogOutPopupContainerRef, infoObject);

            }

        }
        else if(command==DO.signIn) {
            //Авторизация - т.е., отправка на сервер данных авторизационной формы.
            //Здесь infoArgument - объект класса FormData, содержащий введённые юзером логин и пароль.

            //Пытаться авторизоваться можно только если уже не идёт процесс авторизации. 
            if(this.state.userInfoObject.userID!=SPECIAL_UID.signingIn) {
                let fetch_url = F_URL.signingIn;
                const fetch_options = {
                    method: 'POST',
                    body: infoArgument
                };
            
       
                this.state.userInfoObject.userID = SPECIAL_UID.signingIn; //Индицируем, что идёт процесс авторизации.
                this.forceUpdate(); //Чтобы дочерние компоненты получили через пропсы это значение - userID = SPECIAL_UID.signingIn - 
                //и "знали", что идёт процесс авторизации.
                
                //Выводим попап-индикатор серверной операции.
                this.showSOIndicator(this.signInIndicatorID);

                fetch(fetch_url, fetch_options)
                .then(function(response){ 
                    if(response.ok) return response.json();
                    else return Promise.reject(response.status);
                })
                .then(function(response_json) {
                /*
                    Объект, высылаемый с сервера в ответе, выглядит так:
                    resultObject = {
                        formParseError: <boolean>, //Не удалось распарсить пришедшую форму с данными юзера.
                        incorrectLogin: <boolean>, //Недопустимый логин.
                        incorrectPassword: <boolean>,
                        loginNotFound: <boolean>,
                        passwordNotFound: <boolean>,
                        readDBTableError: <boolean>,
                        jwtoken: <JWToken>
                    };
                */

                    let shouldForceUpdate = true;
                    if(response_json.formParseError) {
                        this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;

                        let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.sInReportWrapperRef, this.sInReportContainerRef);}.bind(this));
                        PopupsUniMethods.openUniPopupOneButton(this.sInReportRef, this.sInReportWrapperRef, this.sInReportContainerRef, infoObject);
                        //Команда this.enableSignInPopup() нужна на случай, если мы логинимся с авторизационного
                        //попапа. При отпавке данных его форма ввода логина/пароля дисаблируется, и, чем бы
                        //ни кончилась попытка авторизации, нужно эту форму энаблировать.
                        //По той же логике эта команда применяется всюду ниже в этом .then.
                        this.enableSignInPopup();
                    }
                    else if(response_json.incorrectLogin) {
                        this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;
                        let infoObject = {
                            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.sInReportWrapperRef, this.sInReportContainerRef)}.bind(this),
                            buttonText: "OK",
                            bgColor: "red",
                            borderColor: "white",
                            titleText: "Ошибка!",
                            titleBgColor: "rgb(255, 100, 30)",
                            titleTextColor: "yellow",
                            contentStrsArr: ["Некорректный логин", 
                            "(недопустимые символы или длина)!"]
                        };
                        PopupsUniMethods.openUniPopupOneButton(this.sInReportRef, this.sInReportWrapperRef, this.sInReportContainerRef, infoObject);

                        this.enableSignInPopup();
                    }
                    else if(response_json.incorrectPassword) {
                        this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;

                        let infoObject = {
                            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.sInReportWrapperRef, this.sInReportContainerRef)}.bind(this),
                            buttonText: "OK",
                            bgColor: "red",
                            borderColor: "white",
                            titleText: "Ошибка!",
                            titleBgColor: "rgb(255, 100, 30)",
                            titleTextColor: "yellow",
                            contentStrsArr: ["Некорректный пароль", 
                            "(недопустимые символы или длина)!"]
                        };
                        PopupsUniMethods.openUniPopupOneButton(this.sInReportRef, this.sInReportWrapperRef, this.sInReportContainerRef, infoObject);

                        this.enableSignInPopup();
                    }
                    else if(response_json.loginNotFound) {
                        this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;

                        let infoObject = {
                            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.sInReportWrapperRef, this.sInReportContainerRef)}.bind(this),
                            buttonText: "OK",
                            bgColor: "red",
                            borderColor: "white",
                            titleText: "Ошибка!",
                            titleBgColor: "rgb(255, 100, 30)",
                            titleTextColor: "yellow",
                            contentStrsArr: ["Логин не найден!"]
                        };
                        PopupsUniMethods.openUniPopupOneButton(this.sInReportRef, this.sInReportWrapperRef, this.sInReportContainerRef, infoObject);

                        this.enableSignInPopup();
                    }
                    else if(response_json.passwordNotFound) {
                        this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;

                        let infoObject = {
                            buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.sInReportWrapperRef, this.sInReportContainerRef)}.bind(this),
                            buttonText: "OK",
                            bgColor: "red",
                            borderColor: "white",
                            titleText: "Ошибка!",
                            titleBgColor: "rgb(255, 100, 30)",
                            titleTextColor: "yellow",
                            contentStrsArr: ["Пароль не найден!"]
                        };
                        PopupsUniMethods.openUniPopupOneButton(this.sInReportRef, this.sInReportWrapperRef, this.sInReportContainerRef, infoObject);

                        this.enableSignInPopup();
                    }
                    else if(response_json.readDBTableError) {
                        this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;

                        let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.sInReportWrapperRef, this.sInReportContainerRef);}.bind(this));
                        PopupsUniMethods.openUniPopupOneButton(this.sInReportRef, this.sInReportWrapperRef, this.sInReportContainerRef, infoObject);

                        this.enableSignInPopup();
                    }
                    else {
                        if(response_json.jwtoken) {
                            shouldForceUpdate = false; //Потому что в setStateAuthorised() есть свой forceUpdate().
                            if(this.state.signInPopupIsOpen) this.closeSignInPopup();
                            this.setStateAuthorised(FLAG.authorised, response_json.jwtoken);
                        } 
                        else { //Почему-то на сервере не создался токен.
                            this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;
                            let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.sInReportWrapperRef, this.sInReportContainerRef);}.bind(this));
                            PopupsUniMethods.openUniPopupOneButton(this.sInReportRef, this.sInReportWrapperRef, this.sInReportContainerRef, infoObject);

                            this.enableSignInPopup();
                        }
                    }

                    this.closeSOIndicator(this.signInIndicatorID);
                    if(shouldForceUpdate) this.forceUpdate(); //Перерисовка нужна, чтобы передать в дочерние
                    //компоненты новое значение this.state.userInfoObject.userID - либо ID юзера, либо, в случае
                    //неудачи, SPECIAL_UID.unauthorised.
                }.bind(this))
                .catch(function(err) {
                    this.closeSOIndicator(this.signInIndicatorID);
                    this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;
                
                    let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.sInReportWrapperRef, this.sInReportContainerRef);}.bind(this));
                    PopupsUniMethods.openUniPopupOneButton(this.sInReportRef, this.sInReportWrapperRef, this.sInReportContainerRef, infoObject);

                    this.forceUpdate();
                }.bind(this));
            }
//???
            //Заменить на нормальный попап?
            else alert("Вы уже в процессе авторизации. Подождите окончания...");
        }
        else if(command===DO.register) {
            //Отправка на сервер запроса о регистрации, с данными нового юзера.
            //Это можно делать в любом состоянии - и когда мы залогинены, и когда нет, и в процессе авторизации:
            //к новому юзеру наши текущие дела отношения не имеют.
            
            //Здесь infoArgument - объект класса FormData с данными формы регистрации.

            let fetch_url = F_URL.preRegistration;
            const fetch_options = {
                method: 'POST',
                body: infoArgument
            }; 

            this.state.registrationProcessIsActive = true;

            this.showSOIndicator(this.registrIndicatorID);

            fetch(fetch_url, fetch_options)
            .then(function(response){ 
                if(response.ok) return response.json();
                else return Promise.reject();
            })
            .then(function(response_json) {
/*
Так выглядит ответ сервера.

            resultObject = {
                formParseError: <boolean>, //Не удалось распарсить пришедшую форму с данными юзера.
                incorrectLogin: <boolean>, //Недопустимый логин.
                incorrectPassword: <boolean>,
                repeatPasswordError: <boolean>,
                incorrectUName: <boolean>,
                incorrectEmail: <boolean>,
                loginExistsError: <boolean>, //Такой логин уже есть.
                userNameExistsError: <boolean>, //Такое имя юзера уже есть.
                emailExistsError: <boolean>, //Такой емейл уже есть.
                preRegDataCreatingError: <boolean>, //Ошибка при добавлении данных в таблицу предварительно зарегистрированных.
                actMailSendingError: <boolean>, //Ошибка при отправке письма с активационной ссылкой.
            };
*/                
                
                if(response_json.formParseError) {
                    let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this));
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);
                }
                else if(response_json.incorrectLogin) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Вы ввели некорректный логин", 
                        "(с недопустимыми символами или длиной)!"]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);
                    
                }
                else if(response_json.incorrectPassword) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Вы ввели некорректный пароль", 
                        "(с недопустимыми символами или длиной)!"]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);

                }
                else if(response_json.repeatPasswordError) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Вы неправильно повторили пароль!"]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);
                    
                }
                else if(response_json.incorrectUName) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Вы ввели некорректное", "имя пользователя", "(с недопустимыми символами или длиной)!"]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);

                }
                else if(response_json.incorrectEmail) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Вы ввели некорректный", "адрес e-mail", "(с недопустимыми символами или длиной)!"]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);

                }
                else if(response_json.loginExistsError) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Пользователь с таким логином", "уже зарегистрирован!"]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);

                }
                else if(response_json.userNameExistsError) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Пользователь с таким именем (user name)", "уже зарегистрирован!"]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);

                }
                else if(response_json.emailExistsError) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Пользователь с таким e-mail", "уже зарегистрирован!"]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);

                }
                else if(response_json.preRegDataCreatingError) {
                    let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this));
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);
                }
                else if(response_json.actMailSendingError) {
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "red",
                        borderColor: "white",
                        titleText: "Ошибка!",
                        titleBgColor: "rgb(255, 100, 30)",
                        titleTextColor: "yellow",
                        contentStrsArr: ["Сожалеем, не удалось отправить", 
                        "активационное письмо на ваш e-mail.",
                        "Пробема будет исправлена автоматически,",
                        "либо вы можете написать нам на " + NAMES_PATHS.siteEmail + ",",
                        "указав ваш логин и username - так будет быстрее."]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);

                }
                else { //Всё успешно.
                    let infoObject = {
                        buttonClickHandler: function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this),
                        buttonText: "OK",
                        bgColor: "rgb(34, 139, 34)",
                        borderColor: "white",
                        titleText: "Успешно!",
                        titleBgColor: "rgb(50, 170, 50)",
                        titleTextColor: "rgb(255, 215, 0)",
                        contentStrsArr: ["Для завершения регистрации", 
                        "необходимо активировать аккаунт.", 
                        "На ваш e-mail выслано письмо с инструкциями."]
                    };
                    PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);
                }

                this.state.registrationProcessIsActive = false;
                this.closeSOIndicator(this.registrIndicatorID);
                this.forceUpdate(); //Чтобы энаблировать кнопку "Register" в форме регистрации - она дисаблируется
                //на время обработки запроса. Если в этот момент будут происходить какие-то файловые операции 
                //(скажем, юзер отправил данные на регистрацию, а сам залогинился и стал что-то делать с файлами),
                //никаких конфликтов этот апдейт не вызовет, всё нормально разорулится.
            }.bind(this))
            .catch(function(err) {
                this.state.registrationProcessIsActive = false;
                this.closeSOIndicator(this.registrIndicatorID);

                let infoObject = this.createUnknownErrInfoObject(function() {PopupsUniMethods.closeUniPopup(this.regReportWrapperRef, this.regReportContainerRef)}.bind(this));
                PopupsUniMethods.openUniPopupOneButton(this.regReportRef, this.regReportWrapperRef, this.regReportContainerRef, infoObject);

                this.forceUpdate(); //Чтобы энаблировать кнопку "Register" в форме регистрации.
            }.bind(this));
        }
        else if(command==DO.closeOpersReport) {
            //Команда на закрытие попапа <OperationsReport/>.
            //Здесь infoArgument - объект вида {flag: value, info: any}, где flag показывает, результаты
            //какой именно операции показывает <OperationsReport/> (если, например, было удаление файлов - а
            //оно производится через вызов universalTool() с флагом DO.removeFiles - то
            //flag будет равен DO.removeFiles).
            //Параметр info м.б. чем угодно. Просто для некоторых операций <OperationsReport/> при закрытии
            //должна передать в Главный Компонент кое-какую инфу - она и передаётся в info. Стандарта info
            //нет, так что Главный Компонент и <OperationsReport/> должны вместе знать, как выглядит info для
            //для тех или иных flag.


            if(infoArgument.flag==FO_STATUS.uplFilesAlreadyExist) { //При загрузке файлов на сервер оказалось, что
            //кто-то из них там уже есть. Попап <OperationsReport/> в такой стиуации содержит вопрос, перезаписывать
            //очередной из совпавших файлов, или нет, а данный if() вызывается, когда все совпавшие перебраны, 
            //т.е., при последнем нажатии на "Перезаписать"/"Пропустить" (ну или если там поставили галочку 
            //"то же для всех последующих"). infoArgument.info здесь является массивом индексов файлов, которые
            //нужно перезаписывать (имеются в виду индексы из первоначального массива загружаемых файлов - 
            //this.state.filesToUploadArr).
            //Если длина infoArgument.info ненулевая, то формируется новый объект FormData с файлами для перезаписи
            //и отправляется на сервер в новом запросе. Если же нет, то операция завершается.
    
                let fIndexesToOverWriteArr = infoArgument.info;
                let fIndexesArrLength = fIndexesToOverWriteArr.length;
                
                
                if(fIndexesArrLength > 0) {
                    let fData = new FormData();

                    for(let i=0; i<fIndexesArrLength; i++) {
                        let index = fIndexesToOverWriteArr[i];
                        let file = this.state.filesToUploadArr[index]; //Объект File.
                        fData.append(i, file, file.name); //При первоначальной загрузке (command==DO.uploadFiles)
                        //поля в FormData именуются как индексы в начальном массиве загружаемых файлов this.state.filesToUploadArr.
                        //Аналогично, здесь поля именуются как индексы в новом массиве загружаемых файлов - т.е.,
                        //тех, что будут перезаписаны. На сервере и тот, и другой случай обрабатываются одинаково, 
                        //одной ф-ей.
                    }

                    this.addFolderNameToCookies(COOKIE_NAMES.forFlsOverwritingRequest, this.state.galleryInfoObject.operFolder, F_URL.flsUplOverwriting);
                    

                    let fetch_upload_url = F_URL.flsUplOverwriting;
                    const fetch_upload_options = {
                        method: 'POST',
                        body: fData
                    }; 

                    this.state.fsOperationStatus = FO_STATUS.waitingForResults;
                    this.closeOperationsReport(); //forceUpdate() вызывается внутри. Она нужна, чтобы передать
                    //значение this.state.fsOperationStatus в <Gallery>

                    fetch(fetch_upload_url, fetch_upload_options)
                    .then(function(response){ 
                        if(response.ok) return response.json();
                        else if(response.status==RESP_CODE.unauthorised) {
                            alert("Файлы не были перезаписаны, т.к. ваша сессия закончилась!");
                            return Promise.resolve({unauthorized: true});
                        }
                        else return Promise.reject(); //Отсюда мы попадём в catch. В здешнем catch любая ошибка
                        //характеризуется как RESULT.fetchError. И хотя раз с сервера пришёл какой-то 
                        //ответ, это, возможно, не ошибка fetch(), тем не менее, я думаю, можно и этот случай
                        //преподносить, как RESULT.fetchError - для юзера это не будет важно.
                    })
                    .then(function(response_json){

/*
//Аналогично с просто ф-ей загрузки файлов (блок if(command==DO.uploadFiles)):
                        response_json - это пришедший с ответом сервера объект-отчёт о проведённой операции:
                        {
                            succUploads: массив индексов из массива загружаемых файлов (this.state.filesToUploadArr), 
                                        которые загрузились успешно,
                            uploadingErr: JSON-строка с сообщением об ошибке, возникшей при загрузке, 
                            faultyUploads_mimeType: массив индексов из массива загружаемых файлов (this.state.filesToUploadArr), 
                                            которые соответствуют файлам, не загруженным из-за неверного типа,
                            faultyUploads_fileExists: аналогично, массив индексов из this.state.filesToUploadArr, которые 
                                            соответствуют файлам, уже имеющимся в Галерее,
                           readDirErr: JSON-строка с ошибкой чтения директории Галереи,
                            allFileNames: массив имён всех файлов в Галерее.
                        }
                        Если на сервере не произвелось никакой операции по причине выяснившейся 
                        неавторизованности, то response_json = {unauthorized: true}
                        
                        JSON-строка uploadingErr выглядит примерно так: 
                        {"name":"MulterError","message":"File too large","code":"LIMIT_FILE_SIZE","field":"0","storageErrors":[]}

*/   

                        if(response_json.unauthorized) {
                            this.state.fsOperationStatus = FO_STATUS.noAction;

                            this.closeSOIndicator(this.fileUplIndicatorID);
                            this.clearAuthorization();
                            this.openSignInPopup(FLAG.sInPopup_sessionEndedView);                        
                        }
                        else {
                            this.state.operationsInfoObject = {
                                operationResult: RESULT.filesUploaded,
                                reportObject: response_json,
                                processedFilesArr: this.state.filesToUploadArr
                            };
                
                            this.state.operationsReportActive = true;

                            if(response_json.allFileNames) {
                                let newFNamesObject = {};
                                let fNamesArrLength = response_json.allFileNames.length;
                                for(let i=0; i<fNamesArrLength; i++) {
                                    let fName = response_json.allFileNames[i];
                                    newFNamesObject[fName] = true; //Значение тут не важно.
                                }
                                this.state.galleryInfoObject.fileNamesTempObject = newFNamesObject;
                            }
                
                            this.closeSOIndicator(this.fileUplIndicatorID);
                    
                            if(response_json.faultyUploads_mimeType.length==0 &&
                            response_json.succUploads.length>0 &&
                            !response_json.uploadingErr &&
                            !response_json.readDirErr) {
                                this.state.fsOperationStatus = FO_STATUS.uploadedSuccessfully;
                            }
                            else this.state.fsOperationStatus = FO_STATUS.uploadingFailed;

                            this.forceUpdate(); //Чтобы вывести попап <OperationsReport>, передать в Gallery
                            //fsOperationStatus и fileNamesTempObject, а затем очистить fileNamesTempObject, 
                            //прислав из Галереи команду universalTool(DO.clearFNamesTempObject).
                        }
                        
                        this.state.galleryInfoObject.operFolder = null;
                        
                        this.state.uploadProcessIsActive = false;

                    }.bind(this))
                    .catch(function(err){
                        this.state.uploadProcessIsActive = false;
                
                        this.state.operationsInfoObject = {
                            operationResult: RESULT.fetchError,//RESULT.failedFilesUploading,
                            error: String(err)
                        };     
                
                        this.state.operationsReportActive = true;
                        
                        this.state.galleryInfoObject.operFolder = null;
                
                        this.state.fsOperationStatus = FO_STATUS.uploadingFailed;
                
                        this.closeSOIndicator(this.fileUplIndicatorID);
                
                        this.forceUpdate(); //Чтобы вывести попап <OperationsReport>, передать в Gallery
                        //fsOperationStatus и fileNamesTempObject, а затем очистить fileNamesTempObject, прислав
                        //из Галереи команду universalTool(DO.clearFNamesTempObject).
                    }.bind(this));

                }
                else { //Все файлы, запрашиваемые к перезаписи, велено не перезаписывать.
                    this.closeSOIndicator(this.fileUplIndicatorID);
                    
                    this.state.uploadProcessIsActive = false;

                    this.state.fsOperationStatus = FO_STATUS.uplFExistAllSkipped;
                    
                    this.state.galleryInfoObject.operFolder = null;

                    this.closeOperationsReport();        
                }
                
            }
            else {
                this.state.fsOperationStatus = FO_STATUS.noAction; //Если операция не подразумевала вывод
                //попапа <OperationsReport/>, то присвоение this.state.fsOperationStatus = FO_STATUS.noAction
                //производится в componentDidUpdate().
                
                this.closeOperationsReport();                
            }
            
        }

        else if(command==DO.uploadFiles) { //Загрузка новых файлов в Галерею.
/*            
            Здесь infoArgument - объект вида {
                uploadFormElement: ссылка на DOM-объект формы загрузки файлов с дропзоной,
                files: массив объектов класса File,
                imgFolder: имя папки, куда загружаются файлы
            };
*/
            
            let fData = new FormData(infoArgument.uploadFormElement);
            let files = infoArgument.files;
            //Добавляем к каждому полю из формы, содержащему файл, числовое значение (читай - имя поля), чтобы
            //на сервере было проще оперировать с этими полями.
            files.forEach(function(item, i, arr){fData.append(i, item);});

            //fData.append("overwrite", false); //Это дополнительное поле сигнализирует серверу, что перезаписывать
            //уже имеющиеся файлы, если они найдутся, не нужно (если б было true, то нужно). В этом случае с сервера
            //с ответом вернётся массив с инфой об этих уже имеющихся файлах, и юзера спросят, перезаписывать ли их.
            //НЕ РАБОТАЕТ - на сервере не получается выделить значение этого поля до начала загрузки файлов.

            this.state.galleryInfoObject.operFolder = infoArgument.imgFolder;

            this.addFolderNameToCookies(COOKIE_NAMES.forFlsUploadingRequest, this.state.galleryInfoObject.operFolder, F_URL.flsUploading);
            
            //let fetch_upload_url = "https://argobox.ru" + F_URL.flsUploading;
            let fetch_upload_url = F_URL.flsUploading;
            const fetch_upload_options = {
                method: 'POST',
                body: fData,
            }; 

            this.state.filesToUploadArr = files;
            

            this.state.fsOperationStatus = FO_STATUS.waitingForResults;
            this.state.uploadProcessIsActive = true;
            this.forceUpdate(); //Чтобы передать значение this.state.fsOperationStatus в <Gallery>.
            
            this.showSOIndicator(this.fileUplIndicatorID);

            fetch(fetch_upload_url, fetch_upload_options)
            .then(function(response){ 
                if(response.ok) return response.json();
                else if(response.status==RESP_CODE.unauthorised) 
                    return Promise.resolve({unauthorized: true});
                else return Promise.reject(); //Отсюда мы попадём в catch. В здешнем catch любая ошибка характеризуется
                //как RESULT.fetchError. И хотя раз с сервера пришёл какой-то ответ, это, возможно, не ошибка fetch(),
                //тем не менее, я думаю, можно и этот случай преподносить, как RESULT.fetchError - для юзера это не
                //будет важно.
            })
            .then(function(response_json){
/*
                response_json - это пришедший с ответом сервера объект-отчёт о проведённой операции:
                {
                    succUploads: массив индексов из массива загружаемых файлов (this.state.filesToUploadArr), 
                                которые загрузились успешно,
                    uploadingErr: JSON-строка с сообщением об ошибке, возникшей при загрузке, 
                    faultyUploads_mimeType: массив индексов из массива загружаемых файлов (this.state.filesToUploadArr), 
                                            которые соответствуют файлам, не загруженным из-за неверного типа,
                    faultyUploads_fileExists: аналогично, массив индексов из this.state.filesToUploadArr, которые 
                                            соответствуют файлам, уже имеющимся в Галерее,
                    readDirErr: JSON-строка с ошибкой чтения директории Галереи,
                    allFileNames: массив имён всех файлов в Галерее.
                }
                Если на сервере не произвелось никакой операции по причине выяснившейся неавторизованности, то
                response_json = {unauthorized: true}
                
                JSON-строка uploadingErr выглядит примерно так: 
                {"name":"MulterError","message":"File too large","code":"LIMIT_FILE_SIZE","field":"0","storageErrors":[]}
                
*/              
                if(response_json.unauthorized) {
                    this.state.fsOperationStatus = FO_STATUS.noAction;

                    this.state.galleryInfoObject.operFolder = null;
                    
                    this.state.uploadProcessIsActive = false;
                    this.closeSOIndicator(this.fileUplIndicatorID);
                    this.clearAuthorization();
                    this.openSignInPopup(FLAG.sInPopup_sessionEndedView);                        
                }
                else {
                    this.state.operationsInfoObject = {
                        operationResult: RESULT.filesUploaded,
                        reportObject: response_json,
                        processedFilesArr: this.state.filesToUploadArr
                    };
                
                    this.state.operationsReportActive = true;

                    //Сразу обновляем список имён файлов Галереи - пусть юзер видит те, что загрузились, даже 
                    //если это не все (из-за ошибок или потому что некоторые уже были в Галерее, и сейчас 
                    //решается вопрос с их перезаписью). Еслю юзер отдаст команду на перезапись, это будет уже
                    //новая операция загрузки, обрабатываемая отдельно (см. command==DO.closeOpersReport).
                    if(response_json.allFileNames) {
                        let newFNamesObject = {};
                        let fNamesArrLength = response_json.allFileNames.length;
                        for(let i=0; i<fNamesArrLength; i++) {
                            let fName = response_json.allFileNames[i];
                            newFNamesObject[fName] = true; //Значение тут не важно.
                        }
                        this.state.galleryInfoObject.fileNamesTempObject = newFNamesObject;
                    }

/*
                    if(response_json.faultyUploads_fileExists.length==0) {
                        //Если не нужно спрашивать о перезаписи файлов, закрываем попап-индикатор.
                        //Иначе он должен висеть всё время, пока решается вопрос о перезаписи.    
                        this.closeSOIndicator(this.fileUplIndicatorID);
                    
                        this.state.uploadProcessIsActive = false;   
                        //Если же вопрос о перезаписи файлов не решён, состояние "идёт загрузка" должно 
                        //сохраняться.
                    }
*/

                    if(response_json.faultyUploads_fileExists.length==0) {
                        //Если не нужно спрашивать о перезаписи файлов, закрываем попап-индикатор.
                        //Иначе он должен висеть всё время, пока решается вопрос о перезаписи.    
                        this.closeSOIndicator(this.fileUplIndicatorID);
                    
                        this.state.uploadProcessIsActive = false;   
                        //Если же вопрос о перезаписи файлов не решён, состояние "идёт загрузка" должно 
                        //сохраняться.     
                        
                        this.state.galleryInfoObject.operFolder = null;
                        
                        if(response_json.faultyUploads_mimeType.length==0 &&
                        response_json.succUploads.length>0 &&
                        !response_json.uploadingErr &&
                        !response_json.readDirErr) this.state.fsOperationStatus = FO_STATUS.uploadedSuccessfully;
                        else this.state.fsOperationStatus = FO_STATUS.uploadingFailed;  
                    }
//???
                    else { //Потенциально слабое место: а если были и ошибки, и файлы для перезаписи? Почему не
                    //обрабатывается этот случай?
                    
                        this.state.fsOperationStatus = FO_STATUS.uplFilesAlreadyExist;
                    }

                    //Если fsOperationStatus = FO_STATUS.uplFilesAlreadyExist, то Галерея, несмотря на этот forceUpdate(),
                    //перерисована не будет - так задано в shouldComponentUpdate() в Gallery. Так сделано потому,
                    //что при перерисовке Галереи обнулится здешний this.state.filesToUploadArr - он являетя
                    //ссылкой на массив файлов, помещённых в дропзону. Когда Галерея перерисовывается, этот массив
                    //файлов обнуляется - вероятно, потому, что дропзона тоже перерисовывается, и массив помещённых
                    //в неё файлов то ли меняет адрес, то ли исчезает (не знаю точно всю эту механику). 

                    this.forceUpdate(); //Чтобы вывести попап <OperationsReport>, передать в Gallery
                    //fsOperationStatus и fileNamesTempObject, а затем очистить fileNamesTempObject, прислав из 
                    //Галереи команду universalTool(DO.clearFNamesTempObject).
                }

            }.bind(this))
            .catch(function(err){
                this.state.uploadProcessIsActive = false;
                
                this.state.operationsInfoObject = {
                    operationResult: RESULT.fetchError,//RESULT.failedFilesUploading,
                    error: String(err)
                };     
                
                this.state.galleryInfoObject.operFolder = null;
                
                this.state.operationsReportActive = true;
                
                //Если загрузка не удалась, Галерею всё равно нужно перерисовать.
                //Может, часть файлов загрузилась, а часть - нет; в Галерее это должно отразиться.

                this.state.fsOperationStatus = FO_STATUS.uploadingFailed;
                
                this.closeSOIndicator(this.fileUplIndicatorID);
                
                this.forceUpdate();//Чтобы вывести попап <OperationsReport>, передать в Gallery
                //fsOperationStatus и fileNamesTempObject, а затем очистить fileNamesTempObject, прислав из 
                //Галереи команду universalTool(DO.clearFNamesTempObject).
                
            }.bind(this));
        
        }
        else if(command==DO.removeFiles) { //Удаление файлов из Галереи.
/*
            Здесь infoArgument = {
                imgFolder: имяПапкиОткудаУдаляют,
                itemsToRemoveObject: {
                    "имяФайла_1": {"selected": <boolean>},
                    "имяФайла_2": {"selected": <boolean>},
                    ...
                }
            }
*/

            this.state.galleryInfoObject.disabledItemsTempObject = infoArgument.itemsToRemoveObject;

            let removingFNamesArr = Object.keys(infoArgument.itemsToRemoveObject);

            let fetch_removefiles_url = F_URL.flsRemoving;
            const fetch_removefiles_options = {
                method: 'DELETE',
                body: JSON.stringify(removingFNamesArr)
/*
                body: JSON.stringify({
                    folder: infoArgument.imgFolder,
                    fileNamesArr: removingFNamesArr
                })
*/
            }; 
            
            
            this.addFolderNameToCookies(COOKIE_NAMES.forFlsRemovingRequest, infoArgument.imgFolder, F_URL.flsRemoving);
            
            this.state.filesRemovingProcessIsActive = true;
            
            this.state.fsOperationStatus = FO_STATUS.waitingForResults;
            this.forceUpdate(); //Чтобы передать значение this.state.fsOperationStatus в <Gallery>

            this.showSOIndicator(this.fileRemIndicatorID);

            fetch(fetch_removefiles_url, fetch_removefiles_options)
            .then(function(response){
                if(response.ok) return response.json();
                else if(response.status==RESP_CODE.unauthorised) 
                    return Promise.resolve({unauthorized: true});
                else return Promise.reject(); //Отсюда мы попадём в catch. В здешнем catch любая ошибка характеризуется
                //как RESULT.fetchError. И хотя раз с сервера пришёл какой-то ответ, это, возможно, не ошибка fetch(),
                //тем не менее, я думаю, можно и этот случай преподносить, как RESULT.fetchError - для юзера это не
                //будет важно.
            })
            .then(function(response_json){
/*
                response_json - это пришедший с ответом сервера объект-отчёт о проведённой операции:
                {
                    succRemovedFNames: массив имён файлов, которые были успешно удалены,
                    failedRmvFNames: массив имён файлов, которые не удалось удалить,
                    readDirErr: JSON-строка ошибки чтения директории с файлами Галереи
                    allFileNames: массив имён всех файлов Галереи после завершения операции.
                }
                
                Если на сервере не произвелось никакой операции по причине выяснившейся неавторизованности, то
                response_json = {unauthorized: true}
*/
                if(response_json.unauthorized) {
                    this.state.fsOperationStatus = FO_STATUS.noAction;

                    this.closeSOIndicator(this.fileRemIndicatorID);
                    this.clearAuthorization();
                    this.openSignInPopup(FLAG.sInPopup_sessionEndedView);                        
                }
                else {
                    this.state.operationsInfoObject = {
                        operationResult: RESULT.filesRemoved,
                        reportObject: response_json
                    };
                
                    this.state.operationsReportActive = true;
                    //Закрытие попапа <OperationsReport> перемещает нас в
                    //universalTool() -> if(command==DO.closeOpersReport)

                    this.closeSOIndicator(this.fileRemIndicatorID);
                
                    if(response_json.allFileNames && !response_json.readDirErr) {
                        let newFNamesObject = {};
                        let fNamesArrLength = response_json.allFileNames.length;
                        for(let i=0; i<fNamesArrLength; i++) {
                            let fName = response_json.allFileNames[i];
                            newFNamesObject[fName] = true; //Значение тут не важно.
                        }
                        this.state.galleryInfoObject.fileNamesTempObject = newFNamesObject; 
                    }
//???                
                    //ТОЧНО ЛИ ТАК? А как обрабатывать, если файлы удалились, но не считалась директория?
                    if(response_json.failedRmvFNames.length==0 && !response_json.readDirErr) this.state.fsOperationStatus = FO_STATUS.removedSuccessfully;
                    else this.state.fsOperationStatus = FO_STATUS.removingFailed;
                
                    this.forceUpdate();
                }
                
                this.state.filesRemovingProcessIsActive = false;

            }.bind(this))
            .catch(function(err){
                this.state.filesRemovingProcessIsActive = false;
                
                this.state.operationsInfoObject = {
                    operationResult: RESULT.fetchError,//RESULT.failedFilesRemoving,
                    error: String(err)
                };     
                
                this.state.operationsReportActive = true;                

                this.state.fsOperationStatus = FO_STATUS.removingFailed;
                
                this.closeSOIndicator(this.fileRemIndicatorID);
                
                this.forceUpdate();
            }.bind(this));

        }

        else if(command==DO.renameFile) {//Переименование файла Галереи.
/*
            Здесь infoArgument - объект 
            {
                currentFName: <string>, 
                newFName: <string>, 
                selected: <boolean>, 
                imgFolder: <string>
            }
*/

            this.state.galleryInfoObject.disabledItemsTempObject = {};
            this.state.galleryInfoObject.disabledItemsTempObject[infoArgument.currentFName] = {"selected": infoArgument.selected}; //Значение неважно.
            
            this.state.galleryInfoObject.itemRenamingInfoTempObject = infoArgument;

            let fetch_renamefile_url = F_URL.fileRenaming;
            let fetchBodyObject = {
                currentFName: infoArgument.currentFName,
                newFName: infoArgument.newFName,
                selected: infoArgument.selected
            };
            const fetch_renamefile_options = {
                method: 'PATCH',
                body: JSON.stringify(fetchBodyObject)
            }; 
            
            this.state.galleryInfoObject.operFolder = infoArgument.imgFolder;
            
            this.addFolderNameToCookies(COOKIE_NAMES.forFileRenamingRequest, this.state.galleryInfoObject.operFolder, F_URL.fileRenaming);

            this.state.fileRenamingProcessIsActive = true;
            this.state.fsOperationStatus = FO_STATUS.waitingForResults;
            this.forceUpdate(); //Чтобы передать значение this.state.fsOperationStatus в <Gallery>.
            
            this.showSOIndicator(this.fRenameIndicatorID);
            
            fetch(fetch_renamefile_url, fetch_renamefile_options)
            .then(function(response){
                if(response.ok) return response.json();
                else if(response.status==RESP_CODE.unauthorised) 
                    return Promise.resolve({unauthorized: true});
                else return Promise.reject(); //Отсюда мы попадём в catch. В здешнем catch любая ошибка характеризуется
                //как RESULT.fetchError. И хотя раз с сервера пришёл какой-то ответ, это, возможно, не ошибка fetch(),
                //тем не менее, я думаю, можно и этот случай преподносить, как RESULT.fetchError - для юзера это не
                //будет важно.
            })
            .then(function(response_json){
/*
                response_json - это пришедший с ответом сервера объект-отчёт о проведённой операции:
                {
                    renamingErr: объект с инфой об ошибке переименования (такой файл уже существует, или какая-то ещё ошибка),
                    readDirErr: объект с инфой об ошибке чтения директории (если она считывалась),
                    allFileNames: массив имён всех файлов Галереи после завершения операции (если директория считывалась).
                }
                //Директория считывается только в случае возникновения ошибки переименования.
*/

                if(response_json.unauthorized) {
                    this.state.fsOperationStatus = FO_STATUS.noAction;

                    this.closeSOIndicator(this.fRenameIndicatorID);
                    this.clearAuthorization();
                    this.openSignInPopup(FLAG.sInPopup_sessionEndedView);                        
                }
                else {
                    let localReportObject = {
                        renamingErr: response_json.renamingErr,
                        readDirErr: response_json.readDirErr,
                        prevFName: this.state.galleryInfoObject.itemRenamingInfoTempObject.currentFName,
                        newFName: this.state.galleryInfoObject.itemRenamingInfoTempObject.newFName
                    };

                    this.state.operationsInfoObject = {
                        operationResult: RESULT.fileRenamed,
                        reportObject: localReportObject,
                    };
                    
                    this.state.operationsReportActive = true;      
                
                    if(response_json.allFileNames && !response_json.readDirErr) {
                        let newFNamesObject = {};
                        let fNamesArrLength = response_json.allFileNames.length;
                        for(let i=0; i<fNamesArrLength; i++) {
                            let fName = response_json.allFileNames[i];
                            newFNamesObject[fName] = true; //Значение тут не важно.
                        }
                        this.state.galleryInfoObject.fileNamesTempObject = newFNamesObject;                      
                    }
                
                    if(!response_json.renamingErr)
                        this.state.fsOperationStatus = FO_STATUS.renamedSuccessfully;
                    else this.state.fsOperationStatus = FO_STATUS.renamingFailed;

                    this.closeSOIndicator(this.fRenameIndicatorID);

                    this.forceUpdate();
                }
                
                this.state.galleryInfoObject.operFolder = null;
                
                this.state.fileRenamingProcessIsActive = false;
                
            }.bind(this))
            .catch(function(err){
                this.state.fileRenamingProcessIsActive = false;
                
                this.state.operationsInfoObject = {
                    operationResult: RESULT.fetchError,
                    error: String(err)
                };     
                
                this.state.operationsReportActive = true;  
                
                this.state.galleryInfoObject.operFolder = null;
                
                this.closeSOIndicator(this.fRenameIndicatorID);
                
                this.state.fsOperationStatus = FO_STATUS.renamingFailed;
                
                this.forceUpdate();
            }.bind(this));
            
        }
        else if(command==DO.downloadFiles) {
/*
            Здесь infoArgument = {
                imgFolder: имяПапкиОткудаСкачивают,
                itemsToDownloadObject: {
                    "имяФайла_1": {"selected": <boolean>},
                    "имяФайла_2": {"selected": <boolean>},
                    ...
                }
            }
*/

            this.state.galleryInfoObject.disabledItemsTempObject = infoArgument.itemsToDownloadObject;

            let fNamesToDownloadArr = Object.keys(infoArgument.itemsToDownloadObject);

            let fetch_url = F_URL.flsDownloading;
            let fetch_options = {
                method: "POST",
                body: JSON.stringify(fNamesToDownloadArr)  
            };
            
            let fName;

            this.showSOIndicator(this.downloadIndicatorID);
            this.state.downloadingProcessIsActive = true;

            this.state.fsOperationStatus = FO_STATUS.waitingForResults;
            this.forceUpdate(); //Чтобы передать значение this.state.fsOperationStatus в <Gallery>

            this.state.galleryInfoObject.operFolder = infoArgument.imgFolder;
            
            this.addFolderNameToCookies(COOKIE_NAMES.forFlsDownloadingRequest, this.state.galleryInfoObject.operFolder, F_URL.flsDownloading);


            fetch(fetch_url, fetch_options)
            .then(async function(response){
                if(response.ok) {
//================================================================= 
//Скрипт для получения ответа по частям и сборки его в единое целое (в одну последовательность байтов).
//Источник скрипта: https://learn.javascript.ru/fetch-progress
                    const reader = response.body.getReader();
                
                    let receivedLength = 0; // количество байт, полученных на данный момент
                    let chunks = []; // массив полученных двоичных фрагментов (составляющих тело ответа)
                
                    // бесконечный цикл, пока идёт загрузка
                    while(true) {
                        // done становится true в последнем фрагменте
                        // value - Uint8Array из байтов каждого фрагмента
                        const {done, value} = await reader.read();

                        if (done) {
                            break;
                        }
                    
                        chunks.push(value);
                        receivedLength += value.length;
                    }
                
                    //Uint8Array – представляет каждый байт в ArrayBuffer как отдельное число; возможные 
                    //значения находятся в промежутке от 0 до 255 (в байте 8 бит, отсюда такой набор). Такое
                    //значение называется «8-битное целое без знака».
                    let chunksAll = new Uint8Array(receivedLength); 
                    let position = 0;
                    for(let chunk of chunks) {
                        chunksAll.set(chunk, position); 
                        position += chunk.length;
                    }
                    
//=================================================================    

                    let resultObj = {
                        blob: null,
                        problemFilesArr: null
                    };

                    if(fNamesToDownloadArr.length==1) {
                        let blobObj = new Blob([chunksAll]);
                        fName = fNamesToDownloadArr[0];
                        resultObj.blob = blobObj;
                        return Promise.resolve(resultObj);
                    }

                    let reportPartLengthStrBuffer = Buffer.from(chunksAll.buffer, 0, LIMITS.downlReportLengthStr_Length);
                    let reportPartLengthStr = reportPartLengthStrBuffer.toString("utf8");
                    let reportPartLength = Number(reportPartLengthStr.trim());

                    let reportPartBuffer = Buffer.from(chunksAll.buffer, LIMITS.downlReportLengthStr_Length, reportPartLength);
                    let reportPart = reportPartBuffer.toString("utf8");

                    let reportObj = JSON.parse(reportPart);
                    
                    fName = reportObj.fileName;
                    
                    if(reportObj.problemFiles.length>0) {
                        let fFsLength = reportObj.problemFiles.length;
                        for(let i=0; i<fFsLength; i++) {
                            reportObj.problemFiles[i] = decodeURIComponent(reportObj.problemFiles[i]);
                        }
                        resultObj.problemFilesArr = reportObj.problemFiles;
                    }

                    let downloadedFileArrayBuffer = (Buffer.from(chunksAll.buffer, (LIMITS.downlReportLengthStr_Length + reportPartLength))).buffer;
                    let blobObj = new Blob([downloadedFileArrayBuffer]);
                    resultObj.blob = blobObj;
                    return Promise.resolve(resultObj);
                }
                else if(response.status==RESP_CODE.unauthorised) 
                    return Promise.resolve({unauthorized: true});
                else {
                    return Promise.reject(); 
                }
            })
            .then(function(result){
                
                if(result.unauthorized) {
                    this.state.fsOperationStatus = FO_STATUS.noAction;

                    this.clearAuthorization();
                    this.openSignInPopup(FLAG.sInPopup_sessionEndedView);                        
                }
                else if(result.blob) {
                    this.state.fsOperationStatus = FO_STATUS.downloadedSuccessfully;

                    if(!result.problemFilesArr) {
                        //Источник: https://learn.javascript.ru/blob
//???
                        //Может, стоит не создавать ссылку каждый раз, а хранить её где-то?
                        let link = document.createElement('a');
                        link.download = fName;
                        link.href = URL.createObjectURL(result.blob);
                        link.click();
                        URL.revokeObjectURL(link.href); 
                    }
                    else {
                        this.state.operationsInfoObject = {
                            operationResult: RESULT.failedFilesDownloading,
                            error: {problemFilesArr: result.problemFilesArr}
                        };     
                        this.state.operationsReportActive = true;                                    
                    }
                }
                
                this.closeSOIndicator(this.downloadIndicatorID);
                this.state.downloadingProcessIsActive = false;
                
                this.state.galleryInfoObject.operFolder = null;
                
                this.forceUpdate();
                
            }.bind(this))
            .catch(function(err){
                this.closeSOIndicator(this.downloadIndicatorID);
                this.state.downloadingProcessIsActive = false;
                
                this.state.operationsInfoObject = {
                    operationResult: RESULT.failedFilesDownloading,
                    error: {error: "Ошибка при получении файла(ов)"}
                };     
                this.state.operationsReportActive = true;  
                
                this.state.galleryInfoObject.operFolder = null;
                
                this.state.fsOperationStatus = FO_STATUS.downloadingFailed;
                this.forceUpdate();
            }.bind(this));
        }

//========================================================
//Для очистки временных объектов в state.galleryInfoObject:
        else if(command==DO.clearDisabledItemsTempObject) {
            this.state.galleryInfoObject.disabledItemsTempObject = null;
        }
        
        else if(command==DO.clearFNamesTempObject) {
            this.state.galleryInfoObject.fileNamesTempObject = null;
        }
        
        else if(command==DO.clearFRenamingTempObject) {
            this.state.galleryInfoObject.itemRenamingInfoTempObject = null;
        }
//========================================================
    }

    clearTempObjects() {
        this.state.galleryInfoObject.fileNamesTempObject = null;
        this.state.galleryInfoObject.disabledItemsTempObject = null;
        this.state.galleryInfoObject.itemRenamingInfoTempObject = null;
    }
    
    componentDidUpdate() {
        //После успешного завершения скачивания выставляем this.state.fsOperationStatus в FO_STATUS.noAction 
        //здесь, потому что в этом случае не выводится попап <OperationsReport/>, а обычно это присвоение
        //делается при его закрытии, в ф-и universalTool(DO.closeOpersReport).
        if(this.state.fsOperationStatus==FO_STATUS.downloadedSuccessfully) 
            this.state.fsOperationStatus = FO_STATUS.noAction;
    }

    componentDidMount() {
        let url = new Url(window.location);

        //Активируем слежение за размерами окна.
        this.adaptMQueriesKeys.forEach(function(media) {
            if(typeof this.adaptiveMediaQueries[media] === 'string') {
                this.adaptMQueryLists[media].addListener(this.adaptMQueryHandler.bind(this));
            }
        }, this);


        let token = this.cookies.get(JWTOKEN.jwTokenName);

        //Проверяем, авторизованы ли мы.
//???
        //Было бы недурно сделать отдельную ф-ю, проверяющую авторизацию и возвращающую промис.
        if(token) {
            let fetch_checktoken_url = F_URL.checkAuth;
            const fetch_checktoken_options = {
                method: 'POST',
                body: token 
            };        
        
            fetch(fetch_checktoken_url, fetch_checktoken_options)
            .then(function(response) {
                if(response.ok) return response.json();
                else if(response.status==RESP_CODE.unauthorised) //Такой ответ возвращается, когда токен просрочен/недействителен.
                    return Promise.resolve({unauthorized: true});
                else return Promise.reject();
            })
            .then(function(response_json) {
                if(response_json.unauthorized) {
                    if(url.pathname=="/gallery") {
                        this.state.signInPopupIsOpen = true;
                        this.sInPopup = <div ref={this.signInPopupWrapperRef}><SignInPopup uniTool={this.uniTool} ref={this.signInPopupRef}/></div>;
                    }
                    //Внутри clearAuthorization() производится перерисовка, и обновлённый this.sInPopup 
                    //отрисуется.
                    this.clearAuthorization();                    
                }
                else {
                    //В response_json содержится декодированный payload токена.
                    this.state.userInfoObject.userID = response_json["userID"];        
                    this.state.userInfoObject.login = response_json["Login"];
                    this.state.userInfoObject.email = response_json["Email"];
                    this.state.userInfoObject.name = response_json["Name"];
                    this.state.userInfoObject.userRegDate = response_json["Date"];                    
                }

                this.state.initialAuthChecked = true;
                this.forceUpdate();
                
            }.bind(this))
            .catch(function(){
//???
                //Полагаю, в случае возникновения такой ошибки следует считать, что мы не авторизованы. 
                this.state.initialAuthChecked = true;
                if(url.pathname=="/gallery") {
                    this.state.signInPopupIsOpen = true;
                    this.sInPopup = <div ref={this.signInPopupWrapperRef}><SignInPopup uniTool={this.uniTool} ref={this.signInPopupRef}/></div>;
                }
                //Внутри clearAuthorization() производится перерисовка, и обновлённый this.sInPopup отрисуется.
                this.clearAuthorization();
            }.bind(this));
        }
        else {//Токен почему-то не удалось получить из куки. Т.е., мы не авторизованы.
            this.state.initialAuthChecked = true;
            if(url.pathname=="/gallery") {
                this.state.signInPopupIsOpen = true;
                this.sInPopup = <div ref={this.signInPopupWrapperRef}><SignInPopup uniTool={this.uniTool} ref={this.signInPopupRef}/></div>;
            }
            //Внутри clearAuthorization() производится перерисовка, и обновлённый this.sInPopup отрисуется.
            this.clearAuthorization();
        }
    
    }

//============================================
//SIGNINPOPUP
//Попап для авторизации.

openSignInPopup(flag) {
        if(!this.signInPopupRef.current) {
            ReactDOM.render(<div ref={this.signInPopupWrapperRef}><SignInPopup uniTool={this.uniTool} ref={this.signInPopupRef}/></div>, this.signInPopupContainerRef.current, function() {
                this.signInPopupRef.current.modify(flag);
                this.state.signInPopupIsOpen = true;
            }.bind(this));
        }
        else {
            this.signInPopupContainerRef.current.appendChild(this.signInPopupWrapperRef.current);
            this.signInPopupRef.current.modify(flag);
            this.state.signInPopupIsOpen = true;
        }
        //О методе попапа modify(flag): поскольку мы используем один экземпляр попапа и для ситуации
        //initial, и для ситуации SessionEnded, а выглядеть он должен по-разному (для initial у него заголовок 
        //"Пожалуйста, войдите в аккаунт", для SessionEnded - ""), он должен иметь собственный внутренний метод
        //изменения вида. Мы не можем модифицировать попап иначе, чем вызывая этот метод, т.е., modify(flag) -
        //например, передавая flag через пропсы - т.к. при его открытии мы не перерисовываем весь Главный Компонент.
    }
    
    closeSignInPopup() {
        this.signInPopupContainerRef.current.removeChild(this.signInPopupWrapperRef.current);
        this.state.signInPopupIsOpen = false;
    }
    
    //Когда мы из попапа отправляем серверу авторизационные данные, поля ввода и сабмит формы в попапе 
    //дисаблируются. Энаблировать их, так же, как и менять внешний вид попапа, мы можем только вызывая отсюда,
    //из Главного Компонента, какой-то внутренний метод попапа - по причинам, описанным в комменте внутри кода
    //openSignInPopup(flag){}. Этот метод - всё тот же modify(), а enableSignInPopup() - ф-я для его вызова.
    enableSignInPopup() {
        if(this.signInPopupRef.current) this.signInPopupRef.current.modify(FLAG.sInPopup_setEnabled);
    }

//============================================
//============================================
//FORGOTTENPASSWORDPOPUP
//Попап для автогенерации нового пароля взамен забытого.

    showForgottenPswPopup()
    {
        if(!this.forgottenPswPopupRef.current) {
            ReactDOM.render(<div ref={this.forgPswPopupWrapperRef}><ForgottenPasswordPopup uniTool={this.uniTool} ref={this.forgottenPswPopupRef}/></div>, this.forgPswPopupContainerRef.current, function(){
                this.state.forgPswPopupIsOpen = true;
            }.bind(this));
        }
        else {
            this.forgPswPopupContainerRef.current.appendChild(this.forgPswPopupWrapperRef.current);
            this.state.forgPswPopupIsOpen = true;
        }
    }

    closeForgottenPswPopup() {
        this.forgPswPopupContainerRef.current.removeChild(this.forgPswPopupWrapperRef.current);
        this.state.forgPswPopupIsOpen = false;
    }
//============================================
//============================================
//ABOUTPROJECTPOPUP
//Попап "О проекте"

    showAboutPopup()
    {
        if(!this.aboutPopupRef.current) {
            ReactDOM.render(<div ref={this.aboutPopupWrapperRef}><AboutProjectPopup uniTool={this.uniTool} ref={this.aboutPopupRef}/></div>, this.aboutPopupContainerRef.current, function(){
                this.aboutPopupRef.current.setFocus();
                this.state.aboutPopupIsOpen = true;                
            }.bind(this));
        }
        else {
            this.aboutPopupContainerRef.current.appendChild(this.aboutPopupWrapperRef.current);
            this.aboutPopupRef.current.setFocus();
            this.state.aboutPopupIsOpen = true;
        }
    }

    closeAboutPopup() {
        this.aboutPopupContainerRef.current.removeChild(this.aboutPopupWrapperRef.current);
        this.state.aboutPopupIsOpen = false;
    }

//============================================
//============================================
//USERPROFILEPOPUP
//Попап с данными юзера (в нём можно также сменить пароль)

    showUProfilePopup() {
        if(!this.uProfilePopupRef.current) {
            ReactDOM.render(<div ref={this.uProfilePopupWrapperRef}><UserProfilePopup ref={this.uProfilePopupRef} infoObject={this.state.userInfoObject} uniTool={this.uniTool}/></div>, this.uProfilePopupContainerRef.current, function(){
                this.uProfilePopupRef.current.modify(this.state.userInfoObject);
                this.state.uProfilePopupIsOpen = true;                
            }.bind(this));
        }
        else {
            this.uProfilePopupContainerRef.current.appendChild(this.uProfilePopupWrapperRef.current);
            this.uProfilePopupRef.current.modify(this.state.userInfoObject);
            this.state.uProfilePopupIsOpen = true;
        }
        //Собственный метод попапа modify() введён по тем же соображениям, по которым введён modify() в попапе
        //для авторизации (см. SIGNINPOPUP).
    }
    
    closeUProfilePopup() {
        this.uProfilePopupContainerRef.current.removeChild(this.uProfilePopupWrapperRef.current);
        this.state.uProfilePopupIsOpen = false;
    }
//============================================

/*
    renderPageForExps(props) {
        return <PageForExps uniTool={this.uniTool} {...props}/>
    }
*/
    renderEntrancePage(props) {
        return <EntrancePage infoObject={this.state.entrancePageInfoObject} uniTool={this.uniTool} {...props}/>;
    }

    renderGallery(props) { 
        this.state.galleryInfoObject.fsOperationStatus = this.state.fsOperationStatus;
        return <Gallery infoObject={this.state.galleryInfoObject} uniTool={this.uniTool} {...props}/>;
    }
    
    renderRegistrationPage(props) {
        return <RegistrationPage infoObject={this.state.registrationPageInfoObject} uniTool={this.uniTool} regProcessIsActive={this.state.registrationProcessIsActive} {...props}/>;
    }

    render() {
        if(!this.state.initialAuthChecked) {
            return <span>Проверка авторизации&hellip;</span>;
        }

        //Как распределяется приоритетность попапов в отображении - какой может накладываться на какой?
        //Попап с отчётом о регистрации д.б. выше всех - поскольку, пока идёт регистрация, юзер может авторизоваться
        //и что-то делать, выводя, в том числе, другие попапы.
        //Очерёдность остальных не важна, т.к. они всё равно не могут показаться одновременно.

        let mainWrapperStyle = {
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            
            zIndex: 1
        };

        //Необходимость атрибутов key вызвана тем, что Реакт трактует вот такой набор элементов как "список" (list),
        //а элементы списка должны иметь уникальный атрибут key. Если их нет, в консоли будет выдано предупреждение
        //о желательности их наличия.
        return (
        <React.Fragment>
            <div ref={this.popupsContainerPrimaryRef} style={{zIndex: 4, position: "relative"}} className="main-popups-container-primary">
                <div key={1} style={{zIndex: 1}} ref={this.aboutPopupContainerRef}></div>
                <div key={2} style={{zIndex: 2}} ref={this.noLogOutPopupContainerRef}></div>
                <div key={3} style={{zIndex: 3}} ref={this.signInPopupContainerRef}>{this.sInPopup}</div>
                <div key={4} style={{zIndex: 4}} ref={this.sInReportContainerRef}></div>
                <div key={5} style={{zIndex: 5}} ref={this.forgPswPopupContainerRef}></div>
                <div key={6} style={{zIndex: 6}} ref={this.newPswReportContainerRef}></div>
                <div key={7} style={{zIndex: 7}} ref={this.regReportContainerRef}></div>
            </div>
            <div ref={this.popupsContainerRef} style={{zIndex: 3, position: "relative"}} className="main-popups-container">
                <div style={{zIndex: 1}} ref={this.uProfilePopupContainerRef}></div>
            </div>
            <OperationsReport zindex={2} active={this.state.operationsReportActive} infoObject={this.state.operationsInfoObject} uniTool={this.uniTool}/>
            
            <div style={mainWrapperStyle} className={this.mainWrapperClassName}>
                <CookiesProvider>
                    <Router history={ history }>
                        <Switch>
                            <Route exact path="/" render={this.renderEntrancePage.bind(this)}/>
                            <Route exact path="/registration" render={this.renderRegistrationPage.bind(this)}/>
                            <Route exact path="/gallery" render={this.renderGallery.bind(this)}/>
                        </Switch>
                    </Router>
                    <br/>
                </CookiesProvider>
            </div>
        </React.Fragment>); 
        //                            <Route exact path="/exps" render={this.renderPageForExps.bind(this)}/>

    }

}    