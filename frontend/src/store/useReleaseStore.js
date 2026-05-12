import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useReleaseStore = create(
  persist(
    (set, get) => ({
      step: 1,
      releaseData: {
        title: '',
        primaryArtist: '',
        coverImage: null,
        tracks: [],
        genre: '',
        releaseDate: null,
        splits: [],
      },
      
      setStep: (step) => set({ step }),
      
      updateReleaseData: (data) => set((state) => ({
        releaseData: { ...state.releaseData, ...data }
      })),
      
      resetRelease: () => set({
        step: 1,
        releaseData: {
          title: '',
          primaryArtist: '',
          coverImage: null,
          tracks: [],
          genre: '',
          releaseDate: null,
          splits: [],
        }
      }),

      validateStep: (step) => {
        const { releaseData } = get();
        switch (step) {
          case 1: return !!releaseData.title;
          case 2: return !!releaseData.coverImage;
          // Agregar validaciones para el resto de pasos
          default: return true;
        }
      }
    }),
    {
      name: 'zonyd-release-storage',
      storage: createJSONStorage(() => sessionStorage), // Persistencia en sesión para evitar pérdida por recarga
    }
  )
);
