// WellsList.jsx
import { Button, Flex, List } from 'antd'
import styles from './WellsList.module.css'
import BottomSheetModal from '../../../../../../../components/responsive/mobile/BottomSheetModal/BottomSheetModal'

const WellsList = ({ open, onClose, data, setData }) => {
        return (
                <BottomSheetModal open={open} hideFooter title='انتخاب چاه' onClose={onClose}>
                        <Flex gap={8} vertical>
                                <List className={styles.list}>
                                        {data?.map(well => (
                                                <List.Item key={well?._id} className={styles.listItem}>
                                                        <Button onClick={() => setData(well)} className={styles.listButton} type='text'>
								{well?.title}
							</Button>
						</List.Item>
					))}
				</List>
			</Flex>
                </BottomSheetModal>
        )
}

export default WellsList
