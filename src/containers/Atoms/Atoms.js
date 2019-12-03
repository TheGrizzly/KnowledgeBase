import React, {Component} from 'react';
import {connect} from 'react-redux';

import Axios from 'axios';
import Atomos from '../../components/Atomos/Atomos'

class Atoms extends Component{
    constructor(){
        super();
        this.state={
            Atoms: []
        }
    }

    componentDidMount(){
        Axios.get("http://localhost:6969/atoms/").then(response => {
            console.log(response)
            const Atom2s = response.data.map(a => {
                return{
                    id: a.id,
                    name: a.name,
                    value: a.value,
                }
            });
            const newState = {
                ...this.state,
                Atoms: Atom2s
            }
            this.setState(newState);
        }).catch(err =>console.log(err));
    }

    render() {
        return (
            <div className="conainerAtom">
                <Atomos atoms={this.state.Atoms} />
            </div>
        );
    }
}

export default Atoms;