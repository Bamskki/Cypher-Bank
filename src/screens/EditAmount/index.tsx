import React, { useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import { Input, ScreenLayout, Text } from "@Cypher/component-library";
import { CustomKeyboardNew, GradientInput, GradientInputNew } from "@Cypher/components";
import { colors, } from "@Cypher/style-guide";
import { dispatchNavigate } from "@Cypher/helpers";

interface Props {
    route: any;
    navigation: any;
}

export default function SendScreen({ route, navigation }: Props) {
    const { isEdit, wallet, utxo, ids, maxUSD, inUSD, total, matchedRate, setSatsEdit, capsulesData = null,  to = null } = route?.params;
    const [isSats, setIsSats] = useState(true);
    const [sats, setSats] = useState('0');
    const [usd, setUSD] = useState('0');
    const [sender, setSender] = useState('');
    const senderRef = useRef<TextInput>(null);

    useEffect(() => {
        if(total && inUSD && isEdit){
            setSats(String(total) || "0")
            setUSD(String(inUSD) || "0")    
        }
    }, [total, inUSD, isEdit])

    const nextClickHandler = () => {
        setSatsEdit && setSatsEdit();
        dispatchNavigate('ColdStorage', {wallet, utxo, ids, maxUSD, inUSD: isSats ? usd : sats, total: isSats ? sats : usd, matchedRate, capsulesData, to});
        // // route?.params?.setSats(sats, usd);
        // navigation?.pop();
    }

    const maxSendClickHandler = () => {
        setSatsEdit && setSatsEdit();
        dispatchNavigate('ColdStorage', {wallet, utxo, ids, maxUSD, inUSD: inUSD, total: total, matchedRate, capsulesData, to});
    }

    return (
        <ScreenLayout disableScroll showToolbar isBackButton >
            <ScrollView style={styles.container}>
                <GradientInputNew isSats={isSats} sats={sats} setSats={setSats} usd={usd} title={'Specify  Amount'} />
                <Text bold h2 center style={{ marginTop: 30, marginBottom: 25 }}>Total size of selected bars:{'\n'}{maxUSD} BTC</Text>
                <TouchableOpacity onPress={maxSendClickHandler} style={styles.btn}>
                    <Text bold style={{ fontSize: 13 }}>Send Max: {maxUSD} BTC</Text>
                </TouchableOpacity>
            </ScrollView>
            <CustomKeyboardNew
                title="Next"
                onPress={nextClickHandler}
                prevSats={sats}
                isEdit={isEdit}
                disabled={!sats.length || Number(sats) == 0 || (isSats ? sats > maxUSD : usd > maxUSD)}
                setSATS={setSats}
                setUSD={setUSD}
                setIsSATS={setIsSats}
                firstTabText="BTC"
                matchedRate={matchedRate}
            />
        </ScreenLayout>
    )
}
