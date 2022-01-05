import React from "react";

import MyDraggable from "./MyDraggable.jsx";

import {limits as LIMITS,
    internalAPI_commandCodes as DO} from "../ControlsAndAPI.js";

import "../css/styles_all.css";

/**
 * Принятые сокращения:
 * chP - от Change Password
 */
/*
Принимаемые пропсы:
uniTool: <object Function>, //Функция для передачи команд родительскому элементу.
infoObject: {
    userID: <number>
    login: <string>,
    email: <string>,
    name: <string>,
    userRegDate: <object Date>,
}
*/
export default class UserProfilePopup extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            userID: this.props.infoObject.userID
        }
        
        this.chPFormBlockClosedHeight = "0px"; 
        this.chPFormBlockOpenedHeight = "210px";
        this.popupMinHeight = "290px";
        this.popupMaxHeight = "500px";
        
        this.popupRef = React.createRef();
        this.userLoginRef = React.createRef();
        this.userUNameRef = React.createRef();
        this.userEMailRef = React.createRef();
        this.userRegDateRef = React.createRef();
        this.chPFormBlockRef = React.createRef(); 
        this.chPFormRef = React.createRef();
        this.chPFormOldPswRef = React.createRef();
        this.chPFormNewPswRef = React.createRef();
        this.chPFormRepeatNewPswRef = React.createRef();
        this.submitRef = React.createRef();
        this.closingButtonRef = React.createRef();

        this.submitForm = this.submitForm.bind(this);
        this.closeThisPopup = this.closeThisPopup.bind(this);
        this.openOrCloseChPFormBlock = this.openOrCloseChPFormBlock.bind(this);
    }
    
    closeThisPopup(event) {
        this.chPFormOldPswRef.current.value = "";
        this.chPFormNewPswRef.current.value = "";
        this.chPFormRepeatNewPswRef.current.value = "";

        this.closeChPFormBlock();
        this.props.uniTool(DO.closeUserProfile);
    }
    
    openChPFormBlock() {
        this.popupRef.current.style.height = this.popupMaxHeight;
        this.chPFormBlockRef.current.style.height = this.chPFormBlockOpenedHeight;        
    }
    
    closeChPFormBlock() {
        this.popupRef.current.style.height = this.popupMinHeight;
        this.chPFormBlockRef.current.style.height = this.chPFormBlockClosedHeight;        
    }
    
    openOrCloseChPFormBlock(event) {
        if(this.chPFormBlockRef.current.style.height==this.chPFormBlockClosedHeight) {
            this.openChPFormBlock();
        }
        else if(this.chPFormBlockRef.current.style.height==this.chPFormBlockOpenedHeight) {
            this.closeChPFormBlock();
        }
    }

    disablePasswordChanging() {
        this.submitRef.current.setAttribute("disabled", true);
    }

    enablePasswordChanging() {
        this.submitRef.current.removeAttribute("disabled");
    }

    checkInputValue(event) {
        if(event.target.value.match(LIMITS.passwordValidationRegExp)) {
            event.target.value = event.target.value.replace(LIMITS.passwordValidationRegExp, '');
            alert("Недопустимый символ!");
        }
        if(event.target.value.length > LIMITS.passwordMaxLength)
            event.target.value = event.target.value.slice(0, LIMITS.passwordMaxLength);        
    }

    checkFormData() {
        let dataIsCorrect = true;
        
        if(this.chPFormOldPswRef.current.value.length < LIMITS.passwordMinLength || this.chPFormOldPswRef.current.value.length > LIMITS.passwordMaxLength)
            dataIsCorrect = false;
            
        if(this.chPFormNewPswRef.current.value.length < LIMITS.passwordMinLength || this.chPFormNewPswRef.current.value.length > LIMITS.passwordMaxLength)
            dataIsCorrect = false;
            
        if(this.chPFormRepeatNewPswRef.current.value.length < LIMITS.passwordMinLength || 
        this.chPFormRepeatNewPswRef.current.value.length > LIMITS.passwordMaxLength ||
        this.chPFormNewPswRef.current.value!=this.chPFormRepeatNewPswRef.current.value)
            dataIsCorrect = false;
            
        return dataIsCorrect;    
    }

    sendFormData() {
        let fData = new FormData(this.chPFormRef.current);
        fData.append("id", this.state.userID);
        
        this.closingButtonRef.current.focus();
        
        this.props.uniTool(DO.changePassword, fData);
    }
    
    submitForm(event) {
        event.preventDefault();
        if(this.checkFormData()) this.sendFormData();
        else alert("Обнаружены ошибки при заполнении формы! Проверьте всё ещё раз.");
    }
    
    submitFormViaEnter(event) {
        if(event.keyCode==13) {
            event.preventDefault();
            if(this.checkFormData()) this.sendFormData();
            else alert("Обнаружены ошибки при заполнении формы! Проверьте всё ещё раз.");
        }
    }
    

    addZeroToDateElement(dateElement) {
        let dateElemStr = String(dateElement);
        if(dateElemStr.length==1) dateElemStr = "0" + dateElemStr;
        return dateElemStr;
    }
    
/*
    Принимаемый аргумент:
    userInfoObject = {
        userID: <number>, 
        login: <string>,
        email: <string>,
        name: <string>,
        userRegDate: <строка вида 2021-05-20T08:53:01>
    }
*/    
    modify(userInfoObject) {
        let date = new Date(userInfoObject.userRegDate);
        let az = this.addZeroToDateElement; //Для краткости.
        
        this.userLoginRef.current.innerText = userInfoObject.login;
        this.userUNameRef.current.innerText = userInfoObject.name;
        this.userEMailRef.current.title = userInfoObject.email;
        this.userEMailRef.current.value = userInfoObject.email;
        this.userRegDateRef.current.innerText = az(date.getDate()) + "." + az(date.getMonth()) + "." + date.getFullYear() + " " + az(date.getHours()) + ":" + az(date.getMinutes()) + ":" + az(date.getSeconds());
            
        //Это нужно сделать здесь, т.к. иначе при закрытии попапа не по кнопке закрытия, а извне, программно (например, при 
        //программной разавторизации, если истекло время сессии) поля формы не очистятся и при новом открытии
        //попапа будут опять видны.
        this.chPFormOldPswRef.current.value = "";
        this.chPFormNewPswRef.current.value = "";
        this.chPFormRepeatNewPswRef.current.value = "";
        
        //Хочу, чтобы при открытии попапа (а modify() вызывается перед ним) формы были закрыты.
        this.closeChPFormBlock();
            
        this.state.userID = userInfoObject.userID;

        this.closingButtonRef.current.focus();
    }

    shouldComponentUpdate() {
        //Этот попап, будучи один раз созданным, должен изменяться только ДОМ-методами и не 
        //перерисовываться.
        return false;
    }

    componentDidMount() {
        this.closingButtonRef.current.focus();
    }
    
    render() {
        let popupSizes = {
            width: "480px",
            height: this.popupMinHeight 
        };        

        let titleSizes = {
            marginTop: "10px"
        };
        
        let pDataBlockSizes = {/*pData - от personal data*/
            marginBottom: "15px"
        };

        let pDataLeftColumnSizes = {
            width: "235px"
        };
        
        let pDataRightColumnSizes = {
            width: "235px"
        };

        let formBlockStyle = {
            overflow: "hidden",
            height: this.chPFormBlockClosedHeight
        };
        
        let spoilerOpenerSizes = {
            marginBottom: "15px"
        };
        
        let formSizes = {
            height: "200px"
        }
        
        let pDataEmailInputSizes = {
            width: "183px", //Примеривался к ширине span с датой.
            //height: "25px"
        }
        
        let closeButtonSizes = {
            marginBottom: "10px"
        }
        
        let az = this.addZeroToDateElement; //Для краткости.
        let date = new Date(this.props.infoObject.userRegDate);
        let dateStr = az(date.getDate()) + "." + az(date.getMonth()) + "." + date.getFullYear() + " " + az(date.getHours()) + ":" + az(date.getMinutes()) + ":" + az(date.getSeconds());
        
        return (
        <div className="popup-universal-bg">
            <MyDraggable cancel=".popup-uprofile__input">
                <div ref={this.popupRef} style={popupSizes} className="popup-uprofile">
                    <span style={titleSizes} className="popup-uprofile__title">Данные пользователя:</span>
                
                    <div style={pDataBlockSizes} className="popup-uprofile__p-data-block">
                        <div style={pDataLeftColumnSizes} className="popup-uprofile__p-data-column">
                            <div className="popup-uprofile__p-data-row">
                                <span className="popup-uprofile__text">Login:</span>
                            </div>
                            <div className="popup-uprofile__p-data-row">
                                <span className="popup-uprofile__text">User Name:</span>
                            </div>
                            <div className="popup-uprofile__p-data-row">
                                <span className="popup-uprofile__text">E-mail:</span>
                            </div>
                            <div className="popup-uprofile__p-data-row">
                                <span className="popup-uprofile__text">Дата</span>
                            </div>
                            <div className="popup-uprofile__p-data-row">
                                <span className="popup-uprofile__text">регистрации:</span>
                            </div>
                            <div className="popup-uprofile__p-data-row"></div>
                        </div>
                        <div style={pDataRightColumnSizes} className="popup-uprofile__p-data-column">
                            <div className="popup-uprofile__p-data-row">
                                <span ref={this.userLoginRef} className="popup-uprofile__p-data-text">{this.props.infoObject.login}</span>
                            </div>
                            <div className="popup-uprofile__p-data-row">
                                <span ref={this.userUNameRef} className="popup-uprofile__p-data-text">{this.props.infoObject.name}</span>
                            </div>
                            <div className="popup-uprofile__p-data-row">
                                <input ref={this.userEMailRef} style={pDataEmailInputSizes} className="popup-uprofile__p-data-input" type="text" title={this.props.infoObject.email} value={this.props.infoObject.email}/>
                            </div>
                            <div className="popup-uprofile__p-data-row"></div>
                            <div className="popup-uprofile__p-data-row">
                                <span ref={this.userRegDateRef} className="popup-uprofile__p-data-text">{dateStr}</span>
                            </div>
                            <div className="popup-uprofile__p-data-row">
                                <span className="popup-uprofile__p-data-text">(UTC+0)</span>
                            </div>
                        </div>
                    </div>
            
                    <div className="popup-uprofile__change-psw-block">
                        <span 
                        style={spoilerOpenerSizes} 
                        className="popup-uprofile__spoiler-opener" 
                        onTouchStart={this.openOrCloseChPFormBlock}
                        onClick={this.openOrCloseChPFormBlock}>Сменить пароль</span>

                        <div ref={this.chPFormBlockRef} style={formBlockStyle}>
                            <div className="popup-universal-centering-container">
                                <form ref={this.chPFormRef} style={formSizes} className="popup-uprofile__form">
                                    <div className="popup-uprofile__input-block">
                                        <span className="popup-uprofile__input-descr-text">Старый пароль:</span>
                                        <input 
                                        tabIndex="-1" 
                                        type="password" 
                                        ref={this.chPFormOldPswRef} 
                                        className="popup-uprofile__input" 
                                        name="oldpassword" 
                                        maxLength={LIMITS.passwordMaxLength} 
                                        onChange={this.checkInputValue.bind(this)} 
                                        onKeyDown={this.submitFormViaEnter.bind(this)}/>
                                    </div>
                            
                                    <div className="popup-uprofile__input-block">
                                        <span className="popup-uprofile__input-descr-text">Новый пароль:</span>
                                        <input 
                                        tabIndex="-1" 
                                        type="password" 
                                        ref={this.chPFormNewPswRef} 
                                        className="popup-uprofile__input" 
                                        name="newpassword" 
                                        maxLength={LIMITS.passwordMaxLength} 
                                        onChange={this.checkInputValue.bind(this)} 
                                        onKeyDown={this.submitFormViaEnter.bind(this)}/>
                                    </div>

                                    <div className="popup-uprofile__input-block">
                                        <span className="popup-uprofile__input-descr-text">Повторите новый пароль:</span>
                                        <input 
                                        tabIndex="-1" 
                                        type="password" 
                                        ref={this.chPFormRepeatNewPswRef} 
                                        className="popup-uprofile__input" 
                                        name="repeatnewpassword" 
                                        maxLength={LIMITS.passwordMaxLength} 
                                        onChange={this.checkInputValue.bind(this)} 
                                        onKeyDown={this.submitFormViaEnter.bind(this)}/>
                                    </div>
                            
                                    <div className="popup-universal-centering-container">
                                        <button tabIndex="-1" ref={this.submitRef} className="popup-uprofile__submit" onTouchEnd={this.submitForm} onClick={this.submitForm}>Отправить</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button 
                        ref={this.closingButtonRef} 
                        style={closeButtonSizes} 
                        className="popup-universal-button" 
                        onTouchEnd={this.closeThisPopup} 
                        onClick={this.closeThisPopup}>Close</button>
                    </div>
                </div>
            </MyDraggable>
        </div>);  
    }
    
}