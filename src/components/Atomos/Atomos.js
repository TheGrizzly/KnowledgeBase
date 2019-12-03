import React from 'react';
import './Atomos.css';

const atm = (props) => {
    const atomos = [];
    console.log(atomos);
    console.log(props.atoms)
    for(let atom in props.atoms){
        console.log(atom);
        console.log(props.atomos);
        atomos.push({
            id: props.atoms[atom].id,
            name: props.atoms[atom].name,
            value: props.atoms[atom].value
        })
    }

    console.log(atomos)

    const atomOutput = atomos.map(at => {
        return (
            <span style={{
                textTransform: 'capitalize',
                display: 'inline-block',
                margin: '0 8px',
                border: '1px solid #ccc',
                padding: '5px'
                }}
                key={at.id}>ID: {at.id}, Nombre: {at.name}, Valor: {at.value}</span>
        );
    })

    return (
        <div className="Atomos">
            <p>{atomOutput}</p>
        </div>
    );
};

export default atm;