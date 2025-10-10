const MetaTitle = ({ children }) => {
	const siteName = 'مدیریت آب'
	const fullTitle = `${children} | ${siteName}`

	return <title>{fullTitle}</title>
}

export default MetaTitle
