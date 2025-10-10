import { Flex } from 'antd'

import BottomSheetModal from '../BottomSheetModal/BottomSheetModal'

import styles from './EndNoticeDrawer.module.css'

const EndNoticeDrawer = ({ onSubmit, onClose, isOpen = true, timer }) => {
        return (
                <BottomSheetModal
                        height={233}
                        open={isOpen}
                        onClose={onClose}
                        title='پایان آبیاری'
                        okText='پایان آبیاری'
                        closeText='بازگشت'
                        onSubmit={onSubmit}
                >
			<Flex vertical gap={2}>
				<p className={styles.subtitle}>
					هنوز مدت زمان <span className={styles.boldTime}>{timer}</span> به پایان آبیاری باقی‌مانده است.
				</p>
				<p className={styles.subtitle}>از پایان دادن به زمان‌ آبیاری اطمینان دارید؟ </p>
			</Flex>
                </BottomSheetModal>
        )
}

export default EndNoticeDrawer
