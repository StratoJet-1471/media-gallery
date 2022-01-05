import React from "react";

import MyDraggable from "./MyDraggable.jsx";

import {namesAndPaths as NAMES_PATHS, 
    internalAPI_commandCodes as DO} from "../ControlsAndAPI.js";

import "../css/styles_all.css";

export default class AboutProjectPopup extends React.Component {
    constructor(props) {
        super(props);

        this.wholeElementRef = React.createRef();        
        this.buttonRef = React.createRef();

        this.closePopup = this.closePopup.bind(this);
    }

    closePopup(event) {
        this.props.uniTool(DO.closeAboutProject);
    }
    
    setFocus() {
        this.buttonRef.current.focus();
    }
    
    componentDidMount() {
        this.buttonRef.current.focus();
    }
    
    render() {
        return(
        <div ref={this.wholeElementRef} className="popup-universal-bg">
            <MyDraggable>
                <div className="popup-about">
                    <div className="popup-about__textblock">
                        <div className="popup-about__title">О проекте:</div>
                        <ul>
                            <li className="popup-about__text">Мы храним ваши изображения и видео.</li>
                            <li className="popup-about__text">Мы создаём для них уникальный, атмосферный бэкграунд.</li>
                            <li className="popup-about__text">Составляйте галереи и альбомы, которые классно просматривать!</li>
                            <li className="popup-about__text">Проект развивается - предлагайте улучшения и варианты дизайна!</li>
                        </ul>
                        <ul>
                            <li className="popup-about__text">Обратная связь: <span className="popup-about__text-contacts">{NAMES_PATHS.siteEmail}</span></li>
                        </ul>
                    </div>

                    <div className="popup-about__image-container">
                        <img className="popup-about__image" src={NAMES_PATHS.designElementsUrlPath + "About-img.jpg"}/>
                    </div>

                    <div className="popup-universal-centering-container">
                        <button ref={this.buttonRef} className="popup-universal-button" onTouchEnd={this.closePopup} onClick={this.closePopup}>OK</button>
                    </div>
                </div>
            </MyDraggable>
        </div>);
    }
}