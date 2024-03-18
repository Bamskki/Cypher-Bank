import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors } from '@Cypher/style-guide';

import styles from './styles';
// import RoundedIcon from '../RoundedIcon';
import { Back } from '@Cypher/assets/images';

type Props = {
  onPress?: () => void;
};

export default function HeaderBackButton({ onPress }: Props) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  if (!canGoBack) {
    return null;
  }

  const onPressHeaderBackButton = () => {
    
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      testID={'backbutton'}
      accessibilityLabel={'backbutton'}
      onPress={onPressHeaderBackButton}
      activeOpacity={0.5}
      style={styles.headerBackButton}>
      <Image source={Back} />
      {/* <RoundedIcon
        borderColor={colors.greys.light}
        showBorder
        name="arrow-left"
        backgroundColor={colors.greys.dark}
        color={colors.greys.white}
        solid
      /> */}
      {/* <Icon name="arrow-left" size={sizes[20]} color={colors.yellows.default} /> */}
    </TouchableOpacity>
  );
}
