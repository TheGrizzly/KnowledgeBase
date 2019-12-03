import React from 'react';
import './Button.css';

const button = (props) =>(
    <button className="btn" disabled={props.disabled} onClick={props.clicked}>{props.children}</button>
);

export default button;