import { colors, shadow } from "@Cypher/style-guide";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";

interface Style {
    button: ViewStyle;
    buttonText: TextStyle;
    amount: TextStyle;
    priceView: ViewStyle;
    inDollar: TextStyle;
    text: TextStyle;
}

export default StyleSheet.create<Style>({
    button: {
        alignSelf: 'center',
        marginTop: 40,
        paddingHorizontal:30,
        height: 43,
        ...shadow.shadow25
    },
    buttonText: {
        color: colors.pink.main
    },
    amount: {
        fontSize: 45,
        width: '15%',
        fontFamily: 'Lato-Semibold',
        color: colors.white,
        alignSelf: 'center'
    },
    priceView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginHorizontal: 20,
        marginTop: 50
    },
    inDollar: {
        alignSelf: 'center',
        marginTop:10,
    },
    text: {
        // position: 'absolute',
        marginStart: 20
    },
})