import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, View, Text, Linking } from 'react-native';
import moment from 'moment';
import { sendbird } from '../config/config';
import LabelText from './LabelText';
import Colors from '../themes/Colors'
import Metrics from '../themes/Metrics'
import Layouts from '../themes/Layouts'
import { useNavigation } from '@react-navigation/native';

const UserMessage = props => {
  const { channel, message, onPress = () => { }, onLongPress = () => { } } = props;
  const isMyMessage = message.sender.userId === sendbird.currentUser.userId;
  const [readReceipt, setReadReceipt] = useState(channel.members.length - 1);
  const navigation = useNavigation()

  useEffect(() => {
    const channelHandler = new sendbird.ChannelHandler();
    channelHandler.onReadReceiptUpdated = targetChannel => {
      if (targetChannel.url === channel.url) {
        setReadReceipt(channel.getUnreadMemberCount(message));
      }
    };

    sendbird.addChannelHandler(`message-${message.reqId}`, channelHandler);
    setReadReceipt(channel.getUnreadMemberCount(message));
    return () => {
      sendbird.removeChannelHandler(`message-${message.reqId}`);
    };
  }, []);

  const navigateLink = () => {
    // if (message.ogMetaData.url.startsWith('radishhealth://')) {
    //   deeplink(message.ogMetaData.url, navigation)
    // } else if (message.ogMetaData.url.startsWith('https://radishhealth.app.link') || message.ogMetaData.url.startsWith('https://radishhealth.test-app.link')) {
    //   deeplink(message.ogMetaData.url, navigation)
    // } else {
    //   Linking.openURL(message.ogMetaData.url)
    // }
  }

  const CustomText = (props) => {
    const text = props.text.split(' ');
    return <Text style={{ color: '#000', fontSize: 16 }}>{text.map(word => {
      if (word.includes('https://') || word.includes('http://')) {
        return <Text onPress={() => navigateLink()} style={[{ color: '#000', fontSize: 16 }, { color: Colors.USER_HELP_TEXT }]}>{word} </Text>;
      }
      return `${word} `;
    })}</Text>;
  }

  return (
    <>
      {message.titleDate &&
        <View style={{ alignItems: 'center', minWidth: 90, alignSelf: 'center', position: 'absolute', top: 10 }}>
          <LabelText label={moment(message.createdAt).format("ddd, MMM DD")} labelStyle={[{ color: '#808080', padding: 3 }]} />
        </View>}
      <TouchableOpacity activeOpacity={0.75} onPress={() => onPress(message)}
        onLongPress={() => onLongPress(message)}
        style={{
          ...style.container,
          flexDirection: isMyMessage ? 'row-reverse' : 'row',
          marginTop: message.titleDate ? 41 : 0,
        }}>
        <View style={{ alignItems: isMyMessage ? 'flex-end' : 'flex-start', width: '75%', paddingHorizontal: 5 }}>
          {!isMyMessage &&
            <View style={[{ marginLeft: isMyMessage ? 0 : 40, marginRight: isMyMessage ? 40 : 0 }]}>
              {!message.hasSameSenderAbove && <LabelText labelStyle={style.nickname} label={message.sender.nickname} numberOfLines={1} />}
            </View>
          }
          <View style={{ flexDirection: isMyMessage ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
            {!isMyMessage &&
              <View style={style.profileImageContainer}>
                {!message.hasSameSenderBelow && (message.sender.profileUrl ? <Image source={{ uri: message.sender.profileUrl }} style={[style.profileImage, isMyMessage ? { marginLeft: 6 } : { marginLeft: -4 }]} /> :
                  <View style={[Layouts.justifyCenter, {
                    marginBottom: 0, top: 7, backgroundColor: '#8BA78E',
                    width: 24,
                    height: 24,
                    borderRadius: 25,
                    marginBottom: 5,
                  }, isMyMessage ? { marginLeft: 13 } : { marginLeft: 2 }]}>
                    <Text style={[Layouts.selfCenter, { textAlign: 'center', fontSize: 12 }]}>{initalLetter(message.sender.nickname)}</Text>
                  </View>
                )}
              </View>
            }
            <View style={[{ backgroundColor: isMyMessage ? Colors.WHITE : Colors.BOOK_APPOINTMENT_BG, borderRadius: 16 }, Metrics.padding10, Metrics.mt5]}>
              {!message.ogMetaData &&
                <LabelText label={message.message} labelStyle={{ color: '#000', fontSize: 16 }} />
              }
              {/* {message.ogMetaData &&
                <CustomText text={message.message} />
              } */}
              <LabelText label={moment(message.createdAt).format('LT')} labelStyle={[Metrics.mt6, { fontSize: 11, textAlign: isMyMessage ? 'right' : 'left' }]} />
            </View>
            {/* <View style={{ ...style.status, alignItems: isMyMessage ? 'flex-end' : 'flex-start' }}>
              {isMyMessage && message.sendingStatus === 'pending' && (
                <Progress.Circle size={10} indeterminate={true} indeterminateAnimationDuration={800} color="#999" />
              )}
            </View> */}
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

const style = {
  container: {
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderWidth: 0,
    borderRadius: 16,
  },
  nickname: {
    fontSize: 11,
    fontWeight: '400',
    color: '#808080',
    marginHorizontal: 17,
  },
  status: {
    alignSelf: 'flex-end',
    marginHorizontal: 5,
    marginBottom: 3,
  },
  profileImageContainer: {
    width: 32,
    height: 32,
    marginHorizontal: 8,
  },
};

export default UserMessage;
