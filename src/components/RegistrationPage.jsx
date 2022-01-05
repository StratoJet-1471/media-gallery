import React from "react";
import ReactDOM from "react-dom";

import { limits as LIMITS,
    namesAndPaths as NAMES_PATHS,
    internalAPI_commandCodes as DO, 
    internalAPI_specialUserIDValues as SPECIAL_UID} from "../ControlsAndAPI.js";

import LogoBlock from "./LogoBlock.jsx";
import SignInBlock from "./SignInBlock.jsx";

import "../css/styles_all.css";

/*
Принимаемые пропсы:
uniTool: <object Function>, //Функция для передачи команд родительскому элементу.
regProcessIsActive: <boolean>,
infoObject: {
    adaptParams: { //Это тот же объект, который принимает <EntrancePage/>
        logoBlockWidth: <number>,
        logoBlockHeight: <number>,               
        logoBlockMarginTop: <number>,
        logoBlockMarginBottom: <number>,
        logoBlockMarginRight: <number>,

        logoImgHeight: <number>,
            
        logoAboutAncorFontSize: <number>,
            
        logoNameImgWidth: <number>,
        logoNameImgHeight: <number>,

        sInBlockWidth: <number>,
        sInBlockHeight: <number>,
        sInBlockMarginTop: <number>,
        sInBlockMarginBottom: <number>,
        sInBlockMarginLeft: <number>,

        sInBlockTextInputsWidth: <number>,
        sInBlockTextInputsHeight: <number>,
        sInBlockTextInputsMarginLeft: <number>,
        sInBlockTextInputsMarginRight: <number>,

        sInBlockAncorMarginLeft: <number>,
        sInBlockAncorMarginRight: <number>,
        sInBlockAncorFontSize: <number>,

        epCentralImgWrapperWidth: <number>,
        epCentralImgWrapperHeight: <number>,

        epCentralImgWidth: <number>,
        epCentralImgHeight: <number>,
    },
    userInfoObject: {
        userID: <number>,
        login: <string>,
        email: <string>,
        name: <string>,
        userRegDate: <object Date>,
    }
}
*/
export default class RegistrationPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            styles: {
                /**
                 * @type: {number}
                */
                logoBlockWidth: this.props.infoObject.adaptParams['logoBlockWidth'],
                /**
                 * @type: {number}
                */
                logoBlockHeight: this.props.infoObject.adaptParams['logoBlockHeight'],
                /**
                 * @type: {number}
                */
                logoBlockMarginTop: this.props.infoObject.adaptParams['logoBlockMarginTop'],
                /**
                 * @type: {number}
                */
                logoBlockMarginBottom: this.props.infoObject.adaptParams['logoBlockMarginBottom'],
                /**
                 * @type: {number}
                */
                logoBlockMarginRight: this.props.infoObject.adaptParams['logoBlockMarginRight'],

                /**
                 * @type: {number}
                */
                logoImgHeight: this.props.infoObject.adaptParams['logoImgHeight'],
                
                /**
                 * @type: {number}
                */
                logoAboutAncorFontSize: this.props.infoObject.adaptParams['logoAboutAncorFontSize'],

                /**
                 * @type: {number}
                */
                logoNameImgWidth: this.props.infoObject.adaptParams['logoNameImgWidth'],
                /**
                 * @type: {number}
                */
                logoNameImgHeight: this.props.infoObject.adaptParams['logoNameImgHeight'],

                /**
                 * @type: {number}
                */
                sInBlockWidth: this.props.infoObject.adaptParams['sInBlockWidth'],
                /**
                 * @type: {number}
                */
                sInBlockHeight: this.props.infoObject.adaptParams['sInBlockHeight'],
                /**
                 * @type: {number}
                */
                sInBlockMarginTop: this.props.infoObject.adaptParams['sInBlockMarginTop'],
                /**
                 * @type: {number}
                */
                sInBlockMarginBottom: this.props.infoObject.adaptParams['sInBlockMarginBottom'],
                /**
                 * @type: {number}
                */
                sInBlockMarginLeft: this.props.infoObject.adaptParams['sInBlockMarginLeft'],

                /**
                 * @type: {number}
                */
                sInBlockTextInputsWidth: this.props.infoObject.adaptParams['sInBlockTextInputsWidth'],
                /**
                 * @type: {number}
                */
                sInBlockTextInputsHeight: this.props.infoObject.adaptParams['sInBlockTextInputsHeight'],
                /**
                 * @type: {number}
                */
                sInBlockTextInputsMarginLeft: this.props.infoObject.adaptParams['sInBlockTextInputsMarginLeft'],
                /**
                 * @type: {number}
                */
                sInBlockTextInputsMarginRight: this.props.infoObject.adaptParams['sInBlockTextInputsMarginRight'],

                /**
                 * @type: {number}
                */
                sInBlockAncorMarginLeft: this.props.infoObject.adaptParams['sInBlockAncorMarginLeft'],
                /**
                 * @type: {number}
                */
                sInBlockAncorMarginRight: this.props.infoObject.adaptParams['sInBlockAncorMarginRight'],
                /**
                 * @type: {number}
                */
                sInBlockAncorFontSize: this.props.infoObject.adaptParams['sInBlockAncorFontSize'], 

                /**
                 * @type: {string}
                */
                epCentralImgWrapperWidth: this.props.infoObject.adaptParams['epCentralImgWrapperWidth'] + "px",
                /**
                 * @type: {string}
                */
                epCentralImgWrapperHeight: this.props.infoObject.adaptParams['epCentralImgWrapperHeight'] + "px",
                
                /**
                 * @type: {string}
                */
                epCentralImgWidth: this.props.infoObject.adaptParams['epCentralImgWidth'] + "px",
                /**
                 * @type: {string}
                */
                epCentralImgHeight: this.props.infoObject.adaptParams['epCentralImgHeight'] + "px",
            
            },

            userInfoObject: {
                /**
                 * @type: {number}
                */
                userID: this.props.infoObject.userInfoObject.userID,  
                /**
                 * @type: {string}
                */
                login: this.props.infoObject.userInfoObject.login,
                /**
                 * @type: {string}
                */
                email: this.props.infoObject.userInfoObject.email,
                /**
                 * @type: {string}
                */
                name: this.props.infoObject.userInfoObject.name,
                /**
                 * @type: {object Date}
                */
                userRegDate: this.props.infoObject.userInfoObject.userRegDate,
            },
            
            wrongRegFormLoginValue: false,
            wrongRegFormPasswordValue: false,
            wrongRegFormRepeatPValue: false,
            wrongRegFormUNameValue: false,
            wrongRegFormEmailValue: false,
            
            regProcessIsActive: false,

        };

        if(!this.state.userInfoObject.userID)  this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;


        this.openRulesInfoPp = this.openRulesInfoPopup.bind(this);
        
        //РЕФЫ:
        this.regFormRef = React.createRef();
        
        this.regFormLoginRef = React.createRef();
        this.regFormLoginRightBlockRef = React.createRef();
        this.regFormLoginWrongValIconRef = React.createRef();
        this.regFormLoginQuestIconRef = React.createRef();

        this.regFormPswRef = React.createRef();
        this.regFormPswRightBlockRef = React.createRef();
        this.regFormPswWrongValIconRef = React.createRef();
        this.regFormPswQuestIconRef = React.createRef();
        
        this.regFormRepeatPswRef = React.createRef();
        this.regFormRepeatPswRBlockRef = React.createRef();
        this.regFormRepeatPswWrongValIconRef = React.createRef();
        
        this.regFormUNameRef = React.createRef();
        this.regFormUNameRightBlockRef = React.createRef();
        this.regFormUNameWrongValIconRef = React.createRef();
        this.regFormUNameQuestIconRef = React.createRef();
        
        this.regFormEmailRef = React.createRef();
        this.regFormEmailRightBlockRef = React.createRef();
        this.regFormEmailWrongValIconRef = React.createRef();
        this.regFormEmailQuestIconRef = React.createRef();
        
        this.regFormSubmitRef = React.createRef();
        
        this.popupsContainerRef = React.createRef();
        
        this.rulesInfoPopupRef = React.createRef();
        this.rulesInfoPopupClosingButtonRef = React.createRef();
    }

    get FLAG_REGFORM_INPUT_IS_LOGIN() { return 1; }
    get FLAG_REGFORM_INPUT_IS_PSW() { return 2; }
    get FLAG_REGFORM_INPUT_IS_REPEATPSW() { return 3; }
    get FLAG_REGFORM_INPUT_IS_UNAME() { return 4; }
    get FLAG_REGFORM_INPUT_IS_EMAIL() { return 5; }

    get REGFORM_INPUT_BGCOLOR() { return "rgb(135, 206, 250)"; }


    createRFInfoPopupContent() {
        //Пришлось вынести это в отдельную переменную, т.к. компилятор неадекватно воспринимал фрагмент "{, }".
        const emailValidCharsStr = "A-Z, a-z, 0-9, _, -, &, @, №, !, ~, +, {, }, $, ?, ^, ., *.";
        return (
            <div ref={this.rulesInfoPopupRef} className="popup-universal-bg" style={{zIndex: "inherit"}}>
                <div className="popup-regrules">
                    <div className="popup-regrules__point-title">Логин:</div>
                    <div className="popup-regrules__point-textblock">
                        <ul>
                            <li className="popup-regrules__point-text">Длина - от 6 до 20 символов.</li>
                            <li className="popup-regrules__point-text">Разрешённые символы: A-Z, a-z, 0-9, _, -.</li>
                        </ul>
                    </div>

                    <div className="popup-regrules__point-title">Пароль:</div>
                    <div className="popup-regrules__point-textblock">
                        <ul>
                            <li className="popup-regrules__point-text">Длина - от 8 до 20 символов.</li>
                            <li className="popup-regrules__point-text">Разрешённые символы: A-Z, a-z, 0-9.</li>
                        </ul>
                    </div>

                    <div className="popup-regrules__point-title">Имя пользователя:</div>
                    <div className="popup-regrules__point-textblock">
                        <ul>
                            <li className="popup-regrules__point-text">Длина - от 6 до 8 символов (без концевых<br/> пробелов).</li>
                            <li className="popup-regrules__point-text">Концевые пробелы обрезаются.</li>
                            <li className="popup-regrules__point-text">Разрешённые символы: А-Я, а-я, A-Z, a-z,<br/> 0-9, _, -, пробел.</li>
                        </ul>
                    </div>

                    <div className="popup-regrules__point-title">Адрес email:</div>
                    <div className="popup-regrules__point-textblock">
                        <ul>
                            <li className="popup-regrules__point-text">Длина - до 256 символов.</li>
                            <li className="popup-regrules__point-text">Разрешённые символы: <br/>{emailValidCharsStr}</li>
                        </ul>
                    </div>
                    
                    <div className="popup-universal-centering-container">
                        <button ref={this.rulesInfoPopupClosingButtonRef} className="popup-universal-button" onClick={this.closeRulesInfoPopup.bind(this)}>OK</button>
                    </div>
                </div>
            </div>
            );
    }
    
    openRulesInfoPopup(event) {
        if(!this.rulesInfoPopupRef.current) {
           const divForReactRendering = document.createElement("div");
           
           ReactDOM.render(this.createRFInfoPopupContent(), divForReactRendering);
           
           this.popupsContainerRef.current.appendChild(this.rulesInfoPopupRef.current);
           this.rulesInfoPopupClosingButtonRef.current.focus();
        }
        else {

           this.popupsContainerRef.current.appendChild(this.rulesInfoPopupRef.current);
           this.rulesInfoPopupClosingButtonRef.current.focus();
        }
    }
    
    closeRulesInfoPopup(event) {
        if(this.rulesInfoPopupRef.current.parentNode==this.popupsContainerRef.current) this.popupsContainerRef.current.removeChild(this.rulesInfoPopupRef.current);
    }

    componentDidMount() {
        //Эта ф-я срабатывает в том числе и тогда, когда мы приходим на страницу, нажав "Назад/Вперёд" в браузере.

        //После отрисовки страницы делаем невидимыми красные крестики-индикаторы неправильных значений в текстовых полях.
        //Они будут показываться только когда нужно.
        this.regFormLoginRightBlockRef.current.removeChild(this.regFormLoginWrongValIconRef.current);
        this.regFormPswRightBlockRef.current.removeChild(this.regFormPswWrongValIconRef.current);
        this.regFormRepeatPswRBlockRef.current.removeChild(this.regFormRepeatPswWrongValIconRef.current);
        this.regFormUNameRightBlockRef.current.removeChild(this.regFormUNameWrongValIconRef.current);
        this.regFormEmailRightBlockRef.current.removeChild(this.regFormEmailWrongValIconRef.current);

        if(this.props.regProcessIsActive) this.state.regProcessIsActive = true;
        else this.state.regProcessIsActive = false;
        
        if(this.state.regProcessIsActive)
            this.regFormSubmitRef.current.setAttribute("disabled", true);
        else this.regFormSubmitRef.current.removeAttribute("disabled");
        
    }

    shouldComponentUpdate(newProps) {
        let shouldUpdate = false;
        const comparingValueNumeric = this.makeNumberFromPxSize(this.state.styles.epCentralImgWrapperWidth);
        
        if(this.state.regProcessIsActive != newProps.regProcessIsActive) {
            if(newProps.regProcessIsActive)
                this.regFormSubmitRef.current.setAttribute("disabled", true);
            else this.regFormSubmitRef.current.removeAttribute("disabled");
            
            this.state.regProcessIsActive = newProps.regProcessIsActive;
        }

        if(comparingValueNumeric != newProps.infoObject.adaptParams['epCentralImgWrapperWidth']) {//Другие параметры можно и не сравнивать - 
            //если эти не равны, значит, размер окна браузера изменился, и элемент нужно перерисовывать.
            this.state.styles.logoBlockWidth = newProps.infoObject.adaptParams['logoBlockWidth'];
            this.state.styles.logoBlockHeight = newProps.infoObject.adaptParams['logoBlockHeight'];
            this.state.styles.logoBlockMarginTop = newProps.infoObject.adaptParams['logoBlockMarginTop'];
            this.state.styles.logoBlockMarginBottom = newProps.infoObject.adaptParams['logoBlockMarginBottom'];
            this.state.styles.logoBlockMarginRight = newProps.infoObject.adaptParams['logoBlockMarginRight'];
    
            this.state.styles.logoImgHeight = newProps.infoObject.adaptParams['logoImgHeight'];

            this.state.styles.logoAboutAncorFontSize = newProps.infoObject.adaptParams['logoAboutAncorFontSize'];


            this.state.styles.logoNameImgWidth = newProps.infoObject.adaptParams['logoNameImgWidth'];
            this.state.styles.logoNameImgHeight = newProps.infoObject.adaptParams['logoNameImgHeight'];


            this.state.styles.sInBlockWidth = newProps.infoObject.adaptParams['sInBlockWidth'];
            this.state.styles.sInBlockHeight = newProps.infoObject.adaptParams['sInBlockHeight'];
            this.state.styles.sInBlockMarginTop = newProps.infoObject.adaptParams['sInBlockMarginTop'];
            this.state.styles.sInBlockMarginBottom = newProps.infoObject.adaptParams['sInBlockMarginBottom'];
            this.state.styles.sInBlockMarginLeft = newProps.infoObject.adaptParams['sInBlockMarginLeft'];

            this.state.styles.sInBlockTextInputsWidth = newProps.infoObject.adaptParams['sInBlockTextInputsWidth'];
            this.state.styles.sInBlockTextInputsHeight = newProps.infoObject.adaptParams['sInBlockTextInputsHeight'];
            this.state.styles.sInBlockTextInputsMarginLeft = newProps.infoObject.adaptParams['sInBlockTextInputsMarginLeft'];
            this.state.styles.sInBlockTextInputsMarginRight = newProps.infoObject.adaptParams['sInBlockTextInputsMarginRight'];

            this.state.styles.sInBlockAncorMarginLeft = newProps.infoObject.adaptParams['sInBlockAncorMarginLeft'];
            this.state.styles.sInBlockAncorMarginRight = newProps.infoObject.adaptParams['sInBlockAncorMarginRight'];
            this.state.styles.sInBlockAncorFontSize = newProps.infoObject.adaptParams['sInBlockAncorFontSize'];


            this.state.styles.epCentralImgWrapperWidth = newProps.infoObject.adaptParams['epCentralImgWrapperWidth'] + "px";
            this.state.styles.epCentralImgWrapperHeight = newProps.infoObject.adaptParams['epCentralImgWrapperHeight'] + "px";

            this.state.styles.epCentralImgWidth = newProps.infoObject.adaptParams['epCentralImgWidth'] + "px";
            this.state.styles.epCentralImgHeight = newProps.infoObject.adaptParams['epCentralImgHeight'] + "px";


            shouldUpdate = true;
        }
        
        if(this.state.userInfoObject.userID!=newProps.infoObject.userInfoObject.userID) {
            this.state.userInfoObject.userID = newProps.infoObject.userInfoObject.userID;
            this.state.userInfoObject.login = newProps.infoObject.userInfoObject.login;
            this.state.userInfoObject.email = newProps.infoObject.userInfoObject.email;
            this.state.userInfoObject.name = newProps.infoObject.userInfoObject.name;
            this.state.userInfoObject.userRegDate = newProps.infoObject.userInfoObject.userRegDate;
            
            shouldUpdate = true;
        }
        
        return shouldUpdate;
    }

    makeNumberFromPxSize(pxSize) {//Обрезает "px" в размере и превращает его в число.
        return Number(pxSize.substr(0, pxSize.length-2));
    }

    hideWrongInputValIcon(inputFlag) {
        if(inputFlag==this.FLAG_REGFORM_INPUT_IS_LOGIN) {
            if(this.regFormLoginWrongValIconRef.current.parentNode==this.regFormLoginRightBlockRef.current)
                this.regFormLoginRightBlockRef.current.removeChild(this.regFormLoginWrongValIconRef.current);
        }
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_PSW) {
            if(this.regFormPswWrongValIconRef.current.parentNode==this.regFormPswRightBlockRef.current)
                this.regFormPswRightBlockRef.current.removeChild(this.regFormPswWrongValIconRef.current);
        }
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_REPEATPSW) {
            if(this.regFormRepeatPswWrongValIconRef.current.parentNode==this.regFormRepeatPswRBlockRef.current)
                this.regFormRepeatPswRBlockRef.current.removeChild(this.regFormRepeatPswWrongValIconRef.current);
        }
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_UNAME) {
            if(this.regFormUNameWrongValIconRef.current.parentNode==this.regFormUNameRightBlockRef.current)
                this.regFormUNameRightBlockRef.current.removeChild(this.regFormUNameWrongValIconRef.current);
        }
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_EMAIL) {
            if(this.regFormEmailWrongValIconRef.current.parentNode==this.regFormEmailRightBlockRef.current)
                this.regFormEmailRightBlockRef.current.removeChild(this.regFormEmailWrongValIconRef.current);
        }
    }
    
    showWrongInputValIcon(inputFlag) {
        if(inputFlag==this.FLAG_REGFORM_INPUT_IS_LOGIN) {
            if(!this.regFormLoginWrongValIconRef.current.parentNode)
                //Вставляем иконку-крестик перед значком вопроса.
                this.regFormLoginQuestIconRef.current.before(this.regFormLoginWrongValIconRef.current);
        }
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_PSW) {
            if(!this.regFormPswWrongValIconRef.current.parentNode)
                //Вставляем иконку-крестик перед значком вопроса.
                this.regFormPswQuestIconRef.current.before(this.regFormPswWrongValIconRef.current);
        }
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_REPEATPSW) {
            if(!this.regFormRepeatPswWrongValIconRef.current.parentNode)
                this.regFormRepeatPswRBlockRef.current.appendChild(this.regFormRepeatPswWrongValIconRef.current);
        } 
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_UNAME) {
            if(!this.regFormUNameWrongValIconRef.current.parentNode)
                //Вставляем иконку-крестик перед значком вопроса.
                this.regFormUNameQuestIconRef.current.before(this.regFormUNameWrongValIconRef.current);
        }
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_EMAIL) {
            if(!this.regFormEmailWrongValIconRef.current.parentNode)
                //Вставляем иконку-крестик перед значком вопроса.
                this.regFormEmailQuestIconRef.current.before(this.regFormEmailWrongValIconRef.current);
        }
    }

    createInputQuestionIconTitle(inputFlag) {
        if(inputFlag==this.FLAG_REGFORM_INPUT_IS_LOGIN)
            return "Длина логина: от " + LIMITS.loginMinLength + " до " + LIMITS.loginMaxLength + " символов.\nРазрешённые символы: A-Z, a-z, 0-9, _, -";
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_PSW)
            return "Длина пароля: от " + LIMITS.passwordMinLength + " до " + LIMITS.passwordMaxLength + " символов.\nРазрешённые символы: A-Z, a-z, 0-9";
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_UNAME)
            return "Длина имени пользователя: от " + LIMITS.userNameMinLength + " до " + LIMITS.userNameMaxLength + " символов (без концевых пробелов).\nКонцевые пробелы обрезаются.\nРазрешённые символы: А-Я, а-я, A-Z, a-z, 0-9, _, -, пробел.";
        else if(inputFlag==this.FLAG_REGFORM_INPUT_IS_EMAIL)
            return "Длина email: до " + LIMITS.emailMaxLength + " символов. Разрешённые символы: \nA-Z, a-z, 0-9, _, -, &, @, №, !, ~, +, {, }, $, ?, ^, ., *";
    }

    //Проверяет вводимые в форму регистрации символы на допустимость, а также следит за длиной введённого.
    checkRegFormInputValue(event) {
        const targetDOMElement = event.target;
        if(targetDOMElement==this.regFormLoginRef.current) {
            if(targetDOMElement.value.match(LIMITS.loginValidationRegExp)) {
                targetDOMElement.value = targetDOMElement.value.replace(LIMITS.loginValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            if(targetDOMElement.value.length > LIMITS.loginMaxLength) targetDOMElement.value = targetDOMElement.value.slice(0, LIMITS.loginMaxLength);

            if(this.state.wrongRegFormLoginValue) {
                this.hideWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_LOGIN);
                this.state.wrongRegFormLoginValue = false;
            }
        }
        else if(targetDOMElement==this.regFormPswRef.current) {
            if(targetDOMElement.value.match(LIMITS.passwordValidationRegExp)) {
                targetDOMElement.value = targetDOMElement.value.replace(LIMITS.passwordValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            if(targetDOMElement.value.length > LIMITS.passwordMaxLength) targetDOMElement.value = targetDOMElement.value.slice(0, LIMITS.passwordMaxLength);
            
            if(this.state.wrongRegFormPasswordValue) {
                this.hideWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_PSW);
                this.state.wrongRegFormPasswordValue = false;
            }
        }
        else if(targetDOMElement==this.regFormRepeatPswRef.current) {
            if(targetDOMElement.value.match(LIMITS.passwordValidationRegExp)) {
                targetDOMElement.value = targetDOMElement.value.replace(LIMITS.passwordValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            if(targetDOMElement.value.length > LIMITS.passwordMaxLength) targetDOMElement.value = targetDOMElement.value.slice(0, LIMITS.passwordMaxLength);
            
            if(this.state.wrongRegFormRepeatPValue) {
                this.hideWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_REPEATPSW);
                this.state.wrongRegFormRepeatPValue = false;
            }
        }
        else if(targetDOMElement==this.regFormUNameRef.current) {
            if(targetDOMElement.value.match(LIMITS.userNameValidationRegExp)) {
                targetDOMElement.value = targetDOMElement.value.replace(LIMITS.userNameValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            
            if(targetDOMElement.value.length > LIMITS.userNameMaxLength)
                targetDOMElement.value = targetDOMElement.value.slice(0, LIMITS.userNameMaxLength);

            if(this.state.wrongRegFormUNameValue) {
                this.hideWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_UNAME);
                this.state.wrongRegFormUNameValue = false;
            }
        }
        else if(targetDOMElement==this.regFormEmailRef.current) {
            if(targetDOMElement.value.match(LIMITS.emailValidationRegExp)) {
                targetDOMElement.value = targetDOMElement.value.replace(LIMITS.emailValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            if(targetDOMElement.value.length > LIMITS.emailMaxLength)
                targetDOMElement.value = targetDOMElement.value.slice(0, LIMITS.emailMaxLength);

            if(this.state.wrongRegFormEmailValue) {
                this.hideWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_EMAIL);
                this.state.wrongRegFormEmailValue = false;
            }
        }

    }
    
    regFormSubmitByEnter(event) {
        if(event.keyCode==13) {
            event.preventDefault();
            if(this.checkRegFormData()) this.sendRegFormData();
        }
    }

    regFormSubmit(event) {
        event.preventDefault();
        if(this.checkRegFormData()) this.sendRegFormData();
    }

    //Проверяет данные формы регистрации перед отправкой и решает, можно ли их отправлять.
    checkRegFormData() {
        let dataIsCorrect = true;

        if(this.regFormLoginRef.current.value.length < LIMITS.loginMinLength || 
        this.regFormLoginRef.current.value.length > LIMITS.loginMaxLength) {
            this.state.wrongRegFormLoginValue = true;
            this.showWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_LOGIN);
            dataIsCorrect = false;            
        }

        if(this.regFormPswRef.current.value.length < LIMITS.passwordMinLength || 
        this.regFormPswRef.current.value.length > LIMITS.passwordMaxLength) {
            this.state.wrongRegFormPasswordValue = true;
            this.showWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_PSW);
            dataIsCorrect = false;            
        }

        if(this.regFormRepeatPswRef.current.value.length < LIMITS.passwordMinLength || 
        this.regFormRepeatPswRef.current.value.length > LIMITS.passwordMaxLength ||
        this.regFormRepeatPswRef.current.value != this.regFormPswRef.current.value) {
            this.state.wrongRegFormRepeatPValue = true;
            this.showWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_REPEATPSW);
            dataIsCorrect = false;            
        }
        
        this.regFormUNameRef.current.value = this.regFormUNameRef.current.value.trim();
        if(this.regFormUNameRef.current.value.length < LIMITS.userNameMinLength || 
        this.regFormUNameRef.current.value.length > LIMITS.userNameMaxLength) {
            this.state.wrongRegFormUNameValue = true;
            this.showWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_UNAME);
            dataIsCorrect = false;                   
        }

        //Метод String.prototype.search() выполняет поиск сопоставления между регулярным выражением и
        //этим объектом String. При успехе возвращает индекс первого сопоставления с регулярным
        //выражением внутри строки. В противном случае метод вернёт -1.
        //В нашем случае регулярное выражение таково, что будет возвращаться либо 0 (т.е., строка
        //удовлетворяет выражению с самого своего начала), либо -1.
        if(this.regFormEmailRef.current.value.search(LIMITS.emailPatternRegExp)==-1) { //Email некорректный
            this.state.wrongRegFormEmailValue = true;

            this.showWrongInputValIcon(this.FLAG_REGFORM_INPUT_IS_EMAIL);
            dataIsCorrect = false;
        }
        
        return dataIsCorrect;

    }

    sendRegFormData() {
        if(!this.state.regProcessIsActive) {
            let fData = new FormData(this.regFormRef.current);
            this.props.uniTool(DO.register, fData);
            this.state.regProcessIsActive = true;
            this.regFormSubmitRef.current.setAttribute("disabled", true);
        }
    }

    universalTool(command, infoArgument) {//Ф-я, получающая сигналы от дочерних ДОМ-элементов. 
        if(command==DO.signIn || 
        command==DO.signOut || 
        command==DO.openForgottenPswPopup || 
        command==DO.openUserProfile ||
        command==DO.openAboutProject) {
            this.props.uniTool(command, infoArgument);
        }
        else if(command==DO.goToGallery) {
            this.props.history.push("/gallery");
        }
        else if(command==DO.goToRegPage) {
            this.props.history.push("/registration");
        }
        else if(command==DO.goToMainPage) {
            this.props.history.push("/");
        }
    }

    render() {
        const logoBlockInfoObject = {
            width: this.state.styles.logoBlockWidth,
            height: this.state.styles.logoBlockHeight,
            marginTop: this.state.styles.logoBlockMarginTop,
            marginBottom: this.state.styles.logoBlockMarginBottom,
            marginRight: this.state.styles.logoBlockMarginRight,
            logoImgHeight: this.state.styles.logoImgHeight,
            aboutAncorFontSize: this.state.styles.logoAboutAncorFontSize,
            logoNameImgWidth: this.state.styles.logoNameImgWidth,
            logoNameImgHeight: this.state.styles.logoNameImgHeight, 
        };
            
        let signInBlockInfoObject = {
            width: this.state.styles.sInBlockWidth, 
            height: this.state.styles.sInBlockHeight, 
            marginTop: this.state.styles.sInBlockMarginTop, 
            marginBottom: this.state.styles.sInBlockMarginBottom, 
            marginLeft: this.state.styles.sInBlockMarginLeft, 

            ancorMarginLeft: this.state.styles.sInBlockAncorMarginLeft, 
            ancorMarginRight: this.state.styles.sInBlockAncorMarginRight, 
            ancorFontSize: this.state.styles.sInBlockAncorFontSize, 
            
            textInputsWidth: this.state.styles.sInBlockTextInputsWidth,
            textInputsHeight: this.state.styles.sInBlockTextInputsHeight,
            textInputsMarginLeft: this.state.styles.sInBlockTextInputsMarginLeft,
            textInputsMarginRight: this.state.styles.sInBlockTextInputsMarginRight,
            
            userInfoObject: this.state.userInfoObject,
            
            isRegPage: true
        };
            

        const centralImgWrapperStyle = {
            position: "relative",
            width: this.state.styles.epCentralImgWrapperWidth,
            height: this.state.styles.epCentralImgWrapperHeight,
        };

        
        const centralImgStyle = {
            zIndex: 0,
            position: "absolute",
            top: "0px", 
            left: "0px",
            width: this.state.styles.epCentralImgWidth,
            height: this.state.styles.epCentralImgHeight,
            border: "2px solid rgb(30, 144, 255)"
        };
        
        const regFormPanelStyle = {
            zIndex: 1,
            position: "absolute",
            top: "0px", 
            left: "0px",
            width: this.state.styles.epCentralImgWidth,
            height: this.state.styles.epCentralImgHeight,
        };

//???
        //Эти данные потом надо вынести в регулируемые параметры.
        const welcomeImgWidth = 215;
        const welcomeImgLeftPos = Math.ceil((this.props.infoObject.adaptParams['epCentralImgWidth'] - welcomeImgWidth)/2) + "px";
        const regFormWelcomeImgStyle = {
            position: "absolute",
            top: "30px", 
            left: welcomeImgLeftPos,
        };
        
        const registrImgLeftPos = "23px";
        const regFormRegistrImgStyle = {
            position: "absolute",
            top: "102px", 
            left: registrImgLeftPos,            
        };

        const inputsContainerLeftPos = "23px";
        const regFormInputsContainerStyle = {
            position: "absolute",
            top: "148px", 
            left: inputsContainerLeftPos,  
            
            display: "flex",
            flexDirection: "column",
        };

        let textInputWidth = "150px";
        let inputRowRightBlockWidth = "196px";
        let inputRowWidth = "400px";
        
        //Нужно, чтобы при минимальном размере сократилась длина текстовых полей.
        if(this.state.styles.epCentralImgWidth=="574px") {
            textInputWidth = "100px";
            inputRowRightBlockWidth = "146px";
            inputRowWidth = "350px";
        }
        
        const regFormInputRowStyle = {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",

            width: inputRowWidth,
            height: "23px"
        };
        
        const regFormInputRowRightBlockStyle = {
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            alignItems: "center",  
            
            width: inputRowRightBlockWidth
        };
        
        const regFormWrongValIconStyle = {
            width: "17px",
            height: "17px",
            marginLeft: "3px",
            marginRight: "3px"            
        };
        
        const regFormQuestionIconStyle = {
            width: "17px",
            height: "17px",
            marginLeft: "3px",
            marginRight: "3px",
            
            cursor: "pointer"
        };
        
        const regFormSubmitRowStyle = {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",

            height: "50px",
            width: inputRowWidth
        };
        
        const regFormTextInputStyle = {
            width: textInputWidth,
            height: "20px",
            backgroundColor: this.REGFORM_INPUT_BGCOLOR,
            borderRadius: "3px"
        };
        
        const regFormSubmitStyle = {
            height: "25px",
            width: "120px"
        };

        const bgImgMinHeight = (this.makeNumberFromPxSize(centralImgWrapperStyle.height) + this.state.styles.logoBlockMarginBottom + this.state.styles.logoBlockHeight + this.state.styles.logoBlockMarginTop + 100) + "px"; //+100 - на всякий случай, т.к. на телефоне получается не очень хорошо.
        
        return (
        <div style={{background: NAMES_PATHS.backgroundColor}} className="register__body">
            <div ref={this.popupsContainerRef} style={{zIndex: 2}} className="regpage-popups-container"></div>
            <img style={{zIndex: 0, minHeight: bgImgMinHeight}} className="register__bg-image" src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.backgroundImg}/>
            
            <div style={{zIndex: 1}} className="register__content-container">
                <div className="register__header">
                    <LogoBlock infoObject={logoBlockInfoObject} uniTool={this.universalTool.bind(this)}/>

                    <SignInBlock infoObject={signInBlockInfoObject} uniTool={this.universalTool.bind(this)}/>
                </div>

                <div style={centralImgWrapperStyle}>
                    <img style={centralImgStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPageCentralImg}/>
                    <div style={regFormPanelStyle}>
                        <form ref={this.regFormRef} className="regform">
                            <img style={regFormWelcomeImgStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_WelcomeTitle_Img}/>
                            <img style={regFormRegistrImgStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_RegistrationTitle_Img}/>
                            <div style={regFormInputsContainerStyle}>
                                <div className="regform__row-login" style={regFormInputRowStyle}>
                                    <img src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_LoginInputTitle_Img}/>
                                    <div ref={this.regFormLoginRightBlockRef} className="regform__row-rightblock-login" style={regFormInputRowRightBlockStyle}>
                                        <input tabIndex="-1" type="text" ref={this.regFormLoginRef} name="login" className="regform__input-login" style={regFormTextInputStyle} maxLength={LIMITS.loginMaxLength} onChange={this.checkRegFormInputValue.bind(this)} onKeyDown={this.regFormSubmitByEnter.bind(this)}/>
                                        <img ref={this.regFormLoginWrongValIconRef} className="wronginputvalicon" style={regFormWrongValIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_WrongInputValueIcon_Img}/>
                                        <img ref={this.regFormLoginQuestIconRef} className="questionicon" title={this.createInputQuestionIconTitle(this.FLAG_REGFORM_INPUT_IS_LOGIN)} style={regFormQuestionIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_QuestionIcon_Img} onClick={this.openRulesInfoPp}/>
                                    </div>
                                </div>

                                <div className="regform__row-password" style={regFormInputRowStyle}>
                                    <img src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_PasswordInputTitle_Img}/>
                                    <div ref={this.regFormPswRightBlockRef} className="regform__row-rightblock-password" style={regFormInputRowRightBlockStyle}>
                                        <input tabIndex="-1" type="password" ref={this.regFormPswRef} name="password" className="regform__input-password" style={regFormTextInputStyle} maxLength={LIMITS.passwordMaxLength} onChange={this.checkRegFormInputValue.bind(this)} onKeyDown={this.regFormSubmitByEnter.bind(this)}/>
                                        <img ref={this.regFormPswWrongValIconRef} className="wronginputvalicon" style={regFormWrongValIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_WrongInputValueIcon_Img}/>
                                        <img ref={this.regFormPswQuestIconRef} className="questionicon" title={this.createInputQuestionIconTitle(this.FLAG_REGFORM_INPUT_IS_PSW)} style={regFormQuestionIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_QuestionIcon_Img} onClick={this.openRulesInfoPp}/>
                                    </div>
                                </div>

                                <div className="regform__row-repeatp" style={regFormInputRowStyle}>
                                    <img src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_RepeatPswInputTitle_Img}/>
                                    <div ref={this.regFormRepeatPswRBlockRef} className="regform__row-rightblock-repeatp" style={regFormInputRowRightBlockStyle}>
                                        <input tabIndex="-1" type="password" ref={this.regFormRepeatPswRef} name="repeatpassword" className="regform__input-repeatp" style={regFormTextInputStyle} maxLength={LIMITS.passwordMaxLength} onChange={this.checkRegFormInputValue.bind(this)} onKeyDown={this.regFormSubmitByEnter.bind(this)}/>
                                        <img ref={this.regFormRepeatPswWrongValIconRef} className="wronginputvalicon" style={regFormWrongValIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_WrongInputValueIcon_Img}/>
                                    </div>
                                </div>
                                
                                <div className="regform__row-username" style={regFormInputRowStyle}>
                                    <img src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_UsernameInputTitle_Img}/>
                                    <div ref={this.regFormUNameRightBlockRef} className="regform__row-rightblock-username" style={regFormInputRowRightBlockStyle}>
                                        <input tabIndex="-1" type="text" ref={this.regFormUNameRef} name="username" className="regform__input-username" style={regFormTextInputStyle} maxLength={LIMITS.userNameMaxLength} onChange={this.checkRegFormInputValue.bind(this)} onKeyDown={this.regFormSubmitByEnter.bind(this)}/>
                                        <img ref={this.regFormUNameWrongValIconRef} className="wronginputvalicon" style={regFormWrongValIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_WrongInputValueIcon_Img}/>
                                        <img ref={this.regFormUNameQuestIconRef} className="questionicon" title={this.createInputQuestionIconTitle(this.FLAG_REGFORM_INPUT_IS_UNAME)} style={regFormQuestionIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_QuestionIcon_Img} onClick={this.openRulesInfoPp}/>
                                    </div>
                                </div>
                                
                                <div className="regform__row-email" style={regFormInputRowStyle}>
                                    <img src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_EmailInputTitle_Img}/>
                                    <div ref={this.regFormEmailRightBlockRef} className="regform__row-rightblock-email" style={regFormInputRowRightBlockStyle}>
                                        <input tabIndex="-1" type="text" ref={this.regFormEmailRef} name="email" className="regform__input-email" style={regFormTextInputStyle} maxLength={LIMITS.emailMaxLength} onChange={this.checkRegFormInputValue.bind(this)} onKeyDown={this.regFormSubmitByEnter.bind(this)}/>
                                        <img ref={this.regFormEmailWrongValIconRef} className="wronginputvalicon" style={regFormWrongValIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_WrongInputValueIcon_Img}/>
                                        <img ref={this.regFormEmailQuestIconRef} className="questionicon" title={this.createInputQuestionIconTitle(this.FLAG_REGFORM_INPUT_IS_EMAIL)} style={regFormQuestionIconStyle} src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.regPage_QuestionIcon_Img} onClick={this.openRulesInfoPp}/>
                                    </div>
                                </div>
                                
                                <div style={regFormSubmitRowStyle}>
                                    <button tabIndex="-1" ref={this.regFormSubmitRef} style={regFormSubmitStyle} className="regform__submit" onClick={this.regFormSubmit.bind(this)}>Register</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>


            </div>
        </div>);

    }
}