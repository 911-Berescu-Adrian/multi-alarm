import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
        textAlign: "center",
    },
    noAlarmsContainer: {
        flex: 1,
        paddingHorizontal: 30,
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
