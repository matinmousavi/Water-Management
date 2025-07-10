import { Button, Input } from 'antd'
import styles from './EditDescriptionLog.module.css'

const EditDescriptionLog = ({ onSubmit, onClose, isOpen = true, note, setNotes }) => {
	if (!isOpen) return null

	return (
		<div className={styles.container_fixed}>
			<div className={styles.container}>
				<div className={styles.btn_sheet} />

				<div className={styles.title}>توضیحات لاگ</div>
				<div className={styles.container_input}>
					<Input.TextArea rows={4} value={note} onChange={e => setNotes(e.target.value)} />
				</div>

				<div className={styles.container_buttons}>
					<Button onClick={onClose} className={`${styles.btn} style-btn`}>
						بازگشت
					</Button>
					<Button onClick={onSubmit} type='primary' className={styles.btn}>
						ثبت
					</Button>
				</div>
			</div>
		</div>
	)
}

export default EditDescriptionLog
