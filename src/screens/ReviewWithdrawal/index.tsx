import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from "react-native";
import SimpleToast from "react-native-simple-toast";
import { Icon } from "react-native-elements";
import ReactNativeModal from "react-native-modal";
import styles from "./styles";
import { Input, LoadingSpinner, ScreenLayout, Text } from "@Cypher/component-library";
import { CoinOSSmall } from "@Cypher/assets/images";
import { GradientButton, GradientCard, GradientCardWithShadow, GradientText, ImageText, SwipeButton, UtxoCapsule } from "@Cypher/components";
import { colors } from "@Cypher/style-guide";
import { dispatchNavigate } from "@Cypher/helpers";
import LinearGradient from "react-native-linear-gradient";
import TextView from "./TextView";
import TextViewV2 from "../Invoice/TextView"
import useAuthStore from "@Cypher/stores/authStore";
import { bitcoinSendFee, getCurrencyRates, getMe, sendBitcoinPayment, sendCoinsViaUsername, sendLightningPayment } from "@Cypher/api/coinOSApis";
import { btc, formatNumber, matchKeyAndValue } from "@Cypher/helpers/coinosHelper";
import { FeeSelection } from "./FeeSelection/FeeSelection";
import { startsWithLn } from "../Send";
import { calculatePercentage } from "../HomeScreen";

interface Props {
    route: any;
}
type Fee = keyof Fees;

type Fees = {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
};

export default function ReviewWithdrawal({ route }: Props) {
    const { value, converted, isSats, to, type, recommendedFee, isWithrawal } = route?.params;
    const { withdrawThreshold, reserveAmount } = useAuthStore();
    const [note, setNote] = useState('');
    const [balance, setBalance] = useState(0);
    const [currency, setCurrency] = useState('$');
    const [convertedRate, setConvertedRate] = useState(0);
    const [matchedRate, setMatchedRate] = useState(0);
    const [isStartLoading, setIsStartLoading] = useState(false)
    const [selectedFee, setSelectedFee] = useState<number | null>(null);
    const [selectedFeeName, setSelectedFeeName] = useState<string>("Select Fee");
    const [estimatedFee, setEstimatedFee] = useState<number>(0);
    const [networkFee, setNetworkFee] = useState<number>(0);
    const [bamskiiFee, setBamskiiFee] = useState<number>(0);
    const [feeLoading, setFeeLoading] = useState<boolean>(false);
    const [isSendLoading, setIsSendLoading] = useState<boolean>(false);
    const [isModalVisible, setModalVisible] = useState(false);

    const swipeButtonRef = useRef(null);
    const feeNames: Record<Fee, string> = {
        fastestFee: "Fastest",
        halfHourFee: "Fast",
        hourFee: "Medium",
        economyFee: "Slow",
    };


    useEffect(() => {
        handleUser();
    }, []);

    // useEffect(() => {
    //     if(selectedFeeName){
    //         handleFeeEstimate();
    //     }
    // }, [selectedFeeName])

    const handleUser = async () => {
        setIsStartLoading(true);
        try {
            const response = await getMe();
            console.log('response: ', response);
            const responsetest = await getCurrencyRates();
            const currency = btc(1);
            const matched = matchKeyAndValue(responsetest, 'USD')
            setMatchedRate(matched || 0)
            console.log('converter: ', (matched || 0) * currency * response.balance);
            setConvertedRate((matched || 0) * currency * response.balance)
            setCurrency("USD")
            console.log('currency: ', currency)
            if (response?.balance) {
                setBalance(response?.balance || 0);
            }
        } catch (error) {
            console.log('error: ', error);
        } finally {
            setIsStartLoading(false)
        }
    }

    const handleFeeEstimate = async (fee: string) => {
        setFeeLoading(true);
        const amount = isSats ? value : converted;
        if (to.startsWith('bc')) { //bitcoin onchain
            const feeForBamskki = (0.1 / 100) * Number(amount);
            const remainingAmount = Number(amount) - feeForBamskki;
            console.log('feeForBamskki: ', feeForBamskki)
            console.log('remainingAmount: ', remainingAmount)
            if (remainingAmount <= 0) {
                SimpleToast.show("You don't have enough balance", SimpleToast.SHORT);
                setFeeLoading(false);
                return;
            }

            console.log('recommendedFee[fee]: ', recommendedFee[fee])
            try {
                const estimatedFee = await bitcoinSendFee(remainingAmount, to, recommendedFee[fee] < 9 ? 10 : Number(recommendedFee[fee]));
                let jsonObject = null;
                if (estimatedFee?.startsWith('{')) { // as estimatedFee is a string so this condition is helpful
                    jsonObject = JSON.parse(estimatedFee);
                    console.log(jsonObject, jsonObject.fee);
                    setEstimatedFee(Number(jsonObject.fee))
                    jsonObject?.ourfee && setNetworkFee(Number(jsonObject?.ourfee))
                    setBamskiiFee(Number(feeForBamskki))
                    setSelectedFee(recommendedFee[fee] < 9 ? 10 : Number(recommendedFee[fee]));
                    setSelectedFeeName(feeNames[fee as Fee])
                } else {
                    SimpleToast.show(estimatedFee, SimpleToast.SHORT);
                    return;
                }
                console.log('jsonObject: ', jsonObject);
            } catch (error) {
                console.error('Error Send to bitcoin:', error);
                SimpleToast.show(error?.message ? error?.message : 'Failed to estimate bitcoin fee. Please try again.', SimpleToast.SHORT);
            } finally {
                setModalVisible(false)
                setFeeLoading(false);
            }
        } else { //liquid address
            if (amount == '') {
                SimpleToast.show('Please enter an amount', SimpleToast.SHORT);
                setFeeLoading(false);
                return;
            }
            const feeForBamskki = (0.1 / 100) * Number(amount);
            const remainingAmount = Number(amount) - feeForBamskki;
            console.log('feeForBamskki: ', feeForBamskki)
            console.log('remainingAmount: ', remainingAmount)
            if (remainingAmount <= 0) {
                SimpleToast.show("You don't have enough balance", SimpleToast.SHORT);
                setFeeLoading(false);
                return;
            }

            try {
                const estimatedFee = await bitcoinSendFee(remainingAmount, to, recommendedFee[fee] < 9 ? 10 : Number(recommendedFee[fee]));
                let jsonObject = null;
                if (estimatedFee?.startsWith('{')) { // as estimatedFee is a string so this condition is helpful
                    jsonObject = JSON.parse(estimatedFee);
                    console.log("jsonObject: ", jsonObject, jsonObject.fee);
                    setEstimatedFee(Number(jsonObject.fee))
                    jsonObject?.ourfee && setNetworkFee(Number(jsonObject?.ourfee))
                    setBamskiiFee(Number(feeForBamskki))
                    setSelectedFee(recommendedFee[fee] < 9 ? 10 : Number(recommendedFee[fee]));
                    setSelectedFeeName(feeNames[fee as Fee])
                } else {
                    SimpleToast.show(estimatedFee, SimpleToast.SHORT);
                    return;
                }
            } catch (error) {
                console.error('Error Send to liquid:', error);
                SimpleToast.show(error?.message ? error?.message : 'Failed to estimate liquid fee. Please try again.', SimpleToast.SHORT);
            } finally {
                setModalVisible(false)
                setFeeLoading(false);
            }
        }
    };

    const handleToggle = (val: any) => {
        console.log("🚀 ~ handleToggle ~ value:", val)
                         dispatchNavigate('TransactionBroadCast', {matchedRate, type, value, converted, isSats, to});        

        if (val) {
            handleSendSats();
            // if(type == 'lightening' || type == 'username')
            //     dispatchNavigate('Transaction', {matchedRate, type, value, converted, isSats, to});
            // else 
                 dispatchNavigate('TransactionBroadCast', {matchedRate, type, value, converted, isSats, to});        
        }
    }

    const handleFeeSelect = (fee: string) => {
        console.log('fee: ', fee)
        handleFeeEstimate(fee)
    };


    const handleSendSats = async () => {
        setIsSendLoading(true);
        const amount = isSats ? value : converted;
        if (to == '') {
            SimpleToast.show('Please enter an address or username', SimpleToast.SHORT);
            setIsSendLoading(false);
            return;
        } else if (startsWithLn(to)) { //lightening invoice
            try {
                const response = await sendLightningPayment(to, note, amount);
                console.log('response: ', response)
                if (response?.startsWith('{')) {
                    const jsonLNResponse = JSON.parse(response);
                    dispatchNavigate('Transaction', { matchedRate, type, value, converted, isSats, to, item: jsonLNResponse });
                } else {
                    SimpleToast.show(response, SimpleToast.SHORT)
                }

            } catch (error) {
                console.error('Error Send Lightening:', error);
                SimpleToast.show('Failed to Send Lightening. Please try again.', SimpleToast.SHORT);
            } finally {
                setIsSendLoading(false);
            }
        } else if (to.startsWith('bc')) { //bitcoin onchain
            if (amount == '') {
                SimpleToast.show('Please enter an amount', SimpleToast.SHORT);
                setIsSendLoading(false);
                return;
            }
            if (selectedFee == null) {
                SimpleToast.show('Please select fee rate', SimpleToast.SHORT);
                setIsSendLoading(false);
                return;
            }
            const feeForBamskki = (0.1 / 100) * Number(amount);
            const remainingAmount = Number(amount) - feeForBamskki;
            console.log('feeForBamskki: ', feeForBamskki)
            console.log('remainingAmount: ', remainingAmount)
            if (remainingAmount <= 0) {
                SimpleToast.show("You don't have enough balance", SimpleToast.SHORT);
                setIsSendLoading(false);
                return;
            }

            console.log('selectedFee: ', selectedFee)
            try {
                const sendResponse = await sendBitcoinPayment(remainingAmount, to, selectedFee, note);

                let jsonSend = null
                console.log('sendResponse: ', sendResponse)
                if (sendResponse?.startsWith('{')) { // as estimatedFee is a string so this condition is helpful
                    jsonSend = JSON.parse(sendResponse);

                    console.log('jsonSend: ', jsonSend)
                    //send 0.1% fee to bamskii
                    const response = await sendCoinsViaUsername("bamskki@coinos.io", feeForBamskki, '');
                    console.log('response username: ', response, typeof response)
                    dispatchNavigate('TransactionBroadCast', { matchedRate, type, value, converted, isSats, to, item: jsonSend });

                } else {
                    SimpleToast.show(sendResponse, SimpleToast.SHORT);
                    return;
                }
            } catch (error) {
                console.error('Error Send to bitcoin:', error);
                SimpleToast.show('Failed to Send to bitcoin. Please try again.', SimpleToast.SHORT);
            } finally {
                setIsSendLoading(false);
            }
        } else if (to.includes("@")) { //username
            if (amount == '') {
                SimpleToast.show('Please enter an amount', SimpleToast.SHORT);
                setIsSendLoading(false);
                return;
            }
            try {
                const response = await sendCoinsViaUsername(to, Number(amount), note);
                console.log('response username: ', response, typeof response)
                const jsonResponse = JSON.parse(response);
                if (response?.startsWith('{')) {
                    dispatchNavigate('Transaction', { matchedRate, type, value, converted, isSats, to, item: jsonResponse });
                } else {
                    SimpleToast.show(response, SimpleToast.SHORT);
                }

            } catch (error) {
                console.error('Error Send Lightening:', error);
                SimpleToast.show('Failed to Send Lightening. Please try again.', SimpleToast.SHORT);
            } finally {
                setIsSendLoading(false);
            }
        } else { //liquid address
            if (amount == '') {
                SimpleToast.show('Please enter an amount', SimpleToast.SHORT);
                setIsSendLoading(false);
                return;
            }
            if (selectedFee == null) {
                SimpleToast.show('Please select fee rate', SimpleToast.SHORT);
                setIsSendLoading(false);
                return;
            }
            const feeForBamskki = (0.1 / 100) * Number(amount);
            const remainingAmount = Number(amount) - feeForBamskki;
            console.log('feeForBamskki: ', feeForBamskki)
            console.log('remainingAmount: ', remainingAmount)
            if (remainingAmount <= 0) {
                SimpleToast.show("You don't have enough balance", SimpleToast.SHORT);
                setIsSendLoading(false);
                return;
            }

            try {
                const sendResponse: any = await sendBitcoinPayment(remainingAmount, to, selectedFee, note);

                let jsonSend = null
                console.log('sendResponse: ', sendResponse)
                if (sendResponse?.startsWith('{') || (typeof sendResponse == 'object' && sendResponse?.txid)) { // as estimatedFee is a string so this condition is helpful
                    jsonSend = JSON.parse(sendResponse);

                    //send 0.1% fee to bamskii
                    const response = await sendCoinsViaUsername("bamskki@coinos.io", feeForBamskki, '');
                    console.log('response username: ', response)
                    dispatchNavigate('TransactionBroadCast', { matchedRate, type, value, converted, isSats, to, item: jsonSend });
                } else {
                    SimpleToast.show(sendResponse, SimpleToast.SHORT);
                    return;
                }
            } catch (error) {
                console.error('Error Send to liquid:', error);
                SimpleToast.show('Failed to Send to Liquid. Please try again.', SimpleToast.SHORT);
            } finally {
                setIsSendLoading(false);
            }
        }
    };

    const editAmountHandler = () => {
        dispatchNavigate('SendToSavingsVault', { currency, matchedRate });
    }

    const increaseClickHandler = () => {
        const feeKeys = Object.values(feeNames);
        const currentIndex = feeKeys.indexOf(selectedFeeName !== "Select Fee" ? selectedFeeName : '');
        const fromFeeKeys = Object.keys(recommendedFee);
        if (currentIndex === feeKeys.length - 1) {
            SimpleToast.show('You have reached the end of the fee list.', SimpleToast.SHORT);
            return;
        }
        const newIndex = (currentIndex + 1) % feeKeys.length;
        const newFeeKey = fromFeeKeys[newIndex];
        handleFeeEstimate(newFeeKey)
    };

    const decreaseClickHandler = () => {
        const feeKeys = Object.values(feeNames);
        const currentIndex = feeKeys.indexOf(selectedFeeName !== "Select Fee" ? selectedFeeName : '');
        const fromFeeKeys = Object.keys(recommendedFee);
        if (currentIndex === 0) {
            SimpleToast.show('You have reached the start of the fee list.', SimpleToast.SHORT);
            return;
        }
        const newIndex = (currentIndex - 1 + feeKeys.length) % feeKeys.length;
        const newFeeKey = fromFeeKeys[newIndex];
        handleFeeEstimate(newFeeKey)
    };

    return (
        <ScreenLayout showToolbar isBackButton title="Review withdrawal">
            <View style={styles.topView}>
                {isStartLoading ?
                    <ActivityIndicator style={{ marginTop: 10, marginBottom: 20 }} color={colors.white} />
                    :
                    <GradientCardWithShadow
                        colors_={[colors.gray.dark, colors.gray.dark]}
                        style={styles.linearGradient}
                        disabled
                        linearStyle={styles.height}
                        shadowStyleTop={styles.top}
                        shadowStyleBottom={styles.bottom}>
                        <View style={styles.view}>
                            <Text h2 bold style={styles.check}>
                                Checking Account
                            </Text>
                            <Image
                                source={CoinOSSmall}
                                style={styles.blink}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.sats}><Text h2>{formatNumber(balance)} sats  ~  </Text><Text h3>${convertedRate.toFixed(2)}</Text></View>
                        <Text bold style={styles.text}>{formatNumber(Number(withdrawThreshold + reserveAmount))} sats</Text>
                        {(type == 'bitcoin' || type == 'liquid') &&
                            <View style={{ paddingHorizontal: 25, alignItems: 'center' }}>
                                <View style={styles.showLine} />
                                <View style={[styles.box, { left: `${calculatePercentage(withdrawThreshold, reserveAmount)}%` }]} />
                                <View style={[styles.box, { left: `${Math.min((withdrawThreshold / (Number(withdrawThreshold + reserveAmount) || 0)) * 100, 100)}%` }]} />
                                <LinearGradient
                                    start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}
                                    colors={[colors.white, colors.pink.dark]}
                                    style={[styles.linearGradient2, { width: `${calculatePercentage(balance, reserveAmount)}%` }]}>
                                </LinearGradient>


                            </View>
                        }
                    </GradientCardWithShadow>
                }



                <View style={styles.middle}>
                    <View style={styles.editAmount}>
                        <TextViewV2 keytext="Withdrawn amount:" text={isSats ? `${value} btc ~ $${converted}` : `$${value} ~ $${converted} btc`} textStyle={styles.price} />
                        <GradientCard disabled
                            colors_={['#FFFFFF', '#B6B6B6']}
                            style={styles.linearGradientStroke} linearStyle={styles.linearGradient3}>
                            <View style={styles.background}>
                                <TouchableOpacity onPress={editAmountHandler}>
                                    <Text bold style={{ fontSize: 16 }}>Edit amount</Text>
                                </TouchableOpacity>
                            </View>
                        </GradientCard>
                    </View>
                    <LinearGradient
                        start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}
                        colors={[colors.gradient.green.start, colors.gradient.green.end]}
                        style={[styles.utxoCapsule]}
                    />

                    <TextViewV2 keytext="Sent from: " text="My Coinos Checking Account" />
                    <View style={styles.editAmount}>
                        <TextViewV2 keytext="To: " text={to} />
                        <GradientCard disabled
                            colors_={['#FFFFFF', '#B6B6B6']}
                            style={styles.linearGradientStroke2} linearStyle={styles.linearGradient3}>
                            <View style={styles.background}>
                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <Text bold style={{ fontSize: 14, fontStyle: 'italic', color: "#23C47F" }}>Vault address: 1B8Du...HTzA</Text>
                                </TouchableOpacity>
                            </View>
                        </GradientCard>
                    </View>
                    {to && value && (type === 'bitcoin' || type === 'liquid') && recommendedFee ?
                        <>
                            <View style={styles.feesView}>
                                <TextViewV2 keytext="Network Fee:  " text={` ~   ${estimatedFee} sats`} />
                                <GradientCard disabled
                                    colors_={['#FFFFFF', '#B6B6B6']}
                                    style={styles.linearGradientStroke} linearStyle={styles.linearGradient3}>
                                    <View style={styles.background}>
                                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                                            <Text bold style={{ fontSize: 16 }}>{selectedFeeName}</Text>
                                        </TouchableOpacity>
                                        <View style={{ paddingVertical: 5 }}>
                                            <TouchableOpacity style={{ opacity: feeLoading ? 0.5 : 1 }} onPress={increaseClickHandler} disabled={feeLoading}>
                                                <Icon name="angle-up" type="font-awesome" color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ opacity: feeLoading ? 0.5 : 1 }} onPress={decreaseClickHandler} disabled={feeLoading}>
                                                <Icon name="angle-down" type="font-awesome" color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </GradientCard>
                            </View>
                            <TextViewV2 keytext="Coinos Fee + Service Fee:  " text={` ~   ${(networkFee || 0) + (bamskiiFee || 0)} sats`} />
                            <TextViewV2 keytext="Total Fee:  " text={` ~   ${(networkFee || 0) + (bamskiiFee || 0) + (estimatedFee || 0)} sats (~0.2%)`} />
                        </>
                        :
                        <TextView keytext="Fees:  " text={` ~   ${estimatedFee} sats`} />
                    }
                </View>

                <ReactNativeModal isVisible={isModalVisible}>
                    <View>
                        <GradientCard disabled
                            style={styles.modal} linearStyle={styles.linearGradient4}>
                            <ScrollView style={styles.background2}>
                                {Object.entries(recommendedFee).map(([feeKey, feeValue], index) => (
                                    feeKey !== 'minimumFee' && (
                                        <TouchableOpacity style={[styles.row, index % 2 == 0 && { backgroundColor: colors.primary }]}
                                            onPress={() => handleFeeSelect(feeKey as Fee)}>
                                            <Text bold style={{ fontSize: 18 }}>{feeNames[feeKey as Fee]}</Text>
                                        </TouchableOpacity>
                                    )
                                ))}
                            </ScrollView>
                        </GradientCard>
                    </View>
                </ReactNativeModal>

                <GradientCard
                    style={styles.main}
                    linearStyle={styles.heigth}
                    colors_={note ? [colors.pink.extralight, colors.pink.default] : [colors.gray.thin, colors.gray.thin2]}>
                    <Input
                        onChange={setNote}
                        value={note}
                        textInpuetStyle={styles.heigth2}
                        label="Add note"
                    />
                </GradientCard>
            </View>
            <View style={styles.container}>
                <Text bold style={styles.alert}>Causion: Bitcoin payments are irriversable</Text>
                <SwipeButton ref={swipeButtonRef} onToggle={handleToggle} isLoading={isSendLoading} />
                {/* <GradientButton style={styles.invoiceButton} textStyle={{ fontFamily: 'Lato-Medium', }} title="Send" onPress={sendClickHandler} /> */}
            </View>
        </ScreenLayout>
    )
}