import React, { useEffect, useState } from "react";
import { View, Text, Modal, Pressable, FlatList, StatusBar, ToastAndroid, Alert, Vibration } from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles";
import { getAlarmTimeStamps, formatTime } from "./utils";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

//stop not working

const TASK_NAME = "BACKGROUND_TASK";

TaskManager.defineTask(TASK_NAME, () => {
    console.log("haladit cu stil", "time: ", new Date().toLocaleTimeString());
    const storedAlarms = AsyncStorage.getItem("alarms");
    console.log("Alarms from background task", storedAlarms);
    // Call checkAndTriggerAlarm with the loaded alarms
    checkAndTriggerAlarm(alarms);
    return BackgroundFetch.Result.NewData;
});

const AlarmManager = () => {
    const [alarms, setAlarms] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [alarmSound, setAlarmSound] = useState(null);

    const addAlarm = async () => {
        setModalVisible(true);
    };

    useEffect(() => {
        const sound = new Audio.Sound();
        setAlarmSound(sound);
        loadAlarms();
        registerBackgroundFetch();
        return () => {
            sound.unloadAsync();
            BackgroundFetch.unregisterTaskAsync(TASK_NAME);
            console.log("Unregistered background task");
        };
    }, []);

    useEffect(() => {
        if (alarmSound) {
            loadAlarmSound();
        }
    }, [alarmSound]);

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
            ToastAndroid.show("Error loading alarms", ToastAndroid.SHORT);
            console.error("Error loading alarms:", error);
        }
    };

    const storeAlarms = async () => {
        try {
            await AsyncStorage.setItem("alarms", JSON.stringify(alarms));
        } catch (error) {
            ToastAndroid.show("Error saving alarms", ToastAndroid.SHORT);
            console.error("Error saving alarms:", error);
        }
    };

    const loadAlarmSound = async () => {
        try {
            await alarmSound.loadAsync(require("./assets/alarm.mp3"));
            await alarmSound.setVolumeAsync(1);
            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                interruptionModeAndroid: 1,
            });
            console.log("Alarm sound loaded");
        } catch (error) {
            ToastAndroid.show("Failed to load the alarm sound", ToastAndroid.SHORT);
            console.error("Failed to load the alarm sound", error);
        }
    };

    const registerBackgroundFetch = async () => {
        try {
            await BackgroundFetch.registerTaskAsync(TASK_NAME, {
                minimumInterval: 60, // the minimum time to wait between fetches in seconds
                stopOnTerminate: false, // android only, stop the task from running if the app is killed
                startOnBoot: true, // android only, start the task again after the device has rebooted
            });
            console.log("Task registered");
        } catch (err) {
            console.log("Task Register failed:", err);
        }
    };

    const triggerAlarm = async () => {
        if (alarmSound) {
            try {
                setIsPlaying(true);
                for (let i = 0; i < 4; i++) {
                    Vibration.vibrate([1000, 1000], true);
                    await alarmSound.playAsync();
                    let status = await alarmSound.getStatusAsync();
                    while (status.isPlaying) {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        status = await alarmSound.getStatusAsync();
                    }
                    await alarmSound.stopAsync();
                }
            } catch (error) {
                ToastAndroid.show("Failed to play the alarm sound", ToastAndroid.SHORT);
                console.error("Failed to play the alarm sound", error);
            } finally {
                setIsPlaying(false);
                Vibration.cancel();
            }
        }
    };

    const checkAndTriggerAlarm = (alarms) => {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const meridian = currentHour >= 12 ? "PM" : "AM";

        console.log("HELLO FROM BACKGROUND TASK");

        const currentHour12 = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
        const currentMinute12 = currentMinute < 10 ? `0${currentMinute}` : currentMinute;
        const currentTime = `${currentHour12}:${currentMinute12}\u202F${meridian}`;
        let alarmTriggered = false;
        alarms.forEach((alarm) => {
            const timestamps = getAlarmTimeStamps(alarm);
            if (timestamps.includes(currentTime)) {
                console.log("Alarm triggered");
                triggerAlarm();
                alarmTriggered = true;
            }
        });
        return alarmTriggered;
    };

    const saveAlarm = () => {
        if (startTime !== "" && endTime !== "") {
            setAlarms([...alarms, { start: startTime, end: endTime, interval: "3 mins" }]);
            setModalVisible(false);
            setStartTime("");
            setEndTime("");
        }
    };

    const deleteAlarm = (index) => {
        Alert.alert(
            "Delete Alarm",
            "Are you sure you want to delete this alarm?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => {
                        const updatedAlarms = [...alarms];
                        updatedAlarms.splice(index, 1);
                        setAlarms(updatedAlarms);
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleStop = async () => {
        if (alarmSound) {
            try {
                const status = await alarmSound.getStatusAsync();
                if (status.isLoaded) {
                    await alarmSound.pauseAsync();
                    console.log("Alarm sound stopped");
                } else {
                    console.log("Cannot stop sound because it is not loaded");
                }
            } catch (error) {
                ToastAndroid.show("Failed to stop the alarm sound", ToastAndroid.SHORT);
                console.error("Failed to stop the alarm sound", error);
            }
        }
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

    return (
        <View style={styles.container}>
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
                            style={{
                                justifyContent: "center",
                                alignContent: "center",
                                flex: 1,
                                gap: 40,
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Pressable style={styles.button} onPress={addAlarm}>
                                <Text style={styles.btnText}>Add alarm</Text>
                            </Pressable>
                            {isPlaying && (
                                <Pressable style={styles.stopButton} onPress={handleStop}>
                                    <Text style={styles.btnText}>Stop</Text>
                                </Pressable>
                            )}
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
                                    <Picker.Item label="1min" value="1 min" />
                                    <Picker.Item label="3mins" value="3 mins" />
                                    <Picker.Item label="5mins" value="5 mins" />
                                    <Picker.Item label="10mins" value="10 mins" />
                                    <Picker.Item label="15mins" value="15 mins" />
                                    <Picker.Item label="20mins" value="20 mins" />
                                    <Picker.Item label="30mins" value="30 mins" />
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

export default AlarmManager;
