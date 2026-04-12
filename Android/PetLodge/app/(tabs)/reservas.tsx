import { compareAsc, compareDesc, format, parse } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../constants/AuthContext";
import { supabase } from "../../lib/supabase";

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
  species: string;
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

const FAKE_RESERVATIONS: Reservation[] = [
  {
    id: "1",
    pet_name: "Tobi",
    pet_id: "1",
    entrance: "2026-03-01",
    exit: "2026-03-11",
    lodging_type_name: "Especial",
    lodging_type_id: "2",
    status_name: "Activa",
    special_lodging: true,
    service_ids: ["1", "2"],
  },
  {
    id: "2",
    pet_name: "Max",
    pet_id: "2",
    entrance: "2026-02-10",
    exit: "2026-02-15",
    lodging_type_name: "Estándar",
    lodging_type_id: "1",
    status_name: "Finalizada",
    special_lodging: false,
    service_ids: [],
  },
  {
    id: "3",
    pet_name: "Luna",
    pet_id: "3",
    entrance: "2026-04-20",
    exit: "2026-04-25",
    lodging_type_name: "Especial",
    lodging_type_id: "2",
    status_name: "Pendiente",
    special_lodging: true,
    service_ids: ["3"],
  },
];

const FAKE_PETS: Pet[] = [
  { id: "1", name: "Tobi", species: "Perro" },
  { id: "2", name: "Max", species: "Perro" },
  { id: "3", name: "Luna", species: "Gato" },
];

const FAKE_LODGING_TYPES: LodgingType[] = [
  { id: "1", name: "Estándar", price_for_night: 25 },
  { id: "2", name: "Especial", price_for_night: 40 },
];

const FAKE_ADDITIONAL_SERVICES: AdditionalService[] = [
  { id: "1", name: "Baño", description: "Baño completo", price: 15 },
  { id: "2", name: "Paseo", description: "Paseo diario", price: 10 },
  {
    id: "3",
    name: "Alimentación especial",
    description: "Dieta específica",
    price: 8,
  },
];

const SORT_OPTIONS: SortItem[] = [
  { label: "Más reciente", value: "reciente" },
  { label: "Más antigua", value: "antigua" },
];

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
  const [activeMainTab, setActiveMainTab] = useState<"historial" | "nueva">(
    "historial",
  );
  const [activeStatusTab, setActiveStatusTab] =
    useState<StatusName>("Pendiente");
  const [sortOption, setSortOption] = useState<SortOption>("reciente");

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [pets] = useState<Pet[]>(FAKE_PETS);
  const [lodgingTypes] = useState<LodgingType[]>(FAKE_LODGING_TYPES);
  const [additionalServices] = useState<AdditionalService[]>(
    FAKE_ADDITIONAL_SERVICES,
  );

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedLodgingTypeId, setSelectedLodgingTypeId] = useState<
    string | null
  >(null);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set(),
  );
  const [submitting, setSubmitting] = useState(false);

  const [editingReservationId, setEditingReservationId] = useState<
    string | null
  >(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const [markedDates, setMarkedDates] = useState<any>({});

  const isSpecial =
    lodgingTypes.find((l) => l.id === selectedLodgingTypeId)?.name ===
    "Especial";

  const formatDisplayDate = (dateString: string) => {
    return format(parse(dateString, "yyyy-MM-dd", new Date()), "dd/MM/yy");
  };

  const loadReservations = async () => {
    if (!session?.user?.id) return;
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
          lodging_type_name: item.special_lodging ? "Especial" : "Estándar",
          status_name: item.reservation_status?.name as StatusName,
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
  };

  const fetchNewReservationData = async () => {
    setReservations((prev) => (prev.length ? prev : FAKE_RESERVATIONS));
  };

  const fetchReservationDetails = async (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return null;

    return {
      petId:
        res.pet_id ||
        FAKE_PETS.find((p) => p.name === res.pet_name)?.id ||
        null,
      startDate: res.entrance,
      endDate: res.exit,
      lodgingTypeId:
        res.lodging_type_id ||
        FAKE_LODGING_TYPES.find((lt) => lt.name === res.lodging_type_name)
          ?.id ||
        null,
      serviceIds: new Set(res.service_ids || []),
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
      setSelectedServices(details.serviceIds);
      setMarkedDates(buildMarkedDates(details.startDate, details.endDate));
    } else {
      setSelectedPetId(null);
      setStartDate(reservation.entrance);
      setEndDate(reservation.exit);
      setSelectedLodgingTypeId(
        FAKE_LODGING_TYPES.find(
          (lt) => lt.name === reservation.lodging_type_name,
        )?.id || null,
      );
      setSelectedServices(new Set(reservation.service_ids || []));
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
    setSelectedServices(new Set());
    setMarkedDates({});
  };

  useEffect(() => {
    if (activeMainTab === "historial") {
      loadReservations();
      cancelEdit();
    } else {
      fetchNewReservationData();
    }
  }, [activeMainTab, activeStatusTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    if (activeMainTab === "historial") {
      loadReservations();
    } else {
      setTimeout(() => setRefreshing(false), 250);
    }
  }, [activeMainTab, activeStatusTab]);

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
    const newSet = new Set(selectedServices);
    if (newSet.has(serviceId)) newSet.delete(serviceId);
    else newSet.add(serviceId);
    setSelectedServices(newSet);
  };

  const handleSubmitReservation = async () => {
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

      const specialLodging = lodging.name === "Especial";

      if (editingReservationId) {
        setReservations((prev) =>
          prev.map((res) =>
            res.id === editingReservationId
              ? {
                  ...res,
                  pet_id: pet.id,
                  pet_name: pet.name,
                  entrance: startDate,
                  exit: endDate,
                  lodging_type_id: lodging.id,
                  lodging_type_name: lodging.name,
                  special_lodging: specialLodging,
                  service_ids: Array.from(selectedServices),
                }
              : res,
          ),
        );

        Alert.alert("Éxito", "Reserva actualizada correctamente", [
          {
            text: "OK",
            onPress: () => {
              cancelEdit();
              setActiveMainTab("historial");
              setActiveStatusTab("Pendiente");
            },
          },
        ]);
      } else {
        const newReservation: Reservation = {
          id: String(Date.now()),
          pet_id: pet.id,
          pet_name: pet.name,
          entrance: startDate,
          exit: endDate,
          lodging_type_id: lodging.id,
          lodging_type_name: lodging.name,
          status_name: "Pendiente",
          special_lodging: specialLodging,
          service_ids: Array.from(selectedServices),
        };

        setReservations((prev) => [newReservation, ...prev]);

        Alert.alert("Éxito", "Reserva creada correctamente", [
          {
            text: "OK",
            onPress: () => {
              setActiveMainTab("historial");
              setActiveStatusTab("Pendiente");
            },
          },
        ]);

        setSelectedPetId(null);
        setStartDate("");
        setEndDate("");
        setSelectedLodgingTypeId(null);
        setSelectedServices(new Set());
        setMarkedDates({});
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "No se pudo procesar la reserva. Inténtalo de nuevo.",
      );
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

  const renderHistorial = () => {
    const filteredReservations = reservations.filter(
      (r) => r.status_name === activeStatusTab,
    );
    const sortedReservations = sortReservations(filteredReservations);

    return (
      <>
        <View style={styles.subTabsScrollViewContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subTabsContainer}
          >
            {["Cancelada", "Aceptada", "Activa", "Pendiente", "Finalizada"].map(
              (tab) => (
                <Pressable
                  key={tab}
                  style={[
                    styles.subTabScroll,
                    activeStatusTab === tab && styles.activeSubTab,
                  ]}
                  onPress={() => setActiveStatusTab(tab as any)}
                >
                  <Text
                    style={[
                      styles.subTabTextScroll,
                      activeStatusTab === tab && styles.activeSubTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              ),
            )}
          </ScrollView>
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
        />

        {loadingReservations ? (
          <ActivityIndicator
            size="large"
            color="#4A3717"
            style={styles.loader}
          />
        ) : sortedReservations.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay reservas {activeStatusTab.toLowerCase()}
          </Text>
        ) : (
          sortedReservations.map((item) => (
            <Pressable
              key={item.id}
              style={styles.reservationCard}
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
                      Servicios {item.lodging_type_name}:
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
          ))
        )}
      </>
    );
  };

  const renderNueva = () => (
    <ScrollView style={styles.nuevaContainer}>
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
            if (type.name !== "Especial") setSelectedServices(new Set());
          }}
        >
          <View style={styles.radioOuter}>
            {selectedLodgingTypeId === type.id && (
              <View style={styles.radioInner} />
            )}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxTitle}>{type.name}</Text>
            <Text style={styles.checkboxDescription}>
              {type.name === "Estándar"
                ? "Reservación Básica"
                : "Reservación con servicios especiales"}
            </Text>
          </View>
        </Pressable>
      ))}

      <Text style={styles.formLabel}>Servicios Adicionales</Text>
      {additionalServices.map((service) => (
        <Pressable
          key={service.id}
          style={[styles.checkboxRow, !isSpecial && { opacity: 0.4 }]}
          onPress={() => isSpecial && toggleService(service.id)}
          disabled={!isSpecial}
        >
          <View style={styles.checkboxBox}>
            {selectedServices.has(service.id) && (
              <View style={styles.checkboxInner} />
            )}
          </View>
          <Text style={styles.checkboxTitle}>{service.name}</Text>
        </Pressable>
      ))}

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
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Reservas</Text>

        <View style={styles.mainTabsContainer}>
          <Pressable
            style={[
              styles.subTab,
              activeMainTab === "historial" && styles.activeSubTab,
            ]}
            onPress={() => setActiveMainTab("historial")}
          >
            <Text
              style={[
                styles.subTabText,
                activeMainTab === "historial" && styles.activeSubTabText,
              ]}
            >
              Historial
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.subTab,
              activeMainTab === "nueva" && styles.activeSubTab,
            ]}
            onPress={() => setActiveMainTab("nueva")}
          >
            <Text
              style={[
                styles.subTabText,
                activeMainTab === "nueva" && styles.activeSubTabText,
              ]}
            >
              Nueva
            </Text>
          </Pressable>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.content}
        >
          {activeMainTab === "historial" ? renderHistorial() : renderNueva()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#37513f",
    marginVertical: 10,
    textAlign: "center",
  },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  mainTabsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: "#e4e4e4ff",
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  subTabsContainer: {
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
  subTab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  activeSubTab: { flex: 1, backgroundColor: "#ffffffff" },
  subTabText: { fontSize: 11, color: "#555", textAlign: "center" },
  activeSubTabText: { color: "#000000ff", fontWeight: "bold" },
  content: { flex: 1, paddingHorizontal: 16 },
  loader: { marginTop: 40 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#888" },
  reservationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: "#666",
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
});
