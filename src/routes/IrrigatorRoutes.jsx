import { Route, Routes } from 'react-router-dom'

import Layouts from '../layouts/Layouts'
import Land from '../pages/shared/Land/Land'
import Well from '../pages/shared/Well/Well'
import Wells from '../pages/shared/Wells/Wells'
import Lands from '../pages/shared/Lands/Lands'

const IrrigatorRoutes = () => (
	<Routes>
		<Route element={<Layouts />}>
			<Route index element={<Well />} />

			<Route path='lands'>
				<Route index element={<Lands />} />
				<Route path=':landId' element={<Land />} />
			</Route>

			<Route path='wells'>
				<Route index element={<Wells />} />
				<Route path=':wellId' element={<Well />} />
			</Route>
		</Route>
	</Routes>
)

export default IrrigatorRoutes
