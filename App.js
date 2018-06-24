import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import moment from 'moment'
import haversine from 'haversine'

const geoOptions = {
  enableHighAccuracy   : true, 
  maximumAge           : 750, 
  timeout              : 500,
  distanceFilter       : 1,
  useSignificantChanges: false // currently only impacts ios
}

const calculateDistanceTravelled = (totalDistance, prevLatLng, newLatLng) => {
  if (!prevLatLng) {
    return 0
  }
  return (haversine(prevLatLng, newLatLng, {unit: 'meter'}) || 0) + totalDistance
}

const onNewCoords = (position, distanceTravelled, prevLatLng) => {
  console.log("Position changed!", position)        
  const newLatLng  = {
    latitude: position.coords.latitude, 
    longitude: position.coords.longitude
  }
  return {
    coords: position.coords,
    distanceTravelled: calculateDistanceTravelled(
      distanceTravelled, prevLatLng, newLatLng),
    prevLatLng: newLatLng,
    speed: position.coords.speed,
    error: null
  }
}

const Distance = ({totalDistance}) => 
  <View>
    {totalDistance > 0 && (
      <Text>Distance: {Math.round(totalDistance)}m </Text>
    )}
  </View>

const LatLong = ({coords,timestamp,speed}) => 
      <View style={styles.coordContainer}>
        <Text style={styles.coord}>Lat: {coords.latitude} Long: {coords.longitude}</Text>
        <Text style={styles.coord}>Speed: {speed}</Text>
        <Text>Updated at {moment(timestamp).format("HH:mm:ss")}</Text>
      </View>

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      coords: {},
      distanceTravelled: 0,
      prevLatLng: null,
      error: null,
      speed: 0
    }
    this.getPosition = this.getPosition.bind(this)
    this.onGeoError = this.onGeoError.bind(this)
  }

  componentDidMount() {
    this.getPosition()    
    this.watchID = navigator.geolocation.watchPosition(position => {
      console.log("##OnWatchPosition##")
      this.setState(onNewCoords(position, this.state.distanceTravelled, this.state.prevLatLng))
    }, this.onGeoError, geoOptions)
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  onGeoError(error) {
    console.log("Failed to retrieve location." + error)
    this.setState({
      error: "Failed to retrieve location." + error
    })
  }
  getPosition() {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState(onNewCoords(position, this.state.distanceTravelled, this.state.prevLatLng))  
       }, this.onGeoError, geoOptions)
    const timer = setTimeout(() =>  {
        this.getPosition()
    }, 5000)
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.viewText}>Position:</Text>
        <LatLong coords={this.state.coords} speed={this.state.speed} timestamp={this.state.timestamp} />
        <Distance totalDistance={this.state.distanceTravelled}></Distance>
        <Errors error={this.state.error} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  coordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 32,
    alignItems: 'center',
  },
  
  viewText: {
    fontSize: 24,
    marginBottom: 12
  },

  coord: {
    marginBottom: 12,
    fontSize: 20
  }
})

const Errors = ({error}) => 
    <View>
      {error && (
        <Text style={stylesError.error}>ERROR {error}</Text>
      )}
    </View>

const stylesError = StyleSheet.create({
  error: {
      color: "red",
      marginTop: 24
  }
})