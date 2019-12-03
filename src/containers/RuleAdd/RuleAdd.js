import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

import Axios from 'axios';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';

class RuleAdd extends Component{
    constructor(){
        super()
        this.state = {
            valueName: '',
            valueValue: '',
            Rules: [],
            Atoms: [],
            toRules: false
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

    handleAddRule=(e)=>{
        e.preventDefault();
        let name = this.state.valueName;
        let value = this.state.valueValue;
        let splits = value.split('>');
        console.log(splits);
        console.log(splits.length)

        if(splits.length!==2){
            console.log(splits.length);
            console.log("Not Allowed");
        }else{
            let tempc = splits[1].trim();
            console.log(tempc);
            let tempp = splits[0].trim();
            console.log(tempp);
            let splits1 = tempc.split('&');
            let splits3 = tempc.split(' ');
            let splits4 = tempc.split('(');
            let splits6 = tempc.split('|');
            let splits5 = tempc.split(')');
            let splits7 = tempc.split('-');
            let splits13 = tempp.split('&');
            let splits12 = tempp.split(' ');
            let splits11 = tempp.split('(');
            let splits10 = tempp.split('|');
            let splits9 = tempp.split(')');
            let splits8 = tempp.split('-');
            console.log(splits1);
            if(splits1.length !==1 || splits3.length !==1 || splits4.length !==1 || splits6.length !==1 || splits5.length !==1 || splits7.length !==1 || splits8.length !==1 || splits9.length !==1 || splits10.length !==1 || splits11.length !==1 || splits12.length !==1 || splits13.length !==1){
                console.log("Not Allowed");
                console.log(splits1);
                console.log(splits3);
                console.log(splits4);
                console.log(splits5);
                console.log(splits6);
                console.log(splits7);
                console.log(splits8);
                console.log(splits9);
                console.log(splits10);
                console.log(splits11);
                console.log(splits12);
                console.log(splits13);
            }else{
                let consecuent = tempc;
                let precursors = tempp;
                let atoms = precursors.split('^');
                for(let i=0; i<atoms.length; i++){
                    if(atoms[i].charAt(0)==='~'){
                        atoms[i] = atoms[i].substring(1,atoms[i].length);
                    }
                }
                console.log(atoms)
                let consecuent2 = consecuent.trim("~");
                let x = atoms.length;
                let y = 0;
                let w = 0;
                for(let i = 0; i<this.state.Atoms.length; i++){
                    if(atoms.includes(this.state.Atoms[i].name))
                        y++

                    if(this.state.Atoms[i].name === consecuent2)
                        w++
                }


                if(y!==x || w!==1){
                    console.log("Agrega todos los atomos antes de meter la regla")
                }else{
                    let params = "?name=" + name + "&precursors=" + precursors +"&consecuent=" +consecuent;
                    Axios.post('http://localhost:6969/rules/'+params).then(
                        response => {
                            console.log(response.data);
                        }).catch(err => {
                            console.log(err);
                        });
                    this.setState({...this.state, toRules: true});
                    console.log(this.state.toRules)
                }
            }
        }
    }

    render(){
        let toAtoms = (
            <Redirect to="/rules" exact />
        )

        if(!this.props.toRules){
            toAtoms = null;
        } 

        return(
            <div className="inputs">
                {toAtoms}
                <Input elementType="input" value={this.state.valueName} changed={this.handleInputName.bind(this)} label="Nombre de la regla" />
                <Input elementType="input" value={this.state.valueValue} changed={this.handleInputAtom.bind(this)} label="Valor de la regla" />
                <button className="btn" onClick={this.handleAddRule}>Agregar Regla</button>
            </div>
        );
    }
}

export default RuleAdd;