import React, { useRef, useEffect } from 'react';
import { VehicleAlert } from '../types';

declare const google: any;

interface MapProps {
    alerts: VehicleAlert[];
}

export const Map: React.FC<MapProps> = ({ alerts }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<any[]>([]);

    useEffect(() => {
        if (!mapRef.current || typeof google === 'undefined') return;

        const map = new google.maps.Map(mapRef.current, {
            center: { lat: 4.5709, lng: -74.2973 },
            zoom: 5,
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
                { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
                { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
                { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
            ],
        });

        // Clear old markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        const infowindow = new google.maps.InfoWindow();
        const bounds = new google.maps.LatLngBounds();
        let markersCreated = 0;

        alerts.forEach(alert => {
            const coords = alert.localidad.split(',').map(c => parseFloat(c.trim()));
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                const [lat, lng] = coords;
                const position = { lat, lng };
                
                const marker = new google.maps.Marker({
                    position,
                    map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 5,
                        fillColor: alert.velocidad >= 80 ? '#F87171' : '#FBBF24',
                        fillOpacity: 0.8,
                        strokeWeight: 0
                    }
                });

                marker.addListener('click', () => {
                    const content = `
                        <div style="color: #1a202c; font-family: sans-serif; padding: 8px;">
                            <h3 style="font-weight: 700; margin: 0 0 8px;">${alert.placa}</h3>
                            <p style="margin: 0 0 4px;"><strong>Velocidad:</strong> ${alert.velocidad} km/h</p>
                            <p style="margin: 0;"><strong>Fecha:</strong> ${alert.fechaHora}</p>
                        </div>`;
                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                });
                markersRef.current.push(marker);
                bounds.extend(position);
                markersCreated++;
            }
        });
        
        if (markersCreated > 0) {
            map.fitBounds(bounds);
            if (map.getZoom() > 15) {
              map.setZoom(15);
            }
        }

    }, [alerts]);

    return <div ref={mapRef} style={{ width: '100%', height: '400px', minHeight: '100%' }} />;
};
