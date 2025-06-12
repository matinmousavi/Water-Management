import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

import Layouts from '../layouts/Layouts'
import Loading from '../components/Loading/Loading'

const AdminRoutes = lazy(() => import('./AdminRoutes'))
const IrrigatorRoutes = lazy(() => import('./IrrigatorRoutes'))
const LandOwnerRoutes = lazy(() => import('./LandOwnerRoutes'))

const PanelRoutes = () => {
	const { isAdmin, isIrrigator, isLandOwner } = useUser()

	return (
		<>
			<Suspense fallback={<Loading />}>
				{isAdmin && <AdminRoutes />}

				{isIrrigator && <IrrigatorRoutes />}

				{isLandOwner && <LandOwnerRoutes />}
			</Suspense>
		</>
	)
}

export default PanelRoutes
