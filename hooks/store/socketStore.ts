import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

interface SocketStore {
  socket: Socket | null
  initializeSocket: () => Promise<void>
  disconnectSocket: () => void
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,

  initializeSocket: async () => {
    // Desconectar socket existente si hay uno
    const currentSocket = get().socket
    if (currentSocket) {
      currentSocket.disconnect()
    }

    const userId = await SecureStore.getItemAsync("USER_ID")
    
    const newSocket = io(process.env.EXPO_PUBLIC_API_URL, {
      query: { 
        userId: Number(userId) 
      }
    })

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    set({ socket: newSocket })
  },

  disconnectSocket: () => {
    const currentSocket = get().socket
    if (currentSocket) {
      currentSocket.disconnect()
      set({ socket: null })
    }
  }
}))

// Hook opcional para componentes que necesiten el socket
export const useSocket = () => {
  const socket = useSocketStore((state) => state.socket)
  return socket
}