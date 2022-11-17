import { View, Text, TouchableOpacity, Button, Platform } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import SendBirdDesk from 'sendbird-desk';
import SendBird from 'sendbird';
import { iOSToken, sendbird, androidToken } from '../config/config';

const LoginScreen = () => {
    const navigation = useNavigation()

    const onLogin = () => {
        sendbird.setErrorFirstCallback(true);

        sendbird.connect('93017603', (err, user) => {
            console.log("error \n", err);
            console.log("user ->\n ", user);
            // if (Platform.OS === 'ios') {
            //     sendbird.registerAPNSPushTokenForCurrentUser(iOSToken)
            // } else {
            //     sendbird.registerGCMPushTokenForCurrentUser(androidToken)
            // }
            if (!err) {
                const userData = user
                navigation.replace('HomeScreen')
            } else {
                alert('user not found')
            }
        })

    }

    return (
        <View>
            <Text>LoginScreen</Text>
            <Button title='Login' onPress={onLogin} />
        </View>
    )
}

export default LoginScreen