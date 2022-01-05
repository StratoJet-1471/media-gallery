import React from "react";

import { limits as LIMITS,
    internalAPI_commandCodes as DO, 
    internalAPI_specialUserIDValues as SPECIAL_UID} from "../ControlsAndAPI.js";

import "../css/styles_all.css";

/*
Принимаемые пропсы:
uniTool: <object Function>, //Функция для передачи команд родительскому элементу.
infoObject: {
    width: <number>,
    height: <number>,
    marginTop: <number>,
    marginBottom: <number>,
    marginLeft: <number>,

    ancorMarginLeft: <number>,
    ancorMarginRight: <number>,
    ancorFontSize: <number>,
            
    textInputsWidth: <number>,
    textInputsHeight: <number>,
    textInputsMarginLeft: <number>,
    textInputsMarginRight: <number>,
            
    userInfoObject: {
        userID: <number>,
        login: <string>,
        email: <string>,
        name: <string>,
        userRegDate: <object Date>,
    }
}
*/
export default class SignInBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            /**
             * @type: {number}
            */
            width: this.props.infoObject['width'], 
            /**
             * @type: {number}
            */
            height: this.props.infoObject['height'],
            /**
             * @type: {number}
            */
            marginTop: this.props.infoObject['marginTop'],
            /**
             * @type: {number}
            */
            marginBottom: this.props.infoObject['marginBottom'],
            /**
             * @type: {number}
            */
            marginLeft: this.props.infoObject['marginLeft'],
            
            /**
             * @type: {number}
            */
            textInputsWidth: this.props.infoObject['textInputsWidth'],
            /**
             * @type: {number}
            */
            textInputsHeight: this.props.infoObject['textInputsHeight'],
            /**
             * @type: {number}
            */
            textInputsMarginLeft: this.props.infoObject['textInputsMarginLeft'],
            /**
             * @type: {number}
            */
            textInputsMarginRight: this.props.infoObject['textInputsMarginRight'],

            /**
             * @type: {number}
            */
            ancorMarginLeft: this.props.infoObject['ancorMarginLeft'],
            /**
             * @type: {number}
            */
            ancorMarginRight: this.props.infoObject['ancorMarginRight'],
            /**
             * @type: {number}
            */
            ancorFontSize: this.props.infoObject['ancorFontSize'],                

            isRegPage: false,
            
            signInFormDisabled: false,
            
            userInfoObject: {
                userID: this.props.infoObject.userInfoObject.userID,
                login: this.props.infoObject.userInfoObject.login,
                email: this.props.infoObject.userInfoObject.email,
                name: this.props.infoObject.userInfoObject.name,
                userRegDate: this.props.infoObject.userInfoObject.userRegDate,
            },
            
            signInLoginCleanerCount: 0,
            signInPasswCleanerCount: 0,
        }
        
        if(this.props.infoObject["isRegPage"]) this.state.isRegPage = true;
        

        this.signInFormRef = React.createRef();
        this.signInFormLoginRef = React.createRef();
        this.signInFormPasswordRef = React.createRef();
        this.signInSubmitRef = React.createRef();
    
        if(!this.state.userInfoObject.userID)  this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;
    }
    
    disableSignInForm() {
        this.state.signInFormDisabled = true;
        this.signInSubmitRef.current.setAttribute("disabled", true);
    }
    enableSignInForm() {
        this.state.signInFormDisabled = false;
        this.signInSubmitRef.current.removeAttribute("disabled");
    }
    
    shouldComponentUpdate(newProps) {
        let shouldUpdate = false;

        if(this.state.width != newProps.infoObject['width']) {
            this.state.width = newProps.infoObject['width'];
            this.state.height = newProps.infoObject['height'];
            this.state.marginTop = newProps.infoObject['marginTop'];
            this.state.marginBottom = newProps.infoObject['marginBottom'];
            this.state.marginLeft = newProps.infoObject['marginLeft'];
            
            this.state.textInputsWidth = newProps.infoObject['textInputsWidth'];
            this.state.textInputsHeight = newProps.infoObject['textInputsHeight'];
            this.state.textInputsMarginLeft = newProps.infoObject['textInputsMarginLeft'];
            this.state.textInputsMarginRight = newProps.infoObject['textInputsMarginRight'];

            this.state.ancorMarginLeft = newProps.infoObject['ancorMarginLeft'];
            this.state.ancorMarginRight = newProps.infoObject['ancorMarginRight'];
            this.state.ancorFontSize = newProps.infoObject['ancorFontSize'];
            
            shouldUpdate = true;
        } 
        
        if(this.state.userInfoObject.userID!=newProps.infoObject.userInfoObject.userID) {
            if(newProps.infoObject.userInfoObject.userID==SPECIAL_UID.signingIn)
                this.disableSignInForm();
            else if(newProps.infoObject.userInfoObject.userID==SPECIAL_UID.unauthorised) {
                if(this.state.userInfoObject.userID==SPECIAL_UID.signingIn) //Возвращение к SPECIAL_UID.unauthorised
                //произошло не при разлогинивании, а при неудачной попытке залогиниться. В этом случае 
                //перерисовывать ничего не надо.
                    this.enableSignInForm();
                else shouldUpdate = true; //А вот это было разлогинивание.
            }
            else {//Залогинивание.
                this.state.signInFormDisabled = false; //Параметр был true, когда шёл процесс авторизации, теперь 
                //надо вернуть в false.
                shouldUpdate = true; 
            }
            
            this.state.userInfoObject.userID = newProps.infoObject.userInfoObject.userID;
            this.state.userInfoObject.login = newProps.infoObject.userInfoObject.login;
            this.state.userInfoObject.email = newProps.infoObject.userInfoObject.email;
            this.state.userInfoObject.name = newProps.infoObject.userInfoObject.name;
            this.state.userInfoObject.userRegDate = newProps.infoObject.userInfoObject.userRegDate;
        }
        
        return shouldUpdate;
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
    
    sendSignInFormData() {
        if(!this.state.signInFormDisabled) {
            let fData = new FormData(this.signInFormRef.current);

            this.props.uniTool(DO.signIn, fData);

            this.disableSignInForm();
        }
    }
    
    //Проверяет данные формы авторизации перед отправкой и решает, корректны ли они.
    checkSInFormData() {
        let dataIsCorrect = true;
        
        if(this.signInFormLoginRef.current.value.length < LIMITS.loginMinLength || this.signInFormLoginRef.current.value.length > LIMITS.loginMaxLength)
            dataIsCorrect = false;
            
        if(this.signInFormPasswordRef.current.value.length < LIMITS.passwordMinLength || this.signInFormPasswordRef.current.value.length > LIMITS.passwordMaxLength)
            dataIsCorrect = false;
            
        return dataIsCorrect;
    }
    

    
    goToRegPage(event) {
        this.props.uniTool(DO.goToRegPage);
    }
    
    goToMainPage(event) {
        this.props.uniTool(DO.goToMainPage);
    }

    signOut(event) {
        this.state.signInLoginCleanerCount = 0;
        this.state.signInPasswCleanerCount = 0;
        
        this.props.uniTool(DO.signOut);
    }
    
    showUserProfile(event) {
        this.props.uniTool(DO.openUserProfile);
    }
    
    goToGallery(event) {
        this.props.uniTool(DO.goToGallery);
    }

    forgotPassword(event) {
        this.props.uniTool(DO.openForgottenPswPopup);
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

    componentDidMount() {
        if(this.state.userInfoObject.userID==SPECIAL_UID.signingIn) this.disableSignInForm();
    }
    
    componentDidUpdate() {
        this.state.signInLoginCleanerCount = 0;
        this.state.signInPasswCleanerCount = 0;        
    }
    
    render() {
        let signInBlockSizes = {
            width: this.state.width + "px",
            height: this.state.height + "px",
            marginTop: this.state.marginTop + "px",
            marginBottom: this.state.marginBottom + "px",
            marginLeft: this.state.marginLeft + "px",
        };
        
        let ancorSizes = {
            marginLeft: this.state.ancorMarginLeft + "px",
            marginRight: this.state.ancorMarginRight + "px",
            fontSize: this.state.ancorFontSize + "px",
        };
        
        let textInputSizes = {
            width: this.state.textInputsWidth + "px",
            height: this.state.textInputsHeight + "px",
            marginLeft: this.state.textInputsMarginLeft + "px",
            marginRight: this.state.textInputsMarginRight + "px",
            boxSizing: "border-box", //Если это не указать, то в сборке от вебпак 5 этот инпут будет заметно отличаться от собранного в вебпак 4.
            //Инфа о box-sizing: border-box - http://htmlbook.ru/css/box-sizing, https://w3schoolsrus.github.io/css/css3_box-sizing.html#gsc.tab=0
        };

       
        //Если незалогинен или идёт процесс залогинивания:
        if(this.state.userInfoObject.userID==SPECIAL_UID.unauthorised || this.state.userInfoObject.userID==SPECIAL_UID.signingIn) {
            let leftBottomAncor = <span style={ancorSizes} className="signinblock__ancor" onClick={this.goToRegPage.bind(this)}>Регистрация</span>;
            if(this.state.isRegPage) leftBottomAncor = <span style={ancorSizes} className="signinblock__ancor" onClick={this.goToMainPage.bind(this)}>На главную</span>;
            return (
            <div style={signInBlockSizes} className="signinblock">
                <form ref={this.signInFormRef}>
                    <input tabIndex="-1" type="text" ref={this.signInFormLoginRef} style={textInputSizes} name="login" maxLength={LIMITS.loginMaxLength} defaultValue="Login" onFocus={this.clearLoginDefaultValue.bind(this)} onBlur={this.restoreLoginDefaultValue.bind(this)} onChange={this.checkLoginInputValue.bind(this)} onKeyDown={this.signInViaEnter.bind(this)}/>
                    <input tabIndex="-1" name="password" ref={this.signInFormPasswordRef} style={textInputSizes} type="password" maxLength={LIMITS.passwordMaxLength} defaultValue="Password" onFocus={this.clearPasswordDefaultValue.bind(this)} onBlur={this.restorePasswordDefaultValue.bind(this)} onChange={this.checkPasswordInputValue.bind(this)} onKeyDown={this.signInViaEnter.bind(this)}/>
                    <input tabIndex="-1" type="button" ref={this.signInSubmitRef} className="signinblock__submit" value="Войти" onClick={this.signInSubmit.bind(this)}/>
                </form>
                <div>
                    {leftBottomAncor}
                    <span style={{fontSize: this.state.ancorFontSize}} className="signinblock__ancors-separator"> | </span>
                    <span style={ancorSizes} className="signinblock__ancor" onClick={this.forgotPassword.bind(this)}>Забыли пароль?</span>
                </div>        
            </div>);
        }
        //Если залогинен:
        else return (
            <div style={signInBlockSizes} className="signinblock-auth">
                <div className="signinblock-auth__unamerow">
                    <span className="signinblock-auth__unametext">Здравствуйте, {this.state.userInfoObject.name}</span>
                </div>
                <div className="signinblock-auth__ancorsrow">
                    <span style={ancorSizes} className="signinblock__ancor" onClick={this.goToGallery.bind(this)}>Галерея</span>
                    <span style={{fontSize: this.state.ancorFontSize}} className="signinblock__ancors-separator"> | </span>
                    <span style={ancorSizes} className="signinblock__ancor_disabled">Видео</span>
                    <span style={{fontSize: this.state.ancorFontSize}} className="signinblock__ancors-separator"> | </span>
                    <span style={ancorSizes} className="signinblock__ancor" onClick={this.showUserProfile.bind(this)}>Профиль</span>                
                    <span style={{fontSize: this.state.ancorFontSize}} className="signinblock__ancors-separator"> | </span>
                    <span style={ancorSizes} className="signinblock__ancor" onClick={this.signOut.bind(this)}><font color="yellow">Выйти</font></span>
                </div>
            </div>);
        
    }
}