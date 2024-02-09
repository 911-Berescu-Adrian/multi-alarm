import { View, StatusBar } from "react-native";
import { styles } from "./styles";
import AlarmManager from "./AlarmManager";

const App = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={"#232323"} />
            <AlarmManager />
        </View>
    );
};

export default App;
