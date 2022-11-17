import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import LabelText from './LabelText';
import Colors from '../themes/Colors'
import Metrics from '../themes/Metrics'

const AdminMessage = props => {
  const { message } = props;
  return (
    <>
      {message.titleDate &&
        <>
          <View style={{ alignItems: 'center', minWidth: 90, alignSelf: 'center', position: 'absolute', top: 10 }}>
            <LabelText label={moment(message.createdAt).format("ddd, MMM DD")} labelStyle={[{ color: '#808080', padding: 3, fontSize: 11 }]} />
          </View>
        </>
      }
      <TouchableOpacity activeOpacity={0.75} onPress={() => onPress(message)}
        onLongPress={() => onLongPress(message)}
        style={{
          ...style.container,
          flexDirection: 'row',
          marginTop: message.titleDate ? 41 : 0,
        }}>
        <View style={{ alignItems: 'flex-start', width: '75%', paddingHorizontal: 5 }}>
          <View style={[{ marginLeft: 40, marginRight: 0 }]}>
            <LabelText labelStyle={style.nickname} label={'Radish Care Team'} numberOfLines={1} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <View style={style.profileImageContainer}>
              <Image source={AssetImages.completeAssessment} style={[style.profileImage, { marginLeft: -4 }]} />
            </View>
            <View style={[{ backgroundColor: Colors.BOOK_APPOINTMENT_BG, borderRadius: 16 }, Metrics.padding10, Metrics.mt5]}>
              <LabelText label={message.message} labelStyle={{ fontSize: 14, color: '#000' }} />
              <LabelText label={moment(message.createdAt).format('LT')} labelStyle={[, Metrics.mt6, { fontSize: 11, textAlign: 'left' }]} />
            </View>
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
  nickname: {
    fontSize: 11,
    fontWeight: '400',
    color: '#808080',
    marginHorizontal: 17,
  },
  profileImageContainer: {
    width: 32,
    height: 32,
    marginHorizontal: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderWidth: 0,
    borderRadius: 16,
  },
};

export default AdminMessage;
