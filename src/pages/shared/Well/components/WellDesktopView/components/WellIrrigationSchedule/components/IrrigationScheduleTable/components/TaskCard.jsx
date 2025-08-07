import styles from '../IrrigationScheduleTable.module.css'

const colorPalette = [
	'#e0f7e980',
	'#fff4e580',
	'#e6f7ff80',
	'#ffe6f080',
	'#f3e5f580',
	'#fff9c480',
	'#e0f7fa80',
	'#ffebee80',
	'#fff3e080',
	'#f3e5f580',
	'#ffe0b280',
	'#e1bee780',
	'#ffccbc80',
	'#cfd8dc80',
]

export default function TaskCard({ task, onClick }) {
	const { title, color } = task

	return (
		<div
			onClick={() => onClick(task)}
			className={styles['task-card']}
			style={{ backgroundColor: color || colorPalette[0] }}
			role='button'
			tabIndex={0}
			onKeyDown={e => {
				if (e.key === 'Enter' || e.key === ' ') onClick(task)
			}}
		>
			<div className={styles['task-name']}>{title}</div>
		</div>
	)
}
