import React, { useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, TextInput, View } from "react-native";
import SimpleToast from "react-native-simple-toast";

import styles from "./styles";
import { Input, ScreenLayout, Text } from "@Cypher/component-library";
import { CustomKeyboard, GradientCard, GradientInput } from "@Cypher/components";
import { colors, } from "@Cypher/style-guide";
import { dispatchNavigate } from "@Cypher/helpers";
import { bitcoinRecommendedFee, bitcoinSendFee, sendBitcoinPayment, sendCoinsViaUsername, sendLightningPayment } from "../../api/coinOSApis";
import LinearGradient from "react-native-linear-gradient";

export function startsWithLn(str: string) {
    // Check if the string starts with "ln"
    return str.startsWith("ln");
}

export default function SendToSavingsVault({ navigation, route }: any) {
    const info = route.params;
    const [isSats, setIsSats] = useState(true);
    const [sats, setSats] = useState('');
    const [usd, setUSD] = useState('');
    const [sender, setSender] = useState('');
    const senderRef = useRef<TextInput>(null);

    const [convertedRate, setConvertedRate] = useState(0.00);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedFee, setRecommendedFee] = useState<any>();
    const [selectedFee, setSelectedFee] = useState<number | null>(null);

    console.log('info: ', info)

    useEffect(() => {
        if (!sender.startsWith('ln') && !sender.includes('@') && !recommendedFee) {
            const init = async () => {
                const res = await bitcoinRecommendedFee();
                setRecommendedFee(res);
                console.log('recommendedFee: ', res)
            }
            init();
        }
    }, [sender])


    const handleSendNext = async () => {
        setIsLoading(true);
        const amount = isSats ? sats : usd;

        try {
            dispatchNavigate('ReviewWithdrawal', {
                value: sats,
                converted: usd,
                isSats: isSats,
                to: sender,
                fees: 0,
                type: 'lightening',
                matchedRate: info?.matchedRate,
                currency: info?.curreny,
                recommendedFee
            });

        } catch (error) {
            console.error('Error Send Lightening:', error);
            SimpleToast.show('Failed to Send Lightening. Please try again.', SimpleToast.SHORT);
        } finally {
            setIsLoading(false);
        }

        // if(selectedFee == null){
        //     SimpleToast.show('Please select fee rate', SimpleToast.SHORT);
        //     setIsLoading(false);
        //     return;
        // }



    };

    const handleFeeSelect = (fee: number) => {
        setSelectedFee(fee);
        // Now you can send the selected fee to the API or perform any other action.
    };

    const nextClickHandler = () => {
        dispatchNavigate('ReviewPayment', {
            value: sats,
            converted: usd,
            isSats: isSats,
            to: sender
        })
    }

    console.log('info: ', info)
    return (
        <ScreenLayout disableScroll showToolbar isBackButton title="Send Bitcoin">
            <ScrollView style={styles.container}>
                <GradientInput isSats={isSats} sats={sats} setSats={setSats} usd={usd} />
                <View style={styles.maxAmountContainer}>
                    <LinearGradient colors={['#FF65D4', '#D617A1']} style={styles.maxAmount}>
                        <Text bold>Send Max: 2.1M sats</Text>
                    </LinearGradient>
                </View>
            </ScrollView>
            <CustomKeyboard
                title="Next"
                onPress={handleSendNext}
                disabled={isLoading || ((!startsWithLn(sender)) ? (sats?.length == 0 && sender?.length == 0) : sender?.length == 0)}
                setSATS={setSats}
                setUSD={setUSD}
                setIsSATS={setIsSats}
                matchedRate={info?.matchedRate}
                currency={info?.currency}
            />
        </ScreenLayout>
    )
}