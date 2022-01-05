import React from "react";

import { namesAndPaths as NAMES_PATHS} from "../ControlsAndAPI.js";

import "../css/styles_all.css";

/*
Принимаемые пропсы:
info = {
    currentPage: <number>,
    allPagesNumber: <number>,
    linksInBlock: <number>,
    urlPreform: <string>,
    history: <объект истории браузера history, создаваемый ф-ей createBrowserHistory() из библиотеки react-router>,
}
*/
export default class LinksToPagesBlock extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            currentPage: 1,
            allPagesNumber: 1,
            linksInBlock: 5,
            urlPreform: null,
        };

        this.goToPage = this.goToPage.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
    //Вообще эта ф-я служит для приведения объекта this.state (внутри ф-и - state, т.к. она статическая, и this
    //в неё использовать нельзя) в соответствие пропсам. Ф-я возвращает либо обновлённый объект state, либо null,
    //если обновлять ничего не нужно.
        let newCurrentPage = state.currentPage;
        let newAllPagesNumber = state.allPagesNumber;
        let newLinksInBlock = state.linksInBlock;
        let newUrlPreform = state.urlPreform;
        if(props.info.currentPage && !isNaN(props.info.currentPage) && state.currentPage!=props.info.currentPage) newCurrentPage = props.info.currentPage;
        if(props.info.allPagesNumber && !isNaN(props.info.allPagesNumber) && state.allPagesNumber!=props.info.allPagesNumber) newAllPagesNumber = props.info.allPagesNumber;
        if(props.info.linksInBlock && !isNaN(props.info.linksInBlock) && state.linksInBlock!=props.info.linksInBlock) newLinksInBlock = props.info.linksInBlock;
        if(props.info.urlPreform && state.urlPreform!=props.info.urlPreform) newUrlPreform = props.info.urlPreform;

        return {...state, ...{currentPage: newCurrentPage, allPagesNumber: newAllPagesNumber, linksInBlock: newLinksInBlock, urlPreform: newUrlPreform}};
    }

    makeButtonsArr() {
        //Для удобства, чтоб не писать всюду "this.state..."
        //const currentPage = this.state.currentPage;
        //const allPagesNumber = this.state.allPagesNumber;
        //const linksInBlock = this.state.linksInBlock;

        const {currentPage, allPagesNumber, linksInBlock} = this.state;

        let firstPageInBlock, lastPageInBlock;

        let buttons = [];
        
        if(allPagesNumber <= linksInBlock) {
            firstPageInBlock = 1;
            lastPageInBlock = allPagesNumber;
        }
        else {
            let leftPagesOffset, rightPagesOffset;
            if(linksInBlock % 2) {//linksInBlock нечётный.
                leftPagesOffset = (linksInBlock-1)/2;
                rightPagesOffset = leftPagesOffset;
            }
            else {//linksInBlock чётный.
                leftPagesOffset = linksInBlock/2 - 1;
                rightPagesOffset = linksInBlock/2;
            }
                
            firstPageInBlock = currentPage - leftPagesOffset;
            lastPageInBlock = currentPage + rightPagesOffset;
                
            if(firstPageInBlock < 1) {
               firstPageInBlock = 1;
               lastPageInBlock = linksInBlock;
            }
            if(lastPageInBlock > allPagesNumber) {
                lastPageInBlock = allPagesNumber;
                firstPageInBlock = allPagesNumber - linksInBlock + 1;
            }                
        }

        if(firstPageInBlock > 1) {
            const linkToPageElement = (
            <div key="left_arrow" className="pageslist__toedgepage-btn-container">
                <img name="1" className="pageslist__toedgepage-btn" src={NAMES_PATHS.designElementsUrlPath + "Arrow-pglist-left.png"} title="На первую страницу" onClick={this.goToPage}/>
            </div>);
            
            buttons.push(linkToPageElement);
        }

         
        for(let i=firstPageInBlock; i<=lastPageInBlock; i++) {
            let linkToPageElement;

            if(i==currentPage) 
                linkToPageElement = <button key={i} name={i} tabIndex="-1" className="pageslist__button_active" disabled> {i} </button>;
            else linkToPageElement = <button key={i} name={i} tabIndex="-1" className="pageslist__button" onClick={this.goToPage}> {i} </button>;
            
            buttons.push(linkToPageElement);
        }
        
        if(lastPageInBlock < allPagesNumber) {
            const linkToPageElement = (
            <div key="right_arrow" className="pageslist__toedgepage-btn-container">
                <img name={allPagesNumber} className="pageslist__toedgepage-btn" src={NAMES_PATHS.designElementsUrlPath + "Arrow-pglist-right.png"} title={"На последнюю страницу (стр. " + allPagesNumber + ")"} onClick={this.goToPage}/>
            </div>);
          
            buttons.push(linkToPageElement);
        }

        return buttons;
    }

    goToPage(event) {
        const linkTo = this.state.urlPreform ? (this.state.urlPreform + event.target.name) : "";
        this.props.info.history.push(linkTo);
    }
    
    render() {
        return <React.Fragment>
            {this.makeButtonsArr()}
        </React.Fragment>;
    }
}