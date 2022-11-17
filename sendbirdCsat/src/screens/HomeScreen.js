import { View, Text, AppState, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { sendbird } from '../config/config'
import SendBirdDesk from 'sendbird-desk';
import { useNavigation } from '@react-navigation/native';
import SendBird, { setLogLevel } from 'sendbird';
import LabelText from '../components/LabelText';

const HomeScreen = ({ route }) => {
    const navigation = useNavigation()
    const [query, setQuery] = useState(null);
    const [activeChats, setActiveChats] = useState(null)

    // const userData = route.params.user


    /// on connection event
    const connectionHandler = new sendbird.ConnectionHandler();
    /// on channel event
    const channelHandler = new sendbird.ChannelHandler();





    // on state change
    useEffect(() => {
        sendbird.addConnectionHandler('channels', connectionHandler);
        sendbird.addChannelHandler('channels', channelHandler);
        const unsubscribe = AppState.addEventListener('change', handleStateChange);

        if (!sendbird.currentUser) {
            sendbird.connect('93017603', (_, err) => {
                if (!err) {
                    refresh();
                } else {
                    console.log("not found");
                }
            });
        } else {
            refresh();
        }

        return () => {
            sendbird.removeConnectionHandler('channels');
            sendbird.removeChannelHandler('channels');
            unsubscribe.remove();
        };
    }, []);


    const handleStateChange = newState => {
        if (newState === 'active') {
            sendbird.setForegroundState();
        } else {
            sendbird.setBackgroundState();
        }
    };

    const refresh = () => {
        SendBirdDesk.init(SendBird)
        SendBirdDesk.authenticate('93017603', (res, err) => {
            if (!err) {
                // console.log("res -> ", res);
            }
            getOpenList()
        })
    };

    const getOpenList = () => {
        const customFieldFilter = { 'Type': 'doctor' };
        SendBirdDesk.Ticket.getOpenedList(0, customFieldFilter, (tickets) => {
            // console.log("tickets", tickets);
            setActiveChats(tickets)
        })
    }


    // const next = () => {
    //     if (query.hasNext) {
    //         query.limit = 20;
    //         query.next((err, fetchedChannels) => {
    //             if (!err) {
    //                 console.log(fetchedChannels);
    //             } else {
    //                 console.log("error finding data");
    //             }
    //         });
    //     }
    // };


    // channelHandler.onMessageReceived = (targetChannel, message) => {
    //     if (targetChannel.url === channel.url) {
    //         setMessages([])
    //         setQuery(channel.createPreviousMessageListQuery())
    //     }
    // };
    // channelHandler.onMessageUpdated = (targetChannel, message) => {
    //     if (targetChannel.url === channel.url) {
    //         console.log('update-message', message);
    //     }
    // };
    // channelHandler.onMessageDeleted = (targetChannel, messageId) => {
    //     if (targetChannel.url === channel.url) {
    //         console.log('delete-message', messageId);
    //     }
    // };

    const GetChannelDetails = ({ item }) => {
        let channelData = []
        sendbird.GroupChannel.getChannel(item.channelUrl, (error, channel) => {
            if (!error) {
                channelData = channel
            }
        })
        return (
            <>
                <View style={{ width: '15%' }}>
                    {'93017603' == channelData?.lastMessage?._sender?.userId ? (
                        <Image source={{ uri: channelData?.lastMessage._sender?.profileUrl }} resizeMode='cover' style={[{ borderRadius: 100, width: 50, height: 50 }]} />
                    ) : (<Image source={{ uri: channelData?.lastMessage._sender?.profileUrl }} resizeMode='cover' style={[{ borderRadius: 100, width: 50, height: 50 }]} />)
                    }
                </View>
                <View style={{ width: '72%' }}>
                    <LabelText labelStyle={[{ marginLeft: 14, }]} label={item.customFields.title ? item.customFields.title : item.title} numberOfLines={1} />
                    <LabelText labelStyle={[{ marginLeft: 14, }]} label={channelData.lastMessage.messageType === 'file' ? channelData.lastMessage.name :
                        channelData.lastMessage.message} numberOfLines={2} />
                </View>
                {channelData.unreadMessageCount != 0 &&
                    <View style={[{ width: '15%', alignItems: 'center' }]}>
                        <View style={[{ backgroundColor: '#AD5171', borderRadius: 100, width: 20, height: 20 }]}>
                            <LabelText label={channelData.unreadMessageCount} labelStyle={[{ textAlign: 'center' }]} />
                        </View>
                    </View>
                }
            </>
        )
    }

    const navigateToChat = (item) => {
        getChannelData(item.channelUrl)
    }

    const getChannelData = async (channelUrl) => {
        sendbird.GroupChannel.getChannel(channelUrl, (error, channel) => {
            //   sendbird.setPushTriggerOption('all');;
            if (!error) {
                navigation.navigate('ChatScreen', { channel: channel })
            }
        })
    }


    return (
        <View>

            {activeChats && activeChats.length != 0 &&
                <View style={{ marginTop: 12 }}>
                    <Text>{'ACTIVE CHAT'}</Text>
                    {activeChats && activeChats.map((c, i) => {
                        return (
                            <View style={{ paddingLeft: 24, paddingRight: 24 }} key={i}>
                                <View style={[{ borderBottomColor: 'grey', borderBottomWidth: 0.5 }]} key={i}>
                                    <TouchableOpacity style={{ paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' }} onPress={() => { navigateToChat(c) }}>
                                        <GetChannelDetails item={c} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    })}
                </View>
            }
        </View>
    )
}

export default HomeScreen