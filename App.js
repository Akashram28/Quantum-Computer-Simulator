import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'
import HomeScreen from './screens/HomeScreen'
import CreateScreen from './screens/CreateScreen'

const MainNavigator = createStackNavigator(
  {
    HomeScreen : {
      screen : HomeScreen
    },
    CreateScreen : {
      screen : CreateScreen
    }
  },
  {
    defaultNavigationOptions : {
      headerShown : false
    }
  }
)

const App = createAppContainer(MainNavigator)
export default App
