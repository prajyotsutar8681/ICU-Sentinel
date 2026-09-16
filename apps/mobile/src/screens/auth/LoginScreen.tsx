import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    useNavigation,
    type NavigationProp,
} from '@react-navigation/native';

import type { RootStackParamList } from '../../navigation/AppNavigator';

const LoginScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>IS</Text>
                    </View>

                    {/* App Title */}
                    <Text style={styles.title}>ICU Sentinel</Text>

                    <Text style={styles.subtitle}>
                        Real-time ICU patient monitoring
                    </Text>

                    {/* Login Form */}
                    <View style={styles.form}>

                        {/* Doctor ID */}
                        <Text style={styles.label}>Doctor ID</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your doctor ID"
                            placeholderTextColor="#8A99A8"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* Password */}
                        <Text style={styles.label}>Password</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#8A99A8"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotButton}
                            onPress={() => {
                                // Forgot password functionality will be added later
                            }}
                        >
                            <Text style={styles.forgotText}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Sign In */}
                        <TouchableOpacity
                            style={styles.loginButton}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('IcuOverview')}
                        >
                            <Text style={styles.loginText}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <Text style={styles.footer}>
                        Authorized hospital personnel only
                    </Text>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FC',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
    },

    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: '#0B1F33',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 18,
    },

    logo: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },

    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#0B1F33',
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 15,
        color: '#617184',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 36,
    },

    form: {
        width: '100%',
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#263746',
        marginBottom: 8,
        marginTop: 16,
    },

    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#D6DEE7',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#0B1F33',
    },

    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: 12,
    },

    forgotText: {
        color: '#1E88E5',
        fontSize: 14,
        fontWeight: '600',
    },

    loginButton: {
        height: 54,
        borderRadius: 12,
        backgroundColor: '#0B1F33',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,
    },

    loginText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },

    footer: {
        textAlign: 'center',
        color: '#8A99A8',
        fontSize: 12,
        marginTop: 32,
    },
});

export default LoginScreen;