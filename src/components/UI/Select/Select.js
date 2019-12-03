import React from 'react';
import './Select.css';
import Aux from '../../../hoc/Aux/Aux';

const SelectDropDown = (props) =>{
    let keyValues = [];
    let i =0;
    props.consecuents.forEach(cons => {
        keyValues.push({
            id: i,
            con: cons
        });
        i++;
    });

    const options = keyValues.map(elem =>{
        return (
            <option key={elem.id} value={elem.id}>{elem.con.name}</option>
        );
    });

    return (
        <Aux>
            {options}
        </Aux>
    );
}

export default SelectDropDown;