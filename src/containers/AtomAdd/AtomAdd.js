import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

import Axios from 'axios';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';

class AtomAdd extends Component{
    constructor(){
        super()
        this.state = {
            valueName: '',
            valueValue: '',
            Atoms: [],
            toAtoms: false
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

    handleInputName=(event)=> {
        this.setState({...this.state, valueName: event.target.value});
    }

    handleInputAtom=(event)=>{
        this.setState({...this.state, valueValue: event.target.value});
    }


    handleAddAtom=(e)=>{
        e.preventDefault();
        let name = this.state.valueName;
        let value = this.state.valueValue;
        if (value !== "" && name !== ""){
            let params = "?name=" + name + "&value=" + value
            Axios.post('http://localhost:6969/atoms/'+params).then(
                response => {
                    console.log(response.data)
                }).catch(err => {
                    console.log(err)
                });
            this.setState({...this.state, toAtoms: true});
            console.log(this.state.toAtoms)
        }
        
    }

    render(){

        let toAtoms = (
            <Redirect to="/atoms" exact />
        )

        if(!this.props.toAtoms){
            toAtoms = null;
        } 

        return(
            <div className="inputs">
                {toAtoms}
                <Input elementType="input" value={this.state.valueName} changed={this.handleInputName.bind(this)} label="Nombre del atomo" />
                <Input elementType="input" value={this.state.valueValue} changed={this.handleInputAtom.bind(this)} label="valor del atomo" />
                <button className="btn" onClick={this.handleAddAtom}>Agregar el Atomo</button>
            </div>
        );
    }
}

export default AtomAdd;