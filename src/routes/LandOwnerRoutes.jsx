import { Route, Routes } from 'react-router-dom'

import Layouts from '../layouts/Layouts'

import Dashboard from '../pages/shared/Dashboard/Dashboard'
import Land from '../pages/shared/Land/Land'
import Well from '../pages/shared/Well/Well'
import Lands from '../pages/shared/Lands/Lands'

const LandOwnerRoutes = () => (
	<Routes>
		<Route element={<Layouts />}>
			<Route index element={<Dashboard />} />

			<Route path='lands'>
				<Route index element={<Lands />} />
				<Route path=':landId' element={<Land />} />
			</Route>

			<Route path='wells'>
				<Route path=':wellId' element={<Well />} />
			</Route>
		</Route>
	</Routes>
)

export default LandOwnerRoutes
