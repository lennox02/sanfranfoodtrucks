import {useEffect, useState} from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { readRemoteFile } from 'react-native-csv';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

// NOTE: Neither GeoLocation form react-native-community or userLocation from react-native-maps 
// works in snack.expo.dev because you cannot access the permissions feature (because it's a sandbox)

//import Geolocation from '@react-native-community/geolocation';

const currTime = (new Date()).getTime();

export default function App() {
  const [data, setData] = useState({d: [], radius: []});
  //can't store lat/lon as floats in useState, so must save them as strings
  const [latLon, setLatLon] = useState(["37.784172", "-122.401558"]);


  //get data on load from either API or Disk
  useEffect(() => {

    // Can't be used in snack.expo.dev
    /************************************************
    //get current location (defaults to Moscone Center)
    Geolocation.getCurrentPosition((pos) => {
      setLatLon([pos.coords.latitude + "", pos.coords.longitude + ""])
    }).catch((err) => {
      console.log("ERROR from Geolocation: ", err);
    });
    ************************************************/

    //wrap in async function so we can wait for AsyncStorage
    async function fetchData() {
      let lastChecked = await AsyncStorage.getItem('last_checked');
      let savedData = await AsyncStorage.getItem('saved_data');

      //check if it's been more than a day since we last retrieved the csv
      if(lastChecked === null || Math.abs(currTime - parseInt(lastChecked)) > 86400000){

        readRemoteFile(
          'https://data.sfgov.org/api/views/rqzj-sfat/rows.csv',
          {
            complete: (results) => {
              let d = results.data;
              //remove header
              d.shift();

              const processed = processRadius(d);
              setData(processed);

              //update data and last checked on success
              AsyncStorage.setItem('last_checked', currTime + "");
              AsyncStorage.setItem('saved_data', JSON.stringify(processed));
            },
            error: (err) => {
              console.log("ERROR from react-native-csv: ", err);
              setData(JSON.parse(savedData));
            }
          }
        );

      } else {
        
        setData(JSON.parse(savedData));

      }

    }

    fetchData();

  }, []);



  //re-process radius if the current position changes
  useEffect(() => {
    setData(processRadius(data.d));
  }, [latLon]);



  //get only the foodtrucks within a 0.005 radius of the current location
  function processRadius(d) {
    let radius = [];

    const userLat = parseFloat(latLon[0]);
    const userLon = parseFloat(latLon[1]);

    for(let i = 0; i <d.length; i++) {
      let lat = parseFloat(d[i][14]);
      let lon = parseFloat(d[i][15]);

      if(
        Math.abs(lat - userLat) < 0.005 && 
        Math.abs(Math.abs(lon) - Math.abs(userLon)) < 0.005
      ) {
        radius.push({coordinate: {latitude: lat, longitude: lon}, title: d[i][1] + " (" + d[i][2] + ")", desc: "Menu: " + d[i][16]});
      }
    }

    return {d: d, radius: radius};
  }



  return (
    <SafeAreaView style={styles.container}>
      <MapView
        moveOnMarkerPress={false}
        style={styles.mapContainer}
        initialRegion={{
          latitude: parseFloat(latLon[0]),
          longitude: parseFloat(latLon[1]),
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        onRegionChangeComplete={region => {
          setLatLon([region.latitude, region.longitude]);
        }}
      > 
        {data.radius.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.desc}
            style={{height: 60}}
          />
        ))}
      </MapView>
    </SafeAreaView>
  );
}



//styles to position the map
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  mapContainer: {
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0
  },
});
