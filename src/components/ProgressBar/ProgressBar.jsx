import styles from './ProgressBar.module.css'

const ProgressBar = ({ sections = 3, progressValue = 0 }) => {
	const perSection = 100 / sections

	const renderProgressBar = () => {
		return (
			<div className={styles.progressWrapper}>
				{[...Array(sections)].map((_, index) => {
					const filled = progressValue - index * perSection
					const percent = Math.max(0, Math.min(filled, perSection))

					return (
						<div
							key={index}
							className={styles.progressSection}
							style={{
								flex: 1,
								background: '#E0E0E0',
								marginLeft: index !== 0 ? 4 : 0,
								borderRadius: 4,
								overflow: 'hidden',
								height: 8,
							}}
						>
							<div
								style={{
									width: `${(percent / perSection) * 100}%`,
									background: '#0066EE',
									height: '100%',
									transition: 'width 0.3s ease',
								}}
							/>
						</div>
					)
				})}
			</div>
		)
	}

	return <>{renderProgressBar()}</>
}

export default ProgressBar
