import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainAppScreen from '../screens/MainAppScreen';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={MainAppScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;