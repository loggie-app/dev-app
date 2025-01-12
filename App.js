import { View, TouchableOpacity, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Home, Calendar, BarChart, Settings, Plus } from 'lucide-react-native';
import { colors } from './src/components/common/styles';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import AddCollectionScreen from './src/screens/AddCollectionScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ReportScreens from './src/screens/ReportScreens';
import SettingsScreen from './src/screens/SettingsScreen';
import CollectionDetailScreen from './src/screens/CollectionDetailScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';  // Add this line
import CustomCollectionFieldsScreen from './src/screens/CustomCollectionFieldsScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        presentation: 'modal',
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 100,
        },
        headerTitleAlign: 'left',
        headerTitle: () => (
          <Image 
            source={require('./assets/xP.png')}
            style={{ 
              height: 40,
              width: 150,
              marginTop: 0,
              resizeMode: 'contain',
            }}
          />
        ),
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 16, marginTop: 10 }}
              onPress={() => navigation.navigate('AddCollection')}
            >
              <Plus color={colors.primary} size={24} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="AddCollection" 
        component={AddCollectionScreen}
        options={{
          headerShown: false
        }}
      />
            <Stack.Screen 
        name="AddEntry" 
        component={AddEntryScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
  name="CustomCollectionFields" 
  component={CustomCollectionFieldsScreen}
  options={{
    headerShown: false,
    presentation: 'card'
  }}
/>
      <Stack.Screen 
        name="CollectionDetail" 
        component={CollectionDetailScreen}
        options={({ route }) => ({
          headerTitle: route.params.collection.name,
          presentation: 'card'
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: colors.background,
                borderTopWidth: 0,
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.text.secondary,
            }}
          >
            <Tab.Screen 
              name="Home" 
              component={HomeStack}
              options={{
                tabBarIcon: ({ color }) => <Home color={color} size={24} />
              }}
            />
            <Tab.Screen 
              name="Calendar" 
              component={CalendarScreen}
              options={{
                tabBarIcon: ({ color }) => <Calendar color={color} size={24} />
              }}
            />
            <Tab.Screen 
              name="Reports" 
              component={ReportScreens}
              options={{
                tabBarIcon: ({ color }) => <BarChart color={color} size={24} />
              }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                tabBarIcon: ({ color }) => <Settings color={color} size={24} />
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}