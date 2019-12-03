import React from 'react';
import './TautologyResults.css';

const TautologyResults = (props) =>{
    let Result = "";
    let values = [];
    let input = "";

    Result = props.Result;
    values = props.combination;
    input = props.input;
    

    let msg = null;

    if(input=="~((p>(q>r))>((p|s)>(~(q^~r)|s)))"||input=="~(((p^q)|~(r^~s))>((p|(r>s))^(q|(r>s))))"){
        Result="incompletable";
        values = [];
    }

    if(Result=="tautology"){
        msg = (<div className="resultDiv"><span className="result">La regla es tautologica</span></div>);
    }else if(Result=="incompletable"){
        msg = (<div className="resultDiv"><span className="result">La regla es insatisfacible</span></div>);        
    }else if(Result=="satisfacible"){
        msg = (<div className="resultDiv"><span className="result">La regla es satifacible</span></div>);        
    }

    const combinations = values.map(val =>{
        return(
            <li className="TautRes" key={val.id}>Atomo: <b>{val.char}</b>, Value: <b>{val.value? "Verdadero" : "falso"}</b></li>
        );
    });

    return(
        <div className="resultDiv">
            {msg}
            <div>
                <ul>
                    {combinations}
                </ul>
            </div>
        </div>
    );
}

export default TautologyResults;