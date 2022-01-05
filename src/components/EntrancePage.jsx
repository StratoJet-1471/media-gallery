import React from "react";

import {namesAndPaths as NAMES_PATHS,
    internalAPI_commandCodes as DO, 
    internalAPI_specialUserIDValues as SPECIAL_UID} from "../ControlsAndAPI.js";

import LogoBlock from "./LogoBlock.jsx";
import SignInBlock from "./SignInBlock.jsx";

import "../css/styles_all.css";

/*
Принимаемые пропсы:
uniTool: <object Function>, //Функция для передачи команд родительскому элементу.
infoObject: {
    adaptParams: {
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
export default class EntrancePage extends React.Component {
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
            
        };

        if(!this.state.userInfoObject.userID)  this.state.userInfoObject.userID = SPECIAL_UID.unauthorised;
        
    }

    makeNumberFromPxSize(pxSize) {//Обрезает "px" в размере и превращает его в число.
        return Number(pxSize.substr(0, pxSize.length-2));
    }

    shouldComponentUpdate(newProps) {
        let shouldUpdate = false;
        const comparingValueNumeric = this.makeNumberFromPxSize(this.state.styles.epCentralImgWrapperWidth);
        
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


    universalTool(command, infoArgument) {//Ф-я, получающая сигналы от элементов ниже по иерархии. 
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
          
        const signInBlockInfoObject = {
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
        };


        const epCentralImgWrapperSizes = {
            width: this.state.styles.epCentralImgWrapperWidth,
            height: this.state.styles.epCentralImgWrapperHeight,
        };

//???
        //Хотел вливать объект с zIndex и animation в один общий объект с width и height с помощью
        //Object.assign() прямо в пропсе style в каждом рисунке - но что-то не работает. Пришлось
        //сделать для каждого рисунка свой объект со стилями.
        const centralImgLayer3_Style = { //Bottom layer
            zIndex: 0,
            width: this.state.styles.epCentralImgWidth,
            height: this.state.styles.epCentralImgHeight,
        };
        const centralImgLayer2_Style = { //Middle layer
            zIndex: 1,
            width: this.state.styles.epCentralImgWidth,
            height: this.state.styles.epCentralImgHeight,
            animation: "centralImgAnim_middleLayer 30s linear infinite normal",
        };
        const centralImgLayer1_Style = { //Top layer
            zIndex: 2,
            width: this.state.styles.epCentralImgWidth,
            height: this.state.styles.epCentralImgHeight,
            animation: "centralImgAnim_topLayer 30s linear infinite normal",
        };
        
        const bgImgMinHeight = (this.makeNumberFromPxSize(epCentralImgWrapperSizes.height) + this.state.styles.logoBlockMarginBottom + this.state.styles.logoBlockHeight + this.state.styles.logoBlockMarginTop + 100) + "px"; //+100 - на всякий случай, т.к. на телефоне получается не очень хорошо.

        return (
        <div style={{background: NAMES_PATHS.backgroundColor}} className="ep__body">
            <img style={{zIndex: 0, minHeight: bgImgMinHeight}} className="ep__background-image" src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.backgroundImg}/>
            
            <div style={{zIndex: 1}} className="ep__content-container">
                <div className="ep__header">
                    <LogoBlock infoObject={logoBlockInfoObject} uniTool={this.universalTool.bind(this)}/>

                    <SignInBlock infoObject={signInBlockInfoObject} uniTool={this.universalTool.bind(this)}/>
                </div>
                

                <div style={epCentralImgWrapperSizes} className="ep__central-image-wrapper">
                    <img style={centralImgLayer3_Style} className="ep__central-image" src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.entrancePageCentralImg_Layer3_Picture}/>
                    <img style={centralImgLayer2_Style} className="ep__central-image" src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.entrancePageCentralImg_Layer2_Picture}/>
                    <img style={centralImgLayer1_Style} className="ep__central-image" src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.entrancePageCentralImg_Layer1_Picture}/>
                </div>
 
            </div>
        </div>);
    }
}