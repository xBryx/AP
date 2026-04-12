import { Ionicons } from "@expo/vector-icons";
import { compareAsc, compareDesc, format, parse } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../../constants/AuthContext";
import { supabase } from "../../lib/supabase";

const CREATE_RESERVATION_RPC = "create_reservation";
const UPDATE_RESERVATION_RPC = "update_reservation";

LocaleConfig.locales.es = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

type StatusName =
  | "Pendiente"
  | "Aceptada"
  | "Activa"
  | "Finalizada"
  | "Cancelada";

type ReservationService = {
  quantity: number;
  additional_services: { id: string; name: string; price: number };
};

type Reservation = {
  id: string;
  pet_name: string;
  pet_id?: string;
  entrance: string;
  exit: string;
  lodging_type_name: string;
  lodging_type_id?: string;
  status_name: StatusName;
  total_price?: number;
  special_lodging: boolean;
  service_ids?: string[];
  reservation_services?: ReservationService[];
};

type Pet = {
  id: string;
  name: string;
};

type AdditionalService = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type LodgingType = {
  id: string;
  name: string;
  price_for_night: number;
};

type SortOption = "reciente" | "antigua" | "entrada" | "salida";

type SortItem = {
  label: string;
  value: SortOption;
};

const SORT_OPTIONS: SortItem[] = [
  { label: "Más reciente", value: "reciente" },
  { label: "Más antigua", value: "antigua" },
];

const normalizeLabel = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const buildMarkedDates = (startInput: string, endInput: string) => {
  let start = parse(startInput, "yyyy-MM-dd", new Date());
  let end = parse(endInput, "yyyy-MM-dd", new Date());

  if (start > end) [start, end] = [end, start];

  const marked: any = {};
  let current = new Date(start);

  while (current <= end) {
    const dateStr = format(current, "yyyy-MM-dd");

    if (
      dateStr === format(start, "yyyy-MM-dd") &&
      dateStr === format(end, "yyyy-MM-dd")
    ) {
      marked[dateStr] = {
        startingDay: true,
        endingDay: true,
        color: "#4A3717",
        textColor: "white",
      };
    } else if (dateStr === format(start, "yyyy-MM-dd")) {
      marked[dateStr] = {
        startingDay: true,
        color: "#4A3717",
        textColor: "white",
      };
    } else if (dateStr === format(end, "yyyy-MM-dd")) {
      marked[dateStr] = {
        endingDay: true,
        color: "#4A3717",
        textColor: "white",
      };
    } else {
      marked[dateStr] = { color: "#797165ff", textColor: "white" };
    }

    current.setDate(current.getDate() + 1);
  }

  return marked;
};

export default function HomeScreen() {
  const { session } = useAuth();
  const params = useLocalSearchParams();

  const [activeMainTab, setActiveMainTab] = useState<"historial" | "nueva">(
    "historial",
  );
  const [activeStatusTab, setActiveStatusTab] =
    useState<StatusName>("Pendiente");
  const [sortOption, setSortOption] = useState<SortOption>("reciente");

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [pets, setPets] = useState<Pet[]>([]);
  const [lodgingTypes, setLodgingTypes] = useState<LodgingType[]>([]);
  const [additionalServices, setAdditionalServices] = useState<
    AdditionalService[]
  >([]);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedLodgingTypeId, setSelectedLodgingTypeId] = useState<
    string | null
  >(null);
  const [selectedServiceQuantities, setSelectedServiceQuantities] = useState<
    Record<string, number>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const [editingReservationId, setEditingReservationId] = useState<
    string | null
  >(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(
    null,
  );

  const [markedDates, setMarkedDates] = useState<any>({});

  const selectedLodgingType = lodgingTypes.find(
    (l) => l.id === selectedLodgingTypeId,
  );
  const isSpecial =
    selectedLodgingType != null &&
    normalizeLabel(selectedLodgingType.name) === "especial";

  const formatDisplayDate = (dateString: string) => {
    return format(parse(dateString, "yyyy-MM-dd", new Date()), "dd/MM/yy");
  };

  const loadReservations = useCallback(async () => {
    if (!session?.user?.id || !supabase) return;
    setLoadingReservations(true);

    try {
      const { data, error } = await supabase
        .from("reservation")
        .select(
          `
          id,
          entrance,
          exit,
          special_lodging,
          total_price,
          pet(id, name),
          reservation_status(id, name),
          additional_reservation_services(
            quantity,
            additional_services(id, name, price)
          )
        `,
        )
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching reservations:", error);
        Alert.alert("Error", "No se pudieron cargar las reservas");
        return;
      }

      if (data) {
        const mappedReservations: Reservation[] = data.map((item: any) => ({
          id: item.id,
          pet_name: item.pet?.name || "Mascota eliminada",
          pet_id: item.pet?.id,
          entrance: item.entrance,
          exit: item.exit,
          lodging_type_name: item.special_lodging ? "Especial" : "Estandar",
          status_name: (item.reservation_status?.name ||
            "Pendiente") as StatusName,
          total_price: item.total_price,
          special_lodging: item.special_lodging,
          reservation_services: item.additional_reservation_services,
        }));
        setReservations(mappedReservations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReservations(false);
      setRefreshing(false);
    }
  }, [session?.user?.id]);

  const loadNewReservationCatalogs = useCallback(async () => {
    if (!session?.user?.id || !supabase) return;

    try {
      let petsData: Pet[] = [];

      // Try likely ownership columns; if one fails, fallback to the next.
      const petsByUserId = await supabase
        .from("pet")
        .select("id, name")
        .eq("user_id", session.user.id)
        .order("name", { ascending: true });

      if (!petsByUserId.error && petsByUserId.data) {
        petsData = petsByUserId.data as Pet[];
      } else {
        const petsByAuthId = await supabase
          .from("pet")
          .select("id, name")
          .eq("auth_id", session.user.id)
          .order("name", { ascending: true });

        if (!petsByAuthId.error && petsByAuthId.data) {
          petsData = petsByAuthId.data as Pet[];
        }
      }

      if (petsData.length === 0) {
        const petsFromReservations = await supabase
          .from("reservation")
          .select("pet(id, name)")
          .eq("user_id", session.user.id);

        if (!petsFromReservations.error && petsFromReservations.data) {
          const uniquePets = new Map<string, Pet>();
          (petsFromReservations.data as any[]).forEach((row) => {
            const p = row.pet;
            if (p?.id && !uniquePets.has(p.id)) {
              uniquePets.set(p.id, {
                id: p.id,
                name: p.name,
              });
            }
          });
          petsData = Array.from(uniquePets.values());
        }
      }

      const lodgingRes = await supabase
        .from("lodging_type")
        .select("id, name, price_for_night")
        .order("price_for_night", { ascending: true });

      const servicesRes = await supabase
        .from("additional_services")
        .select("id, name, description, price")
        .order("name", { ascending: true });

      setPets(petsData);

      if (!lodgingRes.error && lodgingRes.data) {
        setLodgingTypes(lodgingRes.data as LodgingType[]);
      }

      if (!servicesRes.error && servicesRes.data) {
        setAdditionalServices(servicesRes.data as AdditionalService[]);
      }

      if (lodgingRes.error) {
        console.error("Error loading lodging types:", lodgingRes.error);
      }
      if (servicesRes.error) {
        console.error("Error loading additional services:", servicesRes.error);
      }
    } catch (error) {
      console.error("Error loading reservation catalogs:", error);
      Alert.alert("Error", "No se pudo cargar la información de reservas");
    }
  }, [session?.user?.id]);

  const fetchReservationDetails = async (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return null;

    return {
      petId:
        res.pet_id || pets.find((p) => p.name === res.pet_name)?.id || null,
      startDate: res.entrance,
      endDate: res.exit,
      lodgingTypeId:
        res.lodging_type_id ||
        lodgingTypes.find((lt) => lt.name === res.lodging_type_name)?.id ||
        null,
      serviceQuantities:
        res.reservation_services && res.reservation_services.length > 0
          ? Object.fromEntries(
              res.reservation_services.map((service) => [
                service.additional_services.id,
                service.quantity,
              ]),
            )
          : Object.fromEntries((res.service_ids || []).map((id) => [id, 1])),
    };
  };

  const editReservation = async (reservation: Reservation) => {
    if (reservation.status_name !== "Pendiente") return;

    setIsEditingMode(true);
    setEditingReservationId(reservation.id);
    setActiveMainTab("nueva");

    const details = await fetchReservationDetails(reservation.id);

    if (details) {
      setSelectedPetId(details.petId);
      setStartDate(details.startDate);
      setEndDate(details.endDate);
      setSelectedLodgingTypeId(details.lodgingTypeId);
      setSelectedServiceQuantities(details.serviceQuantities);
      setMarkedDates(buildMarkedDates(details.startDate, details.endDate));
    } else {
      setSelectedPetId(null);
      setStartDate(reservation.entrance);
      setEndDate(reservation.exit);
      setSelectedLodgingTypeId(
        lodgingTypes.find((lt) => lt.name === reservation.lodging_type_name)
          ?.id || null,
      );
      setSelectedServiceQuantities(
        Object.fromEntries(
          (reservation.service_ids || []).map((id) => [id, 1]),
        ),
      );
      setMarkedDates(buildMarkedDates(reservation.entrance, reservation.exit));
    }
  };

  const cancelEdit = () => {
    setIsEditingMode(false);
    setEditingReservationId(null);
    setSelectedPetId(null);
    setStartDate("");
    setEndDate("");
    setSelectedLodgingTypeId(null);
    setSelectedServiceQuantities({});
    setMarkedDates({});
  };

  useEffect(() => {
    if (activeMainTab === "historial") {
      loadReservations();
      cancelEdit();
    }
  }, [activeMainTab, activeStatusTab, loadReservations]);

  useEffect(() => {
    loadNewReservationCatalogs();
  }, [loadNewReservationCatalogs]);

  useEffect(() => {
    if (params?.action === "nueva" && params?.petId) {
      setActiveMainTab("nueva");
      setSelectedPetId(params.petId as string);
    }
  }, [params?.action, params?.petId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    if (activeMainTab === "historial") {
      loadReservations();
    } else {
      setTimeout(() => setRefreshing(false), 250);
    }
  }, [activeMainTab, loadReservations]);

  const onDayPress = (day: any) => {
    const date = day.dateString;

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate("");
      setMarkedDates({
        [date]: {
          startingDay: true,
          endingDay: true,
          color: "#4A3717",
          textColor: "white",
        },
      });
    } else {
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      const end = parse(date, "yyyy-MM-dd", new Date());

      const rangeStart = start > end ? end : start;
      const rangeEnd = start > end ? start : end;

      const newMarked = buildMarkedDates(
        format(rangeStart, "yyyy-MM-dd"),
        format(rangeEnd, "yyyy-MM-dd"),
      );

      setMarkedDates(newMarked);
      setStartDate(format(rangeStart, "yyyy-MM-dd"));
      setEndDate(format(rangeEnd, "yyyy-MM-dd"));
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceQuantities((prev) => {
      if ((prev[serviceId] || 0) > 0) {
        const { [serviceId]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [serviceId]: 1 };
    });
  };

  const changeServiceQuantity = (serviceId: string, delta: number) => {
    setSelectedServiceQuantities((prev) => {
      const current = prev[serviceId] || 0;
      if (current <= 0) return prev;

      const nextValue = Math.max(1, current + delta);
      return { ...prev, [serviceId]: nextValue };
    });
  };

  const handleSubmitReservation = async () => {
    if (!session?.user?.id || !supabase) {
      Alert.alert("Error", "No se pudo validar tu sesión");
      return;
    }

    if (!selectedPetId) {
      Alert.alert("Error", "Selecciona una mascota");
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert("Error", "Selecciona un rango de fechas");
      return;
    }
    if (!selectedLodgingTypeId) {
      Alert.alert("Error", "Selecciona un tipo de hospedaje");
      return;
    }

    setSubmitting(true);

    try {
      const pet = pets.find((p) => p.id === selectedPetId);
      const lodging = lodgingTypes.find((l) => l.id === selectedLodgingTypeId);

      if (!pet || !lodging) {
        throw new Error("No se pudo obtener la información seleccionada");
      }

      const specialLodging = normalizeLabel(lodging.name) === "especial";
      const servicesPayload = Object.entries(selectedServiceQuantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([service_id, quantity]) => ({ service_id, quantity }));

      const finalServicesPayload = specialLodging ? servicesPayload : [];

      if (editingReservationId) {
        const { error: updateReservationError } = await supabase.rpc(
          UPDATE_RESERVATION_RPC,
          {
            p_reservation_id: editingReservationId,
            p_user_id: session.user.id,
            p_pet_id: selectedPetId,
            p_entrance: startDate,
            p_exit: endDate,
            p_special_lodging: specialLodging,
            p_services: finalServicesPayload,
          },
        );

        if (updateReservationError) {
          throw updateReservationError;
        }

        await loadReservations();
        setActiveStatusTab("Pendiente");

        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: "Reserva actualizada correctamente",
        });

        cancelEdit();
        setActiveMainTab("historial");
      } else {
        const { error: createReservationError } = await supabase.rpc(
          CREATE_RESERVATION_RPC,
          {
            p_user_id: session.user.id,
            p_pet_id: selectedPetId,
            p_entrance: startDate,
            p_exit: endDate,
            p_special_lodging: specialLodging,
            p_services: finalServicesPayload,
          },
        );

        if (createReservationError) {
          throw createReservationError;
        }

        await loadReservations();
        setActiveStatusTab("Pendiente");

        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: "Reserva creada correctamente",
        });

        setActiveMainTab("historial");
        setActiveStatusTab("Pendiente");

        setSelectedPetId(null);
        setStartDate("");
        setEndDate("");
        setSelectedLodgingTypeId(null);
        setSelectedServiceQuantities({});
        setMarkedDates({});
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo procesar la reserva. Inténtalo de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sortReservations = (data: Reservation[]) => {
    return [...data].sort((a, b) => {
      if (sortOption === "reciente") {
        return compareDesc(
          parse(a.entrance, "yyyy-MM-dd", new Date()),
          parse(b.entrance, "yyyy-MM-dd", new Date()),
        );
      }
      if (sortOption === "antigua") {
        return compareAsc(
          parse(a.entrance, "yyyy-MM-dd", new Date()),
          parse(b.entrance, "yyyy-MM-dd", new Date()),
        );
      }
      return 0;
    });
  };

  const confirmCancelReservation = (reservationId: string) => {
    setReservationToCancel(reservationId);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = () => {
    if (reservationToCancel) {
      cancelReservation(reservationToCancel);
    }
    setCancelModalVisible(false);
    setReservationToCancel(null);
  };

  const handleCloseModal = () => {
    setCancelModalVisible(false);
    setReservationToCancel(null);
  };

  const cancelReservation = async (reservationId: string) => {
    if (!supabase) return;
    try {
      setLoadingReservations(true);
      const { data: statusData, error: statusError } = await supabase
        .from("reservation_status")
        .select("id")
        .eq("name", "Cancelada")
        .single();

      if (statusError || !statusData) {
        throw new Error("No se pudo encontrar el estado de cancelación");
      }

      const { error } = await supabase
        .from("reservation")
        .update({ state_id: statusData.id })
        .eq("id", reservationId);

      if (error) throw error;

      await loadReservations();
      Toast.show({
        type: "success",
        text1: "Éxito",
        text2: "La reserva fue cancelada.",
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cancelar la reserva.",
      });
      setLoadingReservations(false);
    }
  };

  const renderHistorial = () => {
    const filteredReservations = reservations.filter(
      (r) => r.status_name === activeStatusTab,
    );
    const sortedReservations = sortReservations(filteredReservations);

    return (
      <FlatList
        data={sortedReservations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.selectorContainer}>
              {[
                "Cancelada",
                "Pendiente",
                "Aceptada",
                "Activa",
                "Finalizada",
              ].map((tab, index) => (
                <Pressable
                  key={tab}
                  style={[
                    styles.selectorButton,
                    index < 3
                      ? styles.selectorButtonStatusThird
                      : styles.selectorButtonStatusHalf,
                    activeStatusTab === tab && styles.activeSelectorButton,
                  ]}
                  onPress={() => setActiveStatusTab(tab as any)}
                >
                  <Text
                    style={[
                      styles.selectorButtonTextStatus,
                      activeStatusTab === tab &&
                        styles.activeSelectorButtonText,
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Dropdown
              style={styles.sortDropdown}
              containerStyle={styles.dropdownContainer}
              data={SORT_OPTIONS}
              labelField="label"
              valueField="value"
              placeholder="Ordenar por"
              value={sortOption}
              onChange={(item) => setSortOption(item.value)}
              selectedTextStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownText}
            />
          </>
        }
        ListEmptyComponent={
          loadingReservations ? (
            <ActivityIndicator
              size="large"
              color="#4A3717"
              style={styles.loader}
            />
          ) : (
            <Text style={styles.emptyText}>
              No hay reservas {activeStatusTab.toLowerCase()}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.reservationCard}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => editReservation(item)}
              disabled={item.status_name !== "Pendiente"}
            >
              <Text style={styles.petNameCenter}>{item.pet_name}</Text>
              <View style={styles.rowPill}>
                <Text style={styles.labelPill}>Inicio</Text>
                <View style={styles.valuePill}>
                  <Text style={styles.valuePillText}>
                    {formatDisplayDate(item.entrance)}
                  </Text>
                </View>
              </View>
              <View style={styles.rowPill}>
                <Text style={styles.labelPill}>Fin</Text>
                <View style={styles.valuePill}>
                  <Text style={styles.valuePillText}>
                    {formatDisplayDate(item.exit)}
                  </Text>
                </View>
              </View>
              <View style={styles.rowPill}>
                <Text style={styles.labelPill}>Tipo Hospedaje</Text>
                <View style={styles.valuePill}>
                  <Text style={styles.valuePillText}>
                    {item.lodging_type_name}
                  </Text>
                </View>
              </View>

              {item.special_lodging &&
                item.reservation_services &&
                item.reservation_services.length > 0 && (
                  <View style={styles.servicesSection}>
                    <Text style={styles.servicesTitle}>
                      Servicio {item.lodging_type_name}:
                    </Text>
                    {item.reservation_services.map((serviceItem, index) => (
                      <Text key={index} style={styles.serviceText}>
                        • {serviceItem.additional_services?.name} x
                        {serviceItem.quantity} ($
                        {serviceItem.additional_services?.price})
                      </Text>
                    ))}
                  </View>
                )}

              {item.total_price != null && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Precio Total:</Text>
                  <Text style={styles.totalValue}>${item.total_price}</Text>
                </View>
              )}

              {item.status_name === "Pendiente" && (
                <Text style={styles.editHint}>Toca para editar</Text>
              )}
            </Pressable>

            {item.status_name === "Pendiente" && (
              <Pressable
                style={styles.cancelIcon}
                onPress={() => confirmCancelReservation(item.id)}
              >
                <Ionicons name="close" size={24} color="#D9534F" />
              </Pressable>
            )}
          </View>
        )}
      />
    );
  };

  const renderNueva = () => (
    <FlatList
      data={[]}
      renderItem={({ item }) => null}
      style={styles.nuevaContainer}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <Text style={styles.formLabel}>Mascota</Text>
          <Dropdown
            style={styles.dropdown}
            data={pets}
            labelField="name"
            valueField="id"
            placeholder="Seleccione una mascota"
            value={selectedPetId}
            onChange={(item) => setSelectedPetId(item.id)}
          />

          <Text style={styles.formLabel}>Fechas</Text>
          <Calendar
            markingType="period"
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              calendarBackground: "#FFFFFF",
              textSectionTitleColor: "#37513f",
              selectedDayBackgroundColor: "#4A3717",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#4A3717",
              dayTextColor: "#2d4150",
              arrowColor: "#4A3717",
            }}
          />

          <Text style={styles.formLabel}>Tipo de hospedaje</Text>
          {lodgingTypes.map((type) => (
            <Pressable
              key={type.id}
              style={[
                styles.checkboxRow,
                selectedLodgingTypeId === type.id && styles.checkboxSelected,
              ]}
              onPress={() => {
                setSelectedLodgingTypeId(type.id);
                if (normalizeLabel(type.name) !== "especial") {
                  setSelectedServiceQuantities({});
                }
              }}
            >
              <View style={styles.radioOuter}>
                {selectedLodgingTypeId === type.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxTitle}>
                  {type.name} - ${type.price_for_night}/noche
                </Text>
                <Text style={styles.checkboxDescription}>
                  {type.name === "Estándar"
                    ? "Reservación Básica"
                    : "Reservación con servicios especiales"}
                </Text>
              </View>
            </Pressable>
          ))}

          {isSpecial && (
            <>
              <Text style={styles.formLabel}>Servicios Adicionales</Text>
              {additionalServices.map((service) => {
                const quantity = selectedServiceQuantities[service.id] || 0;
                const isSelected = quantity > 0;

                return (
                  <Pressable
                    key={service.id}
                    style={styles.checkboxRow}
                    onPress={() => toggleService(service.id)}
                  >
                    <View style={styles.checkboxBox}>
                      {isSelected && <View style={styles.checkboxInner} />}
                    </View>

                    <View style={styles.serviceRowContent}>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.checkboxTitle}>{service.name}</Text>
                        <Text style={styles.checkboxDescription}>
                          ${service.price} por servicio
                        </Text>
                      </View>

                      {isSelected && (
                        <View style={styles.quantityControls}>
                          <Pressable
                            style={styles.qtyButton}
                            onPress={() =>
                              changeServiceQuantity(service.id, -1)
                            }
                          >
                            <Text style={styles.qtyButtonText}>-</Text>
                          </Pressable>
                          <Text style={styles.qtyValue}>{quantity}</Text>
                          <Pressable
                            style={styles.qtyButton}
                            onPress={() => changeServiceQuantity(service.id, 1)}
                          >
                            <Text style={styles.qtyButtonText}>+</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}

          <Pressable
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmitReservation}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>
                {isEditingMode ? "Actualizar Reserva" : "Enviar Reserva"}
              </Text>
            )}
          </Pressable>

          {isEditingMode && (
            <>
              <Pressable style={styles.cancelEditButton} onPress={cancelEdit}>
                <Text style={styles.cancelEditText}>Cancelar edición</Text>
              </Pressable>
            </>
          )}
        </>
      }
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Reservas</Text>

        <View style={styles.mainTabsContainer}>
          <Pressable
            style={[
              styles.selectorButton,
              styles.selectorButtonMain,
              activeMainTab === "historial" && styles.activeSelectorButton,
            ]}
            onPress={() => setActiveMainTab("historial")}
          >
            <Text
              style={[
                styles.selectorButtonTextMain,
                activeMainTab === "historial" &&
                  styles.activeSelectorButtonText,
              ]}
            >
              Historial
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.selectorButton,
              styles.selectorButtonMain,
              activeMainTab === "nueva" && styles.activeSelectorButton,
            ]}
            onPress={() => setActiveMainTab("nueva")}
          >
            <Text
              style={[
                styles.selectorButtonTextMain,
                activeMainTab === "nueva" && styles.activeSelectorButtonText,
              ]}
            >
              Nueva
            </Text>
          </Pressable>
        </View>

        <View style={[styles.content, { paddingBottom: 0 }]}>
          {activeMainTab === "historial" ? renderHistorial() : renderNueva()}
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancelar Reserva</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas cancelar esta reserva?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonCancelText}>No</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmCancel}
              >
                <Text style={styles.modalButtonConfirmText}>Sí, cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#37513f",
    marginTop: 16,
    marginBottom: 14,
    textAlign: "center",
  },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  mainTabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: "#e4e4e4ff",
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  selectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: "#e4e4e4ff",
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  selectorButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginVertical: 2,
  },
  selectorButtonMain: {
    flexBasis: "49%",
  },
  selectorButtonStatusThird: {
    flexBasis: "32%",
  },
  selectorButtonStatusHalf: {
    flexBasis: "49%",
  },
  activeSelectorButton: { backgroundColor: "#ffffffff" },
  selectorButtonTextMain: { fontSize: 13, color: "#555", textAlign: "center" },
  selectorButtonTextStatus: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
  },
  activeSelectorButtonText: { color: "#000000ff", fontWeight: "bold" },
  content: { flex: 1, paddingHorizontal: 16 },
  loader: { marginTop: 40 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#888" },
  reservationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 7,
  },
  cancelIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 9999,
    elevation: 10,
    padding: 4,
  },
  petNameCenter: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C1810",
    textAlign: "center",
    marginBottom: 16,
  },
  rowPill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  labelPill: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  valuePill: {
    backgroundColor: "#4A3717",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  valuePillText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  servicesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C1810",
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    marginLeft: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C1810",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A3717",
  },
  editHint: {
    marginTop: 12,
    fontSize: 12,
    color: "#2E7D32",
    textAlign: "center",
    fontStyle: "italic",
  },
  nuevaContainer: { paddingBottom: 30 },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#37513f",
  },
  dropdown: {
    width: "50%",
    height: 50,
    borderColor: "#c0c0c0ff",
    backgroundColor: "#e4e4e4ff",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  dropdownContainer: { borderRadius: 8 },
  sortDropdown: {
    width: "50%",
    height: 50,
    borderColor: "#c0c0c0ff",
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    marginHorizontal: 5,
  },
  dropdownText: {
    fontSize: 13,
    color: "#555",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  checkboxSelected: { borderRadius: 8 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4A3717",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4A3717",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#4A3717",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: "#4A3717",
    borderRadius: 2,
  },
  checkboxTextContainer: { flex: 1 },
  serviceRowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4A3717",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 18,
  },
  qtyValue: {
    minWidth: 18,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1E1E",
  },
  checkboxTitle: { fontSize: 16, fontWeight: "500", color: "#1E1E1E" },
  checkboxDescription: { fontSize: 12, color: "#888" },
  submitButton: {
    backgroundColor: "#4A3717",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 15,
  },
  disabledButton: { opacity: 0.6 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  noRoomsText: { textAlign: "center", color: "#888", marginVertical: 10 },
  dropdownItem: { padding: 10 },
  dropdownItemText: { fontSize: 16, fontWeight: "500" },
  dropdownItemSubtext: { fontSize: 12, color: "#888" },
  cancelEditButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 15,
  },
  cancelEditText: { color: "#4A3717", fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "#D9534F",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  deleteButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#37513f",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  modalButtonCancel: {
    backgroundColor: "#e4e4e4",
  },
  modalButtonCancelText: {
    color: "#555",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalButtonConfirm: {
    backgroundColor: "#D9534F",
  },
  modalButtonConfirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
