import React from 'react';
import {
    NavigationContainer,
} from '@react-navigation/native';
import {
    createNativeStackNavigator,
} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import IcuOverviewScreen from '../screens/icu/IcuOverviewScreen';
import PatientDetailScreen from '../screens/patient/PatientDetailScreen';

export type RootStackParamList = {
    Login: undefined;
    Dashboard: undefined;
    IcuOverview: undefined;
    PatientDetail: {
        patientId: string;
    };
};

const Stack =
    createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
            }}>

            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />

            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
            />

            <Stack.Screen
                name="IcuOverview"
                component={IcuOverviewScreen}
            />

            <Stack.Screen
                name="PatientDetail"
                component={PatientDetailScreen}
            />

        </Stack.Navigator>
    </NavigationContainer>
);

export default AppNavigator;