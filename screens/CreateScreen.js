import React from 'react';
import { StyleSheet, Text, View, FlatList , TouchableOpacity , TextInput } from 'react-native';
import nj from "@d4c/numjs"
import * as math from 'mathjs'
import { typeOf } from 'mathjs';

export default class CreateScreen extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      q_regs : 2,
      reg_length : 5,
      input_data : [], 
      q_circuit : [],
      circuit_matrix : [],
      input_vector : [],
      output_vector : [],
      gates : {
        'h'  : [[0.7,0.7] , [0.7,-0.7]],
        'cnt' : [[1,0,0,0], [0,1,0,0] , [0,0,0,1] , [0,0,1,0]],
        'icnc': [[1,0,0,0] , [0,0,0,1] , [0,0,1,0], [0,1,0,0]],
        'x'  : [[0,1] , [1,0]],
        'z'  : [[1,0] , [0,-1]],
        'swt' : [[1,0,0,0] , [0,0,1,0] , [0,1,0,0] , [0,0,0,1]],
        's'  : [[1,0] , [0, math.complex(0,1)]],
        't'  : [[1,0] , [0 , math.exp((math.complex(0,3.14/4)) )]],
        'czt' : [[1,0,0,0], [0,1,0,0] , [0,0,1 ,0] , [0,0,0,-1]],
        'iczc': [[1,0,0,0], [0,1,0,0] , [0,0,1 ,0] , [0,0,0,-1]],
        'y'  : [[0,math.complex(0,-1)] , [math.complex(0,1),0]],
        'i'  : [[1,0] , [0,1]]
    }

    }
  }

  componentDidMount(){
    this.q_circuit_initialization()
  }

  q_circuit_initialization = () => {
    let q_circuit = this.state.q_circuit
    for (let i = 0; i < this.state.q_regs; i++) {
      q_circuit.push(['i'])
    }
    this.setState({q_circuit})
    this.setState({circuit_matrix : []})
  }

  getInputData = () => {
    // This function is for the flatlist
    // Run this function after every change
    if (this.state.input_data <  this.state.input_data.length) { //When a gate column is deleted
      let input_data = this.state.input_data
      input_data.splice(this.state.q_regs -1, 1)
    }
    else if(this.state.q_regs >  this.state.input_data.length){ // When a gate column is added
      let length = this.state.reg_length
      let input_data = this.state.input_data
      for (let i = 0; i <= q_regs - this.state.input_data.length; i++) { 
        id = i,
        input_data.push({'id' : id, 'reg_length' : length})
      }  
      this.setState({input_data,input_data}) 
    }
  }

  addGate = (gate,reg_no,pos) => {
    let q_circuit = this.state.q_circuit
    let qreg_no = this.state.q_regs
    let previous_gate
    if (reg_no >= qreg_no){
      console.log('Register number is too big.')
    }
    if (pos >= q_circuit[reg_no].length){
      pos = q_circuit[reg_no].length
    } 
    else if (pos < q_circuit[reg_no].length){
      previous_gate = q_circuit[reg_no][pos]
      q_circuit[reg_no][pos] = gate

    }
    if (((gate == 'cnt' || gate == 'czt' || gate == 'swt') && reg_no == 0) || ((gate == 'icnt' && gate== 'iczt') && reg_no == qreg_no-1)){
        console.log('This gate cannot be applied at this register.')
    }
    for (let i = 0; i < q_circuit[reg_no].length; i++) {
      if (q_circuit[i].length < q_circuit[reg_no].length){
           q_circuit[i].push('i')
      }
    }
    if(( gate == 'cnt' || gate == 'czt' || gate == 'swt')){
        q_circuit[reg_no-1][pos] = gate.slice(0, -1) + 'c'
        if(reg_no -2 >= 0){
          if(q_circuit[reg_no-2][pos] == 'icnt' || q_circuit[reg_no-2][pos] == 'iczt' || q){
            q_circuit[reg_no-2][pos] ='i'
          }
        }
        
    }
    else if ((gate == 'icnt' || gate == 'iczt')&& q_circuit[reg_no+1][pos] == 'i'){
        q_circuit[reg_no+1][pos] = gate.slice(0, -1) + 'c'
        if(reg_no +2 >= q_circuit[reg_no].length -1){
          if(q_circuit[reg_no+2][pos] == 'cnt' || q_circuit[reg_no+2][pos] == 'czt' ||q_circuit[reg_no+2][pos] == 'swt'){
            q_circuit[reg_no+2][pos] ='i'
          }
        }
    }
    else { // When any other gate is entered but there are two qubit gates in the way
      if(previous_gate == 'cnt' || previous_gate == 'czt' ||previous_gate == 'swt' ||previous_gate == 'icnc' || previous_gate == 'iczc'){
        q_circuit[reg_no+1][pos] = 'i'
      }
      else if(previous_gate == 'icnt' || previous_gate == 'iczt' ||previous_gate == 'swc'||previous_gate == 'cnc' || previous_gate == 'czc'){
        q_circuit[reg_no-1][pos] = 'i'
      }
    }
    this.setState({q_circuit : q_circuit})
    this.getMatrix()
  }
  
  getMatrix = () => {
    let q_circuit = this.state.q_circuit
    let column_matrix = []
    let gates = this.state.gates
    let previous_gate
    for (let i = 0; i < q_circuit[0].length ; i++) {
      let tensor_product = 'temp'
      for (let j = 0; j < q_circuit.length; j++){
        if( (q_circuit[j][i] == 'cnc' || q_circuit[j ][i] == 'czc' || q_circuit[j ][i] == 'swc') || ( previous_gate== 'icnt' ||  previous_gate == 'iczt')){
          continue
        }
        if (tensor_product =='temp'){
          
          tensor_product = gates[q_circuit[j][i]]
          continue
        }
        else{
          tensor_product = math.kron(tensor_product,gates[q_circuit[j][i]])
        }
      column_matrix.push(tensor_product)
      previous_gate = q_circuit[j][i]
      }

    }

    let circuit_matrix = 'temp'

    for (let i = 0; i < column_matrix.length; i++) {
      if (i == 0){
        circuit_matrix = column_matrix[i]
      }
      else{
          circuit_matrix = math.dot(circuit_matrix , column_matrix[i])
      }
    }
    this.setState({circuit_matrix : circuit_matrix})
  }

  getInputVector = () => {
    input_vector = nj.array([1,0])
    for (let i = 0; i < this.state.q_regs -1; i++) {
      input_vector = nj.kron(input_vector , nj.array([1,0]) )
    }
    this.setState({input_vector : input_vector})
  }

  getOutputVector = () => {
    output_vector = nj.tensordot(this.state.input_vector,this.state.circuit_matrix,axes = 1)
  }
  


  render(){
  return (
    <View style={styles.container}>
      <View>
        <TextInput maxLength={2} style={styles.input} onEndEditing={(qreg_no) => {
          this.setState({qreg_no})
          this.q_circuit_initialization()
        
        }} />
        <Text style={styles.test_text}>{this.state.q_circuit}</Text>
        <Text style={styles.test_text}>{this.state.circuit_matrix}</Text>
      
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => {
            this.addGate('h' , 0, 0)
          }}>
            <View style={styles.gateButton}>
              <Text style={styles.gateButtonText}>H</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.addGate('x' , 0, 0)
          }}>
            <View style={styles.gateButton}>
              <Text style={styles.gateButtonText}>X</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateButton : {
    borderWidth : 2,
    backgroundColor : 'teal',
    paddingHorizontal : 40,
    paddingVertical : 20
  },
  gateButtonText : {
    fontSize : 20,
    color : 'white'
  },
  test_text :{
    fontSize : 15,
    margin : 10
  },
  buttonContainer :{
    width : '100%',
    justifyContent : 'space-around',
    backgroundColor : 'red',
    
  },
  input: {
    backgroundColor : 'lightblue'
  }
});
