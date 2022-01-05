import React from "react";

import MyDraggable from "./MyDraggable.jsx";

import "../css/styles_all.css";

/**
 * Универсальный попап с двумя кнопками. Вызывая извне его метод modify(), можно задавать цвет фона и бордера, заголовок, надписи на кнопках, 
 * контент в виде массива с произвольным кол-вом строк, функции-обработчики кликов по кнопкам и т.д. (см. принимаемый аргумент в modify()).
 * Если возникает потребность в нескольких попапах с разным контентом и функционалом, но одного типа (с двумя кнопками и без других
 * активных элементов), и при этом нет риска, что нужно будет одновременно открыть больше одного попапа, то можно использовать
 * один универсальный попап, просто модифицируя его от случая к случаю. 
 */
export default class UniPopupTwoButtons extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            button1_ClickHandler: function() {},
            button2_ClickHandler: function() {},
            button1Text: "Btn1",
            button2Text: "Btn2",

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
        this.contentRowHorizPadding = 10; //Горизотнатльные отступы от крайних символов текста строки до краёв попапа.
        
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
        this.button1Ref = React.createRef();
        this.button2Ref = React.createRef();
        this.rowRefsArr = [];

        for(let i=1; i<=this.rowsN; i++) {
            this.rowRefsArr.push(React.createRef());
        }

        this.onButton1Click = this.onButton1Click.bind(this);
        this.onButton2Click = this.onButton2Click.bind(this);
    }
    
    onButton1Click(event) {
        this.state.button1_ClickHandler();
    }
    
    onButton2Click(event) {
        this.state.button2_ClickHandler();
    }
    
    /*
        Принимаемый аргумент:
        infoObject = {
            button1_ClickHandler: <object Function>, 
            button2_ClickHandler: <object Function>, 
            button1Text: <string>,
            button2Text: <string>,
            bgColor: <string>,
            borderColor: <string>,
            titleText: <string>,
            titleBgColor: <string>,
            titleTextColor: <string>,
            contentStrsArr: [массив строк]
        }
    */
    modify(infoObject) { 
        if(infoObject.button1_ClickHandler) this.state.button1_ClickHandler = infoObject.button1_ClickHandler;
        if(infoObject.button2_ClickHandler) this.state.button2_ClickHandler = infoObject.button2_ClickHandler;
        if(infoObject.button1Text) {
            this.state.button1Text = infoObject.button1Text;
            this.button1Ref.current.innerText = this.state.button1Text;
        }
        if(infoObject.button2Text) {
            this.state.button2Text = infoObject.button2Text;
            this.button2Ref.current.innerText = this.state.button2Text;
        }
        if(infoObject.button1Text || infoObject.button2Text)
        {
            let btnsWidth = this.calcButtonsWidth([this.state.button1Text, this.state.button2Text]) + "px";
            this.button1Ref.current.style.width = btnsWidth;
            this.button2Ref.current.style.width = btnsWidth;
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
        
        this.button2Ref.current.focus();
    }

//=============================================================
//Блок кода, который будет одинаков в UniPopupTwoButtons.jsx и UniPopupOneButton.jsx.
//Ради этого маленького куска не стоит объединять UniPopupTwoButtons.jsx и UniPopupOneButton.jsx в один универсальный
//попап. Также я не думаю, что столь маленький кусок стоит выносить в отдельный модуль.
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
//===========================================================
    
    
    calcButtonsWidth(btnValsArr) { //Мы считаем, что в попапе ширина обеих кнопок д.б. одинаковой. Так что 
    //берём наибольшую.
        let btnWidthsArr = [];
        for(let i=0; i<btnValsArr.length; i++) {
            let btnValueLength = btnValsArr[i].length;
            btnWidthsArr.push(btnValueLength*this.btnValueSymbolWidth + 2*this.btnHorizPadding);
        }
        
        return Math.max(this.btnMinWidth, Math.max.apply(null, btnWidthsArr));
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
            width: this.calcButtonsWidth([this.state.button1Text, this.state.button2Text]) + "px",
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
                        <button ref={this.button1Ref} style={buttonStyle} className="popup-universal-button" onTouchEnd={this.onButton1Click} onClick={this.onButton1Click}>{this.state.button1Text}</button>
                        <button ref={this.button2Ref} style={buttonStyle} className="popup-universal-button" onTouchEnd={this.onButton2Click} onClick={this.onButton2Click}>{this.state.button2Text}</button>
                    </div>
                </div>
            </MyDraggable>
        </div>);
    }
    
}