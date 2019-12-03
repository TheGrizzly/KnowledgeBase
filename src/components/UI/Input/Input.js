import React from 'react';
import './Input.css';

const Input = (props) => {
    let inputElement = null;
    
    switch(props.elementType){
        case('input'):
            inputElement = <input 
                className="Input InputElement Label" 
                {...props.elementConfig} 
                value={props.value}
                onChange={props.changed}/>
            break;
        case('textarea'):
            inputElement = <textarea 
                className="Input InputElement Label"
                {...props.elementConfig} 
                value={props.value}
                onChange={props.changed}/>
            break;
        default:
            inputElement = <input 
                className="Input InputElement Label"
                {...props.elementConfig} 
                value={props.value}
                onChange={props.changed}/>
    }

    return(
        <div className="Input">
            <label className="Label">{props.label}</label>
            {inputElement}
        </div>
    );
};

export default Input;