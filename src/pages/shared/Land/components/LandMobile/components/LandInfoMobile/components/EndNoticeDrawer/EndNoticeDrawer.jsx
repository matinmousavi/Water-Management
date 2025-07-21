import { Button } from 'antd'
import styles from './EndNoticeDrawer.module.css'

const EndNoticeDrawer = ({ onSubmit, onClose, isOpen = true, time }) => {
	if (!isOpen) return null

	return (
		<div className={styles.container_fixed}>
			<div className={styles.container}>
				<div className={styles.btn_sheet} onClick={onClose} />

				<div className={styles.title}>پایان آبیاری</div>

				<div className={styles.wrapper_subtitle}>
					<p className={styles.subtitle}>هنوز مدت زمان {time} به پایان آبیاری باقی‌مانده است.</p>
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

export default EndNoticeDrawer
