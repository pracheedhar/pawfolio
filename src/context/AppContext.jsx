import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Ocean',
    avatar: 'https://i1-e.pinimg.com/1200x/2b/6f/87/2b6f8700f08024520fff07d1e2ddd3a2.jpg',
  });

  const [cart, setCart] = useState([]);

  return (
    <AppContext.Provider value={{ user, setUser, cart, setCart }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
