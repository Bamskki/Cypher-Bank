import React, { useCallback, useContext, useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import * as NavigationService from '../NavigationService';
import { CommonActions } from '@react-navigation/native';
import { BlueStorageContext } from '../blue_modules/storage-context';

/* 
Component for iPadOS and macOS menu items with keyboard shortcuts. 
EventEmitter on the native side should receive a payload and rebuild menus.
*/

const eventEmitter = Platform.OS === 'ios' || Platform.OS === 'macos' ? new NativeEventEmitter(NativeModules.EventEmitter) : undefined;
const MenuElements = () => {
  const { walletsInitialized } = useContext(BlueStorageContext);

  // BlueWallet -> Settings
  const openSettings = useCallback(() => {
    dispatchNavigate('Settings');
  }, []);

  // File -> Add Wallet
  const addWalletMenuAction = useCallback(() => {
    dispatchNavigate('AddWalletRoot');
  }, []);

  const dispatchNavigate = (routeName: string) => {
    NavigationService.dispatch(
      CommonActions.navigate({
        name: routeName,
      }),
    );
  };

  useEffect(() => {
    console.log('MenuElements: useEffect');
    if (walletsInitialized) {
      eventEmitter?.addListener('openSettings', openSettings);
      eventEmitter?.addListener('addWalletMenuAction', addWalletMenuAction);
    }
    return () => {
      eventEmitter?.removeAllListeners('openSettings');
      eventEmitter?.removeAllListeners('addWalletMenuAction');
    };
  }, [addWalletMenuAction, openSettings, walletsInitialized]);

  return <></>;
};

export default MenuElements;
