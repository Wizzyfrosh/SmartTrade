/**
 * Network Status Hook
 * Detect and monitor network connectivity
 */

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean>(true);

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected ?? false);
            setIsInternetReachable(state.isInternetReachable ?? false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    return {
        isConnected,
        isInternetReachable,
        isOnline: isConnected && isInternetReachable,
    };
};
