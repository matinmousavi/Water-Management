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

	const isOver = progressRatio > 1
	const base = Math.min(progressRatio, 1)
	const over = isOver ? progressRatio - 1 : 0

	const total = base + over
	const bluePercent = (base / total) * 100
	const redPercent = (over / total) * 100

	return (
		<div className={styles.progressWrapper} style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: '4px' }}>
			<div
				className={styles.progressSection}
				style={{
					flex: `0 0 ${bluePercent}%`,
					background: '#0066EE',
					borderRadius: redPercent ? '4px 0 0 4px' : '4px',
					transition: 'flex-basis 0.3s ease',
				}}
			/>
			{isOver && (
				<div
					className={styles.progressSection}
					style={{
						flex: `0 0 ${redPercent}%`,
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
