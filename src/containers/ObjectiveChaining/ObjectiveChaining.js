import React, {Component} from 'react';
import './ObjectiveChaining.css';
import Axios from 'axios';
import ResultAtom from '../../components/ResultAtom/ResultAtom';
import SelectOptions from '../../components/UI/Select/Select';

class ObjectiveChaining extends Component{
    constructor(){
        super();
        this.state = {
            rules: [],
            atoms: [],
            rulesToCheck: [],
            atomsToCheck: [],
            AtomsValues: [],
            CurrentAtom: "",
            LogicError: false,
            chainingStarted: false,
            objectiveWasFound: false,
            atomsWithIndexes: [],
            selectStarted: false,
            valueIndexObjective: 0,
            Objective: "",
            objectiveIsInconclusive: false,
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

    convertRules = () => {
        let rules = this.state.Rules;
        let rulesStructured = [];
        let atomsIndexed = this.state.atomsWithIndexes;
        let index = 0;
        rules.forEach(rule =>{
            let cons = rule.consecuent;
            let newRule = [];
            let consValue = "true";
            if (cons.charAt(0)==='~'){
                cons = cons.substring(1,cons.lenght);
                consValue = "false";
            }
            newRule.push([cons, consValue]);
            let add = true;
            atomsIndexed.forEach(at => {
                if(at.name==cons){
                    if(!at.indexes.includes(index))
                        at.indexes.push(index);
                    add = false;
                }
            });
            if(add)
                atomsIndexed.push({
                    name: cons,
                    indexes: [index]
                });
            let prec = rule.precursors.split('^');
            prec.forEach(atom => {
                let bool = "false"
                if(atom.charAt(0)==='~'){
                    atom = atom.substring(1,atom.length);
                    bool = "true";
                }
                newRule.push([atom, bool]);
                let add = true;
                atomsIndexed.forEach(at =>{
                    if(at.name==atom){
                        if(!at.indexes.includes(index))
                            at.indexes.push(index);
                        add = false;
                    }
                });
                if(add)
                    atomsIndexed.push({
                        name: atom,
                        indexes: [index]
                    });
            });
            rulesStructured.push(newRule);
            index++;
        });
        let oldState = this.state;
        oldState.rulesToCheck = rulesStructured;
        oldState.atomsWithIndexes = atomsIndexed;
        this.setState(oldState);
    }

    selectObjetive = (index) =>{
        let atomsIndexed = this.state.atomsWithIndexes;
        let Objective = atomsIndexed[index].name;
        let atomsToCheck = [];
        let indexesRulesToKeep = [];
        let atomsQueue = [];
        let rules = this.state.rulesToCheck;
        atomsIndexed[index].indexes.forEach(ind =>{
            if(!indexesRulesToKeep.includes(ind))
                indexesRulesToKeep.push(ind);
        });
        for(let i = 0; i<indexesRulesToKeep.length; i++){
            let rule = rules[indexesRulesToKeep[i]];
            rule.forEach(atom => {
                if(!atomsToCheck.includes(atom[0])&&atom[0]!==Objective){
                    atomsToCheck.push(atom[0]);
                    if(!atomsQueue.includes(atom[0]))
                        atomsQueue.push(atom[0]);
                }
            });
        }
        while(atomsToCheck.length>0){
            let at = atomsToCheck.pop();
            let indexesToCheck = [];
            atomsIndexed.forEach(indexed =>{
                if(indexed.name==at)
                    indexed.indexes.forEach(ind => {
                        if(!indexesRulesToKeep.includes(ind))
                            if(!indexesToCheck.includes(ind))
                                indexesToCheck.push(ind);
                    });
            });
            indexesToCheck.forEach(ind =>{
                let rule = rules[ind];
                rule.forEach(atom => {
                    if(!atomsToCheck.includes(atom[0])&&atom[0]!==Objective&&!atomsQueue.includes(atom[0])){
                        atomsToCheck.push(atom[0]);
                        if(!atomsQueue.includes(atom[0]))
                            atomsQueue.push(atom[0]);
                    }
                });
                indexesRulesToKeep.push(ind);
            });
        }
        let newRules = [];
        indexesRulesToKeep.forEach(ind => {
            newRules.push(rules[ind]);
        });
        let oldState = this.state;
        oldState.Objective = Objective;
        oldState.rulesToCheck = newRules;
        oldState.atomsToCheck = atomsQueue;
        this.setState(oldState);
    }

    selectAtom = () =>{
        let atoms = this.state.atomsToCheck;
        let at = atoms.pop();
        let oldState = this.state;
        oldState.atomsToCheck = atoms;
        oldState.CurrentAtom = at;
        this.setState(oldState);
    }

    startChaining = () => {
        this.selectAtom();
        this.setState({
            ...this.state,
            chainingStarted: true
        });
    }

    startSelectingObjective = () =>{
        this.convertRules();
        this.setState({
            ...this.state,
            selectStarted: true
        });
    }

    handleChangeInput = (e) =>{
        this.setState({
            ...this.state,
            valueIndexObjective: e.target.value
        });
    }

    hanldeSubmitObjective = () =>{
        this.selectObjetive(this.state.valueIndexObjective);
        this.startChaining();
    }

    handleChainInput = (value) =>{
        let nameAtom = this.state.CurrentAtom;
        if(value){
            this.handleAddToSolved(nameAtom, "true");
            this.checkForRules(nameAtom);
            this.selectAtom();
        }else{
            this.handleAddToSolved(nameAtom, "false");
            this.checkForRules(nameAtom);
            this.selectAtom();
        }
    }

    handleAddToSolved = (nameAtom, valueAtom) =>{
        let solvedAtoms = this.state.AtomsValues;
        let atomsQueue = this.state.atomsToCheck;
        let flagLogicError = false;
        let isOnList = false;
        let oldState = this.state;
        solvedAtoms.forEach(atom => {
            if(atom.name==nameAtom){
                if(atom.value=="inconclusive"||atom.value == valueAtom){
                    atom.value=valueAtom;
                    isOnList=true;
                    return;
                }else if(atom.value != valueAtom){
                    flagLogicError = true;
                    return;
                }
            }
        });
        if(!isOnList){
            let atomValue = {
                name: nameAtom,
                value: valueAtom
            }
            solvedAtoms.push(atomValue);
        }
        if(atomsQueue.includes(nameAtom)){
            if(valueAtom!="inconclusive"){
                let index = atomsQueue.indexOf(nameAtom);
                atomsQueue.splice(index, 1);
            }
        }
        if (nameAtom==this.state.Objective && valueAtom !="inconclusive"){
            oldState.objectiveWasFound = true;
        }
        if (nameAtom==this.state.Objective&&valueAtom =="inconclusive"){
            oldState.objectiveIsInconclusive = true;
        }
        oldState.AtomsValues = solvedAtoms;
        oldState.atomsToCheck = atomsQueue;
        oldState.LogicError = flagLogicError;
        this.setState(oldState);
    }

    checkForRules = (atom) => {
        let rules = this.state.rulesToCheck;
        let AtomValues = this.state.AtomsValues;
        let value;
        let Objective = this.state.Objective;
        AtomValues.forEach(atoms => {
            if(atoms.name == atom)
                value = atoms.value;
        });
        let rulesSolved = [];
        let rulesToDelete = [];
        for(let i =0; i<rules.length; i++){
            let atoms = rules[i];
            let atomsToDel = [];
            let index = 0;
            atoms.forEach(atoms =>{
                if(atoms[0]==atom){
                    if((value=="false" && atoms[1]=="false")||(value=="true" && atoms[1]=="true")){
                        rulesToDelete.push(i);
                    }else if((value=="false" && atoms[1]=="true")||(value=="true" && atoms[1]=="false")){
                        atomsToDel.push(index);
                    }
                }
                index++;
            });
            atomsToDel.forEach(ind => {
                atoms.splice(ind, 1);
            });
            if(atoms.length > 1)
                rules[i] = atoms;
            else if(atoms.length == 1)
                rulesSolved.push(i);
        }
        let rulesTodDie = [];
        rulesToDelete.forEach(ind =>{
            let rul = rules[ind];
            rul.forEach(at => {
                if(at[0]!=atom)
                    this.handleAddToSolved(at[0], "inconclusive");
            });
            rulesTodDie.push(rul);
        });

        let atomsSolved = [];
        rulesSolved.forEach(ind => {
            let at = rules[ind][0][0];
            let neg = rules[ind][0][1];
            let val = neg=="true" ? "true" : "false";
            this.handleAddToSolved(at,val);
            atomsSolved.push([at,val]);
            rulesTodDie.push(rules[ind]);
        });

        rulesTodDie.forEach(rul =>{
            let ind = rules.indexOf(rul);
            rules.splice(ind, 1);
        });

        let oldState = this.state;
        oldState.rulesToCheck = rules;
        this.setState(oldState);

        this.getQueueRelevantAtoms();

        atomsSolved.forEach(at =>{
            if(at[0]!=atom)
                this.checkForRules(at[0]);
        });
    }

    getQueueRelevantAtoms = () => {
        let rules = this.state.rulesToCheck;
        let queue = this.state.atomsToCheck;
        let newQueue = [];
        queue.forEach(atom => {
            let flag = false;
            rules.forEach(rule => {
                rule.forEach(at =>{
                    if(at[0]==atom)
                        flag = true;
                });
            });
            if(flag)
                newQueue.push(atom);
        });
        let oldState = this.state;
        oldState.atomsToCheck = newQueue;
        this.setState(oldState);
    };

    render(){
        if(this.state.chainingStarted){
            if(this.state.LogicError){
                return(
                    <div>
                        <h1>Error logico intentalo de nuevo</h1>
                    </div>
                );
            }else if(this.state.objectiveWasFound){
                return(
                    <div>
                        <div className="inputs">
                            <h1>El Objetivo fue Encontrado</h1>
                        </div>
                        <div className="conclusions">
                            <h2 className="titleConc">Conclusiones</h2>
                            <ResultAtom AtomValues={this.state.AtomsValues} />
                        </div>
                    </div>
                );
            }else if((!this.state.objectiveWasFound&&this.state.rulesToCheck.length==0)||(this.state.objectiveIsInconclusive&&this.state.rulesToCheck.length==0)){
                return (
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
                            <h2>Encademiento por objetivo</h2>
                            <span>{this.state.CurrentAtom}</span>
                            <br/>
                            <button className="btn" onClick={() => this.handleChainInput(true)}>Verdadero</button>
                            <button className="btn" onClick={() => this.handleChainInput(false)}>Falso</button>
                        </div>
                        <div className="conclusions">
                            <h2 className="titleConc">Conclusiones</h2>
                            <ResultAtom AtomValues={this.state.AtomsValues} />
                        </div>
                    </div>
                );
            }
        }else if(this.state.selectStarted){
            return(
                <div>
                    <div className="inputs">
                        <h2>seleccione el atomo que deseas encontrar</h2>
                        <br />
                        <select value={this.state.valueIndexObjective} onChange={this.handleChangeInput}>
                            <SelectOptions consecuents={this.state.atomsWithIndexes} />
                        </select>
                        <button className="btn" onClick={this.hanldeSubmitObjective}>Seleccionar Atomo Final</button>
                    </div>
                </div>
            );
        }else{
            return(
                <div>
                    <button className="btn" onClick={this.startSelectingObjective}>Empezar Encadenamiento</button>
                </div>
            );
        }
    }
}

export default ObjectiveChaining;