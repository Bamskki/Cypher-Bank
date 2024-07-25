import { colors, widths } from "@Cypher/style-guide";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

interface Style {
    container: ViewStyle;
    title: TextStyle;
    titleVault: TextStyle;
    savingVault: ViewStyle;
    bitcoinText: TextStyle;
    bitcoinImage: ImageStyle;
    coinselected: TextStyle;
    editAmount: ViewStyle;
    priceView: ViewStyle;
    value: TextStyle;
    fees: TextStyle;
    recipientView: ViewStyle;
    recipientTitle: TextStyle;
    nextBtn: ViewStyle;
    noteInput: TextStyle;
    button: ViewStyle;
    qrcode: ImageStyle;
    feesDropDown: ViewStyle;
    middleText: ViewStyle;
    first: ViewStyle;
    second: ViewStyle;
    third: ViewStyle;
    fourth: ViewStyle;
    border: ViewStyle;
    pasteview: ViewStyle;
}

export default StyleSheet.create<Style>({
    container: {
        flex: 1,
        paddingBottom: 30,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Archivo-SemiBold',
        marginBottom: 20,
    },
    titleVault: {
        fontSize: 18,
    },
    savingVault: {
        width: widths - 40,
        height: 143,
    },
    bitcoinText: {
        fontSize: 16,
    },
    bitcoinImage: {
        width: 37,
        height: 33,
    },
    coinselected: {
        fontSize: 18,
    },
    editAmount: {
        // width: 103,
        height: 38,
        borderWidth: 3,
        borderRadius: 15,
        borderColor: '#B6B6B6',
        padding: 5,
        paddingHorizontal: 10,
        marginStart: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gray.dark,
    },
    priceView: {
        flexDirection: 'row',
        marginTop: 15,
    },
    value: {
        color: colors.green,
        fontSize: 18,
        marginTop: 5,
    },
    fees: {
        fontSize: 18,
        marginTop: 5,
    },
    recipientView: {
        padding: 20,
        paddingHorizontal: 40,
        flex: 1,
    },
    recipientTitle: {
        fontSize: 18,
        marginTop: 10,
    },
    nextBtn: {
        backgroundColor: colors.green,
        height: 47,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 30,
    },
    noteInput: {
        borderWidth: 3,
        borderColor: '#B6B6B6',
        width: '50%',
        height: 35,
        borderRadius: 15,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 10,
    },
    button: {
        backgroundColor: colors.gray.dark,
        borderRadius: 15,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#B6B6B6',
        flex: 1,
        marginEnd: 10,
    },
    qrcode: {
        width: 40,
        height: 40,
    },
    feesDropDown: {
        backgroundColor: colors.primary,
        borderWidth: 3,
        borderRadius: 10,
        borderColor: colors.green,
        position: 'absolute',
        alignSelf: 'center',
        width: 138,
        // height: 121,
        start: widths / 3 + 20,
        top: -75,
        end: 0,
        zIndex: 1,
    },
    middleText: {
        height: 31,
        backgroundColor: colors.black.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
    first: {
        backgroundColor: colors.primary,
        height: 31,
        borderTopStartRadius: 10,
        borderTopEndRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    second: {
        height: 31,
        backgroundColor: colors.black.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
    third: {
        height: 31,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fourth: {
        backgroundColor: colors.black.default,
        height: 31,
        borderBottomEndRadius: 10,
        borderBottomStartRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    border: {
        borderWidth: 1,
        borderRadius: 12.5,
        borderColor: colors.white,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    pasteview: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center'
    },
})
