import React from "react";

import {namesAndPaths as NAMES_PATHS, 
    internalAPI_commandCodes as DO,
    styles as STYLES} from "../ControlsAndAPI.js";

import "../css/styles_all.css";

/*
Принимаемые пропсы:
uniTool: <object Function>, //Функция для передачи команд родительскому элементу.
infoObject: {
    width: <number>,
    height: <number>,
    marginTop: <number>,
    marginBottom: <number>,
    marginRight: <number>,
    logoImgHeight: <number>,
    aboutAncorFontSize: <number>,
    logoNameImgWidth: <number>,
    logoNameImgHeight: <number>, 
}
*/
export default class LogoBlock extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            /**
             * @type: {number}
            */
            width: this.props.infoObject['width'], //В Main.jsx - logoBlockWidth
            /**
             * @type: {number}
            */
            height: this.props.infoObject['height'], //В Main.jsx - logoBlockHeight
            /**
             * @type: {number}
            */
            marginTop: this.props.infoObject['marginTop'], //В Main.jsx - logoBlockMarginTop
            /**
             * @type: {number}
            */
            marginBottom: this.props.infoObject['marginBottom'], //В Main.jsx - logoBlockMarginBottom
            /**
             * @type: {number}
            */
            marginRight: this.props.infoObject['marginRight'], //В Main.jsx - logoBlockMarginRight

            /**
             * @type: {number}
            */
            logoImgHeight: this.props.infoObject['logoImgHeight'], //В Main.jsx - logoImgHeight
            
            /**
             * @type: {number}
            */
            aboutAncorFontSize: this.props.infoObject['aboutAncorFontSize'], //В Main.jsx - logoAboutAncorFontSize

            /**
             * @type: {number}
            */
            logoNameImgWidth: this.props.infoObject['logoNameImgWidth'], //В Main.jsx - logoNameImgWidth
            /**
             * @type: {number}
            */
            logoNameImgHeight: this.props.infoObject['logoNameImgHeight'], //В Main.jsx - logoNameImgHeight
        }
    }
    
    shouldComponentUpdate(newProps) {
        if(this.state.width != newProps.infoObject['width']) {
            this.state.width = newProps.infoObject['width'];
            this.state.height = newProps.infoObject['height'];
            this.state.marginTop = newProps.infoObject['marginTop'];
            this.state.marginBottom = newProps.infoObject['marginBottom'];
            this.state.marginRight = newProps.infoObject['marginRight'];

            this.state.logoImgHeight = newProps.infoObject['logoImgHeight'];

            this.state.aboutAncorFontSize = newProps.infoObject['aboutAncorFontSize'];
            
            this.state.logoNameImgWidth = newProps.infoObject['logoNameImgWidth'];
            this.state.logoNameImgHeight = newProps.infoObject['logoNameImgHeight'];
            
            return true;
        }
        else return false;
    }
    
    openAboutProject(event) {
        this.props.uniTool(DO.openAboutProject);
    }
    
    render() {
        const logoBlockSizes = {
            width: this.state.width + "px",
            height: this.state.height + "px",
            marginTop: this.state.marginTop + "px",
            marginBottom: this.state.marginBottom + "px",
            marginRight: this.state.marginRight + "px",
            background: STYLES.logoBlockBackground,
            border: STYLES.logoBlockBorder,
            borderRadius: STYLES.logoBlockBorderRadius,
        };


        const logoImgSizes = {
            margin: "2px",
            width: "auto",
            height: this.state.logoImgHeight + "px",
        };
        
        const logoNameImgSizes = {
            width: this.state.logoNameImgWidth + "px",
            height: this.state.logoNameImgHeight + "px",            
        };       
        
        return (
            <div style={logoBlockSizes} className="logoblock">
                <div>
                    <img style={logoImgSizes} className="logoblock__logo-img" src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.logoImg}/>
                </div>
                <div className="logoblock__name-container">
                    <img style={logoNameImgSizes} className="logoblock__name-img" src={NAMES_PATHS.designElementsUrlPath + NAMES_PATHS.logoNameImg}/>
                    <span style={{fontSize: this.state.aboutAncorFontSize}} className="logoblock__text" onClick={this.openAboutProject.bind(this)}>О проекте</span>
                </div>
            </div>);
    }
}