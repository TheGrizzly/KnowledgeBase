import React, {Component} from 'react';
import './ForwardChaining.css';
import Axios from 'axios';
import ResultAtom from '../../components/ResultAtom/ResultAtom';

class ForwardChaining extends Component{
    constructor(){
        super()
        this.state = {
            Atoms: [],
            Rules: [],
            OnlyAtoms: [],
            MiddleConsecuents: [],
            FinalConsecuents: [],
            CurrentAtom: "",
            AtomsValues: [],
            RulesToCheck: [],
            LogicError: false,
            chainingStarted: false,
            finalWasFound: false
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

    classifyAtoms = () =>{
        let atoms = this.state.Atoms;
        let rules = this.state.Rules;
        let precursors = [];
        let consecuents = [];
        rules.forEach(rule => {
            let pr = rule.precursors;
            let pr2 = pr.split('^');
            pr2.forEach(atom =>{
                if(atom.charAt(0)==='~')
                    atom = atom.substring(1,atom.length);
                precursors.push(atom);
            });

            let consecuent = rule.consecuent;
            if(consecuent.charAt(0)==='~')
                consecuent = consecuent.substring(1,consecuent.lenght);
            consecuents.push(consecuent);
        });

        let onlyAtoms = [];
        let middleAtoms = [];
        let FinalAtoms = [];
        atoms.forEach(element => {
            if(precursors.includes(element.name) && consecuents.includes(element.name)){
                middleAtoms.push(element.name);
            }else if(precursors.includes(element.name)){
                onlyAtoms.push(element.name);
            }else if(consecuents.includes(element.name)){
                FinalAtoms.push(element.name);
            }
        });
        console.log(onlyAtoms);
        console.log(middleAtoms);
        console.log(FinalAtoms);
        let oldState = this.state;
        oldState.OnlyAtoms = onlyAtoms;
        oldState.MiddleConsecuents = middleAtoms;
        oldState.FinalConsecuents = FinalAtoms;
        console.log(oldState.OnlyAtoms);
        this.setState(oldState);
    }

    accomodateRules = () =>{
        let rules = this.state.Rules;
        let rulesStructured = [];
        rules.forEach(rule => {
            let cuent = rule.consecuent;
            let cuentValue = "true";
            if (cuent.charAt(0)==='~'){
                cuent = cuent.substring(1,cuent.lenght);
                cuentValue = "false";
            }
            let prec = rule.precursors.split('^');
            let atoms = [];
            prec.forEach(atom => {
                let at = [];
                let bool = "true"
                if(atom.charAt(0)==='~'){
                    atom = atom.substring(1,atom.length);
                    bool = "false";
                }
                at.push(atom);
                at.push(bool);
                atoms.push(at);
            });
            let structureRule = {
                consecuent: [cuent, cuentValue],
                precursors: atoms
            };
            rulesStructured.push(structureRule);
        });
        let oldState = this.state;
        oldState.RulesToCheck = rulesStructured;
        this.setState(oldState);
    }

    selectRandomAtom = () =>{
        let numberOfInitAtoms = this.state.OnlyAtoms.length;
        let numMiddleAtoms = this.state.MiddleConsecuents.length;
        let numLastAtoms = this.state.FinalConsecuents.length;
        if(numberOfInitAtoms>0){
            //select a random
            let index = Math.floor(Math.random() * numberOfInitAtoms);
            let initAtoms = this.state.OnlyAtoms;
            let atomSelected = initAtoms[index];
            initAtoms.splice(index,1);
            let oldState = this.state;
            oldState.OnlyAtoms = initAtoms;
            oldState.CurrentAtom = atomSelected;
            this.setState(oldState);
        }else if(this.state.MiddleConsecuents.length>0){
            //select a random
            let index = Math.floor(Math.random() * numMiddleAtoms);
            let middleAtoms = this.state.MiddleConsecuents;
            let atomSelected = middleAtoms[index];
            middleAtoms.splice(index,1);
            let oldState = this.state;
            oldState.MiddleConsecuents = middleAtoms;
            oldState.CurrentAtom = atomSelected;
            this.setState(oldState);
        }else if(numLastAtoms>0){
            //slect 
            let index = Math.floor(Math.random() * numLastAtoms);
            let LastAtoms = this.state.FinalConsecuents;
            let atomSelected = LastAtoms[index];
            LastAtoms.splice(index,1);
            let oldState = this.state;
            oldState.CurrentAtom = atomSelected;
            oldState.FinalConsecuents = LastAtoms;
            this.setState(oldState);
        }else{
            //done case
        }
    }

    handleAddToSolved = (nameAtom, valueAtom) => {
        let solvedAtoms = this.state.AtomsValues;
        let middle = this.state.MiddleConsecuents;
        let final = this.state.FinalConsecuents;
        let ind = 0;
        let flagLogicError = false;
        let isOnList = false;
        solvedAtoms.forEach(atom => {
            if(atom.name==nameAtom){
                if(atom.value =="inconclusive" || atom.value==valueAtom){
                    atom.value=valueAtom;
                    isOnList = true;
                    return;
                }else if(atom.value != valueAtom){
                    flagLogicError = true;
                    return;
                }
            }
        });
        if(flagLogicError){
            this.setState({
                ...this.state,
                LogicError: true
            });
            return;
        }
        if(!isOnList){
            let atomValue = {
                name: nameAtom,
                value: valueAtom
            }
            solvedAtoms.push(atomValue);
        }
        let oldState = this.state;
        oldState.AtomsValues = solvedAtoms;
        let indexmiddle = null;
        for(let i =0; i<middle.length; i++){
            if(middle[i]==nameAtom){
                indexmiddle=i;
            }
        }
        if(indexmiddle!==null&&valueAtom!=="inconclusive"){
            middle.splice(indexmiddle,1);
        }
        oldState.MiddleConsecuents = middle;
        let endIndex = null;
        for(let i =0; i<final.length; i++){
            if(final[i]==nameAtom){
                endIndex = i;
            }
        }
        let finalWasFound = false;
        if(endIndex!==null){
            final.splice(endIndex,1);
            finalWasFound = true;
        }
        oldState.FinalConsecuents = final;
        oldState.finalWasFound = finalWasFound;
        this.setState(oldState);
    }

    checkForRules = (atom) =>{
        let rules = this.state.RulesToCheck;
        let atomValues = this.state.AtomsValues;
        let value;
        atomValues.forEach(atoms => {
            if(atoms.name == atom);
                value = atoms.value;
        });
        let rulesSolved = [];
        let rulesToDelete = [];
        for(let i =0; i<rules.length; i++){
            let precursors = rules[i].precursors;
            let precursorsToDel = [];
            let index = 0;
            precursors.forEach(atoms => {
                if(atoms[0]==atom){
                    if((value=="false" && atoms[1]=="false")||(value=="true" && atoms[1]=="true")){
                        precursorsToDel.push(index);
                    }else if((value=="false" && atoms[1]=="true")||(value=="true" && atoms[1]=="false")){
                        rulesToDelete.push(i);
                    }
                }
                index++;
            });
            precursorsToDel.forEach(ind =>{
                precursors.splice(ind,1);
            });
            if(precursors.length>0){
                rules[i].precursors = precursors;
            }else{
                rulesSolved.push(i);
            }
        }

        let rulesToDie = [];
        rulesToDelete.forEach(index => {
            let cons = rules[index].consecuent[0];
            this.handleAddToSolved(cons, "inconclusive");
            rulesToDie.push(rules[index]);
        });

        let atomSolved = [];

        rulesSolved.forEach(index =>{
            let cons = rules[index].consecuent[0];
            let neg = rules[index].consecuent[1];
            let val = neg=="true" ? "true" : "false";
            this.handleAddToSolved(cons, val);
            atomSolved.push([cons, val]);
            rulesToDie.push(rules[index]);
        });

        rulesToDie.forEach(rule =>{
            let index = rules.indexOf(rule);
            rules.splice(index,1);
        });

        let oldState = this.state;
        oldState.RulesToCheck = rules;
        this.setState(oldState); 
        
        atomSolved.forEach(obj =>{
            this.checkForRules(obj[0]);
        });
    }

    atomValueFound = (Atom, value) =>{
        
    }

    handleForwardChainInput = (b) =>{
        let nameAtom = this.state.CurrentAtom;
        if(b){
            this.handleAddToSolved(nameAtom,"true");
            this.checkForRules(nameAtom);
            this.selectRandomAtom();
            console.log(this.state.RulesToCheck);
        }else{
            this.handleAddToSolved(nameAtom,"false");
            this.checkForRules(nameAtom);
            this.selectRandomAtom();
            console.log(this.state.RulesToCheck);
        }
    }

    continueChaining = (i) =>{
        if(!i){
            if(this.state.FinalConsecuents>0){
                let oldState = this.state;
                oldState.finalWasFound = false;
                this.setState(oldState);
            }
        }
    }

    startChaining = () =>{
        this.classifyAtoms();
        this.accomodateRules();
        this.selectRandomAtom();
        this.setState({
            ...this.state,
            chainingStarted: true
        });
    }

    render(){
        if(this.state.chainingStarted){
            if(this.state.LogicError){
                return(
                    <div>
                        <h1>Error logico intentalo de nuevo</h1>
                    </div>
                );
            }else if(this.state.finalWasFound){
                return(
                    <div>
                        <div className="inputs">
                            <h2>Atomo final encontrado, deseas continuar?</h2>
                            <button className="btn" onClick={() => this.continueChaining(true)}>Si</button>
                            <button className="btn" onClick={() => this.continueChaining(false)}>No</button>
                        </div>
                        <div className="conclusions">
                            <h2 className="titleConc">Conclusiones</h2>
                            <ResultAtom AtomValues={this.state.AtomsValues} />
                        </div>
                    </div>
                );
            }else if(!this.state.finalWasFound && this.state.RulesToCheck.length == 0){
                return(
                    <div>
                        <div className="inputs">
                            <h2>No se cual es el valor</h2>
                        </div>
                        <div className="conclusions">
                            <h2 className="titleConc">Conclusiones</h2>
                            <ResultAtom AtomValues={this.state.AtomsValues} />
                        </div>
                    </div>
                );
            }else{
                return(
                    <div>
                        <div className="inputs">
                            <h2>Encademiento hacia adelante</h2>
                            <span>{this.state.CurrentAtom}</span>
                            <br/>
                            <button className="btn" onClick={() => this.handleForwardChainInput(true)}>Verdadero</button>
                            <button className="btn" onClick={() => this.handleForwardChainInput(false)}>Falso</button>
                        </div>
                        <div className="conclusions">
                            <h2 className="titleConc">Conclusiones</h2>
                            <ResultAtom AtomValues={this.state.AtomsValues} />
                        </div>
                    </div>  
                    );
            }
        }else{
            return(
                <div>
                    <button className="btn" onClick={this.startChaining}>Empezar Encadenamiento</button>
                </div>
            );
        }
    }
}

export default ForwardChaining;