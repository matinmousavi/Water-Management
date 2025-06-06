// ResponsiveAntdProvider.jsx
import { ConfigProvider } from 'antd'
import faIR from 'antd/locale/fa_IR'
import { useEffect, useState } from 'react'

const largeScreenTheme = {
	token: {
		fontFamily: 'VazirmatnFD',
		colorPrimary: '#3372EF',
		borderRadius: 8,
		fontSize: 16,
	},
	components: {
		Layout: {
			headerPadding: '0 20px',
		},
		Menu: {
			itemMarginInline: 20,
		},
		Button: {
			primaryShadow: 'none',
			colorPrimary: '#0066EE',
			defaultBorderColor: '#0066EE',
			colorLink: 'rgba(59, 143, 243, 1)',
			colorText: '#0066EE',
			paddingBlock: 15,
		},
		Input: {
			borderRadius: 4,
			activeShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
		},
		Card: {
			bodyPadding: 36,
			borderRadiusLG: 8,
		},
		Typography: {
			titleMarginBottom: 0,
		},
		Form: {
			itemMarginBottom: 20,
		},
		Table: {
			cellPaddingBlock: 8,
			cellPaddingInline: 8,
		},
	},
}

const defaultTheme = {
	token: {
		fontFamily: 'VazirmatnFD',
		colorPrimary: '#3372EF',
		borderRadius: 4,
		fontSize: 14,
	},
}

export default function ResponsiveAntdProvider({ children }) {
	const [theme, setTheme] = useState(window.innerWidth >= 1080 ? largeScreenTheme : defaultTheme)

	useEffect(() => {
		const handleResize = () => {
			setTheme(window.innerWidth >= 1080 ? largeScreenTheme : defaultTheme)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return (
		<ConfigProvider direction='rtl' locale={faIR} theme={theme}>
			{children}
		</ConfigProvider>
	)
}
