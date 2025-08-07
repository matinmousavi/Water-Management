import { createContext, useContext } from 'react'

const WellContext = createContext()

export const WellProvider = ({ value, children }) => {
	return <WellContext.Provider value={value}>{children}</WellContext.Provider>
}

export const useWell = () => useContext(WellContext)
