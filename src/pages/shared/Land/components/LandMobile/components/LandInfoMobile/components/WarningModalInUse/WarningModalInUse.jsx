import { Button } from 'antd'
import styles from './WarningModalInUse.module.css'

const WarningModalInUse = ({ onSubmit, onClose, isOpen = true, time, land }) => {
	if (!isOpen) return null

	return (
		<div className={styles.container_fixed}>
			<div className={styles.container}>
				<div className={styles.btn_sheet} />

				<div className={styles.title}>شما در حال آبیاری زمین {land?.title} هستید!</div>

				<div className={styles.wrapper_subtitle}>
					<p className={styles.subtitle}>
						هنوز مدت زمان {time} به پایان زمان آبیاری زمین {land?.title} باقی مانده است.
					</p>
					<p className={styles.subtitle}>از پایان دادن به زمان‌ آبیاری اطمینان دارید؟ </p>
				</div>

				<div className={styles.container_buttons}>
					<Button onClick={onClose} className={`${styles.btn_cancel} style-btn`}>
						بازگشت
					</Button>
					<Button onClick={onSubmit} className={styles.btn_end}>
						پایان آبیاری
					</Button>
				</div>
			</div>
		</div>
	)
}

export default WarningModalInUse
