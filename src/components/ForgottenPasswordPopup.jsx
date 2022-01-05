import React from "react";

import MyDraggable from "./MyDraggable.jsx";

import {limits as LIMITS, 
    namesAndPaths as NAMES_PATHS, 
    internalAPI_commandCodes as DO} from "../ControlsAndAPI.js";

import "../css/styles_all.css";

export default class ForgottenPasswordPopup extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            formDisabled: false,  
            
            loginCleanerCount: 0,
            uNameCleanerCount: 0,
        };
        
        this.wholeElementRef = React.createRef();
        this.contentContainerRef = React.createRef();
        this.formRef = React.createRef();
        this.formLoginRef = React.createRef();
        this.formUNameRef = React.createRef();
        this.submitRef = React.createRef();
        this.closeIconContainerRef = React.createRef();

        this.submitForm = this.submitForm.bind(this);
        this.closePopup = this.closePopup.bind(this);
    }
    
    submitForm(event) {
        event.preventDefault();
        if(this.checkFormData()) this.sendFormData();
        else alert("Вы ввели заведомо некорректный логин или имя пользователя!");
    }

    submitFormByEnter(event) {
        if(event.keyCode==13) {
            event.preventDefault();
            if(this.checkFormData()) this.sendFormData(); 
            else alert("Вы ввели заведомо некорректный логин или имя пользователя!");
        }
    }
    
    sendFormData() {
        const fData = new FormData(this.formRef.current);
        this.props.uniTool(DO.changeForgottenPassword, fData);
    }
    
    checkFormData() {
        let dataIsCorrect = true;
        
        if(this.formLoginRef.current.value.length < LIMITS.loginMinLength || this.formLoginRef.current.value.length > LIMITS.loginMaxLength)
            dataIsCorrect = false;
            
        if(this.formUNameRef.current.value.length < LIMITS.userNameMinLength || this.formUNameRef.current.value.length > LIMITS.userNameMaxLength)
            dataIsCorrect = false;
            
        return dataIsCorrect;    
    }
    
    closePopup(event) {
        this.state.loginCleanerCount = 0;
        this.state.uNameCleanerCount = 0;
        this.formLoginRef.current.value = "Login";
        this.formUNameRef.current.value = "UserName";
        this.props.uniTool(DO.closeForgottenPswPopup);
    }


    checkLoginInputValue(event) {
        this.checkInputValue(this.formLoginRef);
    }
    
    checkUNameInputValue(event) {
        this.checkInputValue(this.formUNameRef);
    }
    
    checkInputValue(ref) {
        if(ref===this.formLoginRef) {
            if(this.formLoginRef.current.value.match(LIMITS.loginValidationRegExp)) {
                this.formLoginRef.current.value = this.formLoginRef.current.value.replace(LIMITS.loginValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            if(this.formLoginRef.current.value.length > LIMITS.loginMaxLength)
                this.formLoginRef.current.value = this.formLoginRef.current.value.slice(0, LIMITS.loginMaxLength);
        }
        else if(ref===this.formUNameRef) {
            if(this.formUNameRef.current.value.match(LIMITS.userNameValidationRegExp)) {
                this.formUNameRef.current.value = this.formUNameRef.current.value.replace(LIMITS.userNameValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            if(this.formUNameRef.current.value.length > LIMITS.userNameMaxLength)
                this.formUNameRef.current.value = this.formUNameRef.current.value.slice(0, LIMITS.userNameMaxLength);
            
        }
    }

    
    restoreLoginDefaultValue(event) {
        this.restoreInputDefaultValue(this.formLoginRef);
    }
    
    restoreUNameDefaultValue(event) {
        this.restoreInputDefaultValue(this.formUNameRef);
    }
    
    restoreInputDefaultValue(ref) {
        if(ref.current.value.trim()==="") {
            if(ref===this.formLoginRef) {
                this.state.loginCleanerCount = 0;
                ref.current.value="Login";
            }
            else if(ref===this.formUNameRef) {
                this.state.uNameCleanerCount = 0;
                ref.current.value="UserName";
            }
        }
    }
    
    
    clearLoginDefaultValue(event) {
        this.clearInputDefaultValue(this.formLoginRef);
    }
    
    clearUNameDefaultValue(event) {
        this.clearInputDefaultValue(this.formUNameRef);
    }

    clearInputDefaultValue(ref) {
        if(ref===this.formLoginRef && this.state.loginCleanerCount==0) {
            ref.current.value = "";
            this.state.loginCleanerCount++;
        }
        else if(ref===this.formUNameRef && this.state.uNameCleanerCount==0) {
            ref.current.value = "";
            this.state.uNameCleanerCount++;            
        }
    }
    
    
    render() {
        //Поскольку у нас всё статично, можно было бы обойтись без этих объектов стилей, поместив всё в css-файл.
        //Но удобнее видеть все размеры прямо здесь. В css-файле они продублированы.
        const contentBlockSizes = {
            width: "340px",
            height: "160px"
        };
        
        const closeIconContainerSizes = {
            width: "26px",
            height: "160px"
        };
        
        const formMargins = {
            marginTop: "5px",
            marginBottom: "5px",
        };
        
        return (
        <div ref={this.wholeElementRef} className="popup-universal-bg">
            <MyDraggable cancel=".popup-forgottenp__input">
                <div className="popup-forgottenp">
                    <div ref={this.contentContainerRef} className="popup-forgottenp__content" style={contentBlockSizes}>
                        <span className="popup-forgottenp__title">Генерация нового пароля</span>
                        <span className="popup-forgottenp__subtitle">Введите логин и имя пользователя:</span>
                    
                        <form ref={this.formRef} style={formMargins} className="popup-forgottenp__form">
                            <input 
                            ref={this.formLoginRef} 
                            className="popup-forgottenp__input" 
                            name="login" 
                            type="text" 
                            maxLength={LIMITS.loginMaxLength} 
                            defaultValue="Login" 
                            onFocus={this.clearLoginDefaultValue.bind(this)} 
                            onBlur={this.restoreLoginDefaultValue.bind(this)} 
                            onChange={this.checkLoginInputValue.bind(this)} 
                            onKeyDown={this.submitFormByEnter.bind(this)}/>

                            <input 
                            ref={this.formUNameRef} 
                            className="popup-forgottenp__input" 
                            name="username" 
                            type="text" 
                            maxLength={LIMITS.userNameMaxLength} 
                            defaultValue="UserName" 
                            onFocus={this.clearUNameDefaultValue.bind(this)} 
                            onBlur={this.restoreUNameDefaultValue.bind(this)} 
                            onChange={this.checkUNameInputValue.bind(this)} 
                            onKeyDown={this.submitFormByEnter.bind(this)}/>

                            <button ref={this.submitRef} className="popup-forgottenp__submit" onTouchEnd={this.submitForm} onClick={this.submitForm}>Отправить</button>
                        </form>
                    
                    </div>
                    <div ref={this.closeIconContainerRef} className="popup-forgottenp__closeicon-container" style={closeIconContainerSizes}>
                        <img className="popup-forgottenp__closeicon" src={NAMES_PATHS.designElementsUrlPath + "Icon-cross-lighted.png"} onTouchEnd={this.closePopup} onClick={this.closePopup}/>
                    </div>
                </div>
            </MyDraggable>
        </div>);
    }
}