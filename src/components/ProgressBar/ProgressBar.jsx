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
	const basePercent = Math.min(progressRatio, 1) * 100
	const overPercent = isOver ? (progressRatio - 1) * 100 : 0

	return (
		<div className={styles.progressWrapper} style={{ display: 'flex', gap: 4, height: 8 }}>
			<div
				className={styles.progressSection}
				style={{
					flex: `0 0 ${basePercent}%`,
					background: '#0066EE',
					borderRadius: overPercent ? '4px 0 0 4px' : '4px',
					transition: 'flex-basis 0.3s ease',
				}}
			/>
			{isOver && (
				<div
					className={styles.progressSection}
					style={{
						flex: `0 0 ${overPercent}%`,
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
