import React, { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import styles from './styles';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { scanQrHelper } from '../../../helpers/scan-qr';
import DeeplinkSchemaMatch from '../../../class/deeplink-schema-match';
import triggerHapticFeedback, { HapticFeedbackTypes } from '../../../blue_modules/hapticFeedback';
import { CoinOSSmall } from '@Cypher/assets/images';
import React, { useContext, useEffect, useReducer, useRef, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { scanQrHelper } from "../../../helpers/scan-qr";
import DeeplinkSchemaMatch from "../../../class/deeplink-schema-match";
import triggerHapticFeedback, {
  HapticFeedbackTypes,
} from "../../../blue_modules/hapticFeedback";
import { CoinOSSmall } from "@Cypher/assets/images";
import {
  GradientButtonWithShadow,
  GradientCard,
  GradientCardWithShadow,
  GradientText,
  GradientView,
  SavingVault,
} from '@Cypher/components';
import { ScreenLayout, Text } from '@Cypher/component-library';
import { dispatchNavigate } from '@Cypher/helpers';
import { Shadow } from 'react-native-neomorph-shadows';
import { colors, heights } from '@Cypher/style-guide';
} from '@Cypher/components';
import { ScreenLayout, Text } from '@Cypher/component-library';
import { dispatchNavigate } from '@Cypher/helpers';
import { Shadow } from 'react-native-neomorph-shadows';
import { colors, heights } from '@Cypher/style-guide';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from "react-native-linear-gradient";
import ReceivedList from "./ReceivedList";
import useAuthStore from "@Cypher/stores/authStore";
import { getCurrencyRates, getMe, getTransactionHistory } from "@Cypher/api/coinOSApis";
import { btc, formatNumber, matchKeyAndValue } from "@Cypher/helpers/coinosHelper";
import { AbstractWallet, HDSegwitBech32Wallet, HDSegwitP2SHWallet } from "../../../class";
import LinearGradient from 'react-native-linear-gradient';
import ReceivedList from './ReceivedList';
import useAuthStore from '@Cypher/stores/authStore';
import { getCurrencyRates, getMe, getTransactionHistory } from '@Cypher/api/coinOSApis';
import { btc, formatNumber, matchKeyAndValue } from '@Cypher/helpers/coinosHelper';
import { AbstractWallet, HDSegwitBech32Wallet, HDSegwitP2SHWallet } from '../../../class';
import loc, { formatBalance, formatBalanceWithoutSuffix } from '../../../loc';
import { initialState, walletReducer } from '../../../screen/wallets/add';
import { initialState, walletReducer } from '../../../screen/wallets/add';
import { BlueStorageContext } from '../../../blue_modules/storage-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  route: any;
}

export const calculatePercentage = (withdrawThreshold: number, reserveAmount: number) => {
  const threshold = Number(withdrawThreshold);
  const reserve = Number(reserveAmount);

  const percentage = (threshold / (threshold + reserve)) * 100;
  return Math.min(percentage, 100);
};

export function calculateBalancePercentage(balance: number, withdrawThreshold: number, reserveAmount: number) {
  const total = withdrawThreshold + reserveAmount;


  if (total === 0) {
    return 0; // Prevent division by zero
    return 0; // Prevent division by zero
  }


  const percentage = (balance / total) * 100;
  const resPercentage = percentage > 100 ? 100 : percentage;
  return parseFloat(resPercentage.toFixed(2)); // Return percentage rounded to 2 decimal places
}

export default function HomeScreen({ route }: Props) {
  const { navigate } = useNavigation();
  const routeName = useRoute().name;
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const label = state.label;
  const { addWallet, saveToDisk, isAdvancedModeEnabled, wallets } = useContext(BlueStorageContext);
  const { isAuth, walletID, token, user, withdrawThreshold, reserveAmount, setUser } = useAuthStore();
  const A = require('../../../blue_modules/analytics');

  console.log('walletID:  ', walletID)
  console.log('walletID:  ', walletID);
  // const [storage, setStorage] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('$');
  const [convertedRate, setConvertedRate] = useState(0);
  const [matchedRate, setMatchedRate] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [payment, setPayments] = useState([]);
  const [payment, setPayments] = useState([]);
  const [wt, setWt] = useState<number>();
  const [isWithdraw, setIsWithdraw] = useState<boolean>(true);
  const [isAllDone, setIsAllDone] = useState<boolean>(false);
  const [wallet, setWallet] = useState(undefined);
  const [balanceVault, setBalanceVault] = useState<string | false | undefined>("");
  const [balanceWithoutSuffix, setBalanceWithoutSuffix] = useState()
  const [balanceVault, setBalanceVault] = useState<string | false | undefined>('');
  const [balanceWithoutSuffix, setBalanceWithoutSuffix] = useState();

  const refRBSheet = useRef<any>(null);

  const getWalletID = async () => {
    try {
      return await AsyncStorage.getItem('wallet@ID');
    } catch (error) {
      console.error('Error getting auth token from AsyncStorage:', error);
      throw error;
    }
  };


  useFocusEffect(() => {
    if (route?.params?.isComplete) setIsAllDone(true);
  });

  useEffect(() => {
    async function handleToken() {
      if (isAuth && token) {
        handleUser();
        loadPayments();
        if (wallets && walletID) {
          if (wallets && walletID) {
            const allWallets = wallets.concat(false);
            const walletTemp = allWallets.find((w: AbstractWallet) => w.getID() === walletID);
            const balanceTemp =
              !walletTemp?.hideBalance && formatBalance(walletTemp?.getBalance(), walletTemp?.getPreferredBalanceUnit(), true);
            const balanceWithoutSuffixTemp =
              !walletTemp?.hideBalance &&
              formatBalanceWithoutSuffix(Number(walletTemp?.getBalance()), walletTemp?.getPreferredBalanceUnit(), true);
            await walletTemp.fetchBalance();
            const balanceTemp =
              !walletTemp?.hideBalance && formatBalance(walletTemp?.getBalance(), walletTemp?.getPreferredBalanceUnit(), true);
            const balanceWithoutSuffixTemp =
              !walletTemp?.hideBalance &&
              formatBalanceWithoutSuffix(Number(walletTemp?.getBalance()), walletTemp?.getPreferredBalanceUnit(), true);
            await walletTemp.fetchBalance();
            setWallet(walletTemp);
            setBalanceWithoutSuffix(balanceWithoutSuffixTemp);
            setBalanceVault(balanceTemp);
            setBalanceWithoutSuffix(balanceWithoutSuffixTemp);
            setBalanceVault(balanceTemp);
            setIsAllDone(!!walletTemp);
          } else {
            setIsAllDone(false);
            setIsAllDone(false);
          }
        } else {
          setIsLoading(false);
          setIsLoading(false);
        }
      }
      // async function getWithdrawal() {
      //   const wt = await AsyncStorage.getItem('withdrawThreshold');
      //   if(wt){
      //     setWt(Number(wt));
      //   }
      // }
      // getWithdrawal();
      handleToken();
    }, [isAuth, token, wallets, walletID]);

  console.log('setIsAllDone: ', isAllDone)
  console.log('setIsAllDone: ', isAllDone);

  const handleUser = async () => {
    try {
      const response = await getMe();
      const responsetest = await getCurrencyRates();
      const currency = btc(1);
      const matched = matchKeyAndValue(responsetest, 'USD');
      setMatchedRate(matched || 0);
      setConvertedRate((matched || 0) * currency * response.balance);
      setCurrency('USD');
      const matched = matchKeyAndValue(responsetest, 'USD');
      setMatchedRate(matched || 0);
      setConvertedRate((matched || 0) * currency * response.balance);
      setCurrency('USD');
      if (response?.balance) {
        setBalance(response?.balance || 0);
      }
      setUser(response?.username);
    } catch (error) {
      console.log('error: ', error);
    } finally {
      setIsLoading(false);
      setIsLoading(false);
      setRefreshing(false);
    }
  };
};

const loadPayments = async (append = true) => {
  try {
    const paymentList = await getTransactionHistory(0, 5);
    console.log(paymentList.payments, 'paymentList===');
    console.log(paymentList.payments, 'paymentList===');
    setPayments(paymentList.payments);
  } catch (error) {
    console.error('Error loading payments:', error);
  }
};

const navigateToSettings = () => {
  dispatchNavigate('Settings');
  dispatchNavigate('Settings');
};

const onScanButtonPressed = () => {
  scanQrHelper(navigate, routeName).then(onBarScanned);
};

const loginClickHandler = () => {
  dispatchNavigate('LoginCoinOSScreen');
};

const handleRecoverSavingVault = () => {
  dispatchNavigate('RecoverSavingVault');
};

const handleRecoverSavingVault = () => {
  dispatchNavigate('RecoverSavingVault');
};

const onBarScanned = (value: any) => {
  if (!value) return;
  DeeplinkSchemaMatch.navigationRouteFor({ url: value }, completionValue => {
    triggerHapticFeedback(HapticFeedbackTypes.NotificationSuccess);
    navigate(...completionValue);
  });
  DeeplinkSchemaMatch.navigationRouteFor({ url: value }, completionValue => {
    triggerHapticFeedback(HapticFeedbackTypes.NotificationSuccess);
    navigate(...completionValue);
  });
};

const createChekingAccountClickHandler = () => {
  dispatchNavigate('CheckAccount');
  dispatchNavigate('CheckAccount');
};

const receiveClickHandler = () => {
  refRBSheet.current.open();
};

const sendClickHandler = () => {
  dispatchNavigate('SendScreen', { currency, matchedRate });
};

const checkingAccountClickHandler = () => {
  dispatchNavigate('CheckingAccount', { matchedRate });
};
  };

const withdrawClickHandler = () => {
  dispatchNavigate('SavingVaultIntro');
};
dispatchNavigate('WithdrawToSavingsVault');
  };
const handleCreateVault = () => {
  dispatchNavigate('SavingVaultIntro');

}


const topupClickHandler = () => {
  dispatchNavigate('PurchaseVault', {
    data: {}
  });
  const topupClickHandler = () => {
    dispatchNavigate('PurchaseVault', {
      data: {},
    });
  };

  const savingVaultClickHandler = () => {
    dispatchNavigate('HotStorageVault', { wallet, matchedRate });
  };

  const coldStorageClickHandler = () => {
    dispatchNavigate('ColdStorage');
  };

  const hotStorageClickHandler = () => {
    dispatchNavigate('SavingVaultIntroNew');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (wallet) {
      if (wallet) {
        await wallet?.fetchBalance();
      }
      handleUser()
    };


    const createWallet = async () => {
      setIsLoading(true);

      let w: HDSegwitBech32Wallet;
      // btc was selected
      // index 2 radio - hd bip84
      w = new HDSegwitBech32Wallet();
      w.setLabel(label || loc.wallets.details_title);

      await w.generate();
      addWallet(w);
      await saveToDisk();
      A(A.ENUM.CREATED_WALLET);
      triggerHapticFeedback(HapticFeedbackTypes.NotificationSuccess);
      if (w.type === HDSegwitP2SHWallet.type || w.type === HDSegwitBech32Wallet.type) {
        // @ts-ignore: Return later to update
        dispatchNavigate('SavingVaultIntro', {
          walletID: w.getID(),
        });
      }
    };

    console.log('calculatePercentage(Number(withdrawThreshold), (Number(reserveAmount))): ', calculateBalancePercentage(Number(balance), Number(withdrawThreshold), Number(reserveAmount)))
    handleUser();
  };

  console.log(withdrawThreshold, 'withdrawThreshold');
  console.log(reserveAmount, 'reserveAmount');
  return (
    <ScreenLayout
      RefreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
      disableScroll={!isAuth}
    >
      <ScreenLayout
        RefreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
        disableScroll={!isAuth}
      >
        <View style={styles.container}>
          <View>
            {isLoading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <>
                <View style={styles.title}>
                  <Text subHeader bold>
                    Total Balance
                  </Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.imageView} onPress={navigateToSettings}>
                      <Image style={styles.image} resizeMode="contain" source={require('../../../img/settings.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageViews} onPress={onScanButtonPressed}>
                      <Image style={styles.scan} resizeMode="contain" source={require('../../../img/scan-new.png')} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.shadowView}>
                  <Shadow style={styles.shadowTop} inner useArt>
                    <Text subHeader bold style={styles.price}>
                      {btc(1) * (balance || 0)} BTC
                    </Text>
                    <Text bold style={styles.priceusd}>
                      {'$' + convertedRate.toFixed(2)}
                    </Text>
                    <Shadow inner useArt style={styles.shadowBottom} />
                  </Shadow>
                </View>
              </>
            )}
            ) : (
            <>
              <View style={styles.title}>
                <Text subHeader bold>
                  Total Balance
                </Text>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.imageView} onPress={navigateToSettings}>
                    <Image style={styles.image} resizeMode="contain" source={require('../../../img/settings.png')} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageViews} onPress={onScanButtonPressed}>
                    <Image style={styles.scan} resizeMode="contain" source={require('../../../img/scan-new.png')} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.shadowView}>
                <Shadow style={styles.shadowTop} inner useArt>
                  <Text subHeader bold style={styles.price}>
                    {btc(1) * (balance || 0)} BTC
                  </Text>
                  <Text bold style={styles.priceusd}>
                    {'$' + convertedRate.toFixed(2)}
                  </Text>
                  <Shadow inner useArt style={styles.shadowBottom} />
                </Shadow>
              </View>
            </>
          )}
            {isAuth ? (
              <>
                <TouchableOpacity style={styles.shadowView} onPress={checkingAccountClickHandler}>
                  <Shadow style={StyleSheet.flatten([styles.shadowTop, { shadowColor: colors.pink.shadowTop, padding: 0 }])} inner useArt>
                    <Shadow style={StyleSheet.flatten([styles.shadowTop, { shadowColor: colors.pink.shadowTop, padding: 0 }])} inner useArt>
                      <View style={styles.view}>
                        <Text h2 bold style={styles.check}>
                          Checking Account
                        </Text>
                        <Image source={CoinOSSmall} style={styles.blink} resizeMode="contain" />
                        <Image source={CoinOSSmall} style={styles.blink} resizeMode="contain" />
                      </View>
                      <View style={styles.view}>
                        <Text h2 bold style={styles.sats}>
                          {balance} sats ~ {'$' + convertedRate.toFixed(2)}
                          {balance} sats ~ {'$' + convertedRate.toFixed(2)}
                        </Text>
                        <Text bold style={styles.totalsats}>
                          {formatNumber(Number(withdrawThreshold) + Number(reserveAmount))} sats
                        </Text>
                      </View>
                      <View>
                        <View style={styles.showLine} />
                        <View style={[styles.box, { left: `${calculatePercentage(Number(withdrawThreshold), Number(reserveAmount))}%` }]} />
                        <View style={[styles.box, { left: `${calculatePercentage(Number(withdrawThreshold), Number(reserveAmount))}%` }]} />
                        <LinearGradient
                          start={{ x: 0, y: 1 }}
                          end={{ x: 1, y: 1 }}
                          start={{ x: 0, y: 1 }}
                          end={{ x: 1, y: 1 }}
                          colors={[colors.white, colors.pink.dark]}
                          style={[
                            styles.linearGradient2,
                            { width: `${calculateBalancePercentage(Number(balance), Number(withdrawThreshold), Number(reserveAmount))}%` },
                          ]}
                        >
                          style={[
                            styles.linearGradient2,
                            { width: `${calculateBalancePercentage(Number(balance), Number(withdrawThreshold), Number(reserveAmount))}%` },
                          ]}
                    >
                          {/* <View style={[styles.box, {marginLeft: `${Math.min((withdrawThreshold / (Number(withdrawThreshold + reserveAmount) || 0)) * 100, 100)}%`}]} /> */}
                          {/* <Shadow
                          inner // <- enable inner shadow
                          useArt // <- set this prop to use non-native shadow on ios
                          style={styles.top2} >
                      </Shadow> */}
                        </LinearGradient>

                        {/* <View style={styles.showLine} /> */}
                        {/* <View style={[styles.box, {marginLeft: `${Math.min((balance / (Number(withdrawThreshold) || 0)) * 100, 100)}%`}]} />
                    </View> */}
                      </View>
                      <Shadow inner useArt style={StyleSheet.flatten([styles.shadowBottom, { shadowColor: colors.pink.shadowBottom }])} />
                      <Shadow inner useArt style={StyleSheet.flatten([styles.shadowBottom, { shadowColor: colors.pink.shadowBottom }])} />
                    </Shadow>
                </TouchableOpacity>
                <View style={styles.btnView}>
                  <GradientButtonWithShadow title="Receive" onPress={receiveClickHandler} isShadow isTextShadow />
                  <GradientButtonWithShadow title="Send" onPress={sendClickHandler} isShadow isTextShadow />
                  <GradientButtonWithShadow title="Receive" onPress={receiveClickHandler} isShadow isTextShadow />
                  <GradientButtonWithShadow title="Send" onPress={sendClickHandler} isShadow isTextShadow />
                </View>
                {!isLoading &&
                  (calculatePercentage(balance, reserveAmount) == 100 ? (
                    (calculatePercentage(balance, reserveAmount) == 100 ? (
                      <Text h4 style={styles.alert}>
                        Congrats, your balance is large enough to be materialized! You can take full self-custody of your money by withdrawing a
                        Bitcoin ‘capsule’ from your checking account. Click ‘Create Vault’ to learn more!
                        Congrats, your balance is large enough to be materialized! You can take full self-custody of your money by withdrawing a
                        Bitcoin ‘capsule’ from your checking account. Click ‘Create Vault’ to learn more!
                        {/* You can receive, send, and accumulate bitcoin using your Checking Account. New security features will be revealed once you meet the withdrawal threshold at 2 million sats */}
                      </Text>
                    ) : Number(balance) === Number(withdrawThreshold + reserveAmount) ? (
                      <Text h4 style={StyleSheet.flatten([styles.alert, { color: colors.green }])}>
                        Congrats, your balance is large enough to be materialized! You can take full self-custody of your money by withdrawing a
                        Bitcoin ‘capsule’ from your checking account. Click ‘Create Vault’ to learn more!
                      </Text>
                    ) : (
                      <Text h4 style={styles.alertGrey}>
                        New security upgrades will be revealed once you meet fill up the bar displayed on your Checking Account.
                      </Text>
                    ))}
                ) : Number(balance) === Number(withdrawThreshold + reserveAmount) ? (
                <Text h4 style={StyleSheet.flatten([styles.alert, { color: colors.green }])}>
                  Congrats, your balance is large enough to be materialized! You can take full self-custody of your money by withdrawing a
                  Bitcoin ‘capsule’ from your checking account. Click ‘Create Vault’ to learn more!
                </Text>
                ) : (
                <Text h4 style={styles.alertGrey}>
                  New security upgrades will be revealed once you meet fill up the bar displayed on your Checking Account.
                </Text>
                ))}
                <View style={styles.bottom}>
                  <View style={styles.bottominner}>
                    {isAllDone &&
                      { isAllDone &&
                      <GradientView
                        onPress={topupClickHandler}
                        topShadowStyle={styles.outerShadowStyle}
                        bottomShadowStyle={styles.innerShadowStyle}
                        style={styles.linearGradientStyle}
                        linearGradientStyle={styles.mainShadowStyle}
                      >
                        <Image style={styles.arrowLeft} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                        <Text bold h3 center style={{ marginStart: 20 }}>
                          Top-up
                        </Text>
                        <Image style={styles.arrowLeft} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                        <Text bold h3 center style={{ marginStart: 20 }}>
                          Top-up
                        </Text>
                      </GradientView>
                    }
                    {isAllDone &&
                  }
                    {isAllDone &&
                      <GradientView
                        onPress={withdrawClickHandler}
                        topShadowStyle={styles.outerShadowStyle}
                        bottomShadowStyle={styles.innerShadowStyle}
                        style={styles.linearGradientStyle}
                        linearGradientStyle={styles.mainShadowStyle}
                      >
                        <Text bold h3 center style={{ marginEnd: 20 }}>
                          Withdraw
                        </Text>
                        <Image style={styles.arrowRight} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                        <Text bold h3 center style={{ marginEnd: 20 }}>
                          Withdraw
                        </Text>
                        <Image style={styles.arrowRight} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                      </GradientView>
                    }
                  </View>
                  {isAllDone &&
                    { isAllDone &&
                    <SavingVault
                      container={StyleSheet.flatten([styles.savingVault, { marginTop: 10 }])}
                      innerContainer={styles.savingVault}
                      shadowTopBottom={styles.savingVault}
                      shadowBottomBottom={styles.savingVault}
                      bitcoinText={styles.bitcoinText}
                      onPress={savingVaultClickHandler}
                      bitcoinValue={balanceVault}
                      inDollars={`$${(Number(balanceWithoutSuffix) * Number(matchedRate)).toFixed(2)}`}
                      isColorable
                    />
                  }
                  {isAllDone &&
                    <View style={[styles.container3, { opacity: isAllDone ? 1 : 0.5 }]}>
                      <GradientCard colors_={['#464D6854', '#FFF']} style={styles.container2} linearStyle={styles.main}>
                        <View style={styles.container4}>
                          {!isAllDone ? (
                            <Text h3 bold style={styles.storageText} onPress={hotStorageClickHandler}>
                              Hot Storage
                            </Text>
                          ) : (
                            <View style={styles.bottomBtn}>
                              <LinearGradient
                                start={{ x: 1, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                locations={[0.25, 1]}
                                colors={['#333333', '#282727']}
                                style={styles.linearGradientbottom}
                              >
                                <Text h3 bold style={{ color: '#FD7A68' }} onPress={hotStorageClickHandler}>
                                  Hot Storage
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                          {isAllDone || isWithdraw ? (
                            <Text h3 bold style={styles.storageText} onPress={coldStorageClickHandler}>
                              Cold Storage
                            </Text>
                          ) : (
                            <View style={[styles.bottomBtn, { marginEnd: 7.5, marginStart: 0 }]}>
                              <LinearGradient
                                start={{ x: 1, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                locations={[0.25, 1]}
                                colors={!isAllDone ? [colors.gray.light, colors.gray.light] : ['#333333', '#282727']}
                                style={styles.linearGradientbottom}
                              >
                                <Text h3 bold onPress={hotStorageClickHandler}>
                                  Cold Storage
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                        </View>
                      </GradientCard>
                      {isAllDone && (
                        <View style={styles.circle}>
                          <Image style={styles.arrow2} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                          <Image style={styles.arrow3} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                        </View>
                      )}
                    </View>


                  }
                }
                  {isAllDone &&
                    <View style={[styles.container3, { opacity: isAllDone ? 1 : 0.5 }]}>
                      <GradientCard colors_={['#464D6854', '#FFF']} style={styles.container2} linearStyle={styles.main}>
                        <View style={styles.container4}>
                          {!isAllDone ? (
                            <Text h3 bold style={styles.storageText} onPress={hotStorageClickHandler}>
                              Hot Storage
                            </Text>
                          ) : (
                            <View style={styles.bottomBtn}>
                              <LinearGradient
                                start={{ x: 1, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                locations={[0.25, 1]}
                                colors={['#333333', '#282727']}
                                style={styles.linearGradientbottom}
                              >
                                <Text h3 bold style={{ color: '#FD7A68' }} onPress={hotStorageClickHandler}>
                                  Hot Storage
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                          {isAllDone || isWithdraw ? (
                            <Text h3 bold style={styles.storageText} onPress={coldStorageClickHandler}>
                              Cold Storage
                            </Text>
                          ) : (
                            <View style={[styles.bottomBtn, { marginEnd: 7.5, marginStart: 0 }]}>
                              <LinearGradient
                                start={{ x: 1, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                locations={[0.25, 1]}
                                colors={!isAllDone ? [colors.gray.light, colors.gray.light] : ['#333333', '#282727']}
                                style={styles.linearGradientbottom}
                              >
                                <Text h3 bold onPress={hotStorageClickHandler}>
                                  Cold Storage
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                        </View>
                      </GradientCard>
                      {isAllDone && (
                        <View style={styles.circle}>
                          <Image style={styles.arrow2} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                          <Image style={styles.arrow3} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                        </View>
                      )}
                    </View>


                  }
                </View>
              </>
            ) : (
              <>
                <GradientCardWithShadow style={styles.createView} onPress={createChekingAccountClickHandler}>
                  <GradientCardWithShadow style={styles.createView} onPress={createChekingAccountClickHandler}>
                    <View style={styles.middle}>
                      <Image style={styles.arrow} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                      <Image style={styles.arrow} resizeMode="contain" source={require('../../../img/arrow-right.png')} />
                      <Text h2 style={styles.shadow}>
                        Create Your Checking Account
                      </Text>
                    </View>
                  </GradientCardWithShadow>
                  <View style={styles.alreadyView}>
                    <Text bold style={styles.text}>
                      Already have an account?
                    </Text>
                    <TouchableOpacity onPress={loginClickHandler}>
                      <Text bold style={styles.login}>
                        Login
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.createVaultContainer}>
                    <TouchableOpacity
                      onPress={handleCreateVault}
                    >
                      <LinearGradient
                        colors={['#1E1E1E', '#6D6D6D']}
                        start={{ x: 0, y: -0.1 }}
                        end={{ x: 0, y: 2 }}
                        locations={[0, 1]}
                        style={styles.createVault}>
                        <Text h3 style={styles.advancedText}>⚠  Advanced</Text>
                        <Text h2 style={styles.createVaultText}>
                          Create Vault
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <View style={styles.alreadyView}>
                      <Text bold style={styles.text}>
                        Already have a vault?
                      </Text>
                      <TouchableOpacity onPress={handleRecoverSavingVault}>
                        <Text bold style={[styles.login, { color: colors.green }]}>
                          Recover
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.createVaultContainer}>
                    <TouchableOpacity
                      onPress={handleCreateVault}
                    >
                      <LinearGradient
                        colors={['#1E1E1E', '#6D6D6D']}
                        start={{ x: 0, y: -0.1 }}
                        end={{ x: 0, y: 2 }}
                        locations={[0, 1]}
                        style={styles.createVault}>
                        <Text h3 style={styles.advancedText}>⚠  Advanced</Text>
                        <Text h2 style={styles.createVaultText}>
                          Create Vault
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <View style={styles.alreadyView}>
                      <Text bold style={styles.text}>
                        Already have a vault?
                      </Text>
                      <TouchableOpacity onPress={handleRecoverSavingVault}>
                        <Text bold style={[styles.login, { color: colors.green }]}>
                          Recover
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
          )}
              </View>
          </View>
          <RBSheet
            ref={refRBSheet}
            customStyles={{
              wrapper: {
                backgroundColor: 'transparent',
              },
              draggableIcon: {
                backgroundColor: 'red',
              },
              container: {
                height: heights / 2 + 80,
              },
            },
        }}
          customModalProps={{
            animationType: 'slide',
            statusBarTranslucent: true,
          }}
          customAvoidingViewProps={{
            enabled: false,
          }}
      >
          <ReceivedList refRBSheet={refRBSheet} matchedRate={matchedRate} currency={currency} />
        </RBSheet>
      </ScreenLayout>
      );
}