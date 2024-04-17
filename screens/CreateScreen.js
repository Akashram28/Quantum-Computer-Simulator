import React from 'react';
import { StyleSheet, Text, View, FlatList , TouchableOpacity , TextInput,ScrollView } from 'react-native';
import nj from "@d4c/numjs"
import {BarChart} from 'react-native-chart-kit'
import * as math from 'mathjs'
import * as ScreenOrientation from 'expo-screen-orientation'
import VerticalBarGraph from '@chartiful/react-native-vertical-bar-graph'

const config = {
  hasXAxisBackgroundLines: false,
  xAxisLabelStyle: {
    position: 'left',
    suffix : '%'
  }
};

const d = new Date();

export default class CreateScreen extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      q_regs : 2,
      reg_length : 5,
      q_circuit : [],
      circuit_matrix : [],
      input_vector : [],
      output_vector : [],
      output_probability : [1,0,0,0],
      output_labels : [100,0,0,0],
      output_states : ["00","01","10","11"],
      // barData : {
      //   labels: ['00','01','10','11'],
      //   datasets: [
      //   {
      //     data: [1,0,0,0]
      //   }
      // ]
      // },
      flatlist_data : [],
      gates : {
        'h'  : [[0.7071,0.7071] , [0.7071,-0.7071]],
        'cnt' : [[1,0,0,0], [0,1,0,0] , [0,0,0,1] , [0,0,1,0]],
        'icnc': [[1,0,0,0] , [0,0,0,1] , [0,0,1,0], [0,1,0,0]],
        'x'  : [[0,1] , [1,0]],
        'z'  : [[1,0] , [0,-1]],
        'swt' : [[1,0,0,0] , [0,0,1,0] , [0,1,0,0] , [0,0,0,1]],
        'czt' : [[1,0,0,0], [0,1,0,0] , [0,0,1 ,0] , [0,0,0,-1]],
        'iczc': [[1,0,0,0], [0,1,0,0] , [0,0,1 ,0] , [0,0,0,-1]],
        'i'  : [[1,0] , [0,1]]
      },
      gateColors : {
        'h' : '#F08E0A',
        'cnt' : '#12B0E8',
        'cnc' : '#12B0E8',
        'czt' : '#B1E825',
        'czc' : '#B1E825',
        'x' : '#1CFFC9',
        'icnc' : '#1B98F5',
        'icnt' : '#1B98F5',
        'iczc' : '#04D612',
        'iczt' : '#04D612',
        'z' : '#D2D603',
        'i' : 'lightgrey',
        'swt' : '#FFCA97',
        'swc' : '#FFCA97',
      },
      isButtonSelected : false,
      selectedGate : '',
    }
  }


  componentDidMount(){
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
    this.q_circuit_initialization(this.state.q_regs)
  }

  q_circuit_initialization = (q_regs) => {
    let q_circuit = []
    for (let i = 0; i < q_regs; i++) {
      let temp = []
      temp.push('i')
      q_circuit.push(temp)
    }
    
    this.setState({circuit_matrix : []})
    this.setState({q_circuit: q_circuit}, () => {this.getMatrix()})
    
    
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
    let q_regs = this.state.q_regs
    let previous_gate
    // console.log(reg_no,q_circuit.length)
    // console.log(pos,q_circuit[reg_no].length)
    // console.log(q_circuit)
    if (reg_no >= q_regs){
      console.log('Register number is too big.')
      return 0
    }
    if(pos ==q_circuit[reg_no].length-1){
      previous_gate = q_circuit[reg_no][pos]
      q_circuit[reg_no][pos] = gate
      if(previous_gate != gate){
        for (let i = 0; i < q_circuit.length; i++) {
          q_circuit[i].push('i')
        }
      }
    }
    else if (pos > q_circuit[reg_no].length){
      pos = q_circuit[reg_no].length
    } 
    else if (pos < q_circuit[reg_no].length){
      previous_gate = q_circuit[reg_no][pos]
      q_circuit[reg_no][pos] = gate
    }
    if (((gate == 'cnt' || gate == 'czt' || gate == 'swt') && reg_no == 0) || ((gate == 'icnt' || gate== 'iczt') && reg_no == q_regs-1)){
        console.log('This gate cannot be applied at this register.')
        return 0
    }
    for (let i = 0; i < q_circuit.length; i++) {
      if (q_circuit[i].length < q_circuit[reg_no].length){
           q_circuit[i].push('i')
      }
    }
    if(( gate == 'cnt' || gate == 'czt' || gate == 'swt')){
        q_circuit[reg_no-1][pos] = gate.slice(0, -1) + 'c'
        if(reg_no -2 >= 0){
          if(q_circuit[reg_no-2][pos] == 'icnt' || q_circuit[reg_no-2][pos] == 'iczt'){
            q_circuit[reg_no-2][pos] ='i'
          }
        }
        
    }
    else if ((gate == 'icnt' || gate == 'iczt')){
        q_circuit[reg_no+1][pos] = gate.slice(0, -1) + 'c'
        if(reg_no +2 < q_circuit.length ){
          console.log(reg_no,q_circuitlength)
          if(q_circuit[reg_no+2][pos] == 'cnt' || q_circuit[reg_no+2][pos] == 'czt' ||q_circuit[reg_no+2][pos] == 'swt'){
            q_circuit[reg_no+2][pos] ='i'
          }
        }
    }
    else { // When any other gate is entered but there are two qubit gates in the way
      if(previous_gate == 'cnt' || previous_gate == 'czt' ||previous_gate == 'swt' ||previous_gate == 'icnc' || previous_gate == 'iczc'){
        q_circuit[reg_no-1][pos] = 'i'
      }
      else if(previous_gate == 'icnt' || previous_gate == 'iczt' ||previous_gate == 'swc'||previous_gate == 'cnc' || previous_gate == 'czc'){
        q_circuit[reg_no+1][pos] = 'i'
      }
    }
    this.setState({selectedGate : '' , isButtonSelected : false,q_circuit : q_circuit},() => {this.getMatrix()})
    
    
  }
  
  getMatrix = () => {
    let q_circuit = this.state.q_circuit
    let column_matrix = []
    let gates = this.state.gates
    let previous_gate

    for (let i = 0; i < q_circuit[0].length ; i++) {
      let tensor_product = 'temp'
      for (let j = 0; j < q_circuit.length; j++){
        // console.log(q_circuit[j][i])
        if( (q_circuit[j][i] == 'cnc' || q_circuit[j][i] == 'czc' || q_circuit[j ][i] == 'swc')){
          continue
        }
        else if((q_circuit[j][i]== 'icnt' ||  q_circuit[j][i] == 'iczt') ){
          continue
        }
        if (tensor_product =='temp'){
          tensor_product = gates[q_circuit[j][i]]
        }
        else{
          
          tensor_product = math.kron(tensor_product,gates[q_circuit[j][i]])
        }
        previous_gate = q_circuit[j][i]
      }
      column_matrix.push(tensor_product)
      

    }
    
    let circuit_matrix = 'temp'
    
    for (let i = 0; i < column_matrix.length; i++) {
      
      if (i == 0){
        circuit_matrix = column_matrix[i]
      }
      else{
        // console.log(circuit_matrix , column_matrix[i])
        circuit_matrix = math.multiply(circuit_matrix , column_matrix[i])
        //-----------MAYBE THIS SHOULD BE dot ONly---------------------//
      }
    }
    // console.log(circuit_matrix)
    this.setState({circuit_matrix : circuit_matrix},() => this.getFlatlistData())
  }

  getFlatlistData = () => {
    let q_circuit = this.state.q_circuit
    let flatlist_data = []
    for (let i = 0; i < q_circuit.length; i++) {
      let gates = []
      for (let j = 0; j < q_circuit[i].length; j++) {
        gates.push(
          {
            'id' : i.toString() + "," + j.toString(),
            'name' : q_circuit[i][j],
            'reg_no' : i,
            'pos' : j
          }
        )
      }
      flatlist_data.push(
        {
          'id' : "q" + i.toString(),
          'gates' : gates
        }
      )
    }
    this.setState({flatlist_data : flatlist_data},() => this.getInputVector())
    
  }

  getInputVector = () => {
    let input_vector = [1,0]
    for (let i = 0; i < this.state.q_regs -1; i++) {
      input_vector = math.kron(input_vector , [1,0])
    }
    input_vector = input_vector[0]
    let newInput_vector = []
    for (let i = 0; i < input_vector.length; i++) {
      newInput_vector.push(input_vector[i])
    }
    input_vector = newInput_vector
    this.setState({input_vector : input_vector},() => this.getOutputVector())
  }

  getOutputVector = () => {
    // console.log(this.state.circuit_matrix)
    let output_vector = nj.dot(this.state.input_vector,this.state.circuit_matrix)
    output_vector = output_vector.tolist()
    // console.log(output_vector)
    this.setState({output_vector : output_vector},() => {this.getOutputSates(this.state.q_regs)})
  }

  calculate = (gate,reg_no,pos) => {
    let q_circuit = this.state.q_circuit
    let q_regs = this.state.q_regs
    let previous_gate
    // console.log(reg_no,q_circuit.length)
    // console.log(pos,q_circuit[reg_no].length)
    // console.log(q_circuit)
    if (reg_no >= q_regs){
      console.log('Register number is too big.')
      return 0
    }
    if(pos ==q_circuit[reg_no].length-1){
      previous_gate = q_circuit[reg_no][pos]
      q_circuit[reg_no][pos] = gate
      if(previous_gate != gate){
        for (let i = 0; i < q_circuit.length; i++) {
          q_circuit[i].push('i')
        }
      }
    }
    else if (pos > q_circuit[reg_no].length){
      pos = q_circuit[reg_no].length
    } 
    else if (pos < q_circuit[reg_no].length){
      previous_gate = q_circuit[reg_no][pos]
      q_circuit[reg_no][pos] = gate
    }
    if (((gate == 'cnt' || gate == 'czt' || gate == 'swt') && reg_no == 0) || ((gate == 'icnt' || gate== 'iczt') && reg_no == q_regs-1)){
        console.log('This gate cannot be applied at this register.')
        return 0
    }
    for (let i = 0; i < q_circuit.length; i++) {
      if (q_circuit[i].length < q_circuit[reg_no].length){
           q_circuit[i].push('i')
      }
    }
    if(( gate == 'cnt' || gate == 'czt' || gate == 'swt')){
        q_circuit[reg_no-1][pos] = gate.slice(0, -1) + 'c'
        if(reg_no -2 >= 0){
          if(q_circuit[reg_no-2][pos] == 'icnt' || q_circuit[reg_no-2][pos] == 'iczt'){
            q_circuit[reg_no-2][pos] ='i'
          }
        }
        
    }
    else if ((gate == 'icnt' || gate == 'iczt')){
        q_circuit[reg_no+1][pos] = gate.slice(0, -1) + 'c'
        if(reg_no +2 < q_circuit.length ){
          console.log(reg_no,q_circuitlength)
          if(q_circuit[reg_no+2][pos] == 'cnt' || q_circuit[reg_no+2][pos] == 'czt' ||q_circuit[reg_no+2][pos] == 'swt'){
            q_circuit[reg_no+2][pos] ='i'
          }
        }
    }
    else { // When any other gate is entered but there are two qubit gates in the way
      if(previous_gate == 'cnt' || previous_gate == 'czt' ||previous_gate == 'swt' ||previous_gate == 'icnc' || previous_gate == 'iczc'){
        q_circuit[reg_no-1][pos] = 'i'
      }
      else if(previous_gate == 'icnt' || previous_gate == 'iczt' ||previous_gate == 'swc'||previous_gate == 'cnc' || previous_gate == 'czc'){
        q_circuit[reg_no+1][pos] = 'i'
      }
    }
    let column_matrix = []
    let gates = this.state.gates

    for (let i = 0; i < q_circuit[0].length ; i++) {
      let tensor_product = 'temp'
      for (let j = 0; j < q_circuit.length; j++){
        // console.log(q_circuit[j][i])
        if( (q_circuit[j][i] == 'cnc' || q_circuit[j][i] == 'czc' || q_circuit[j ][i] == 'swc')){
          continue
        }
        else if((q_circuit[j][i]== 'icnt' ||  q_circuit[j][i] == 'iczt') ){
          continue
        }
        if (tensor_product =='temp'){
          tensor_product = gates[q_circuit[j][i]]
        }
        else{
          
          tensor_product = math.kron(tensor_product,gates[q_circuit[j][i]])
        }
        // previous_gate = q_circuit[j][i]
      }
      column_matrix.push(tensor_product)
      

    }
    // console.log(column_matrix)
    let circuit_matrix = 'temp'
    
    for (let i = 0; i < column_matrix.length; i++) {
      
      if (i == 0){
        circuit_matrix = column_matrix[i]
      }
      else{
        // console.log(circuit_matrix , column_matrix[i])
        circuit_matrix = math.multiply(circuit_matrix , column_matrix[i])
        //-----------MAYBE THIS SHOULD BE dot ONly---------------------//
      }
    }
    // console.log(circuit_matrix)
    // console.log(circuit_matrix)
    let flatlist_data = []
    for (let i = 0; i < q_circuit.length; i++) {
      let gates = []
      for (let j = 0; j < q_circuit[i].length; j++) {
        gates.push(
          {
            'id' : i.toString() + "," + j.toString(),
            'name' : q_circuit[i][j],
            'reg_no' : i,
            'pos' : j
          }
        )
      }
      flatlist_data.push(
        {
          'id' : "q" + i.toString(),
          'gates' : gates
        }
      )
    }
    let input_vector = [1,0]
    for (let i = 0; i < this.state.q_regs -1; i++) {
      input_vector = math.kron(input_vector , [1,0])
    }
    input_vector = input_vector[0]
    let newInput_vector = []
    for (let i = 0; i < input_vector.length; i++) {
      newInput_vector.push(input_vector[i])
    }
    input_vector = newInput_vector
    let output_vector = nj.dot(input_vector,circuit_matrix)
    output_vector = output_vector.tolist()
    
    let digits = this.state.q_regs
    let data = []
    for (let i = 0; i < 2**digits; i++) {
      let element = i.toString(2)
      while(element.length < digits){
        element = '0' + element
      }
      data.push(element)
    }

    let output_probability = []
    for (let i = 0; i < output_vector.length; i++) {
      output_probability.push((Math.round(output_vector[i]**2 * 100) / 100))
    }
    // console.log(output_probability)
    let output_labels = []
    for (let i = 0; i < output_probability.length; i++) {
      output_labels.push(output_probability[i]*100)
    }
    this.setState({selectedGate : '' , isButtonSelected : false,q_circuit : q_circuit,circuit_matrix : circuit_matrix,flatlist_data : flatlist_data,input_vector : input_vector,output_vector : output_vector,output_states : data,output_probability : output_probability,output_labels : output_labels})
  }

  getGateColor = (gate) => {
    return this.state.gateColors[gate]
  }

  getCardColor = (reg_no , gate) => {
    if (((gate == 'cnt' || gate == 'czt' || gate == 'swt') && reg_no == 0) || ((gate == 'icnt' && gate== 'iczt') && reg_no == q_regs-1)){
      return 'grey'
    }
    else {
      return this.getGateColor(gate)
    }
  }

  changeQregNo = (number) => {
    this.setState({
      q_regs : number,
      q_circuit : [],
      circuit_matrix : [],
      input_vector : [],
      output_vector : [],
      flatlist_data : [],
    },() => this.q_circuit_initialization(number))
  }

  getOutputSates = (digits) => {
    let data = []
    for (let i = 0; i < 2**digits; i++) {
      let element = i.toString(2)
      while(element.length < digits){
        element = '0' + element
      }
      data.push(element)
    }
    // console.log(data)
    this.setState({output_states : data},() => {this.getProbability()})
  }
	
  getProbability = () => {
    let output_vector = this.state.output_vector
    let output_probability = []
    for (let i = 0; i < output_vector.length; i++) {
      output_probability.push((Math.round(output_vector[i]**2 * 100) / 100))
    }
    // console.log(output_probability)
    let output_labels = []
    for (let i = 0; i < output_probability.length; i++) {
      output_labels.push(output_probability[i]*100)
    }
    this.setState({output_probability : output_probability,output_labels : output_labels})
  }
  // getBarData = () => {
  //   // console.log(this.state.output_states)
  //   // console.log(this.state.output_probability)
  //   let barData = {
  //     labels: this.state.output_states,
  //     datasets: [
  //       {
  //         data: this.state.output_probability
  //       }
  //     ]
  //   }
  //   // console.log(barData)
  //   this.setState({barData : barData})
  // }

  render(){
  return (
    <View style={styles.container}>
      <View style={styles.q_circuit_container}>
        <FlatList
          data={this.state.flatlist_data}
          renderItem={({item}) => {
            return(
            <View style={styles.reg_container}>
              <Text style={styles.q_reg_name}>{item.id} : </Text>
              <FlatList 
                data={item.gates}
                horizontal={true}
                renderItem={gates => {
                  return(
                  <TouchableOpacity onPress={() => {
                    this.calculate(this.state.selectedGate,gates.item.reg_no,gates.item.pos)
                    
                  }}>
                    <View style = {[styles.cardContainer,{backgroundColor : (this.getCardColor(gates.item.reg_no,gates.item.name))}]}>
                      <Text style = {styles.cardText}>{gates.item.name.toUpperCase()}</Text>
                    </View>
                  </TouchableOpacity>
                  )
                }}
                keyExtractor={gates => gates.id}
              />
            </View>
            )
          }}
          keyExtractor={item => item.id}
        />
      </View>
      <View style={styles.controls_container}>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'h'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('h'))}]}>
              <Text style={styles.gateButtonText}>H</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'x'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('x'))}]}>
              <Text style={styles.gateButtonText}>X</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'swt'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('swt'))}]}>
              <Text style={styles.gateButtonText}>Swap</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'z'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('z'))}]}>
              <Text style={styles.gateButtonText}>Z</Text>
            </View>
          </TouchableOpacity>
          
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'cnt'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('cnt'))}]}>
              <Text style={styles.gateButtonText}>Cnot</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'icnt'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('icnt'))}]}>
              <Text style={styles.gateButtonText}>iCnot</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'czt'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('czt'))}]}>
              <Text style={styles.gateButtonText}>CZ</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'iczt'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('iczt'))}]}>
              <Text style={styles.gateButtonText}>iCZ</Text>
            </View>
          </TouchableOpacity>
          
          
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => {
            this.setState({isButtonSelected : true,selectedGate : 'i'})
          }}>
            <View style={[styles.gateButton,{backgroundColor : (this.getGateColor('i'))}]}>
              <Text style={styles.gateButtonText}>I</Text>
            </View>
          </TouchableOpacity>
          
        </View>
        {/* <BarChart
          // style={graphStyle}
          data={this.state.barData}
          // labels ={this.state.output_states}
          // width={screenWidth}
          height={220}
          xAxisLabel="Probability"
          chartConfig={{
            backgroundGradientFrom: "#1E2923",
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: "#08130D",
            backgroundGradientToOpacity: 0.5,
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            // strokeWidth: 2, // optional, default 3
            barPercentage: 0.2,
            // useShadowColorFromDataset: false, // optional
            data: this.state.barData.datasets,
          }}
          verticalLabelRotation={30}
        /> */}
        <ScrollView>
          <ScrollView horizontal={true}>
            <View style={styles.graphContainer}>
              <VerticalBarGraph
                data={this.state.output_labels}
                labels={this.state.output_states}
                width={400}
                height={150}
                barRadius={5}
                barColor='lightgrey'
                barWidthPercentage={0.65}
                baseConfig={config}
                style={styles.chart}
              />
            </View>
          </ScrollView>
        </ScrollView>
        <Text style = {{alignSelf : 'center',fontSize : 17}}>No. of Q registers : </Text>
        <View style={styles.qreg_noContainer}>
          <TouchableOpacity onPress={() => this.changeQregNo(2)}>
            <View style={styles.qreg_noButton}>
              <Text style={{fontSize : 20}}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.changeQregNo(3)}>
            <View style={styles.qreg_noButton}>
              <Text style={{fontSize : 20}}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.changeQregNo(4)}>
            <View style={styles.qreg_noButton}>
              <Text style={{fontSize : 20}}>4</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.changeQregNo(5)}>
            <View style={styles.qreg_noButton}>
              <Text style={{fontSize : 20}}>5</Text>
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
    flexDirection : 'row',
    flex: 1,
    backgroundColor: '#fff',
    marginTop : 20
  },
  gateButton : {
    width : 75,
    height : 40,
    justifyContent : 'center',
    alignItems : 'center',
    borderRadius : 7
  },
  gateButtonText : {
    fontSize : 20,
  },
  buttonContainer :{
    flexDirection : 'row',
    justifyContent : 'space-around',
    padding : 5
  },
  input: {
    backgroundColor : 'lightblue',
    width : 60,
    height : 40,
    margin : 10
  },
  temp_field : {
  },
  q_circuit_container : {
    flex : 2,
    padding : 10,
    borderRightWidth : 1,
    borderColor : 'grey'
  },
  reg_container : {
    flexDirection : 'row',
    backgroundColor : '#FFFFF0',
    padding : 10,
    paddingBottom : 15,
    borderRadius : 10,
    marginVertical : 2,
    alignItems : 'center',
    
  },
  q_reg_name : {
    fontSize : 20
  },
  cardContainer : {
    height : 50,
    width : 50,
    marginHorizontal : 2,
    backgroundColor : 'lightblue',
    borderRadius : 5,
    alignItems : 'center',
    justifyContent : "center",
  },
  cardText : {
    fontSize : 15
  },
  controls_container : {
    flex :2,
  },
  qreg_noContainer : {
    flexDirection : 'row',
    justifyContent : 'space-around',
    padding : 10
  },
  qreg_noButton : {
    paddingVertical : 5,
    paddingHorizontal : 13,
    backgroundColor : 'lightgrey',
    borderRadius : 15
  },
  graphContainer : {
    padding : 10,
  },
  chart: {
    marginBottom: 30,
    padding: 10,
    paddingTop: 20,
    borderRadius: 20,
  }

});
