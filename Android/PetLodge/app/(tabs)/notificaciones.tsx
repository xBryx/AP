// import { View, Text, ScrollView, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
// import { useState, useCallback, useEffect } from 'react';
// import { useFocusEffect } from 'expo-router';
// import { supabase } from '../../constants/supabase'; // Ajusta la ruta según tu proyecto
// import { useAuth } from '../../constants/AuthContext';
// import { formatDistanceToNow } from 'date-fns';
// import { es } from 'date-fns/locale';

// // Tipo para las notificaciones (coincide con la tabla + datos relacionados)
// type Notification = {
//   id: string;
//   affair: string;        // título
//   html_body: string;     // descripción (puede ser texto plano en este contexto)
//   sent: string;          // fecha ISO
//   read: boolean;
//   reservation_id?: string;
//   // Podemos agregar datos extra si hacemos join con profile o reservation
// };

// // Datos falsos de ejemplo (mismos de la imagen)
// const FAKE_NOTIFICATIONS: Notification[] = [
//   {
//     id: '1',
//     affair: 'Inicio de hospedaje',
//     html_body: 'Tobi ya está con nosotros. Te tendremos al tanto la situación de tu mascota.',
//     sent: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // hace 2 horas
//     read: false,
//   },
//   {
//     id: '2',
//     affair: '¡Reserva confirmada!',
//     html_body: 'Tu reserva en la habitación #20 para Tobi del 1/1/2026 al 6/1/2026 ha sido aprobada.',
//     sent: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // ayer
//     read: true,
//   },
//   {
//     id: '3',
//     affair: 'Recordatorio de vacunación',
//     html_body: 'Tu mascota Max necesita su vacuna antirrábica. Agenda una cita pronto.',
//     sent: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // hace 3 días
//     read: false,
//   },
// ];

// export default function HomeScreen() {
//   const { user } = useAuth(); // user contiene el email/username (auth_id?)
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Obtener el auth_id del usuario actual desde la tabla profile usando su email
//   const getAuthId = async (email: string): Promise<string | null> => {
//     try {
//       const { data, error } = await supabase
//         .from('profile')
//         .select('auth_id')
//         .eq('email', email)
//         .single();
//       if (error) throw error;
//       return data?.auth_id || null;
//     } catch (err) {
//       console.error('Error obteniendo auth_id:', err);
//       return null;
//     }
//   };

//   // Función única para obtener notificaciones (con fallback a datos falsos)
//   const fetchNotifications = async (showFallbackOnError = true) => {
//     if (!user) {
//       if (showFallbackOnError) setNotifications(FAKE_NOTIFICATIONS);
//       setLoading(false);
//       return;
//     }

//     try {
//       // Obtener auth_id del usuario logueado
//       const authId = await getAuthId(user);
//       if (!authId) throw new Error('No se encontró el auth_id del usuario');

//       // Consultar notificaciones reales desde Supabase
//       const { data, error } = await supabase
//         .from('notification')
//         .select('id, affair, html_body, sent, read, reservation_id')
//         .eq('user_id', authId)
//         .order('sent', { ascending: false });

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setNotifications(data as Notification[]);
//       } else {
//         // Si no hay notificaciones reales, mostramos las falsas como ejemplo
//         setNotifications(FAKE_NOTIFICATIONS);
//       }
//     } catch (error) {
//       console.error('Error cargando notificaciones:', error);
//       if (showFallbackOnError) {
//         Alert.alert('Error de conexión', 'Mostrando datos de ejemplo');
//         setNotifications(FAKE_NOTIFICATIONS);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Cargar al enfocar la pantalla
//   useFocusEffect(
//     useCallback(() => {
//       setLoading(true);
//       fetchNotifications(true);
//     }, [user])
//   );

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchNotifications(true);
//   }, [user]);

//   // Formatear fecha relativa (ej: "hace 2 horas", "ayer", "hace 3 días")
//   const formatDate = (isoString: string) => {
//     try {
//       const date = new Date(isoString);
//       return formatDistanceToNow(date, { addSuffix: true, locale: es });
//     } catch {
//       return 'fecha desconocida';
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#4A3717" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       style={styles.container}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//     >
//       <Text style={styles.headerTitle}>Notificaciones</Text>

//       {notifications.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>No tienes notificaciones</Text>
//         </View>
//       ) : (
//         notifications.map((item) => (
//           <View key={item.id} style={[styles.card, item.read && styles.readCard]}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>{item.affair}</Text>
//               <Text style={styles.cardDate}>{formatDate(item.sent)}</Text>
//             </View>
//             <Text style={styles.cardBody}>{item.html_body}</Text>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 16,
//     paddingTop: 20,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#37513f',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: '#f9f9f9',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   readCard: {
//     backgroundColor: '#FFFFFF',
//     opacity: 0.8,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#1E1E1E',
//     flex: 1,
//     marginRight: 8,
//   },
//   cardDate: {
//     fontSize: 12,
//     color: '#888',
//   },
//   cardBody: {
//     fontSize: 14,
//     color: '#555',
//     lineHeight: 20,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#888',
//   },
// });















import { View, Text, ScrollView, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../constants/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type Notification = {
  id: string;
  affair: string;
  html_body: string;
  sent: string;
  read: boolean;
  reservation_id?: string;
};

const FAKE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    affair: 'Inicio de hospedaje',
    html_body: 'Tobi ya está con nosotros. Te tendremos al tanto de la situación de tu mascota.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: '2',
    affair: '¡Reserva confirmada!',
    html_body: 'Tu reserva en la habitación #20 para Tobi del 1/1/2026 al 6/1/2026 ha sido aprobada.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    read: true,
  },
  {
    id: '3',
    affair: 'Recordatorio de vacunación',
    html_body: 'Tu mascota Max necesita su vacuna antirrábica. Agenda una cita pronto.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: false,
  },
  {
    id: '4',
    affair: '¡Reserva confirmada!',
    html_body: 'Tu reserva en la habitación #20 para Tobi del 1/1/2026 al 6/1/2026 ha sido aprobada.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    read: true,
  },
  {
    id: '5',
    affair: 'Recordatorio de vacunación',
    html_body: 'Tu mascota Max necesita su vacuna antirrábica. Agenda una cita pronto.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: false,
  },
  {
    id: '6',
    affair: '¡Reserva confirmada!',
    html_body: 'Tu reserva en la habitación #20 para Tobi del 1/1/2026 al 6/1/2026 ha sido aprobada.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    read: true,
  },
  {
    id: '7',
    affair: 'Recordatorio de vacunación',
    html_body: 'Tu mascota Max necesita su vacuna antirrábica. Agenda una cita pronto.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: false,
  },
  {
    id: '2',
    affair: '¡Reserva confirmada!',
    html_body: 'Tu reserva en la habitación #20 para Tobi del 1/1/2026 al 6/1/2026 ha sido aprobada.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    read: true,
  },
  {
    id: '3',
    affair: 'Recordatorio de vacunación',
    html_body: 'Tu mascota Max necesita su vacuna antirrábica. Agenda una cita pronto.',
    sent: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: false,
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      // Por ahora siempre usamos datos falsos
      setNotifications(FAKE_NOTIFICATIONS);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones.');
      setNotifications(FAKE_NOTIFICATIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const formatDate = (isoString: string) => {
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