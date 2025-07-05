import { createContext, useContext, useEffect, useState } from 'react'

const IrrigationTimerContext = createContext()
const DURATION = 7200

export const IrrigationTimerProvider = ({ children }) => {
	const [elapsedTime, setElapsedTime] = useState(DURATION)
	const [isIrrigating, setIsIrrigating] = useState(false)
	const [startTimestamp, setStartTimestamp] = useState(null)
	const [landID, setLandID] = useState(null)

	useEffect(() => {
		const storedStart = localStorage.getItem('irrigation_start')
		const storedLand = localStorage.getItem('irrigation_land')

		if (storedStart && storedLand) {
			const start = parseInt(storedStart, 10)
			const now = Date.now()
			const elapsed = Math.floor((now - start) / 1000)
			const remaining = DURATION - elapsed

			if (remaining > 0) {
				setElapsedTime(remaining)
				setStartTimestamp(start)
				setLandID(storedLand)
				setIsIrrigating(true)
			} else {
				stopIrrigation()
			}
		}
	}, [])

	useEffect(() => {
		let interval
		if (isIrrigating) {
			interval = setInterval(() => {
				setElapsedTime(prev => {
					if (prev <= 1) {
						stopIrrigation()
						return 0
					}
					return prev - 1
				})
			}, 1000)
		}
		return () => clearInterval(interval)
	}, [isIrrigating])

	const startIrrigation = landIdParam => {
		const now = Date.now()
		setStartTimestamp(now)
		setElapsedTime(DURATION)
		setLandID(landIdParam)
		setIsIrrigating(true)
		localStorage.setItem('irrigation_start', now.toString())
		localStorage.setItem('irrigation_land', landIdParam)
	}

	const stopIrrigation = () => {
		setElapsedTime(DURATION)
		setIsIrrigating(false)
		setStartTimestamp(null)
		setLandID(null)
		localStorage.removeItem('irrigation_start')
		localStorage.removeItem('irrigation_land')
	}

	return (
		<IrrigationTimerContext.Provider value={{ elapsedTime, isIrrigating, startIrrigation, stopIrrigation, landID }}>
			{children}
		</IrrigationTimerContext.Provider>
	)
}

export const useIrrigationTimer = () => useContext(IrrigationTimerContext)
export default IrrigationTimerProvider
