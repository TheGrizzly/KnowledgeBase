import React from 'react';

const ResultsAtoms = (props) => {
    let AtomValues = [];
    let id = 0;
    props.AtomValues.forEach(at => {
        AtomValues.push({
            id: id,
            name: at.name,
            value: at.value
        });
        id++;
    });

    const valuesOutput = AtomValues.map(at => {
        return (
            <li className="AtomRes" key={at.id}>Atomo <b>{at.name}</b>: <b>{at.value}</b></li>
        );
    });

    return (
        <div className="result">
            <ul>
                {valuesOutput}
            </ul>
        </div>
    );
};

export default ResultsAtoms;