import { App as AntApp } from 'antd'
import { useUser } from './contexts/UserContext'
import AuthRoutes from './routes/AuthRoutes'
import PanelRoutes from './routes/PanelRoutes'

function App() {
	const { isLogin } = useUser()
	return <AntApp>{isLogin ? <PanelRoutes /> : <AuthRoutes />}</AntApp>
}

export default App
