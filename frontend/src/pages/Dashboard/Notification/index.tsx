import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiBell } from 'react-icons/fi';
import { parseISO, formatDistance } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import api from '../../../services/api';
import { useAuth } from '../../../hooks/auth';
import { useToast } from '../../../hooks/toast';

import {
  Container,
  Badge,
  NotificationList,
  Scroll,
  Notification,
} from './styles';

interface NotificationItem {
  id: string;
  content: string;
  read: boolean;
  created_at: string;
  timeDistance: string;
}

interface EventClick extends MouseEvent {
  path: [];
}

const Notifications: React.FC = () => {
  const { signOut } = useAuth();
  const { addToast } = useToast();

  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const hasUnread = useMemo(
    () => !!notifications.find((notification) => notification.read === false),
    [notifications],
  );

  const getNotifications = useCallback(async () => {
    const response = await api.get('/providers/notifications');
    const notificationsResponse = response.data as NotificationItem[];

    const data = notificationsResponse.map((notification) => ({
      ...notification,
      timeDistance: formatDistance(
        parseISO(notification.created_at),
        new Date(),
        { addSuffix: true, locale: ptBR },
      ),
    }));

    setNotifications(data);
    setLoadingNotifications(false);
  }, []);

  const handleToggleVisible = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  const handleMarkAsRead = useCallback(
    async (doc_id: string) => {
      try {
        await api.put('/providers/notifications', {
          doc_id,
        });

        setNotifications(
          notifications.map((notification) =>
            notification.id === doc_id
              ? { ...notification, read: true }
              : notification,
          ),
        );
      } catch (error) {
        if (error.response.status === 401) {
          signOut();
        }
        addToast({
          type: 'error',
          title: 'Error ao tenta atualizar',
          description:
            'Ocorreu um erro ao tenta atualizar a notificação tente novamente',
        });
      }
    },
    [addToast, notifications, signOut],
  );

  useEffect(() => {
    document.addEventListener('click', (evt) => {
      const click = evt as EventClick;
      if (click.path.length < 12 || click.path.length > 14) {
        setVisible(false);
      }
    });

    getNotifications();
  }, [getNotifications]);

  return (
    <Container>
      {!loadingNotifications ? (
        <Badge
          title={`${notifications.length} notificações`}
          onClick={handleToggleVisible}
          hasUnread={hasUnread}
        >
          <FiBell color="#999591" size={20} />
        </Badge>
      ) : (
        <SkeletonTheme color="#1F1E22" highlightColor="#444">
          <Skeleton style={{ width: 40, height: 40 }} />
        </SkeletonTheme>
      )}

      <NotificationList visible={visible}>
        <Scroll>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Notification key={notification.id} unread={!notification.read}>
                <p>{notification.content}</p>
                <time>{notification.timeDistance}</time>
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Marcar como lida
                  </button>
                )}
              </Notification>
            ))
          ) : (
            <div className="empty">
              <span>Sem novas notificações no momento</span>
            </div>
          )}
        </Scroll>
      </NotificationList>
    </Container>
  );
};

export default Notifications;
