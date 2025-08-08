import { Typography, Flex } from 'antd'
import BackButton from '../../../../../components/BackButton/BackButton'
import WellStatus from './components/WellStatus/WellStatus'
import WellInfoCard from './components/WellInfoCard/WellInfoCard'
import WellLandsCard from './components/WellLandsCard/WellLandsCard'
import WellLogCard from './components/WellLogsCard/WellLogsCard'
import WellNote from './components/WellNote/WellNote'
import WellIrrigationSchedule from './components/WellIrrigationSchedule/WellIrrigationSchedule'
import NoteManager from '../../../../../components/Note/NoteManager'

const WellDesktopView = ({ title, well, status, setStatus, landsData, setLandsData, logs, setLogs, actualWellId, setTitle }) => {
	return (
		<>
			<Flex align='center' gap={16}>
				<BackButton backTo='/wells' />
				<Typography.Title className='text-page-title'>{title}</Typography.Title>
				<WellStatus wellId={actualWellId} status={status} setStatus={setStatus} />
			</Flex>

			<WellInfoCard wellInfo={well} setPageTitle={title => title && title !== '' && setTitle(title)} />
			<WellLandsCard wellLands={landsData?.lands} landGroups={landsData?.landGroups} setLandsData={setLandsData} wellStatus={status} />
			<WellLogCard data={logs} wellId={actualWellId} setLogs={setLogs} title={title} wellStatus={status} landsData={landsData} />
			<NoteManager entityType='well' notesData={well?.notes} status={status} />

			{landsData.lands.length > 0 && (
				<WellIrrigationSchedule wellId={actualWellId} lands={landsData.lands} landGroups={landsData.landGroups} cycleDays={well?.cycleDays} />
			)}
		</>
	)
}

export default WellDesktopView
