import { View, Text, AppState, FlatList, TouchableOpacity, TextInput, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { sendbird } from '../config/config'
import SendBirdDesk from 'sendbird-desk';
import Message from '../components/message';
import Layouts from '../themes/Layouts';
import moment from 'moment'

const ChatScreen = ({ route }) => {
    const { channel } = route.params;
    const [messages, setMessages] = useState([])
    const [query, setQuery] = useState(null);
    const [channelType, setChannelType] = useState('')
    const [title, setTitle] = useState('CHAT')
    const [inputMessage, setInputMessage] = useState('')

    /// on connection event
    const connectionHandler = new sendbird.ConnectionHandler();
    /// on channel event
    const channelHandler = new sendbird.ChannelHandler();

    useEffect(() => {
        checkTicketStatus()
        sendbird.addConnectionHandler('chat', connectionHandler);
        sendbird.addChannelHandler('chat', channelHandler);
        // channel.setMyPushTriggerOption('off')
        const unsubscribe = AppState.addEventListener('change', handleStateChange);
        if (!sendbird.currentUser) {
            sendbird.connect('93017603', (err, _) => {
                if (!err) {
                    setQuery(channel.createPreviousMessageListQuery())
                }
            })
        } else {
            setQuery(channel.createPreviousMessageListQuery())
        }
        return () => {
            sendbird.removeConnectionHandler('chat');
            sendbird.removeChannelHandler('chat');
            // channel.setMyPushTriggerOption('default');
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

    const checkTicketStatus = () => {
        SendBirdDesk.Ticket.getByChannelUrl(channel.url, (ticket, error) => {
            if (!error) {
                if (ticket?.customFields?.title) {
                    setTitle(ticket.customFields.title)
                }
                setChannelType(ticket.status)
            }
        })
    }

    const enterToChannel = async () => {
        if (channelType != 'CLOSED') {
            channel.markAsRead()
        }
        if (query.hasMore) {
            query.limit = 50;
            query.reverse = true;
            const messagesData = await query.load();
            const filtered = messagesData.filter(data => {
                return data.customType != 'SENDBIRD:AUTO_EVENT_MESSAGE';
            });
            const arrayUniqueByKey = [...new Map(filtered.map(item => [moment(item.createdAt).format("LL"), item])).values()];
            for (let i = 0; i < arrayUniqueByKey.length; i++) {
                for (let j = 0; j < messagesData.length; j++) {
                    if (arrayUniqueByKey[i].createdAt === messagesData[j].createdAt) {
                        messagesData[j]['titleDate'] = arrayUniqueByKey[i].createdAt
                    }
                }
            }
            for (let j = 0; j < messagesData.length - 1; j++) {
                messagesData[j].hasSameSenderAbove =
                    messagesData[j].sender &&
                    messagesData[j + 1].sender &&
                    messagesData[j].sender.userId === messagesData[j + 1].sender.userId && !messagesData[j].titleDate;
                if (j != 0) {
                    messagesData[j].hasSameSenderBelow =
                        messagesData[j].sender &&
                        messagesData[j - 1].sender &&
                        messagesData[j].sender.userId === messagesData[j - 1].sender.userId && !messagesData[j - 1].titleDate;
                }
            }
            setMessages([...messages, ...messagesData])
        }
    }

    channelHandler.onMessageReceived = (targetChannel, message) => {
        console.log('onMessageReceived ', message);
        if (targetChannel.url === channel.url) {
            setMessages([])
            setQuery(channel.createPreviousMessageListQuery())
        }
    };

    channelHandler.onMessageUpdated = (targetChannel, message) => {
        console.log("onMessageUpdated");
        if (targetChannel.url === channel.url) {
            SendBirdDesk.Ticket.getByChannelUrl(channel.url, (ticket, error) => {
                if (error) {
                    // Handle error.
                }

                let data = JSON.parse(message.data);

                //TODO CSAT: not getting any response of ticket feedback 

                const isFeedbackMessage = data.type === SendBirdDesk.Message.DataType.TICKET_FEEDBACK;
                if (isFeedbackMessage) {
                    const feedback = data.body;
                    switch (feedback.state) {
                        case SendBirdDesk.Message.FeedbackState.WAITING:
                            // Implement your code for the UI when there is no response from a customer.
                            break;
                        case SendBirdDesk.Message.FeedbackState.CONFIRMED:
                            // Implement your code for the UI when there is a response from a customer.
                            break;
                    }
                }
            });

        }
    };
    channelHandler.onMessageDeleted = (targetChannel, messageId) => {
        if (targetChannel.url === channel.url) {
            console.log('delete-message', messageId);
        }
    };

    const sendUserMessage = () => {
        if (inputMessage.length > 0) {
            if (channelType === 'CLOSED') {
                reopenTicket(inputMessage)
            } else {
                sendMessage(inputMessage)
                setInputMessage('')
            }
        }
    }

    const sendMessage = async (message) => {
        const params = new sendbird.UserMessageParams();
        params.message = message;
        channel.sendUserMessage(params, (err, message) => {
            if (!err) {
                setInputMessage('')
                let updateMessage = [...[message], ...messages]
                setMessages(updateMessage)
                setQuery(channel.createPreviousMessageListQuery())
                enterToChannel()
                checkTicketStatus()
            } else {
                console.log('Failed to send a message.');
            }
        });
    }

    useEffect(() => {
        if (query) {
            enterToChannel()
        }
    }, [query]);


    return (
        <SafeAreaView style={Layouts.flexContainer}>
            <FlatList
                data={messages}
                inverted={true}
                renderItem={({ item }) => (
                    <Message
                        key={item.reqId}
                        channel={channel}
                        message={item}
                    // onPress={message => viewDetail(message)}
                    //onLongPress={message => showContextMenu(message)}
                    />
                )}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingVertical: 10 }}
                onEndReached={() => enterToChannel()}
                onEndReachedThreshold={0.5} />


            <View style={style.inputContainer}>
                <TouchableOpacity activeOpacity={0.85} style={style.uploadButton} >
                    {/* <Icon name="insert-photo" color="#7b53ef" size={28} /> */}
                </TouchableOpacity>
                <TextInput
                    value={inputMessage}
                    style={style.input}
                    multiline={true}
                    numberOfLines={2}
                    onChangeText={content => {
                        if (content.length > 0) {
                            channel.startTyping();
                        } else {
                            channel.endTyping();
                        }
                        setInputMessage(content)
                    }}
                />
                <TouchableOpacity activeOpacity={0.85} style={style.sendButton} onPress={sendUserMessage}>
                    {/* <Icon name="send" color={state.input.length > 0 ? '#7b53ef' : '#ddd'} size={28} /> */}

                    <Text style={{ backgroundColor: 'green', padding: 5 }}>Send</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
}

const style = {
    container: {
        flex: 1,
    },
    headerRightContainer: {
        flexDirection: 'row',
    },
    headerRightButton: {
        marginRight: 10,
    },
    errorContainer: {
        backgroundColor: '#333',
        opacity: 0.8,
        padding: 10,
    },
    error: {
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        fontSize: 24,
        color: '#999',
        alignSelf: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 4,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 20,
        color: '#555',
    },
    uploadButton: {
        marginRight: 10,
    },
    sendButton: {
        marginLeft: 10,
    },
};

export default ChatScreen