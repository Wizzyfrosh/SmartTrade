import React, { useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '../services/supabase/client';
import { Button } from './Button';
import { makeRedirectUri } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export const GoogleAuthButton = () => {
    // Client IDs provided by user
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: '937396339820-5v5aarrk5va49iet6om5rjmnatnjqdeo.apps.googleusercontent.com',
        webClientId: '937396339820-9lm694se2u23j5uicuqqq9q6e7qlcbm4.apps.googleusercontent.com',
        redirectUri: makeRedirectUri({
            scheme: 'smarttrade' // Matching app.json
        }),
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            signInWithGoogle(authentication?.idToken);
        }
    }, [response]);

    const signInWithGoogle = async (idToken?: string) => {
        try {
            if (!idToken) throw new Error('No ID token found');

            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) throw error;
            // Auth state change will be handled by the auth listener in layout/context
        } catch (error: any) {
            Alert.alert('Google Sign-In Error', error.message);
        }
    };

    return (
        <Button
            title="Continue with Google"
            onPress={() => promptAsync()}
            variant="outline"
            style={styles.button}
            disabled={!request}
            icon={<Ionicons name="logo-google" size={20} color="#DB4437" />}
        />
    );
};

const styles = StyleSheet.create({
    button: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderColor: '#ddd',
    },
});
