import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const Home = () => {
  return (
    <View style={styles.container}>
      <Text>I am on the home page</Text>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});