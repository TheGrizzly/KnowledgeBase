import React from 'react';
import './Reglas.css';

const reglas = (props) => {
    const reg = [];
    for(let rule in props.reglas){
        reg.push({
            id: props.reglas[rule].id,
            name: props.reglas[rule].name,
            precursors: props.reglas[rule].precursors,
            consecuent: props.reglas[rule].consecuent
        })
    }
    console.log(reg)

    const ruleOutput = reg.map(rl => {
        return (
            <span style={{
                textTransform: 'capitalize',
                display: 'inline-block',
                margin: '0 8px',
                border: '1px solid #ccc',
                padding: '5px'
                }}
                key={rl.id}>ID: {rl.id}, Nombre: {rl.name}, Regla {rl.precursors} > {rl.consecuent}</span>
        );
    })

    return (
        <div className="Atomos">
            <p>{ruleOutput}</p>
        </div>
    );
};

export default reglas;