import { create } from "zustand";

interface FileData {
  receiverId: string;
  files: string[];
}

interface FileStore {
  filesPerUser: FileData[];
  initialized: boolean;
  setFilesForUser: (receiverId: string, files: string[]) => void;
  getFilesForUser: (receiverId: string) => string[];
  clearFilesForUser: (receiverId: string) => void;
}

const useFileStore = create<FileStore>((set, get) => ({
  filesPerUser: [],
  initialized: false,
  
  setFilesForUser: (receiverId: string, files: string[]) => 
    set((state) => {
      const existingIndex = state.filesPerUser.findIndex(
        (data) => data.receiverId === receiverId
      );
      
      if (existingIndex >= 0) {
        const newFilesPerUser = [...state.filesPerUser];
        newFilesPerUser[existingIndex] = { receiverId, files };
        return { filesPerUser: newFilesPerUser };
      }
      
      return {
        filesPerUser: [...state.filesPerUser, { receiverId, files }]
      };
    }),
    
  getFilesForUser: (receiverId: string) => {
    const userData = get().filesPerUser.find(
      (data) => data.receiverId === receiverId
    );
    return userData?.files || [];
  },
  
  clearFilesForUser: (receiverId: string) =>
    set((state) => ({
      filesPerUser: state.filesPerUser.filter(
        (data) => data.receiverId !== receiverId
      )
    }))
}));

export default useFileStore;