import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const MyGarden = () => {
  return (
    <View style={styles.container}>
      <Text>I am on the my garden page</Text>
    </View>
  )
}

export default MyGarden

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});