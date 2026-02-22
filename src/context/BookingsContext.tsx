import React, { createContext, useContext, useState } from "react";
import { Booking } from "@/types";
import { MOCK_BOOKINGS } from "@/data/mockData";

interface BookingsContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
}

const BookingsContext = createContext<BookingsContextType>({
  bookings: [],
  addBooking: () => {},
});

export const useBookings = () => useContext(BookingsContext);

export const BookingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  };

  return (
    <BookingsContext.Provider value={{ bookings, addBooking }}>
      {children}
    </BookingsContext.Provider>
  );
};
