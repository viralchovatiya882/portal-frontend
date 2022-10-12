import React, { useEffect, useState } from "react";
import { compose, withProps } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, Marker} from "react-google-maps";

const MyMapComponent = compose(
    withProps({
        googleMapURL:
        "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places",
        loadingElement: <div style={{ height: "100%" }} />,
        containerElement: <div style={{ height: "400px" }} />,
        mapElement: <div style={{ height: "100%" }} />
    }),withScriptjs,withGoogleMap)
    (props => {
        return (
            <GoogleMap
                onClick={e => {if(props?.draggableState) props?.getCoordsFromMaps(e)}}
                defaultZoom={props?.coordsChanged === true ? 9 : 3}
                zoom={props?.coordsChanged === true ? 9 : 3}
                defaultCenter={{ lat: props?.mapsCoords?.lat || 42.15613343, lng: props?.mapsCoords?.lng || -87.80298683 }}
                center={{ lat: props?.mapsCoords?.lat || 42.15613343, lng: props?.mapsCoords?.lng || -87.80298683 }}
            >
            <Marker
                draggable={props?.draggableState}
                onDragEnd={e => props?.getCoordsFromMaps(e)}
                position={{ lat: props?.mapsCoords?.lat, lng: props?.mapsCoords?.lng }}
                onClick={props.onMarkerClick}
              />
            </GoogleMap>
        )
    });

const LocationMarker = (props) => {
    const { callBackGetCoords, draggableState, latlong } = props
    const [coordsChanged, setCoordsChanged] = useState(false)
    const [mapsCoords, setMapsCoords] = useState(latlong)

    const handleMarkerClick = () => {
        // if req show infowindow;
        console.log("marker Clicked")
    };

    const getCoordsFromMaps = (e) => {
        let obj = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        }
        setMapsCoords(obj)
        callBackGetCoords(obj)
        setCoordsChanged(true)
    }

    useEffect(() => {
        setMapsCoords(latlong)
    }, [latlong])

    return (
        <MyMapComponent
            coordsChanged={coordsChanged}
            mapsCoords={mapsCoords}
            getCoordsFromMaps={getCoordsFromMaps}
            onMarkerClick={handleMarkerClick}
            draggableState={draggableState}
        />
    );
}

export default LocationMarker;
