import { useEffect, useState } from 'react';
import { loadCustomerSession } from '../../services/customerSession';
import type { InAppNotification } from '../../types/notification';
import {
  dismissPopup,
  getActivePopupForUser,
  INAPP_NOTIF_UPDATED,
  startInAppNotificationPolling,
} from '../../services/inAppNotificationService';
import { NotificationPopup } from './NotificationPopup';

/** Gắn ở App — hiển thị popup thông báo cho khách (polling + event) */
export function NotificationPopupHost() {
  const [popup, setPopup] = useState<InAppNotification | null>(null);

  useEffect(() => {
    const session = loadCustomerSession();
    const stop = startInAppNotificationPolling(
      session.userId,
      ({ popup: next }) => setPopup(next),
      3000,
    );
    const onUpdate = () => setPopup(getActivePopupForUser(session.userId));
    window.addEventListener(INAPP_NOTIF_UPDATED, onUpdate);
    return () => {
      stop();
      window.removeEventListener(INAPP_NOTIF_UPDATED, onUpdate);
    };
  }, []);

  const handleDismiss = () => {
    if (!popup) return;
    dismissPopup(loadCustomerSession().userId, popup.id);
    setPopup(null);
  };

  return (
    <NotificationPopup notification={popup} onDismiss={handleDismiss} />
  );
}
