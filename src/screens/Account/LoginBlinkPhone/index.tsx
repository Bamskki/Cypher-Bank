import React, { useState } from "react";
import { TextInput, View } from "react-native";
import styles from "./styles";
import { GradientButton, GradientText } from "@Cypher/components";
import { useNavigation } from "@react-navigation/native";
import { ScreenLayout, Text } from "@Cypher/component-library";
import { dispatchNavigate } from "@Cypher/helpers";

export default function LoginBlinkPhone() {
    const [phone, setPhone] = useState<string>('');

    const nextClickHandler = () => {
        dispatchNavigate('VerifyPhone', { phone: phone });
    }

    return (
        <ScreenLayout disableScroll showToolbar progress={1}>
            <View style={styles.container}>
                <View style={styles.innerView}>
                    <GradientText>Login to Blink</GradientText>
                    <Text h2 semibold style={styles.title}>Login with phone Number</Text>
                    <TextInput
                        value={phone}
                        onChangeText={setPhone} keyboardType='phone-pad'
                        returnKeyType="done"
                        maxLength={10}
                        style={styles.textInput} />
                </View>
                <GradientButton title="SMS" onPress={nextClickHandler} disabled={phone.length < 10} />
                <View style={styles.space} />
                <GradientButton title="Send via Whatsapp" onPress={nextClickHandler} disabled={phone.length < 10} />
            </View>
        </ScreenLayout>
    )
}
