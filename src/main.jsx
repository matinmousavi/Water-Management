import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import fa_IR from 'antd/locale/fa_IR'
import 'antd/dist/reset.css'

import UserProvider from './contexts/UserContext.jsx'
import IrrigationTimerProvider from './contexts/IrrigationTimerContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ConfigProvider
			direction='rtl'
			locale={fa_IR}
			theme={{
				token: {
					fontFamily: 'VazirmatnFD',
					colorPrimary: '#0066EE',
				},
				components: {
					Button: {
						borderRadiusLG: 8,
					},
					Card: {
						borderRadiusLG: 4,
					},
					Form: {
						itemMarginBottom: 20,
					},

					Typography: {
						titleMarginBottom: 0,
					},
				},
			}}
		>
			<BrowserRouter>
				<IrrigationTimerProvider>
					<UserProvider>
						<App />
					</UserProvider>
				</IrrigationTimerProvider>
			</BrowserRouter>
		</ConfigProvider>
	</StrictMode>
)
