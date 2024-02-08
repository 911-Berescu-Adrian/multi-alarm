import React, { useEffect, useState } from "react";
import { Button, View, Text, StyleSheet, Modal, Pressable, FlatList, StatusBar } from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
    const [alarms, setAlarms] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const addAlarm = () => {
        setModalVisible(true);
    };

    useEffect(() => {
        loadAlarms();
    }, []);

    useEffect(() => {
        saveAlarm();
    }, [endTime]);

    useEffect(() => {
        storeAlarms();
    }, [alarms]);

    const loadAlarms = async () => {
        try {
            const storedAlarms = await AsyncStorage.getItem("alarms");
            if (storedAlarms !== null) {
                setAlarms(JSON.parse(storedAlarms));
            }
        } catch (error) {
            console.error("Error loading alarms:", error);
        }
    };

    const storeAlarms = async () => {
        try {
            await AsyncStorage.setItem("alarms", JSON.stringify(alarms));
        } catch (error) {
            console.error("Error saving alarms:", error);
        }
    };

    const saveAlarm = () => {
        if (startTime !== "" && endTime !== "") {
            setAlarms([...alarms, { start: startTime, end: endTime, interval: "3mins" }]);
            setModalVisible(false);
            setStartTime("");
            setEndTime("");
        }
    };

    const deleteAlarm = (index) => {
        const updatedAlarms = [...alarms];
        updatedAlarms.splice(index, 1);
        setAlarms(updatedAlarms);
    };

    const handleStartTimeConfirm = (time) => {
        setStartTime(time.toLocaleTimeString());
    };

    const handleEndTimeConfirm = (time) => {
        setEndTime(time.toLocaleTimeString());
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const formatTime = (timeString) => {
        const [timePart, meridiem] = timeString.split(/\s+/);
        const [hour, minute] = timePart.split(":");

        return `${hour}:${minute} ${meridiem}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#232323" />
            {alarms.length === 0 ? (
                <View style={styles.noAlarmsContainer}>
                    <Text style={styles.text}>No alarms set yet. Click to add a new one.</Text>
                    <Pressable style={styles.button} onPress={addAlarm}>
                        <Text style={styles.btnText}>Add alarm</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    ListHeaderComponent={
                        <View
                            style={{ justifyContent: "center", alignContent: "center", flex: 1, alignItems: "center" }}
                        >
                            <Pressable style={styles.button} onPress={addAlarm}>
                                <Text style={styles.btnText}>Add alarm</Text>
                            </Pressable>
                        </View>
                    }
                    data={alarms}
                    renderItem={({ item, index }) => (
                        <>
                            <View style={styles.alarmItem}>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        alignItems: "center",
                                        width: 200,
                                    }}
                                >
                                    <Text style={styles.text}>Start</Text>
                                    <Text style={styles.text}>{formatTime(item.start)}</Text>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={styles.text}>End</Text>
                                    <Text style={styles.text}>{formatTime(item.end)}</Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: "#e5e1e1", fontSize: 24, textAlign: "center", marginTop: 20 }}>
                                    Every
                                </Text>

                                <Picker
                                    selectedValue={item.interval || "3mins"}
                                    onValueChange={(interval) => {
                                        const updatedAlarms = [...alarms];
                                        updatedAlarms[index].interval = interval;
                                        setAlarms(updatedAlarms);
                                    }}
                                    style={{
                                        width: 140,
                                        color: "#e5e1e1",
                                        textAlign: "center",
                                        marginLeft: 80,
                                        marginBottom: 20,
                                    }}
                                    itemStyle={{ fontSize: 20 }}
                                >
                                    <Picker.Item label="1min" value="1min" />
                                    <Picker.Item label="3mins" value="3mins" />
                                    <Picker.Item label="5mins" value="5mins" />
                                    <Picker.Item label="10mins" value="10mins" />
                                    <Picker.Item label="15mins" value="15mins" />
                                    <Picker.Item label="20mins" value="20mins" />
                                    <Picker.Item label="30mins" value="30mins" />
                                </Picker>
                                <Pressable style={styles.buttonDelete} onPress={() => deleteAlarm(index)}>
                                    <Text style={styles.btnText}>Delete</Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            )}

            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View>
                    <DateTimePicker
                        isVisible={modalVisible}
                        mode="time"
                        onConfirm={handleEndTimeConfirm}
                        onCancel={handleCancel}
                    />
                    <DateTimePicker
                        isVisible={modalVisible}
                        mode="time"
                        onConfirm={handleStartTimeConfirm}
                        onCancel={handleCancel}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#232323",
    },
    button: {
        backgroundColor: "#e5e1e1",
        textAlign: "center",
        padding: 10,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginTop: 50,
        marginBottom: 50,
    },
    buttonDelete: {
        backgroundColor: "#FD6A6A",
        textAlign: "center",
        padding: 10,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginBottom: 70,
    },
    btnText: {
        color: "#2b2b2b",
        fontSize: 20,
        fontWeight: "bold",
    },
    text: {
        color: "#e5e1e1",
        fontSize: 24,
    },
    noAlarmsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    alarmItem: {
        width: 300,
        flex: 1,
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
});

export default App;
