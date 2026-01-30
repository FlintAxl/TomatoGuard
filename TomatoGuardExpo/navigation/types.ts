import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  MainApp: undefined;
  Profile: undefined;
  AdminDashboard: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainStackParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Landing: undefined;
};

export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
