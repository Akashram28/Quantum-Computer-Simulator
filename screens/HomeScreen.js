import React from 'react';
import { StyleSheet, Text, View ,TouchableOpacity ,Image} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation'

export default class HomeScreen extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  componentDidMount(){
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
  }
  
  render(){
  return (
    <View style={styles.container}>
      <View style={styles.topTextContainer}>
        <Text style={styles.topText}>Quantum Simulator</Text>
      </View>
      <View style={styles.optionContainer}>
        <TouchableOpacity>
            <View style={styles.optionButton}>
                <Image 
                source={require('../assets/images/Learn.png')}
                style = {styles.optionImage}
                />
                <Text style={styles.optionText}>Learn</Text>
                
            </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          this.props.navigation.navigate('CreateScreen')
        }}>
            <View style={styles.optionButton}>
                <Image 
                source={require('../assets/images/Create.png')}
                style = {styles.optionImage}
                />
                <Text style={styles.optionText}>Create</Text>
                
            </View>
        </TouchableOpacity>
        <TouchableOpacity>
            <View style={styles.optionButton}>
                <Image 
                source={require('../assets/images/Support.png')}
                style = {styles.optionImage}
                />
                <Text style={styles.optionText}>Support</Text>
                
            </View>
        </TouchableOpacity>
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
  topTextContainer :{

  },
  topText : {
    fontSize : 40,
    color : '#95E0F9',
    fontWeight : 'bold',
    marginBottom : 20
  },
  optionContainer :{
    width : '100%',
    flexDirection : 'row' ,
    justifyContent : 'space-around',
  },
  optionButton : {
    justifyContent : 'center',
    alignItems : 'center',
    backgroundColor : '#f5f5f5',
    paddingHorizontal : 20,
    paddingVertical : 15,
    borderRadius : 20,
    borderBottomWidth : 4,
    borderRightWidth : 2,
    borderLeftWidth : 2,
    borderColor : 'lightgrey'
  },
  optionImage : {
    width : 70,
    height : 70
  },
  optionText : {
    fontSize : 17
  }
});
