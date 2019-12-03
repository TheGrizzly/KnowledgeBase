import React, {Component} from 'react';

import Axios from 'axios';
import Reglas from '../../components/Reglas/Reglas';

class Rules extends Component{
    constructor(){
        super();
        this.state= {
            Rules: []
        }
    }

    componentDidMount(){
        Axios.get("http://localhost:6969/rules/").then(response=>{
            const Rules = response.data.map(r => {
                return{
                    id: r.id,
                    name: r.name,
                    precursors: r.precursors,
                    consecuent: r.consecuent,
                }
            });
            const newState = {
                ...this.state,
                Rules: Rules
            }
        
            this.setState(newState);
        }).catch(err =>console.log(err))
    }

    render (){
        return(
            <div>
                <Reglas reglas={this.state.Rules} />
            </div>
        );
    }
}

export default Rules;