/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import { View, Text } from 'react-native'
import React from 'react'
import AppNavigation from './src/navigation/AppNavigation'

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <AppNavigation />
    </View>
  )
}

export default App