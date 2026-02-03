import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const OnboardingScreen = () => {
  return (
    <View style={styles.container}>
      <Text>I am on the onboarding page</Text>
    </View>
  )
}

export default OnboardingScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});