import { useSelector, useDispatch } from "react-redux";
import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    InfoWindow,
    useJsApiLoader
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { mapListAction } from "../store/store";
import css from "../styles/MapOverlay.module.css";

const containerStyle = {
    width: "100%",
    height: "100%"
};

const MapOverlay = () => {
    const dispatch = useDispatch();
    const { stores, showRoutes } = useSelector((s) => s.mapList);

    const [currentPos, setCurrentPos] = useState(null);
    const [directions, setDirections] = useState(null);
    const [activeStore, setActiveStore] = useState(null);

    // --------------------------------
    // Load Google Maps
    // --------------------------------
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY
    });



    // --------------------------------
    // Get current location
    // --------------------------------
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCurrentPos({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            () => {
                setCurrentPos({ lat: 19.076, lng: 72.8777 });
            }
        );
    }, []);

    // --------------------------------
    // ROUTE LOGIC
    // --------------------------------
    useEffect(() => {
        if (!isLoaded || !showRoutes || !currentPos) return;

        const service = new window.google.maps.DirectionsService();

        // single store
        if (stores.length === 1) {
            const s = stores[0];

            service.route(
                {
                    origin: currentPos,
                    destination: {
                        lat: s.latitude,
                        lng: s.longitude
                    },
                    travelMode: "DRIVING"
                },
                (res, status) => {
                    console.log("Route:", status);
                    if (status === "OK") setDirections(res);
                }
            );
            return;
        }

        // multiple
        const waypoints = stores.slice(0, -1).map((s) => ({
            location: {
                lat: s.latitude,
                lng: s.longitude
            }
        }));

        const last = stores[stores.length - 1];

        service.route(
            {
                origin: currentPos,
                destination: {
                    lat: last.latitude,
                    lng: last.longitude
                },
                waypoints,
                optimizeWaypoints: true,
                travelMode: "DRIVING"
            },
            (res, status) => {
                console.log("Route:", status);
                if (status === "OK") setDirections(res);
            }
        );
    }, [isLoaded, showRoutes, currentPos, stores]);

    // --------------------------------
    // Close map
    // --------------------------------
    const closeMap = () => {
        dispatch(mapListAction.setStores([]));
        dispatch(mapListAction.setShowRoutes(false));
    };

    if (!isLoaded || !currentPos) return null;
    // --------------------------------
    // If empty → hide overlay
    // --------------------------------
    if (!stores || stores.length === 0) return null;

    // --------------------------------
    // UI
    // --------------------------------
    return (
        <div className={css.background}>
            <div className={css.mapContainer}>

                <button className={css.closeBtn} onClick={closeMap}>
                    ✕
                </button>

                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={currentPos}
                    zoom={12}
                >
                    {/* YOU */}
                    <Marker position={currentPos} label="You" />

                    {/* STORES */}
                    {stores.map((s, i) => (
                        <Marker
                            key={s.id}
                            position={{ lat: s.latitude, lng: s.longitude }}
                            label={`${i + 1}`}
                            title={s.name}
                            onClick={() => setActiveStore(s)}
                        />
                    ))}

                    {/* STORE NAME POPUP */}
                    {activeStore && (
                        <InfoWindow
                            position={{
                                lat: activeStore.latitude,
                                lng: activeStore.longitude
                            }}
                            onCloseClick={() => setActiveStore(null)}
                        >
                            <div style={{ fontWeight: "600" }}>
                                {activeStore.name}
                            </div>
                        </InfoWindow>
                    )}

                    {/* ROUTE LINES */}
                    {directions && (
                        <DirectionsRenderer
                            directions={directions}
                            options={{
                                polylineOptions: {
                                    strokeColor: "#6C5CE7",
                                    strokeWeight: 5
                                }
                            }}
                        />
                    )}
                </GoogleMap>
            </div>
        </div>
    );
};

export default MapOverlay;
