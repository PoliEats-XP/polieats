import { create } from 'zustand'

interface EditingStoreState {
	isEditing: boolean
	setIsEditing: (isEditing: boolean) => void
}

export const useStore = create<EditingStoreState>((set) => ({
	isEditing: false,
	setIsEditing: (isEditing: boolean) => set({ isEditing }),
}))
