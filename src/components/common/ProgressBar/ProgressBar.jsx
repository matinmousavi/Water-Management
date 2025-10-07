import styles from './ProgressBar.module.css'

const ProgressBar = ({ progressRatio = 0 }) => {
	if (!progressRatio || progressRatio <= 0) {
		return (
			<div
				className={styles.progressWrapper}
				style={{
					height: 8,
					background: '#E0E0E0',
					borderRadius: 4,
				}}
			/>
		)
	}

	const basePercent = Math.min(progressRatio, 1)
	const overPercent = progressRatio > 1 ? progressRatio - 1 : 0
	const totalPercent = Math.max(progressRatio, 1)
	const blueFlex = (basePercent / totalPercent) * 100
	const redFlex = (overPercent / totalPercent) * 100

	return (
		<div className={styles.progressWrapper} style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
			<div
				className={styles.progressSection}
				style={{
					flex: `0 0 ${blueFlex}%`,
					background: '#0066EE',
					borderRadius: redFlex ? '4px 0 0 4px' : '4px',
					transition: 'flex-basis 0.3s ease',
				}}
			/>
			{redFlex > 0 && (
				<div
					className={styles.progressSection}
					style={{
						flex: `0 0 ${redFlex}%`,
						background: '#FF4444',
						borderRadius: '0 4px 4px 0',
						transition: 'flex-basis 0.3s ease',
					}}
				/>
			)}
		</div>
	)
}

export default ProgressBar
