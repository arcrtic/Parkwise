// ParkingSlots.js
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const ParkingSlots = () => {
    const [slots, setSlots] = useState([]);

    // Fetch parking slots from the database
    const fetchSlots = async () => {
        const { data, error } = await supabase
            .from('parking_slots') // Use your exact table name here
            .select('*');
        if (error) console.error('Fetch Error:', error);
        else setSlots(data);
    };

    useEffect(() => {
        // Initial data fetch
        fetchSlots();

        // Real-time subscription to changes in the 'parking_slots' table
        const subscription = supabase
            .channel('realtime:parking_slots') // Create a real-time channel
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'parking_slots' }, 
                (payload) => {
                    console.log('Real-time Update:', payload);
                    fetchSlots(); // Refresh data when there's an update
                }
            )
            .subscribe();

        // Cleanup subscription when the component unmounts
        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <div>
            <h1>Parking Slots Status</h1>
            <ul>
                {slots.map((slot) => (
                    <li key={slot.id}>
                        Slot {slot.id}: {slot.occupied ? 'Occupied' : 'Available'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParkingSlots;