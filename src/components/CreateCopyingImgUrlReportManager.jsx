import React from "react";

export default function createCopyingImgUrlReportManager(reportParentElRef, stylesInfo) {
    return {
        //Префикс "_" означант, что св-во предназначено для использования только внутри объекта. Обращаться к нему извне не следует.
        //Есть такое широко известное соглашение.
        _reportRef: React.createRef(),
        _timer: null,
        
        createReportElement: function() {
            return (
                <div ref={this._reportRef} style={stylesInfo.reportBodyStyle} onClick={this.forceHideCopyReport.bind(this)}>
                    <span style={stylesInfo.reportTextStyle}>Ссылка скопирована</span>
                </div>);
        },
        
        showCopyReport: function() {
            if(this._reportRef.current && 
            reportParentElRef.current &&
            this._reportRef.current.parentNode!==reportParentElRef.current) {                    
                reportParentElRef.current.appendChild(this._reportRef.current);
                this._timer = setTimeout(this.hideCopyReport.bind(this), 800);
            }
            else if(this._reportRef.current && 
            reportParentElRef.current &&
            this._reportRef.current.parentNode===reportParentElRef.current) {
                clearTimeout(this._timer);
                this._timer = setTimeout(this.hideCopyReport.bind(this), 800);
            }
        },
        
        forceHideCopyReport: function() {
            if(this._timer) clearTimeout(this._timer);
            this.hideCopyReport();
        },
        
        hideCopyReport: function() {
            if(this._reportRef.current && this._reportRef.current.parentNode===reportParentElRef.current)
                reportParentElRef.current.removeChild(this._reportRef.current);
        },
    };
}
