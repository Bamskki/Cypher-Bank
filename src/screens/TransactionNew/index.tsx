import React, { useEffect, useRef, useState } from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import { Input, ScreenLayout, Text } from "@Cypher/component-library";
import { Blink, CustomKeyboard, GradientButton, GradientCard, GradientInput } from "@Cypher/components";
import { colors, widths, } from "@Cypher/style-guide";
import { dispatchNavigate } from "@Cypher/helpers";
import * as Progress from 'react-native-progress';
// import { Ring, Ring3, } from "@Cypher/assets/gif";
import { Electrik } from "@Cypher/assets/images";
import Ring from "@Cypher/components/RingEffect";
// import Ring from "@Cypher/components/RingEffect";
import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    useAnimatedStyle,
} from "react-native-reanimated";

export default function Transaction() {
    const [response, setResponse] = useState(false);
    const [progress, setProgress] = useState(0.2);
    const [sats, setSats] = useState('30,000 sats');
    const [usd, setUsd] = useState('0.013');
    const [to, setTo] = useState('To: Satoshi@cypherbox.io');
    const fadeInOpacity = useSharedValue(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress < 1) {
                    return prevProgress + 0.001;
                } else {
                    clearInterval(intervalId);
                    return 1;
                }
            });
        }, 10);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (progress == 1) {
            setResponse(true);
            fadeIn();
        }
    }, [progress]);

    const onPressClickHandler = () => { }

    const fadeIn = () => {
        fadeInOpacity.value = withTiming(1, {
            duration: 1500,
            easing: Easing.linear,
        });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeInOpacity.value, // Use the value directly 
        };
    });

    const generateKeyClickHandler = () => {
        dispatchNavigate('HomeScreen');
    }

    return (
        <ScreenLayout disableScroll showToolbar isBackButton={false}>
            <View style={styles.main}>
                <View style={styles.container}>
                    {!response && <Text h1 semibold center style={{ lineHeight: 45 }}>Purchasing vault</Text>}
                    {response &&
                        <Animated.View style={animatedStyle}>
                            <Text semibold center style={{ fontSize: 32, lineHeight: 45 }}>Purchase completed</Text>
                            <Text semibold center style={styles.sats}>{sats}</Text>
                            <Text subHeader bold center>{usd}</Text>
                            <View style={styles.extra} />
                            <Text subHeader bold center>{to}</Text>
                        </Animated.View>
                    }
                </View>
                <View style={styles.ringEffect}>
                    {!response ?
                        <>
                            <Ring delay={0} />
                            <Ring delay={1000} />
                            <Ring delay={2000} />
                            <Ring delay={3000} />
                        </>
                        : null}
                    <GradientCard style={styles.gradient} linearStyle={styles.gradient}
                        colors_={!response ? [colors.white, colors.white] : [colors.pink.extralight, colors.pink.default]}>
                        <View style={styles.inner}>
                            <GradientCard style={styles.gradientInner} linearStyle={styles.gradientInner}
                                colors_={!response ? [colors.white, colors.white] : [colors.pink.extralight, colors.pink.default]}>
                                <View style={styles.inside}>
                                    <Image source={Electrik} style={styles.image} resizeMode="contain" />
                                </View>
                            </GradientCard>
                        </View>
                    </GradientCard>
                </View>
                <View style={styles.extra} />
                {response ?
                    <TouchableOpacity style={styles.button} onPress={generateKeyClickHandler}>
                        <Text bold h3 style={styles.nextBtn}>Generate Keys</Text>
                    </TouchableOpacity>
                    :
                    <View style={styles.invoiceButton}>
                        <Progress.Bar
                            height={30}
                            progress={progress}
                            color={colors.white}
                            borderColor="#303030"
                            width={widths - 60}
                            style={{
                                backgroundColor: '#303030',
                                height: 30,
                                borderRadius: 20,
                            }} />
                    </View>
                }
            </View>
        </ScreenLayout>
    )
}
