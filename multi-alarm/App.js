import React, { useState, useEffect } from "react";
import { Button, View, Alert, AppState } from "react-native";
import { Audio } from "expo-av";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_TASK_NAME = "background-alarm";

const App = () => {
    const [alarmSet, setAlarmSet] = useState(false);

    useEffect(() => {
        // Register background task to ensure audio playback continues
        TaskManager.defineTask(BACKGROUND_TASK_NAME, ({ data, error }) => {
            if (error) {
                console.error("Background task error:", error);
                return;
            }

            if (data) {
                playAlarm();
            }
        });
    }, []);

    const playAlarm = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(require("./assets/alarm.mp3"));
            await sound.playAsync();
        } catch (error) {
            console.error("Failed to load the sound", error);
        }
    };

    const setAlarm = async () => {
        // Play alarm sound
        await playAlarm();
        setAlarmSet(true);
        Alert.alert("Alarm set!");
    };

    const handleAppStateChange = (nextAppState) => {
        if (nextAppState === "background") {
            // Schedule background task for audio playback
            TaskManager.getRegisteredTasksAsync().then((tasks) => {
                if (!tasks.find((task) => task.taskName === BACKGROUND_TASK_NAME)) {
                    TaskManager.unregisterAllTasksAsync();
                    TaskManager.defineTask(BACKGROUND_TASK_NAME, ({ data }) => {
                        playAlarm();
                        return TaskManager.TaskExecutionFinished;
                    });
                    TaskManager.scheduleTaskAsync(BACKGROUND_TASK_NAME, 0, {});
                }
            });
        }
    };

    useEffect(() => {
        // Listen for app state changes
        AppState.addEventListener("change", handleAppStateChange);

        return () => {
            // Clean up event listener
            AppState.removeEventListener("change", handleAppStateChange);
        };
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            {!alarmSet ? <Button title="Set Alarm" onPress={setAlarm} /> : null}
        </View>
    );
};

export default App;
