import { lazy, Suspense } from 'react'
import { useUser } from '../contexts/UserContext'

import Loading from '../components/common/Loading/Loading'

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
