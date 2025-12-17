import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../src/constants/theme';

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.lastUpdated}>Last Updated: December 14, 2025</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.paragraph}>
                        Welcome to SmartTrade ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                    </Text>
                    <Text style={styles.paragraph}>
                        When you use our mobile application, you trust us with your personal information. We take your privacy very seriously. In this privacy notice, we describe our privacy policy. We seek to explain to you in the clearest way possible what information we collect, how we use it, and what rights you have in relation to it.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                    <Text style={styles.paragraph}>
                        We collect personal information that you voluntarily provide to us when registering at the App, expressing an interest in obtaining information about us or our products and services, when participating in activities on the App or otherwise contacting us.
                    </Text>
                    <Text style={styles.subTitle}>Personal Information Provided by You</Text>
                    <Text style={styles.paragraph}>
                        The personal information that we collect depends on the context of your interactions with us and the App, the choices you make and the products and features you use. The personal information we collect can include the following:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletPoint}>• Name and Contact Data</Text>
                        <Text style={styles.bulletPoint}>• Email Address</Text>
                        <Text style={styles.bulletPoint}>• Passwords (hashed and secure)</Text>
                        <Text style={styles.bulletPoint}>• Business/Inventory Data</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        We use personal information collected via our App for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                    </Text>
                    <Text style={styles.paragraph}>
                        We use the information we collect or receive:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletPoint}>• To facilitate account creation and logon process.</Text>
                        <Text style={styles.bulletPoint}>• To send administrative information to you.</Text>
                        <Text style={styles.bulletPoint}>• To protect our Services.</Text>
                        <Text style={styles.bulletPoint}>• To enforce our terms, conditions and policies.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our App is at your own risk.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have questions or comments about this policy, you may email us at support@smarttrade.app.
                    </Text>
                </View>

                {/* Bottom spacer */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFC', // Colors.background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6', // Colors.border
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.lg,
    },
    lastUpdated: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    subTitle: {
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
        color: Colors.textPrimary,
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    paragraph: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: Spacing.sm,
    },
    bulletList: {
        marginLeft: Spacing.md,
        marginTop: Spacing.xs,
    },
    bulletPoint: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 4,
    },
});
