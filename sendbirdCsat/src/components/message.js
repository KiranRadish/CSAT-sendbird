import React from 'react';
import UserMessage from './userMessage';
// import FileMessage from './fileMessage';
import AdminMessage from './adminMessage';

const Message = props => {
  const { message } = props;
  let component = null;
  if (message.isUserMessage()) {
    component = <UserMessage {...props} />;
  } else if (message.isAdminMessage() && message.customType != "SENDBIRD_DESK_ADMIN_MESSAGE_CUSTOM_TYPE" && message.customType != "SENDBIRD:AUTO_EVENT_MESSAGE") {
    component = <AdminMessage {...props} />;
  }
  return component;
};

export default Message;
