import { io } from 'socket.io-client'
import { createContext, useContext, useEffect} from 'react';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = io('http://localhost:5100')
  useEffect(() => {
    return () => {
      socket.disconnect();
    }
  })
  return(
    <SocketContext.Provider value={SocketContext}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  return useContext(SocketContext);
}