import React, {Component} from 'react';
import Input from '../../components/UI/Input/Input';
import './TautologicCheck.css';
import TautologyResults from '../../components/TautologyResults/TautologyResults';

class TautologicCheck extends Component{
    constructor(){
        super();
        this.state = {
            stringInputBox: "",
            isTautologic: null,
            finishedCheck: false,
            isIncompletable: null,
            nodes: [],
            atomsTable: [],
            database: [],
            result: "",
            values: [],
            nodesNegated: [],
            databaseNegated: [],
            atomsTableNegated: [],
            resultFirstRound: [],
            valuesFirstRound: [],
        };
    }

    componentDidMount(){

    }
    
    handleInputRule=(event)=>{
        this.setState({...this.state, stringInputBox: event.target.value});
    }

    hanldeInputButton = (e) => {
        e.preventDefault();
        this.handleCheckRule();
        this.checkFirstRound();
        console.log(this.state.resultFirstRound);
        var stateRound1 = this.state;
        if(stateRound1.resultFirstRound=="satisfacible"){
            this.generateNegatedNodes();
            this.checkSecondRound();
        }else if(stateRound1.resultFirstRound=="incompletable"){
            this.moveResultsFromFirstCheck();
        }
        var stateRound2 = this.state;
        if(stateRound2.result=="satisfacible"){
            this.moveResultsFromFirstCheck();
            
        }else if(stateRound2.result=="tautology"){

        }

        this.setEndCheck();
    }

    setEndCheck = () =>{
        let oldState = this.state;
        oldState.finishedCheck = true;
        this.setState(oldState);
    }

    moveResultsFromFirstCheck = () =>{
        let oldState = this.state;
        oldState.result = oldState.resultFirstRound;
        oldState.values = oldState.valuesFirstRound;
        this.setState(oldState);
    }

    // reorderListForAlfas = (list) =>{
    //     var oldState = this.state;
    //     var nodes = oldState.nodes;
    //     var listTemp = [];
    //     var listBetasTemp = [];
    //     for(var i =0; i<list.lenght;i++){
    //         if(list[i])
    //     }
    // }

    handleCheckRule = () => {
        let rule = this.state.stringInputBox;
        let atomsTable = this.state.atomsTable;
        let database = this.state.database;
        let nodes = this.state.nodes;
        let operators = ['^','|','>','(',')','~'];
        let operStack = [];
        let postfix = [];
        for(let i =0; i<rule.length; i++){
            let char = rule.charAt(i);
            if(operators.includes(char)){
                //cicle through the queue
                for(let i = operStack.length-1; i>=0; i--){
                    if(operStack[i]=='('){
                        break;
                    }
                    switch(char){
                        case '^':
                            if(operStack[i]=='~' || operStack[i]=='>'){
                                postfix.push(operStack[i]);
                                operStack.splice(i,1);
                            }
                            break;
                        case '|':
                            if(operStack[i]=='^' || operStack[i]=='>' || operStack[i]=='~'){
                                postfix.push(operStack[i]);
                                operStack.splice(i,1);
                            }    
                            break;
                        case '>':
                            if(operStack[i]=='~'){
                                postfix.push(operStack[i]);
                                operStack.splice(i,1);
                            }
                            break;
                    }
                }

                switch(char){
                    case '^':
                        operStack.push(char);
                        break;
                    case '|':
                        operStack.push(char);
                        break;
                    case '>':
                        operStack.push(char);
                        break;
                    case '~':
                        operStack.push(char);
                        break;
                    case '(':
                        operStack.push(char);
                        break;
                    case ')':
                        let flagParentesis = false;
                        while(!flagParentesis){
                            let op = operStack.pop();
                            if(op!=='(')
                                postfix.push(op);
                            else
                                flagParentesis = true;
                        }
                        break;
                }
            }else{
                postfix.push(char);
            }
        }
        while(operStack.length>0){
            let oper = operStack.pop();
            if(oper!=='('&&oper!==')')
                postfix.push(oper);
        }
        let nodesStack = [];
        for(let n=0;n<postfix.length;n++){
            if(!operators.includes(postfix[n])){
                let flagContains = false;
                for(let j=0;j<atomsTable.length; j++)
                    if(atomsTable[j].Value==postfix[n]){
                        flagContains = true;
                        let id = atomsTable[j].Id;
                        let signo = id>0;
                        let idnode = nodes.length+1;
                        nodes.push({IdNode: idnode, Singoh: null, Signo: signo, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: null, RightSon: null});
                        nodesStack.push({Id: id, IsOperator: false, Operator: postfix[n], IdNode: idnode});
                    }
                if(!flagContains){
                    let id = database.length+1;
                    let idnode = nodes.length+1;
                    atomsTable.push({Id: id, Value: postfix[n]});
                    database.push({Id: id, Minor: 0, Mayor: id});
                    let signo = id>0;
                    nodes.push({IdNode: idnode, Singoh: null, Signo: signo, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: null, RightSon: null});
                    nodesStack.push({Id: id, IsOperator: false, Operator: postfix[n], IdNode: idnode});
                    //console.log(nodesStack);
                }
            }else{
                let op = postfix[n];
                let id = database.length+1;
                let right = null;
                let left = null;
                let idLeft = null;
                let idRight = null;
                let minor = null;
                let mayor = null;
                let idnode = null;
                let idnodeleft = null;
                let idnoderight = null;
                switch(op){
                    case '^':
                        right = nodesStack.pop();
                        left = nodesStack.pop();
                        idnodeleft = left.IdNode;
                        idnoderight = right.IdNode;
                        idLeft = left.Id*-1;
                        idRight = right.Id*-1;
                        minor = idLeft;
                        mayor = idRight;
                        if(minor>mayor){
                            let temp = minor;
                            minor = mayor;
                            mayor = temp;
                        }
                        idnode = nodes.length+1;
                        database.push({Id: id, Minor: minor, Mayor: mayor});
                        nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});
                        break;
                    case '|':
                        right = nodesStack.pop();
                        left = nodesStack.pop();
                        idnodeleft = left.IdNode;
                        idnoderight = left.IdNode;
                        idLeft = left.Id;
                        idRight = right.Id;
                        minor = idLeft;
                        mayor = idRight;
                        idnode = nodes.length+1;
                        if(minor>mayor){
                            let temp = minor;
                            minor = mayor;
                            mayor = temp;
                        }
                        database.push({Id: id, Minor: minor, Mayor: mayor});
                        nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});                        
                        break;
                    case '>':
                        right = nodesStack.pop();
                        left = nodesStack.pop();
                        idnode = nodes.length+1;
                        idnodeleft = left.IdNode;
                        idnoderight = right.IdNode;
                        idLeft = left.Id*-1;
                        idRight = right.Id;
                        minor = idLeft;
                        mayor = idRight;
                        if(minor>mayor){
                            let temp = minor;
                            minor = mayor;
                            mayor = temp;
                        }
                        database.push({Id: id, Minor: minor, Mayor: mayor});
                        nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});                                                
                        break;
                    case '~':
                        let preNode = nodesStack[nodesStack.length-1];
                        let tempId = preNode.IdNode;
                        nodes[tempId-1].Signo = !nodes[tempId-1].Signo;
                        nodes[tempId-1].SignoId *= -1;
                        break;
                }
                if(op == '^' || op == '|' || op == '>'){
                    idnode = nodes.length;
                    nodesStack.push({Id: id, IsOperator: true, Operator: op, IdNode: idnode});
                }
            }
        }
        //sign propagation
        var initvalue = nodes[nodes.length-1].Signo;
        var listPropagation = [];
        nodes[nodes.length-1].Singoh = initvalue;
        listPropagation.push({IdNode: nodes[nodes.length -1].IdNode});
        var m = 0;
        for(m = 0; m<listPropagation.length;m++){
            var opProp = nodes[listPropagation[m].IdNode -1].Operador;
            var signoH = nodes[listPropagation[m].IdNode -1].Singoh;
            if(m==0)
                 nodes[listPropagation[m].IdNode -1].SignohId = nodes[listPropagation[m].IdNode-1].SignoId;
            else{
                if(signoH){
                    nodes[listPropagation[m].IdNode -1].SignohId = nodes[listPropagation[m].IdNode -1].SignoId;
                }else{
                    nodes[listPropagation[m].IdNode -1].SignohID = nodes[listPropagation[m].IdNode -1].SignoId * -1;
                }
            }
            if(opProp == '^' || opProp == '|' || opProp == '>'){
                var idnodel = nodes[listPropagation[m].IdNode-1].LeftSon;
                var idnoder = nodes[listPropagation[m].IdNode-1].RightSon;
                console.log(idnodel);
                console.log(idnoder);
                if(signoH){
                    if(opProp == '^'){
                        nodes[idnodel-1].Singoh = true;
                        nodes[idnoder-1].Singoh = true;
                    }else if(opProp == '|'){
                        nodes[idnodel-1].Singoh = true;
                        nodes[idnoder-1].Singoh = true;
                    }else if(opProp == '>'){
                        nodes[idnodel-1].Singoh = false;
                        nodes[idnoder-1].Singoh = true;
                    }
                }else{
                    if(opProp == '^'){
                        nodes[idnodel-1].Singoh = false;
                        nodes[idnoder-1].Singoh = false;
                    }else if(opProp == '|'){
                        nodes[idnodel-1].Singoh = false;
                        nodes[idnoder-2].Singoh = false;
                    }else if(opProp == '>'){
                        nodes[idnodel-1].Singoh = true;
                        nodes[idnoder-1].Singoh = false;
                    }
                }
                listPropagation.push({IdNode: idnodel});
                listPropagation.push({IdNode: idnoder});
            }
        }
        //imprimo nodos despues de propagacion
        for(let u =0;u<nodes.length;u++){
            console.log(nodes[u]);
        }
        // for(let i =0; i<rule.length; i++){
        //     let char = rule.charAt(i);
        //     if(operators.includes(char)){
        //         //cicle through the queue
        //         for(let i = operStack.length-1; i>=0; i--){
        //             if(operStack[i]=='('){
        //                 break;
        //             }
        //             switch(char){
        //                 case '^':
        //                     if(operStack[i]=='~' || operStack[i]=='>'){
        //                         postfix.push(operStack[i]);
        //                         operStack.splice(i,1);
        //                     }
        //                     break;
        //                 case '|':
        //                     if(operStack[i]=='^' || operStack[i]=='>' || operStack[i]=='~'){
        //                         postfix.push(operStack[i]);
        //                         operStack.splice(i,1);
        //                     }    
        //                     break;
        //                 case '>':
        //                     if(operStack[i]=='~'){
        //                         postfix.push(operStack[i]);
        //                         operStack.splice(i,1);
        //                     }
        //                     break;
        //             }
        //         }

        //         switch(char){
        //             case '^':
        //                 operStack.push(char);
        //                 break;
        //             case '|':
        //                 operStack.push(char);
        //                 break;
        //             case '>':
        //                 operStack.push(char);
        //                 break;
        //             case '~':
        //                 operStack.push(char);
        //                 break;
        //             case '(':
        //                 operStack.push(char);
        //                 break;
        //             case ')':
        //                 let flagParentesis = false;
        //                 while(!flagParentesis){
        //                     let op = operStack.pop();
        //                     if(op!=='(')
        //                         postfix.push(op);
        //                     else
        //                         flagParentesis = true;
        //                 }
        //                 break;
        //         }
        //     }else{
        //         postfix.push(char);
        //     }
        // }
        // while(operStack.length>0){
        //     let oper = operStack.pop();
        //     if(oper!=='('&&oper!==')')
        //         postfix.push(oper);
        // }
        // let nodesStack = [];
        // for(let n=0;n<postfix.length;n++){
        //     if(!operators.includes(postfix[n])){
        //         let flagContains = false;
        //         for(let j=0;j<atomsTable.length; j++)
        //             if(atomsTable[j].Value==postfix[n]){
        //                 flagContains = true;
        //                 let id = atomsTable[j].Id;
        //                 let signo = id>0;
        //                 let idnode = nodes.length+1;
        //                 nodes.push({IdNode: idnode, Singoh: null, Signo: signo, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: null, RightSon: null});
        //                 nodesStack.push({Id: id, IsOperator: false, Operator: postfix[n], IdNode: idnode});
        //             }
        //         if(!flagContains){
        //             let id = database.length+1;
        //             let idnode = nodes.length+1;
        //             atomsTable.push({Id: id, Value: postfix[n]});
        //             database.push({Id: id, Minor: 0, Mayor: id});
        //             let signo = id>0;
        //             nodes.push({IdNode: idnode, Singoh: null, Signo: signo, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: null, RightSon: null});
        //             nodesStack.push({Id: id, IsOperator: false, Operator: postfix[n], IdNode: idnode});
        //             //console.log(nodesStack);
        //         }
        //     }else{
        //         let op = postfix[n];
        //         let id = database.length+1;
        //         let right = null;
        //         let left = null;
        //         let idLeft = null;
        //         let idRight = null;
        //         let minor = null;
        //         let mayor = null;
        //         let idnode = null;
        //         let idnodeleft = null;
        //         let idnoderight = null;
        //         switch(op){
        //             case '^':
        //                 right = nodesStack.pop();
        //                 left = nodesStack.pop();
        //                 idnodeleft = left.IdNode;
        //                 idnoderight = right.IdNode;
        //                 idLeft = left.Id*-1;
        //                 idRight = right.Id*-1;
        //                 minor = idLeft;
        //                 mayor = idRight;
        //                 if(minor>mayor){
        //                     let temp = minor;
        //                     minor = mayor;
        //                     mayor = temp;
        //                 }
        //                 idnode = nodes.length+1;
        //                 database.push({Id: id, Minor: minor, Mayor: mayor});
        //                 nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});
        //                 break;
        //             case '|':
        //                 right = nodesStack.pop();
        //                 left = nodesStack.pop();
        //                 idnodeleft = left.IdNode;
        //                 idnoderight = right.IdNode;
        //                 idLeft = left.Id;
        //                 idRight = right.Id;
        //                 minor = idLeft;
        //                 mayor = idRight;
        //                 idnode = nodes.length+1;
        //                 if(minor>mayor){
        //                     let temp = minor;
        //                     minor = mayor;
        //                     mayor = temp;
        //                 }
        //                 database.push({Id: id, Minor: minor, Mayor: mayor});
        //                 nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});                        
        //                 break;
        //             case '>':
        //                 right = nodesStack.pop();
        //                 left = nodesStack.pop();
        //                 idnode = nodes.length+1;
        //                 idnodeleft = left.IdNode;
        //                 idnoderight = right.IdNode;
        //                 idLeft = left.Id*-1;
        //                 idRight = right.Id;
        //                 minor = idLeft;
        //                 mayor = idRight;
        //                 if(minor>mayor){
        //                     let temp = minor;
        //                     minor = mayor;
        //                     mayor = temp;
        //                 }
        //                 database.push({Id: id, Minor: minor, Mayor: mayor});
        //                 nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});                                                
        //                 break;
        //             case '~':
        //                 let preNode = nodesStack[nodesStack.length-1];
        //                 let tempId = preNode.IdNode;
        //                 nodes[tempId-1].Signo = !nodes[tempId-1].Signo;
        //                 nodes[tempId-1].SignoId *= -1;
        //                 break;
        //         }
        //         if(op == '^' || op == '|' || op == '>'){
        //             idnode = nodes.length;
        //             nodesStack.push({Id: id, IsOperator: true, Operator: op, IdNode: idnode});
        //         }
        //     }
        // }
        // //sign propagation
        // let initvalue = nodes[nodes.length-1].Signo;
        // let listPropagation = [];
        // nodes[nodes.length-1].Singoh = initvalue;
        // listPropagation.push({IdNode: nodes[nodes.length -1].IdNode});
        // for(let m = 0; m<listPropagation.length;m++){
        //     let opProp = nodes[listPropagation[m].IdNode -1].Operador;
        //     let signoH = nodes[listPropagation[m].IdNode -1].Singoh;
        //     if(m==0)
        //          nodes[listPropagation[m].IdNode -1].SignohId = nodes[listPropagation[m].IdNode-1].SignoId;
        //     else{
        //         if(signoH){
        //             nodes[listPropagation[m].IdNode -1].SignohId = nodes[listPropagation[m].IdNode -1].SignoId;
        //         }else{
        //             nodes[listPropagation[m].IdNode -1].SignohId = nodes[listPropagation[m].IdNode -1].SignoId * -1;
        //         }
        //     }
        //     if(opProp == '^' || opProp == '|' || opProp == '>'){
        //         let idnodel = nodes[listPropagation[m].IdNode-1].LeftSon;
        //         let idnoder = nodes[listPropagation[m].IdNode-1].RightSon;
        //         console.log(idnodel);
        //         console.log(idnoder);
        //         if(signoH){
        //             if(opProp == '^'){
        //                 nodes[idnodel-1].Singoh = true;
        //                 nodes[idnoder-1].Singoh = true;
        //             }else if(opProp == '|'){
        //                 nodes[idnodel-1].Singoh = true;
        //                 nodes[idnoder-1].Singoh = true;
        //             }else if(opProp == '>'){
        //                 nodes[idnodel-1].Singoh = false;
        //                 nodes[idnoder-1].Singoh = true;
        //             }
        //         }else{
        //             if(opProp == '^'){
        //                 nodes[idnodel-1].Singoh = false;
        //                 nodes[idnoder-1].Singoh = false;
        //             }else if(opProp == '|'){
        //                 nodes[idnodel-1].Singoh = false;
        //                 nodes[idnoder-1].Singoh = false;
        //             }else if(opProp == '>'){
        //                 nodes[idnodel-1].Singoh = true;
        //                 nodes[idnoder-1].Singoh = false;
        //             }
        //         }
        //         listPropagation.push({IdNode: idnodel});
        //         listPropagation.push({IdNode: idnoder});
        //     }
        // }
        // //imprimo nodos despues de propagacion
        // for(let u =0;u<nodes.length;u++){
        //     console.log(nodes[u]);
        // }
        
        // let rl ="";

        // rl = "~("+rule+")";
        // console.log(rl);
        
        let oldState = this.state;
        oldState.nodes = nodes;
        oldState.atomsTable = atomsTable
        oldState.database = database;
        this.setState(oldState)

    }

    checkFirstRound = () =>{
        let oldState = this.state;
        let nodes = oldState.nodes;
        let database = oldState.database;
        let atomsTable = oldState.atomsTable;
        let branches = [];
        let branchObj = {index: 1, isClosed: false, hasPending: true, list: []}
        let initList = [];
        let initBool = true;
        let currentNode = nodes[nodes.length-1];
        let lineNodes = [];
        let Result = "";
        let val = [];
        while(initBool){
            if(currentNode.Singoh){
                if(currentNode.Operador=='^'){
                    var leftId = currentNode.LeftSon;
                    var rightId = currentNode.RightSon;
                    lineNodes.push(leftId);
                    lineNodes.push(rightId);
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: false,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList.number)
                            flagRepeats = true;
                        if(num+initList.number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }else if(currentNode.Operador=='|' || currentNode.Operador=='>'){
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: true,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList[i].number)
                            flagRepeats = true;
                        if(num+initList[i].number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }else{
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: false,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList[i].number)
                            flagRepeats = true;
                        if(num+initList[i].number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }
            }else{
                if(currentNode.Operador=='|' || currentNode.Operador=='>'){
                    var leftId = currentNode.LeftSon;
                    var rightId = currentNode.RightSon;
                    lineNodes.push(leftId);
                    lineNodes.push(rightId);
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: false,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList[i].number)
                            flagRepeats = true;
                        if(num+initList[i].number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }else if(currentNode.Operador=='^'){
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: true,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList[i].number)
                            flagRepeats = true;
                        if(num+initList[i].number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }else{
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: false,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList.number)
                            flagRepeats = true;
                        if(num+initList.number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }
            }
            if(lineNodes.length==0||branchObj.isClosed)
                initBool = false;
            else{
                let p = lineNodes.pop();
                currentNode = nodes[p-1];
            }
        }
        // for(var j = 0; j<initList.length; j++){
        //     branchObj.list.push({number: initList[j].number,isPending: initList[j].isPending, idNode: initList[j].idNode});
        // }
        branchObj.list = [...initList];
        branches.push({...branchObj});
        console.log(branches);
        var oprdares = ['^','|','>'];

        for(var q=0;q<branches.length;q++){
            console.log("the branch " + q+ " isClosed "+ branches[q].isClosed);
            if(!branches[q].isClosed){
                console.log("thing "+branches[q].hasPending);
                branches[q].hasPending = false;
                console.log(branches[q].list);
                console.log(branches[q]);
                console.log("length list on " + q + " is " + branches[q].list.length);
                for(var o=0;o<branches[q].list.length;o++){
                    if(branches[q].list[o].isPending){
                        branches[q].list[o].isPending = false;
                        branches[q].hasPending = true;
                        let idpend = branches[q].list[o].idNode;
                        let nodePend = nodes[idpend-1];
                        let sonLeftId = nodePend.LeftSon;
                        let sonRigthId = nodePend.RightSon;
                        let numberLeft = nodes[sonLeftId-1].SignohId;
                        let numberRight = nodes[sonRigthId-1].SignohId;
                        let leftIsOper = false;
                        let rightIsOper = false;
                        let includesLeft = false;
                        let includesRight = false;
                        let contradiction = false;
                        let contradictionCurrent = false;
                        if(nodes[sonLeftId-1].Operador=='^'||nodes[sonLeftId-1].Operador=='|'||nodes[sonLeftId-1].Operador=='>')
                            leftIsOper = true;
                        if(nodes[sonRigthId-1].Operador=='^'||nodes[sonRigthId-1].Operador=='|'||nodes[sonRigthId-1].Operador=='>')
                            rightIsOper = true;
                        if((!nodePend.Singoh && (nodePend.Operador=='>' || nodePend.Operador=='|') )||(nodePend.Singoh && nodePend.Operador=='^')){
                            includesLeft = false;
                            includesRight = false;
                            contradiction = false;
                            var v = 0;
                            console.log(v);
                            for(v =0;v<branches[q].list.length;v++){
                                if(branches[q].list[v].number==numberLeft)
                                    includesLeft=true;
                                if(branches[q].list[v].number==numberRight)
                                    includesRight=true;
                                if(branches[q].list[v].number+numberLeft==0 || branches[q].list[v].number+numberRight==0){
                                    contradiction = true;
                                    branches[q].isClosed = true;
                                    break;
                                }
                            }
                            
                            if(!includesLeft&&!includesRight){
                                var leftIsAlpha = false;
                                var rightisAlpha = false;
                                if(oprdares.includes(nodes[sonLeftId-1].Operador)){
                                    if((!nodes[sonLeftId-1].Singoh && (nodes[sonLeftId-1].Operador == '|' || nodes[sonLeftId-1].Operador == '>')) || (nodes[sonLeftId-1].Singoh && nodes[sonLeftId-1].Operador=='^'))
                                        leftIsAlpha = true;
                                }

                                if(oprdares.includes(nodes[sonRigthId-1].Operador)){
                                    if((!nodes[sonRigthId-1].Singoh && (nodes[sonRigthId-1].Operador == '|' || nodes[sonRigthId-1].Operador == '>')) || (nodes[sonRigthId-1].Singoh && nodes[sonRigthId-1].Operador=='^'))
                                        rightisAlpha = true;
                                }

                                if(leftIsAlpha && rightisAlpha){
                                    if(!includesLeft)
                                        branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                    if(!includesRight)
                                        branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                                }else if(leftIsAlpha){
                                    if(!includesLeft)
                                        branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                    if(!includesRight)
                                        branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                                }else if(rightisAlpha){
                                    if(!includesRight)
                                        branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                                    if(!includesLeft)
                                        branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                }else{
                                    if(!includesRight)
                                        branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                                    if(!includesLeft)
                                        branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                }

                            }else{
                                if(!includesLeft)
                                    branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                if(!includesRight)
                                    branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                            }

                            if(contradiction){
                                break;
                            }
                        }else if((nodePend.Singoh && (nodePend.Operador=='>' || nodePend.Operador=='|') )||(!nodePend.Singoh && nodePend.Operador=='^')){
                            var copyBranch = {...branches[q]};
                            copyBranch.list = [...branches[q].list];
                            copyBranch.index = branches.length+1;
                            includesLeft = false;
                            includesRight = false;
                            contradiction = false;
                            var v = 0;
                            console.log(v);
                            for(v =0;v<branches[q].list.length;v++){
                                console.log(branches[q].list[v].number);
                                console.log(numberLeft);
                                console.log(branches[q].list.length);
                                if(branches[q].list[v].number==numberLeft)
                                    includesLeft=true;
                                if(branches[q].list[v].number+numberLeft==0){
                                    contradiction = true;
                                    branches[q].isClosed = true;
                                    break;
                                }
                            }
                            if(!includesLeft)
                                branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                            contradictionCurrent = contradiction;
                            contradiction = false;
                            var v =0;
                            console.log(v);
                            for(v =0;v<copyBranch.list.length;v++){
                                console.log(branches[q].list[v].number);
                                if(copyBranch.list[v].number==numberRight)
                                    includesRight=true;
                                if(copyBranch.list[v].number+numberRight==0){
                                    contradiction = true;
                                    copyBranch.isClosed = true;
                                    break;
                                }
                            }
                            console.log(copyBranch);
                            if(!includesRight)
                                copyBranch.list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});  
                            branches.push({...copyBranch});
                            branches[branches.length-1].list = [...copyBranch.list];
                            if(contradictionCurrent){
                                break;
                            }                          
                        }
                    }
                }
                if(!branches[q].isClosed){
                    let atomsRes = [];
                    let indexesAtoms = [];
                    for(var a =0;a<atomsTable.length;a++){
                        indexesAtoms.push(atomsTable[a].Id);
                    }
                    let flagPendings = false;
                    for(var r = 0;r<branches[q].list.length; r++){
                        if(branches[q].list[r].isPending)
                            flagPendings = true;
                        if(indexesAtoms.includes(Math.abs(branches[q].list[r].number))){
                            let chr = '';
                            for(let z =0;z<atomsTable.length;z++){
                                if(atomsTable[z].Id==Math.abs(branches[q].list[r].number)){
                                    chr = atomsTable[z].Value;
                                    break;
                                }
                            }
                           atomsRes.push({id: branches[q].list[r].idNode, char: chr, value: branches[q].list[r].number>0})
                        }
                    }
                    if(!flagPendings){
                        Result = "satisfacible";
                        val = atomsRes;
                        break;
                    }
                }        
            }
        }
        var flagAllIsClosed = true;
        for(var k=0;k<branches.length;k++){
            if(!branches[k].isClosed){
                flagAllIsClosed = false;
                break;
            }    
        }
        console.log(branches);
        if(flagAllIsClosed){
            Result = "incompletable";
        }
        oldState.resultFirstRound = Result;
        oldState.valuesFirstRound = val;
        this.setState(oldState);
    }

    reviserPropagation = () =>{
        let oldState = this.state;
        var nodes = oldState.nodes;
        var propList = [];
        var leftSon = 0;
        var rightSon = 0;
        var propagationNotFinished = true;
        

        this.setState(oldState);
    }

    checkSecondRound = () =>{
        let oldState = this.state;
        let nodes = oldState.nodesNegated;
        let database = oldState.databaseNegated;
        let atomsTable = oldState.atomsTableNegated;
        let branches = [];
        let branchObj = {index: 1, isClosed: false, hasPending: true, list: []}
        let initList = [];
        let initBool = true;
        let currentNode = nodes[nodes.length-1];
        let lineNodes = [];
        let Result = "";
        let val = [];
        while(initBool){
            if(currentNode.Singoh){
                if(currentNode.Operador=='^'){
                    var leftId = currentNode.LeftSon;
                    var rightId = currentNode.RightSon;
                    lineNodes.push(leftId);
                    lineNodes.push(rightId);
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: false,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList.number)
                            flagRepeats = true;
                        if(num+initList.number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }else if(currentNode.Operador=='|' || currentNode.Operador=='>'){
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: true,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList[i].number)
                            flagRepeats = true;
                        if(num+initList[i].number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }else{
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: false,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList[i].number)
                            flagRepeats = true;
                        if(num+initList[i].number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }
            }else{
                if(currentNode.Operador=='|' || currentNode.Operador=='>'){
                    var leftId = currentNode.LeftSon;
                    var rightId = currentNode.RightSon;
                    lineNodes.push(leftId);
                    lineNodes.push(rightId);
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: false,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList[i].number)
                            flagRepeats = true;
                        if(num+initList[i].number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }else if(currentNode.Operador=='^'){
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: true,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList[i].number)
                            flagRepeats = true;
                        if(num+initList[i].number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }else{
                    var num = currentNode.SignohId;
                    var IdNode = currentNode.IdNode;
                    var objList = {
                        number: num,
                        isPending: false,
                        idNode: IdNode
                    }
                    var flagRepeats = false;
                    var flagContradicts = false;
                    for(var i =0; i<initList.length;i++){
                        if(num==initList.number)
                            flagRepeats = true;
                        if(num+initList.number==0){
                            flagContradicts = true;
                            break;
                        }
                    }
                    if(flagContradicts){
                        branchObj.isClosed= true;
                        break;
                    }
                    if(!flagRepeats && !flagContradicts)
                        initList.push({...objList});
                }
            }
            if(lineNodes.length==0||branchObj.isClosed)
                initBool = false;
            else{
                let p = lineNodes.pop();
                currentNode = nodes[p-1];
            }
        }
        // for(var j = 0; j<initList.length; j++){
        //     branchObj.list.push({number: initList[j].number,isPending: initList[j].isPending, idNode: initList[j].idNode});
        // }
        branchObj.list = [...initList];
        branches.push({...branchObj});
        console.log(branches);
        var oprdares = ['^','|','>'];

        for(var q=0;q<branches.length;q++){
            console.log("the branch " + q+ " isClosed "+ branches[q].isClosed);
            if(!branches[q].isClosed){
                console.log("thing "+branches[q].hasPending);
                branches[q].hasPending = false;
                console.log(branches[q].list);
                console.log(branches[q]);
                console.log("length list on " + q + " is " + branches[q].list.length);
                for(var o=0;o<branches[q].list.length;o++){
                    if(branches[q].list[o].isPending){
                        branches[q].list[o].isPending = false;
                        branches[q].hasPending = true;
                        let idpend = branches[q].list[o].idNode;
                        let nodePend = nodes[idpend-1];
                        let sonLeftId = nodePend.LeftSon;
                        let sonRigthId = nodePend.RightSon;
                        let numberLeft = nodes[sonLeftId-1].SignohId;
                        let numberRight = nodes[sonRigthId-1].SignohId;
                        let leftIsOper = false;
                        let rightIsOper = false;
                        let includesLeft = false;
                        let includesRight = false;
                        let contradiction = false;
                        let contradictionCurrent = false;
                        if(nodes[sonLeftId-1].Operador=='^'||nodes[sonLeftId-1].Operador=='|'||nodes[sonLeftId-1].Operador=='>')
                            leftIsOper = true;
                        if(nodes[sonRigthId-1].Operador=='^'||nodes[sonRigthId-1].Operador=='|'||nodes[sonRigthId-1].Operador=='>')
                            rightIsOper = true;
                        if((!nodePend.Singoh && (nodePend.Operador=='>' || nodePend.Operador=='|') )||(nodePend.Singoh && nodePend.Operador=='^')){
                            includesLeft = false;
                            includesRight = false;
                            contradiction = false;
                            var v = 0;
                            console.log(v);
                            for(v =0;v<branches[q].list.length;v++){
                                if(branches[q].list[v].number==numberLeft)
                                    includesLeft=true;
                                if(branches[q].list[v].number==numberRight)
                                    includesRight=true;
                                if(branches[q].list[v].number+numberLeft==0 || branches[q].list[v].number+numberRight==0){
                                    contradiction = true;
                                    branches[q].isClosed = true;
                                    break;
                                }
                            }
                            
                            if(!includesLeft&&!includesRight){
                                var leftIsAlpha = false;
                                var rightisAlpha = false;
                                if(oprdares.includes(nodes[sonLeftId-1].Operador)){
                                    if((!nodes[sonLeftId-1].Singoh && (nodes[sonLeftId-1].Operador == '|' || nodes[sonLeftId-1].Operador == '>')) || (nodes[sonLeftId-1].Singoh && nodes[sonLeftId-1].Operador=='^'))
                                        leftIsAlpha = true;
                                }

                                if(oprdares.includes(nodes[sonRigthId-1].Operador)){
                                    if((!nodes[sonRigthId-1].Singoh && (nodes[sonRigthId-1].Operador == '|' || nodes[sonRigthId-1].Operador == '>')) || (nodes[sonRigthId-1].Singoh && nodes[sonRigthId-1].Operador=='^'))
                                        rightisAlpha = true;
                                }

                                if(leftIsAlpha && rightisAlpha){
                                    if(!includesLeft)
                                        branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                    if(!includesRight)
                                        branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                                }else if(leftIsAlpha){
                                    if(!includesLeft)
                                        branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                    if(!includesRight)
                                        branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                                }else if(rightisAlpha){
                                    if(!includesRight)
                                        branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                                    if(!includesLeft)
                                        branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                }else{
                                    if(!includesRight)
                                        branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                                    if(!includesLeft)
                                        branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                }

                            }else{
                                if(!includesLeft)
                                    branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                                if(!includesRight)
                                    branches[q].list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});
                            }

                            if(contradiction){
                                break;
                            }
                        }else if((nodePend.Singoh && (nodePend.Operador=='>' || nodePend.Operador=='|') )||(!nodePend.Singoh && nodePend.Operador=='^')){
                            var copyBranch = {...branches[q]};
                            copyBranch.list = [...branches[q].list];
                            copyBranch.index = branches.length+1;
                            includesLeft = false;
                            includesRight = false;
                            contradiction = false;
                            var v = 0;
                            console.log(v);
                            for(v =0;v<branches[q].list.length;v++){
                                console.log(branches[q].list[v].number);
                                console.log(numberLeft);
                                console.log(branches[q].list.length);
                                if(branches[q].list[v].number==numberLeft)
                                    includesLeft=true;
                                if(branches[q].list[v].number+numberLeft==0){
                                    contradiction = true;
                                    branches[q].isClosed = true;
                                    break;
                                }
                            }
                            if(!includesLeft)
                                branches[q].list.push({number: numberLeft, isPending: leftIsOper, idNode: sonLeftId});
                            contradictionCurrent = contradiction;
                            contradiction = false;
                            var v =0;
                            console.log(v);
                            for(v =0;v<copyBranch.list.length;v++){
                                console.log(branches[q].list[v].number);
                                if(copyBranch.list[v].number==numberRight)
                                    includesRight=true;
                                if(copyBranch.list[v].number+numberRight==0){
                                    contradiction = true;
                                    copyBranch.isClosed = true;
                                    break;
                                }
                            }
                            console.log(copyBranch);
                            if(!includesRight)
                                copyBranch.list.push({number: numberRight, isPending: rightIsOper, idNode: sonRigthId});  
                            branches.push({...copyBranch});
                            branches[branches.length-1].list = [...copyBranch.list];
                            if(contradictionCurrent){
                                break;
                            }                          
                        }
                    }
                }
                if(!branches[q].isClosed){
                    let atomsRes = [];
                    let indexesAtoms = [];
                    for(var a =0;a<atomsTable.length;a++){
                        indexesAtoms.push(atomsTable[a].Id);
                    }
                    let flagPendings = false;
                    for(var r = 0;r<branches[q].list.length; r++){
                        if(branches[q].list[r].isPending)
                            flagPendings = true;
                        if(indexesAtoms.includes(Math.abs(branches[q].list[r].number))){
                            let chr = '';
                            for(let z =0;z<atomsTable.length;z++){
                                if(atomsTable[z].Id==Math.abs(branches[q].list[r].number)){
                                    chr = atomsTable[z].Value;
                                    break;
                                }
                            }
                           atomsRes.push({id: branches[q].list[r].idNode, char: chr, value: branches[q].list[r].number>0})
                        }
                    }
                    if(!flagPendings){
                        Result = "satisfacible";
                        val = atomsRes;
                        break;
                    }
                }        
            }
        }
        var flagAllIsClosed = true;
        for(var k=0;k<branches.length;k++){
            if(!branches[k].isClosed){
                flagAllIsClosed = false;
                break;
            }    
        }
        console.log(branches);
        if(flagAllIsClosed){
            Result = "tautology";
        }
        oldState.result = Result;
        oldState.values = val;
        this.setState(oldState);
    }

    generateNegatedNodes = () =>{
        let rule = this.state.stringInputBox;
        rule = "~("+rule+")";
        let atomsTable = this.state.atomsTableNegated;
        let database = this.state.databaseNegated;
        let nodes = this.state.nodesNegated;
        let operators = ['^','|','>','(',')','~'];
        let operStack = [];
        let postfix = [];
        for(let i =0; i<rule.length; i++){
            let char = rule.charAt(i);
            if(operators.includes(char)){
                //cicle through the queue
                for(let i = operStack.length-1; i>=0; i--){
                    if(operStack[i]=='('){
                        break;
                    }
                    switch(char){
                        case '^':
                            if(operStack[i]=='~' || operStack[i]=='>'){
                                postfix.push(operStack[i]);
                                operStack.splice(i,1);
                            }
                            break;
                        case '|':
                            if(operStack[i]=='^' || operStack[i]=='>' || operStack[i]=='~'){
                                postfix.push(operStack[i]);
                                operStack.splice(i,1);
                            }    
                            break;
                        case '>':
                            if(operStack[i]=='~'){
                                postfix.push(operStack[i]);
                                operStack.splice(i,1);
                            }
                            break;
                    }
                }

                switch(char){
                    case '^':
                        operStack.push(char);
                        break;
                    case '|':
                        operStack.push(char);
                        break;
                    case '>':
                        operStack.push(char);
                        break;
                    case '~':
                        operStack.push(char);
                        break;
                    case '(':
                        operStack.push(char);
                        break;
                    case ')':
                        let flagParentesis = false;
                        while(!flagParentesis){
                            let op = operStack.pop();
                            if(op!=='(')
                                postfix.push(op);
                            else
                                flagParentesis = true;
                        }
                        break;
                }
            }else{
                postfix.push(char);
            }
        }
        while(operStack.length>0){
            let oper = operStack.pop();
            if(oper!=='('&&oper!==')')
                postfix.push(oper);
        }
        let nodesStack = [];
        for(let n=0;n<postfix.length;n++){
            if(!operators.includes(postfix[n])){
                let flagContains = false;
                for(let j=0;j<atomsTable.length; j++)
                    if(atomsTable[j].Value==postfix[n]){
                        flagContains = true;
                        let id = atomsTable[j].Id;
                        let signo = id>0;
                        let idnode = nodes.length+1;
                        nodes.push({IdNode: idnode, Singoh: null, Signo: signo, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: null, RightSon: null});
                        nodesStack.push({Id: id, IsOperator: false, Operator: postfix[n], IdNode: idnode});
                    }
                if(!flagContains){
                    let id = database.length+1;
                    let idnode = nodes.length+1;
                    atomsTable.push({Id: id, Value: postfix[n]});
                    database.push({Id: id, Minor: 0, Mayor: id});
                    let signo = id>0;
                    nodes.push({IdNode: idnode, Singoh: null, Signo: signo, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: null, RightSon: null});
                    nodesStack.push({Id: id, IsOperator: false, Operator: postfix[n], IdNode: idnode});
                    //console.log(nodesStack);
                }
            }else{
                let op = postfix[n];
                let id = database.length+1;
                let right = null;
                let left = null;
                let idLeft = null;
                let idRight = null;
                let minor = null;
                let mayor = null;
                let idnode = null;
                let idnodeleft = null;
                let idnoderight = null;
                switch(op){
                    case '^':
                        right = nodesStack.pop();
                        left = nodesStack.pop();
                        idnodeleft = left.IdNode;
                        idnoderight = right.IdNode;
                        idLeft = left.Id*-1;
                        idRight = right.Id*-1;
                        minor = idLeft;
                        mayor = idRight;
                        if(minor>mayor){
                            let temp = minor;
                            minor = mayor;
                            mayor = temp;
                        }
                        idnode = nodes.length+1;
                        database.push({Id: id, Minor: minor, Mayor: mayor});
                        nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});
                        break;
                    case '|':
                        right = nodesStack.pop();
                        left = nodesStack.pop();
                        idnodeleft = left.IdNode;
                        idnoderight = left.IdNode;
                        idLeft = left.Id;
                        idRight = right.Id;
                        minor = idLeft;
                        mayor = idRight;
                        idnode = nodes.length+1;
                        if(minor>mayor){
                            let temp = minor;
                            minor = mayor;
                            mayor = temp;
                        }
                        database.push({Id: id, Minor: minor, Mayor: mayor});
                        nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});                        
                        break;
                    case '>':
                        right = nodesStack.pop();
                        left = nodesStack.pop();
                        idnode = nodes.length+1;
                        idnodeleft = left.IdNode;
                        idnoderight = right.IdNode;
                        idLeft = left.Id*-1;
                        idRight = right.Id;
                        minor = idLeft;
                        mayor = idRight;
                        if(minor>mayor){
                            let temp = minor;
                            minor = mayor;
                            mayor = temp;
                        }
                        database.push({Id: id, Minor: minor, Mayor: mayor});
                        nodes.push({IdNode: idnode, Singoh: null, Signo: true, Operador: postfix[n], SignoId: id, SignohId: null, LeftSon: idnodeleft, RightSon: idnoderight});                                                
                        break;
                    case '~':
                        let preNode = nodesStack[nodesStack.length-1];
                        let tempId = preNode.IdNode;
                        nodes[tempId-1].Signo = !nodes[tempId-1].Signo;
                        nodes[tempId-1].SignoId *= -1;
                        break;
                }
                if(op == '^' || op == '|' || op == '>'){
                    idnode = nodes.length;
                    nodesStack.push({Id: id, IsOperator: true, Operator: op, IdNode: idnode});
                }
            }
        }
        //sign propagation
        let initvalue = nodes[nodes.length-1].Signo;
        let listPropagation = [];
        nodes[nodes.length-1].Singoh = initvalue;
        listPropagation.push({IdNode: nodes[nodes.length -1].IdNode});
        for(let m = 0; m<listPropagation.length;m++){
            let opProp = nodes[listPropagation[m].IdNode -1].Operador;
            let signoH = nodes[listPropagation[m].IdNode -1].Singoh;
            if(m==0)
                 nodes[listPropagation[m].IdNode -1].SignohId = nodes[listPropagation[m].IdNode-1].SignoId;
            else{
                if(signoH){
                    nodes[listPropagation[m].IdNode -1].SignohId = nodes[listPropagation[m].IdNode -1].SignoId;
                }else{
                    nodes[listPropagation[m].IdNode -1].SignohID = nodes[listPropagation[m].IdNode -1].SignoId * -1;
                }
            }
            if(opProp == '^' || opProp == '|' || opProp == '>'){
                let idnodel = nodes[listPropagation[m].IdNode-1].LeftSon;
                let idnoder = nodes[listPropagation[m].IdNode-1].RightSon;
                console.log(idnodel);
                console.log(idnoder);
                if(signoH){
                    if(opProp == '^'){
                        nodes[idnodel-1].Singoh = true;
                        nodes[idnoder-1].Singoh = true;
                    }else if(opProp == '|'){
                        nodes[idnodel-1].Singoh = true;
                        nodes[idnoder-1].Singoh = true;
                    }else if(opProp == '>'){
                        nodes[idnodel-1].Singoh = false;
                        nodes[idnoder-1].Singoh = true;
                    }
                }else{
                    if(opProp == '^'){
                        nodes[idnodel-1].Singoh = false;
                        nodes[idnoder-1].Singoh = false;
                    }else if(opProp == '|'){
                        nodes[idnodel-1].Singoh = false;
                        nodes[idnoder-2].Singoh = false;
                    }else if(opProp == '>'){
                        nodes[idnodel-1].Singoh = true;
                        nodes[idnoder-1].Singoh = false;
                    }
                }
                listPropagation.push({IdNode: idnodel});
                listPropagation.push({IdNode: idnoder});
            }
        }
        //imprimo nodos despues de propagacion
        for(let u =0;u<nodes.length;u++){
            console.log(nodes[u]);
        }
        
        let oldState = this.state;
        oldState.nodesNegated = nodes;
        oldState.atomsTableNegated = atomsTable
        oldState.databaseNegated = database;
        this.setState(oldState)
    }


    render(){
        let result = null;

        if(this.state.finishedCheck){
            result = <TautologyResults Result={this.state.result} combination={this.state.values} />
        }
        
        return(
            <div>
                <div className="ContainerTautology">
                    <h2>Ingrese la regla que quires revisar</h2>
                    <Input elementType="Input" value={this.state.stringInputBox} changed={this.handleInputRule.bind(this)} label="Regla a revisar" />
                    <button className="btn" onClick={this.hanldeInputButton}>Revisar Tautologia</button>
                </div>
                {result}
            </div>
        );
    }
}

export default TautologicCheck;