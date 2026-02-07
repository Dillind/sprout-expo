import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SignInScreen = () => {
  return (
    <View style={styles.container}>
      <Text>I am on the sign in page</Text>
    </View>
  )
}

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});