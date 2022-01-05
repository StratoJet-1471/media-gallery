import React from "react";

import "../css/styles_all.css";

/**
 * Принятые сокращения:
 * FIL - от Full Items List;
 * SIL - от Selected Items List;
 */

/*
Принимаемые пропсы:
zIndex: <number>,
infoObject: {
    openFullItemsListPopupFunc: <object Function>,
    openSelItemsListPopupFunc: <object Function>,
    removeSelItemsFunc: <object Function>,
    downloadSelItemsFunc: <object Function>,
    optionalButtonsReactElsArr: <массив React-элементов>
}
*/
export default class ItemsManagerButtonsBlock extends React.Component {
    constructor(props) {
        super(props);

        //Функция, открывающая FIL-попап.
        this.openFILPopupFunc = this.props.infoObject.openFullItemsListPopupFunc;
        //Функция, открывающая SIL-попап.
        this.openSILPopupFunc = this.props.infoObject.openSelItemsListPopupFunc;
        //Функция, вызываемая при нажатии на кнопку удаления выделенных итемов (т.е., файлов).
        this.removeSelItemsFunc = this.props.infoObject.removeSelItemsFunc;
        ////Функция, вызываемая при нажатии на кнопку скачивания с сервера выделенных итемов (т.е., файлов).
        this.downloadSelItemsFunc = this.props.infoObject.downloadSelItemsFunc;

        //Массив React-элементов опционально добавляемых в блок кнопок.
        this.optionalButtonsReactElsArr = this.props.infoObject.optionalButtonsReactElsArr;
        
        //Рефы:
        this.selItemsManagerButtonsPlaceRef = React.createRef();
        this.removeBtnRef = React.createRef();
        this.downloadBtnRef = React.createRef();
        this.showBtnRef = React.createRef();
    }
    
    showSelItemsManagerButtons() {
        let placeForSelItemsManagerButtons = this.selItemsManagerButtonsPlaceRef.current;

        placeForSelItemsManagerButtons.appendChild(this.removeBtnRef.current);
        placeForSelItemsManagerButtons.appendChild(this.downloadBtnRef.current);
        placeForSelItemsManagerButtons.appendChild(this.showBtnRef.current);
    }
    
    hideSelItemsManagerButtons() {
        let placeForSelItemsManagerButtons = this.selItemsManagerButtonsPlaceRef.current;
        
        if(this.removeBtnRef.current.parentNode==placeForSelItemsManagerButtons && 
        this.downloadBtnRef.current.parentNode==placeForSelItemsManagerButtons &&
        this.showBtnRef.current.parentNode==placeForSelItemsManagerButtons) {
            placeForSelItemsManagerButtons.removeChild(this.removeBtnRef.current);
            placeForSelItemsManagerButtons.removeChild(this.downloadBtnRef.current);
            placeForSelItemsManagerButtons.removeChild(this.showBtnRef.current);
        }
    }
    
    render() {
        if(this.props.zIndex) 
            return (
            <div className="im__container" style={{"zIndex": this.props.zIndex}}>
                <div ref={this.selItemsManagerButtonsPlaceRef}>
                    <button tabIndex="-1" ref={this.removeBtnRef} style={{background: "radial-gradient(80% 80%, rgb(255, 0, 0), rgb(139, 0, 0))", color: "white"}} className="im__button" onClick={this.removeSelItemsFunc}>Remove</button>
                    <button tabIndex="-1" ref={this.downloadBtnRef} style={{background: "radial-gradient(80% 80%, rgb(50, 255, 50), rgb(50, 139, 50))", color: "white"}} className="im__button" onClick={this.downloadSelItemsFunc}>Download</button>
                    <button tabIndex="-1" ref={this.showBtnRef} style={{background: "radial-gradient(80% 80%, rgb(30, 144, 255), rgb(30, 84, 180))", color: "white"}} className="im__button" onClick={this.openSILPopupFunc}>Selected items</button>
                </div>
                <button tabIndex="-1" style={{background: "radial-gradient(80% 80%, rgb(90, 144, 255), rgb(90, 94, 190))", color: "white"}} className="im__button" onClick={this.openFILPopupFunc}>Full items list</button>
                {this.optionalButtonsReactElsArr}
            </div>);
            
        else return (
            <div className="im__container">
                <div ref={this.selItemsManagerButtonsPlaceRef}>
                    <button tabIndex="-1" ref={this.removeBtnRef} style={{background: "radial-gradient(80% 80%, rgb(255, 0, 0), rgb(139, 0, 0))", color: "white"}} className="im__button" onClick={this.removeSelItemsFunc}>Remove</button>
                    <button tabIndex="-1" ref={this.downloadBtnRef} style={{background: "radial-gradient(80% 80%, rgb(50, 255, 50), rgb(50, 139, 50))", color: "white"}} className="im__button" onClick={this.downloadSelItemsFunc}>Download</button>
                    <button tabIndex="-1" ref={this.showBtnRef} style={{background: "radial-gradient(80% 80%, rgb(30, 144, 255), rgb(30, 84, 180))", color: "white"}} className="im__button" onClick={this.openSILPopupFunc}>Selected items</button>
                </div>
                <button tabIndex="-1" style={{background: "radial-gradient(80% 80%, rgb(90, 144, 255), rgb(90, 94, 190))", color: "white"}} className="im__button" onClick={this.openFILPopupFunc}>Full items list</button>
                {this.optionalButtonsReactElsArr}
            </div>);
    }
}