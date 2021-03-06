let nextNotificationId = 0;
const defaultState = {
    notifications: [],
    html5: true,
}

const notifications = (state = defaultState, action) => {
    switch(action.type) {
        case 'NOTIFICATION_ADDED':
            return {...state, notifications: [...state.notifications, {...action.notification, id: nextNotificationId++}]};
        case 'NOTIFICATION_REMOVED':
            return {...state, notifications: state.notifications.filter(notification => notification.id !== action.notification.id)};
        case 'NOTIFICATIONS_HTML5_BLOCKED':
            return {...state, html5: false };
        default:
            return state;
    }
}

export default notifications;

