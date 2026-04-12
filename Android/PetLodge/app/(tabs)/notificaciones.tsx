import { View, Text, ScrollView, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../constants/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type Notification = {
  id: string;
  reservation_id: string | null;
  template_id: string;
  user_id: string;
  affair: string;
  html_body: string;
  sent: string | null;
  read: boolean;
  read_date: string | null;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const markAllAsRead = useCallback(async () => {
    if (!supabase || !user?.id) {
      return;
    }

    const { error } = await supabase
      .from('notification')
      .update({ read: true, read_date: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      throw error;
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!supabase) {
      Alert.alert('Error', 'No se encontró la configuración de Supabase.');
      setNotifications([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notification')
        .select('id, reservation_id, template_id, user_id, affair, html_body, sent, read, read_date')
        .eq('user_id', user.id)
        .order('sent', { ascending: false });

      if (error) throw error;

      setNotifications((data as Notification[]) ?? []);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones.');
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      const loadNotifications = async () => {
        setLoading(true);

        try {
          await markAllAsRead();
        } catch (error) {
          console.error('Error marcando notificaciones como leidas:', error);
        }

        await fetchNotifications();
      };

      loadNotifications();
    }, [fetchNotifications, markAllAsRead])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const formatDate = (isoString: string | null) => {
    if (!isoString) {
      return 'fecha desconocida';
    }

    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: es });
    } catch {
      return 'fecha desconocida';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A3717" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.headerTitle}>Notificaciones</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes notificaciones</Text>
        </View>
      ) : (
        notifications.map((item) => (
          <View key={item.id} style={[styles.card, item.read && styles.readCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.affair}</Text>
              <Text style={styles.cardDate}>{formatDate(item.sent)}</Text>
            </View>
            <Text style={styles.cardBody}>{item.html_body}</Text>
          </View>
        ))
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#37513f',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  readCard: {
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1E1E',
    flex: 1,
    marginRight: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
  },
  cardBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});