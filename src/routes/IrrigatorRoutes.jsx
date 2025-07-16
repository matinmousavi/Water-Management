import { Route, Routes } from 'react-router-dom'

import Layouts from '../layouts/Layouts'
import Profile from '../pages/shared/Profile/Profile'
import Land from '../pages/shared/Land/Land'
import Well from '../pages/shared/Well/Well'
import Wells from '../pages/shared/Wells/Wells'
import Lands from '../pages/shared/Lands/Lands'
import MyNotes from '../pages/shared/MyNotes/MyNotes'

const IrrigatorRoutes = () => (
	<Routes>
		<Route element={<Layouts />}>
			<Route index element={<Well />} />
			<Route path='profile' element={<Profile />} />

			<Route path='lands'>
				<Route index element={<Lands />} />
				<Route path=':landId' element={<Land />} />
			</Route>

			<Route path='wells'>
				<Route index element={<Wells />} />
				<Route path=':wellId' element={<Well />} />
			</Route>
			<Route path='my-notes' element={<MyNotes />} />
		</Route>
	</Routes>
)

export default IrrigatorRoutes
