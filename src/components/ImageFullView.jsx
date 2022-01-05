import React from "react";
import ReactDOM from "react-dom";
import $ from 'jquery';

import MyDraggable from "./MyDraggable.jsx";
import ILPopups from "./ItemsListsPopups.jsx";
import ItemsManagerButtonsBlock from "./ItemsManagerButtonsBlock.jsx";

import {namesAndPaths as NAMES_PATHS,
    internalAPI_filesOperationStatusCodes as FO_STATUS,
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
 * Итемы хранятся в объекте this.state.itemsObject, в виде свойств  "имяФайла": {"selected": boolean, "disabled": boolean}.
 *  - "вьюшка" (view) - ДОМ-элемент (точнее, div с классом "ifv-view"), содержащий картинку и набор элементов для действий с её файлом (удаление, 
 * переименование, получение ссылки на него и т.д.), а также для отображения инфы о ней (название её файла, его порядковый номер в упорядоченном 
 * списке имён картинок из текущей папки и т.д.). Т.к. вьюшке соответствует итем, эти два термина иногда подменяют друг друга (так, мы можем писать
 * "номер вьюшки", хотя у самих вьюшек нет номеров - это номер "её" итема; так же, мы пишем "скроллинг к итему такому-то", хотя прокручиваются,
 * конечно, не итемы, а вьюлист с вьюшками).
 * Вьюшки могут быть активными и неактивными. Это определяется значением атрибута "active" вьюшки. Активными являются вьюшки, находящиеся во 
 * вьюлисте. Неактивные - это резерв, в который помещаются вьюшки, удалённые из вьюлиста за ненадобностью, и из которого они берутся по 
 * необходимости.
 * Вьюшка может менять "свои" итемы, модифицируясь под каждый новый. Кол-во вьюшек ограничено, итемов же столько, сколько файлов в текущей папке.
 * Итем м.б. выделен и/или дисаблирован - про "его" вьюшку мы тоже говорим, что она выделена/дисаблирована. Это означает, что для неё установлены
 * специальные стили и поставлена/снята галочка в чекбоксе выделения.
 *   - "вьюпорт" (viewport) - ДОМ-элемент, представляющий собой "окно", в котором видна часть вьюлиста, содержащая текущий итем. Остальные части
 * вьюлиста невидимы.
 *  - "вьюлист" (viewslist, vlist) - ДОМ-элемент, представляющий собой ленту с вьюшками. По мере необходимости, вьюшки добавляются в него, как 
 * дочерние элементы, или удаляются. Скроллинг итемов производится изменением горизонтальной координаты вьюлиста.
 * 
 * Принятые сокращения:
 * ...El - от Element (например, getLinkIconDOMEl - от getLinkIconDOMElement).
 * ...Cont - от Container. 
 */

export default class ImageFullView extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            /**
             * ID юзера.
             * В ImageFullView userID не может принимать значения SPECIAL_UID.unauthorised и другие спец. значения - только реальные ID юзеров.
             * @type: {number}
             */
            userID: null, 
            
            /**
             * Номер текущего итема - т.е., того, чья вьюшка сейчас находится во вьюпорте.
             * @type: {number}
             */
            currentItemNumber: Number(this.props.infoObject.currentItemInfo.itemNumber),
            //currentViewDOMElement: null, //(Похоже, не нужен) ссылка на ДОМ-объект текущей вьюшки. Он будет нужен при изменениях в itemsArr (добавлении/удалении/переименовании файлов).
            
            /**
             * Номер итема крайней левой вьюшки во вьюлисте.
             * FIRST большими буквами - чтобы в коде бросались в глаза.
             * @type: {number}
             */
            numberOfFIRSTItemInVList: null, 

            /**
             * Номер итема крайней правой вьюшки во вьюлисте.
             * LAST большими буквами - чтобы в коде бросались в глаза.
             * @type: {number}
             */
            numberOfLASTItemInVList: null,

            /**
             * Имя текущей папки Галереи.
             * @type: {string}
             */
            folder: this.props.infoObject.folder,

            /**
             * Объект с инфой обо всех итемах текущей папки. Каждое св-во соответствует одному итему и имеет вид
             * "имяФайла": {"selected": boolean, "disabled": boolean}
             * @type: {Object.<string, boolean>}
             */
            itemsObject: this.props.infoObject.allItemsObject,

            /**
             * Объект с инфой обо всех выделенных итемах текущей папки. Каждое св-во соответствует одному итему и 
             * имеет вид "имяФайла": true (значение неважно, если св-во есть в объекте, значит, итем выделен.
             * Когда итем выделяют, одноимённое его файлу св-во добавляется в объект, когда выделение снимают,
             * оно удаляется из объекта.
             *  @type: {Object.<string, boolean>}
             */
            selectedItemsObject: this.props.infoObject.selectedItemsObject,

            /**
             * Массив имён всех файлов-картинок из текущей папки Галереи.
             * @type: {Array.<string>}
             */
            fNamesArr: null, //Object.keys(this.props.infoObject.allItemsObject).sort(),

           
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
            fsOperationStatus: Number(this.props.infoObject.fsOperationStatus),
            
            /**
             * Номер итема, к которому нужно совершить скроллинг. По умолчанию ставим 1.
             * @type: {number}
             */
            itemNumberToScroll: 1, 
            
            /**
             * Сюда заносится X-координата точки, где юзер коснулся тачскрина в начале свайпа (это событие обрабатывается методом onSwipeStart()). 
             * Координата берётся относительно окна браузера (clientX).
             * @type: {number}
             */
            swipePosXInit: 0,

            /**
             * Сюда заносится текущая X-координата точки в процессе свайпа. 
             * Координата берётся относительно окна браузера (clientX).
             * @type: {number}
             */           
            currentSwipePosX: 0,

            //Скорость свайпа.
            //swipeSpeed: 0, //Пока мы это комментим, впоследствии, может, будем использовать, когда сделаем скроллинг свайпом более, чем на одну
            //позицию, и для определения числа позиций понадобится скорость свайпа.
            //currentSwipeMoment: 0, //Это было нужно только для определения скорости свайпа.
            
            /**
             * Идентификатор направления, в котором при помощи свайпа (т.е., пальцами на тачскрине) перемещали вьюлист.
             * НЕ ПУТАТЬ с направлением скроллинга - оно как раз обратно направлению свайпа! Так, если мы хотим увидеть во вьюпорте следующую 
             * по порядку вьюшку (т.е., ту, что СПРАВА от текущей), вьюлист нужно сдвинуть ВЛЕВО.
             * Принимает значения констант this.NODIRECTION, this.LEFT, this.RIGHT. 
             */
            swipeDirection: this.NODIRECTION,
            
            /**
             * Ссылка на ф-ю, которая должна выполниться по завершении скроллинга.
             * @type: {Function}
             */
            postScrollingCallback: null,
            
            /**
             * Интервал в пикселях, на который происходит смещение вьюлиста при скроллинге на одну позицию.
             *  @type: {number}
             */
            scrollInterval: Number(this.props.infoObject.adaptParams['imgFullViewScrollInterval']),

            /**
             * Этот параметр используется для отложенного вызова метода, адапирующего дизайн страницы под новое разрешение окна сайта. 
             * Вызов нужно отложить, если в момент изменения разрешения происходит скроллинг итемов. Адаптация произойдёт по окончании скроллинга.
             * @type: {boolean}
             */
            shouldAdaptPageToNewWindowSize: false,

            styles: {
                imgFullViewViewportWidth: Number(this.props.infoObject.adaptParams['imgFullViewViewportWidth']),
                imgFullViewViewportHeight: Number(this.props.infoObject.adaptParams['imgFullViewViewportHeight']),
                
                imgFullViewViewsListHeight: Number(this.props.infoObject.adaptParams['imgFullViewViewsListHeight']),
                
                imgFullViewViewContainerWidth: Number(this.props.infoObject.adaptParams['imgFullViewViewContainerWidth']),
                imgFullViewViewContainerHeight: Number(this.props.infoObject.adaptParams['imgFullViewViewContainerHeight']), 
                
                imgFullViewViewMinWidth: Number(this.props.infoObject.adaptParams['imgFullViewViewMinWidth']),
                imgFullViewViewMaxWidth: Number(this.props.infoObject.adaptParams['imgFullViewViewMaxWidth']),
                imgFullViewViewMinHeight: Number(this.props.infoObject.adaptParams['imgFullViewViewMinHeight']),
                imgFullViewViewMaxHeight: Number(this.props.infoObject.adaptParams['imgFullViewViewMaxHeight']),
            },

            selectedItemsCount: 0,

            scrollingDisabled: false,
        };

        /**
         * Вспомогательный объект, задающий правила, по которым метод встроенного класса Intl (от International) Intl.compare()
         * будет сравнивать строки (это используется в методе Array.prototype.sort()). Эти правила позволят сортировать
         * массив с названиями файлов в привычном человеку виде, строго по алфавиту.
         */
        this.stringComparsionRulesCollator = new Intl.Collator(["en-GB", "ru"], {numeric: true});
        //console.log(this.stringComparsionRulesCollator);
        this.state.fNamesArr = Object.keys(this.props.infoObject.allItemsObject).sort(this.stringComparsionRulesCollator.compare); 

        //Устанавливаем this.state.userID
        if(this.props.infoObject.userID!=SPECIAL_UID.unauthorised && this.props.infoObject.userID!=SPECIAL_UID.signingIn)
            this.state.userID = this.props.infoObject.userID;

        //Вычисляем кол-во выделенных итемов.
        for(let i=0; i<this.state.fNamesArr.length; i++) {
            let fName = this.state.fNamesArr[i];
            if(this.state.itemsObject[fName].selected) this.state.selectedItemsCount++;
        }

        /**
         * Объект Map, сопоставляющий ДОМ-объект каждой вьюшки с объектом, содержащим инфу об этой вьюшке. 
         * Предназначен для быстрого доступа к рефам внутренних элементов вьюшек и к объектам управления созданием/показом/сокрытием надписи 
         * "Ссылка скопирована" (эти объекты создаёт ф-я createCopyingImgUrlReportManager(), мы их называем "объекты copyingUrlReportManager").
         * @type: {Map.<HTMLDivElement, object>}
         */
        this.viewsInfoMap = new Map();
        /*
        Внутренняя структура this.viewsInfoMap:
        {
            ...,
            DOM-объектВьюшки: {
                copyingUrlReportManager: <объект copyingUrlReportManager>,
                viewInnerElsRefs: {
                    imageContainerRef: <ref>,
	                imageWrapperRef: <ref>,
            	    imageRef: <ref>,
                    upperBlockRef: <ref>,
                    itemNumberTextRef: <ref>,
                    getLinkIconRef: <ref>,
                    copyingUrlReportContainerRef: <ref>,
                    inputForExecCommandContainerRef: <ref>,
                    renamingIconRef: <ref>,
                    removingIconRef: <ref>,
                    lowerBlockRef: <ref>,
                    fileNameTextRef: <ref>,
                    checkBoxRef: <ref>,
                }
            },
            ...,
        }
        */

        /**
         * Массив ДОМ-объектов вьюшек. Используется для поиска неактивных вьюшек и для переборки вьюшек при адаптации их размеров к разрешению
         * окна (или при любой другой надобности перебрать все вьюшки). Для этих целей удобнее иметь отдельный массив, чем каждый раз получать
         * массив ключей у this.viewsInfoMap через this.viewsInfoMap.keys().
         * @type: {Array.<HTMLDivElement>}
         */
         this.viewsArr = [];

        /**
         * Массив с объектами, содержащими инфу о вьюшках, отрисованных при первоначальном рендеринге ImageFullView.
         * При первой отрисовке компонента ImageFullView отрисовываются и некоторое число вьюшек. Далее, в методе componentDidMount(), они
         * модифицируются (ставятся, если нужно, галочки чекбоксов, изменяются стили, если итем выделен или дисаблирован, создаётся по объекту
         * copyingUrlReportManager для каждой вьюшки, скрываются надписи "Ссылка скопирована" (они видны при первоначальной отрисовке)). Для всех
         * этих модификационных действий и нужен массив initiallyRenderedViewsInfoArr. Каждый его элемент соответствует определённой вьюшке,
         * причём порядок, в котором идут элементы, соответствуют порядку, в котором отрисованы вьюшки. Таким образом, если мы получим коллекцию
         * ДОМ-объектов вьюшек с помощью querySelectorAll, то первому элементу этой коллекции (не говорю "массиву", т.к. это не настоящий Array, а
         * псевдомассив) будет соответствовать первый элемент из initiallyRenderedViewsInfoArr, и т.д. Это позволяет, перебирая коллекцию, получать
         * для каждой вьюшки инфу из initiallyRenderedViewsInfoArr и использовать её для модифицирования вьюшки.
         * Элементы initiallyRenderedViewsInfoArr - это те же элементы this.viewsInfoMap, только содержащиеся в массиве, а не в объекте Map. Массив
         * initiallyRenderedViewsInfoArr заполняется в ф-и render(), при первоначальной отрисовке ImageFullView, а в componentDidMount() его элементы
         * заносятся в this.viewsInfoMap.
//???
         * ОПИСАТЬ, почему мы решили использовать именно ДОМ-объекты вьюшек, а не их рефы.
         * @type: {Array.<object>}
         */
        this.initiallyRenderedViewsInfoArr = [];
        /*
        Структура элемента массива initiallyRenderedViewsInfoArr:
        {
            copyingUrlReportManager: <объект copyingUrlReportManager>,
            viewInnerElsRefs: {
                imageContainerRef: <ref>,
	            imageWrapperRef: <ref>,
                imageRef: <ref>,
                upperBlockRef: <ref>,
                itemNumberTextRef: <ref>,
                getLinkIconRef: <ref>,
                copyingUrlReportContainerRef: <ref>,
                inputForExecCommandContainerRef: <ref>,
                renamingIconRef: <ref>,
                removingIconRef: <ref>,
                lowerBlockRef: <ref>,
                fileNameTextRef: <ref>,
                checkBoxRef: <ref>,
            }       
        }
        */
        
        /**
         * Ссылка на JQuery-элемент вьюпорта. Инициализируется в componentDidMount().
         * Используется для получения смещений вьюлиста относительно вьюпорта.
         */
        this.viewportJQueryElement = null;

        /**
         * Ссылка на JQuery-элемент вьюлиста. Инициализируется в componentDidMount().
         * Используется для получения смещений вьюлиста относительно вьюпорта и для анимации скроллинга.
         */
        this.viewsListJQueryElement = null;

        /**
         * Ссылка на специальный объект класса ILPopups, используемый для управления попапами со списками итемов.
         * Инициализируется в componentDidMount().
         */
        this.itemsListPopupsManager = null;

        /**
         * Ссылка на элемент <input/>, нужный для копирования Url картинки с помощью document.execCommand().
         * Инициализируется в getItemImageLink().
         */
         this.inputForExecCommandDOMEl = null;

        //=====================================================================
        //Стили
        this.itemImageWrapperStyle = {
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: '#7d95af',
            
            toString: function() {
                let borderStyleStr = "border-style: " + this.borderStyle + "; ";
                let borderWidthStr = "border-width: " + this.borderWidth + "; ";
                let borderColorStr = "border-color: " + this.borderColor + "; ";
                
                return borderStyleStr + borderWidthStr + borderColorStr;
            }            
        };
        
        this.selectedItemImgWrapperStyle = {
            borderStyle: 'solid',
            borderWidth: '2px',
            borderColor: 'red',
            
            toString: function() {
                let borderStyleStr = "border-style: " + this.borderStyle + "; ";
                let borderWidthStr = "border-width: " + this.borderWidth + "; ";
                let borderColorStr = "border-color: " + this.borderColor + "; ";
                
                return borderStyleStr + borderWidthStr + borderColorStr;
            }            
        };
        
        this.disabledItemImgWrapperStyle = {
            borderStyle: 'solid',
            borderWidth: '2px',
            borderColor: 'rgb(211, 211, 211)',
            
            toString: function() {
                let borderStyleStr = "border-style: " + this.borderStyle + "; ";
                let borderWidthStr = "border-width: " + this.borderWidth + "; ";
                let borderColorStr = "border-color: " + this.borderColor + "; ";
                
                return borderStyleStr + borderWidthStr + borderColorStr;
            }            
        };
        
        this.itemManagerBlockStyle = {
            backgroundColor: "midnightblue",
            height: this.VIEW_MANAGER_BLOCK_HEIGHT + "px",
            
            toString: function() {
                return "background-color: " + this.backgroundColor + "; height: " + this.height;
            }
        }
        
        this.selectedItemManagerBlockStyle = {
            backgroundColor: "#8B0000",
            
            toString: function() {
                return "background-color: " + this.backgroundColor + "; ";
            }
        }
        
        this.disabledItemManagerBlockStyle = {
            backgroundColor: "rgb(47, 79, 79)",
            
            toString: function() {
                return "background-color: " + this.backgroundColor + "; ";
            }
        }
        
        this.copyingUrlReportStyles = {
            reportBodyStyle: {
                height: "25px",
                backgroundColor: "blue", //"green",
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
        //=====================================================================
        //=====================================================================
        //Рефы.
        this.iMBBRef = React.createRef();
        this.viewportRef = React.createRef();
        this.viewsListRef = React.createRef();
        
        this.popupsContRef = React.createRef();
        
        this.scrollToPopupRef = React.createRef();
        this.scrollToPopupTextInput = React.createRef();
        this.scrollToPopupContainerRef = React.createRef();
        
        //Для попапов - списков итемов (полный список и список выделенных):
        this.FILPopupContainerRef = React.createRef(); //От Full items list.
        this.SILPopupContainerRef = React.createRef(); //От Selected items list.

        //=====================================================================


        this.selectItemFunc = this.selectItem.bind(this); 
        this.touchClickableEl = this.touchClickableElement.bind(this);
        this.openScrToPopup = this.openScrollToPopup.bind(this);
        this.closeScrToPopup = this.closeScrollToPopup.bind(this);

        this.getImgLink = this.getItemImageLink.bind(this);

    }

    /**
     * Константы, являющиеся идентификаторами левой и правой стороны. Используются, например, в методе renderEdgeView().
     * @type: {number}
     */
    get LEFT() {
        return -1;
    }
    get RIGHT() {
        return 1;
    }

    /**
     * Константа, служащая идентификатором отсутствия какого-либо направления или стороны. Используется вместе с state.swipeDirection,
     * как его "нейтральное" значение (другими значениями являются this.LEFT и this.RIGHT).
     * @type: {number}
     */
    get NODIRECTION() {
        return 0;
    }
 
    /**
     * Специальная константа, используемая для блокировки вызова обработчика клика по какому-либо элементу. Принцип действия:
     * нужно присвоить какому-то атрибуту данного элемента значение, равное этой константе, а в коде обработчика проверять,
     * не равен ли этот атрибут this.CLICKHANDLER_BLOCKER, и если равен, то не выполнять никаких действий.
     */
    get CLICKHANDLER_BLOCKER() {
        return -1;
    }

    /**
     * Константы, задающие время в миллисекундах, за которое происходит анимация скроллинга. Соответствуют разным количествам позиций,
     * на которые происходит перемотка списка итемов.
     */
    get SHORT_ANIMATION_TIME() {
        return 500;
    }
    get MIDDLE_ANIMATION_TIME() {
        return 1000;
    }
    get LONG_ANIMATION_TIME() {
        return 2000;
    }

    /**
     * Внешние боковые отступы (в пикселях) элемента вьюшки - контейнера картинки (т.е., дива с классом ".ifv-view__img-container").
     * @type: {number}
     */
    get VIEW_IMGCONTAINER_MARGIN() {
        return 10;
    }

    /**
     * Размер "плеча" (shoulder) текущей вьюшки (т.е., кол-во вьюшек, которое алгоритм старается поместить с каждой стороны от текущей вьюшки). 
     * "Плечи", одно или оба, могут оказаться "подрезанными", если алгоритм "упрётся" в начало или/и конец списка итемов.
     * @type: {number}
     */
    get VIEWS_N_IN_CURRVIEWSHOULDER() {
        return 4;
    }

    /**
     * Предельное кол-во вьюшек, которое алгоритм может поместить в вью-лист.
     * Это кол-во вьюшек образуется, когда мы даём команду на скроллинг от текущего итема, чья вьюшка окружена "плечами", к итему,
     * чью вьюшку тоже можно будет окружить "плечами". Алгоритм добавляет в вьюлист ту, целевую вьюшку + вьюшки, составляющие её 
     * "плечи", и в результате в вьюлисте в момент скроллинга оказываются исходная и целевая вьюшки + все их "плечи".
     * @type: {number}
     */
    get maxViewsNumberInVList() {
        return 2*(2*this.VIEWS_N_IN_CURRVIEWSHOULDER+1);
    }

    /**
     * Высота (в пикселях) блоков с инфой и управляющими элементами, выдвигающихся сверху и снизу при помещении курсора мыши на вьюшку. 
     * @type: {number}
     */
    get VIEW_MANAGER_BLOCK_HEIGHT() {
        return 30;
    }

    /**
     * Доля от this.state.scrollInterval, при сдвиге на которую вьюшки свайпом должен произойти скроллинг к следующему итему. При сдвиге на 
     * меньшее расстояние текущая вьюшка просто вернётся на своё место.
     * @type: {number}
     */
    get SWIPE_PART_TO_SCROLL() {
        return 0.333;
    }


    
    getItemImageLink(event) {
        let getLinkIconDOMEl = event.target;
        if(!getLinkIconDOMEl.getAttribute("disabled")) {
            let parentDOMEl = getLinkIconDOMEl.parentElement;
            
            while(parentDOMEl.getAttribute("class")!="ifv-view") {
                parentDOMEl = parentDOMEl.parentElement;
            }
            

            let copiedUrl = NAMES_PATHS.siteDomain + getLinkIconDOMEl.getAttribute("data-url");
            let targetViewInfo = this.viewsInfoMap.get(parentDOMEl);
            
            let targetCopyingUrlReportManager = targetViewInfo.copyingUrlReportManager;

            if(navigator.clipboard) {
                // поддержка имеется, включить соответствующую функцию проекта.
                navigator.clipboard.writeText(copiedUrl)
                .then(function() {
                    targetCopyingUrlReportManager.showCopyReport();
                }.bind(this)) 
                .catch(function(err){alert(err)}.bind(this));
            }
            else {
                if(!this.inputForExecCommandDOMEl) this.inputForExecCommandDOMEl = document.createElement('input');
                targetViewInfo.viewInnerElsRefs.inputForExecCommandContainerRef.current.appendChild(this.inputForExecCommandDOMEl);
                this.inputForExecCommandDOMEl.value = copiedUrl;
                this.inputForExecCommandDOMEl.select();
                document.execCommand('copy');
                targetViewInfo.viewInnerElsRefs.inputForExecCommandContainerRef.current.removeChild(this.inputForExecCommandDOMEl);

                targetCopyingUrlReportManager.showCopyReport();
            }
        }
    }




    scrollToViaItemsListPopup(itemNumber) {
        if(!this.state.scrollingDisabled) this.universalScrollFunc(itemNumber);        
    }
    

    openSelectedItemsListPopup(event) {
        this.itemsListPopupsManager.openSILPopupInImageFullView();
    }

    openFullItemsListPopup(event) {
        this.itemsListPopupsManager.openFILPopupInImageFullView();

    }

//=======================================================    

    openFRenamingPopup(event) {
        if(!event.target.getAttribute("disabled")) {
            let fName = this.state.fNamesArr[this.state.currentItemNumber-1];
            //alert(fName);
            
            this.state.fsOperationStatus = FO_STATUS.waitingForResults;
            this.props.uniTool(DO.openFRenamingPopup, fName);
        }
    }
    
//=======================================================    
//Для попапа ScrollToPopup, позволяющего задавать номер целевого итема для скроллинга.

    createScrollToPopupHTML() {
        return (
        <div ref={this.scrollToPopupRef} className="popup-universal-bg">
            <MyDraggable cancel=".popup-universal-textinput">
                <div className="popup-imgfview-scrollto">
                    <div className="popup-imgfview-scrollto-content">
                        <span className="popup-imgfview-scrollto-d-text">Enter item's number to scroll to:</span>
                        <div>
                            <input ref={this.scrollToPopupTextInput} type="text" className="popup-universal-textinput" onChange={this.checkItemNumberToScroll.bind(this)} onKeyDown={this.scrollToByEnter.bind(this)}/>
                            <button className="popup-universal-button-2" onClick={this.scrollTo.bind(this)}>Scroll</button>
                        </div>
                    </div>
                    <div className="popup-closeicon-container">
                        <img className="popup-closeicon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-lighted.png"} onClick={this.closeScrToPopup}/>          
                    </div>
                </div>
            </MyDraggable>
        </div>);
    }

    openScrollToPopup(event) {
        if(this.scrollToPopupRef.current) {
            this.scrollToPopupTextInput.current.value = "";
            this.scrollToPopupContainerRef.current.appendChild(this.scrollToPopupRef.current);
            this.scrollToPopupTextInput.current.focus();
        }
        else {
            ReactDOM.render(this.createScrollToPopupHTML(), this.scrollToPopupContainerRef.current, function(){
                this.scrollToPopupTextInput.current.focus();
            }.bind(this));
        }
    }
    
    closeScrollToPopup(event) {
        this.scrollToPopupContainerRef.current.removeChild(this.scrollToPopupRef.current);
    }
    
    //Проверка вводимого в поле для scrollTo номера итема.
    checkItemNumberToScroll(event) {
        if(event.target.value.match(/[^0-9]/g)) event.target.value = event.target.value.replace(/[^0-9]/g, ''); 
        let itemNumberToScroll = Number(event.target.value);
        if(itemNumberToScroll==0) itemNumberToScroll = 1;
        
        this.state.itemNumberToScroll = itemNumberToScroll;
    }

    scrollTo(event) {
        if(this.scrollToPopupTextInput.current.value!="") this.universalScrollFunc(this.state.itemNumberToScroll);
        this.closeScrollToPopup();
    }
    
    scrollToByEnter(event) {
        if(event.keyCode==13 && event.target.value!="") {
            this.universalScrollFunc(this.state.itemNumberToScroll);
            this.closeScrollToPopup();
        }
    }
    
//=======================================================        
  

    createViewInnerHTML(info) {
//???
//ОПИСАТЬ, что входит в состав вьюшки.
/*
    Принимаемый аргумент:
    info = {
        itemNumber: <number>,
        itemsCount: <number>,
        itemImgFileName: <string>,
        copyingUrlReportManager: <object>,
        viewInnerElsRefs: {
            imageContainerRef: <ref>,
            imageWrapperRef: <ref>,
            imageRef: <ref>,
            upperBlockRef: <ref>,
            itemNumberTextRef: <ref>,
            getLinkIconRef: <ref>,
            copyingUrlReportContainerRef: <ref>,
            inputForExecCommandContainerRef: <ref>,
            renamingIconRef: <ref>,
            removingIconRef: <ref>,
            lowerBlockRef: <ref>,
            fileNameTextRef: <ref>,
            checkBoxRef: <ref>,
        }
    }
*/
        //Здесь создаём только те объекты стилей, в которых присутствуют размеры.
        let imageContainerStyle = {
            width: this.state.styles['imgFullViewViewContainerWidth'] + "px",
            height: this.state.styles['imgFullViewViewContainerHeight'] + "px",            
        };
        
        let imageStyle = {
            minWidth: this.state.styles['imgFullViewViewMinWidth'] + "px",
            maxWidth: this.state.styles['imgFullViewViewMaxWidth'] + "px",
            minHeight: this.state.styles['imgFullViewViewMinHeight'] + "px",
            maxHeight: this.state.styles['imgFullViewViewMaxHeight'] + "px",            
        };
        
        let fileUrl = NAMES_PATHS.glrImagesUrlPath + this.state.userID + "/" + encodeURIComponent(this.state.folder) + "/" + encodeURIComponent(info.itemImgFileName);

        let copyingUrlReportContainerStyle = {
            position: "absolute",
            top: this.VIEW_MANAGER_BLOCK_HEIGHT + "px",
            width: "100%",

            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end"
        };

        let inputForExecCommandContainerStyle = {
            position: "absolute",
            top: this.VIEW_MANAGER_BLOCK_HEIGHT + "px",
            width: "100%",
            overflow: "hidden"            
        };

/*
С чего начинается вьюшка - с place, или с контейнера, в котором рисунок и всё остальное?
ДОМ-элементы, являющиеся ключами в Map с инфой - это place.
ВОЗМОЖНО, вьюшка должна начинаться именно с контейнера, а ключи-place в Map нужно и описывать не как ДОМ-элементы самих вьюшек, а как места под них... НО И ЭТО КАК-ТО НЕЛОГИЧНО! Получается, у нас вьюшка состоит из двух частей - места под неё и её самой, хотя мы всюду ассоциируем её именно с местом.
Нужно устранить понятие "место", т.к. это что-то внешнее. "Корень", "корневое место" (root-place).
ИЛИ просто принять, что то, что мы раньше называли Place - это и есть вьюшка, а всё остальное "понизить" на один уровень.  
*/
        return ( 
            <div ref={info.viewInnerElsRefs.imageContainerRef} style={imageContainerStyle} className="ifv-view__img-container">
                <div name={info.itemNumber} ref={info.viewInnerElsRefs.imageWrapperRef} style={this.itemImageWrapperStyle} className="ifv-view__img-wrapper">
                    <img ref={info.viewInnerElsRefs.imageRef} style={imageStyle} className="ifv-view__img" src={fileUrl} />
                    <div className="ifv-view__managerblocks-container">

                        <div name={info.itemNumber} ref={info.viewInnerElsRefs.upperBlockRef} style={this.itemManagerBlockStyle} className="ifv-view__manager-upperblock">
                            <div ref={info.viewInnerElsRefs.copyingUrlReportContainerRef} style={copyingUrlReportContainerStyle}>
                                {info.copyingUrlReportManager.createReportElement()}
                            </div>
                            <div ref={info.viewInnerElsRefs.inputForExecCommandContainerRef} style={inputForExecCommandContainerStyle}>
                            </div>

                            <div className="ifv-view__itemnumber-container">
                                <span ref={info.viewInnerElsRefs.itemNumberTextRef} className="ifv-view__iteminfo-text">{(info.itemNumber) +"/" + info.itemsCount}</span>
                            </div>

                            <div name="getLink" className="ifv-view__manager-icon-wrapper">
                                <img name="below" style={{zIndex: 1}} src={NAMES_PATHS.designElementsUrlPath + "Icon-link-lighted.png"} className="ifv-view__manager-icon" title="Копировать URL картинки"/>
                                <img ref={info.viewInnerElsRefs.getLinkIconRef} name="above" style={{zIndex: 2}} src={NAMES_PATHS.designElementsUrlPath + "Icon-link.png"} className="ifv-view__manager-icon" data-url={fileUrl} title="Копировать URL картинки" onClick={this.getImgLink} onTouchEnd={this.touchClickableEl}/>
                            </div>                                
                            <div name="rename" className="ifv-view__manager-icon-wrapper">
                                <img name="below" style={{zIndex: 1}} src={NAMES_PATHS.designElementsUrlPath + "Icon-rename-lighted.png"} className="ifv-view__manager-icon" title="Переименовать"/>
                                <img ref={info.viewInnerElsRefs.renamingIconRef} name="above" style={{zIndex: 2}} src={NAMES_PATHS.designElementsUrlPath + "Icon-rename.png"} className="ifv-view__manager-icon" title="Переименовать" onClick={this.openFRenamingPopup.bind(this)} onTouchEnd={this.touchClickableEl}/>
                            </div>
                            <div name="remove" className="ifv-view__manager-icon-wrapper">
                                <img name="below" style={{zIndex: 1}} src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-lighted.png"} className="ifv-view__manager-icon" title="Удалить"/>
                                <img ref={info.viewInnerElsRefs.removingIconRef} name="above" style={{zIndex: 2}} src={NAMES_PATHS.designElementsUrlPath + "Icon-cross.png"} className="ifv-view__manager-icon" title="Удалить" onClick={this.openConfirmSingleFileRemovingPopup.bind(this)} onTouchEnd={this.touchClickableEl}/>
                            </div>
                        </div>

                        <div name={info.itemNumber} ref={info.viewInnerElsRefs.lowerBlockRef} style={this.itemManagerBlockStyle} className="ifv-view__manager-lowerblock" title={info.itemImgFileName}>
                            <span ref={info.viewInnerElsRefs.fileNameTextRef} className="ifv-view__iteminfo-text">{info.itemImgFileName}</span>
                            <div>
                                <input name={info.itemNumber} ref={info.viewInnerElsRefs.checkBoxRef} type="checkbox" tabIndex="-1" className="ifv-view__manager-checkbox" onClick={this.selectItemFunc} onTouchEnd={this.touchClickableEl}/>
                            </div>
                        </div>
                         
                    </div>
                </div>
            </div>);
    }

    adaptViewToNewWindowSize(viewDOMElement) {        
        let imageContainerStyle = {
            width: this.state.styles['imgFullViewViewContainerWidth'] + "px",
            height: this.state.styles['imgFullViewViewContainerHeight'] + "px",  
                
            toString: function() {
                let widthStr = "width: " + this.width + "; ";
                let heightStr = "height: " + this.height + "; ";

                return widthStr + heightStr;
            }   
        };
            
        let imageStyle = {
            minWidth: this.state.styles['imgFullViewViewMinWidth'] + "px",
            maxWidth: this.state.styles['imgFullViewViewMaxWidth'] + "px",
            minHeight: this.state.styles['imgFullViewViewMinHeight'] + "px",
            maxHeight: this.state.styles['imgFullViewViewMaxHeight'] + "px",
                
            toString: function() {
                let minWidthStr = "min-width: " + this.minWidth + "; ";
                let maxWidthStr = "max-width: " + this.maxWidth + "; ";
                let minHeightStr = "min-height: " + this.minHeight + "; ";
                let maxHeightStr = "max-height: " + this.maxHeight + "; ";
                    
                return minWidthStr + maxWidthStr + minHeightStr + maxHeightStr;
            }   
        };

        let viewInfo = this.viewsInfoMap.get(viewDOMElement);
        let imageContainerDOMEl = viewInfo.viewInnerElsRefs.imageContainerRef.current;
        let imageDOMEl = viewInfo.viewInnerElsRefs.imageRef.current;

        imageContainerDOMEl.setAttribute("style", imageContainerStyle.toString());
        imageDOMEl.setAttribute("style", imageStyle.toString());
    }

    adaptPageToNewWindowSize() {
        //В работе ф-и подразумевается, что все изменения стилей, пришедшие через пропсы, уже занесены в 
        //this.state.styles (это делается в shouldComponentUpdate()).
        for(let i=0; i<this.viewsArr.length; i++) {
            this.adaptViewToNewWindowSize(this.viewsArr[i]);
        }
        
        //Вьюпорт и вьюлист, конечно, тоже изменились:
        let viewportStyle = {
            width: this.state.styles['imgFullViewViewportWidth'] + "px",
            height: this.state.styles['imgFullViewViewportHeight'] + "px",
            toString: function() {
                let widthStr = "width: " + this.width + "; ";
                let heightStr = "height: " + this.height + "; ";
                return widthStr + heightStr;
            }
        };

  
        let viewsListStyle = {
            height: this.state.styles['imgFullViewViewsListHeight'] + "px",
            transform: "translate3d(0px, 0px, 0px)",
            toString: function() {
                let heightStr = "left: " + this.height + "; ";
                let transformStr = 'transform: "translate3d(0px, 0px, 0px)"; ';
                return heightStr + transformStr;
            }
        };
      
       
        this.viewportRef.current.setAttribute("style", viewportStyle.toString());
        this.viewsListRef.current.setAttribute("style", viewsListStyle.toString());


        //Естественно, при изменении размеров картинок происходит смещение вьюлиста. Нужно переместить его 
        //обратно так, чтобы текущая вьюшка вновь оказалась по центру вьюпорта. Я решил поступить просто:
        //засечь разницу между left текущей вьюшки и вьюпорта после изменения стилей и переместить вьюлист на
        //эту разницу.
        let currentViewJQueryElement = $(".ifv-view[name='" + this.state.currentItemNumber + "']");
        let viewsListLeft = this.viewsListJQueryElement.offset().left;
        let delta = currentViewJQueryElement.offset().left - (this.viewportJQueryElement.offset().left-this.VIEW_IMGCONTAINER_MARGIN);
            
        viewsListLeft -= delta;
        this.viewsListJQueryElement.offset({left: viewsListLeft}); 
        
        this.state.shouldAdaptPageToNewWindowSize = false;
    }

    makeUnhandledViewCheckBoxClick(checkBoxDOMEl) {
        let nm = checkBoxDOMEl.getAttribute('name');
        checkBoxDOMEl.setAttribute('name', this.CLICKHANDLER_BLOCKER);
        checkBoxDOMEl.click();  
        checkBoxDOMEl.setAttribute('name', nm); 
    }

    modifyView(viewDOMElement, itemNumber, fNamesArr) {
        let fileName = fNamesArr[itemNumber-1];
        let fileUrl = NAMES_PATHS.glrImagesUrlPath + this.state.userID + "/" + encodeURIComponent(this.state.folder) + "/" + encodeURIComponent(fileName);

        let viewInfo = this.viewsInfoMap.get(viewDOMElement);

        let imgWrapperDOMEl = viewInfo.viewInnerElsRefs.imageWrapperRef.current;
        let imgDOMEl = viewInfo.viewInnerElsRefs.imageRef.current;
        let upperBlockDOMEl = viewInfo.viewInnerElsRefs.upperBlockRef.current;
        let itemNumberTextDOMEl = viewInfo.viewInnerElsRefs.itemNumberTextRef.current;
        let getLinkIconDOMEl = viewInfo.viewInnerElsRefs.getLinkIconRef.current;
        let lowerBlockDOMEl = viewInfo.viewInnerElsRefs.lowerBlockRef.current;
        let fileNameTextDOMEl = viewInfo.viewInnerElsRefs.fileNameTextRef.current;
        let checkBoxDOMEl = viewInfo.viewInnerElsRefs.checkBoxRef.current;


        viewDOMElement.setAttribute('name', itemNumber);
        imgWrapperDOMEl.setAttribute('name', itemNumber);
        imgDOMEl.setAttribute('src', fileUrl);
        upperBlockDOMEl.setAttribute('name', itemNumber);
        itemNumberTextDOMEl.innerHTML = (itemNumber) +"/" + fNamesArr.length;
        getLinkIconDOMEl.setAttribute("data-url", fileUrl);
        lowerBlockDOMEl.setAttribute('name', itemNumber);
        lowerBlockDOMEl.setAttribute('title', fileName);
        fileNameTextDOMEl.innerHTML = fileName;
        checkBoxDOMEl.setAttribute('name', itemNumber);

        if(this.state.itemsObject[fileName].selected) { //Итем выделен, и вьюшка д.б. выделена
            if(this.state.itemsObject[fileName].disabled) {//Итем дисаблирован, и вьюшка д.б. дисаблирована
                //alert("Need selected, need disabled " + itemNumber);
                if(this.checkIfViewDisabled(viewDOMElement)) { //Если вьюшка уже дисаблирована.
                    if(checkBoxDOMEl.checked==false) { //Галочка не стоит. Нужно поставить.
                        //Нужно раздисаблировать чекбокс, поставить галочку и опять дисаблировать чекбокс.
                        checkBoxDOMEl.removeAttribute("disabled");
                        //Блокируем обработчик клика, т.к. итем уже выделен, и нам не нужно, чтоб обработчик вторично вызвал ф-ю выделения.
                        //checkBoxDOMEl.setAttribute('name', this.CLICKHANDLER_BLOCKER);
                        //checkBoxDOMEl.click();  
                        //checkBoxDOMEl.setAttribute('name', itemNumber);    
                        this.makeUnhandledViewCheckBoxClick(checkBoxDOMEl);
                        checkBoxDOMEl.setAttribute("disabled", true);
                    }
                }
                else { //Если вьюшка ещё не дисаблирована. Надо дисаблировать.
                    if(checkBoxDOMEl.checked==false) {//Галочка не стоит. Нужно поставить.
                        //Блокируем обработчик клика, т.к. итем уже выделен, и нам не нужно, чтоб обработчик вторично вызвал ф-ю выделения.
                        //checkBoxDOMEl.setAttribute('name', this.CLICKHANDLER_BLOCKER);
                        //checkBoxDOMEl.click();  
                        //checkBoxDOMEl.setAttribute('name', itemNumber);  
                        this.makeUnhandledViewCheckBoxClick(checkBoxDOMEl);
                    }
                    
                    //Дисаблируем вьюшку.
                    this.setDisabledViewStyle(viewDOMElement);

                }
            }
            else { //Если вьюшка не д.б. дисаблирована.     
                    if(this.checkIfViewDisabled(viewDOMElement)) { //Вьюшка дисаблирована. Надо энаблировать.
                        //Энаблируем вьюшку и устанавливаем ей стиль выделенного состояния.
                        this.removeDisabledViewStyle({viewElement: viewDOMElement, selected:true});
                    }
                    
                    if(checkBoxDOMEl.checked==false) {//Галочка не стоит. Нужно поставить.
                        //Блокируем обработчик клика, т.к. итем уже выделен, и нам не нужно, чтоб обработчик вторично вызвал ф-ю выделения.
                        //checkBoxDOMEl.setAttribute('name', this.CLICKHANDLER_BLOCKER);
                        //checkBoxDOMEl.click();  
                        //checkBoxDOMEl.setAttribute('name', itemNumber);  
                        this.makeUnhandledViewCheckBoxClick(checkBoxDOMEl);
                    }    
                    
                    //Устанавливаем вьюшке стиль выделенного состояния.
                    this.setSelectedOrNotViewStyle({viewElement: viewDOMElement, selected: true});
            }
        }
        else { //Вьюшка не д.б. выделена.
            if(this.state.itemsObject[fileName].disabled) {//Итем дисаблирован, и вьюшка д.б. дисаблирована
                if(!this.checkIfViewDisabled(viewDOMElement)) { //Если вьюшка ещё не дисаблирована. Надо дисаблировать.
                    if(checkBoxDOMEl.checked) {//Галочка стоит. Нужно снять.
                        //Блокируем обработчик клика, чтобы тот не вызвал ф-ю выделения итема.
                        //checkBoxDOMEl.setAttribute('name', this.CLICKHANDLER_BLOCKER);
                        //checkBoxDOMEl.click();  
                        //checkBoxDOMEl.setAttribute('name', itemNumber);                          
                        this.makeUnhandledViewCheckBoxClick(checkBoxDOMEl);
                    }
                
                    //Дисаблируем вьюшку.
                    this.setDisabledViewStyle(viewDOMElement);
                }
                else {//Если вьюшка уже дисаблирована.
                    if(checkBoxDOMEl.checked) {//Галочка стоит. Нужно снять.
                        //Нужно раздисаблировать чекбокс, снять галочку и опять дисаблировать чекбокс.                    
                        checkBoxDOMEl.removeAttribute("disabled");
                        //Блокируем обработчик клика, чтобы тот не вызвал ф-ю выделения итема.
                        //checkBoxDOMEl.setAttribute('name', this.CLICKHANDLER_BLOCKER);
                        //checkBoxDOMEl.click();  
                        //checkBoxDOMEl.setAttribute('name', itemNumber);    
                        this.makeUnhandledViewCheckBoxClick(checkBoxDOMEl);
                        checkBoxDOMEl.setAttribute("disabled", true);                    
                    }
                }
            }
            else { //Вьюшка не д.б. дисаблирована.
                if(this.checkIfViewDisabled(viewDOMElement)) { //Вьюшка дисаблирована. Нужно энаблировать.
                    //Энаблируем вьюшку.
                    this.removeDisabledViewStyle({viewElement: viewDOMElement, selected:false});
                }   

                if(checkBoxDOMEl.checked) {//Галочка стоит. Нужно снять.
                    //checkBoxDOMEl.setAttribute('name', this.CLICKHANDLER_BLOCKER);
                    //checkBoxDOMEl.click();  
                    //checkBoxDOMEl.setAttribute('name', itemNumber);  
                    this.makeUnhandledViewCheckBoxClick(checkBoxDOMEl);
                }
                
                this.setSelectedOrNotViewStyle({viewElement: viewDOMElement, selected: false});
            }
        }
    }

    activateView(viewDOMElement) {
        viewDOMElement.setAttribute("active", "1");
    }
    
    deActivateView(viewDOMElement) {
        viewDOMElement.setAttribute("active", "0");
    }
    
    checkIfViewIsInVList(itemNumber) {
        if(this.viewsListRef.current.querySelector(".ifv-view[name='" + itemNumber + "']")) return true;
        else return false;
    }

    getFreeView(viewDOMElementsArr) {
        let foundElement = false;
        for(let i=0; i<viewDOMElementsArr.length; i++) {
            let element = viewDOMElementsArr[i];
            if(element.getAttribute("active")=="0") {
                foundElement = element;
                break;
            }
        }
        
        return foundElement;
    }
    
    setSelectedOrNotViewStyle(info) {
        /*
        Принимаемый аргумент:
        info = {
            viewElement: <HTMLDivElement>,
            selected: <boolean>,
            clickSelChBoxAndCallHandler: <boolean>
        }
        */
        let viewDOMElement = info.viewElement;
        let selected = info.selected;
        let clickSelChBoxAndCallHandler = info.clickSelChBoxAndCallHandler;
        let viewInfo = this.viewsInfoMap.get(viewDOMElement);

        let imageWrapper = viewInfo.viewInnerElsRefs.imageWrapperRef.current;
        let itemManagerUpperBlock = viewInfo.viewInnerElsRefs.upperBlockRef.current;
        let itemManagerLowerBlock = viewInfo.viewInnerElsRefs.lowerBlockRef.current;

        if(selected==true) {
            imageWrapper.setAttribute("style", this.selectedItemImgWrapperStyle.toString());
            itemManagerUpperBlock.setAttribute("style", this.selectedItemManagerBlockStyle.toString());
            itemManagerLowerBlock.setAttribute("style", this.selectedItemManagerBlockStyle.toString());
        }
        else {
            imageWrapper.setAttribute("style", this.itemImageWrapperStyle.toString());
            itemManagerUpperBlock.setAttribute("style", this.itemManagerBlockStyle.toString());
            itemManagerLowerBlock.setAttribute("style", this.itemManagerBlockStyle.toString());
        } 

        //Возможность кликнуть по чекбоксу выделения итема и вызвать обработчик клика используется только когда мы выделяем итемы не 
        //непосредственно через вьюшки, а через какой-то попап со списком итемов (см. this.selectItemViaILPopup()).
        if(clickSelChBoxAndCallHandler==true) {
            let checkBox = viewInfo.viewInnerElsRefs.checkBoxRef.current;
            checkBox.click();
        }        
    }


    checkIfViewDisabled(viewDOMElement) {
        let viewInfo = this.viewsInfoMap.get(viewDOMElement);
        let imageWrapper = viewInfo.viewInnerElsRefs.imageWrapperRef.current;
        return imageWrapper.getAttribute("disabled");
    }


    setDisabledViewStyle(viewDOMElement) {
        let viewInfo = this.viewsInfoMap.get(viewDOMElement);

        let imageWrapper = viewInfo.viewInnerElsRefs.imageWrapperRef.current;
        let itemManagerUpperBlock = viewInfo.viewInnerElsRefs.upperBlockRef.current;

        let getLinkIcon = viewInfo.viewInnerElsRefs.getLinkIconRef.current;
        let renamingIcon = viewInfo.viewInnerElsRefs.renamingIconRef.current;
        let removingIcon = viewInfo.viewInnerElsRefs.removingIconRef.current;
        let itemManagerLowerBlock = viewInfo.viewInnerElsRefs.lowerBlockRef.current;

        let checkbox = viewInfo.viewInnerElsRefs.checkBoxRef.current;

        imageWrapper.setAttribute("disabled", true);

        imageWrapper.setAttribute("style", this.disabledItemImgWrapperStyle.toString());
        itemManagerUpperBlock.setAttribute("style", this.disabledItemManagerBlockStyle.toString());
        getLinkIcon.setAttribute("class", "ifv-view__manager-icon_disabled");
        getLinkIcon.setAttribute("disabled", true);
        renamingIcon.setAttribute("class", "ifv-view__manager-icon_disabled");
        renamingIcon.setAttribute("disabled", true);
        removingIcon.setAttribute("class", "ifv-view__manager-icon_disabled");
        removingIcon.setAttribute("disabled", true);
        itemManagerLowerBlock.setAttribute("style", this.disabledItemManagerBlockStyle.toString());
        checkbox.setAttribute("disabled", true);
    }

    removeDisabledViewStyle(info) {
        /*
        Принимаемый аргумент:
        info = {
            viewElement: <HTMLDivElement>,
            selected: <boolean>
        }
        */
        let viewDOMElement = info.viewElement;
        let selected = info.selected;
        let viewInfo = this.viewsInfoMap.get(viewDOMElement);
        let imageWrapper = viewInfo.viewInnerElsRefs.imageWrapperRef.current;

        if(imageWrapper && imageWrapper.getAttribute("disabled")) {

            let itemManagerUpperBlock = viewInfo.viewInnerElsRefs.upperBlockRef.current;

            let getLinkIcon = viewInfo.viewInnerElsRefs.getLinkIconRef.current;
            let renamingIcon = viewInfo.viewInnerElsRefs.renamingIconRef.current;
            let removingIcon = viewInfo.viewInnerElsRefs.removingIconRef.current;
            let itemManagerLowerBlock = viewInfo.viewInnerElsRefs.lowerBlockRef.current;

            let checkbox = viewInfo.viewInnerElsRefs.checkBoxRef.current;

            if(selected==true) {
                imageWrapper.setAttribute("style", this.selectedItemImgWrapperStyle.toString());
                itemManagerUpperBlock.setAttribute("style", this.selectedItemManagerBlockStyle.toString());
                itemManagerLowerBlock.setAttribute("style", this.selectedItemManagerBlockStyle.toString());
            }
            else {
                imageWrapper.setAttribute("style", this.itemImageWrapperStyle.toString());
                itemManagerUpperBlock.setAttribute("style", this.itemManagerBlockStyle.toString());
                itemManagerLowerBlock.setAttribute("style", this.itemManagerBlockStyle.toString());
            }  

            if(getLinkIcon && renamingIcon && removingIcon) {
                getLinkIcon.setAttribute("class", "ifv-view__manager-icon");
                getLinkIcon.removeAttribute("disabled");
                renamingIcon.setAttribute("class", "ifv-view__manager-icon");
                renamingIcon.removeAttribute("disabled");
                removingIcon.setAttribute("class", "ifv-view__manager-icon");
                removingIcon.removeAttribute("disabled");
            }

            checkbox.removeAttribute("disabled");
        }        
    }

    componentDidMount() {
        this.viewportJQueryElement = $(".ifv-viewport");
        this.viewsListJQueryElement = $(".ifv-viewslist");
        
        //ЗАМЕТИМ, это не массив, а псевдомассив NodeList (https://developer.mozilla.org/ru/docs/Web/API/Document/querySelectorAll)
        let viewsNodeList = this.viewsListRef.current.querySelectorAll(".ifv-view");

        let itemNumberIterator = this.state.numberOfFIRSTItemInVList;
        for(let i=0; i<viewsNodeList.length; i++) {
            this.viewsArr.push(viewsNodeList[i]);

            this.viewsInfoMap.set(viewsNodeList[i], this.initiallyRenderedViewsInfoArr[i]);            

            let fName = this.state.fNamesArr[itemNumberIterator-1];

            let chkbox = this.initiallyRenderedViewsInfoArr[i].viewInnerElsRefs.checkBoxRef.current;

            //Выставляются галочки чекбоксов у вьюшек выделенных итемов. Это нужно делать уже после рендеринга вьюшек, а не  
            //рендерить чекбоксы уже с галочками - иначе выставленные галочки невозможно будет снять.
            if(this.state.itemsObject[fName].selected) chkbox.setAttribute("checked", true); 

            this.setSelectedOrNotViewStyle({viewElement: viewsNodeList[i], selected: this.state.itemsObject[fName].selected});

            if(this.state.itemsObject[fName].disabled) this.setDisabledViewStyle(viewsNodeList[i]);
            else this.removeDisabledViewStyle({viewElement: viewsNodeList[i], selected: this.state.itemsObject[fName].selected});

            this.initiallyRenderedViewsInfoArr[i].copyingUrlReportManager.hideCopyReport();
            
            itemNumberIterator++;
        }

        if(this.state.selectedItemsCount==0) this.iMBBRef.current.hideSelItemsManagerButtons();
        else this.iMBBRef.current.showSelItemsManagerButtons();
 
        let itemListsInfoObj = {
            FILPopupContainerRef: this.FILPopupContainerRef,
            SILPopupContainerRef: this.SILPopupContainerRef,
            itemsObject: this.state.itemsObject,
            //selectedItemsObject: this.state.selectedItemsObject,
            moveToItemViaPopupFunc: this.scrollToViaItemsListPopup.bind(this),
            selectItemFunc: this.selectItemViaILPopup.bind(this),
            onClosePopupFunc: null,
        };
        this.itemsListPopupsManager = new ILPopups(itemListsInfoObj);
    }

    /**
     * Перебирает все вьюшки, находящиеся в вьюлисте, и дисаблирует/энаблирует те, чьи итемы дисаблированы/энаблированы.
     */
    setDisabledViewsInVList() {
        let viewsNodeList = this.viewsListRef.current.querySelectorAll(".ifv-view");

        for(let i=0; i<viewsNodeList.length; i++) {
            let itemNumber = Number(viewsNodeList[i].getAttribute("name"));
            let fName = this.state.fNamesArr[itemNumber-1];
            if(this.state.itemsObject[fName].disabled) this.setDisabledViewStyle(viewsNodeList[i]);
            else this.removeDisabledViewStyle({viewElement: viewsNodeList[i], selected: this.state.itemsObject[fName].selected});
        } 
    }
  

    /**
     * shouldComponentUpdate() в данном модуле всегда будет возвращать false, т.к. перерисовываться этоит модуль не должен. Вся интерактивность
     * обеспечивается изменением стилей и DOM-операциями.
     * @param {*} newProps 
     * @returns {false}
     */
    shouldComponentUpdate(newProps) {
        /*
        Мы не будем проверять изменение props.infoObject.userID, т.к. при смене юзера фуллвью закрывается, и закрытие это производится в коде 
        <Gallery>. 
         */

        /*
        Изменение props.infoObject.adaptParams['imgFullViewScrollInterval'] означает, что изменилось разрешение окна с сайтом. Так что нам нужно
        адаптировать дизайн страницы под новое разрешение.
         */
        if(this.state.scrollInterval != Number(newProps.infoObject.adaptParams['imgFullViewScrollInterval'])) {
            //Получаем массив всех св-в объекта this.state.styles
            let stylesKeysArr = Object.keys(this.state.styles);
            stylesKeysArr.forEach(function(key){
                if(this.state.styles[key] != Number(newProps.infoObject.adaptParams[key])) {
                    this.state.styles[key] = Number(newProps.infoObject.adaptParams[key]);
                }
            }, this); 

            this.state.scrollInterval = Number(newProps.infoObject.adaptParams['imgFullViewScrollInterval']);

            //Ресайзить картинки и прочее можно только если не производится анимация.
            if(!this.state.scrollingDisabled) this.adaptPageToNewWindowSize();
            else this.state.shouldAdaptPageToNewWindowSize = true;
            
        }
        
        let newProps_fsOperationStatus = Number(newProps.infoObject.fsOperationStatus);
        if(this.state.fsOperationStatus != newProps_fsOperationStatus) {    
            if(newProps_fsOperationStatus==FO_STATUS.renamedSuccessfully ||
            newProps_fsOperationStatus==FO_STATUS.renamingFailed ||
            newProps_fsOperationStatus==FO_STATUS.uploadedSuccessfully || 
            newProps_fsOperationStatus==FO_STATUS.uploadingFailed ||
            newProps_fsOperationStatus==FO_STATUS.uplFExistAllSkipped ||
            newProps_fsOperationStatus==FO_STATUS.removedSuccessfully || 
            newProps_fsOperationStatus==FO_STATUS.removingFailed || 
            newProps_fsOperationStatus==FO_STATUS.downloadedSuccessfully ||
            newProps_fsOperationStatus==FO_STATUS.downloadingFailed) {

                /*
                По завершении файловой операции вызывается метод changeViewsListDueFileChanges().
                Он вычисляет новый номер текущий вьюшки и номера, какие они должны быть, крайней левой и крайней правой вьюшек во вьюлисте.
                Затем он вызывает метод makeEdgeViewsDueFileChanges(), передавая туда эти вычисленные значения.
                Метод makeEdgeViewsDueFileChanges() вызывает метод addingAndRemovingEdgeViewsAtFinals() и возвращает промис, ожидающий выполнения 
                addingAndRemovingEdgeViewsAtFinals() (собственно, это единственная задача makeEdgeViewsDueFileChanges()).
                Метод addingAndRemovingEdgeViews() добавляет или удаляет вьюшки в концах вьюлиста, в зависимости от упомянутых новых номеров 
                текущей и краевых вьюшек.
                После этого вызывается коллбэк метода addingAndRemovingEdgeViewsAtFinals().
                */

                if(!this.state.scrollingDisabled) this.changeViewsListDueFileChanges();
                else this.state.postScrollingCallback = this.changeViewsListDueFileChanges.bind(this);
            }
            
            this.state.fsOperationStatus = FO_STATUS.noAction;
        }

        return false;
    }

    changeViewsListDueFileChanges() {
        //Нужно заново получить массив имён файлов.
        this.state.fNamesArr = Object.keys(this.state.itemsObject).sort(this.stringComparsionRulesCollator.compare);

        if(this.state.fNamesArr.length > 0) {
            //Нам нужно узнать кол-во выделенных итемов. ВОПРОС: что быстрее - сделать перебор массива this.state.fNamesArr,
            //или получить массив выделенных итемов через Object.keys() от this.state.selectedItemsObject и узнать его длину?
            //Я ДУМАЮ, последнее, т.к. после выполнения операции выделенных итемов, чаще всего, не останется (они,
            //я думаю, чаще всего выделяются для удаления).
            this.state.selectedItemsCount = Object.keys(this.state.selectedItemsObject).length;

            /*
            По умолчанию, currentItemNumber не должен измениться при изменении списка файлов. Т.е., во вьюпорте будет
            вьюшка итема с тем же номером, что и до файловой операции. currentItemNumber изменяется только если длина нового
            списка файлов оказывается меньше самого currentItemNumber - тогда он принимает значение наибольшего номера.
            */
            let prevCurrentItemNumber = this.state.currentItemNumber;
            if(this.state.currentItemNumber > this.state.fNamesArr.length)
                this.state.currentItemNumber = this.state.fNamesArr.length;
                        
            let viewsList = this.viewsListRef.current;

            let newNumberOfFIRSTItemInVList = this.state.currentItemNumber - this.VIEWS_N_IN_CURRVIEWSHOULDER;
            let newNumberOfLASTItemInVList = this.state.currentItemNumber + this.VIEWS_N_IN_CURRVIEWSHOULDER;

            if(newNumberOfFIRSTItemInVList < 1) newNumberOfFIRSTItemInVList = 1;
            if(newNumberOfLASTItemInVList > this.state.fNamesArr.length) newNumberOfLASTItemInVList = this.state.fNamesArr.length;

            this.state.scrollingDisabled = true;       

                  
            let edgeViewsMakingInfoObj = {
                viewsListDOMEl: this.viewsListRef.current,
                viewsListJQueryEl: this.viewsListJQueryElement,
                numberOfFIRSTItemInVList: newNumberOfFIRSTItemInVList,
                currentItemNumber: this.state.currentItemNumber,
                oldCurrentItemNumber: prevCurrentItemNumber,
                numberOfLASTItemInVList: newNumberOfLASTItemInVList,
            }
                    

            this.makeEdgeViewsDueFileChanges(edgeViewsMakingInfoObj)
            .then(function() {
                let viewsNodeList = viewsList.querySelectorAll(".ifv-view");
                        
                let itemNumberIterator = newNumberOfFIRSTItemInVList;
                for(let i=0; i<viewsNodeList.length; i++) {
                    this.modifyView(viewsNodeList[i], itemNumberIterator, this.state.fNamesArr);
                    itemNumberIterator++;
                } 
                        
                if(this.state.selectedItemsCount==0) 
                    this.iMBBRef.current.hideSelItemsManagerButtons();
                        
                this.state.numberOfFIRSTItemInVList = newNumberOfFIRSTItemInVList;
                this.state.numberOfLASTItemInVList = newNumberOfLASTItemInVList;
                this.state.swipeDirection = this.NODIRECTION;                
                this.state.scrollingDisabled = false;
            }.bind(this));

        }
        else {
            //Если все картинки из текущей папки оказались удалены, мы покидаем фуллвью.
            this.exitFullView();
        }
    }
    
    //Добавление/удаление вьшек на концах вьюлиста в результате изменений файлового состава.
    async makeEdgeViewsDueFileChanges(info) {
        /*
        Принимаемый аргумент:
        info = {
            viewsListDOMEl: <DOM-element>,
            viewsListJQueryEl: <JQuery-element>,
            numberOfFIRSTItemInVList: <number>,
            currentItemNumber: <number>,
            oldCurrentItemNumber: <number или null>,
            numberOfLASTItemInVList: <number>            
        }
        */
        let edgeViewsMakingInfoObj = {
            viewsListDOMEl: info.viewsListDOMEl,
            viewsListJQueryEl: info.viewsListJQueryEl,
            numberOfFIRSTItemInVList: info.numberOfFIRSTItemInVList,
            currentItemNumber: info.currentItemNumber,
            oldCurrentItemNumber: info.oldCurrentItemNumber,
            numberOfLASTItemInVList: info.numberOfLASTItemInVList
        }
        let promise = new Promise(function (resolve, reject) {
            this.addingAndRemovingEdgeViewsAtFinals(edgeViewsMakingInfoObj, resolve);
        }.bind(this));
                        
        return promise;
    }


    getTouchEvent(event) {
        return event.type.search('touch') !== -1 ? event.touches[0] : event;
    }
    
    onSwipeStart(event) {
        if(!this.state.scrollingDisabled) {
            let evt = this.getTouchEvent(event);
            this.state.swipePosXInit = evt.clientX;
            this.state.currentSwipePosX = evt.clientX;
            
            //Сохраняем этот код на будущее (см. коммент "Скорость свайпа" в this.state):
            /*
            let date = new Date();
            this.state.currentSwipeMoment = date.getTime();
            */
        }
    }

    onSwipeAction(event) {
        event.preventDefault();
        if(!this.state.scrollingDisabled) {
            let evt = this.getTouchEvent(event);

            let deltaPos = evt.clientX - this.state.currentSwipePosX;

            //Сохраняем этот код на будущее (см. коммент "Скорость свайпа" в this.state):
            /*
            let date = new Date();
            let currentSwMoment = date.getTime();            
            this.state.swipeSpeed = Math.abs(deltaPos)/(currentSwMoment - this.state.currentSwipeMoment);
            this.state.currentSwipeMoment = currentSwMoment;
            */
            
            //Когда слева от текущей вьюшки ничего нет, вьюлист нельзя двигать вправо:
            if(this.state.currentItemNumber==1 && deltaPos>0) return;
            //Когда справа от текущей вьюшки ничего нет, вьюлист нельзя двигать влево:
            if(this.state.currentItemNumber==this.state.fNamesArr.length && deltaPos<0) return;

            let viewsList = this.viewsListRef.current;
            let transformParameterStr = viewsList.style.transform;
            //С помощью этого регулярного выражения мы выделяем из строки типа "translate3d(0px, 0px, 0px)"
            //значения координат. [-0-9.] — эта группа говорит, что мы ищем или "минус" или "цифру от 0 до 9"
            //или "точку" (там м.б. дробные значения). "+" после этой группы говорит, что любой из этих символов
            //может быть 1 или более раз. (?=px) — гворит, что мы ищем предыдущую группу цифр, только если за 
            //ними следует "px".
            let regExpForXCoord = /[-0-9.]+(?=px)/;
            let xCoord = Number(transformParameterStr.match(regExpForXCoord)[0]); //match() возвращает массив совпадений.
            //Нам нужен первый его элемент - т.е., х-координата в "translate3d(0px, 0px, 0px)".

            this.state.currentSwipePosX = evt.clientX;
        
            this.viewsListRef.current.style.transform = "translate3d(" + (xCoord+deltaPos) + "px, 0px, 0px)";
        }
    }
    
    onSwipeEnd(event) {
        event.preventDefault();
        
        if(!this.state.scrollingDisabled) {  
            //У события отрыва пальца от экрана, видимо, нет координат - ошибка выдаётся.
            //let deltaPos = evt.clientX - this.state.currentSwipePosX;
            
            //Перетаскивали вьюшку (читай - вьюлист) направо
            if(this.state.currentSwipePosX > this.state.swipePosXInit) this.state.swipeDirection = this.RIGHT;
            //Перетаскивали вьюлшку налево
            else if(this.state.currentSwipePosX < this.state.swipePosXInit) this.state.swipeDirection = this.LEFT;
            else this.state.swipeDirection = this.NODIRECTION;
        
            if(this.state.currentSwipePosX != this.state.swipePosXInit) {
                let absDeltaPos = Math.abs(this.state.currentSwipePosX-this.state.swipePosXInit);
                //Если сдвиг вьюшки (читай - вьюлиста) составил больее некой критической доли от this.state.scrollInterval, должен 
                //произойти скроллинг к следующему итему. Иначе при отрыве пальца от тачскрина вьюшка должна вернуться на своё место.
                //if(absDeltaPos > this.state.scrollInterval/3) {
                if(absDeltaPos > this.state.scrollInterval*this.SWIPE_PART_TO_SCROLL) {
                    
                    if(this.state.swipeDirection==this.RIGHT) {
                        //Может быть ситуация, что мы, резко двинув пальцем, перетащили вьюшку на расстояние
                        //>=this.state.scrollInterval - т.е., фактически, уже перемотали на следующую вьюшку.
                        //Эту ситуацию нужно обработать, иначе произойдёт сбой с currentItemNumber.
                        if(absDeltaPos >= this.state.scrollInterval) { 
                            this.state.currentItemNumber--;
                            this.universalScrollFunc(this.state.currentItemNumber); //Для случая, когда absDeltaPos > this.state.scrollInterval.
                            //Тогда ф-я universalScrollFunc() плавно подвинет новую картинку на место, выровняв её.
                        }
                        else this.universalScrollFunc(this.state.currentItemNumber-1);
                    }
                    else if(this.state.swipeDirection==this.LEFT) {
                        if(absDeltaPos >= this.state.scrollInterval) { 
                            this.state.currentItemNumber++;
                            this.universalScrollFunc(this.state.currentItemNumber);
                        }
                        else this.universalScrollFunc(this.state.currentItemNumber+1);
                    }
                }
                //Если свайп недостаточен для скроллинга - просто, как говорилось выше, возвращаем текущую вьюшку на место (в ф-и 
                //universalScrollFunc() есть механизм на этот случай).
                else {
                    this.universalScrollFunc(this.state.currentItemNumber);
                }
            }
        
            this.state.swipePosXInit = 0;
            this.state.currentSwipePosX = 0; 
            
            //Сохраняем этот код на будущее (см. коммент "Скорость свайпа" в this.state):
            /*
            this.state.swipeSpeed = 0;
            this.state.currentSwipeMoment = 0;
            */
        }
    }
     
    selectItemViaILPopup(fileName, selected, itemNumber) {
        if(selected===true && this.state.itemsObject[fileName].selected===false) {
            //Проверяем, находится ли вьюшка, в которой нужно программным кликом поставить/снять галочку в чекбоксе,
            //в вьюлисте. Потому что если кликнуть в неиспользуемой (т.е., неактивной), то потом будет сбой, когда 
            //будем её модифицировать после активации. Кликать нужно только в используемых. Остальные сами выставят свои галочки и 
            //стили при модифицировании.     
            let viewDOMEl = this.viewsListRef.current.querySelector(".ifv-view[name='" + itemNumber + "']");
            if(this.checkIfViewIsInVList(itemNumber)) {
                this.setSelectedOrNotViewStyle({viewElement: viewDOMEl, selected: true, clickSelChBoxAndCallHandler: true});
            }
            else {
                this.state.selectedItemsCount++;
                if(this.state.selectedItemsCount==1) this.iMBBRef.current.showSelItemsManagerButtons(); 
                this.props.uniTool(DO.selectGlrItem, {"fileName": fileName, "selected": true});
            }
        }
        else if(selected===false && this.state.itemsObject[fileName].selected===true) {
            let viewDOMEl = this.viewsListRef.current.querySelector(".ifv-view[name='" + itemNumber + "']");
            if(this.checkIfViewIsInVList(itemNumber)) {
                this.setSelectedOrNotViewStyle({viewElement: viewDOMEl, selected: false, clickSelChBoxAndCallHandler: true});
            }
            else {
                this.state.selectedItemsCount--;
                if(this.state.selectedItemsCount==0) this.iMBBRef.current.hideSelItemsManagerButtons();
                
                this.props.uniTool(DO.selectGlrItem, {"fileName": fileName, "selected": false});                
            }
        }
    }

    selectItem(event) {
        let selectedNumber = Number(event.target['name']);
        let selected = event.target.checked ? true : false;

        if(selectedNumber!=this.CLICKHANDLER_BLOCKER) {
            let fName = this.state.fNamesArr[selectedNumber-1];

            if(selected===true) {
 
                if(this.state.selectedItemsCount==0) {
                    this.iMBBRef.current.showSelItemsManagerButtons();
                }
            
                this.state.selectedItemsCount++;

                let viewDOMEl = this.viewsListRef.current.querySelector(".ifv-view[name='" + selectedNumber + "']");
                this.setSelectedOrNotViewStyle({viewElement: viewDOMEl, selected: selected});
                this.props.uniTool(DO.selectGlrItem, {"fileName": fName, "selected": true});
            }
            else {
                this.state.selectedItemsCount--;
                if(this.state.selectedItemsCount==0) this.iMBBRef.current.hideSelItemsManagerButtons();

                let viewDOMEl = this.viewsListRef.current.querySelector(".ifv-view[name='" + selectedNumber + "']");
                this.setSelectedOrNotViewStyle({viewElement: viewDOMEl, selected: selected});
                this.props.uniTool(DO.selectGlrItem, {"fileName": fName, "selected": false});  
            }
        }
    }
    
    touchClickableElement(event) {
        event.stopPropagation();
        event.preventDefault();
        event.target.click();
    }

    universalScrollFunc(targetItemNumber) {
        if(!this.state.scrollingDisabled) {
            let viewsListJQueryElement = this.viewsListJQueryElement; 
            let viewportJQueryElement = this.viewportJQueryElement;//$(".ifv-viewport");
            let viewsList = this.viewsListRef.current;

            /**
             * Отступ левого края вьюлиста от левого края вьюпорта, в пикселях. 
             * @type: {number}
             */                
            let vListOffsetFromViewport;

            /**
             * Сдвиг, в пикселях, вьюлиста относительно его положения покоя на момент начала скроллинга. Положение покоя - это не обязательно
             * стартовое положение, когда во вьюпорте показывается первый итем, а вообще положение, когда вьюлист не анимируется, и во вьюпорте 
             * неподвижно показывается какой угодно итем.
             * Сдвиг может оказаться ненулевым, если перед началом скроллинга мы на сколько-то сместили вьюлист свайпом на тачскрине.
             * Если вьюлист был смещён влево, vListOffsetFromStablePos д.б. отрицательным, если вправо - положительным.
             * @type: {number}
             */
            let vListOffsetFromStablePos; 

            if(targetItemNumber > this.state.fNamesArr.length) targetItemNumber = this.state.fNamesArr.length;
            if(targetItemNumber < 1) targetItemNumber = 1;

            let newNumberOfFIRSTItemInVList = targetItemNumber - this.VIEWS_N_IN_CURRVIEWSHOULDER;
            let newNumberOfLASTItemInVList = targetItemNumber + this.VIEWS_N_IN_CURRVIEWSHOULDER;

            if(newNumberOfFIRSTItemInVList < 1) newNumberOfFIRSTItemInVList = 1;
            if(newNumberOfLASTItemInVList > this.state.fNamesArr.length) newNumberOfLASTItemInVList = this.state.fNamesArr.length;

            if(targetItemNumber != this.state.currentItemNumber) {
                let animationTime;
                let numbersDifference = Math.abs(targetItemNumber - this.state.currentItemNumber);
                
                if(numbersDifference < 2*this.VIEWS_N_IN_CURRVIEWSHOULDER/3) animationTime = this.SHORT_ANIMATION_TIME;
                else if(numbersDifference >= 2*this.VIEWS_N_IN_CURRVIEWSHOULDER/3 && numbersDifference < 4*this.VIEWS_N_IN_CURRVIEWSHOULDER/3) animationTime = this.MIDDLE_ANIMATION_TIME;
                else animationTime = this.LONG_ANIMATION_TIME;

                vListOffsetFromViewport = viewportJQueryElement.offset().left-this.VIEW_IMGCONTAINER_MARGIN-viewsListJQueryElement.offset().left;

                vListOffsetFromStablePos = 0; 

                if(this.state.swipeDirection == this.LEFT) vListOffsetFromStablePos = Math.trunc(vListOffsetFromViewport/this.state.scrollInterval)*this.state.scrollInterval - vListOffsetFromViewport;
                else if(this.state.swipeDirection == this.RIGHT) vListOffsetFromStablePos = Math.trunc(vListOffsetFromViewport/this.state.scrollInterval + 1)*this.state.scrollInterval - vListOffsetFromViewport;

                this.state.scrollingDisabled = true;        
                if(targetItemNumber > this.state.currentItemNumber) { //SCROLL RIGHT
                    /*   
                    Метка для перемещений: (**)                 

                    Мы должны определиться, сколько вьюшек добавить в начало/конец вьюлиста и/или убрать оттуда.
                    Мы исходим из следующих факторов:
                     - нужно обеспечить красивую анимацию скроллинга;
                     - в финале должна остаться только целевая вьюшка во вьюпорте + её "плечи" по сторонам.
                    Перед началом анимации нужно добавить в вьюлист целевую вьюшку и её "плечи". Вьюшке и её "плечам" соответствует некое 
                    множество номеров итемов (у исходной вьюшки это номера от this.state.numberOfFIRSTItemInVList до this.state.numberOfLASTItemInVList).
                    Возможны 3 ситуации:
                     - множества номеров вокруг исходной и целевой вьюшек пересекаются;
                     - множества находятся впритык - не пересекаются, но между крайними номерами одного и другого нет "свободных" номеров;
                     - множества не пересекаются, и между ними есть "свободные" номера.
                    Если между множествами есть "свободные" номера, мы не будем добавлять в вьюлист вьюшки для них. Мы добавим только целевую 
                    вьюшку и её "плечи", разместив крайнее "плечо" впритык к соответствующему "плечу" исходной вьюшки - как если бы множества номеров
                    тоже были впритык. Т.е., если мы хотим с исходного итема №20 переместиться на итем №6, то во вьюлисте перед началом скроллинга
                    окажутся вьюшки с номерами 2,3,4,5,6,7,8,9,10,16,17,18,19,20,21,22,23,24. Вьюшек для номеров 11-15 не будет.
                    Мы делаем так, чтобы не перегружать вьюлист (а то вдруг там будет 1000+ промежуточных номеров?) Анимация и так получится
                    красивой.
                    В случае пересечения множеств номеров нам нужно добавить в вьюлист лишь те вьюшки, чьи номера не являются общими для обоих множеств.
                    Кол-во этих общих номеров мы ниже вычисляем и храним в переменной overlap ("перехлёст").
                    */
                    let overlap = (this.state.numberOfLASTItemInVList+1) - newNumberOfFIRSTItemInVList;
                    /*
                    overlap д.б. равен 0, если наименьший номер из множества для целевой вьюшки будет идти сразу за наибольшим номером из множества
                    для исходной. Т.е., если (newNumberOfFIRSTItemInVList - this.state.numberOfLASTItemInVList) == 1. Отсюда и получаем
                    формулу для вычисления overlap.
                    */ 
                
                    if(overlap < 0) overlap = 0; //Реализация описанного выше принципа, что если между множествами номеров есть "свободные" номера,
                    //мы их не считаем.

                    for(let i=newNumberOfFIRSTItemInVList+overlap; i<=newNumberOfLASTItemInVList; i++) {
                        this.renderEdgeView(viewsList, this.RIGHT, i);
                    }
                
                    let scrollingItemsCount; 
                    if(newNumberOfFIRSTItemInVList <= this.state.numberOfLASTItemInVList+1) scrollingItemsCount = targetItemNumber - this.state.currentItemNumber;
                    else scrollingItemsCount = 2*this.VIEWS_N_IN_CURRVIEWSHOULDER+1;
                    viewsListJQueryElement.animate({left: "-="+(vListOffsetFromStablePos+scrollingItemsCount*this.state.scrollInterval)+"px"}, animationTime, function(){
                        let edgeViewsMakingInfoObj = {
                            viewsListDOMEl: viewsList,
                            viewsListJQueryEl: viewsListJQueryElement,
                            numberOfFIRSTItemInVList: newNumberOfFIRSTItemInVList,
                            currentItemNumber: targetItemNumber,
                            numberOfLASTItemInVList: newNumberOfLASTItemInVList                            
                        };
                        this.addingAndRemovingEdgeViewsAtFinals(edgeViewsMakingInfoObj);
                        
                        this.state.numberOfFIRSTItemInVList = newNumberOfFIRSTItemInVList;
                        this.state.numberOfLASTItemInVList = newNumberOfLASTItemInVList;
                        this.state.currentItemNumber = targetItemNumber;
                        this.state.swipeDirection = this.NODIRECTION;
                        this.state.scrollingDisabled = false;
                        
                        if(this.state.shouldAdaptPageToNewWindowSize) this.adaptPageToNewWindowSize();
                        
                        this.performPostScrollingCallback();
                
                    }.bind(this));                
                }
                else if(targetItemNumber < this.state.currentItemNumber) { //SCROLL LEFT
                    //См. описание того, что мы делаем, выше, в (**)
                    let overlap = newNumberOfLASTItemInVList - (this.state.numberOfFIRSTItemInVList-1);
                    //overlap - значит, "перехлёст" (см. выше, в (**)). 
                     /*
                    overlap д.б. равен 0, если набольший номер из множества для целевой вьюшки окажется непосредственно перед наименьшим номером
                    из множества для исходной. Т.е., если (this.state.numberOfFIRSTItemInVList - newNumberOfLASTItemInVList) == 1. Отсюда и получаем
                    формулу для вычисления overlap.
                    */                    
                
                    if(overlap < 0) overlap = 0; 

                    for(let i=newNumberOfLASTItemInVList-overlap; i>=newNumberOfFIRSTItemInVList; i--) {
                        this.renderEdgeView(viewsList, this.LEFT, i);
                    }
            
                    //При добавлении вьюшек слева вьюлист сдвигается вправо. Нужно вернуть его на место.
                    let viewsListLeft = viewsListJQueryElement.offset().left;
                    viewsListLeft -= (newNumberOfLASTItemInVList-overlap-newNumberOfFIRSTItemInVList+1)*this.state.scrollInterval;
                    viewsListJQueryElement.offset({left: viewsListLeft});       
            
                    let scrollingItemsCount; 
                    if(newNumberOfLASTItemInVList >= this.state.numberOfFIRSTItemInVList-1) scrollingItemsCount = this.state.currentItemNumber - targetItemNumber;
                    else scrollingItemsCount = 2*this.VIEWS_N_IN_CURRVIEWSHOULDER+1;

                    viewsListJQueryElement.animate({left: "+="+(scrollingItemsCount*this.state.scrollInterval-vListOffsetFromStablePos)+"px"}, animationTime, function(){
                        let edgeViewsMakingInfoObj = {
                            viewsListDOMEl: viewsList,
                            viewsListJQueryEl: viewsListJQueryElement,
                            numberOfFIRSTItemInVList: newNumberOfFIRSTItemInVList,
                            currentItemNumber: targetItemNumber,
                            numberOfLASTItemInVList: newNumberOfLASTItemInVList                            
                        };
                        this.addingAndRemovingEdgeViewsAtFinals(edgeViewsMakingInfoObj);

                        this.state.numberOfFIRSTItemInVList = newNumberOfFIRSTItemInVList;
                        this.state.numberOfLASTItemInVList = newNumberOfLASTItemInVList;
                        this.state.currentItemNumber = targetItemNumber;
                        this.state.swipeDirection = this.NODIRECTION;
                        this.state.scrollingDisabled = false;
                        
                        if(this.state.shouldAdaptPageToNewWindowSize) this.adaptPageToNewWindowSize();
                
                        this.performPostScrollingCallback();
                
                    }.bind(this));     
                }
        
            }
            else {//Ситуация targetItemNumber = this.state.currentItemNumber.
                //Эта ситуация возникает, если мы сдвинули вьюлист пальцем, но не настолько, чтобы произошла прокрутка,
                //а также если мы находимся в самом начале/конце Галереи и жмём стрелку перемотки в уже "в стену".

            
                vListOffsetFromViewport = viewportJQueryElement.offset().left-this.VIEW_IMGCONTAINER_MARGIN-viewsListJQueryElement.offset().left; //Эта величина всегда >=0

                vListOffsetFromStablePos = 0; 
                
                if(this.state.swipeDirection == this.LEFT) vListOffsetFromStablePos = Math.trunc(vListOffsetFromViewport/this.state.scrollInterval)*this.state.scrollInterval - vListOffsetFromViewport;
                else if(this.state.swipeDirection == this.RIGHT) vListOffsetFromStablePos = Math.trunc(vListOffsetFromViewport/this.state.scrollInterval + 1)*this.state.scrollInterval - vListOffsetFromViewport;

                let animationTime = this.SHORT_ANIMATION_TIME;

                if(vListOffsetFromStablePos > 0) { //Вьюлист нужно возвращать налево - т.е., аналог SCROLL RIGHT.
                    this.state.scrollingDisabled = true;
                    viewsListJQueryElement.animate({left: "-="+vListOffsetFromStablePos+"px"}, animationTime, function(){
                        let edgeViewsMakingInfoObj = {
                            viewsListDOMEl: viewsList,
                            viewsListJQueryEl: viewsListJQueryElement,
                            numberOfFIRSTItemInVList: newNumberOfFIRSTItemInVList,
                            currentItemNumber: targetItemNumber,
                            numberOfLASTItemInVList: newNumberOfLASTItemInVList                            
                        };
                        this.addingAndRemovingEdgeViewsAtFinals(edgeViewsMakingInfoObj);

                        this.state.numberOfFIRSTItemInVList = newNumberOfFIRSTItemInVList;
                        this.state.numberOfLASTItemInVList = newNumberOfLASTItemInVList;
                        this.state.currentItemNumber = targetItemNumber;
                        this.state.swipeDirection = this.NODIRECTION;
                        this.state.scrollingDisabled = false;  
                        
                        if(this.state.shouldAdaptPageToNewWindowSize) this.adaptPageToNewWindowSize();
                        
                        this.performPostScrollingCallback();
                    }.bind(this));
                }
                else if(vListOffsetFromStablePos < 0) { //Вьюлист нужно возвращать направо - т.е., аналог SCROLL LEFT.
                    this.state.scrollingDisabled = true;
                    viewsListJQueryElement.animate({left: "+="+(-vListOffsetFromStablePos)+"px"}, animationTime, function(){
                        let edgeViewsMakingInfoObj = {
                            viewsListDOMEl: viewsList,
                            viewsListJQueryEl: viewsListJQueryElement,
                            numberOfFIRSTItemInVList: newNumberOfFIRSTItemInVList,
                            currentItemNumber: targetItemNumber,
                            numberOfLASTItemInVList: newNumberOfLASTItemInVList                            
                        };
                        this.addingAndRemovingEdgeViewsAtFinals(edgeViewsMakingInfoObj);

                        this.state.numberOfFIRSTItemInVList = newNumberOfFIRSTItemInVList;
                        this.state.numberOfLASTItemInVList = newNumberOfLASTItemInVList;
                        this.state.currentItemNumber = targetItemNumber;
                        this.state.swipeDirection = this.NODIRECTION;
                        this.state.scrollingDisabled = false; 
                        
                        if(this.state.shouldAdaptPageToNewWindowSize) this.adaptPageToNewWindowSize();
                        
                        this.performPostScrollingCallback();
                    }.bind(this));                
                } 
            
            }
        }
    }
    
    performPostScrollingCallback() {
        if(this.state.postScrollingCallback) {
            this.state.postScrollingCallback();
            this.state.postScrollingCallback = null;
        }
    }

//???
    //Вообще надо бы сделать эту ф-ю асинхронной, чтоб после выполнения коллбека при рендеринге возвращала ещё промис.
    renderEdgeView(viewsList, edgeSide, edgeItemNumber, callback) {
        if(edgeSide!=this.RIGHT && edgeSide!=this.LEFT) return;
        let freeView = this.getFreeView(this.viewsArr);
        if(freeView) {
            this.modifyView(freeView, edgeItemNumber, this.state.fNamesArr);
            this.activateView(freeView);
            if(edgeSide==this.LEFT) viewsList.prepend(freeView);
            else if(edgeSide==this.RIGHT) viewsList.appendChild(freeView);
            if(callback) callback();
        }
        else {
            let newViewPlaceElement = document.createElement("div");
            newViewPlaceElement.className="ifv-view";
            newViewPlaceElement.setAttribute("name", edgeItemNumber);
            newViewPlaceElement.setAttribute("active", "1");
            if(edgeSide==this.LEFT) viewsList.prepend(newViewPlaceElement);
            else if(edgeSide==this.RIGHT) viewsList.appendChild(newViewPlaceElement);

            let allItemsCount = this.state.fNamesArr.length;
            let filename = this.state.fNamesArr[edgeItemNumber-1];
            let selected = this.state.itemsObject[filename].selected;
            let disabled = this.state.itemsObject[filename].disabled;

            let newViewInnerElsRefs = {
                imageContainerRef: React.createRef(),
                imageWrapperRef: React.createRef(),
                imageRef: React.createRef(),
                upperBlockRef: React.createRef(),
                itemNumberTextRef: React.createRef(),
                getLinkIconRef: React.createRef(),
                copyingUrlReportContainerRef: React.createRef(),
                inputForExecCommandContainerRef: React.createRef(),
                renamingIconRef: React.createRef(),
                removingIconRef: React.createRef(),
                lowerBlockRef: React.createRef(),
                fileNameTextRef: React.createRef(),
                checkBoxRef: React.createRef(),
            };

            let newViewCopyingUrlReportManager = createCopyingImgUrlReportManager(newViewInnerElsRefs.copyingUrlReportContainerRef, this.copyingUrlReportStyles);

            let newViewManager = {
                copyingUrlReportManager: newViewCopyingUrlReportManager,
                viewInnerElsRefs: newViewInnerElsRefs,
            };

            let newViewElementInfoForCreate = {
                itemNumber: edgeItemNumber,
                itemsCount: allItemsCount,
                itemImgFileName: filename,
                copyingUrlReportManager: newViewCopyingUrlReportManager,
                viewInnerElsRefs: newViewInnerElsRefs                
            };

            let newViewElement = this.createViewInnerHTML(newViewElementInfoForCreate);

            ReactDOM.render(newViewElement, newViewPlaceElement, function() {
                if(this.viewsArr.length < this.maxViewsNumberInVList) 
                    this.viewsArr.push(newViewPlaceElement);

                this.viewsInfoMap.set(newViewPlaceElement, newViewManager);

                newViewCopyingUrlReportManager.hideCopyReport();
            
                let chkbox = newViewInnerElsRefs.checkBoxRef.current;
                if(selected)
                    chkbox.setAttribute("checked", true); //Если отрендерить чекбокс с уже поставленной галочкой, то
                    //её потом невозможно будет снять.
                    
                this.setSelectedOrNotViewStyle({viewElement: newViewPlaceElement, selected: selected}); 
                if(disabled) this.setDisabledViewStyle(newViewPlaceElement); 

                if(callback) callback();
            }.bind(this));
        }     
    }

    addingAndRemovingEdgeViewsAtFinals(info, callback) {
    /*
        Примерный вид объекта-аргумента:
        info = {
            viewsListDOMEl: this.viewsListRef.current,
            viewsListJQueryEl: this.viewsListJQueryElement,
            numberOfFIRSTItemInVList: newNumberOfFIRSTItemInVList,
            currentItemNumber: this.state.currentItemNumber,
            numberOfLASTItemInVList: newNumberOfLASTItemInVList
        }
    */
        let viewsNodeList = info.viewsListDOMEl.querySelectorAll(".ifv-view");
           

        let indexInViewsNodeListOfCurrView;
        let targetNumber = info.currentItemNumber;
        if(info.oldCurrentItemNumber && info.oldCurrentItemNumber!=info.currentItemNumber)
            targetNumber = info.oldCurrentItemNumber;
        for(let i=0; i<viewsNodeList.length; i++) {
            let viewElement = viewsNodeList[i];
            let nmb = Number(viewElement.getAttribute("name"));
            if(nmb==targetNumber) { 
               indexInViewsNodeListOfCurrView = i; 
               break;
            }
        }
        
        //Число вьюшек, реально находящихся во вьюлисте слева от текущей.
        let leftPartOfRealVList_Length = indexInViewsNodeListOfCurrView;
        //Число вьюшек, реально находящихся во вьюлисте справа от текущей.
        let rightPartOfRealVList_Length = viewsNodeList.length-1-indexInViewsNodeListOfCurrView;

        //Число вьюшек, которое ДОЛЖНО находиться во вьюлисте слева от текущей согласно новым значениям номеров текущей и крайней левой вьюшек.
        let leftPartOfDesiredVList_Length = info.currentItemNumber - info.numberOfFIRSTItemInVList;
        //Число вьюшек, которое ДОЛЖНО находиться во вьюлисте справа от текущей согласно новым значениям номеров текущей и крайней правой вьюшек.
        let rightPartOfDesiredVList_Length = info.numberOfLASTItemInVList - info.currentItemNumber; 

        //Если слева и справа от текущей вьюшки уже находятся нужные кол-ва вьюшек, то ни добавлять, ни удалять ничего не надо - просто 
        //сразу вызываем коллбэк, если он есть.
        if(leftPartOfRealVList_Length==leftPartOfDesiredVList_Length && rightPartOfRealVList_Length==rightPartOfDesiredVList_Length) {
            if(callback) callback();
        }
        else {
            //Сначала нужно "обработать" левую часть (лишние вьюшки - удалить, недостающие - добавить), 
            //потом, аналогично, правую.
            
            //Левая часть: 
            if(leftPartOfDesiredVList_Length > leftPartOfRealVList_Length) {//Слева не хватает вьюшек, нужно добавить.
                for(let i=info.numberOfFIRSTItemInVList+(leftPartOfDesiredVList_Length-leftPartOfRealVList_Length)-1; i>=info.numberOfFIRSTItemInVList; i--) {
                    this.renderEdgeView(info.viewsListDOMEl, this.LEFT, i, function(){
                        //При добавлении вьюшек слева вьюлист сдвигается вправо. Нужно вернуть его на место.
                        let viewsListLeft = info.viewsListJQueryEl.offset().left;
                        viewsListLeft -= (leftPartOfDesiredVList_Length-leftPartOfRealVList_Length)*this.state.scrollInterval;
                        info.viewsListJQueryEl.offset({left: viewsListLeft}); 
                    
                        if(callback) callback();
                    }.bind(this));
                }
            }
            else if(leftPartOfDesiredVList_Length < leftPartOfRealVList_Length) { //Слева остались лишние вьюшки, их надо удалить.
                for(let i=0; i<(leftPartOfRealVList_Length-leftPartOfDesiredVList_Length); i++) {
                    this.deActivateView(info.viewsListDOMEl.removeChild(viewsNodeList[i]));
                }

                //При удалении вьюшек слева весь вьюлист смещается влево. Нужно вернуть его на место.
                let viewsListLeft = info.viewsListJQueryEl.offset().left;
                viewsListLeft += (leftPartOfRealVList_Length-leftPartOfDesiredVList_Length)*this.state.scrollInterval;
                info.viewsListJQueryEl.offset({left: viewsListLeft});  
            
                if(callback) callback();
            }
            //Правая часть: 
            if(rightPartOfDesiredVList_Length > rightPartOfRealVList_Length) {//Справа не хватает вьюшек, нужно добавить.
                for(let i=info.numberOfLASTItemInVList-(rightPartOfDesiredVList_Length-rightPartOfRealVList_Length)+1; i<=info.numberOfLASTItemInVList; i++) {
                    this.renderEdgeView(info.viewsListDOMEl, this.RIGHT, i, callback);
                } 
                //Т.к. при добавлении вьюшек справа вьюлист никуда не двигается, возвращать его тоже никуда не надо.
                
            }
            else if(rightPartOfDesiredVList_Length < rightPartOfRealVList_Length) {//Справа остались лишние вьюшки, их надо удалить.
                for(let i=viewsNodeList.length-1; i>viewsNodeList.length-1-(rightPartOfRealVList_Length-rightPartOfDesiredVList_Length); i--) {
                    this.deActivateView(info.viewsListDOMEl.removeChild(viewsNodeList[i])); 
                }
                //Т.к. при удалении вьюшек справа вьюлист никуда не двигается, возвращать его тоже никуда не надо.
    
                if(callback) callback();
            }
        }
    }



    scrollRight(event) {
        this.universalScrollFunc(this.state.currentItemNumber+1);
    }


    scrollLeft(event) {
        this.universalScrollFunc(this.state.currentItemNumber-1);
    }



    exitFullView(event) {
        this.props.uniTool(DO.exitImgFullView);
    }
   
    openConfirmSingleFileRemovingPopup(event) {
        if(!event.target.getAttribute("disabled")) {
            let removingFileName = this.state.fNamesArr[this.state.currentItemNumber-1];
            let removingItemsArr = [removingFileName];
            this.props.uniTool(DO.confirmFilesRemoving, removingItemsArr);
        }
    }
    
    openConfRemovingOfSelItemsPopup() {
        this.props.uniTool(DO.confirmFilesRemoving, Object.keys(this.state.selectedItemsObject));
    }
   
    downloadSelectedItems() {
        this.props.uniTool(DO.downloadFiles, Object.keys(this.state.selectedItemsObject));   
    }
   
    render() {
        let content = <React.Fragment></React.Fragment>;


        if(this.state.fNamesArr.length>0 && this.state.currentItemNumber >= 1) {
            //Для краткости:
            let itemNumber = this.state.currentItemNumber;
            let fNamesArr = this.state.fNamesArr;

            let viewsArr = [];

            if(itemNumber - this.VIEWS_N_IN_CURRVIEWSHOULDER<=1) this.state.numberOfFIRSTItemInVList = 1;
            else this.state.numberOfFIRSTItemInVList = itemNumber - this.VIEWS_N_IN_CURRVIEWSHOULDER;
            
            if(itemNumber+this.VIEWS_N_IN_CURRVIEWSHOULDER>=fNamesArr.length) this.state.numberOfLASTItemInVList = fNamesArr.length;
            else this.state.numberOfLASTItemInVList = itemNumber + this.VIEWS_N_IN_CURRVIEWSHOULDER;
            
            //Отступ левого края вьюлиста от левого края вьюпорта, в пикселях.
            let leftViewsListOffset = -(itemNumber-this.state.numberOfFIRSTItemInVList)*(this.state.styles['imgFullViewViewContainerWidth']+2*this.VIEW_IMGCONTAINER_MARGIN) - this.VIEW_IMGCONTAINER_MARGIN; 
            
            let viewportStyle = {
                width: this.state.styles['imgFullViewViewportWidth'] + "px",
                height: this.state.styles['imgFullViewViewportHeight'] + "px"
            }
                
            let viewslistStyle = {
                left: leftViewsListOffset + "px",
                height: this.state.styles['imgFullViewViewsListHeight'] + "px",
                transform: "translate3d(0px, 0px, 0px)",
            }

//=================================================
//Рендеринг стартового набора вьюшек.
            for(let i=this.state.numberOfFIRSTItemInVList; i<=this.state.numberOfLASTItemInVList; i++) {
                let newViewInnerElsRefs = {
                    imageContainerRef: React.createRef(),
                    imageWrapperRef: React.createRef(),
                    imageRef: React.createRef(),
                    upperBlockRef: React.createRef(),
                    itemNumberTextRef: React.createRef(),
                    getLinkIconRef: React.createRef(),
                    copyingUrlReportContainerRef: React.createRef(),
                    inputForExecCommandContainerRef: React.createRef(),
                    renamingIconRef: React.createRef(),
                    removingIconRef: React.createRef(),
                    lowerBlockRef: React.createRef(),
                    fileNameTextRef: React.createRef(),
                    checkBoxRef: React.createRef(),
                };

                let newViewCopyingUrlReportManager = createCopyingImgUrlReportManager(newViewInnerElsRefs.copyingUrlReportContainerRef, this.copyingUrlReportStyles);

                let newViewManager = {
                    copyingUrlReportManager: newViewCopyingUrlReportManager,
                    viewInnerElsRefs: newViewInnerElsRefs,
                };

                this.initiallyRenderedViewsInfoArr.push(newViewManager);

                let newViewElementInfoForCreate = {
                    itemNumber: i,
                    itemsCount: fNamesArr.length,
                    itemImgFileName: fNamesArr[i-1],
                    copyingUrlReportManager: newViewCopyingUrlReportManager,
                    viewInnerElsRefs: newViewInnerElsRefs                
                };                

                let view = this.createViewInnerHTML(newViewElementInfoForCreate);

                viewsArr.push(<div name={i} active="1" className="ifv-view">{view}</div>);
            }

            let viewsList = (
                <div ref={this.viewsListRef} style={viewslistStyle} className="ifv-viewslist" onTouchStart={this.onSwipeStart.bind(this)} onTouchMove={this.onSwipeAction.bind(this)} onTouchEnd={this.onSwipeEnd.bind(this)}>
                    {viewsArr}
                </div>);
//=================================================


            let scrollTo_Button = <button tabIndex="-1" style={{background: "radial-gradient(80% 80%, rgb(130, 144, 255), rgb(130, 94, 190))", color: "white"}} onClick={this.openScrToPopup} className="im__button">Scroll to Item...</button>;
            let buttonsArr = [scrollTo_Button];

            let iMBBInfoObject = {
                openFullItemsListPopupFunc: this.openFullItemsListPopup.bind(this),
                openSelItemsListPopupFunc: this.openSelectedItemsListPopup.bind(this),
                removeSelItemsFunc: this.openConfRemovingOfSelItemsPopup.bind(this),
                downloadSelItemsFunc: this.downloadSelectedItems.bind(this),
                optionalButtonsReactElsArr: buttonsArr
            };

            //Зачем дивам-контейнерам попапов имена? - Чтобы в средствах разработки браузера их можно было 
            //различать - у них же нет классов.
            content = (
            <div className="ifv-general-container" style={{zIndex: Number(this.props.zindex)}} >
                <div ref={this.popupsContRef} style={{zIndex: 3}}>
                    <div name="scrollToPopupContainer" ref={this.scrollToPopupContainerRef} style={{zIndex: 1}}></div>
                    <div name="FILPopupContainer" style={{zIndex: 2}} ref={this.FILPopupContainerRef}></div>
                    <div name="SILPopupContainer" style={{zIndex: 3}} ref={this.SILPopupContainerRef}></div>
                  </div>        

                <div style={{zIndex: 2}} className="ifv-exit-block">
                    <div className="ifv-exit-block__exit-icon-container">
                        <img style={{zIndex: 1}} className="ifv-exit-block__exit-icon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-lighted.png"}/>
                        <img style={{zIndex: 2}} className="ifv-exit-block__exit-icon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-for-exit.png"} onClick={this.exitFullView.bind(this)}/>
                    </div>
                </div>

                <ItemsManagerButtonsBlock zIndex={2} ref={this.iMBBRef} infoObject={iMBBInfoObject}/>

                <div style={{zIndex: 2}} className="ifv-viewport-block">
                    <div className="ifv-viewport-block__scroll-tools-cont">
                        <div className="ifv-viewport-block__scroll-arrow-cont">
                            <img style={{zIndex: 1}} className="ifv-viewport-block__scroll-arrow-img" src={NAMES_PATHS.designElementsUrlPath + "Arrow-items-scroll-left-lighted.png"}/>
                            <img style={{zIndex: 2}} className="ifv-viewport-block__scroll-arrow-img" src={NAMES_PATHS.designElementsUrlPath + "Arrow-items-scroll-left.png"} onClick={this.scrollLeft.bind(this)}/>
                        </div>
                    </div>

                    <div ref={this.viewportRef} style={viewportStyle} className="ifv-viewport">
                        {viewsList}
                    </div>

                    <div className="ifv-viewport-block__scroll-tools-cont">
                        <div className="ifv-viewport-block__scroll-arrow-cont">
                            <img style={{zIndex: 1}} className="ifv-viewport-block__scroll-arrow-img" src={NAMES_PATHS.designElementsUrlPath + "Arrow-items-scroll-right-lighted.png"}/>
                            <img style={{zIndex: 2}} className="ifv-viewport-block__scroll-arrow-img" src={NAMES_PATHS.designElementsUrlPath + "Arrow-items-scroll-right.png"} onClick={this.scrollRight.bind(this)}/>
                        </div>
                    </div>
            
                </div>
            </div>);
        }
        return content;
    }
}