import React from "react";

import MyDraggable from "./MyDraggable.jsx";

import { limits as LIMITS,
    internalAPI_commandCodes as DO, 
    internalAPI_flags as FLAG} from "../ControlsAndAPI.js";

import "../css/styles_all.css";

/*
Принимаемые пропсы:
uniTool: <object Function>, //Функция для передачи команд родительскому элементу.
*/
export default class SignInPopup extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            signInFormDisabled: false,  
            
            signInLoginCleanerCount: 0,
            signInPasswCleanerCount: 0,
        };
        

        this.wholeElementRef = React.createRef();
        this.titleRef = React.createRef();
        this.subTitleRef = React.createRef();
        this.contentContainerRef = React.createRef();
        this.signInFormRef = React.createRef();
        this.signInFormLoginRef = React.createRef();
        this.signInFormPasswordRef = React.createRef();
        this.signInSubmitRef = React.createRef();

        this.goToRegistrationPage = this.goToRegistrationPage.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.signInSubmit = this.signInSubmit.bind(this);
    }
    

    disableSignInForm() {
        this.state.signInFormDisabled = true;
        this.signInSubmitRef.current.setAttribute("disabled", true);
    }
    enableSignInForm() {
        this.state.signInFormDisabled = false;
        this.signInSubmitRef.current.removeAttribute("disabled");
    }
    
    
    forgotPassword(event) {
        this.props.uniTool(DO.openForgottenPswPopup);
    }

    sendSignInFormData() {
        if(!this.state.signInFormDisabled) {
            let fData = new FormData(this.signInFormRef.current);
            this.props.uniTool(DO.signIn, fData);

            this.disableSignInForm();
        }
    }    

    signInSubmit(event) {
        event.preventDefault();
        if(this.checkSInFormData()) this.sendSignInFormData();
        else alert("Вы ввели заведомо некорректный логин или пароль!");
    }

    signInViaEnter(event) {
        if(event.keyCode==13) {
            event.preventDefault();
            if(this.checkSInFormData()) this.sendSignInFormData(); 
            else alert("Вы ввели заведомо некорректный логин или пароль!");
        }
    }
    
    checkSInFormData() {
        let dataIsCorrect = true;
        
        if(this.signInFormLoginRef.current.value.length < LIMITS.loginMinLength || this.signInFormLoginRef.current.value.length > LIMITS.loginMaxLength)
            dataIsCorrect = false;
            
        if(this.signInFormPasswordRef.current.value.length < LIMITS.passwordMinLength || this.signInFormPasswordRef.current.value.length > LIMITS.passwordMaxLength)
            dataIsCorrect = false;
            
        return dataIsCorrect;
    }


    checkLoginInputValue(event) {
        this.checkInputValue(this.signInFormLoginRef);
    }
    
    checkPasswordInputValue(event) {
        this.checkInputValue(this.signInFormPasswordRef);
    }
    
    checkInputValue(ref) {
        if(ref===this.signInFormLoginRef) {
            if(this.signInFormLoginRef.current.value.match(LIMITS.loginValidationRegExp)) {
                this.signInFormLoginRef.current.value = this.signInFormLoginRef.current.value.replace(LIMITS.loginValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            if(this.signInFormLoginRef.current.value.length > LIMITS.loginMaxLength)
                this.signInFormLoginRef.current.value = this.signInFormLoginRef.current.value.slice(0, LIMITS.loginMaxLength);
        }
        else if(ref===this.signInFormPasswordRef) {
            if(this.signInFormPasswordRef.current.value.match(LIMITS.passwordValidationRegExp)) {
                this.signInFormPasswordRef.current.value = this.signInFormPasswordRef.current.value.replace(LIMITS.passwordValidationRegExp, '');
                alert("Недопустимый символ!");
            }
            if(this.signInFormPasswordRef.current.value.length > LIMITS.passwordMaxLength)
                this.signInFormPasswordRef.current.value = this.signInFormPasswordRef.current.value.slice(0, LIMITS.passwordMaxLength);
            
        }
    }


    restoreLoginDefaultValue(event) {
        this.restoreInputDefaultValue(this.signInFormLoginRef);
    }
    
    restorePasswordDefaultValue(event) {
        this.restoreInputDefaultValue(this.signInFormPasswordRef);
    }
    
    restoreInputDefaultValue(ref) {
        if(ref.current.value.trim()==="") {
            if(ref===this.signInFormLoginRef) {
                this.state.signInLoginCleanerCount = 0;
                ref.current.value="Login";
            }
            else if(ref===this.signInFormPasswordRef) {
                this.state.signInPasswCleanerCount = 0;
                ref.current.value="Password";
            }
        }
    }

    clearLoginDefaultValue(event) {
        this.clearInputDefaultValue(this.signInFormLoginRef);
    }
    
    clearPasswordDefaultValue(event) {
        this.clearInputDefaultValue(this.signInFormPasswordRef);
    }

    clearInputDefaultValue(ref) {
        if(ref===this.signInFormLoginRef && this.state.signInLoginCleanerCount==0) {
            ref.current.value = "";
            this.state.signInLoginCleanerCount++;
        }
        else if(ref===this.signInFormPasswordRef && this.state.signInPasswCleanerCount==0) {
            ref.current.value = "";
            this.state.signInPasswCleanerCount++;            
        }
    }

    modify(flag) {
        if(flag==FLAG.sInPopup_initialView) {
            this.titleRef.current.innerText = "Пожалуйста, войдите в аккаунт:";
            this.subTitleRef.current.innerText = "";
            this.titleRef.current.style.marginBottom = "1px";
            this.signInFormRef.current.style.marginTop = "1px";
            this.contentContainerRef.current.style.height = "90px";
        }
        else if(flag==FLAG.sInPopup_sessionEndedView) {
            this.titleRef.current.innerText = "Время вашей сессии истекло!";
            this.subTitleRef.current.innerText = "Вам необходимо снова авторизоваться:";
            this.titleRef.current.style.marginBottom = "5px";
            this.signInFormRef.current.style.marginTop = "5px";
            this.contentContainerRef.current.style.height = "115px";
        }
        else if(flag==FLAG.sInPopup_setEnabled) {
            //Всё-таки нельзя обойтись без способа извне разблокировать дисаблированный попап. При отправке данных
            //он дисаблируется в ожидании ответа, и разблокировать его потом можно либо путём закрытия, либо - 
            //без данной ф-и - никак. А его не при всех исходах операции нужно закрывать (собственно, закрывать
            //нужно лишь при одном исходе - когда всё благополучно!).
            this.enableSignInForm();
        }
        
        if(flag!=FLAG.sInPopup_setEnabled) {
            //Ф-я modify() вызывается перед открытием попапа, и чтобы устранить все следы предыдущей работы,
            //мы делаем всё нижеследующее:
            this.state.signInLoginCleanerCount = 0;
            this.state.signInPasswCleanerCount = 0;
            this.signInFormLoginRef.current.value = "Login";
            this.signInFormPasswordRef.current.value = "Pasword";
            this.enableSignInForm(); 
        }
    }
    
    goToRegistrationPage() {
        this.props.uniTool(DO.goToRegPageFromSInPopup);
    }
    
    render() {
        let contentBlockSizes = {
            width: "395px",
            height: "90px"
        };


        let titleMargins = {
            marginTop: "1px",
            marginBottom: "1px"
        }
        
        let formMargins = {
            marginTop: "5px",
            marginBottom: "5px",
        }

        return (
        <div ref={this.wholeElementRef} className="popup-universal-bg">
            <MyDraggable cancel=".popup-signin__inputs_login, .popup-signin__inputs_password">
                <div className="popup-signin">
                    <div ref={this.contentContainerRef} className="popup-signin__content" style={contentBlockSizes}>
                        <span ref={this.titleRef} className="popup-signin__title" style={titleMargins}>Пожалуйста, войдите в аккаунт:</span>
                        <span ref={this.subTitleRef} className="popup-signin__subtitle"></span>

                        <form ref={this.signInFormRef} className="popup-signin__form" style={formMargins}>
                            <div className="popup-signin__textinputs-block">
                                <div>
                                    <input 
                                    ref={this.signInFormLoginRef} 
                                    className="popup-signin__inputs_login" 
                                    name="login" type="text" 
                                    maxLength={LIMITS.loginMaxLength} 
                                    defaultValue="Login" 
                                    onFocus={this.clearLoginDefaultValue.bind(this)} 
                                    onBlur={this.restoreLoginDefaultValue.bind(this)} 
                                    onChange={this.checkLoginInputValue.bind(this)} 
                                    onKeyDown={this.signInViaEnter.bind(this)}/>

                                    <input 
                                    ref={this.signInFormPasswordRef} 
                                    className="popup-signin__inputs_password" 
                                    name="password" 
                                    title="Password" 
                                    type="password" 
                                    maxLength={LIMITS.passwordMaxLength} 
                                    defaultValue="Password" 
                                    onFocus={this.clearPasswordDefaultValue.bind(this)} 
                                    onBlur={this.restorePasswordDefaultValue.bind(this)} 
                                    onChange={this.checkPasswordInputValue.bind(this)} 
                                    onKeyDown={this.signInViaEnter.bind(this)}/>
                                </div>
                            
                                <div className="popup-signin__forgotp-container">
                                    <span className="popup-signin__ancor" onTouchEnd={this.goToRegistrationPage} onClick={this.goToRegistrationPage}>Регистрация</span>
                                    <span className="popup-signin__ancor-separ">&nbsp;|&nbsp;</span>
                                    <span className="popup-signin__ancor" onTouchEnd={this.forgotPassword} onClick={this.forgotPassword}>Забыли пароль?</span>
                                </div>
                            </div>
                            <button ref={this.signInSubmitRef} className="popup-signin__submit" onTouchEnd={this.signInSubmit} onClick={this.signInSubmit}>Войти</button>
                        </form>
                    </div>
                </div>
            </MyDraggable>
        </div>);
    }
}