import React from "react";

import MyDraggable from "./MyDraggable.jsx";

import "../css/styles_all.css";

/**
 * Универсальный попап с одной кнопкой. Вызывая извне его метод modify(), можно задавать цвет фона и бордера, заголовок, надпись на кнопке, 
 * контент в виде массива с произвольным кол-вом строк, функцию-обработчик клика по кнопке и т.д. (см. принимаемый аргумент в modify()).
 * Если возникает потребность в нескольких попапах с разным контентом и функционалом, но одного типа (с одной кнопкой и без других
 * активных элементов), и при этом нет риска, что нужно будет одновременно открыть больше одного попапа, то можно использовать
 * один универсальный попап, просто модифицируя его от случая к случаю. 
 */
export default class UniPopupOneButton extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            buttonClickHandler: function() {},
            buttonText: "Button",
            
            titleText: "Title",
            titleBgColor: "rgb(30, 144, 255)",
            titleTextColor: "yellow",

            bgColor: "rgb(124, 155, 255)",
            borderColor: "rgb(124, 255, 255)",

            contentStrsArr: ["Popup", "", "", "", "", ""]
        }
        
        this.rowsN = 6;

        //Размеры шрифтов, отдельных символов и элементов:
        this.btnValueFontSize = "17px";
        this.btnHeight = "22px";
        this.btnValueSymbolWidth = 9;
        this.btnHorizPadding = 5; //Горизонтальные отступы в пикселях от текста кнопки до её краёв. Считаем, 
        //что справа и слева отступ один и тот же.
        this.btnMinWidth = 37;
        
        this.titleRowHeight = 30;
        this.titleFontSize = "22px";
        this.titleSymbolWidth = 18;
        
        this.contentRowHeight = 23;
        this.contentRowSymbolWidth = 10;
        this.contentRowHorizPadding = 10; //Горизонтальные отступы от крайних символов текста строки до краёв попапа.
        
        this.contentBlockVertMargin = 7;
        this.contentBlockMinHeight = 60;
        
        this.buttonsBlockHeight = 30;
        
        this.popupMinHeight = 90;
        this.popupMinWidth = 320;
        
        //РЕФЫ:
        this.popupRef = React.createRef();
        this.titleRowRef = React.createRef();
        this.titleSpanRef = React.createRef();
        this.contentBlockRef = React.createRef();
        this.buttonRef = React.createRef();

        this.rowRefsArr = [];
        for(let i=1; i<=this.rowsN; i++) {
            this.rowRefsArr.push(React.createRef());
        }

        this.onButtonClick = this.onButtonClick.bind(this);
    }
    
    onButtonClick(event) {
        this.state.buttonClickHandler();
    }
    
    /*
        Принимаемый аргумент:
        infoObject = {
            buttonClickHandler: <object Function>, 
            buttonText: <string>,
            bgColor: <string>,
            borderColor: <string>,
            titleText: <string>,
            titleBgColor: <string>,
            titleTextColor: <string>,
            contentStrsArr: [массив строк]
        }
    */    
    modify(infoObject) { 
        if(infoObject.buttonClickHandler) this.state.buttonClickHandler = infoObject.buttonClickHandler;
        if(infoObject.buttonText) {
            this.state.buttonText = infoObject.buttonText;
            this.buttonRef.current.innerText = this.state.buttonText;
            this.buttonRef.current.style.width = this.calcButtonWidth(this.state.buttonText) + "px";
        }

        if(infoObject.bgColor) {
            this.state.bgColor = infoObject.bgColor;
            this.popupRef.current.style.backgroundColor = this.state.bgColor;
        }
        if(infoObject.borderColor) {
            this.state.borderColor = infoObject.borderColor;
            this.popupRef.current.style.borderColor = this.state.borderColor;
        }
        
        if(infoObject.titleText) {
            this.state.titleText = String(infoObject.titleText);
            this.state.titleBgColor = infoObject.titleBgColor;
            this.state.titleTextColor = infoObject.titleTextColor;
            
            this.titleSpanRef.current.innerText = this.state.titleText;
            this.titleRowRef.current.style.backgroundColor = this.state.titleBgColor;
            this.titleSpanRef.current.style.color = this.state.titleTextColor;
        }
        else {
            this.state.titleText = null;
            this.titleSpanRef.current.innerText = "";
        }
        
        if(infoObject.contentStrsArr && Array.isArray(infoObject.contentStrsArr)) {
            let i=0;
            let newStrsArrLength = Math.min(this.rowsN, infoObject.contentStrsArr.length);
            
            this.contentBlockRef.current.style.height = this.calcContentBlockHeight(newStrsArrLength) + "px";
            this.popupRef.current.style.width = this.calcPopupWidth(infoObject.contentStrsArr) + "px";
            this.popupRef.current.style.height = this.calcPopupHeight(newStrsArrLength) + "px";

            while(i<newStrsArrLength) {
                this.state.contentStrsArr[i] = String(infoObject.contentStrsArr[i]);
                this.rowRefsArr[i].current.innerText = this.state.contentStrsArr[i];
                i++;
            }

            while(i<this.rowsN) {
                this.rowRefsArr[i].current.innerText = "";
                this.state.contentStrsArr[i] = "";
                i++;
            }
            
        }
        
        this.buttonRef.current.focus();
    }
    
    calcContentBlockHeight(rowsN) {
        return Math.max(rowsN*this.contentRowHeight + 2*this.contentBlockVertMargin, this.contentBlockMinHeight);
    
    }
    
    calcPopupHeight(rowsN) {
        let titleRowHeight = 0;
        if(this.state.titleText) titleRowHeight = this.titleRowHeight;
        return Math.max(this.calcContentBlockHeight(rowsN) + titleRowHeight + this.buttonsBlockHeight, this.popupMinHeight);
    }
    
    calcPopupWidth(strsArr) {
        let strWidthsArr = [];
        for(let i=0; i<strsArr.length; i++) {
            let strLength = strsArr[i].length;
            strWidthsArr.push(strLength*this.contentRowSymbolWidth);
        }
        
        let titleTextWidth = 0;
        if(this.state.titleText) titleTextWidth = this.state.titleText.length*this.titleSymbolWidth;
        strWidthsArr.push(titleTextWidth);
        
        return Math.max(this.popupMinWidth, Math.max.apply(null, strWidthsArr) + 2*this.contentRowHorizPadding);
    }
    
    calcButtonWidth(btnValue) {
        return Math.max(this.btnMinWidth, btnValue.length*this.btnValueSymbolWidth + 2*this.btnHorizPadding);
    }
    
    componentDidMount() {
        this.modify(this.props.infoObject);
    }
    
    render() {
        let popupStyle = {
            backgroundColor: this.state.bgColor,
            border: "2px solid " + this.state.borderColor,
            width: this.popupMinWidth + "px",
            height: this.popupMinHeight + "px"
        };

        let titleRowStyle = {
            width: "100%",
            marginBottom: "7px",
            backgroundColor: this.state.titleBgColor, 
            borderRadius: "9px 9px 0px 0px",
        };
        
        let titleSpanStyle = {
            color: this.state.titleTextColor,
            fontSize: this.titleFontSize,
        };
        
        let contentBlockStyle = {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: this.contentBlockMinHeight + "px",
            width: "100%"
        };

        let buttonStyle = {
            width: this.calcButtonWidth(this.state.buttonText) + "px",
            height: this.btnHeight
        }
        
        let contentTextStyle = {
            color: "white",
            fontSize: "20px"
        };

        return (
        <div className="popup-universal-bg">
            <MyDraggable>
                <div ref={this.popupRef} style={popupStyle} className="universal-popup">
                    <div ref={this.titleRowRef} style={titleRowStyle} className="popup-universal-centering-container">
                        <span ref={this.titleSpanRef} style={titleSpanStyle} className="universal-popup__title" >
                            {this.state.titleText}
                        </span>
                    </div>
                    <div ref={this.contentBlockRef} style={contentBlockStyle}>
                        <div><span ref={this.rowRefsArr[0]} style={contentTextStyle} className="universal-popup__content" >{this.state.contentStrsArr[0]}</span></div>
                        <div><span ref={this.rowRefsArr[1]} style={contentTextStyle} className="universal-popup__content" >{this.state.contentStrsArr[1]}</span></div>
                        <div><span ref={this.rowRefsArr[2]} style={contentTextStyle} className="universal-popup__content" >{this.state.contentStrsArr[2]}</span></div>
                        <div><span ref={this.rowRefsArr[3]} style={contentTextStyle} className="universal-popup__content" >{this.state.contentStrsArr[3]}</span></div>
                        <div><span ref={this.rowRefsArr[4]} style={contentTextStyle} className="universal-popup__content" >{this.state.contentStrsArr[4]}</span></div>
                        <div><span ref={this.rowRefsArr[5]} style={contentTextStyle} className="universal-popup__content" >{this.state.contentStrsArr[5]}</span></div>
                    </div>

                    <div className="popup-universal-centering-container">
                        <button ref={this.buttonRef} style={buttonStyle} className="popup-universal-button" onTouchEnd={this.onButtonClick} onClick={this.onButtonClick}>{this.state.buttonText}</button>
                    </div>
                </div>
            </MyDraggable>
        </div>);
    }
}