import React from "react";
import Draggable from 'react-draggable';

export default function MyDraggable(props) {
    let basicProps = {};

    if(props.axis===undefined) basicProps.axis = "both";
    if(props.bounds===undefined) basicProps.bounds = "parent";
    if(props.handle===undefined) basicProps.handle = "div";
    if(props.grid===undefined) basicProps.grid = [10, 10];

    return (
        <Draggable {...basicProps} {...props}>
            {props.children}
        </Draggable>
    );
}